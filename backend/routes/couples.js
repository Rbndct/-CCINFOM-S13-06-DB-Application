const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// GET all couples with wedding count and latest preference
router.get('/', async (req, res) => {
  try {
    const {ceremony_type, restriction_ids, planner_contact} = req.query;

    const whereClauses = [];
    const params = [];
    if (planner_contact) {
      whereClauses.push('c.planner_contact LIKE ?');
      params.push(`%${planner_contact}%`);
    }
    if (ceremony_type) {
      whereClauses.push('cp.ceremony_type = ?');
      params.push(ceremony_type);
    }
    
    // Handle multiple restriction IDs
    let restrictionFilter = '';
    if (restriction_ids) {
      let restrictionIdArray = [];
      if (Array.isArray(restriction_ids)) {
        restrictionIdArray = restriction_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      } else if (typeof restriction_ids === 'string') {
        // Handle comma-separated string or single value
        restrictionIdArray = restriction_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
      
      if (restrictionIdArray.length > 0) {
        // Filter couples that have at least one of the selected restrictions
        restrictionFilter = `EXISTS (
          SELECT 1 FROM couple_preference_restrictions cpr2
          INNER JOIN couple_preferences cp2 ON cpr2.preference_id = cp2.preference_id
          WHERE cp2.couple_id = c.couple_id
          AND cpr2.restriction_id IN (${restrictionIdArray.map(() => '?').join(',')})
        )`;
        params.push(...restrictionIdArray);
        whereClauses.push(restrictionFilter);
      }
    }
    
    const whereSql =
        whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await promisePool.query(
        `
      SELECT 
        c.couple_id,
        c.partner1_name,
        c.partner2_name,
        c.partner1_phone,
        c.partner2_phone,
        c.partner1_email,
        c.partner2_email,
        c.planner_contact,
        COUNT(DISTINCT w.wedding_id) AS wedding_count,
        MAX(w.wedding_date) AS last_wedding,
        cp.preference_id,
        cp.ceremony_type,
        (SELECT COUNT(*) FROM couple_preferences cp2 WHERE cp2.couple_id = c.couple_id) AS preference_count,
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
      FROM couple c
      LEFT JOIN wedding w ON c.couple_id = w.couple_id
      LEFT JOIN (
        SELECT x.* FROM couple_preferences x
        INNER JOIN (
          SELECT couple_id, MAX(preference_id) AS max_pref
          FROM couple_preferences
          GROUP BY couple_id
        ) t ON x.couple_id = t.couple_id AND x.preference_id = t.max_pref
      ) cp ON cp.couple_id = c.couple_id
      LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
      LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
      ${whereSql}
      GROUP BY c.couple_id, c.partner1_name, c.partner2_name, c.partner1_phone, c.partner2_phone, 
               c.partner1_email, c.partner2_email, c.planner_contact, cp.preference_id, cp.ceremony_type
      ORDER BY c.couple_id DESC
    `,
        params);

    // Parse JSON arrays and extract first restriction for backward
    // compatibility
    const processedRows = rows.map(row => {
      let restrictions = [];
      try {
        const parsed = typeof row.restrictions === 'string' ?
            JSON.parse(row.restrictions) :
            row.restrictions;
        restrictions = Array.isArray(parsed) ?
            parsed.filter(r => r && r.restriction_id !== null) :
            [];
      } catch (e) {
        console.warn('Error parsing restrictions JSON:', e);
        restrictions = [];
      }

      // For backward compatibility, include first restriction fields at top
      // level
      const firstRestriction = restrictions[0] || null;

      return {
        ...row,
        restriction_id: firstRestriction?.restriction_id || null,
        restriction_name: firstRestriction?.restriction_name || null,
        restriction_type: firstRestriction?.restriction_type || null,
        severity_level: firstRestriction?.severity_level || null,
        all_restrictions:
            restrictions  // Include all restrictions for future use
      };
    });

    res.json({success: true, data: processedRows, count: processedRows.length});
  } catch (error) {
    console.error('Error fetching couples:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couples',
      message: error.message
    });
  }
});

// Preferences CRUD - Must be defined BEFORE /:id route to avoid route conflicts
router.post('/preferences', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const {couple_id, ceremony_type, restriction_ids} = req.body;

    console.log(
        'Creating preference with data:',
        {couple_id, ceremony_type, restriction_ids});
    console.log('Data types:', {
      couple_id: typeof couple_id,
      ceremony_type: typeof ceremony_type,
      restriction_ids: Array.isArray(restriction_ids) ? 'array' :
                                                        typeof restriction_ids
    });

    // Normalize couple_id to integer
    const normalizedCoupleId = parseInt(couple_id, 10);
    if (isNaN(normalizedCoupleId)) {
      connection.release();
      return res.status(400).json(
          {success: false, error: 'Invalid couple_id: must be a number'});
    }

    if (!ceremony_type || !ceremony_type.trim()) {
      connection.release();
      return res.status(400).json(
          {success: false, error: 'Missing required field: ceremony_type'});
    }

    // Validate couple_id exists
    const [coupleCheck] = await connection.query(
        'SELECT couple_id FROM couple WHERE couple_id = ?',
        [normalizedCoupleId]);

    if (coupleCheck.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: `Couple with ID ${normalizedCoupleId} does not exist`
      });
    }

    // Validate restriction_ids if provided
    const restrictionIdsArray = Array.isArray(restriction_ids) ?
        restriction_ids :
        (restriction_ids !== undefined && restriction_ids !== null ?
             [restriction_ids] :
             []);

    // Convert to integers if they're strings
    const normalizedRestrictionIds = restrictionIdsArray
                                         .map(id => {
                                           const parsed = parseInt(id, 10);
                                           return isNaN(parsed) ? null : parsed;
                                         })
                                         .filter(id => id !== null);

    if (normalizedRestrictionIds.length > 0) {
      // Validate all restriction IDs exist
      const placeholders = normalizedRestrictionIds.map(() => '?').join(',');
      const [validRestrictions] = await connection.query(
          `SELECT restriction_id FROM dietary_restriction WHERE restriction_id IN (${
              placeholders})`,
          normalizedRestrictionIds);

      const validIds = validRestrictions.map(r => r.restriction_id);
      const invalidIds =
          normalizedRestrictionIds.filter(id => !validIds.includes(id));

      if (invalidIds.length > 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          error: `Invalid restriction_id(s): ${
              invalidIds.join(
                  ', ')}. Available restriction IDs can be checked in the dietary restrictions list.`
        });
      }
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Remove duplicates from restriction IDs
      let uniqueRestrictionIds = normalizedRestrictionIds.length > 0 ?
          [...new Set(normalizedRestrictionIds)] :
          [];

      // Auto-assign "None" if no restrictions provided
      if (uniqueRestrictionIds.length === 0) {
        // Get "None" restriction ID
        const [noneRows] = await connection.query(
            'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
            ['None']
        );
        if (noneRows.length > 0) {
          uniqueRestrictionIds = [noneRows[0].restriction_id];
        }
      }

      // Step 1: Insert into couple_preferences (couple_id and ceremony_type
      // only)
      const [ins] = await connection.query(
          'INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (?, ?)',
          [normalizedCoupleId, ceremony_type.trim()]);

      const preferenceId = ins.insertId;
      console.log('Created preference with ID:', preferenceId);

      // Step 2: For each restriction ID in the array, insert into junction
      // table
      if (uniqueRestrictionIds.length > 0) {
        console.log(
            'Inserting restrictions into junction table:',
            uniqueRestrictionIds);

        for (const restId of uniqueRestrictionIds) {
          await connection.query(
              'INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES (?, ?)',
              [preferenceId, restId]);
        }
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'Preference created successfully',
        data: {
          preference_id: preferenceId,
          couple_id: normalizedCoupleId,
          ceremony_type: ceremony_type.trim(),
          dietaryRestrictions: uniqueRestrictionIds
        }
      });
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      console.error('Transaction error:', transactionError);
      throw transactionError;
    }
  } catch (error) {
    if (connection && !connection._released) {
      connection.release();
    }
    console.error('Error creating preference:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to create preference',
      message: error.message,
      code: error.code
    });
  }
});

router.get('/preferences/:couple_id', async (req, res) => {
  try {
    // Get preferences with dietary restrictions from junction table
    const [rows] = await promisePool.query(
        `SELECT 
          cp.preference_id,
          cp.couple_id,
          cp.ceremony_type,
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
          ) as dietaryRestrictions
        FROM couple_preferences cp
        LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
        LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
        WHERE cp.couple_id = ?
        GROUP BY cp.preference_id, cp.couple_id, cp.ceremony_type
        ORDER BY cp.preference_id DESC`,
        [req.params.couple_id]);

    // Parse JSON arrays and filter out null values
    const preferences = rows.map(row => {
      let dietaryRestrictions = [];
      try {
        const parsed = typeof row.dietaryRestrictions === 'string' ?
            JSON.parse(row.dietaryRestrictions) :
            row.dietaryRestrictions;
        dietaryRestrictions = Array.isArray(parsed) ?
            parsed.filter(r => r && r.restriction_id !== null) :
            [];
      } catch (e) {
        console.warn('Error parsing dietaryRestrictions JSON:', e);
        dietaryRestrictions = [];
      }

      return {
        preference_id: row.preference_id,
        couple_id: row.couple_id,
        ceremony_type: row.ceremony_type,
        dietaryRestrictions: dietaryRestrictions
      };
    });

    res.json({success: true, data: preferences, count: preferences.length});
  } catch (error) {
    console.error('Error listing preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list preferences',
      message: error.message
    });
  }
});

router.put('/preferences/:preference_id', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const {ceremony_type, restriction_ids} = req.body;
    const preferenceId = req.params.preference_id;

    console.log(
        'Updating preference:', preferenceId, {ceremony_type, restriction_ids});

    // Check if preference exists
    const [prefCheck] = await connection.query(
        'SELECT preference_id FROM couple_preferences WHERE preference_id = ?',
        [preferenceId]);

    if (prefCheck.length === 0) {
      connection.release();
      return res.status(404).json(
          {success: false, error: 'Preference not found'});
    }

    // Validate restriction_ids if provided
    const restrictionIdsArray = Array.isArray(restriction_ids) ?
        restriction_ids :
        (restriction_ids !== undefined ? [restriction_ids] : null);

    // Convert to integers if they're strings
    const normalizedRestrictionIds = restrictionIdsArray !== null ?
        restrictionIdsArray.map(id => parseInt(id, 10))
            .filter(id => !isNaN(id)) :
        null;

    if (normalizedRestrictionIds !== null &&
        normalizedRestrictionIds.length > 0) {
      // Validate all restriction IDs exist
      const placeholders = normalizedRestrictionIds.map(() => '?').join(',');
      const [validRestrictions] = await connection.query(
          `SELECT restriction_id FROM dietary_restriction WHERE restriction_id IN (${
              placeholders})`,
          normalizedRestrictionIds);

      const validIds = validRestrictions.map(r => r.restriction_id);
      const invalidIds =
          normalizedRestrictionIds.filter(id => !validIds.includes(id));

      if (invalidIds.length > 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          error: `Invalid restriction_id(s): ${invalidIds.join(', ')}`
        });
      }
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update ceremony_type if provided
      if (ceremony_type !== undefined) {
        await connection.query(
            'UPDATE couple_preferences SET ceremony_type = ? WHERE preference_id = ?',
            [ceremony_type, preferenceId]);
      }

      // Update dietary restrictions if provided
      if (normalizedRestrictionIds !== null) {
        // Remove duplicates
        let uniqueRestrictionIds = [...new Set(normalizedRestrictionIds)];

        // Auto-assign "None" if empty array
        if (uniqueRestrictionIds.length === 0) {
          const [noneRows] = await connection.query(
              'SELECT restriction_id FROM dietary_restriction WHERE restriction_name = ? LIMIT 1',
              ['None']
          );
          if (noneRows.length > 0) {
            uniqueRestrictionIds = [noneRows[0].restriction_id];
          }
        }

        // Delete existing restrictions from junction table
        await connection.query(
            'DELETE FROM couple_preference_restrictions WHERE preference_id = ?',
            [preferenceId]);

        // Insert new restrictions into junction table
        for (const restId of uniqueRestrictionIds) {
          await connection.query(
              'INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES (?, ?)',
              [preferenceId, restId]);
        }
      }

      await connection.commit();
      connection.release();

      res.json({success: true, message: 'Preference updated successfully'});
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      console.error('Transaction error:', transactionError);
      throw transactionError;
    }
  } catch (error) {
    if (connection && !connection._released) {
      connection.release();
    }
    console.error('Error updating preference:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update preference',
      message: error.message,
      code: error.code
    });
  }
});

router.delete('/preferences/:preference_id', async (req, res) => {
  try {
    const preferenceId = req.params.preference_id;

    // Check if preference is used by any weddings
    const [weddingRefs] = await promisePool.query(
        'SELECT COUNT(DISTINCT wedding_id) AS cnt FROM wedding WHERE preference_id = ?',
        [preferenceId]);

    if ((weddingRefs[0]?.cnt || 0) > 0) {
      return res.status(409).json({
        success: false,
        error:
            'Preference is in use by one or more weddings and cannot be deleted'
      });
    }

    const [del] = await promisePool.query(
        'DELETE FROM couple_preferences WHERE preference_id = ?',
        [preferenceId]);

    if (del.affectedRows === 0) {
      return res.status(404).json(
          {success: false, error: 'Preference not found'});
    }

    res.json({success: true, message: 'Preference deleted successfully'});
  } catch (error) {
    console.error('Error deleting preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete preference',
      message: error.message
    });
  }
});

// GET single couple by ID with all preferences
router.get('/:id', async (req, res) => {
  try {
    const [coupleRows] = await promisePool.query(
        'SELECT * FROM couple WHERE couple_id = ?', [req.params.id]);

    if (coupleRows.length === 0) {
      return res.status(404).json({success: false, error: 'Couple not found'});
    }

    // Get preferences with dietary restrictions from junction table
    const [preferenceRows] = await promisePool.query(
        `SELECT 
          cp.preference_id,
          cp.couple_id,
          cp.ceremony_type,
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
          ) as dietaryRestrictions
        FROM couple_preferences cp
        LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
        LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
        WHERE cp.couple_id = ?
        GROUP BY cp.preference_id, cp.couple_id, cp.ceremony_type
        ORDER BY cp.preference_id DESC`,
        [req.params.id]);

    // Parse JSON arrays and filter out null values
    preferences = preferenceRows.map(row => {
      let dietaryRestrictions = [];
      try {
        const parsed = typeof row.dietaryRestrictions === 'string' ?
            JSON.parse(row.dietaryRestrictions) :
            row.dietaryRestrictions;
        dietaryRestrictions = Array.isArray(parsed) ?
            parsed.filter(r => r && r.restriction_id !== null) :
            [];
      } catch (e) {
        console.warn('Error parsing dietaryRestrictions JSON:', e);
        dietaryRestrictions = [];
      }

      return {
        preference_id: row.preference_id,
        couple_id: row.couple_id,
        ceremony_type: row.ceremony_type,
        dietaryRestrictions: dietaryRestrictions
      };
    });

    res.json(
        {success: true, data: {...coupleRows[0], preferences: preferences}});
  } catch (error) {
    console.error('Error fetching couple:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple',
      message: error.message
    });
  }
});

// GET all weddings for a couple
router.get('/:id/weddings', async (req, res) => {
  try {
    // Check if preference_id column exists
    let hasPreferenceColumn = false;
    try {
      const [colCheck] = await promisePool.query(`
        SELECT COUNT(*) as cnt 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'wedding' 
        AND COLUMN_NAME = 'preference_id'
      `);
      hasPreferenceColumn = colCheck[0]?.cnt > 0;
    } catch (e) {
      hasPreferenceColumn = false;
    }

    const preferenceSelect = hasPreferenceColumn ?
        'w.preference_id, cp.preference_id as pref_id,' :
        'NULL as preference_id, NULL as pref_id,';
    const preferenceJoin = hasPreferenceColumn ?
        'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id' :
        'LEFT JOIN couple_preferences cp ON 1=0';
    const groupByFields = hasPreferenceColumn ?
        'w.wedding_id, w.couple_id, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.production_cost, w.payment_status, cp.ceremony_type, w.preference_id, cp.preference_id' :
        'w.wedding_id, w.couple_id, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.production_cost, w.payment_status, cp.ceremony_type';

    const [rows] = await promisePool.query(
        `SELECT 
        w.wedding_id as id,
        w.couple_id,
        w.wedding_date as weddingDate,
        w.wedding_time as weddingTime,
        w.venue,
        w.guest_count as guestCount,
        COALESCE(w.equipment_rental_cost, w.total_cost) as equipmentRentalCost,
        COALESCE(w.food_cost, w.production_cost) as foodCost,
        w.total_cost as totalCost,
        w.production_cost as productionCost,
        w.payment_status as paymentStatus,
        ${preferenceSelect}
        cp.ceremony_type,
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
      FROM wedding w
      ${preferenceJoin}
      LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
      LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
      WHERE w.couple_id = ?
      GROUP BY ${groupByFields}
      ORDER BY w.wedding_date DESC`,
        [req.params.id]);

    // Parse JSON arrays and filter out null values
    const processedRows = rows.map(row => {
      let restrictions = [];
      try {
        const parsed = typeof row.restrictions === 'string' ?
            JSON.parse(row.restrictions) :
            row.restrictions;
        restrictions = Array.isArray(parsed) ?
            parsed.filter(r => r && r.restriction_id !== null) :
            [];
      } catch (e) {
        console.warn('Error parsing restrictions JSON:', e);
        restrictions = [];
      }

      // For backward compatibility, include first restriction fields at top
      // level
      const firstRestriction = restrictions[0] || null;

      return {
        ...row,
        restriction_id: firstRestriction?.restriction_id || null,
        restriction_name: firstRestriction?.restriction_name || null,
        restriction_type: firstRestriction?.restriction_type || null,
        severity_level: firstRestriction?.severity_level || null,
        all_restrictions: restrictions
      };
    });

    res.json({success: true, data: processedRows, count: processedRows.length});
  } catch (error) {
    console.error('Error fetching couple weddings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couple weddings',
      message: error.message
    });
  }
});

// POST create new couple
router.post('/', async (req, res) => {
  try {
    const {
      partner1_name,
      partner2_name,
      partner1_phone,
      partner2_phone,
      partner1_email,
      partner2_email,
      planner_contact
    } = req.body;

    // Validate required fields
    if (!partner1_name || !partner2_name || !partner1_phone ||
        !partner2_phone || !partner1_email || !partner2_email ||
        !planner_contact) {
      return res.status(400).json({
        success: false,
        error:
            'Missing required fields: partner1_name, partner2_name, partner1_phone, partner2_phone, partner1_email, partner2_email, planner_contact'
      });
    }

    const [result] = await promisePool.query(
        `INSERT INTO couple 
       (partner1_name, partner2_name, partner1_phone, partner2_phone, 
        partner1_email, partner2_email, planner_contact) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          partner1_name, partner2_name, partner1_phone, partner2_phone,
          partner1_email, partner2_email, planner_contact
        ]);

    // Fetch the created couple
    const [coupleRows] = await promisePool.query(
        'SELECT * FROM couple WHERE couple_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Couple created successfully',
      data: coupleRows[0]
    });
  } catch (error) {
    console.error('Error creating couple:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create couple',
      message: error.message
    });
  }
});

// PUT update couple
router.put('/:id', async (req, res) => {
  try {
    const {
      partner1_name,
      partner2_name,
      partner1_phone,
      partner2_phone,
      partner1_email,
      partner2_email,
      planner_contact
    } = req.body;

    const [result] = await promisePool.query(
        `UPDATE couple SET 
       partner1_name = ?, partner2_name = ?, partner1_phone = ?, 
       partner2_phone = ?, partner1_email = ?, partner2_email = ?, 
       planner_contact = ? 
       WHERE couple_id = ?`,
        [
          partner1_name, partner2_name, partner1_phone, partner2_phone,
          partner1_email, partner2_email, planner_contact, req.params.id
        ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Couple not found'});
    }

    res.json({success: true, message: 'Couple updated successfully'});
  } catch (error) {
    console.error('Error updating couple:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update couple',
      message: error.message
    });
  }
});

// DELETE couple
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query(
        'DELETE FROM couple WHERE couple_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Couple not found'});
    }

    res.json({success: true, message: 'Couple deleted successfully'});
  } catch (error) {
    console.error('Error deleting couple:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete couple',
      message: error.message
    });
  }
});

module.exports = router;
