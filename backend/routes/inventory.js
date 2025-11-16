const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Helper function to recalculate and update wedding costs
async function updateWeddingCosts(weddingId) {
  try {
    // Calculate total rental cost from inventory allocations
    const [inventoryCosts] = await promisePool.query(
      `SELECT COALESCE(SUM(quantity_used * rental_cost), 0) as total_rental_cost
       FROM inventory_allocation
       WHERE wedding_id = ?`,
      [weddingId]
    );
    const totalRentalCost = parseFloat(inventoryCosts[0]?.total_rental_cost || 0);

    // Calculate total food cost from table packages
    // Sum of menu costs from packages assigned to tables
    const [foodCosts] = await promisePool.query(
      `SELECT COALESCE(SUM(
        COALESCE(
          (SELECT SUM(mi.menu_cost * COALESCE(pmi.quantity, 1))
           FROM package_menu_items pmi
           JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
           WHERE pmi.package_id = tp.package_id), 0
        )
      ), 0) as total_food_cost
      FROM table_package tp
      WHERE tp.wedding_id = ?`,
      [weddingId]
    );
    
    const totalFoodCost = parseFloat(foodCosts[0]?.total_food_cost || 0);

    // Update wedding with calculated costs
    await promisePool.query(
      `UPDATE wedding 
       SET total_cost = ?,
           production_cost = ?
       WHERE wedding_id = ?`,
      [totalRentalCost, totalFoodCost, weddingId]
    );

    return { totalRentalCost, totalFoodCost };
  } catch (error) {
    console.error('Error updating wedding costs:', error);
    throw error;
  }
}

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

// ============================================================================
// INVENTORY ALLOCATION ENDPOINTS
// ============================================================================

// Get all allocations for a wedding
router.get('/allocations/:wedding_id', async (req, res) => {
  try {
    const {wedding_id} = req.params;
    const [rows] = await promisePool.query(
      `SELECT 
        ia.allocation_id,
        ia.wedding_id,
        ia.inventory_id,
        ia.quantity_used,
        ia.rental_cost,
        ia.created_at,
        ia.updated_at,
        ii.item_name,
        ii.category,
        ii.item_condition,
        ii.quantity_available,
        (ia.quantity_used * ia.rental_cost) AS total_cost
      FROM inventory_allocation ia
      INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
      WHERE ia.wedding_id = ?
      ORDER BY ia.created_at DESC`,
      [wedding_id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching inventory allocations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory allocations',
      message: error.message
    });
  }
});

// Create new inventory allocation
router.post('/allocations', async (req, res) => {
  try {
    const {wedding_id, inventory_id, quantity_used, rental_cost} = req.body;

    if (!wedding_id || !inventory_id || quantity_used === undefined || rental_cost === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: wedding_id, inventory_id, quantity_used, rental_cost'
      });
    }

    // Check if inventory item exists and has enough quantity
    const [itemRows] = await promisePool.query(
      'SELECT quantity_available, rental_cost FROM inventory_items WHERE inventory_id = ?',
      [inventory_id]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }

    const availableQuantity = itemRows[0].quantity_available;
    if (quantity_used > availableQuantity) {
      return res.status(400).json({
        success: false,
        error: `Quantity used (${quantity_used}) exceeds available quantity (${availableQuantity})`
      });
    }

    // Use provided rental_cost or fallback to item's rental_cost
    // Handle both null/undefined and 0 values properly
    const finalRentalCost = (rental_cost !== undefined && rental_cost !== null && rental_cost !== '') 
      ? parseFloat(rental_cost) 
      : itemRows[0].rental_cost;
    
    if (isNaN(finalRentalCost) || finalRentalCost < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rental cost value'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, rental_cost)
       VALUES (?, ?, ?, ?)`,
      [wedding_id, inventory_id, quantity_used, finalRentalCost]
    );

    // Fetch the created allocation with item details
    const [newAllocation] = await promisePool.query(
      `SELECT 
        ia.allocation_id,
        ia.wedding_id,
        ia.inventory_id,
        ia.quantity_used,
        ia.rental_cost,
        ia.created_at,
        ia.updated_at,
        ii.item_name,
        ii.category,
        ii.item_condition,
        ii.quantity_available,
        (ia.quantity_used * ia.rental_cost) AS total_cost
      FROM inventory_allocation ia
      INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
      WHERE ia.allocation_id = ?`,
      [result.insertId]
    );

    // Update wedding costs
    await updateWeddingCosts(wedding_id);

    res.status(201).json({
      success: true,
      data: newAllocation[0],
      message: 'Inventory allocation created successfully'
    });
  } catch (error) {
    console.error('Error creating inventory allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory allocation',
      message: error.message
    });
  }
});

// Update inventory allocation
router.put('/allocations/:allocation_id', async (req, res) => {
  try {
    const {allocation_id} = req.params;
    const {quantity_used, rental_cost} = req.body;

    if (quantity_used === undefined && rental_cost === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (quantity_used or rental_cost) must be provided'
      });
    }

    // Get current allocation to check inventory availability
    const [currentAllocation] = await promisePool.query(
      `SELECT ia.inventory_id, ia.quantity_used, ii.quantity_available
       FROM inventory_allocation ia
       INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
       WHERE ia.allocation_id = ?`,
      [allocation_id]
    );

    if (currentAllocation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory allocation not found'
      });
    }

    const newQuantity = quantity_used !== undefined ? quantity_used : currentAllocation[0].quantity_used;
    const availableQuantity = currentAllocation[0].quantity_available;
    const currentQuantity = currentAllocation[0].quantity_used;

    // Check if new quantity exceeds available (accounting for current allocation)
    const effectiveAvailable = availableQuantity + currentQuantity;
    if (newQuantity > effectiveAvailable) {
      return res.status(400).json({
        success: false,
        error: `Quantity used (${newQuantity}) exceeds available quantity (${effectiveAvailable})`
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (quantity_used !== undefined) {
      updates.push('quantity_used = ?');
      params.push(quantity_used);
    }
    
    if (rental_cost !== undefined) {
      updates.push('rental_cost = ?');
      params.push(rental_cost);
    }
    
    params.push(allocation_id);

    const [result] = await promisePool.query(
      `UPDATE inventory_allocation 
       SET ${updates.join(', ')}
       WHERE allocation_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory allocation not found'
      });
    }

    // Fetch updated allocation with item details
    const [updatedAllocation] = await promisePool.query(
      `SELECT 
        ia.allocation_id,
        ia.wedding_id,
        ia.inventory_id,
        ia.quantity_used,
        ia.rental_cost,
        ia.created_at,
        ia.updated_at,
        ii.item_name,
        ii.category,
        ii.item_condition,
        ii.quantity_available,
        (ia.quantity_used * ia.rental_cost) AS total_cost
      FROM inventory_allocation ia
      INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
      WHERE ia.allocation_id = ?`,
      [allocation_id]
    );

    // Get wedding_id from allocation and update wedding costs
    const [allocationData] = await promisePool.query(
      'SELECT wedding_id FROM inventory_allocation WHERE allocation_id = ?',
      [allocation_id]
    );
    if (allocationData.length > 0) {
      await updateWeddingCosts(allocationData[0].wedding_id);
    }

    res.json({
      success: true,
      data: updatedAllocation[0],
      message: 'Inventory allocation updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory allocation',
      message: error.message
    });
  }
});

// Delete inventory allocation
router.delete('/allocations/:allocation_id', async (req, res) => {
  try {
    const {allocation_id} = req.params;

    // Get wedding_id before deleting
    const [allocationBeforeDelete] = await promisePool.query(
      'SELECT wedding_id FROM inventory_allocation WHERE allocation_id = ?',
      [allocation_id]
    );

    const [result] = await promisePool.query(
      'DELETE FROM inventory_allocation WHERE allocation_id = ?',
      [allocation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory allocation not found'
      });
    }

    // Update wedding costs after deletion
    if (allocationBeforeDelete.length > 0) {
      await updateWeddingCosts(allocationBeforeDelete[0].wedding_id);
    }

    res.json({
      success: true,
      message: 'Inventory allocation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete inventory allocation',
      message: error.message
    });
  }
});

module.exports = router;

