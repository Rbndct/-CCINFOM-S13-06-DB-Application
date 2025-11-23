const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Helpers
function periodWhere(period, value) {
  if (period === 'year') {
    return {sql: 'YEAR(w.wedding_date) = ?', params: [value]};
  }
  if (period === 'month') {
    // value: YYYY-MM
    return {sql: 'DATE_FORMAT(w.wedding_date, "%Y-%m") = ?', params: [value]};
  }
  return {sql: '1=1', params: []};
}

// GET /reports/sales?period=month|year&value=YYYY-MM|YYYY
router.get('/sales', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

    // Totals and averages (use total_cost which represents customer invoice amount:
    // equipment_rental_cost + package selling_price)
    const [incomeRows] = await promisePool.query(
        `SELECT 
         COALESCE(SUM(w.total_cost), 0) AS totalIncome,
         COALESCE(AVG(w.total_cost), 0) AS avgIncome,
         COUNT(*) AS weddingCount
       FROM wedding w
       WHERE ${whereSql}`,
        params);

    // Payment breakdown - no explicit payment method table/column in schema;
    // return zeros to avoid misleading data. Extend when payments table exists.
    const paymentBreakdown = {cash: 0, card: 0, bank: 0};

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
        params);

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
        params);

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
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales report',
      message: error.message
    });
  }
});

// GET /reports/payments?period=month|year&value=...
router.get('/payments', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

    const [rows] = await promisePool.query(
        `SELECT 
         w.wedding_id,
         w.couple_id,
         w.wedding_date,
         w.equipment_rental_cost,
         w.food_cost,
         w.total_cost,
         w.payment_status
       FROM wedding w
       WHERE ${whereSql}
       ORDER BY w.wedding_date DESC`,
        params);

    // Status counts
    const statusCounts = rows.reduce((acc, r) => {
      const k = r.payment_status || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    // Placeholder balances: without payments table, outstanding assumed if
    // status != 'paid'
    const items = rows.map(
        r => ({
          wedding_id: r.wedding_id,
          wedding_date: r.wedding_date,
          total_cost: parseFloat(r.total_cost || 0),
          payment_status: r.payment_status || 'unknown',
          amount_paid:
              r.payment_status === 'paid' ? parseFloat(r.total_cost || 0) : 0,
          amount_due:
              r.payment_status === 'paid' ? 0 : parseFloat(r.total_cost || 0),
        }));

    res.json({success: true, data: {period, value, statusCounts, items}});
  } catch (error) {
    console.error('Error generating payments report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate payments report',
      message: error.message
    });
  }
});

// GET /reports/wedding/:id/menu-dietary
router.get('/wedding/:id/menu-dietary', async (req, res) => {
  try {
    const {id} = req.params;

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
        [id]);

    // Allergens by menu item restriction (if any) - using junction table
    const [allergens] = await promisePool.query(
        `SELECT DISTINCT m.menu_item_id, m.menu_name, dr.restriction_name, dr.restriction_type, dr.severity_level
       FROM menu_item m
       JOIN menu_item_restrictions mir ON m.menu_item_id = mir.menu_item_id
       JOIN dietary_restriction dr ON mir.restriction_id = dr.restriction_id
       WHERE m.menu_item_id IN (
         SELECT pmi.menu_item_id
         FROM package_menu_items pmi
         JOIN table_package tp ON tp.package_id = pmi.package_id
         JOIN seating_table st ON st.table_id = tp.table_id
         WHERE st.wedding_id = ?
       )`,
        [id]);

    // Guest dietary restrictions
    const [guestRestrictions] = await promisePool.query(
        `SELECT dr.restriction_name, COUNT(*) AS cnt
       FROM guest g
       LEFT JOIN guest_restrictions gr ON g.guest_id = gr.guest_id
       LEFT JOIN dietary_restriction dr ON gr.restriction_id = dr.restriction_id
       WHERE g.wedding_id = ?
       GROUP BY dr.restriction_name
       ORDER BY cnt DESC`,
        [id]);

    res.json({success: true, data: {dishCounts, allergens, guestRestrictions}});
  } catch (error) {
    console.error('Error generating wedding menu/dietary report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate menu & dietary report',
      message: error.message
    });
  }
});

// GET /reports/wedding/:id/inventory
router.get('/wedding/:id/inventory', async (req, res) => {
  try {
    const {id} = req.params;

    const [allocations] = await promisePool.query(
        `SELECT 
         ia.allocation_id, ia.inventory_id, ia.quantity_used, ia.unit_rental_cost,
         ii.item_name, ii.category, ii.item_condition, ii.quantity_available,
         (ia.quantity_used * ia.unit_rental_cost) AS total_cost
       FROM inventory_allocation ia
       JOIN inventory_items ii ON ii.inventory_id = ia.inventory_id
       WHERE ia.wedding_id = ?
       ORDER BY ii.item_name ASC`,
        [id]);

    const needsAttention = allocations.filter(
        a => (a.item_condition &&
              a.item_condition.toLowerCase().includes('repair')) ||
            (a.quantity_available !== null && a.quantity_available <= 0));

    res.json({success: true, data: {allocations, needsAttention}});
  } catch (error) {
    console.error('Error generating wedding inventory report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inventory report',
      message: error.message
    });
  }
});

// GET /reports/wedding/:id/seating
router.get('/wedding/:id/seating', async (req, res) => {
  try {
    const {id} = req.params;

    const [tables] = await promisePool.query(
        `SELECT st.table_id, st.table_category, st.table_number, st.capacity
       FROM seating_table st
       WHERE st.wedding_id = ?
       ORDER BY st.table_number ASC`,
        [id]);

    // Guests assigned to each table with dietary restrictions
    const [guests] = await promisePool.query(
        `SELECT 
         g.guest_id, 
         g.guest_name, 
         g.table_id, 
         g.rsvp_status,
         COALESCE(
           JSON_ARRAYAGG(
             CASE 
               WHEN dr.restriction_id IS NOT NULL THEN
                 JSON_OBJECT(
                   'restriction_id', dr.restriction_id,
                   'restriction_name', dr.restriction_name,
                   'restriction_type', dr.restriction_type,
                   'severity_level', dr.severity_level
                 )
               ELSE NULL
             END
           ),
           JSON_ARRAY()
         ) as dietary_restrictions
       FROM guest g
       LEFT JOIN guest_restrictions gr ON g.guest_id = gr.guest_id
       LEFT JOIN dietary_restriction dr ON gr.restriction_id = dr.restriction_id
       WHERE g.wedding_id = ?
       GROUP BY g.guest_id, g.guest_name, g.table_id, g.rsvp_status
       ORDER BY g.guest_name ASC`,
        [id]);

    // Packages assigned to each table
    const [packages] = await promisePool.query(
        `SELECT tp.table_id, p.package_id, p.package_name, p.package_type
       FROM table_package tp
       JOIN package p ON tp.package_id = p.package_id
       WHERE tp.table_id IN (SELECT table_id FROM seating_table WHERE wedding_id = ?)`,
        [id]);

    // Parse dietary restrictions JSON for each guest
    const guestsWithRestrictions = guests.map(g => {
      let dietaryRestrictions = [];
      if (g.dietary_restrictions) {
        try {
          dietaryRestrictions = typeof g.dietary_restrictions === 'string' 
            ? JSON.parse(g.dietary_restrictions) 
            : g.dietary_restrictions;
          dietaryRestrictions = Array.isArray(dietaryRestrictions) 
            ? dietaryRestrictions.filter(r => r && r.restriction_name) 
            : [];
        } catch (e) {
          dietaryRestrictions = [];
        }
      }
      return {
        ...g,
        dietary_restrictions: dietaryRestrictions
      };
    });

    const tableIdToGuests = guestsWithRestrictions.reduce((acc, g) => {
      const key = g.table_id || 0;
      acc[key] = acc[key] || [];
      acc[key].push(g);
      return acc;
    }, {});

    const tableIdToPackage = packages.reduce((acc, p) => {
      acc[p.table_id] = p;
      return acc;
    }, {});

    const seating =
        tables.map(t => ({
          ...t,
          guests: tableIdToGuests[t.table_id] || [],
          package: tableIdToPackage[t.table_id] || null
        }));

    // Calculate summary stats
    const totalTables = seating.length;
    const totalGuests = guests.length;
    const totalCapacity = seating.reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0);
    const occupancyRate = totalCapacity > 0 ? (totalGuests / totalCapacity) * 100 : 0;

    res.json({
      success: true,
      data: {
        seating,
        summary: {
          total_tables: totalTables,
          total_guests: totalGuests,
          total_capacity: totalCapacity,
          occupancy_rate: occupancyRate
        }
      }
    });
  } catch (error) {
    console.error('Error generating wedding seating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate seating report',
      message: error.message
    });
  }
});

// GET /reports/financial?period=month|year&value=YYYY-MM|YYYY
// Comprehensive financial report with revenue, COGS, profit margins, etc.
router.get('/financial', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

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
        params);

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
        params);

    // Equipment/Inventory Rental Costs
    const [equipmentData] = await promisePool.query(
        `SELECT 
        COALESCE(SUM(ia.quantity_used * ia.unit_rental_cost), 0) AS total_equipment_cost
      FROM inventory_allocation ia
      JOIN wedding w ON ia.wedding_id = w.wedding_id
      WHERE ${whereSql}`,
        params);

    // Calculate metrics
    const totalRevenue = parseFloat(revenueData[0]?.total_revenue || 0);
    const totalCOGS = parseFloat(cogsData[0]?.total_cogs || 0);
    const totalEquipmentCost =
        parseFloat(equipmentData[0]?.total_equipment_cost || 0);
    const totalGrossProfit = parseFloat(cogsData[0]?.total_gross_profit || 0);
    const totalOperatingCosts =
        totalEquipmentCost;  // Can be extended with labor, overhead, etc.
    const netProfit = totalGrossProfit - totalOperatingCosts;
    const grossProfitMargin =
        totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
    const netProfitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

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
        params);

    // Monthly/Yearly comparison (previous period)
    let previousPeriodData = {total_revenue: 0, total_cogs: 0, net_profit: 0};
    if (period === 'month' && value) {
      const [year, month] = value.split('-');
      let prevMonth = parseInt(month) - 1;
      let prevYear = parseInt(year);
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = prevYear - 1;
      }
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
          prevWhere.params);
      if (prevData[0]) {
        previousPeriodData.total_revenue =
            parseFloat(prevData[0].total_revenue || 0);
        previousPeriodData.total_cogs = parseFloat(prevData[0].total_cogs || 0);
        previousPeriodData.net_profit =
            previousPeriodData.total_revenue - previousPeriodData.total_cogs;
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
          prevWhere.params);
      if (prevData[0]) {
        previousPeriodData.total_revenue =
            parseFloat(prevData[0].total_revenue || 0);
        previousPeriodData.total_cogs = parseFloat(prevData[0].total_cogs || 0);
        previousPeriodData.net_profit =
            previousPeriodData.total_revenue - previousPeriodData.total_cogs;
      }
    }

    const revenueChange = previousPeriodData.total_revenue > 0 ?
        ((totalRevenue - previousPeriodData.total_revenue) /
         previousPeriodData.total_revenue) *
            100 :
        0;
    const profitChange = previousPeriodData.net_profit !== 0 ?
        ((netProfit - previousPeriodData.net_profit) /
         Math.abs(previousPeriodData.net_profit)) *
            100 :
        0;

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
        cogs: {total: totalCOGS, package_costs: totalCOGS},
        gross_profit:
            {total: totalGrossProfit, margin_percent: grossProfitMargin},
        operating_costs:
            {total: totalOperatingCosts, equipment_rental: totalEquipmentCost},
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
    res.status(500).json({
      success: false,
      error: 'Failed to generate financial report',
      message: error.message
    });
  }
});

// GET /reports/cash-flow?period=month|year|day&value=YYYY-MM-DD|YYYY-MM|YYYY
// Cash Flow Statement combining package sales, equipment rental, and payment
// transactions
router.get('/cash-flow', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    let whereSql, params;

    if (period === 'day') {
      whereSql = 'DATE(w.wedding_date) = ?';
      params = [value];  // YYYY-MM-DD
    } else if (period === 'month') {
      whereSql = 'DATE_FORMAT(w.wedding_date, "%Y-%m") = ?';
      params = [value];  // YYYY-MM
    } else if (period === 'year') {
      whereSql = 'YEAR(w.wedding_date) = ?';
      params = [value];  // YYYY
    } else {
      whereSql = '1=1';
      params = [];
    }

    // Cash Inflows: Package Sales Revenue (from table_package transactions)
    const [packageRevenue] = await promisePool.query(
        `SELECT 
        COALESCE(SUM(p.selling_price), 0) AS total_revenue,
        COUNT(DISTINCT tp.table_id) AS transaction_count
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE ${whereSql}`,
        params);

    // Cash Inflows: Equipment Rental Income (from inventory_allocation
    // transactions)
    const [equipmentRevenue] = await promisePool.query(
        `SELECT 
        COALESCE(SUM(ia.quantity_used * ia.unit_rental_cost), 0) AS total_rental_income,
        COUNT(DISTINCT ia.allocation_id) AS transaction_count
      FROM inventory_allocation ia
      JOIN wedding w ON ia.wedding_id = w.wedding_id
      WHERE ${whereSql}`,
        params);

    // Cash Outflows: Package Costs (COGS)
    const [packageCosts] = await promisePool.query(
        `SELECT 
        COALESCE(SUM(p.unit_cost), 0) AS total_cogs
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE ${whereSql}`,
        params);

    // Cash Outflows: Equipment Rental Costs (if any)
    const equipmentCosts =
        0;  // Can be extended if equipment has associated costs

    // Payment Receipts (cash actually received based on payment_status)
    const [paymentReceipts] = await promisePool.query(
        `SELECT 
        COALESCE(SUM(
          CASE 
            WHEN w.payment_status = 'paid' THEN COALESCE(w.equipment_rental_cost + w.food_cost, 0)
            WHEN w.payment_status = 'partial' THEN COALESCE((w.equipment_rental_cost + w.food_cost) * 0.5, 0)
            ELSE 0
          END
        ), 0) AS cash_received,
        COUNT(CASE WHEN w.payment_status = 'paid' THEN 1 END) AS paid_count,
        COUNT(CASE WHEN w.payment_status = 'partial' THEN 1 END) AS partial_count,
        COUNT(CASE WHEN w.payment_status = 'pending' THEN 1 END) AS pending_count
      FROM wedding w
      WHERE ${whereSql}`,
        params);

    // Calculate net cash flow
    const totalInflows = parseFloat(packageRevenue[0]?.total_revenue || 0) +
        parseFloat(equipmentRevenue[0]?.total_rental_income || 0);
    const totalOutflows =
        parseFloat(packageCosts[0]?.total_cogs || 0) + equipmentCosts;
    const netCashFlow = totalInflows - totalOutflows;
    const cashReceived = parseFloat(paymentReceipts[0]?.cash_received || 0);

    // Get daily/monthly breakdown for charts
    let breakdown = [];
    if (period === 'year') {
      const [monthlyBreakdown] = await promisePool.query(
          `SELECT 
          DATE_FORMAT(w.wedding_date, "%Y-%m") AS period,
          COALESCE(SUM(p.selling_price), 0) AS revenue,
          COALESCE(SUM(p.unit_cost), 0) AS costs,
          COALESCE(SUM(ia.quantity_used * ia.unit_rental_cost), 0) AS equipment_income
        FROM wedding w
        LEFT JOIN seating_table st ON st.wedding_id = w.wedding_id
        LEFT JOIN table_package tp ON tp.table_id = st.table_id
        LEFT JOIN package p ON p.package_id = tp.package_id
        LEFT JOIN inventory_allocation ia ON ia.wedding_id = w.wedding_id
        WHERE YEAR(w.wedding_date) = ?
        GROUP BY DATE_FORMAT(w.wedding_date, "%Y-%m")
        ORDER BY period ASC`,
          [value]);
      breakdown = monthlyBreakdown;
    } else if (period === 'month') {
      const [dailyBreakdown] = await promisePool.query(
          `SELECT 
          DATE(w.wedding_date) AS period,
          COALESCE(SUM(p.selling_price), 0) AS revenue,
          COALESCE(SUM(p.unit_cost), 0) AS costs,
          COALESCE(SUM(ia.quantity_used * ia.unit_rental_cost), 0) AS equipment_income
        FROM wedding w
        LEFT JOIN seating_table st ON st.wedding_id = w.wedding_id
        LEFT JOIN table_package tp ON tp.table_id = st.table_id
        LEFT JOIN package p ON p.package_id = tp.package_id
        LEFT JOIN inventory_allocation ia ON ia.wedding_id = w.wedding_id
        WHERE DATE_FORMAT(w.wedding_date, "%Y-%m") = ?
        GROUP BY DATE(w.wedding_date)
        ORDER BY period ASC`,
          [value]);
      breakdown = dailyBreakdown;
    }

    res.json({
      success: true,
      data: {
        period,
        value,
        cash_flows: {
          inflows: {
            package_sales: parseFloat(packageRevenue[0]?.total_revenue || 0),
            equipment_rental:
                parseFloat(equipmentRevenue[0]?.total_rental_income || 0),
            total: totalInflows
          },
          outflows: {
            package_costs: parseFloat(packageCosts[0]?.total_cogs || 0),
            equipment_costs: equipmentCosts,
            total: totalOutflows
          },
          net_cash_flow: netCashFlow
        },
        payment_receipts: {
          cash_received: cashReceived,
          paid_count: paymentReceipts[0]?.paid_count || 0,
          partial_count: paymentReceipts[0]?.partial_count || 0,
          pending_count: paymentReceipts[0]?.pending_count || 0
        },
        breakdown: breakdown.map(
            b => ({
              period: b.period,
              revenue: parseFloat(b.revenue || 0),
              costs: parseFloat(b.costs || 0),
              equipment_income: parseFloat(b.equipment_income || 0),
              net_flow: parseFloat(b.revenue || 0) +
                  parseFloat(b.equipment_income || 0) - parseFloat(b.costs || 0)
            }))
      }
    });
  } catch (error) {
    console.error('Error generating cash flow report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate cash flow report',
      message: error.message
    });
  }
});

// GET
// /reports/accounts-receivable?period=month|year|day&value=YYYY-MM-DD|YYYY-MM|YYYY
// Accounts Receivable Aging Report combining wedding invoices and payment
// status
router.get('/accounts-receivable', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    let whereSql, params;

    if (period === 'day') {
      whereSql = 'DATE(w.wedding_date) = ?';
      params = [value];
    } else if (period === 'month') {
      whereSql = 'DATE_FORMAT(w.wedding_date, "%Y-%m") = ?';
      params = [value];
    } else if (period === 'year') {
      // Ensure year is parsed as integer for proper comparison
      const yearValue = parseInt(value, 10);
      if (isNaN(yearValue)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid year value. Expected a valid year (e.g., 2024)'
        });
      }
      whereSql = 'YEAR(w.wedding_date) = ?';
      params = [yearValue];
    } else {
      whereSql = '1=1';
      params = [];
    }

    // Get all weddings with outstanding balances
    // Payment due date is 30 days before wedding date
    // Outstanding balance calculation:
    //   - paid: 0 (filtered out by WHERE clause)
    //   - partial: total_cost * 0.5 (50% of total cost)
    //   - pending: total_cost (100% of total cost)
    // 
    // Calculate total_cost dynamically using selling_price (what customer owes)
    // instead of relying on stored total_cost which might be outdated
    const query = `SELECT DISTINCT
    w.wedding_id,
    w.wedding_date,
    -- Calculate total invoice amount: equipment rental + package selling prices
    (COALESCE(w.equipment_rental_cost, 0) + 
     COALESCE((SELECT SUM(p.selling_price) 
               FROM table_package tp 
               JOIN seating_table st ON tp.table_id = st.table_id 
               JOIN package p ON tp.package_id = p.package_id 
               WHERE st.wedding_id = w.wedding_id), 0)) AS total_cost,
    w.payment_status,
    c.partner1_name,
    c.partner2_name,
    w.venue,
    DATE_SUB(w.wedding_date, INTERVAL 30 DAY) AS payment_due_date,
    DATEDIFF(CURDATE(), DATE_SUB(w.wedding_date, INTERVAL 30 DAY)) AS days_overdue,
    CASE 
      WHEN w.payment_status = 'paid' THEN 0
      WHEN w.payment_status = 'partial' THEN 
        (COALESCE(w.equipment_rental_cost, 0) + 
         COALESCE((SELECT SUM(p.selling_price) 
                   FROM table_package tp 
                   JOIN seating_table st ON tp.table_id = st.table_id 
                   JOIN package p ON tp.package_id = p.package_id 
                   WHERE st.wedding_id = w.wedding_id), 0)) * 0.5  -- 50% outstanding
      ELSE 
        (COALESCE(w.equipment_rental_cost, 0) + 
         COALESCE((SELECT SUM(p.selling_price) 
                   FROM table_package tp 
                   JOIN seating_table st ON tp.table_id = st.table_id 
                   JOIN package p ON tp.package_id = p.package_id 
                   WHERE st.wedding_id = w.wedding_id), 0))  -- 100% outstanding (pending)
    END AS outstanding_balance
  FROM wedding w
  JOIN couple c ON w.couple_id = c.couple_id
  WHERE ${whereSql}
    AND w.payment_status != 'paid'  -- Only show pending and partial payments
  ORDER BY w.wedding_date DESC`;
    
    console.log('[Accounts Receivable] Query:', query);
    console.log('[Accounts Receivable] Params:', params);
    
    const [receivables] = await promisePool.query(query, params);
    
    console.log(`[Accounts Receivable] Found ${receivables.length} receivables for period=${period}, value=${value}`);

    // Calculate aging buckets
    const agingBuckets = {
      current: {amount: 0, count: 0, items: []},     // 0-30 days
      days_31_60: {amount: 0, count: 0, items: []},  // 31-60 days
      days_61_90: {amount: 0, count: 0, items: []},  // 61-90 days
      over_90: {amount: 0, count: 0, items: []}      // 90+ days
    };

    receivables.forEach((rec) => {
      const days = rec.days_overdue || 0;
      const balance = parseFloat(rec.outstanding_balance || 0);
      const item = {
        wedding_id: rec.wedding_id,
        wedding_date: rec.wedding_date,
        payment_due_date: rec.payment_due_date,
        couple_name: `${rec.partner1_name} & ${rec.partner2_name}`,
        venue: rec.venue,
        total_cost: parseFloat(rec.total_cost || 0),
        outstanding_balance: balance,
        payment_status: rec.payment_status,
        days_overdue: days
      };

      if (days <= 30) {
        agingBuckets.current.amount += balance;
        agingBuckets.current.count += 1;
        agingBuckets.current.items.push(item);
      } else if (days <= 60) {
        agingBuckets.days_31_60.amount += balance;
        agingBuckets.days_31_60.count += 1;
        agingBuckets.days_31_60.items.push(item);
      } else if (days <= 90) {
        agingBuckets.days_61_90.amount += balance;
        agingBuckets.days_61_90.count += 1;
        agingBuckets.days_61_90.items.push(item);
      } else {
        agingBuckets.over_90.amount += balance;
        agingBuckets.over_90.count += 1;
        agingBuckets.over_90.items.push(item);
      }
    });

    const totalReceivables = agingBuckets.current.amount +
        agingBuckets.days_31_60.amount + agingBuckets.days_61_90.amount +
        agingBuckets.over_90.amount;

    res.json({
      success: true,
      data: {
        period,
        value,
        total_receivables: totalReceivables,
        total_count: receivables.length,
        aging_buckets: {
          current: {
            label: 'Current (0-30 days)',
            amount: agingBuckets.current.amount,
            count: agingBuckets.current.count,
            percentage: totalReceivables > 0 ?
                (agingBuckets.current.amount / totalReceivables) * 100 :
                0
          },
          days_31_60: {
            label: '31-60 days',
            amount: agingBuckets.days_31_60.amount,
            count: agingBuckets.days_31_60.count,
            percentage: totalReceivables > 0 ?
                (agingBuckets.days_31_60.amount / totalReceivables) * 100 :
                0
          },
          days_61_90: {
            label: '61-90 days',
            amount: agingBuckets.days_61_90.amount,
            count: agingBuckets.days_61_90.count,
            percentage: totalReceivables > 0 ?
                (agingBuckets.days_61_90.amount / totalReceivables) * 100 :
                0
          },
          over_90: {
            label: 'Over 90 days',
            amount: agingBuckets.over_90.amount,
            count: agingBuckets.over_90.count,
            percentage: totalReceivables > 0 ?
                (agingBuckets.over_90.amount / totalReceivables) * 100 :
                0
          }
        },
        receivables: receivables.map(
            (r) => {
              const totalCost = parseFloat(r.total_cost || 0);
              const outstandingBalance = parseFloat(r.outstanding_balance || 0);
              const paymentStatus = (r.payment_status || '').toLowerCase();
              
              // Ensure outstanding_balance is calculated correctly based on payment status
              let calculatedOutstanding = outstandingBalance;
              if (paymentStatus === 'partial' && outstandingBalance === 0 && totalCost > 0) {
                // If outstanding_balance is 0 but status is partial, calculate it
                calculatedOutstanding = totalCost * 0.5;
              } else if (paymentStatus === 'pending' && outstandingBalance === 0 && totalCost > 0) {
                // If outstanding_balance is 0 but status is pending, use total_cost
                calculatedOutstanding = totalCost;
              }
              
              return {
                wedding_id: r.wedding_id,
                wedding_date: r.wedding_date,
                payment_due_date: r.payment_due_date,
                couple_name: `${r.partner1_name} & ${r.partner2_name}`,
                venue: r.venue,
                total_cost: totalCost,
                outstanding_balance: calculatedOutstanding,
                payment_status: r.payment_status,
                days_overdue: r.days_overdue || 0
              };
            })
      }
    });
  } catch (error) {
    console.error('Error generating accounts receivable report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate accounts receivable report',
      message: error.message
    });
  }
});

// GET /reports/menu-usage?period=month|year&value=YYYY-MM|YYYY
// Menu item usage analytics across all weddings
router.get('/menu-usage', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

    // Menu item usage count and financials
    // Count actual usage: sum of (quantity in package_menu_items) for each table assignment
    const [menuUsageData] = await promisePool.query(
        `SELECT 
        m.menu_item_id,
        m.menu_name,
        m.menu_type,
        m.unit_cost,
        m.selling_price,
        COALESCE(SUM(COALESCE(pmi.quantity, 1)), 0) AS usage_count,
        COALESCE(SUM(COALESCE(pmi.quantity, 1) * m.selling_price), 0) AS total_revenue,
        COALESCE(SUM(COALESCE(pmi.quantity, 1) * m.unit_cost), 0) AS total_cost,
        COALESCE(SUM(COALESCE(pmi.quantity, 1) * (m.selling_price - m.unit_cost)), 0) AS total_profit
      FROM menu_item m
      JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
      JOIN package p ON pmi.package_id = p.package_id
      JOIN table_package tp ON tp.package_id = p.package_id
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      WHERE ${whereSql}
      GROUP BY m.menu_item_id, m.menu_name, m.menu_type, m.unit_cost, m.selling_price
      ORDER BY usage_count DESC`,
        params);

    // Calculate totals and previous period for comparison
    let previousUsageCount = 0;
    if (period === 'month' && value) {
      const [year, month] = value.split('-');
      let prevMonth = parseInt(month) - 1;
      let prevYear = parseInt(year);
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = prevYear - 1;
      }
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const prevWhere = periodWhere('month', prevMonthStr);
      const [prevData] = await promisePool.query(
          `SELECT COALESCE(SUM(COALESCE(pmi.quantity, 1)), 0) AS total_usage
         FROM package_menu_items pmi
         JOIN package p ON pmi.package_id = p.package_id
         JOIN table_package tp ON tp.package_id = p.package_id
         JOIN seating_table st ON tp.table_id = st.table_id
         JOIN wedding w ON st.wedding_id = w.wedding_id
         WHERE ${prevWhere.sql}`,
          prevWhere.params);
      previousUsageCount = parseFloat(prevData[0]?.total_usage || 0);
    }

    // Parse usage_count as integer to avoid string concatenation
    const totalUsage = menuUsageData.reduce((sum, item) => sum + parseInt(item.usage_count || 0, 10), 0);
    const totalRevenue = menuUsageData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const totalCost = menuUsageData.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);
    const totalProfit = menuUsageData.reduce((sum, item) => sum + parseFloat(item.total_profit || 0), 0);
    const uniqueMenuItems = menuUsageData.length;

    res.json({
      success: true,
      data: {
        period,
        value,
        total_usage: totalUsage,
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_profit: totalProfit,
        unique_menu_items: uniqueMenuItems,
        previous_period_usage: previousUsageCount,
        usage_change_percent: previousUsageCount > 0 ? ((totalUsage - previousUsageCount) / previousUsageCount) * 100 : 0,
        menu_items: menuUsageData.map(item => ({
          menu_item_id: item.menu_item_id,
          menu_name: item.menu_name,
          menu_type: item.menu_type,
          usage_count: parseInt(item.usage_count) || 0,
          total_revenue: parseFloat(item.total_revenue || 0),
          total_cost: parseFloat(item.total_cost || 0),
          total_profit: parseFloat(item.total_profit || 0),
          profit_margin: parseFloat(item.total_revenue || 0) > 0 ? 
            (parseFloat(item.total_profit || 0) / parseFloat(item.total_revenue || 0)) * 100 : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error generating menu usage report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate menu usage report',
      message: error.message
    });
  }
});

// GET /reports/inventory-usage?period=month|year&value=YYYY-MM|YYYY
// Inventory usage analytics across all weddings
router.get('/inventory-usage', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

    // Inventory usage calculation
    const [inventoryUsageData] = await promisePool.query(
        `SELECT 
        ii.inventory_id,
        ii.item_name,
        ii.category,
        ii.item_condition,
        ii.quantity_available,
        COALESCE(SUM(ia.quantity_used), 0) AS total_used,
        COUNT(DISTINCT ia.wedding_id) AS wedding_count,
        COUNT(DISTINCT ia.allocation_id) AS allocation_count,
        COALESCE(SUM(ia.quantity_used * ia.unit_rental_cost), 0) AS total_revenue
      FROM inventory_items ii
      INNER JOIN inventory_allocation ia ON ia.inventory_id = ii.inventory_id
      INNER JOIN wedding w ON ia.wedding_id = w.wedding_id
      WHERE ${whereSql}
      GROUP BY ii.inventory_id, ii.item_name, ii.category, ii.item_condition, ii.quantity_available
      HAVING total_used > 0
      ORDER BY total_used DESC`,
        params);

    // Filter to only show items that were actually used in the period
    const usedItems = inventoryUsageData.filter(item => item.total_used > 0);

    // Items needing attention (repair or low stock)
    const needsAttention = usedItems.filter(item => {
      const condition = (item.item_condition || '').toLowerCase();
      const needsRepair = condition.includes('repair') || condition.includes('damaged') || condition.includes('broken');
      const lowStock = parseFloat(item.quantity_available || 0) <= 5; // Threshold for low stock
      return needsRepair || lowStock;
    });

    // Calculate totals
    const totalItems = usedItems.length;
    const totalUsed = usedItems.reduce((sum, item) => sum + parseFloat(item.total_used || 0), 0);
    const totalRevenue = usedItems.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const totalWeddings = new Set(usedItems.flatMap(item => item.wedding_count ? [item.wedding_id] : [])).size;

    // Category breakdown
    const categoryBreakdown = usedItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {count: 0, total_used: 0, total_revenue: 0};
      }
      acc[category].count += 1;
      acc[category].total_used += parseFloat(item.total_used || 0);
      acc[category].total_revenue += parseFloat(item.total_revenue || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        period,
        value,
        total_items: totalItems,
        total_used: totalUsed,
        total_revenue: totalRevenue,
        total_weddings: totalWeddings,
        needs_attention_count: needsAttention.length,
        items: usedItems.map(item => ({
          inventory_id: item.inventory_id,
          item_name: item.item_name,
          category: item.category,
          item_condition: item.item_condition,
          quantity_available: parseFloat(item.quantity_available || 0),
          total_used: parseFloat(item.total_used || 0),
          wedding_count: item.wedding_count || 0,
          allocation_count: item.allocation_count || 0,
          total_revenue: parseFloat(item.total_revenue || 0),
          needs_repair: (item.item_condition || '').toLowerCase().includes('repair') || 
                       (item.item_condition || '').toLowerCase().includes('damaged') ||
                       (item.item_condition || '').toLowerCase().includes('broken'),
          low_stock: parseFloat(item.quantity_available || 0) <= 5
        })),
        needs_attention: needsAttention.map(item => ({
          inventory_id: item.inventory_id,
          item_name: item.item_name,
          category: item.category,
          item_condition: item.item_condition,
          quantity_available: parseFloat(item.quantity_available || 0),
          issue: (item.item_condition || '').toLowerCase().includes('repair') ? 'repair' : 'low_stock'
        })),
        category_breakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          item_count: data.count,
          total_used: data.total_used,
          total_revenue: data.total_revenue
        }))
      }
    });
  } catch (error) {
    console.error('Error generating inventory usage report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inventory usage report',
      message: error.message
    });
  }
});

// GET /reports/ingredient-usage?period=month|year&value=YYYY-MM|YYYY
// Ingredient consumption analytics across all weddings
router.get('/ingredient-usage', async (req, res) => {
  try {
    const {period = 'month', value} = req.query;
    const {sql: whereSql, params} = periodWhere(period, value);

    // Ingredient consumption calculation
    const [ingredientUsageData] = await promisePool.query(
        `SELECT 
        i.ingredient_id,
        i.ingredient_name,
        i.unit,
        i.stock_quantity,
        i.re_order_level,
        COALESCE(SUM(r.quantity_needed * pmi.quantity), 0) AS total_consumed,
        COUNT(DISTINCT w.wedding_id) AS wedding_count,
        COUNT(DISTINCT tp.table_id) AS usage_count
      FROM ingredient i
      JOIN recipe r ON r.ingredient_id = i.ingredient_id
      JOIN menu_item m ON r.menu_item_id = m.menu_item_id
      JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
      JOIN package p ON pmi.package_id = p.package_id
      JOIN table_package tp ON tp.package_id = p.package_id
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN wedding w ON st.wedding_id = w.wedding_id
      WHERE ${whereSql}
      GROUP BY i.ingredient_id, i.ingredient_name, i.unit, i.stock_quantity, i.re_order_level
      ORDER BY total_consumed DESC`,
        params);

    // Calculate ingredient costs (via recipe -> menu item unit_cost)
    const ingredientCosts = await Promise.all(ingredientUsageData.map(async (item) => {
      const [costData] = await promisePool.query(
          `SELECT 
          COALESCE(SUM((r.quantity_needed * pmi.quantity) * (m.unit_cost / NULLIF(
            (SELECT SUM(r2.quantity_needed) FROM recipe r2 WHERE r2.menu_item_id = m.menu_item_id), 0)
          )), 0) AS estimated_cost
        FROM ingredient i
        JOIN recipe r ON r.ingredient_id = i.ingredient_id
        JOIN menu_item m ON r.menu_item_id = m.menu_item_id
        JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
        JOIN package p ON pmi.package_id = p.package_id
        JOIN table_package tp ON tp.package_id = p.package_id
        JOIN seating_table st ON tp.table_id = st.table_id
        JOIN wedding w ON st.wedding_id = w.wedding_id
        WHERE ${whereSql} AND i.ingredient_id = ?`,
          [...params, item.ingredient_id]);
      return {
        ingredient_id: item.ingredient_id,
        estimated_cost: parseFloat(costData[0]?.estimated_cost || 0)
      };
    }));

    const costMap = new Map(ingredientCosts.map(c => [c.ingredient_id, c.estimated_cost]));

    // Previous period comparison
    let previousConsumption = 0;
    if (period === 'month' && value) {
      const [year, month] = value.split('-');
      let prevMonth = parseInt(month) - 1;
      let prevYear = parseInt(year);
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = prevYear - 1;
      }
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const prevWhere = periodWhere('month', prevMonthStr);
      const [prevData] = await promisePool.query(
          `SELECT COALESCE(SUM(r.quantity_needed * pmi.quantity), 0) AS total_consumed
         FROM recipe r
         JOIN menu_item m ON r.menu_item_id = m.menu_item_id
         JOIN package_menu_items pmi ON pmi.menu_item_id = m.menu_item_id
         JOIN package p ON pmi.package_id = p.package_id
         JOIN table_package tp ON tp.package_id = p.package_id
         JOIN seating_table st ON tp.table_id = st.table_id
         JOIN wedding w ON st.wedding_id = w.wedding_id
         WHERE ${prevWhere.sql}`,
          prevWhere.params);
      previousConsumption = parseFloat(prevData[0]?.total_consumed || 0);
    }

    const totalConsumed = ingredientUsageData.reduce((sum, item) => sum + parseFloat(item.total_consumed || 0), 0);
    const totalCost = Array.from(costMap.values()).reduce((sum, cost) => sum + cost, 0);
    const uniqueIngredients = ingredientUsageData.length;

    // Ingredients approaching re-order level
    const lowStockIngredients = ingredientUsageData.filter(item => {
      const stock = parseFloat(item.stock_quantity || 0);
      const reorder = parseFloat(item.re_order_level || 0);
      return stock <= reorder * 1.5;
    });

    res.json({
      success: true,
      data: {
        period,
        value,
        total_consumed: totalConsumed,
        total_cost: totalCost,
        unique_ingredients: uniqueIngredients,
        previous_period_consumption: previousConsumption,
        consumption_change_percent: previousConsumption > 0 ? ((totalConsumed - previousConsumption) / previousConsumption) * 100 : 0,
        ingredients: ingredientUsageData.map(item => ({
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredient_name,
          unit: item.unit,
          total_consumed: parseFloat(item.total_consumed || 0),
          wedding_count: item.wedding_count || 0,
          usage_count: item.usage_count || 0,
          stock_quantity: parseFloat(item.stock_quantity || 0),
          re_order_level: parseFloat(item.re_order_level || 0),
          estimated_cost: costMap.get(item.ingredient_id) || 0,
          stock_status: parseFloat(item.stock_quantity || 0) <= parseFloat(item.re_order_level || 0) ? 'low' :
                       parseFloat(item.stock_quantity || 0) <= parseFloat(item.re_order_level || 0) * 1.5 ? 'warning' : 'good'
        })),
        low_stock_ingredients: lowStockIngredients.map(item => ({
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredient_name,
          stock_quantity: parseFloat(item.stock_quantity || 0),
          re_order_level: parseFloat(item.re_order_level || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Error generating ingredient usage report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ingredient usage report',
      message: error.message
    });
  }
});

module.exports = router;
