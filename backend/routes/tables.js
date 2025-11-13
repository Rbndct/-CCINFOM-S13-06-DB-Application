const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// Helper to get next guest table number for a wedding
async function getNextGuestTableNumber(weddingId) {
  const [rows] = await promisePool.query(
    `SELECT MAX(CAST(table_number AS UNSIGNED)) AS max_num
     FROM seating_table
     WHERE wedding_id = ? AND table_category = 'guest'`,
    [weddingId]
  );
  const maxNum = rows[0]?.max_num || 0;
  return String(maxNum + 1);
}

// Create Couple Table (one per wedding)
router.post('/seating/:wedding_id/couple', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const [exists] = await promisePool.query(
      `SELECT table_id FROM seating_table WHERE wedding_id = ? AND table_category = 'couple' LIMIT 1`,
      [weddingId]
    );
    if (exists.length > 0) {
      return res.status(409).json({ success: false, error: 'Couple table already exists' });
    }
    const [ins] = await promisePool.query(
      `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, 'C', 'couple', NULL)`,
      [weddingId]
    );
    res.status(201).json({ success: true, message: 'Couple table created', data: { table_id: ins.insertId, wedding_id: Number(weddingId), table_number: 'C', table_category: 'couple' } });
  } catch (error) {
    console.error('Error creating couple table:', error);
    res.status(500).json({ success: false, error: 'Failed to create couple table', message: error.message });
  }
});

// Create Guest Table (capacity 6-10 inclusive)
router.post('/seating/:wedding_id/guest', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const { capacity } = req.body;
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 6 || cap > 10) {
      return res.status(400).json({ success: false, error: 'Capacity must be an integer between 6 and 10' });
    }
    const nextNum = await getNextGuestTableNumber(weddingId);
    const [ins] = await promisePool.query(
      `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, ?, 'guest', ?)`,
      [weddingId, nextNum, cap]
    );
    res.status(201).json({ success: true, message: 'Guest table created', data: { table_id: ins.insertId, wedding_id: Number(weddingId), table_number: nextNum, table_category: 'guest', capacity: cap } });
  } catch (error) {
    console.error('Error creating guest table:', error);
    res.status(500).json({ success: false, error: 'Failed to create guest table', message: error.message });
  }
});

// Assign guests to a guest table (enforce max capacity)
router.post('/seating/:wedding_id/guest/:table_id/assign', async (req, res) => {
  try {
    const weddingId = Number(req.params.wedding_id);
    const tableId = Number(req.params.table_id);
    const { guest_ids } = req.body; // array

    if (!Array.isArray(guest_ids) || guest_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'guest_ids must be a non-empty array' });
    }

    const [tableRows] = await promisePool.query(
      `SELECT table_id, wedding_id, table_category, capacity FROM seating_table WHERE table_id = ?`,
      [tableId]
    );
    if (tableRows.length === 0 || tableRows[0].wedding_id !== weddingId || tableRows[0].table_category !== 'guest') {
      return res.status(400).json({ success: false, error: 'Invalid guest table for this wedding' });
    }
    const capacity = tableRows[0].capacity;
    const [cntRows] = await promisePool.query(
      `SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?`,
      [tableId]
    );
    const current = cntRows[0].cnt || 0;
    if (current + guest_ids.length > capacity) {
      return res.status(409).json({ success: false, error: 'Assigning exceeds table capacity' });
    }

    const placeholders = guest_ids.map(() => '?').join(',');
    const params = [tableId, ...guest_ids];
    await promisePool.query(
      `UPDATE guest SET table_id = ? WHERE guest_id IN (${placeholders}) AND wedding_id = ?`,
      [tableId, ...guest_ids, weddingId]
    );

    res.json({ success: true, message: 'Guests assigned to table' });
  } catch (error) {
    console.error('Error assigning guests:', error);
    res.status(500).json({ success: false, error: 'Failed to assign guests', message: error.message });
  }
});

// List seating tables with guest counts
router.get('/seating/:wedding_id', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const [rows] = await promisePool.query(
      `SELECT st.*, 
        COALESCE(gcnt.cnt, 0) AS guest_count
       FROM seating_table st
       LEFT JOIN (
         SELECT table_id, COUNT(*) AS cnt FROM guest GROUP BY table_id
       ) gcnt ON st.table_id = gcnt.table_id
       WHERE st.wedding_id = ?
       ORDER BY CASE WHEN st.table_category = 'couple' THEN 0 ELSE 1 END, 
                CASE WHEN st.table_category = 'couple' THEN 0 ELSE CAST(st.table_number AS UNSIGNED) END`,
      [weddingId]
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Error listing seating tables:', error);
    res.status(500).json({ success: false, error: 'Failed to list seating', message: error.message });
  }
});

// Delete a table (no delete for couple table; guest table only if empty)
router.delete('/seating/:table_id', async (req, res) => {
  try {
    const tableId = req.params.table_id;
    const [rows] = await promisePool.query(
      'SELECT table_category FROM seating_table WHERE table_id = ? LIMIT 1',
      [tableId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }
    if (rows[0].table_category === 'couple') {
      return res.status(400).json({ success: false, error: 'Couple table cannot be deleted' });
    }
    const [g] = await promisePool.query(
      'SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?',
      [tableId]
    );
    if ((g[0]?.cnt || 0) > 0) {
      return res.status(409).json({ success: false, error: 'Cannot delete table with assigned guests' });
    }
    await promisePool.query('DELETE FROM seating_table WHERE table_id = ?', [tableId]);
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ success: false, error: 'Failed to delete table', message: error.message });
  }
});

module.exports = router;




