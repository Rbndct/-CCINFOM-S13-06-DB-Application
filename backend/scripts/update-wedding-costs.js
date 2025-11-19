const { promisePool } = require('../config/database');

/**
 * Update all existing weddings' total_cost to use selling_price instead of unit_cost
 * This ensures consistency across the system
 */
async function updateAllWeddingCosts() {
  try {
    console.log('🔄 Updating wedding costs for all weddings...\n');
    
    // Get all weddings
    const [weddings] = await promisePool.query('SELECT wedding_id FROM wedding');
    
    console.log(`Found ${weddings.length} wedding(s) to update\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const wedding of weddings) {
      const weddingId = wedding.wedding_id;
      
      try {
        // Calculate equipment rental cost
        const [inventoryCosts] = await promisePool.query(
          `SELECT COALESCE(SUM(quantity_used * unit_rental_cost), 0) as equipment_rental_cost
           FROM inventory_allocation
           WHERE wedding_id = ?`,
          [weddingId]
        );
        const equipmentRentalCost = parseFloat(inventoryCosts[0]?.equipment_rental_cost || 0);
        
        // Calculate food cost (unit_cost for internal tracking)
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
          [weddingId]
        );
        const foodCost = parseFloat(foodCosts[0]?.food_cost || 0);
        
        // Calculate total invoice amount (selling_price)
        const [invoiceAmounts] = await promisePool.query(
          `SELECT COALESCE(SUM(p.selling_price), 0) as total_invoice_amount
          FROM table_package tp
          JOIN seating_table st ON tp.table_id = st.table_id
          JOIN package p ON tp.package_id = p.package_id
          WHERE st.wedding_id = ?`,
          [weddingId]
        );
        const totalInvoiceAmount = parseFloat(invoiceAmounts[0]?.total_invoice_amount || 0);
        const totalCost = equipmentRentalCost + totalInvoiceAmount;
        
        // Update wedding
        await promisePool.query(
          `UPDATE wedding 
           SET equipment_rental_cost = ?,
               food_cost = ?,
               total_cost = ?
           WHERE wedding_id = ?`,
          [equipmentRentalCost, foodCost, totalCost, weddingId]
        );
        
        updated++;
        console.log(`  ✅ Wedding #${weddingId}: Updated total_cost to ${totalCost.toFixed(2)}`);
      } catch (error) {
        errors++;
        console.error(`  ❌ Wedding #${weddingId}: Error - ${error.message}`);
      }
    }
    
    console.log(`\n✅ Update complete!`);
    console.log(`   Updated: ${updated} wedding(s)`);
    if (errors > 0) {
      console.log(`   Errors: ${errors} wedding(s)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating wedding costs:', error);
    process.exit(1);
  }
}

updateAllWeddingCosts();

