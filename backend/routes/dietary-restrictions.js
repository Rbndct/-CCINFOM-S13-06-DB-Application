const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// GET all restrictions with metadata (excluding "None" from display)
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`SELECT 
          dr.restriction_id,
          dr.restriction_name,
          dr.severity_level,
          dr.restriction_type,
          COALESCE(guest_counts.guest_count, 0) as affected_guests,
          COALESCE(menu_counts.menu_count, 0) as menu_items_count,
          COALESCE(pref_counts.preference_count, 0) as couple_preferences_count,
          COALESCE(couple_counts.couple_count, 0) as affected_couples
        FROM dietary_restriction dr
        LEFT JOIN (
          SELECT restriction_id, COUNT(DISTINCT guest_id) as guest_count
          FROM (
            SELECT restriction_id, guest_id
            FROM guest
            WHERE restriction_id IS NOT NULL
            UNION
            SELECT restriction_id, guest_id
            FROM guest_restrictions
          ) combined_guests
          GROUP BY restriction_id
        ) guest_counts ON dr.restriction_id = guest_counts.restriction_id
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as menu_count
          FROM menu_item
          WHERE restriction_id IS NOT NULL
          GROUP BY restriction_id
        ) menu_counts ON dr.restriction_id = menu_counts.restriction_id
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as preference_count
          FROM couple_preference_restrictions
          GROUP BY restriction_id
        ) pref_counts ON dr.restriction_id = pref_counts.restriction_id
        LEFT JOIN (
          SELECT cpr.restriction_id, COUNT(DISTINCT cp.couple_id) as couple_count
          FROM couple_preference_restrictions cpr
          INNER JOIN couple_preferences cp ON cpr.preference_id = cp.preference_id
          GROUP BY cpr.restriction_id
        ) couple_counts ON dr.restriction_id = couple_counts.restriction_id
        WHERE dr.restriction_name != 'None'
        ORDER BY dr.restriction_id DESC`);
    res.json({success: true, data: rows, count: rows.length});
  } catch (error) {
    console.error('Error fetching dietary restrictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dietary restrictions',
      message: error.message
    });
  }
});

// GET restriction by id with metadata and details
router.get('/:restriction_id', async (req, res) => {
  try {
    const restrictionId = req.params.restriction_id;
    const [rows] = await promisePool.query(
        `SELECT 
          dr.restriction_id,
          dr.restriction_name,
          dr.severity_level,
          dr.restriction_type,
          COALESCE(guest_counts.guest_count, 0) as affected_guests,
          COALESCE(menu_counts.menu_count, 0) as menu_items_count,
          COALESCE(pref_counts.preference_count, 0) as couple_preferences_count,
          COALESCE(couple_counts.couple_count, 0) as affected_couples
        FROM dietary_restriction dr
        LEFT JOIN (
          SELECT restriction_id, COUNT(DISTINCT guest_id) as guest_count
          FROM (
            SELECT restriction_id, guest_id
            FROM guest
            WHERE restriction_id = ?
            UNION
            SELECT restriction_id, guest_id
            FROM guest_restrictions
            WHERE restriction_id = ?
          ) combined_guests
          GROUP BY restriction_id
        ) guest_counts ON dr.restriction_id = guest_counts.restriction_id
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as menu_count
          FROM menu_item
          WHERE restriction_id = ?
          GROUP BY restriction_id
        ) menu_counts ON dr.restriction_id = menu_counts.restriction_id
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as preference_count
          FROM couple_preference_restrictions
          WHERE restriction_id = ?
          GROUP BY restriction_id
        ) pref_counts ON dr.restriction_id = pref_counts.restriction_id
        LEFT JOIN (
          SELECT cpr.restriction_id, COUNT(DISTINCT cp.couple_id) as couple_count
          FROM couple_preference_restrictions cpr
          INNER JOIN couple_preferences cp ON cpr.preference_id = cp.preference_id
          WHERE cpr.restriction_id = ?
          GROUP BY cpr.restriction_id
        ) couple_counts ON dr.restriction_id = couple_counts.restriction_id
        WHERE dr.restriction_id = ?`,
        [
          restrictionId, restrictionId, restrictionId, restrictionId,
          restrictionId, restrictionId
        ]);

    if (rows.length === 0) {
      return res.status(404).json(
          {success: false, error: 'Dietary restriction not found'});
    }

    // Get affected guest names (from both sources)
    const [guestRows] = await promisePool.query(
        `SELECT DISTINCT g.guest_id, g.guest_name, w.wedding_id, w.wedding_date, c.partner1_name, c.partner2_name
         FROM (
           SELECT guest_id, restriction_id
           FROM guest
           WHERE restriction_id = ?
           UNION
           SELECT guest_id, restriction_id
           FROM guest_restrictions
           WHERE restriction_id = ?
         ) combined
         INNER JOIN guest g ON combined.guest_id = g.guest_id
         INNER JOIN wedding w ON g.wedding_id = w.wedding_id
         INNER JOIN couple c ON w.couple_id = c.couple_id
         ORDER BY w.wedding_date DESC, g.guest_name`,
        [restrictionId, restrictionId]);

    // Get affected menu items
    const [menuRows] = await promisePool.query(
        `SELECT menu_item_id, menu_name as item_name, menu_type as category, selling_price as price
         FROM menu_item
         WHERE restriction_id = ?
         ORDER BY menu_type, menu_name`,
        [restrictionId]);

    // Get affected couples list
    const [coupleRows] = await promisePool.query(
        `SELECT DISTINCT c.couple_id, c.partner1_name, c.partner2_name, 
                COUNT(DISTINCT cp.preference_id) as preference_count
         FROM couple_preference_restrictions cpr
         INNER JOIN couple_preferences cp ON cpr.preference_id = cp.preference_id
         INNER JOIN couple c ON cp.couple_id = c.couple_id
         WHERE cpr.restriction_id = ?
         GROUP BY c.couple_id, c.partner1_name, c.partner2_name
         ORDER BY c.partner1_name, c.partner2_name`,
        [restrictionId]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        affected_guests_list: guestRows,
        affected_menu_items: menuRows,
        affected_couples_list: coupleRows
      }
    });
  } catch (error) {
    console.error('Error fetching dietary restriction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dietary restriction',
      message: error.message
    });
  }
});

// CREATE restriction
router.post('/', async (req, res) => {
  try {
    const {restriction_name, severity_level, restriction_type} = req.body;
    if (!restriction_name || !severity_level || !restriction_type) {
      return res.status(400).json({
        success: false,
        error:
            'Missing required fields: restriction_name, severity_level, restriction_type'
      });
    }
    const [ins] = await promisePool.query(
        'INSERT INTO dietary_restriction (restriction_name, severity_level, restriction_type) VALUES (?, ?, ?)',
        [restriction_name, severity_level, restriction_type]);
    res.status(201).json({
      success: true,
      message: 'Dietary restriction created',
      data: {
        restriction_id: ins.insertId,
        restriction_name,
        severity_level,
        restriction_type
      }
    });
  } catch (error) {
    console.error('Error creating dietary restriction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dietary restriction',
      message: error.message
    });
  }
});

// UPDATE restriction
router.put('/:restriction_id', async (req, res) => {
  try {
    const {restriction_name, severity_level, restriction_type} = req.body;
    const [upd] = await promisePool.query(
        `UPDATE dietary_restriction SET 
        restriction_name = COALESCE(?, restriction_name),
        severity_level = COALESCE(?, severity_level),
        restriction_type = COALESCE(?, restriction_type)
      WHERE restriction_id = ?`,
        [
          restriction_name ?? null, severity_level ?? null,
          restriction_type ?? null, req.params.restriction_id
        ]);
    if (upd.affectedRows === 0) {
      return res.status(404).json(
          {success: false, error: 'Dietary restriction not found'});
    }
    res.json({success: true, message: 'Dietary restriction updated'});
  } catch (error) {
    console.error('Error updating dietary restriction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dietary restriction',
      message: error.message
    });
  }
});

// DELETE restriction (guard on FK references)
router.delete('/:restriction_id', async (req, res) => {
  try {
    const restrictionId = req.params.restriction_id;
    const [refs] = await promisePool.query(
        `SELECT 
        (SELECT COUNT(*) FROM guest WHERE restriction_id = ?) AS guest_refs,
        (SELECT COUNT(*) FROM couple_preference_restrictions WHERE restriction_id = ?) AS pref_refs,
        (SELECT COUNT(*) FROM menu_item WHERE restriction_id = ?) AS menu_refs`,
        [restrictionId, restrictionId, restrictionId]);
    const {guest_refs, pref_refs, menu_refs} = refs[0];
    if ((guest_refs || 0) > 0 || (pref_refs || 0) > 0 || (menu_refs || 0) > 0) {
      return res.status(409).json(
          {success: false, error: 'Restriction in use and cannot be deleted'});
    }

    const [del] = await promisePool.query(
        'DELETE FROM dietary_restriction WHERE restriction_id = ?',
        [restrictionId]);
    if (del.affectedRows === 0) {
      return res.status(404).json(
          {success: false, error: 'Dietary restriction not found'});
    }
    res.json({success: true, message: 'Dietary restriction deleted'});
  } catch (error) {
    console.error('Error deleting dietary restriction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dietary restriction',
      message: error.message
    });
  }
});

module.exports = router;
