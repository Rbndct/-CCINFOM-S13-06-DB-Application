const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// GET all weddings with couple information
router.get('/', async (req, res) => {
  try {
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
        c.planner_contact as plannerContact
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
      ORDER BY w.wedding_date DESC
    `);
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

// GET single wedding by ID with couple information
router.get('/:id', async (req, res) => {
  try {
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
        c.planner_contact as plannerContact
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
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
      payment_status 
    } = req.body;
    
    const [result] = await promisePool.query(
      `INSERT INTO wedding 
       (couple_id, wedding_date, wedding_time, venue, guest_count, 
        total_cost, production_cost, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [couple_id, wedding_date, wedding_time, venue, 
       guest_count || 0, total_cost || 0, production_cost || 0, 
       payment_status || 'pending']
    );
    
    // Fetch the created wedding with couple info
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
        c.planner_contact as plannerContact
      FROM wedding w
      INNER JOIN couple c ON w.couple_id = c.couple_id
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
      payment_status 
    } = req.body;
    
    const [result] = await promisePool.query(
      `UPDATE wedding SET 
       wedding_date = ?, wedding_time = ?, venue = ?, guest_count = ?, 
       total_cost = ?, production_cost = ?, payment_status = ? 
       WHERE wedding_id = ?`,
      [wedding_date, wedding_time, venue, guest_count, 
       total_cost, production_cost, payment_status, req.params.id]
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
