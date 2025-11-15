#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run this to diagnose database connection issues
 * Usage: node test_db_connection.js
 */

const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wedding_management',
};

console.log('🔍 Database Connection Diagnostic Tool\n');
console.log('Configuration:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  Password: ${dbConfig.password ? '***' : '(empty)'}\n`);

// Test 1: Check if MySQL server is running
console.log('Test 1: Checking MySQL server connection...');
const testConnection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
});

testConnection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to MySQL server');
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}\n`);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Solution: MySQL server is not running');
      console.log('   On macOS: brew services start mysql');
      console.log('   On Linux: sudo systemctl start mysql');
      console.log('   On Windows: Start MySQL service from Services panel\n');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Solution: Check your DB_USER and DB_PASSWORD in .env file\n');
    }
    process.exit(1);
  }
  
  console.log('✅ MySQL server is running\n');
  
  // Test 2: Check if database exists
  console.log('Test 2: Checking if database exists...');
  testConnection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`, (err, results) => {
    if (err) {
      console.error('❌ Error checking databases:', err.message);
      testConnection.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log(`❌ Database '${dbConfig.database}' does not exist\n`);
      console.log('💡 Solution: Create the database');
      console.log(`   Run: CREATE DATABASE ${dbConfig.database};\n`);
      console.log('   Or run the setup script:');
      console.log('   mysql -u root -p < setup_database.sql\n');
      testConnection.end();
      process.exit(1);
    }
    
    console.log(`✅ Database '${dbConfig.database}' exists\n`);
    
    // Test 3: Connect to the database
    console.log('Test 3: Connecting to database...');
    testConnection.query(`USE ${dbConfig.database}`, (err) => {
      if (err) {
        console.error('❌ Failed to use database:', err.message);
        testConnection.end();
        process.exit(1);
      }
      
      console.log('✅ Successfully connected to database\n');
      
      // Test 4: Check tables
      console.log('Test 4: Checking tables...');
      testConnection.query('SHOW TABLES', (err, results) => {
        if (err) {
          console.error('❌ Error checking tables:', err.message);
          testConnection.end();
          process.exit(1);
        }
        
        if (results.length === 0) {
          console.log('⚠️  Database exists but has no tables\n');
          console.log('💡 Solution: Run the setup script to create tables');
          console.log('   mysql -u root -p < setup_database.sql\n');
        } else {
          console.log(`✅ Found ${results.length} table(s):`);
          results.forEach((row) => {
            const tableName = Object.values(row)[0];
            console.log(`   - ${tableName}`);
          });
          console.log('');
        }
        
        // Test 5: Test a simple query
        console.log('Test 5: Testing a simple query...');
        testConnection.query('SELECT 1 as test', (err, results) => {
          if (err) {
            console.error('❌ Query test failed:', err.message);
            testConnection.end();
            process.exit(1);
          }
          
          console.log('✅ Query test successful\n');
          console.log('🎉 All tests passed! Database is ready to use.\n');
          testConnection.end();
          process.exit(0);
        });
      });
    });
  });
});

