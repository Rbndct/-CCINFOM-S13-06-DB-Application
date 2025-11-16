const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Helper to get next table number for a wedding (format: T-001, T-002, etc.)
// All tables share the same numbering sequence regardless of category
async function getNextTableNumber(weddingId) {
  const [rows] = await promisePool.query(
      `SELECT table_number
     FROM seating_table
     WHERE wedding_id = ?
     ORDER BY table_id ASC`,
      [weddingId]);
  
  // Extract numeric part from existing table numbers (T-001 -> 1, C-001 -> 1, etc.)
  let maxNum = 0;
  for (const row of rows) {
    const tableNum = row.table_number || '';
    // Handle formats: "T-001", "C-001", "t-001", "c-001", or just numbers
    if (tableNum.toLowerCase().startsWith('t-') || tableNum.toLowerCase().startsWith('c-')) {
      const numPart = parseInt(tableNum.substring(2), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    } else {
      const numPart = parseInt(tableNum, 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  
  // Return in format T-001, T-002, etc. (capital T, all tables use same sequence)
  const nextNum = maxNum + 1;
  return `T-${String(nextNum).padStart(3, '0')}`;
}

// Create Couple Table (capacity 2 by default)
router.post('/seating/:wedding_id/couple', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const {capacity} = req.body;
    const cap = capacity ? Number(capacity) : 2; // Default to 2
    
    // Validate capacity: minimum 2 for couple table
    if (!Number.isInteger(cap) || cap < 2) {
      return res.status(400).json({
        success: false,
        error: 'Couple table capacity must be at least 2'
      });
    }
    
    // Get next table number (all tables share same sequence)
    const nextNum = await getNextTableNumber(weddingId);
    
    const [ins] = await promisePool.query(
        `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, ?, 'couple', ?)`,
        [weddingId, nextNum, cap]);
    res.status(201).json({
      success: true,
      message: 'Couple table created',
      data: {
        table_id: ins.insertId,
        wedding_id: Number(weddingId),
        table_number: nextNum,
        table_category: 'couple',
        capacity: cap
      }
    });
  } catch (error) {
    console.error('Error creating couple table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create couple table',
      message: error.message
    });
  }
});

// Create Guest Table (capacity 1-15 inclusive)
router.post('/seating/:wedding_id/guest', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const {capacity, table_category} = req.body;
    const cap = Number(capacity);
    const category = table_category || 'guest';
    
    // Validate capacity: minimum 1, maximum 15
    if (!Number.isInteger(cap) || cap < 1 || cap > 15) {
      return res.status(400).json({
        success: false,
        error: 'Capacity must be an integer between 1 and 15'
      });
    }
    
    const nextNum = await getNextTableNumber(weddingId);
    const [ins] = await promisePool.query(
        `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, ?, ?, ?)`,
        [weddingId, nextNum, category, cap]);
    res.status(201).json({
      success: true,
      message: 'Table created',
      data: {
        table_id: ins.insertId,
        wedding_id: Number(weddingId),
        table_number: nextNum,
        table_category: category,
        capacity: cap
      }
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create table',
      message: error.message
    });
  }
});

// Assign guests to a table (enforce max capacity) - works for all table types
router.post('/seating/:wedding_id/guest/:table_id/assign', async (req, res) => {
  try {
    const weddingId = Number(req.params.wedding_id);
    const tableId = Number(req.params.table_id);
    const {guest_ids} = req.body;  // array

    if (!Array.isArray(guest_ids) || guest_ids.length === 0) {
      return res.status(400).json(
          {success: false, error: 'guest_ids must be a non-empty array'});
    }

    // Validate all guest_ids are numbers
    const invalidIds = guest_ids.filter(id => !Number.isInteger(Number(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json(
          {success: false, error: 'All guest_ids must be valid integers'});
    }

    const [tableRows] = await promisePool.query(
        `SELECT table_id, wedding_id, table_category, capacity FROM seating_table WHERE table_id = ?`,
        [tableId]);
    if (tableRows.length === 0) {
      return res.status(404).json(
          {success: false, error: 'Table not found'});
    }
    if (tableRows[0].wedding_id !== weddingId) {
      return res.status(400).json(
          {success: false, error: 'Table does not belong to this wedding'});
    }
    
    const capacity = tableRows[0].capacity;
    const tableCategory = tableRows[0].table_category || '';
    const isCoupleTable = tableCategory.toLowerCase() === 'couple';
    const partnerCount = isCoupleTable ? 2 : 0; // Couple tables always have 2 partners seated
    
    const [cntRows] = await promisePool.query(
        `SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?`, [tableId]);
    const current = cntRows[0].cnt || 0;
    const totalAfterAssignment = current + partnerCount + guest_ids.length;
    
    if (totalAfterAssignment > capacity) {
      return res.status(409).json(
          {success: false, error: `Assigning exceeds table capacity. Table capacity: ${capacity}, Currently assigned: ${current}${isCoupleTable ? ' + 2 partners' : ''}, Trying to assign: ${guest_ids.length}, Total would be: ${totalAfterAssignment}`});
    }

    // Validate guests exist and belong to this wedding
    const placeholders = guest_ids.map(() => '?').join(',');
    const [guestCheckRows] = await promisePool.query(
        `SELECT guest_id FROM guest WHERE guest_id IN (${placeholders}) AND wedding_id = ?`,
        [...guest_ids, weddingId]);
    
    if (guestCheckRows.length !== guest_ids.length) {
      const foundIds = guestCheckRows.map(r => r.guest_id);
      const missingIds = guest_ids.filter(id => !foundIds.includes(Number(id)));
      return res.status(400).json(
          {success: false, error: `Some guests not found or don't belong to this wedding. Missing: ${missingIds.join(', ')}`});
    }

    // Update guest table assignments
    const updatePlaceholders = guest_ids.map(() => '?').join(',');
    await promisePool.query(
        `UPDATE guest SET table_id = ? WHERE guest_id IN (${updatePlaceholders}) AND wedding_id = ?`,
        [tableId, ...guest_ids.map(id => Number(id)), weddingId]);

    res.json({success: true, message: 'Guests assigned to table'});
  } catch (error) {
    console.error('Error assigning guests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign guests',
      message: error.message
    });
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
        [weddingId]);
    res.json({success: true, data: rows, count: rows.length});
  } catch (error) {
    console.error('Error listing seating tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list seating',
      message: error.message
    });
  }
});


// Delete a table (ALLOW deleting ALL tables, including those with guests)
router.delete('/seating/:table_id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    
    const tableId = req.params.table_id;
    const [rows] = await promisePool.query(
        'SELECT table_category FROM seating_table WHERE table_id = ? LIMIT 1',
        [tableId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Table not found'});
    }
    
    // Remove all guest assignments from this table first
    await connection.query(
        'UPDATE guest SET table_id = NULL WHERE table_id = ?', [tableId]);
    
    // Delete the table (both couple and guest tables can be deleted)
    await connection.query(
        'DELETE FROM seating_table WHERE table_id = ?', [tableId]);
    
    await connection.commit();
    res.json({success: true, message: 'Table deleted successfully. Guests have been unassigned.'});
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete table',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Update table (capacity for all tables)
router.put('/seating/:table_id', async (req, res) => {
  try {
    const tableId = req.params.table_id;
    const {capacity} = req.body;
    
    // Check if table exists
    const [rows] = await promisePool.query(
        'SELECT table_category, capacity FROM seating_table WHERE table_id = ? LIMIT 1',
        [tableId]);
    if (rows.length === 0) {
      return res.status(404).json({success: false, error: 'Table not found'});
    }
    
    const tableCategory = rows[0].table_category;
    const cap = Number(capacity);
    
    // Validate capacity based on table category
    if (tableCategory === 'couple') {
      // Couple table: minimum 2, maximum 15
      if (!Number.isInteger(cap) || cap < 2 || cap > 15) {
        return res.status(400).json({
          success: false,
          error: 'Couple table capacity must be an integer between 2 and 15'
        });
      }
    } else {
      // Other tables: minimum 1, maximum 15
      if (!Number.isInteger(cap) || cap < 1 || cap > 15) {
        return res.status(400).json({
          success: false,
          error: 'Capacity must be an integer between 1 and 15'
        });
      }
    }
    
    // Check current assigned guests
    const [cntRows] = await promisePool.query(
        'SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?', [tableId]);
    const currentAssigned = cntRows[0]?.cnt || 0;
    if (cap < currentAssigned) {
      return res.status(409).json({
        success: false,
        error: `Capacity cannot be less than assigned guests (${currentAssigned})`
      });
    }
    
    await promisePool.query(
        'UPDATE seating_table SET capacity = ? WHERE table_id = ?',
        [cap, tableId]);
    
    res.json({success: true, message: 'Table updated successfully'});
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update table',
      message: error.message
    });
  }
});

module.exports = router;
