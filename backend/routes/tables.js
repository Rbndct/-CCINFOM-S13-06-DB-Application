const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

// Helper function to get or create inventory item for a table
async function getOrCreateTableInventoryItem(
    ceremonyType, capacity, connection = null) {
  const db = connection || promisePool;
  const itemName = `Seating Table - ${capacity} seats`;

  // Check if inventory item exists
  const [existingItems] = await db.query(
      'SELECT inventory_id FROM inventory_items WHERE item_name = ?',
      [itemName]);

  if (existingItems.length > 0) {
    return existingItems[0].inventory_id;
  }

  // Create new inventory item if it doesn't exist
  // Pricing: Base table rental + chairs per seat
  // More realistic wedding pricing: Base 300 PHP + (capacity * 25 PHP per
  // chair)
  const basePrice = 300.00;    // Base table rental cost
  const perSeatPrice = 25.00;  // Per chair/seat rental cost
  const rentalCost = basePrice + (capacity * perSeatPrice);

  const [result] = await db.query(
      `INSERT INTO inventory_items (item_name, category, item_condition, quantity_available, unit_rental_cost)
     VALUES (?, 'Furniture', 'Excellent', 999, ?)`,
      [itemName, rentalCost]);

  return result.insertId;
}

// Helper function to get ceremony type from wedding
async function getWeddingCeremonyType(weddingId) {
  const [rows] = await promisePool.query(
      `SELECT cp.ceremony_type 
     FROM wedding w
     LEFT JOIN couple_preferences cp ON w.preference_id = cp.preference_id
     WHERE w.wedding_id = ?`,
      [weddingId]);

  // Default to 'Standard' if no ceremony type found
  return rows.length > 0 && rows[0].ceremony_type ? rows[0].ceremony_type :
                                                    'Standard';
}

// Helper function to create inventory allocation for a table
async function createTableInventoryAllocation(
    weddingId, tableId, capacity, connection = null) {
  const db = connection || promisePool;
  // No longer need ceremony type for inventory item naming
  const inventoryId =
      await getOrCreateTableInventoryItem(null, capacity, connection);

  // Calculate rental cost
  // More realistic wedding pricing: Base 300 PHP + (capacity * 25 PHP per
  // chair)
  const basePrice = 300.00;    // Base table rental cost
  const perSeatPrice = 25.00;  // Per chair/seat rental cost
  const rentalCost = basePrice + (capacity * perSeatPrice);

  // Check if allocation already exists for this table
  const [existingAllocations] = await db.query(
      `SELECT allocation_id FROM inventory_allocation 
     WHERE wedding_id = ? AND inventory_id = ?`,
      [weddingId, inventoryId]);

  if (existingAllocations.length > 0) {
    // Update existing allocation quantity
    await db.query(
        `UPDATE inventory_allocation 
       SET quantity_used = quantity_used + 1, 
           unit_rental_cost = ?
       WHERE allocation_id = ?`,
        [rentalCost, existingAllocations[0].allocation_id]);
    return existingAllocations[0].allocation_id;
  } else {
    // Create new allocation
    const [result] = await db.query(
        `INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost)
       VALUES (?, ?, 1, ?)`,
        [weddingId, inventoryId, rentalCost]);
    return result.insertId;
  }
}

// Helper function to update inventory allocation for a table
async function updateTableInventoryAllocation(
    weddingId, oldCapacity, newCapacity, connection = null) {
  const db = connection || promisePool;
  const ceremonyType = await getWeddingCeremonyType(weddingId);
  const oldItemName = `Seating Table - ${oldCapacity} seats`;
  const newItemName = `Seating Table - ${newCapacity} seats`;

  // Find allocation with old item name
  const [oldAllocations] = await db.query(
      `SELECT ia.allocation_id, ia.quantity_used, ia.inventory_id
     FROM inventory_allocation ia
     INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
     WHERE ia.wedding_id = ? AND ii.item_name = ?`,
      [weddingId, oldItemName]);

  if (oldAllocations.length === 0) {
    // No existing allocation, create new one
    return await createTableInventoryAllocation(
        weddingId, null, newCapacity, connection);
  }

  const oldAllocation = oldAllocations[0];
  const oldQuantity = oldAllocation.quantity_used;

  // Get or create new inventory item
  const newInventoryId = await getOrCreateTableInventoryItem(
      null, newCapacity, connection);

  // Calculate new rental cost
  // More realistic wedding pricing: Base 300 PHP + (capacity * 25 PHP per
  // chair)
  const basePrice = 300.00;    // Base table rental cost
  const perSeatPrice = 25.00;  // Per chair/seat rental cost
  const newRentalCost = basePrice + (newCapacity * perSeatPrice);

  if (oldAllocation.inventory_id === newInventoryId) {
    // Same item, just update the cost
    await db.query(
        `UPDATE inventory_allocation 
       SET unit_rental_cost = ?
       WHERE allocation_id = ?`,
        [newRentalCost, oldAllocation.allocation_id]);
    return oldAllocation.allocation_id;
  } else {
    // Different item, need to transfer quantity
    // Check if new item allocation exists
    const [newAllocations] = await db.query(
        `SELECT allocation_id, quantity_used 
       FROM inventory_allocation 
       WHERE wedding_id = ? AND inventory_id = ?`,
        [weddingId, newInventoryId]);

    if (newAllocations.length > 0) {
      // Update existing new allocation
      await db.query(
          `UPDATE inventory_allocation 
         SET quantity_used = quantity_used + ?, unit_rental_cost = ?
         WHERE allocation_id = ?`,
          [oldQuantity, newRentalCost, newAllocations[0].allocation_id]);
    } else {
      // Create new allocation
      await db.query(
          `INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost)
         VALUES (?, ?, ?, ?)`,
          [weddingId, newInventoryId, oldQuantity, newRentalCost]);
    }

    // Delete old allocation if quantity becomes 0
    if (oldQuantity <= 1) {
      await db.query(
          'DELETE FROM inventory_allocation WHERE allocation_id = ?',
          [oldAllocation.allocation_id]);
    } else {
      // Decrease quantity of old allocation
      await db.query(
          `UPDATE inventory_allocation 
         SET quantity_used = quantity_used - 1
         WHERE allocation_id = ?`,
          [oldAllocation.allocation_id]);
    }

    return newInventoryId;
  }
}

// Helper function to delete inventory allocation for a table
async function deleteTableInventoryAllocation(
    weddingId, capacity, connection = null) {
  const db = connection || promisePool;
  const ceremonyType = await getWeddingCeremonyType(weddingId);
  const itemName = `Seating Table - ${capacity} seats`;

  // Find and update allocation
  const [allocations] = await db.query(
      `SELECT ia.allocation_id, ia.quantity_used
     FROM inventory_allocation ia
     INNER JOIN inventory_items ii ON ia.inventory_id = ii.inventory_id
     WHERE ia.wedding_id = ? AND ii.item_name = ?`,
      [weddingId, itemName]);

  if (allocations.length > 0) {
    const allocation = allocations[0];
    if (allocation.quantity_used <= 1) {
      // Delete allocation if this is the last table
      await db.query(
          'DELETE FROM inventory_allocation WHERE allocation_id = ?',
          [allocation.allocation_id]);
    } else {
      // Decrease quantity
      await db.query(
          `UPDATE inventory_allocation 
         SET quantity_used = quantity_used - 1
         WHERE allocation_id = ?`,
          [allocation.allocation_id]);
    }
  }
}

// Helper to get next table number for a wedding (format: T-001, T-002, etc.)
// All tables share the same numbering sequence regardless of category
async function getNextTableNumber(weddingId) {
  const [rows] = await promisePool.query(
      `SELECT table_number
     FROM seating_table
     WHERE wedding_id = ?
     ORDER BY table_id ASC`,
      [weddingId]);

  // Extract numeric part from existing table numbers (T-001 -> 1, C-001 -> 1,
  // etc.)
  let maxNum = 0;
  for (const row of rows) {
    const tableNum = row.table_number || '';
    // Handle formats: "T-001", "C-001", "t-001", "c-001", or just numbers
    if (tableNum.toLowerCase().startsWith('t-') ||
        tableNum.toLowerCase().startsWith('c-')) {
      const numPart = parseInt(tableNum.substring(2), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    } else {
      const numPart = parseInt(tableNum, 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  // Return in format T-001, T-002, etc. (capital T, all tables use same
  // sequence)
  const nextNum = maxNum + 1;
  return `T-${String(nextNum).padStart(3, '0')}`;
}

// Create Couple Table (capacity 2 by default)
router.post('/seating/:wedding_id/couple', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const weddingId = req.params.wedding_id;
    const {capacity} = req.body;
    const cap = capacity ? Number(capacity) : 2;  // Default to 2

    // Validate capacity: must be 2, 6, 8, or 10 (matching inventory items)
    // For couple table, default to 2 but allow other valid sizes
    const validCapacities = [2, 6, 8, 10];
    if (!Number.isInteger(cap) || !validCapacities.includes(cap)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Capacity must be 2, 6, 8, or 10 seats (matching available inventory)'
      });
    }

    // Get next table number (all tables share same sequence)
    const nextNum = await getNextTableNumber(weddingId);

    const [ins] = await connection.query(
        `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, ?, 'couple', ?)`,
        [weddingId, nextNum, cap]);

    // Auto-create inventory allocation
    await createTableInventoryAllocation(
        weddingId, ins.insertId, cap, connection);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Couple table created',
      data: {
        table_id: ins.insertId,
        wedding_id: Number(weddingId),
        table_number: nextNum,
        table_category: 'couple',
        capacity: cap
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating couple table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create couple table',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Create Guest Table (capacity 1-15 inclusive)
router.post('/seating/:wedding_id/guest', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const weddingId = req.params.wedding_id;
    const {capacity, table_category} = req.body;
    const cap = Number(capacity);
    const category = table_category || 'guest';

    // Validate capacity: must be 2, 6, 8, or 10 (matching inventory items)
    const validCapacities = [2, 6, 8, 10];
    if (!Number.isInteger(cap) || !validCapacities.includes(cap)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Capacity must be 2, 6, 8, or 10 seats (matching available inventory)'
      });
    }

    const nextNum = await getNextTableNumber(weddingId);
    const [ins] = await connection.query(
        `INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES (?, ?, ?, ?)`,
        [weddingId, nextNum, category, cap]);

    // Auto-create inventory allocation
    await createTableInventoryAllocation(
        weddingId, ins.insertId, cap, connection);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Table created',
      data: {
        table_id: ins.insertId,
        wedding_id: Number(weddingId),
        table_number: nextNum,
        table_category: category,
        capacity: cap
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create table',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Assign guests to a table (enforce max capacity) - works for all table types
router.post('/seating/:wedding_id/guest/:table_id/assign', async (req, res) => {
  try {
    const weddingId = Number(req.params.wedding_id);
    const tableId = Number(req.params.table_id);
    const {guest_ids} = req.body;  // array

    if (!Array.isArray(guest_ids) || guest_ids.length === 0) {
      return res.status(400).json(
          {success: false, error: 'guest_ids must be a non-empty array'});
    }

    // Validate all guest_ids are numbers
    const invalidIds = guest_ids.filter(id => !Number.isInteger(Number(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json(
          {success: false, error: 'All guest_ids must be valid integers'});
    }

    const [tableRows] = await promisePool.query(
        `SELECT table_id, wedding_id, table_category, capacity FROM seating_table WHERE table_id = ?`,
        [tableId]);
    if (tableRows.length === 0) {
      return res.status(404).json({success: false, error: 'Table not found'});
    }
    if (tableRows[0].wedding_id !== weddingId) {
      return res.status(400).json(
          {success: false, error: 'Table does not belong to this wedding'});
    }

    const capacity = tableRows[0].capacity;

    const [cntRows] = await promisePool.query(
        `SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?`, [tableId]);
    const current = cntRows[0].cnt || 0;
    const totalAfterAssignment = current + guest_ids.length;

    if (totalAfterAssignment > capacity) {
      return res.status(409).json({
        success: false,
        error: `Assigning exceeds table capacity. Table capacity: ${
            capacity}, Currently assigned: ${current}, Trying to assign: ${
            guest_ids.length}, Total would be: ${totalAfterAssignment}`
      });
    }

    // Validate guests exist and belong to this wedding
    const placeholders = guest_ids.map(() => '?').join(',');
    const [guestCheckRows] = await promisePool.query(
        `SELECT guest_id FROM guest WHERE guest_id IN (${
            placeholders}) AND wedding_id = ?`,
        [...guest_ids, weddingId]);

    if (guestCheckRows.length !== guest_ids.length) {
      const foundIds = guestCheckRows.map(r => r.guest_id);
      const missingIds = guest_ids.filter(id => !foundIds.includes(Number(id)));
      return res.status(400).json({
        success: false,
        error:
            `Some guests not found or don't belong to this wedding. Missing: ${
                missingIds.join(', ')}`
      });
    }

    // Update guest table assignments
    const updatePlaceholders = guest_ids.map(() => '?').join(',');
    await promisePool.query(
        `UPDATE guest SET table_id = ? WHERE guest_id IN (${
            updatePlaceholders}) AND wedding_id = ?`,
        [tableId, ...guest_ids.map(id => Number(id)), weddingId]);

    res.json({success: true, message: 'Guests assigned to table'});
  } catch (error) {
    console.error('Error assigning guests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign guests',
      message: error.message
    });
  }
});

// List seating tables with guest counts
router.get('/seating/:wedding_id', async (req, res) => {
  try {
    const weddingId = req.params.wedding_id;
    const [rows] = await promisePool.query(
        `SELECT st.*, 
        COALESCE(gcnt.cnt, 0) AS guest_count
       FROM seating_table st
       LEFT JOIN (
         SELECT table_id, COUNT(*) AS cnt FROM guest GROUP BY table_id
       ) gcnt ON st.table_id = gcnt.table_id
       WHERE st.wedding_id = ?
       ORDER BY CASE WHEN st.table_category = 'couple' THEN 0 ELSE 1 END, 
                CASE WHEN st.table_category = 'couple' THEN 0 ELSE CAST(st.table_number AS UNSIGNED) END`,
        [weddingId]);
    res.json({success: true, data: rows, count: rows.length});
  } catch (error) {
    console.error('Error listing seating tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list seating',
      message: error.message
    });
  }
});


// Delete a table (ALLOW deleting ALL tables, including those with guests)
router.delete('/seating/:table_id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const tableId = req.params.table_id;
    const [rows] = await connection.query(
        'SELECT wedding_id, capacity FROM seating_table WHERE table_id = ? LIMIT 1',
        [tableId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Table not found'});
    }

    const weddingId = rows[0].wedding_id;
    const capacity = rows[0].capacity;

    // Remove all guest assignments from this table first
    await connection.query(
        'UPDATE guest SET table_id = NULL WHERE table_id = ?', [tableId]);

    // Delete the table (both couple and guest tables can be deleted)
    await connection.query(
        'DELETE FROM seating_table WHERE table_id = ?', [tableId]);

    // Auto-delete/update inventory allocation
    await deleteTableInventoryAllocation(weddingId, capacity, connection);

    await connection.commit();
    res.json({
      success: true,
      message:
          'Table deleted successfully. Guests have been unassigned and inventory allocation updated.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete table',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Update table (capacity for all tables)
router.put('/seating/:table_id', async (req, res) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();

    const tableId = req.params.table_id;
    const {capacity} = req.body;

    // Check if table exists
    const [rows] = await connection.query(
        'SELECT wedding_id, table_category, capacity FROM seating_table WHERE table_id = ? LIMIT 1',
        [tableId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({success: false, error: 'Table not found'});
    }

    const weddingId = rows[0].wedding_id;
    const tableCategory = rows[0].table_category;
    const oldCapacity = rows[0].capacity;
    const cap = Number(capacity);

    // Validate capacity based on table category
    if (tableCategory === 'couple') {
      // Couple table: minimum 2, maximum 15
      if (!Number.isInteger(cap) || cap < 2 || cap > 15) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Couple table capacity must be an integer between 2 and 15'
        });
      }
    } else {
      // Other tables: minimum 1, maximum 15
      if (!Number.isInteger(cap) || cap < 1 || cap > 15) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Capacity must be an integer between 1 and 15'
        });
      }
    }

    // Check current assigned guests
    const [cntRows] = await connection.query(
        'SELECT COUNT(*) AS cnt FROM guest WHERE table_id = ?', [tableId]);
    const currentAssigned = cntRows[0]?.cnt || 0;
    if (cap < currentAssigned) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        error:
            `Capacity cannot be less than assigned guests (${currentAssigned})`
      });
    }

    // Update table capacity
    await connection.query(
        'UPDATE seating_table SET capacity = ? WHERE table_id = ?',
        [cap, tableId]);

    // Auto-update inventory allocation if capacity changed
    if (oldCapacity !== cap) {
      await updateTableInventoryAllocation(
          weddingId, oldCapacity, cap, connection);
    }

    await connection.commit();
    res.json({
      success: true,
      message: 'Table updated successfully and inventory allocation updated.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update table',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
