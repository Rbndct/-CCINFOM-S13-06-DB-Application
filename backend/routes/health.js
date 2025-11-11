const express = require('express');
const router = express.Router();
const {promisePool} = require('../db');

router.get('/', async (req, res) => {
  try {
    await promisePool.query('SELECT 1');
    res.json({status: 'ok'});
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({status: 'down', error: 'Database unavailable'});
  }
});

module.exports = router;
