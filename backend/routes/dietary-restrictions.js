const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// GET all restrictions with metadata
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`SELECT 
          dr.restriction_id,
          dr.restriction_name,
          dr.severity_level,
          dr.restriction_type,
          COALESCE(guest_counts.guest_count, 0) as affected_guests,
          COALESCE(menu_counts.menu_count, 0) as menu_items_count,
          COALESCE(pref_counts.preference_count, 0) as couple_preferences_count
        FROM dietary_restriction dr
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as guest_count
          FROM guest
          WHERE restriction_id IS NOT NULL
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
    const [rows] = await promisePool.query(
        `SELECT 
          dr.restriction_id,
          dr.restriction_name,
          dr.severity_level,
          dr.restriction_type,
          COALESCE(guest_counts.guest_count, 0) as affected_guests,
          COALESCE(menu_counts.menu_count, 0) as menu_items_count,
          COALESCE(pref_counts.preference_count, 0) as couple_preferences_count
        FROM dietary_restriction dr
        LEFT JOIN (
          SELECT restriction_id, COUNT(*) as guest_count
          FROM guest
          WHERE restriction_id = ?
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
        WHERE dr.restriction_id = ?`,
        [
          req.params.restriction_id, req.params.restriction_id,
          req.params.restriction_id, req.params.restriction_id
        ]);

    if (rows.length === 0) {
      return res.status(404).json(
          {success: false, error: 'Dietary restriction not found'});
    }

    // Get affected guest names
    const [guestRows] = await promisePool.query(
        `SELECT g.guest_id, g.guest_name, w.wedding_id, w.wedding_date, c.partner1_name, c.partner2_name
         FROM guest g
         INNER JOIN wedding w ON g.wedding_id = w.wedding_id
         INNER JOIN couple c ON w.couple_id = c.couple_id
         WHERE g.restriction_id = ?
         ORDER BY w.wedding_date DESC, g.guest_name`,
        [req.params.restriction_id]);

    // Get affected menu items
    const [menuRows] = await promisePool.query(
        `SELECT menu_item_id, item_name, category, price
         FROM menu_item
         WHERE restriction_id = ?
         ORDER BY category, item_name`,
        [req.params.restriction_id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        affected_guests_list: guestRows,
        affected_menu_items: menuRows
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
