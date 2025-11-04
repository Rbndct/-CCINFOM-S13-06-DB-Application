const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// GET all couples with wedding count
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        c.couple_id,
        c.partner1_name,
        c.partner2_name,
        c.partner1_phone,
        c.partner2_phone,
        c.partner1_email,
        c.partner2_email,
        c.planner_contact,
        COUNT(w.wedding_id) as wedding_count,
        MAX(w.wedding_date) as last_wedding
      FROM couple c
      LEFT JOIN wedding w ON c.couple_id = w.couple_id
      GROUP BY c.couple_id
      ORDER BY c.couple_id DESC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching couples:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch couples',
      message: error.message 
    });
  }
});

// GET single couple by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM couple WHERE couple_id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Couple not found' 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching couple:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch couple',
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
    
    const [result] = await promisePool.query(
      `INSERT INTO couple 
       (partner1_name, partner2_name, partner1_phone, partner2_phone, 
        partner1_email, partner2_email, planner_contact) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [partner1_name, partner2_name, partner1_phone, partner2_phone, 
       partner1_email, partner2_email, planner_contact]
    );
    
    res.status(201).json({
      success: true,
      message: 'Couple created successfully',
      data: {
        couple_id: result.insertId,
        partner1_name,
        partner2_name,
        partner1_phone,
        partner2_phone,
        partner1_email,
        partner2_email,
        planner_contact
      }
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
      [partner1_name, partner2_name, partner1_phone, partner2_phone, 
       partner1_email, partner2_email, planner_contact, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Couple not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Couple updated successfully'
    });
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
      'DELETE FROM couple WHERE couple_id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Couple not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Couple deleted successfully'
    });
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

