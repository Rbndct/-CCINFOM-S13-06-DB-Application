const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runSetup() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Get database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    console.log(`🔌 Connecting to MySQL at ${dbConfig.host} as ${dbConfig.user}...`);
    
    // Connect without specifying database (since it might not exist yet)
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL\n');

    // Read the setup SQL file
    const setupFilePath = path.join(__dirname, '../database/setup_database.sql');
    console.log(`📄 Reading: ${path.basename(setupFilePath)}`);
    const sqlContent = fs.readFileSync(setupFilePath, 'utf8');
    
    // Execute the entire SQL file
    console.log('⚙️  Executing database setup...');
    await connection.query(sqlContent);
    
    console.log('✅ Database setup completed successfully!\n');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database setup:', error.message);
    if (error.sql) {
      console.error('SQL Error:', error.sql.substring(0, 200));
    }
    process.exit(1);
  }
}

runSetup();



