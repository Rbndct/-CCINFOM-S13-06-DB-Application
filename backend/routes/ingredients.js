const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /ingredients - list all ingredients
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        ingredient_id,
        ingredient_name,
        unit,
        stock_quantity,
        re_order_level,
        created_at,
        updated_at
      FROM ingredient
      ORDER BY ingredient_name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ingredients', message: error.message });
  }
});

// POST /ingredients - create new ingredient
router.post('/', async (req, res) => {
  try {
    const { ingredient_name, unit, stock_quantity, re_order_level } = req.body;
    if (!ingredient_name || !unit || stock_quantity === undefined || re_order_level === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO ingredient (ingredient_name, unit, stock_quantity, re_order_level) VALUES (?, ?, ?, ?)`,
      [ingredient_name, unit, stock_quantity, re_order_level]
    );

    res.status(201).json({
      success: true,
      data: {
        ingredient_id: result.insertId,
        ingredient_name,
        unit,
        stock_quantity,
        re_order_level
      }
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to create ingredient', message: error.message });
  }
});

// PUT /ingredients/:id - update ingredient fields
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredient_name, unit, stock_quantity, re_order_level } = req.body;

    const [result] = await promisePool.query(
      `UPDATE ingredient SET ingredient_name = ?, unit = ?, stock_quantity = ?, re_order_level = ? WHERE ingredient_id = ?`,
      [ingredient_name, unit, stock_quantity, re_order_level, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }

    res.json({ success: true, message: 'Ingredient updated successfully' });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to update ingredient', message: error.message });
  }
});

// PUT /ingredients/:id/restock - delta restock (can be negative)
router.put('/:id/restock', async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body;

    if (typeof delta !== 'number' || isNaN(delta) || delta === 0) {
      return res.status(400).json({ success: false, error: 'delta must be a non-zero number' });
    }

    const [rows] = await promisePool.query(
      'SELECT stock_quantity FROM ingredient WHERE ingredient_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }

    const currentQty = parseFloat(rows[0].stock_quantity) || 0;
    const newQty = Math.max(0, currentQty + delta);

    await promisePool.query(
      'UPDATE ingredient SET stock_quantity = ? WHERE ingredient_id = ?',
      [newQty, id]
    );

    res.json({ success: true, data: { ingredient_id: parseInt(id, 10), stock_quantity: newQty } });
  } catch (error) {
    console.error('Error restocking ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to restock ingredient', message: error.message });
  }
});

// DELETE /ingredients/:id - delete ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await promisePool.query('DELETE FROM ingredient WHERE ingredient_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    res.json({ success: true, message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to delete ingredient', message: error.message });
  }
});

module.exports = router;


