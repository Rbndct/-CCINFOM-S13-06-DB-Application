const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const {category, item_condition} = req.query;
    let query = `
      SELECT 
        inventory_id,
        item_name,
        category,
        item_condition,
        quantity_available,
        rental_cost,
        created_at,
        updated_at
      FROM inventory_items
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (item_condition && item_condition !== 'all') {
      query += ' AND item_condition = ?';
      params.push(item_condition);
    }

    query += ' ORDER BY item_name ASC';

    const [rows] = await promisePool.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory items',
      message: error.message
    });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const [rows] = await promisePool.query(
      'SELECT * FROM inventory_items WHERE inventory_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory item',
      message: error.message
    });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const {item_name, category, item_condition, quantity_available, rental_cost} = req.body;

    if (!item_name || !category || !item_condition || quantity_available === undefined || rental_cost === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO inventory_items (item_name, category, item_condition, quantity_available, rental_cost)
       VALUES (?, ?, ?, ?, ?)`,
      [item_name, category, item_condition, quantity_available, rental_cost]
    );

    res.json({
      success: true,
      data: {
        inventory_id: result.insertId,
        item_name,
        category,
        item_condition,
        quantity_available,
        rental_cost
      }
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory item',
      message: error.message
    });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const {item_name, category, item_condition, quantity_available, rental_cost} = req.body;

    const [result] = await promisePool.query(
      `UPDATE inventory_items 
       SET item_name = ?, category = ?, item_condition = ?, quantity_available = ?, rental_cost = ?
       WHERE inventory_id = ?`,
      [item_name, category, item_condition, quantity_available, rental_cost, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory item',
      message: error.message
    });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const {id} = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM inventory_items WHERE inventory_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete inventory item',
      message: error.message
    });
  }
});

module.exports = router;

