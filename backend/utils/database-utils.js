const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Get database status information
 */
async function getDatabaseStatus() {
  try {
    // Test connection with timeout
    const connection = await promisePool.getConnection();
    try {
      const [rows] = await connection.query('SELECT 1 as test');
      if (!rows || rows.length === 0) {
        throw new Error('Database connection test failed');
      }

      // Get database name
      const [dbRows] = await connection.query('SELECT DATABASE() as db_name');
      const dbName = dbRows[0]?.db_name || 'unknown';

      // Get database size (approximate)
      let size = 'Unknown';
      try {
        const [sizeRows] = await connection.query(`
          SELECT 
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
          FROM information_schema.tables 
          WHERE table_schema = DATABASE()
        `);
        size = sizeRows[0]?.size_mb ? `${sizeRows[0].size_mb} MB` : 'Unknown';
      } catch (sizeError) {
        console.warn('Could not calculate database size:', sizeError.message);
      }

      // Get last backup info (from backups directory if exists)
      let lastBackup = null;
      const backupsDir = path.join(__dirname, '../backups');
      if (fs.existsSync(backupsDir)) {
        try {
          const files = fs.readdirSync(backupsDir)
            .filter(f => f.endsWith('.sql'))
            .map(f => ({
              name: f,
              time: fs.statSync(path.join(backupsDir, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);
          
          if (files.length > 0) {
            lastBackup = new Date(files[0].time).toISOString();
          }
        } catch (backupError) {
          console.warn('Could not read backups directory:', backupError.message);
        }
      }

      return {
        connected: true,
        databaseName: dbName,
        size: size,
        lastBackup: lastBackup
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error getting database status:', error);
    return {
      connected: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1 as test');
    return { connected: true, message: 'Database connection successful' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Export database to SQL dump
 * Note: This is a simplified version. For production, use mysqldump command
 */
async function exportDatabase() {
  try {
    const tables = await getAllTables();
    let sqlDump = '-- Database Export\n';
    sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;
    sqlDump += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

    for (const table of tables) {
      // Get table structure
      const [createTable] = await promisePool.query(`SHOW CREATE TABLE \`${table}\``);
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlDump += `${createTable[0]['Create Table']};\n\n`;

      // Get table data
      const [rows] = await promisePool.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        sqlDump += `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES\n`;
        
        const values = rows.map(row => {
          const vals = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          });
          return `(${vals.join(', ')})`;
        });
        
        sqlDump += values.join(',\n') + ';\n\n';
      }
    }

    sqlDump += 'SET FOREIGN_KEY_CHECKS=1;\n';
    return sqlDump;
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
}

/**
 * Get all tables in the database
 */
async function getAllTables() {
  const [rows] = await promisePool.query('SHOW TABLES');
  const tableKey = Object.keys(rows[0])[0];
  return rows.map(row => row[tableKey]);
}

/**
 * Import database from SQL file
 */
async function importDatabase(sqlContent) {
  try {
    // Split SQL by semicolons, but be careful with semicolons inside strings
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await promisePool.query(statement);
      }
    }

    return { success: true, message: 'Database imported successfully' };
  } catch (error) {
    console.error('Error importing database:', error);
    throw error;
  }
}

/**
 * Create a backup of the database
 */
async function createBackup() {
  try {
    const sqlDump = await exportDatabase();
    const backupsDir = path.join(__dirname, '../backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Create backup file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupsDir, `backup_${timestamp}.sql`);
    
    fs.writeFileSync(backupFile, sqlDump, 'utf8');

    return {
      success: true,
      message: 'Backup created successfully',
      filename: path.basename(backupFile),
      path: backupFile
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

module.exports = {
  getDatabaseStatus,
  testConnection,
  exportDatabase,
  importDatabase,
  createBackup
};

