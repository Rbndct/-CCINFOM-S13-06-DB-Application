const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wedding_management_db',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('🔍 Checking for duplicate records...\n');

  try {
    // Check couples
    const [couples] = await pool.query(`
      SELECT partner1_name, partner2_name, COUNT(*) as count 
      FROM couple 
      GROUP BY partner1_name, partner2_name 
      HAVING count > 1
    `);
    
    // Check weddings
    const [weddings] = await pool.query(`
      SELECT couple_id, wedding_date, venue, COUNT(*) as count 
      FROM wedding 
      GROUP BY couple_id, wedding_date, venue 
      HAVING count > 1
    `);
    
    // Check guests
    const [guests] = await pool.query(`
      SELECT wedding_id, guest_name, COUNT(*) as count 
      FROM guest 
      GROUP BY wedding_id, guest_name 
      HAVING count > 1
    `);
    
    // Check inventory items
    const [inventory] = await pool.query(`
      SELECT item_name, category, COUNT(*) as count 
      FROM inventory_items 
      GROUP BY item_name, category 
      HAVING count > 1
    `);
    
    // Check couple preferences
    const [preferences] = await pool.query(`
      SELECT couple_id, ceremony_type, COUNT(*) as count 
      FROM couple_preferences 
      GROUP BY couple_id, ceremony_type 
      HAVING count > 1
    `);
    
    // Check table packages
    const [tablePackages] = await pool.query(`
      SELECT table_id, package_id, COUNT(*) as count 
      FROM table_package 
      GROUP BY table_id, package_id 
      HAVING count > 1
    `);
    
    // Check inventory allocations
    const [allocations] = await pool.query(`
      SELECT wedding_id, inventory_id, COUNT(*) as count 
      FROM inventory_allocation 
      GROUP BY wedding_id, inventory_id 
      HAVING count > 1
    `);

    console.log('📊 Duplicate Check Results:\n');
    console.log(`✅ Couples: ${couples.length} duplicate(s)`);
    if (couples.length > 0) {
      console.log('   Details:', JSON.stringify(couples, null, 2));
    }
    
    console.log(`✅ Weddings: ${weddings.length} duplicate(s)`);
    if (weddings.length > 0) {
      console.log('   Details:', JSON.stringify(weddings, null, 2));
    }
    
    console.log(`✅ Guests: ${guests.length} duplicate(s)`);
    if (guests.length > 0) {
      console.log('   Sample (first 5):', JSON.stringify(guests.slice(0, 5), null, 2));
    }
    
    console.log(`✅ Inventory Items: ${inventory.length} duplicate(s)`);
    if (inventory.length > 0) {
      console.log('   Sample (first 5):', JSON.stringify(inventory.slice(0, 5), null, 2));
    }
    
    console.log(`✅ Couple Preferences: ${preferences.length} duplicate(s)`);
    if (preferences.length > 0) {
      console.log('   Sample (first 5):', JSON.stringify(preferences.slice(0, 5), null, 2));
    }
    
    console.log(`✅ Table Packages: ${tablePackages.length} duplicate(s)`);
    if (tablePackages.length > 0) {
      console.log('   Sample (first 5):', JSON.stringify(tablePackages.slice(0, 5), null, 2));
    }
    
    console.log(`✅ Inventory Allocations: ${allocations.length} duplicate(s)`);
    if (allocations.length > 0) {
      console.log('   Sample (first 5):', JSON.stringify(allocations.slice(0, 5), null, 2));
    }

    const totalDuplicates = couples.length + weddings.length + guests.length + 
                           inventory.length + preferences.length + 
                           tablePackages.length + allocations.length;
    
    if (totalDuplicates === 0) {
      console.log('\n✅ No duplicates found! All records are unique.');
    } else {
      console.log(`\n⚠️  Total duplicates found: ${totalDuplicates}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    process.exit(1);
  }
})();

