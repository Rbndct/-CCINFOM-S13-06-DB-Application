const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  console.warn('   Using default values. For production, set these in .env file.');
  console.warn('   See .env.example for required variables.');
}

// Get database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wedding_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Log configuration (without password)
console.log('🔌 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Password: ${dbConfig.password ? '***' : '(empty)'}`);

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Promise-based wrapper for easier async/await usage
const promisePool = pool.promise();

// Test database connection with detailed error messages
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    
    // Test if we can query the database
    await connection.query('SELECT 1');
    
    // Check if database exists and has tables
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database]);
    if (databases.length === 0) {
      console.error(`❌ Database '${dbConfig.database}' does not exist!`);
      console.error(`   Please create it with: CREATE DATABASE ${dbConfig.database};`);
      connection.release();
      return false;
    }
    
    // Check for common tables
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length === 0) {
      console.warn('⚠️  Database exists but has no tables!');
      console.warn('   You may need to run migration scripts to create tables.');
    } else {
      console.log(`✅ Database connected successfully (${tables.length} table(s) found)`);
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(`   Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error('   → MySQL server is not running or not accessible');
      console.error('   → Make sure MySQL is started: brew services start mysql (macOS)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Access denied - check your DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   → Database '${dbConfig.database}' does not exist`);
      console.error(`   → Create it with: CREATE DATABASE ${dbConfig.database};`);
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('   → Connection lost - MySQL server may have stopped');
    }
    
    return false;
  }
};

// Initialize database connection test
testConnection();

module.exports = { pool, promisePool };
