const express = require('express');
const router = express.Router();
const {promisePool} = require('../db');

// GET all restrictions
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
        'SELECT * FROM dietary_restriction ORDER BY restriction_id DESC');
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

// GET restriction by id
router.get('/:restriction_id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
        'SELECT * FROM dietary_restriction WHERE restriction_id = ?',
        [req.params.restriction_id]);
    if (rows.length === 0) {
      return res.status(404).json(
          {success: false, error: 'Dietary restriction not found'});
    }
    res.json({success: true, data: rows[0]});
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
        (SELECT COUNT(*) FROM couple_preferences WHERE restriction_id = ?) AS pref_refs,
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
