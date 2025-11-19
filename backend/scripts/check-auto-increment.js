const { promisePool } = require('../config/database');

async function checkAutoIncrement() {
  try {
    const tables = [
      'table_package',
      'package_menu_items',
      'menu_item_restrictions',
      'guest_restrictions',
      'couple_preference_restrictions'
    ];

    // Check using information_schema (more reliable)
    const [result] = await promisePool.query(`
      SELECT TABLE_NAME, AUTO_INCREMENT 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN (?, ?, ?, ?, ?)
      ORDER BY TABLE_NAME
    `, tables);

    console.log('\n📊 AUTO_INCREMENT Status:\n');
    result.forEach(row => {
      const nextId = row.AUTO_INCREMENT || 'NULL';
      console.log(`  ${row.TABLE_NAME.padEnd(35)}: ${nextId}`);
    });
    
    // Also check max IDs to verify
    console.log('\n📈 Current Max IDs:\n');
    for (const tableName of tables) {
      let idColumn = 'id';
      if (tableName === 'table_package') idColumn = 'assignment_id';
      if (tableName === 'package_menu_items') idColumn = 'package_menu_id';
      
      const [maxResult] = await promisePool.query(`SELECT MAX(${idColumn}) as max_id FROM ${tableName}`);
      const maxId = maxResult[0]?.max_id || 0;
      console.log(`  ${tableName.padEnd(35)}: ${maxId}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAutoIncrement();

