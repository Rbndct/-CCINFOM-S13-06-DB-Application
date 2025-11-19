const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// GET all weddings with couple information
router.get('/', async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      venue,
      ceremony_type,
      planner_contact,
      has_restrictions
    } = req.query;

    const whereClauses = [];
    const params = [];

    if (date_from) {
      whereClauses.push('w.wedding_date >= ?');
      params.push(date_from);
    }
    if (date_to) {
      whereClauses.push('w.wedding_date <= ?');
      params.push(date_to);
    }
    if (venue) {
      whereClauses.push('w.venue LIKE ?');
      params.push(`%${venue}%`);
    }
    if (planner_contact) {
      whereClauses.push('c.planner_contact LIKE ?');
      params.push(`%${planner_contact}%`);
    }
    if (ceremony_type) {
      whereClauses.push('cp.ceremony_type = ?');
      params.push(ceremony_type);
    }
    if (has_restrictions === 'Y') {
      whereClauses.push(`(
        EXISTS (SELECT 1 FROM guest g WHERE g.wedding_id = w.wedding_id AND g.restriction_id IS NOT NULL)
        OR EXISTS (
          SELECT 1 FROM couple_preferences cp2 
          INNER JOIN couple_preference_restrictions cpr2 ON cp2.preference_id = cpr2.preference_id
          WHERE cp2.couple_id = c.couple_id
        )
      )`);
    } else if (has_restrictions === 'N') {
      whereClauses.push(`(
        NOT EXISTS (SELECT 1 FROM guest g WHERE g.wedding_id = w.wedding_id AND g.restriction_id IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1 FROM couple_preferences cp2 
          INNER JOIN couple_preference_restrictions cpr2 ON cp2.preference_id = cpr2.preference_id
          WHERE cp2.couple_id = c.couple_id
        )
      )`);
    }

    const whereSql =
        whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

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
      // If check fails, assume column doesn't exist
      hasPreferenceColumn = false;
    }

    const preferenceSelect = hasPreferenceColumn ?
        'w.preference_id, cp.preference_id as pref_id,' :
        'NULL as preference_id, NULL as pref_id,';
    const preferenceJoin = hasPreferenceColumn ?
        'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id' :
        'LEFT JOIN couple_preferences cp ON 1=0';
    const groupByFields = hasPreferenceColumn ?
        'w.wedding_id, w.couple_id, c.partner1_name, c.partner2_name, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.payment_status, c.planner_contact, cp.ceremony_type, w.preference_id, cp.preference_id' :
        'w.wedding_id, w.couple_id, c.partner1_name, c.partner2_name, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.payment_status, c.planner_contact, cp.ceremony_type';

    const [rows] = await promisePool.query(
        `
      SELECT 
        w.wedding_id as id,
        w.couple_id,
        CONCAT(c.partner1_name, ' & ', c.partner2_name) as couple,
        c.partner1_name as partner1,
        c.partner2_name as partner2,
        w.wedding_date as weddingDate,
        w.wedding_time as weddingTime,
        w.venue,
        w.guest_count as guestCount,
        (SELECT COUNT(*) FROM guest g WHERE g.wedding_id = w.wedding_id) as actualGuestCount,
        (SELECT COUNT(*) FROM seating_table st WHERE st.wedding_id = w.wedding_id) as tableCount,
        w.equipment_rental_cost as equipmentRentalCost,
        w.food_cost as foodCost,
        w.total_cost as totalCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
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
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${preferenceJoin}
      LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
      LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
      ${whereSql}
      GROUP BY ${groupByFields}
      ORDER BY w.wedding_date DESC
    `,
        params);

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
    console.error('Error fetching weddings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weddings',
      message: error.message
    });
  }
});

// GET single wedding by ID with couple information and preference
router.get('/:id', async (req, res) => {
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
        'w.wedding_id, w.couple_id, c.partner1_name, c.partner2_name, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.payment_status, c.planner_contact, cp.ceremony_type, w.preference_id, cp.preference_id' :
        'w.wedding_id, w.couple_id, c.partner1_name, c.partner2_name, w.wedding_date, w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, w.payment_status, c.planner_contact, cp.ceremony_type';

    const [rows] = await promisePool.query(
        `
      SELECT 
        w.wedding_id as id,
        w.couple_id,
        CONCAT(c.partner1_name, ' & ', c.partner2_name) as couple,
        c.partner1_name as partner1,
        c.partner2_name as partner2,
        w.wedding_date as weddingDate,
        w.wedding_time as weddingTime,
        w.venue,
        w.guest_count as guestCount,
        (SELECT COUNT(*) FROM guest g WHERE g.wedding_id = w.wedding_id) as actualGuestCount,
        (SELECT COUNT(*) FROM seating_table st WHERE st.wedding_id = w.wedding_id) as tableCount,
        w.equipment_rental_cost as equipmentRentalCost,
        w.food_cost as foodCost,
        w.total_cost as totalCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
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
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${preferenceJoin}
      LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
      LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
      WHERE w.wedding_id = ?
      GROUP BY ${groupByFields}
    `,
        [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({success: false, error: 'Wedding not found'});
    }

    // Parse JSON arrays and filter out null values
    const row = rows[0];
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

    // For backward compatibility, include first restriction fields at top level
    const firstRestriction = restrictions[0] || null;

    const processedData = {
      ...row,
      restriction_id: firstRestriction?.restriction_id || null,
      restriction_name: firstRestriction?.restriction_name || null,
      restriction_type: firstRestriction?.restriction_type || null,
      severity_level: firstRestriction?.severity_level || null,
      all_restrictions: restrictions
    };

    res.json({success: true, data: processedData});
  } catch (error) {
    console.error('Error fetching wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wedding',
      message: error.message
    });
  }
});

// POST create new wedding
router.post('/', async (req, res) => {
  try {
    const {
      couple_id,
      wedding_date,
      wedding_time,
      venue,
      guest_count,
      equipment_rental_cost,
      food_cost,
      total_cost,
      payment_status,
      preference_id
    } = req.body;
    
    // Use provided values or default to 0
    const finalEquipmentRentalCost = equipment_rental_cost !== undefined ? equipment_rental_cost : 0;
    const finalFoodCost = food_cost !== undefined ? food_cost : 0;
    const finalTotalCost = total_cost !== undefined ? total_cost : (finalEquipmentRentalCost + finalFoodCost);

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

    // Validate preference_id belongs to couple_id if provided
    if (preference_id && hasPreferenceColumn) {
      const [prefCheck] = await promisePool.query(
          'SELECT couple_id FROM couple_preferences WHERE preference_id = ?',
          [preference_id]);
      if (prefCheck.length === 0) {
        return res.status(400).json(
            {success: false, error: 'Invalid preference_id'});
      }
      if (prefCheck[0].couple_id !== parseInt(couple_id)) {
        return res.status(400).json({
          success: false,
          error: 'Preference does not belong to the selected couple'
        });
      }
    } else if (preference_id && !hasPreferenceColumn) {
      console.warn(
          'preference_id provided but column does not exist. Run migration to add column.');
    }

    const preferenceFields = hasPreferenceColumn ? ', preference_id' : '';
    const preferenceValues = hasPreferenceColumn ? ', ?' : '';
    const insertParams = hasPreferenceColumn ?
        [
          couple_id, wedding_date, wedding_time, venue, guest_count || 0,
          finalEquipmentRentalCost || 0, finalFoodCost || 0,
          finalTotalCost || 0,
          payment_status || 'pending',
          preference_id || null
        ] :
        [
          couple_id, wedding_date, wedding_time, venue, guest_count || 0,
          finalEquipmentRentalCost || 0, finalFoodCost || 0,
          finalTotalCost || 0,
          payment_status || 'pending'
        ];

    const [result] = await promisePool.query(
        `INSERT INTO wedding 
       (couple_id, wedding_date, wedding_time, venue, guest_count, 
        equipment_rental_cost, food_cost, total_cost, payment_status${preferenceFields}) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?${preferenceValues})`,
        insertParams);

    // Fetch the created wedding with couple info and preference
    const prefSelect = hasPreferenceColumn ?
        'w.preference_id, cp.preference_id as pref_id,' :
        'NULL as preference_id, NULL as pref_id,';
    const prefJoin = hasPreferenceColumn ?
        'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id' :
        'LEFT JOIN couple_preferences cp ON 1=0';

    const [weddingRows] = await promisePool.query(
        `
      SELECT 
        w.wedding_id as id,
        w.couple_id,
        CONCAT(c.partner1_name, ' & ', c.partner2_name) as couple,
        c.partner1_name as partner1,
        c.partner2_name as partner2,
        w.wedding_date as weddingDate,
        w.wedding_time as weddingTime,
        w.venue,
        w.guest_count as guestCount,
        w.equipment_rental_cost as equipmentRentalCost,
        w.food_cost as foodCost,
        w.total_cost as totalCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
        ${prefSelect}
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
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${prefJoin}
      LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
      LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
      WHERE w.wedding_id = ?
      GROUP BY w.wedding_id, w.couple_id, c.partner1_name, c.partner2_name, w.wedding_date, 
               w.wedding_time, w.venue, w.guest_count, w.equipment_rental_cost, w.food_cost, w.total_cost, 
               w.payment_status, c.planner_contact, cp.ceremony_type
    `,
        [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Wedding created successfully',
      data: weddingRows[0]
    });
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create wedding',
      message: error.message
    });
  }
});

// PUT update wedding
router.put('/:id', async (req, res) => {
  try {
    const {
      wedding_date,
      wedding_time,
      venue,
      guest_count,
      equipment_rental_cost,
      food_cost,
      total_cost,
      payment_status,
      preference_id,
      couple_id
    } = req.body;
    
    // Use provided values, but note that equipment_rental_cost and food_cost are calculated fields
    // They should not be manually set - they're updated by updateWeddingCosts()
    // total_cost is also calculated as equipment_rental_cost + food_cost

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

    // Get current wedding to check couple_id
    const [currentWedding] = await promisePool.query(
        'SELECT couple_id FROM wedding WHERE wedding_id = ?', [req.params.id]);
    if (currentWedding.length === 0) {
      return res.status(404).json({success: false, error: 'Wedding not found'});
    }
    const currentCoupleId = currentWedding[0].couple_id;
    const targetCoupleId = couple_id || currentCoupleId;

    // Validate preference_id belongs to couple_id if provided
    if (preference_id && hasPreferenceColumn) {
      const [prefCheck] = await promisePool.query(
          'SELECT couple_id FROM couple_preferences WHERE preference_id = ?',
          [preference_id]);
      if (prefCheck.length === 0) {
        return res.status(400).json(
            {success: false, error: 'Invalid preference_id'});
      }
      if (prefCheck[0].couple_id !== parseInt(targetCoupleId)) {
        return res.status(400).json({
          success: false,
          error: 'Preference does not belong to the selected couple'
        });
      }
    } else if (preference_id && !hasPreferenceColumn) {
      console.warn(
          'preference_id provided but column does not exist. Run migration to add column.');
    }

    const preferenceUpdate = hasPreferenceColumn ? 'preference_id = ?,' : '';
    const updateParams = hasPreferenceColumn ?
        [
          wedding_date, wedding_time, venue, guest_count, total_cost,
          payment_status, preference_id || null, couple_id,
          req.params.id
        ] :
        [
          wedding_date, wedding_time, venue, guest_count, total_cost,
          payment_status, couple_id, req.params.id
        ];

    const [result] = await promisePool.query(
        `UPDATE wedding SET 
       wedding_date = COALESCE(?, wedding_date), 
       wedding_time = COALESCE(?, wedding_time), 
       venue = COALESCE(?, venue), 
       guest_count = COALESCE(?, guest_count), 
       total_cost = COALESCE(?, total_cost), 
       payment_status = COALESCE(?, payment_status),
       ${preferenceUpdate}
       couple_id = COALESCE(?, couple_id)
       WHERE wedding_id = ?`,
        updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Wedding not found'});
    }

    res.json({success: true, message: 'Wedding updated successfully'});
  } catch (error) {
    console.error('Error updating wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wedding',
      message: error.message
    });
  }
});

// DELETE wedding
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query(
        'DELETE FROM wedding WHERE wedding_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({success: false, error: 'Wedding not found'});
    }

    res.json({success: true, message: 'Wedding deleted successfully'});
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete wedding',
      message: error.message
    });
  }
});

module.exports = router;
