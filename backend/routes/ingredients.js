const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// GET /ingredients - list all ingredients
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        i.ingredient_id,
        i.ingredient_name,
        i.unit,
        i.stock_quantity,
        i.re_order_level,
        i.created_at,
        i.updated_at,
        COUNT(DISTINCT r.menu_item_id) as usage_count
      FROM ingredient i
      LEFT JOIN recipe r ON i.ingredient_id = r.ingredient_id
      GROUP BY i.ingredient_id, i.ingredient_name, i.unit, i.stock_quantity, i.re_order_level, i.created_at, i.updated_at
      ORDER BY i.ingredient_name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ingredients', message: error.message });
  }
});

// GET /ingredients/:id - get single ingredient with menu items that use it
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ingredient details
    const [ingredientRows] = await promisePool.query(
      `SELECT * FROM ingredient WHERE ingredient_id = ?`,
      [id]
    );
    
    if (ingredientRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    // Get menu items that use this ingredient
    const [menuItems] = await promisePool.query(
      `SELECT 
        m.menu_item_id,
        m.menu_name,
        m.menu_type,
        r.quantity_needed,
        (FLOOR(i.stock_quantity / NULLIF(r.quantity_needed, 0))) as makeable_quantity
      FROM recipe r
      JOIN menu_item m ON r.menu_item_id = m.menu_item_id
      JOIN ingredient i ON r.ingredient_id = i.ingredient_id
      WHERE r.ingredient_id = ?
      ORDER BY m.menu_name ASC`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...ingredientRows[0],
        menu_items: menuItems
      }
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ingredient', message: error.message });
  }
});

// POST /ingredients - create new ingredient
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { ingredient_name, unit, stock_quantity, re_order_level } = req.body;
    if (!ingredient_name || !unit || stock_quantity === undefined || re_order_level === undefined) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get the next ingredient_id since it's not AUTO_INCREMENT
    const [maxIdRows] = await connection.query(
      `SELECT COALESCE(MAX(ingredient_id), 0) as max_id FROM ingredient`
    );
    const nextId = (maxIdRows[0].max_id || 0) + 1;

    const [result] = await connection.query(
      `INSERT INTO ingredient (ingredient_id, ingredient_name, unit, stock_quantity, re_order_level) VALUES (?, ?, ?, ?, ?)`,
      [nextId, ingredient_name, unit, stock_quantity, re_order_level]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        ingredient_id: nextId,
        ingredient_name,
        unit,
        stock_quantity,
        re_order_level
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating ingredient:', error);
    res.status(500).json({ success: false, error: 'Failed to create ingredient', message: error.message });
  } finally {
    connection.release();
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


