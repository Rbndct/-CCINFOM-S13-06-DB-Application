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

    // Get "None" restriction ID for filtering
    const [noneRows] = await promisePool.query(
        'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
        ['None']
    );
    const noneRestrictionId = noneRows.length > 0 ? noneRows[0].restriction_id : null;

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
        
        // If guest has other restrictions besides "None", filter out "None"
        // "None" should only appear if it's the only restriction
        if (noneRestrictionId && restrictions.length > 1) {
          restrictions = restrictions.filter((r) => r.restriction_id !== noneRestrictionId);
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

    // Use first restriction_id for backward compatibility
    // Auto-assign "None" if no restrictions provided (consistent with PUT
    // endpoint)
    let restrictionIdForGuest = null;
    if (restriction_ids && restriction_ids.length > 0) {
      restrictionIdForGuest = restriction_ids[0];
    } else if (restriction_id) {
      restrictionIdForGuest = restriction_id;
    } else {
      // Auto-assign "None" if no restrictions provided
      const [noneRows] = await connection.query(
          'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
          ['None']);
      if (noneRows.length > 0) {
        restrictionIdForGuest = noneRows[0].restriction_id;
      }
    }

    // Ensure wedding_id is an integer
    const normalizedWeddingId = parseInt(wedding_id, 10);
    if (isNaN(normalizedWeddingId)) {
      await connection.rollback();
      return res.status(400).json(
          {success: false, error: 'Invalid wedding_id'});
    }

    const [result] = await connection.query(
        'INSERT INTO guest (guest_name, wedding_id, rsvp_status, table_id, restriction_id) VALUES (?, ?, ?, ?, ?)',
        [
          finalGuestName, normalizedWeddingId, rsvp_status || 'pending',
          table_id || null, restrictionIdForGuest
        ]);

    const guestId = result.insertId;
    
    if (!guestId) {
      await connection.rollback();
      return res.status(500).json(
          {success: false, error: 'Failed to create guest - no insert ID returned'});
    }

    // Insert multiple dietary restrictions via junction table if
    // restriction_ids array is provided
    let restrictionIdsArray =
        restriction_ids || (restriction_id ? [restriction_id] : []);

    // Get "None" restriction ID for filtering
    const [noneRowsForFilter] = await connection.query(
        'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
        ['None']
    );
    const noneRestrictionIdForFilter = noneRowsForFilter.length > 0 ? noneRowsForFilter[0].restriction_id : null;

    // If other restrictions are provided, automatically exclude "None"
    // "None" should only be used when no other restrictions are selected
    if (restrictionIdsArray.length > 0 && noneRestrictionIdForFilter !== null) {
      restrictionIdsArray = restrictionIdsArray.filter(id => id !== noneRestrictionIdForFilter);
    }

    // Auto-assign "None" if no restrictions provided
    if (restrictionIdsArray.length === 0) {
      // Get "None" restriction ID (use same value as restrictionIdForGuest for
      // consistency)
      if (restrictionIdForGuest !== null) {
        restrictionIdsArray = [restrictionIdForGuest];
      } else if (noneRestrictionIdForFilter !== null) {
        restrictionIdsArray = [noneRestrictionIdForFilter];
      }
    }

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
        if (restrictionIdsArray.length > 0) {
          // Convert restriction IDs to integers to ensure proper type
          const normalizedIds = restrictionIdsArray
            .map(rid => parseInt(rid, 10))
            .filter(id => !isNaN(id) && id > 0);
          
          if (normalizedIds.length > 0) {
            // Use bulk insert syntax: VALUES ? with array of arrays
            const values = normalizedIds.map(rid => [guestId, rid]);
            try {
              await connection.query(
                  'INSERT INTO guest_restrictions (guest_id, restriction_id) VALUES ?',
                  [values]);
            } catch (insertError) {
              console.error('Error inserting into guest_restrictions:', insertError);
              console.error('Values being inserted:', values);
              throw insertError;
            }
          }
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
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      guest_name,
      rsvp_status,
      table_id,
      restriction_id,
      restriction_ids
    } = req.body;

    // Use guest_name if provided, otherwise use name
    const finalGuestName = guest_name || name;

    // Use first restriction_id for backward compatibility
    let restrictionIdForGuest = null;
    if (restriction_ids && restriction_ids.length > 0) {
      restrictionIdForGuest = restriction_ids[0];
    } else if (restriction_id) {
      restrictionIdForGuest = restriction_id;
    } else {
      // Auto-assign "None" if no restrictions provided
      const [noneRows] = await connection.query(
          'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
          ['None']);
      if (noneRows.length > 0) {
        restrictionIdForGuest = noneRows[0].restriction_id;
      }
    }

    const [result] = await connection.query(
        'UPDATE guest SET guest_name = ?, rsvp_status = ?, table_id = ?, restriction_id = ? WHERE guest_id = ?',
        [
          finalGuestName, rsvp_status, table_id || null, restrictionIdForGuest,
          req.params.id
        ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Guest not found'});
    }

    // Update junction table - handle restriction_ids array
    // Priority: restriction_ids array > restriction_id single value > auto-assign "None"
    let finalRestrictionIds = [];
    let shouldUpdateRestrictions = false;
    
    if (restriction_ids !== undefined && restriction_ids !== null) {
      // If restriction_ids is explicitly provided (even if empty array), use it
      finalRestrictionIds = Array.isArray(restriction_ids) ? restriction_ids : [];
      shouldUpdateRestrictions = true; // Explicitly provided, so update
    } else if (restriction_id !== undefined && restriction_id !== null) {
      // Fallback to single restriction_id for backward compatibility
      finalRestrictionIds = [restriction_id];
      shouldUpdateRestrictions = true; // Explicitly provided, so update
    }
    // If neither restriction_ids nor restriction_id is provided, don't update restrictions
    
    // Get "None" restriction ID for filtering
    const [noneRows] = await connection.query(
        'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
        ['None']
    );
    const noneRestrictionId = noneRows.length > 0 ? noneRows[0].restriction_id : null;
    
    // If other restrictions are provided, automatically exclude "None"
    // "None" should only be used when no other restrictions are selected
    if (finalRestrictionIds.length > 0 && noneRestrictionId !== null) {
      finalRestrictionIds = finalRestrictionIds.filter(id => id !== noneRestrictionId);
    }
    
    // Auto-assign "None" only if restriction_ids was explicitly provided as empty array
    // (meaning user intentionally cleared all restrictions)
    if (shouldUpdateRestrictions && finalRestrictionIds.length === 0 && restriction_ids !== undefined && Array.isArray(restriction_ids) && restriction_ids.length === 0) {
      if (noneRestrictionId !== null) {
        finalRestrictionIds = [noneRestrictionId];
      }
    }

    // Check if guest_restrictions table exists and update it
    const [tableCheck] = await connection.query(`
      SELECT COUNT(*) as cnt 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'guest_restrictions'
    `);

    if (tableCheck[0]?.cnt > 0 && shouldUpdateRestrictions) {
      // ALWAYS delete ALL existing restrictions first to ensure clean state
      // This removes any old restrictions including "None" (ID 1)
      await connection.query(
          'DELETE FROM guest_restrictions WHERE guest_id = ?', [req.params.id]);

      // Insert new restrictions (only if we have any to insert)
      if (finalRestrictionIds.length > 0) {
        // Filter out any null/undefined values and ensure all are numbers
        const validRestrictionIds = finalRestrictionIds
          .filter(rid => rid !== null && rid !== undefined && !isNaN(Number(rid)))
          .map(rid => Number(rid));
        
        if (validRestrictionIds.length > 0) {
          // Use bulk insert syntax: VALUES ? with array of arrays
          const values = validRestrictionIds.map(rid => [req.params.id, rid]);
          await connection.query(
              'INSERT INTO guest_restrictions (guest_id, restriction_id) VALUES ?',
              [values]);
        }
      }
    }

    await connection.commit();
    
    res.json({success: true, message: 'Guest updated successfully'});
  } catch (error) {
    await connection.rollback();
    console.error('Error updating guest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update guest',
      message: error.message
    });
  } finally {
    connection.release();
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
