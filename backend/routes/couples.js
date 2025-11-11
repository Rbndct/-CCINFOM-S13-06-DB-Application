const express = require('express');
const router = express.Router();
const {promisePool} = require('../db');

// GET all couples with wedding count and latest preference
router.get('/', async (req, res) => {
  try {
    const {ceremony_type, restriction_type, planner_contact} = req.query;

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
    if (restriction_type) {
      whereClauses.push('dr.restriction_type = ?');
      params.push(restriction_type);
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
        COUNT(w.wedding_id) AS wedding_count,
        MAX(w.wedding_date) AS last_wedding,
        cp.preference_id,
        cp.ceremony_type,
        cp.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
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
      LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
      ${whereSql}
      GROUP BY c.couple_id
      ORDER BY c.couple_id DESC
    `,
        params);
    res.json({success: true, data: rows, count: rows.length});
  } catch (error) {
    console.error('Error fetching couples:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch couples',
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

    const [preferenceRows] = await promisePool.query(
        `SELECT cp.*, dr.restriction_name, dr.restriction_type, dr.severity_level
       FROM couple_preferences cp
       LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
       WHERE cp.couple_id = ?
       ORDER BY cp.preference_id DESC`,
        [req.params.id]);

    res.json(
        {success: true, data: {...coupleRows[0], preferences: preferenceRows}});
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

    const [rows] = await promisePool.query(
        `SELECT 
        w.wedding_id as id,
        w.couple_id,
        w.wedding_date as weddingDate,
        w.wedding_time as weddingTime,
        w.venue,
        w.guest_count as guestCount,
        w.total_cost as totalCost,
        w.production_cost as productionCost,
        w.payment_status as paymentStatus,
        ${preferenceSelect}
        cp.ceremony_type,
        cp.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
      FROM wedding w
      ${preferenceJoin}
      LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
      WHERE w.couple_id = ?
      ORDER BY w.wedding_date DESC`,
        [req.params.id]);

    res.json({success: true, data: rows, count: rows.length});
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

// Preferences CRUD
router.post('/preferences', async (req, res) => {
  try {
    const {couple_id, ceremony_type, restriction_id} = req.body;

    if (!couple_id || !ceremony_type || !restriction_id) {
      return res.status(400).json({
        success: false,
        error:
            'Missing required fields: couple_id, ceremony_type, restriction_id'
      });
    }

    const [r] = await promisePool.query(
        'SELECT 1 FROM dietary_restriction WHERE restriction_id = ? LIMIT 1',
        [restriction_id]);
    if (r.length === 0) {
      return res.status(400).json(
          {success: false, error: 'Invalid restriction_id'});
    }

    const [ins] = await promisePool.query(
        'INSERT INTO couple_preferences (couple_id, ceremony_type, restriction_id) VALUES (?, ?, ?)',
        [couple_id, ceremony_type, restriction_id]);

    res.status(201).json({
      success: true,
      message: 'Preference created successfully',
      data: {
        preference_id: ins.insertId,
        couple_id,
        ceremony_type,
        restriction_id
      }
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create preference',
      message: error.message
    });
  }
});

router.put('/preferences/:preference_id', async (req, res) => {
  try {
    const {ceremony_type, restriction_id} = req.body;

    if (restriction_id) {
      const [r] = await promisePool.query(
          'SELECT 1 FROM dietary_restriction WHERE restriction_id = ? LIMIT 1',
          [restriction_id]);
      if (r.length === 0) {
        return res.status(400).json(
            {success: false, error: 'Invalid restriction_id'});
      }
    }

    const [upd] = await promisePool.query(
        `UPDATE couple_preferences SET 
        ceremony_type = COALESCE(?, ceremony_type),
        restriction_id = COALESCE(?, restriction_id)
      WHERE preference_id = ?`,
        [
          ceremony_type ?? null, restriction_id ?? null,
          req.params.preference_id
        ]);

    if (upd.affectedRows === 0) {
      return res.status(404).json(
          {success: false, error: 'Preference not found'});
    }

    res.json({success: true, message: 'Preference updated successfully'});
  } catch (error) {
    console.error('Error updating preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preference',
      message: error.message
    });
  }
});

router.get('/preferences/:couple_id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
        `SELECT cp.*, dr.restriction_name, dr.restriction_type, dr.severity_level
       FROM couple_preferences cp
       LEFT JOIN dietary_restriction dr ON cp.restriction_id = dr.restriction_id
       WHERE cp.couple_id = ?
       ORDER BY cp.preference_id DESC`,
        [req.params.couple_id]);
    res.json({success: true, data: rows, count: rows.length});
  } catch (error) {
    console.error('Error listing preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list preferences',
      message: error.message
    });
  }
});

router.delete('/preferences/:preference_id', async (req, res) => {
  try {
    const preferenceId = req.params.preference_id;

    // Check if preference is used by any weddings
    const [weddingRefs] = await promisePool.query(
        'SELECT COUNT(*) AS cnt FROM wedding WHERE preference_id = ?',
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
