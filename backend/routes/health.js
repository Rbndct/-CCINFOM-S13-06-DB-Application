const express = require('express');
const router = express.Router();
const {promisePool} = require('../config/database');

router.get('/', async (req, res) => {
  try {
    // Test basic connection
    await promisePool.query('SELECT 1');

    // Get table count
    const [tables] = await promisePool.query('SHOW TABLES');
    const tableCount = tables.length;

    // Get database name
    const [dbInfo] = await promisePool.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || 'unknown';

    res.json({
      status: 'ok',
      database: {name: dbName, connected: true, tableCount: tableCount}
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'down',
      error: 'Database unavailable',
      message: error.message,
      code: error.code
    });
  }
});

module.exports = router;
