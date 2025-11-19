const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Import updateWeddingCosts from inventory routes
async function updateWeddingCosts(weddingId) {
  try {
    // Calculate equipment rental cost from inventory allocations
    const [inventoryCosts] = await promisePool.query(
        `SELECT COALESCE(SUM(quantity_used * unit_rental_cost), 0) as equipment_rental_cost
       FROM inventory_allocation
       WHERE wedding_id = ?`,
        [weddingId]);
    const equipmentRentalCost =
        parseFloat(inventoryCosts[0]?.equipment_rental_cost || 0);

    // Calculate food cost from table packages (using unit_cost for internal
    // cost tracking)
    const [foodCosts] = await promisePool.query(
        `SELECT COALESCE(SUM(
        COALESCE(
          (SELECT SUM(mi.unit_cost * COALESCE(pmi.quantity, 1))
           FROM package_menu_items pmi
           JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
           WHERE pmi.package_id = tp.package_id), 0
        )
      ), 0) as food_cost
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      WHERE st.wedding_id = ?`,
        [weddingId]);

    const foodCost = parseFloat(foodCosts[0]?.food_cost || 0);

    // Calculate total invoice amount (what customer owes) using selling_price
    // from packages This is what should be used for accounts receivable
    const [invoiceAmounts] = await promisePool.query(
        `SELECT COALESCE(SUM(p.selling_price), 0) as total_invoice_amount
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE st.wedding_id = ?`,
        [weddingId]);

    const totalInvoiceAmount =
        parseFloat(invoiceAmounts[0]?.total_invoice_amount || 0);
    // Total cost = equipment rental (already at selling price) + package
    // selling prices
    const totalCost = equipmentRentalCost + totalInvoiceAmount;

    // Update wedding with calculated costs
    await promisePool.query(
        `UPDATE wedding 
       SET equipment_rental_cost = ?,
           food_cost = ?,
           total_cost = ?
       WHERE wedding_id = ?`,
        [equipmentRentalCost, foodCost, totalCost, weddingId]);

    return {equipmentRentalCost, foodCost};
  } catch (error) {
    console.error('Error updating wedding costs:', error);
    throw error;
  }
}

// Helper function to calculate package unit_cost from menu items
async function calculatePackageCost(packageId, connection = null) {
  const pool = connection || promisePool;

  const [rows] = await pool.query(
      `SELECT 
      COALESCE(SUM(mi.unit_cost * COALESCE(pmi.quantity, 1)), 0) as total_cost
    FROM package_menu_items pmi
    JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
    WHERE pmi.package_id = ?`,
      [packageId]);

  return parseFloat(rows[0]?.total_cost || 0);
}

// Helper function to calculate ingredient usage for a package
// Based on package_menu_items quantities only (not guest count or capacity)
async function calculateIngredientUsageForPackage(
    packageId, connection = null) {
  const pool = connection || promisePool;
  const usage = new Map();  // ingredient_id -> total_quantity_needed

  try {
    // Get all menu items in the package with their quantities
    const [menuItems] = await pool.query(
        `SELECT pmi.menu_item_id, pmi.quantity as package_quantity
       FROM package_menu_items pmi
       WHERE pmi.package_id = ?`,
        [packageId]);

    // For each menu item, get its recipe ingredients and calculate usage
    for (const menuItem of menuItems) {
      const menuItemId = menuItem.menu_item_id;
      const packageQuantity = menuItem.package_quantity || 1;

      // Get recipe ingredients for this menu item
      const [recipeIngredients] = await pool.query(
          `SELECT ingredient_id, quantity_needed
         FROM recipe
         WHERE menu_item_id = ?`,
          [menuItemId]);

      // Calculate usage for each ingredient
      for (const recipeIngredient of recipeIngredients) {
        const ingredientId = recipeIngredient.ingredient_id;
        const quantityNeeded =
            parseFloat(recipeIngredient.quantity_needed) || 0;

        // Calculate total quantity needed: quantity_needed * package_quantity
        // This is based on the package allocation, not guest count
        const totalNeeded = quantityNeeded * packageQuantity;

        if (totalNeeded > 0) {
          const current = usage.get(ingredientId) || 0;
          usage.set(ingredientId, current + totalNeeded);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating ingredient usage:', error);
    throw error;
  }

  return usage;
}

// Helper function to deduct ingredient stock when package is assigned to table
// Stock is deducted based on package menu item quantities only
async function deductIngredientStockForPackage(
    tableId, packageId, connection = null) {
  const pool = connection || promisePool;

  try {
    // Calculate ingredient usage based on package menu items only
    const ingredientUsage =
        await calculateIngredientUsageForPackage(packageId, connection);

    // Deduct stock for each ingredient
    for (const [ingredientId, totalToDeduct] of ingredientUsage.entries()) {
      if (totalToDeduct > 0) {
        // Deduct from ingredient stock (ensure it doesn't go below 0)
        await pool.query(
            `UPDATE ingredient 
           SET stock_quantity = GREATEST(0, stock_quantity - ?)
           WHERE ingredient_id = ?`,
            [totalToDeduct, ingredientId]);

        console.log(`Deducted ${totalToDeduct} from ingredient ${
            ingredientId} for package ${packageId} allocated to table ${
            tableId}`);
      }
    }
  } catch (error) {
    console.error('Error deducting ingredient stock:', error);
    throw error;
  }
}

// Helper function to restore ingredient stock when package is removed from
// table Stock is restored based on package menu item quantities only
async function restoreIngredientStockForPackage(
    tableId, packageId, connection = null) {
  const pool = connection || promisePool;

  try {
    // Calculate ingredient usage based on package menu items only
    const ingredientUsage =
        await calculateIngredientUsageForPackage(packageId, connection);

    // Restore stock for each ingredient
    for (const [ingredientId, totalToRestore] of ingredientUsage.entries()) {
      if (totalToRestore > 0) {
        // Restore to ingredient stock
        await pool.query(
            `UPDATE ingredient 
           SET stock_quantity = stock_quantity + ?
           WHERE ingredient_id = ?`,
            [totalToRestore, ingredientId]);

        console.log(`Restored ${totalToRestore} to ingredient ${
            ingredientId} for package ${packageId} removed from table ${
            tableId}`);
      }
    }
  } catch (error) {
    console.error('Error restoring ingredient stock:', error);
    throw error;
  }
}


// Get all packages (with optional filters)
router.get('/', async (req, res) => {
  try {
    const {wedding_id} = req.query;
    let query = `
      SELECT 
        p.package_id,
        p.package_name,
        p.package_type,
        p.unit_cost,
        p.selling_price,
        p.default_markup_percentage,
        (p.selling_price - p.unit_cost) as profit_margin,
        (p.selling_price - p.unit_cost) / NULLIF(p.unit_cost, 0) * 100 as profit_margin_percentage,
        p.unit_cost * (1 + p.default_markup_percentage / 100) as suggested_price,
        COUNT(DISTINCT pmi.menu_item_id) as total_items,
        COUNT(DISTINCT st.wedding_id) as usage_count
      FROM package p
      LEFT JOIN package_menu_items pmi ON p.package_id = pmi.package_id
      LEFT JOIN table_package tp ON p.package_id = tp.package_id
      LEFT JOIN seating_table st ON tp.table_id = st.table_id
      WHERE 1=1
    `;
    const params = [];

    if (wedding_id) {
      // Get packages assigned to tables for this wedding
      query = `
        SELECT DISTINCT
          p.package_id,
          p.package_name,
          p.package_type,
          p.unit_cost,
          p.selling_price,
          p.default_markup_percentage,
          (p.selling_price - p.unit_cost) as profit_margin,
          (p.selling_price - p.unit_cost) / NULLIF(p.unit_cost, 0) * 100 as profit_margin_percentage,
          p.unit_cost * (1 + p.default_markup_percentage / 100) as suggested_price,
          COUNT(DISTINCT pmi.menu_item_id) as total_items,
          COUNT(DISTINCT st.wedding_id) as usage_count,
          GROUP_CONCAT(DISTINCT m.menu_name SEPARATOR ', ') as menu_items
        FROM package p
        LEFT JOIN package_menu_items pmi ON p.package_id = pmi.package_id
        LEFT JOIN menu_item m ON pmi.menu_item_id = m.menu_item_id
        LEFT JOIN table_package tp ON p.package_id = tp.package_id
        LEFT JOIN seating_table st ON tp.table_id = st.table_id
        WHERE st.wedding_id = ?
        GROUP BY p.package_id
      `;
      params.push(wedding_id);
    } else {
      query += ' GROUP BY p.package_id';
    }

    query += ' ORDER BY p.package_name ASC';

    const [rows] = await promisePool.query(query, params);

    // Recalculate unit_cost for all packages (in case menu item costs changed)
    await Promise.all(rows.map(async (pkg) => {
      const calculatedCost = await calculatePackageCost(pkg.package_id);
      if (Math.abs(calculatedCost - parseFloat(pkg.unit_cost || 0)) > 0.01) {
        await promisePool.query(
            'UPDATE package SET unit_cost = ? WHERE package_id = ?',
            [calculatedCost, pkg.package_id]);
        pkg.unit_cost = calculatedCost;
      }
    }));

    // Get menu items for each package (include unit_cost and selling_price)
    const packagesWithItems = await Promise.all(rows.map(async (pkg) => {
      const [menuItems] = await promisePool.query(
          `SELECT 
          m.menu_item_id,
          m.menu_name,
          m.menu_type,
          m.unit_cost,
          m.selling_price,
          m.restriction_id,
          dr.restriction_name,
          dr.restriction_type,
          pmi.quantity
        FROM package_menu_items pmi
        JOIN menu_item m ON pmi.menu_item_id = m.menu_item_id
        LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
        WHERE pmi.package_id = ?`,
          [pkg.package_id]);

      return {...pkg, menu_items: menuItems};
    }));

    res.json({success: true, data: packagesWithItems});
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
      message: error.message
    });
  }
});

// Get package by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
        `SELECT 
        p.package_id,
        p.package_name,
        p.package_type,
        p.unit_cost,
        p.selling_price,
        p.default_markup_percentage,
        (p.selling_price - p.unit_cost) as profit_margin,
        (p.selling_price - p.unit_cost) / NULLIF(p.unit_cost, 0) * 100 as profit_margin_percentage,
        p.unit_cost * (1 + p.default_markup_percentage / 100) as suggested_price
      FROM package p
      WHERE p.package_id = ?`,
        [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({success: false, error: 'Package not found'});
    }

    // Recalculate unit_cost (in case menu item costs changed)
    const calculatedCost = await calculatePackageCost(req.params.id);
    if (Math.abs(calculatedCost - parseFloat(rows[0].unit_cost || 0)) > 0.01) {
      await promisePool.query(
          'UPDATE package SET unit_cost = ? WHERE package_id = ?',
          [calculatedCost, req.params.id]);
      rows[0].unit_cost = calculatedCost;
    }

    // Calculate usage_count (distinct weddings using this package)
    const [usageRows] = await promisePool.query(
        `SELECT COUNT(DISTINCT st.wedding_id) as wedding_count
       FROM table_package tp
       JOIN seating_table st ON tp.table_id = st.table_id
       WHERE tp.package_id = ?`,
        [req.params.id]);
    rows[0].usage_count = usageRows[0]?.wedding_count || 0;

    // Get menu items for this package (include unit_cost and selling_price)
    const [menuItems] = await promisePool.query(
        `SELECT 
        m.menu_item_id,
        m.menu_name,
        m.menu_type,
        m.unit_cost,
        m.selling_price,
        m.restriction_id,
        dr.restriction_name,
        dr.restriction_type,
        pmi.quantity,
        (m.unit_cost * pmi.quantity) as total_item_cost
      FROM package_menu_items pmi
      JOIN menu_item m ON pmi.menu_item_id = m.menu_item_id
      LEFT JOIN dietary_restriction dr ON m.restriction_id = dr.restriction_id
      WHERE pmi.package_id = ?
      ORDER BY m.menu_name ASC`,
        [req.params.id]);

    // Get assigned tables with guest counts
    // For couple tables, always count 2 (the couple is always seated there)
    // For other tables, count actual guests assigned
    const [assignedTables] = await promisePool.query(
        `SELECT 
        st.table_id,
        st.table_number,
        st.table_category,
        st.capacity,
        st.wedding_id,
        COUNT(DISTINCT g.guest_id) as guest_count_from_table
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      LEFT JOIN guest g ON st.table_id = g.table_id
      WHERE tp.package_id = ?
      GROUP BY st.table_id, st.table_number, st.table_category, st.capacity, st.wedding_id
      ORDER BY st.table_number ASC`,
        [req.params.id]);

    // Format assigned tables data
    const formattedAssignedTables = assignedTables.map((table) => {
      const isCoupleTable = table.table_category && table.table_category.toLowerCase() === 'couple';
      // For couple tables, always count 2 (the couple is always seated there)
      // For other tables, count actual guests
      const actualGuestCount = isCoupleTable ? 2 : (parseInt(table.guest_count_from_table) || 0);
      
      return {
        table_id: table.table_id,
        table_number: table.table_number,
        table_category: table.table_category,
        capacity: table.capacity,
        wedding_id: table.wedding_id,
        guest_count: actualGuestCount,
        available_seats: table.capacity - actualGuestCount
      };
    });

    res.json({
      success: true,
      data: {
        ...rows[0],
        menu_items: menuItems,
        assigned_tables: formattedAssignedTables
      }
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch package',
      message: error.message
    });
  }
});

// Create package
router.post('/', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      package_name,
      package_type,
      selling_price,
      menu_item_ids,
      default_markup_percentage,
      package_price
    } = req.body;

    // Support both new (selling_price) and old (package_price) field names for
    // backward compatibility
    const finalSellingPrice =
        selling_price !== undefined ? selling_price : package_price;

    if (!package_name || !package_type || finalSellingPrice === undefined) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error:
            'Missing required fields: package_name, package_type, selling_price (or package_price)'
      });
    }

    // Create package (unit_cost will be calculated later from menu items)
    const [result] = await connection.query(
        `INSERT INTO package (package_name, package_type, unit_cost, selling_price, default_markup_percentage)
       VALUES (?, ?, 0, ?, ?)`,
        [
          package_name, package_type, finalSellingPrice,
          default_markup_percentage || 180.00
        ]);

    const packageId = result.insertId;

    // Add menu items to package
    if (menu_item_ids && Array.isArray(menu_item_ids) &&
        menu_item_ids.length > 0) {
      const packageMenuItems = menu_item_ids.map((item) => {
        const menuItemId = typeof item === 'object' ? item.menu_item_id : item;
        const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
        return [packageId, menuItemId, quantity];
      });

      await connection.query(
          'INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES ?',
          [packageMenuItems]);
    }

    // Calculate package unit_cost from menu items
    const calculatedCost = await calculatePackageCost(packageId, connection);

    // Update package with calculated cost
    await connection.query(
        'UPDATE package SET unit_cost = ? WHERE package_id = ?',
        [calculatedCost, packageId]);

    await connection.commit();

    // Calculate suggested selling price
    const markup = default_markup_percentage || 180.00;
    const suggestedPrice = calculatedCost * (1 + markup / 100);

    res.json({
      success: true,
      data: {
        package_id: packageId,
        package_name,
        package_type,
        unit_cost: calculatedCost,
        selling_price: finalSellingPrice,
        default_markup_percentage: markup,
        suggested_price: suggestedPrice
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create package',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Update package
router.put('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      package_name,
      package_type,
      selling_price,
      menu_item_ids,
      default_markup_percentage,
      package_price
    } = req.body;
    const packageId = req.params.id;

    // Support both new (selling_price) and old (package_price) field names for
    // backward compatibility
    const finalSellingPrice =
        selling_price !== undefined ? selling_price : package_price;

    // Check if package exists
    const [checkRows] = await connection.query(
        'SELECT package_id FROM package WHERE package_id = ?', [packageId]);

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Package not found'});
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (package_name !== undefined) {
      updateFields.push('package_name = ?');
      updateValues.push(package_name);
    }
    if (package_type !== undefined) {
      updateFields.push('package_type = ?');
      updateValues.push(package_type);
    }
    if (selling_price !== undefined || package_price !== undefined) {
      updateFields.push('selling_price = ?');
      updateValues.push(finalSellingPrice);
    }
    if (default_markup_percentage !== undefined) {
      updateFields.push('default_markup_percentage = ?');
      updateValues.push(default_markup_percentage);
    }
    // Note: unit_cost is auto-calculated, not updated here

    if (updateFields.length > 0) {
      updateValues.push(packageId);
      await connection.query(
          `UPDATE package 
         SET ${updateFields.join(', ')}
         WHERE package_id = ?`,
          updateValues);
    }

    // Update menu items if provided
    if (menu_item_ids && Array.isArray(menu_item_ids)) {
      // Delete existing menu items
      await connection.query(
          'DELETE FROM package_menu_items WHERE package_id = ?', [packageId]);

      // Add new menu items
      if (menu_item_ids.length > 0) {
        const packageMenuItems = menu_item_ids.map((item) => {
          const menuItemId =
              typeof item === 'object' ? item.menu_item_id : item;
          const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
          return [packageId, menuItemId, quantity];
        });

        await connection.query(
            'INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES ?',
            [packageMenuItems]);
      }

      // Recalculate package unit_cost when menu items change
      const calculatedCost = await calculatePackageCost(packageId, connection);
      await connection.query(
          'UPDATE package SET unit_cost = ? WHERE package_id = ?',
          [calculatedCost, packageId]);
    }

    await connection.commit();

    res.json({success: true, message: 'Package updated successfully'});
  } catch (error) {
    await connection.rollback();
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update package',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Delete package
router.delete('/:id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const packageId = req.params.id;

    // Check if package exists
    const [checkRows] = await connection.query(
        'SELECT package_id FROM package WHERE package_id = ?', [packageId]);

    if (checkRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Package not found'});
    }

    // Delete package (cascade will handle related records)
    await connection.query(
        'DELETE FROM package WHERE package_id = ?', [packageId]);

    await connection.commit();

    res.json({success: true, message: 'Package deleted successfully'});
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete package',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Assign package to table
router.post('/assign', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {table_id, package_id} = req.body;

    if (!table_id || !package_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: table_id, package_id'
      });
    }

    // Check if assignment already exists
    const [existing] = await connection.query(
        'SELECT assignment_id FROM table_package WHERE table_id = ? AND package_id = ?',
        [table_id, package_id]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json(
          {success: false, error: 'Package is already assigned to this table'});
    }

    // Create assignment
    await connection.query(
        'INSERT INTO table_package (table_id, package_id) VALUES (?, ?)',
        [table_id, package_id]);

    // Get wedding_id from table
    const [tableRows] = await connection.query(
        'SELECT wedding_id FROM seating_table WHERE table_id = ?', [table_id]);
    const wedding_id = tableRows[0]?.wedding_id;

    // Deduct ingredient stock for this package assignment
    try {
      await deductIngredientStockForPackage(table_id, package_id, connection);
    } catch (stockError) {
      console.error('Error deducting ingredient stock:', stockError);
      // Log error but don't fail the assignment - stock deduction is important
      // but shouldn't block assignment You may want to make this more strict
      // depending on business requirements
    }

    await connection.commit();

    // Update wedding costs after assignment
    if (wedding_id) {
      try {
        await updateWeddingCosts(wedding_id);
      } catch (costError) {
        console.error('Error updating wedding costs:', costError);
        // Don't fail the request if cost update fails
      }
    }

    res.json(
        {success: true, message: 'Package assigned to table successfully'});
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign package',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Remove package from table
router.delete('/assign/:table_id/:package_id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const {table_id, package_id} = req.params;

    // Get wedding_id before deleting
    const [tableRows] = await connection.query(
        'SELECT wedding_id FROM seating_table WHERE table_id = ?', [table_id]);
    const wedding_id = tableRows[0]?.wedding_id;

    // Restore ingredient stock before deleting assignment
    try {
      await restoreIngredientStockForPackage(table_id, package_id, connection);
    } catch (stockError) {
      console.error('Error restoring ingredient stock:', stockError);
      // Log error but continue with deletion
    }

    // Delete assignment
    await connection.query(
        'DELETE FROM table_package WHERE table_id = ? AND package_id = ?',
        [table_id, package_id]);

    await connection.commit();

    // Update wedding costs after removal
    if (wedding_id) {
      try {
        await updateWeddingCosts(wedding_id);
      } catch (costError) {
        console.error('Error updating wedding costs:', costError);
        // Don't fail the request if cost update fails
      }
    }

    res.json(
        {success: true, message: 'Package removed from table successfully'});
  } catch (error) {
    await connection.rollback();
    console.error('Error removing package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove package',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Get table-package assignments for a wedding
router.get('/wedding/:wedding_id/assignments', async (req, res) => {
  try {
    const {wedding_id} = req.params;

    const [rows] = await promisePool.query(
        `SELECT 
        tp.assignment_id,
        tp.table_id,
        tp.package_id,
        st.table_number,
        st.table_category,
        p.package_name,
        p.package_type,
        p.unit_cost,
        p.selling_price,
        p.default_markup_percentage
      FROM table_package tp
      JOIN seating_table st ON tp.table_id = st.table_id
      JOIN package p ON tp.package_id = p.package_id
      WHERE st.wedding_id = ?
      ORDER BY st.table_number ASC`,
        [wedding_id]);

    res.json({success: true, data: rows});
  } catch (error) {
    console.error('Error fetching table-package assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch table-package assignments',
      message: error.message
    });
  }
});

// Export helper functions for use in other routes
module.exports = router;
module.exports.deductIngredientStockForPackage =
    deductIngredientStockForPackage;
module.exports.restoreIngredientStockForPackage =
    restoreIngredientStockForPackage;
module.exports.calculateIngredientUsageForPackage =
    calculateIngredientUsageForPackage;
