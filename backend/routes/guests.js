const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// GET all guests
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM guests ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
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
      'SELECT * FROM guests WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Guest not found' 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
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
  try {
    const { name, email, phone, wedding_id, rsvp_status, plus_one } = req.body;
    
    const [result] = await promisePool.query(
      'INSERT INTO guests (name, email, phone, wedding_id, rsvp_status, plus_one) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, wedding_id, rsvp_status || 'pending', plus_one || false]
    );
    
    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        phone,
        wedding_id,
        rsvp_status: rsvp_status || 'pending',
        plus_one: plus_one || false
      }
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create guest',
      message: error.message 
    });
  }
});

// PUT update guest
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, rsvp_status, plus_one } = req.body;
    
    const [result] = await promisePool.query(
      'UPDATE guests SET name = ?, email = ?, phone = ?, rsvp_status = ?, plus_one = ? WHERE id = ?',
      [name, email, phone, rsvp_status, plus_one, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Guest not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Guest updated successfully'
    });
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
      'DELETE FROM guests WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Guest not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
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
