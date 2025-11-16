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

    // Totals and averages (use total_cost as income proxy)
    const [incomeRows] = await promisePool.query(
      `SELECT 
         COALESCE(SUM(w.total_cost), 0) AS totalIncome,
         COALESCE(AVG(w.total_cost), 0) AS avgIncome,
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

module.exports = router;


