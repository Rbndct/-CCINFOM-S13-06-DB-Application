const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// Helpers
function periodWhere(period, value) {
  if (period === 'year') {
    return { sql: 'YEAR(w.wedding_date) = ?', params: [value] };
  }
  if (period === 'month') {
    // value: YYYY-MM
    return { sql: 'DATE_FORMAT(w.wedding_date, "%Y-%m") = ?', params: [value] };
  }
  return { sql: '1=1', params: [] };
}

// GET /reports/sales?period=month|year&value=YYYY-MM|YYYY
router.get('/sales', async (req, res) => {
  try {
    const { period = 'month', value } = req.query;
    const { sql: whereSql, params } = periodWhere(period, value);

    // Totals and averages (use equipment_rental_cost + food_cost as income proxy)
    const [incomeRows] = await promisePool.query(
      `SELECT 
         COALESCE(SUM(COALESCE(w.equipment_rental_cost, w.total_cost) + COALESCE(w.food_cost, w.production_cost)), 0) AS totalIncome,
         COALESCE(AVG(COALESCE(w.equipment_rental_cost, w.total_cost) + COALESCE(w.food_cost, w.production_cost)), 0) AS avgIncome,
         COUNT(*) AS weddingCount
       FROM wedding w
       WHERE ${whereSql}`,
      params
    );

    // Payment breakdown - no explicit payment method table/column in schema;
    // return zeros to avoid misleading data. Extend when payments table exists.
    const paymentBreakdown = { cash: 0, card: 0, bank: 0 };

    // Popular packages (by assignments during the period)
    const [topPackages] = await promisePool.query(
      `SELECT p.package_id, p.package_name, COUNT(*) AS usage_count
       FROM package p
       JOIN table_package tp ON tp.package_id = p.package_id
       JOIN seating_table st ON st.table_id = tp.table_id
       JOIN wedding w ON w.wedding_id = st.wedding_id
       WHERE ${whereSql}
       GROUP BY p.package_id, p.package_name
       ORDER BY usage_count DESC
       LIMIT 10`,
      params
    );

    // Popular menu items (via packages used at tables during the period)
    const [topMenuItems] = await promisePool.query(
      `SELECT m.menu_item_id, m.menu_name, COUNT(*) AS usage_count
       FROM menu_item m
       JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
       JOIN table_package tp ON tp.package_id = pmi.package_id
       JOIN seating_table st ON st.table_id = tp.table_id
       JOIN wedding w ON w.wedding_id = st.wedding_id
       WHERE ${whereSql}
       GROUP BY m.menu_item_id, m.menu_name
       ORDER BY usage_count DESC
       LIMIT 10`,
      params
    );

    res.json({
      success: true,
      data: {
        period,
        value,
        totalIncome: parseFloat(incomeRows[0]?.totalIncome || 0),
        avgIncome: parseFloat(incomeRows[0]?.avgIncome || 0),
        weddingCount: incomeRows[0]?.weddingCount || 0,
        paymentBreakdown,
        topPackages,
        topMenuItems
      }
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate sales report', message: error.message });
  }
});

// GET /reports/payments?period=month|year&value=...
router.get('/payments', async (req, res) => {
  try {
    const { period = 'month', value } = req.query;
    const { sql: whereSql, params } = periodWhere(period, value);

    const [rows] = await promisePool.query(
      `SELECT 
         w.wedding_id,
         w.couple_id,
         w.wedding_date,
         COALESCE(w.equipment_rental_cost, w.total_cost) as equipment_rental_cost,
         COALESCE(w.food_cost, w.production_cost) as food_cost,
         w.total_cost,
         w.production_cost,
         w.payment_status
       FROM wedding w
       WHERE ${whereSql}
       ORDER BY w.wedding_date DESC`,
      params
    );

    // Status counts
    const statusCounts = rows.reduce((acc, r) => {
      const k = r.payment_status || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    // Placeholder balances: without payments table, outstanding assumed if status != 'paid'
    const items = rows.map(r => ({
      wedding_id: r.wedding_id,
      wedding_date: r.wedding_date,
      total_cost: parseFloat(r.total_cost || 0),
      payment_status: r.payment_status || 'unknown',
      amount_paid: r.payment_status === 'paid' ? parseFloat(r.total_cost || 0) : 0,
      amount_due: r.payment_status === 'paid' ? 0 : parseFloat(r.total_cost || 0),
    }));

    res.json({
      success: true,
      data: {
        period,
        value,
        statusCounts,
        items
      }
    });
  } catch (error) {
    console.error('Error generating payments report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate payments report', message: error.message });
  }
});

// GET /reports/wedding/:id/menu-dietary
router.get('/wedding/:id/menu-dietary', async (req, res) => {
  try {
    const { id } = req.params;

    // Dishes used by this wedding via tables → packages → items
    const [dishCounts] = await promisePool.query(
      `SELECT m.menu_item_id, m.menu_name, COUNT(*) AS times_ordered
       FROM menu_item m
       JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
       JOIN table_package tp ON tp.package_id = pmi.package_id
       JOIN seating_table st ON st.table_id = tp.table_id
       WHERE st.wedding_id = ?
       GROUP BY m.menu_item_id, m.menu_name
       ORDER BY times_ordered DESC`,
      [id]
    );

    // Allergens by menu item restriction (if any)
    const [allergens] = await promisePool.query(
      `SELECT m.menu_item_id, m.menu_name, dr.restriction_name, dr.restriction_type, dr.severity_level
       FROM menu_item m
       LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
       WHERE m.menu_item_id IN (
         SELECT pmi.menu_item_id
         FROM package_menu_items pmi
         JOIN table_package tp ON tp.package_id = pmi.package_id
         JOIN seating_table st ON st.table_id = tp.table_id
         WHERE st.wedding_id = ?
       )
       AND m.restriction_id IS NOT NULL`,
      [id]
    );

    // Guest dietary restrictions
    const [guestRestrictions] = await promisePool.query(
      `SELECT dr.restriction_name, COUNT(*) AS cnt
       FROM guest g
       LEFT JOIN guest_restrictions gr ON g.guest_id = gr.guest_id
       LEFT JOIN dietary_restriction dr ON gr.restriction_id = dr.restriction_id
       WHERE g.wedding_id = ?
       GROUP BY dr.restriction_name
       ORDER BY cnt DESC`,
      [id]
    );

    res.json({ success: true, data: { dishCounts, allergens, guestRestrictions } });
  } catch (error) {
    console.error('Error generating wedding menu/dietary report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate menu & dietary report', message: error.message });
  }
});

// GET /reports/wedding/:id/inventory
router.get('/wedding/:id/inventory', async (req, res) => {
  try {
    const { id } = req.params;

    const [allocations] = await promisePool.query(
      `SELECT 
         ia.allocation_id, ia.inventory_id, ia.quantity_used, ia.rental_cost,
         ii.item_name, ii.category, ii.item_condition, ii.quantity_available,
         (ia.quantity_used * ia.rental_cost) AS total_cost
       FROM inventory_allocation ia
       JOIN inventory_items ii ON ii.inventory_id = ia.inventory_id
       WHERE ia.wedding_id = ?
       ORDER BY ii.item_name ASC`,
      [id]
    );

    const needsAttention = allocations.filter(a => (a.item_condition && a.item_condition.toLowerCase().includes('repair')) || (a.quantity_available !== null && a.quantity_available <= 0));

    res.json({ success: true, data: { allocations, needsAttention } });
  } catch (error) {
    console.error('Error generating wedding inventory report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate inventory report', message: error.message });
  }
});

// GET /reports/wedding/:id/seating
router.get('/wedding/:id/seating', async (req, res) => {
  try {
    const { id } = req.params;

    const [tables] = await promisePool.query(
      `SELECT st.table_id, st.table_category, st.table_number, st.capacity
       FROM seating_table st
       WHERE st.wedding_id = ?
       ORDER BY st.table_number ASC`,
      [id]
    );

    // Guests assigned to each table
    const [guests] = await promisePool.query(
      `SELECT g.guest_id, g.guest_name, g.table_id, g.rsvp_status
       FROM guest g
       WHERE g.wedding_id = ?
       ORDER BY g.guest_name ASC`,
      [id]
    );

    const tableIdToGuests = guests.reduce((acc, g) => {
      const key = g.table_id || 0;
      acc[key] = acc[key] || [];
      acc[key].push(g);
      return acc;
    }, {});

    const seating = tables.map(t => ({
      ...t,
      guests: tableIdToGuests[t.table_id] || []
    }));

    res.json({ success: true, data: { seating } });
  } catch (error) {
    console.error('Error generating wedding seating report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate seating report', message: error.message });
  }
});

// GET /reports/financial?period=month|year&value=YYYY-MM|YYYY
// Comprehensive financial report with revenue, COGS, profit margins, etc.
router.get('/financial', async (req, res) => {
  try {
    const { period = 'month', value } = req.query;
    const { sql: whereSql, params } = periodWhere(period, value);

    // Calculate revenue from actual package assignments in period
    const [revenueData] = await promisePool.query(
      `SELECT 
        COALESCE(SUM(p.selling_price), 0) AS total_revenue,
        COUNT(DISTINCT tp.table_id) AS total_table_assignments,
        COUNT(DISTINCT st.wedding_id) AS weddings_with_packages
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE ${whereSql}`,
      params
    );

    // Total COGS (Cost of Goods Sold) - package unit_cost * usage
    const [cogsData] = await promisePool.query(
      `SELECT 
        COALESCE(SUM(p.unit_cost), 0) AS total_cogs,
        COALESCE(SUM(p.selling_price - p.unit_cost), 0) AS total_gross_profit
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE ${whereSql}`,
      params
    );

    // Equipment/Inventory Rental Costs
    const [equipmentData] = await promisePool.query(
      `SELECT 
        COALESCE(SUM(ia.rental_cost), 0) AS total_equipment_cost
      FROM inventory_allocation ia
      JOIN wedding w ON ia.wedding_id = w.wedding_id
      WHERE ${whereSql}`,
      params
    );

    // Calculate metrics
    const totalRevenue = parseFloat(revenueData[0]?.total_revenue || 0);
    const totalCOGS = parseFloat(cogsData[0]?.total_cogs || 0);
    const totalEquipmentCost = parseFloat(equipmentData[0]?.total_equipment_cost || 0);
    const totalGrossProfit = parseFloat(cogsData[0]?.total_gross_profit || 0);
    const totalOperatingCosts = totalEquipmentCost; // Can be extended with labor, overhead, etc.
    const netProfit = totalGrossProfit - totalOperatingCosts;
    const grossProfitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Revenue by package type
    const [revenueByPackageType] = await promisePool.query(
      `SELECT 
        p.package_type,
        COALESCE(SUM(p.selling_price), 0) AS revenue,
        COALESCE(SUM(p.unit_cost), 0) AS cost,
        COUNT(DISTINCT tp.table_id) AS usage_count
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE ${whereSql}
      GROUP BY p.package_type
      ORDER BY revenue DESC`,
      params
    );

    // Monthly/Yearly comparison (previous period)
    let previousPeriodData = { total_revenue: 0, total_cogs: 0, net_profit: 0 };
    if (period === 'month' && value) {
      const [year, month] = value.split('-');
      const prevMonth = parseInt(month) - 1;
      const prevYear = prevMonth < 1 ? parseInt(year) - 1 : parseInt(year);
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const prevWhere = periodWhere('month', prevMonthStr);
      const [prevData] = await promisePool.query(
        `SELECT 
          COALESCE(SUM(p.selling_price), 0) AS total_revenue,
          COALESCE(SUM(p.unit_cost), 0) AS total_cogs
        FROM table_package tp
        JOIN seating_table st ON tp.table_id = st.table_id
        JOIN wedding w ON st.wedding_id = w.wedding_id
        JOIN package p ON tp.package_id = p.package_id
        WHERE ${prevWhere.sql}`,
        prevWhere.params
      );
      if (prevData[0]) {
        previousPeriodData.total_revenue = parseFloat(prevData[0].total_revenue || 0);
        previousPeriodData.total_cogs = parseFloat(prevData[0].total_cogs || 0);
        previousPeriodData.net_profit = previousPeriodData.total_revenue - previousPeriodData.total_cogs;
      }
    } else if (period === 'year' && value) {
      const prevYear = (parseInt(value) - 1).toString();
      const prevWhere = periodWhere('year', prevYear);
      const [prevData] = await promisePool.query(
        `SELECT 
          COALESCE(SUM(p.selling_price), 0) AS total_revenue,
          COALESCE(SUM(p.unit_cost), 0) AS total_cogs
        FROM table_package tp
        JOIN seating_table st ON tp.table_id = st.table_id
        JOIN wedding w ON st.wedding_id = w.wedding_id
        JOIN package p ON tp.package_id = p.package_id
        WHERE ${prevWhere.sql}`,
        prevWhere.params
      );
      if (prevData[0]) {
        previousPeriodData.total_revenue = parseFloat(prevData[0].total_revenue || 0);
        previousPeriodData.total_cogs = parseFloat(prevData[0].total_cogs || 0);
        previousPeriodData.net_profit = previousPeriodData.total_revenue - previousPeriodData.total_cogs;
      }
    }

    const revenueChange = previousPeriodData.total_revenue > 0 
      ? ((totalRevenue - previousPeriodData.total_revenue) / previousPeriodData.total_revenue) * 100 
      : 0;
    const profitChange = previousPeriodData.net_profit !== 0
      ? ((netProfit - previousPeriodData.net_profit) / Math.abs(previousPeriodData.net_profit)) * 100
      : 0;

    res.json({
      success: true,
      data: {
        period,
        value,
        // Income Statement
        revenue: {
          total: totalRevenue,
          from_packages: totalRevenue,
          change_percent: revenueChange
        },
        cogs: {
          total: totalCOGS,
          package_costs: totalCOGS
        },
        gross_profit: {
          total: totalGrossProfit,
          margin_percent: grossProfitMargin
        },
        operating_costs: {
          total: totalOperatingCosts,
          equipment_rental: totalEquipmentCost
        },
        net_profit: {
          total: netProfit,
          margin_percent: netProfitMargin,
          change_percent: profitChange
        },
        // Breakdowns
        revenue_by_package_type: revenueByPackageType,
        // Metrics
        weddings_count: revenueData[0]?.weddings_with_packages || 0,
        table_assignments: revenueData[0]?.total_table_assignments || 0,
        // Comparison
        previous_period: previousPeriodData
      }
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate financial report', message: error.message });
  }
});

module.exports = router;


