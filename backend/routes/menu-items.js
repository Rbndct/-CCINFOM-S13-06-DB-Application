const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Get all menu items (with optional filters)
router.get('/', async (req, res) => {
  try {
    const {wedding_id, menu_type, restriction_id} = req.query;
    let query = `
      SELECT 
        m.menu_item_id,
        m.menu_name,
        m.menu_cost,
        m.menu_price,
        m.menu_type,
        m.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level,
        (m.menu_price - m.menu_cost) as profit_margin,
        (
          SELECT 
            MIN(FLOOR(i2.stock_quantity / NULLIF(r2.quantity_needed, 0)))
          FROM recipe r2
          JOIN ingredient i2 ON i2.ingredient_id = r2.ingredient_id
          WHERE r2.menu_item_id = m.menu_item_id
        ) AS makeable_quantity
      FROM menu_item m
      LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
      WHERE 1=1
    `;
    const params = [];

    if (wedding_id) {
      // Get menu items assigned to tables for this wedding
      query = `
        SELECT DISTINCT
          m.menu_item_id,
          m.menu_name,
          m.menu_cost,
          m.menu_price,
          m.menu_type,
          m.restriction_id,
          dr.restriction_name,
          dr.restriction_type,
          dr.severity_level,
          (m.menu_price - m.menu_cost) as profit_margin,
          (
            SELECT 
              MIN(FLOOR(i2.stock_quantity / NULLIF(r2.quantity_needed, 0)))
            FROM recipe r2
            JOIN ingredient i2 ON i2.ingredient_id = r2.ingredient_id
            WHERE r2.menu_item_id = m.menu_item_id
          ) AS makeable_quantity,
          COUNT(DISTINCT tp.table_id) as usage_count
        FROM menu_item m
        LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
        LEFT JOIN package_menu_items pmi ON m.menu_item_id = pmi.menu_item_id
        LEFT JOIN table_package tp ON pmi.package_id = tp.package_id
        LEFT JOIN seating_table st ON tp.table_id = st.table_id
        WHERE st.wedding_id = ?
        GROUP BY m.menu_item_id
      `;
      params.push(wedding_id);
    }

    if (menu_type && !wedding_id) {
      query += ' AND m.menu_type = ?';
      params.push(menu_type);
    }

    if (restriction_id && !wedding_id) {
      query += ' AND m.restriction_id = ?';
      params.push(restriction_id);
    }

    query += ' ORDER BY m.menu_name ASC';

    const [rows] = await promisePool.query(query, params);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
});

// Get menu item by ID with recipe and ingredients
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT 
        m.menu_item_id,
        m.menu_name,
        m.menu_cost,
        m.menu_price,
        m.menu_type,
        m.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level,
        (m.menu_price - m.menu_cost) as profit_margin,
        (
          SELECT 
            MIN(FLOOR(i2.stock_quantity / NULLIF(r2.quantity_needed, 0)))
          FROM recipe r2
          JOIN ingredient i2 ON i2.ingredient_id = r2.ingredient_id
          WHERE r2.menu_item_id = m.menu_item_id
        ) AS makeable_quantity
      FROM menu_item m
      LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
      WHERE m.menu_item_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    const menuItem = rows[0];

    // Fetch recipe and ingredients
    const [recipeRows] = await promisePool.query(
      `SELECT 
        r.recipe_id,
        r.quantity_needed,
        i.ingredient_id,
        i.ingredient_name,
        i.unit,
        i.stock_quantity,
        i.re_order_level
      FROM recipe r
      JOIN ingredient i ON r.ingredient_id = i.ingredient_id
      WHERE r.menu_item_id = ?
      ORDER BY i.ingredient_name ASC`,
      [req.params.id]
    );

    menuItem.recipe = recipeRows;

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item',
      message: error.message
    });
  }
});

// Create menu item
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {menu_name, menu_cost, menu_price, menu_type, restriction_id} = req.body;

    if (!menu_name || !menu_cost || !menu_price || !menu_type) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: menu_name, menu_cost, menu_price, menu_type'
      });
    }

    const [result] = await connection.query(
      `INSERT INTO menu_item (menu_name, menu_cost, menu_price, menu_type, restriction_id)
       VALUES (?, ?, ?, ?, ?)`,
      [menu_name, menu_cost, menu_price, menu_type, restriction_id || null]
    );

    await connection.commit();

    res.json({
      success: true,
      data: {
        menu_item_id: result.insertId,
        menu_name,
        menu_cost,
        menu_price,
        menu_type,
        restriction_id: restriction_id || null
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {menu_name, menu_cost, menu_price, menu_type, restriction_id} = req.body;
    const menuItemId = req.params.id;

    // Check if menu item exists
    const [checkRows] = await connection.query(
      'SELECT menu_item_id FROM menu_item WHERE menu_item_id = ?',
      [menuItemId]
    );

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Update menu item
    await connection.query(
      `UPDATE menu_item 
       SET menu_name = ?, menu_cost = ?, menu_price = ?, menu_type = ?, restriction_id = ?
       WHERE menu_item_id = ?`,
      [menu_name, menu_cost, menu_price, menu_type, restriction_id || null, menuItemId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const menuItemId = req.params.id;

    // Check if menu item exists
    const [checkRows] = await connection.query(
      'SELECT menu_item_id FROM menu_item WHERE menu_item_id = ?',
      [menuItemId]
    );

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Delete menu item (cascade will handle related records)
    await connection.query(
      'DELETE FROM menu_item WHERE menu_item_id = ?',
      [menuItemId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

