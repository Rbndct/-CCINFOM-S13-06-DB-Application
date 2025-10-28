const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// GET all weddings
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM weddings ORDER BY wedding_date DESC'
    );
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

// GET single wedding by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM weddings WHERE id = ?',
      [req.params.id]
    );
    
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
    const { couple_names, wedding_date, venue, budget, status } = req.body;
    
    const [result] = await promisePool.query(
      'INSERT INTO weddings (couple_names, wedding_date, venue, budget, status) VALUES (?, ?, ?, ?, ?)',
      [couple_names, wedding_date, venue, budget, status || 'planning']
    );
    
    res.status(201).json({
      success: true,
      message: 'Wedding created successfully',
      data: {
        id: result.insertId,
        couple_names,
        wedding_date,
        venue,
        budget,
        status: status || 'planning'
      }
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
    const { couple_names, wedding_date, venue, budget, status } = req.body;
    
    const [result] = await promisePool.query(
      'UPDATE weddings SET couple_names = ?, wedding_date = ?, venue = ?, budget = ?, status = ? WHERE id = ?',
      [couple_names, wedding_date, venue, budget, status, req.params.id]
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
      'DELETE FROM weddings WHERE id = ?',
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
