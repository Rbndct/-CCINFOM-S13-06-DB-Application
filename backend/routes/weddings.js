const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// GET all weddings with couple information
router.get('/', async (req, res) => {
  try {
    const { date_from, date_to, venue, ceremony_type, planner_contact, has_restrictions } = req.query;

    const whereClauses = [];
    const params = [];

    if (date_from) { whereClauses.push('w.wedding_date >= ?'); params.push(date_from); }
    if (date_to) { whereClauses.push('w.wedding_date <= ?'); params.push(date_to); }
    if (venue) { whereClauses.push('w.venue LIKE ?'); params.push(`%${venue}%`); }
    if (planner_contact) { whereClauses.push('c.planner_contact LIKE ?'); params.push(`%${planner_contact}%`); }
    if (ceremony_type) { whereClauses.push('cp.ceremony_type = ?'); params.push(ceremony_type); }
    if (has_restrictions === 'Y') {
      whereClauses.push(`(
        EXISTS (SELECT 1 FROM guest g WHERE g.wedding_id = w.wedding_id AND g.restriction_id IS NOT NULL)
        OR EXISTS (
          SELECT 1 FROM couple_preferences cp2 WHERE cp2.couple_id = c.couple_id AND cp2.restriction_id IS NOT NULL
        )
      )`);
    } else if (has_restrictions === 'N') {
      whereClauses.push(`(
        NOT EXISTS (SELECT 1 FROM guest g WHERE g.wedding_id = w.wedding_id AND g.restriction_id IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1 FROM couple_preferences cp2 WHERE cp2.couple_id = c.couple_id AND cp2.restriction_id IS NOT NULL
        )
      )`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

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

    const preferenceSelect = hasPreferenceColumn 
      ? 'w.preference_id, cp.preference_id as pref_id,'
      : 'NULL as preference_id, NULL as pref_id,';
    const preferenceJoin = hasPreferenceColumn
      ? 'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id'
      : 'LEFT JOIN couple_preferences cp ON 1=0';

    const [rows] = await promisePool.query(`
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
        w.total_cost as totalCost,
        w.production_cost as productionCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
        ${preferenceSelect}
        cp.ceremony_type,
        cp.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${preferenceJoin}
      LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
      LEFT JOIN (
        SELECT x.* FROM couple_preferences x
        INNER JOIN (
          SELECT couple_id, MAX(preference_id) AS max_pref
          FROM couple_preferences
          GROUP BY couple_id
        ) t ON x.couple_id = t.couple_id AND x.preference_id = t.max_pref
      ) cp2 ON cp2.couple_id = c.couple_id
      ${whereSql}
      ORDER BY w.wedding_date DESC
    `, params);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
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

    const preferenceSelect = hasPreferenceColumn 
      ? 'w.preference_id, cp.preference_id as pref_id,'
      : 'NULL as preference_id, NULL as pref_id,';
    const preferenceJoin = hasPreferenceColumn
      ? 'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id'
      : 'LEFT JOIN couple_preferences cp ON 1=0';

    const [rows] = await promisePool.query(`
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
        w.total_cost as totalCost,
        w.production_cost as productionCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
        ${preferenceSelect}
        cp.ceremony_type,
        cp.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${preferenceJoin}
      LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
      WHERE w.wedding_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found' 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
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
      total_cost, 
      production_cost, 
      payment_status,
      preference_id
    } = req.body;

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
        [preference_id]
      );
      if (prefCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid preference_id'
        });
      }
      if (prefCheck[0].couple_id !== parseInt(couple_id)) {
        return res.status(400).json({
          success: false,
          error: 'Preference does not belong to the selected couple'
        });
      }
    } else if (preference_id && !hasPreferenceColumn) {
      console.warn('preference_id provided but column does not exist. Run migration to add column.');
    }
    
    const preferenceFields = hasPreferenceColumn ? ', preference_id' : '';
    const preferenceValues = hasPreferenceColumn ? ', ?' : '';
    const insertParams = hasPreferenceColumn
      ? [couple_id, wedding_date, wedding_time, venue, 
         guest_count || 0, total_cost || 0, production_cost || 0, 
         payment_status || 'pending', preference_id || null]
      : [couple_id, wedding_date, wedding_time, venue, 
         guest_count || 0, total_cost || 0, production_cost || 0, 
         payment_status || 'pending'];
    
    const [result] = await promisePool.query(
      `INSERT INTO wedding 
       (couple_id, wedding_date, wedding_time, venue, guest_count, 
        total_cost, production_cost, payment_status${preferenceFields}) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?${preferenceValues})`,
      insertParams
    );
    
    // Fetch the created wedding with couple info and preference
    const prefSelect = hasPreferenceColumn 
      ? 'w.preference_id, cp.preference_id as pref_id,'
      : 'NULL as preference_id, NULL as pref_id,';
    const prefJoin = hasPreferenceColumn
      ? 'LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id'
      : 'LEFT JOIN couple_preferences cp ON 1=0';
    
    const [weddingRows] = await promisePool.query(`
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
        w.total_cost as totalCost,
        w.production_cost as productionCost,
        w.payment_status as paymentStatus,
        c.planner_contact as plannerContact,
        ${prefSelect}
        cp.ceremony_type,
        cp.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ${prefJoin}
      LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
      WHERE w.wedding_id = ?
    `, [result.insertId]);
    
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
      total_cost, 
      production_cost, 
      payment_status,
      preference_id,
      couple_id
    } = req.body;

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
      'SELECT couple_id FROM wedding WHERE wedding_id = ?',
      [req.params.id]
    );
    if (currentWedding.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }
    const currentCoupleId = currentWedding[0].couple_id;
    const targetCoupleId = couple_id || currentCoupleId;

    // Validate preference_id belongs to couple_id if provided
    if (preference_id && hasPreferenceColumn) {
      const [prefCheck] = await promisePool.query(
        'SELECT couple_id FROM couple_preferences WHERE preference_id = ?',
        [preference_id]
      );
      if (prefCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid preference_id'
        });
      }
      if (prefCheck[0].couple_id !== parseInt(targetCoupleId)) {
        return res.status(400).json({
          success: false,
          error: 'Preference does not belong to the selected couple'
        });
      }
    } else if (preference_id && !hasPreferenceColumn) {
      console.warn('preference_id provided but column does not exist. Run migration to add column.');
    }
    
    const preferenceUpdate = hasPreferenceColumn 
      ? 'preference_id = ?,'
      : '';
    const updateParams = hasPreferenceColumn
      ? [wedding_date, wedding_time, venue, guest_count, 
         total_cost, production_cost, payment_status, preference_id || null, couple_id, req.params.id]
      : [wedding_date, wedding_time, venue, guest_count, 
         total_cost, production_cost, payment_status, couple_id, req.params.id];
    
    const [result] = await promisePool.query(
      `UPDATE wedding SET 
       wedding_date = COALESCE(?, wedding_date), 
       wedding_time = COALESCE(?, wedding_time), 
       venue = COALESCE(?, venue), 
       guest_count = COALESCE(?, guest_count), 
       total_cost = COALESCE(?, total_cost), 
       production_cost = COALESCE(?, production_cost), 
       payment_status = COALESCE(?, payment_status),
       ${preferenceUpdate}
       couple_id = COALESCE(?, couple_id)
       WHERE wedding_id = ?`,
      updateParams
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Wedding updated successfully'
    });
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
      'DELETE FROM wedding WHERE wedding_id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Wedding deleted successfully'
    });
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
