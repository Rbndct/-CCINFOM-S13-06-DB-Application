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
        m.unit_cost,
        m.selling_price,
        m.default_markup_percentage,
        m.cost_override,
        m.menu_type,
        m.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level,
        (m.selling_price - m.unit_cost) as profit_margin,
        (m.selling_price - m.unit_cost) / NULLIF(m.unit_cost, 0) * 100 as profit_margin_percentage,
        m.unit_cost * (1 + m.default_markup_percentage / 100) as suggested_price,
        (
          SELECT 
            MIN(FLOOR(i2.stock_quantity / NULLIF(r2.quantity_needed, 0)))
          FROM recipe r2
          JOIN ingredient i2 ON i2.ingredient_id = r2.ingredient_id
          WHERE r2.menu_item_id = m.menu_item_id
        ) AS makeable_quantity,
        (
          SELECT COUNT(DISTINCT pmi.package_id)
          FROM package_menu_items pmi
          WHERE pmi.menu_item_id = m.menu_item_id
        ) AS usage_count
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
          m.unit_cost,
          m.selling_price,
          m.default_markup_percentage,
          m.cost_override,
          m.menu_type,
          m.restriction_id,
          dr.restriction_name,
          dr.restriction_type,
          dr.severity_level,
          (m.selling_price - m.unit_cost) as profit_margin,
          (m.selling_price - m.unit_cost) / NULLIF(m.unit_cost, 0) * 100 as profit_margin_percentage,
          m.unit_cost * (1 + m.default_markup_percentage / 100) as suggested_price,
          (
            SELECT 
              MIN(FLOOR(i2.stock_quantity / NULLIF(r2.quantity_needed, 0)))
            FROM recipe r2
            JOIN ingredient i2 ON i2.ingredient_id = r2.ingredient_id
            WHERE r2.menu_item_id = m.menu_item_id
          ) AS makeable_quantity,
          COUNT(DISTINCT tp.table_id) as table_usage_count,
          (
            SELECT COUNT(DISTINCT pmi2.package_id)
            FROM package_menu_items pmi2
            WHERE pmi2.menu_item_id = m.menu_item_id
          ) AS usage_count
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

    // Fetch all dietary restrictions for each menu item (from junction table)
    const itemsWithRestrictions = await Promise.all(rows.map(async (item) => {
      const [restrictionRows] = await promisePool.query(
          `SELECT 
          dr.restriction_id,
          dr.restriction_name,
          dr.restriction_type,
          dr.severity_level
        FROM menu_item_restrictions mir
        JOIN dietary_restriction dr ON mir.restriction_id = dr.restriction_id
        WHERE mir.menu_item_id = ?
        ORDER BY dr.restriction_name ASC`,
          [item.menu_item_id]);

      return {...item, restrictions: restrictionRows};
    }));

    res.json({success: true, data: itemsWithRestrictions});
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
        m.unit_cost,
        m.selling_price,
        m.default_markup_percentage,
        m.cost_override,
        m.menu_type,
        m.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level,
        (m.selling_price - m.unit_cost) as profit_margin,
        (m.selling_price - m.unit_cost) / NULLIF(m.unit_cost, 0) * 100 as profit_margin_percentage,
        m.unit_cost * (1 + m.default_markup_percentage / 100) as suggested_price,
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
        [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json(
          {success: false, error: 'Menu item not found'});
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
        [req.params.id]);

    menuItem.recipe = recipeRows;

    // Fetch all dietary restrictions for this menu item (from junction table)
    const [restrictionRows] = await promisePool.query(
        `SELECT 
        dr.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        dr.severity_level
      FROM menu_item_restrictions mir
      JOIN dietary_restriction dr ON mir.restriction_id = dr.restriction_id
      WHERE mir.menu_item_id = ?
      ORDER BY dr.restriction_name ASC`,
        [req.params.id]);

    menuItem.restrictions = restrictionRows;
    // Keep primary restriction for backward compatibility
    if (restrictionRows.length > 0 && !menuItem.restriction_name) {
      menuItem.restriction_name = restrictionRows[0].restriction_name;
      menuItem.restriction_id = restrictionRows[0].restriction_id;
    }

    // Add usage_count
    const [usageRows] = await promisePool.query(
        `SELECT COUNT(DISTINCT pmi.package_id) as usage_count
       FROM package_menu_items pmi
       WHERE pmi.menu_item_id = ?`,
        [req.params.id]);
    menuItem.usage_count = usageRows[0]?.usage_count || 0;

    res.json({success: true, data: menuItem});
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

    const {
      menu_name,
      unit_cost,
      selling_price,
      menu_type,
      restriction_id,
      default_markup_percentage,
      cost_override,
      menu_cost,
      menu_price,
      recipe
    } = req.body;

    // Support both new (unit_cost, selling_price) and old (menu_cost,
    // menu_price) field names for backward compatibility
    let finalUnitCost = unit_cost !== undefined ? unit_cost : menu_cost;
    const finalSellingPrice =
        selling_price !== undefined ? selling_price : menu_price;

    // Calculate cost from recipe if provided
    if (recipe && Array.isArray(recipe) && recipe.length > 0) {
      let calculatedCost = 0;
      for (const recipeItem of recipe) {
        if (!recipeItem.ingredient_id || !recipeItem.quantity) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Recipe items must have ingredient_id and quantity'
          });
        }

        // Get ingredient cost (if ingredients have cost, otherwise use 0)
        // For now, since ingredients don't have cost, we'll need to calculate
        // differently We'll use the provided unit_cost or calculate from recipe
        // if ingredient costs exist
        const [ingredientRows] = await connection.query(
            'SELECT * FROM ingredient WHERE ingredient_id = ?',
            [recipeItem.ingredient_id]);

        if (ingredientRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: `Ingredient with ID ${recipeItem.ingredient_id} not found`
          });
        }

        // If unit_cost not provided, we'll calculate from recipe
        // For now, since ingredients don't have cost, we'll require unit_cost
        // to be provided or calculate it as 0 and let the user set it manually
      }

      // If unit_cost was not provided, we can't calculate from ingredients
      // (they don't have cost) So we require it to be provided
      if (finalUnitCost === undefined) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error:
              'unit_cost is required when using recipe (ingredients do not have cost)'
        });
      }
    }

    if (!menu_name || finalUnitCost === undefined ||
        finalSellingPrice === undefined || !menu_type) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error:
            'Missing required fields: menu_name, unit_cost (or menu_cost), selling_price (or menu_price), menu_type'
      });
    }

    // Require recipe for new menu items
    if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Recipe with at least one ingredient is required'
      });
    }

    const [result] = await connection.query(
        `INSERT INTO menu_item (menu_name, unit_cost, selling_price, default_markup_percentage, cost_override, menu_type, restriction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          menu_name, finalUnitCost, finalSellingPrice,
          default_markup_percentage || 200.00, cost_override || false,
          menu_type, restriction_id || null
        ]);

    const menuItemId = result.insertId;

    // Insert recipe items
    for (const recipeItem of recipe) {
      await connection.query(
          `INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity_needed = ?`,
          [
            menuItemId, recipeItem.ingredient_id, recipeItem.quantity,
            recipeItem.quantity
          ]);
    }

    await connection.commit();

    res.json({
      success: true,
      data: {
        menu_item_id: result.insertId,
        menu_name,
        unit_cost: finalUnitCost,
        selling_price: finalSellingPrice,
        default_markup_percentage: default_markup_percentage || 200.00,
        cost_override: cost_override || false,
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

    const {
      menu_name,
      unit_cost,
      selling_price,
      menu_type,
      restriction_id,
      default_markup_percentage,
      cost_override,
      menu_cost,
      menu_price,
      recipe
    } = req.body;
    const menuItemId = req.params.id;

    // Support both new (unit_cost, selling_price) and old (menu_cost,
    // menu_price) field names for backward compatibility
    const finalUnitCost = unit_cost !== undefined ? unit_cost : menu_cost;
    const finalSellingPrice =
        selling_price !== undefined ? selling_price : menu_price;

    // Check if menu item exists
    const [checkRows] = await connection.query(
        'SELECT menu_item_id FROM menu_item WHERE menu_item_id = ?',
        [menuItemId]);

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json(
          {success: false, error: 'Menu item not found'});
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (menu_name !== undefined) {
      updateFields.push('menu_name = ?');
      updateValues.push(menu_name);
    }
    if (unit_cost !== undefined || menu_cost !== undefined) {
      updateFields.push('unit_cost = ?');
      updateValues.push(finalUnitCost);
    }
    if (selling_price !== undefined || menu_price !== undefined) {
      updateFields.push('selling_price = ?');
      updateValues.push(finalSellingPrice);
    }
    if (default_markup_percentage !== undefined) {
      updateFields.push('default_markup_percentage = ?');
      updateValues.push(default_markup_percentage);
    }
    if (cost_override !== undefined) {
      updateFields.push('cost_override = ?');
      updateValues.push(cost_override);
    }
    if (menu_type !== undefined) {
      updateFields.push('menu_type = ?');
      updateValues.push(menu_type);
    }
    if (restriction_id !== undefined) {
      updateFields.push('restriction_id = ?');
      updateValues.push(restriction_id || null);
    }

    if (updateFields.length === 0) {
      await connection.rollback();
      return res.status(400).json(
          {success: false, error: 'No fields to update'});
    }

    updateValues.push(menuItemId);

    // Update menu item
    await connection.query(
        `UPDATE menu_item 
       SET ${updateFields.join(', ')}
       WHERE menu_item_id = ?`,
        updateValues);

    // Update recipe if provided
    if (recipe && Array.isArray(recipe)) {
      // Delete existing recipe entries
      await connection.query(
          'DELETE FROM recipe WHERE menu_item_id = ?', [menuItemId]);

      // Insert new recipe entries
      for (const recipeItem of recipe) {
        if (recipeItem.ingredient_id && recipeItem.quantity) {
          await connection.query(
              `INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
             VALUES (?, ?, ?)`,
              [menuItemId, recipeItem.ingredient_id, recipeItem.quantity]);
        }
      }
    }

    await connection.commit();

    res.json({success: true, message: 'Menu item updated successfully'});
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
        [menuItemId]);

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json(
          {success: false, error: 'Menu item not found'});
    }

    // Delete menu item (cascade will handle related records)
    await connection.query(
        'DELETE FROM menu_item WHERE menu_item_id = ?', [menuItemId]);

    await connection.commit();

    res.json({success: true, message: 'Menu item deleted successfully'});
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
