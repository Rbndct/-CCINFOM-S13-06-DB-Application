const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// GET all guests (optionally filter by wedding_id)
router.get('/', async (req, res) => {
  try {
    const {wedding_id} = req.query;

    // Check if guest_restrictions table exists
    const [tableCheck] = await promisePool.query(`
      SELECT COUNT(*) as cnt 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'guest_restrictions'
    `);

    const hasJunctionTable = tableCheck[0]?.cnt > 0;

    let query, params;
    if (hasJunctionTable) {
      // Use junction table to get multiple restrictions
      if (wedding_id) {
        query = `
          SELECT 
            g.guest_id,
            g.wedding_id,
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
            ) as restrictions
          FROM guest g
          LEFT JOIN guest_restrictions gr ON g.guest_id = gr.guest_id
          LEFT JOIN dietary_restriction dr ON gr.restriction_id = dr.restriction_id
          WHERE g.wedding_id = ?
          GROUP BY g.guest_id, g.wedding_id, g.guest_name, g.table_id, g.rsvp_status
          ORDER BY g.guest_id DESC
        `;
        params = [wedding_id];
      } else {
        query = `
          SELECT 
            g.guest_id,
            g.wedding_id,
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
            ) as restrictions
          FROM guest g
          LEFT JOIN guest_restrictions gr ON g.guest_id = gr.guest_id
          LEFT JOIN dietary_restriction dr ON gr.restriction_id = dr.restriction_id
          GROUP BY g.guest_id, g.wedding_id, g.guest_name, g.table_id, g.rsvp_status
          ORDER BY g.guest_id DESC
        `;
        params = [];
      }
    } else {
      // Fallback to simple query without junction table
      if (wedding_id) {
        query =
            'SELECT * FROM guest WHERE wedding_id = ? ORDER BY guest_id DESC';
        params = [wedding_id];
      } else {
        query = 'SELECT * FROM guest ORDER BY guest_id DESC';
        params = [];
      }
    }

    const [rows] = await promisePool.query(query, params);

    // Parse JSON arrays and filter out null values
    const processedRows = rows.map((row) => {
      if (row.restrictions) {
        let restrictions = [];
        try {
          const parsed = typeof row.restrictions === 'string' ?
              JSON.parse(row.restrictions) :
              row.restrictions;
          restrictions = Array.isArray(parsed) ?
              parsed.filter((r) => r && r.restriction_id !== null) :
              [];
        } catch (e) {
          restrictions = [];
        }
        return {...row, restrictions: restrictions};
      }
      return row;
    });

    res.json({success: true, data: processedRows, count: processedRows.length});
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guests',
      message: error.message
    });
  }
});

// GET single guest by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
        'SELECT * FROM guest WHERE guest_id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({success: false, error: 'Guest not found'});
    }

    res.json({success: true, data: rows[0]});
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guest',
      message: error.message
    });
  }
});

// POST create new guest
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      guest_name,
      wedding_id,
      rsvp_status,
      table_id,
      restriction_id,
      restriction_ids
    } = req.body;

    // Use guest_name if provided, otherwise use name
    const finalGuestName = guest_name || name;

    if (!finalGuestName || !wedding_id) {
      await connection.rollback();
      return res.status(400).json(
          {success: false, error: 'Guest name and wedding_id are required'});
    }

    // Use first restriction_id for backward compatibility if no restriction_ids
    // array
    const restrictionIdForGuest =
        restriction_ids && restriction_ids.length > 0 ?
        restriction_ids[0] :
        (restriction_id || null);

    const [result] = await connection.query(
        'INSERT INTO guest (guest_name, wedding_id, rsvp_status, table_id, restriction_id) VALUES (?, ?, ?, ?, ?)',
        [
          finalGuestName, wedding_id, rsvp_status || 'pending',
          table_id || null, restrictionIdForGuest
        ]);

    const guestId = result.insertId;

    // Insert multiple dietary restrictions via junction table if
    // restriction_ids array is provided
    const restrictionIdsArray =
        restriction_ids || (restriction_id ? [restriction_id] : []);
    if (restrictionIdsArray.length > 0) {
      // Check if guest_restrictions table exists
      const [tableCheck] = await connection.query(`
        SELECT COUNT(*) as cnt 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'guest_restrictions'
      `);

      if (tableCheck[0]?.cnt > 0) {
        // Insert into junction table
        const values = restrictionIdsArray.map((rid) => [guestId, rid]);
        if (values.length > 0) {
          await connection.query(
              'INSERT INTO guest_restrictions (guest_id, restriction_id) VALUES ?',
              [values]);
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: {
        guest_id: guestId,
        guest_name: finalGuestName,
        wedding_id,
        rsvp_status: rsvp_status || 'pending',
        table_id: table_id || null,
        restriction_ids: restrictionIdsArray
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating guest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create guest',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// PUT update guest
router.put('/:id', async (req, res) => {
  try {
    const {name, guest_name, rsvp_status, table_id, restriction_id} = req.body;

    // Use guest_name if provided, otherwise use name
    const finalGuestName = guest_name || name;

    const [result] = await promisePool.query(
        'UPDATE guest SET guest_name = ?, rsvp_status = ?, table_id = ?, restriction_id = ? WHERE guest_id = ?',
        [
          finalGuestName, rsvp_status, table_id || null, restriction_id || null,
          req.params.id
        ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Guest not found'});
    }

    res.json({success: true, message: 'Guest updated successfully'});
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update guest',
      message: error.message
    });
  }
});

// DELETE guest
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query(
        'DELETE FROM guest WHERE guest_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Guest not found'});
    }

    res.json({success: true, message: 'Guest deleted successfully'});
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete guest',
      message: error.message
    });
  }
});

module.exports = router;
