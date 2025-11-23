const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Execute SQL file
 */
async function executeSQLFile(filePath) {
  try {
    console.log(`\n📄 Reading: ${path.basename(filePath)}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Get a connection for this file to maintain session variables
    const connection = await promisePool.getConnection();
    
    try {
      // Remove comments but keep SET @ statements
      let processedContent = sqlContent;
      
      // Remove single-line comments (but preserve SET @ statements that might have comments)
      processedContent = processedContent.replace(/--(?!.*@).*$/gm, '');
      
      // Remove multi-line comments
      processedContent = processedContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Split by semicolons but preserve order
      const rawStatements = processedContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.match(/^(USE|SET FOREIGN_KEY)/i));
      
      console.log(`   Found ${rawStatements.length} statement(s) to execute`);
      
      // Execute statements in order (SET @ statements must come before statements that use them)
      let executed = 0;
      for (const statement of rawStatements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
            executed++;
          } catch (error) {
            // Ignore "table doesn't exist" errors for DROP/DELETE statements
            if (error.code === 'ER_BAD_TABLE_ERROR' && (statement.toUpperCase().includes('DROP') || statement.toUpperCase().includes('DELETE'))) {
              console.log(`   ⚠️  Warning: ${error.message} (ignored - table may not exist)`);
              continue;
            }
            // Ignore duplicate entry errors
            if (error.code === 'ER_DUP_ENTRY') {
              console.log(`   ⚠️  Warning: Duplicate entry (ignored)`);
              continue;
            }
            // Ignore foreign key constraint errors for NULL values (should be allowed)
            if (error.code === 'ER_NO_REFERENCED_ROW_2' && statement.includes('NULL')) {
              console.log(`   ⚠️  Warning: Foreign key constraint (NULL value) - continuing`);
              continue;
            }
            // Ignore "column cannot be null" if it's a constraint issue we can work around
            if (error.code === 'ER_BAD_NULL_ERROR') {
              console.log(`   ⚠️  Warning: ${error.message}`);
              console.log(`   ⚠️  This might be due to missing prerequisite data. Continuing...`);
              continue;
            }
            throw error;
          }
        }
      }
      
      console.log(`   ✅ Executed ${executed} statement(s) successfully`);
      return { success: true, executed };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`   ❌ Error executing ${path.basename(filePath)}:`, error.message);
    if (error.sql) {
      console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
    }
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting database script execution...\n');
  console.log('⚠️  Note: Make sure setup_database.sql has already been run!');
  console.log('🧹 All previous data will be cleaned before inserting fresh data\n');

  const scriptsDir = path.join(__dirname);
  
  // Always run cleanup script first to remove all previous data
  const cleanupScript = '00_cleanup_duplicates.sql';
  
  const scripts = [
    cleanupScript, // Always run cleanup first to remove previous data
    '01_insert_food_data.sql', // Food data, dietary restrictions, ingredients, menu items, packages
    '02_insert_couples.sql', // Couple records
    '03_insert_weddings_and_guests.sql', // Weddings (2024-2025), guests, preferences, table packages, cost calculations
    '04_insert_inventory_items.sql' // Inventory items for rentals
    // Optional: '05_assign_couple_restrictions.sql' - Adds even more preferences per couple (if needed)
  ];
  
  console.log('🧹 Cleanup mode: Will remove all previous data before inserting fresh data\n');

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    await promisePool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Execute scripts in order
    for (const script of scripts) {
      const scriptPath = path.join(scriptsDir, script);
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️  Skipping ${script} (file not found)`);
        continue;
      }
      await executeSQLFile(scriptPath);
    }

    console.log('\n✅ All scripts executed successfully!');
    
    // Verify data
    console.log('\n📊 Verifying data...');
    const [counts] = await promisePool.query(`
      SELECT 
        (SELECT COUNT(*) FROM couple) as couples,
        (SELECT COUNT(*) FROM wedding) as weddings,
        (SELECT COUNT(*) FROM guest) as guests,
        (SELECT COUNT(*) FROM menu_item) as menu_items,
        (SELECT COUNT(*) FROM package) as packages,
        (SELECT COUNT(*) FROM dietary_restriction) as restrictions,
        (SELECT COUNT(*) FROM seating_table) as tables,
        (SELECT COUNT(*) FROM inventory_items) as inventory_items
    `);
    
    console.log('\n📈 Database Statistics:');
    console.log(`   Couples: ${counts[0].couples}`);
    console.log(`   Weddings: ${counts[0].weddings}`);
    console.log(`   Guests: ${counts[0].guests}`);
    console.log(`   Menu Items: ${counts[0].menu_items}`);
    console.log(`   Packages: ${counts[0].packages}`);
    console.log(`   Dietary Restrictions: ${counts[0].restrictions}`);
    console.log(`   Tables: ${counts[0].tables}`);
    console.log(`   Inventory Items: ${counts[0].inventory_items}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { executeSQLFile };

