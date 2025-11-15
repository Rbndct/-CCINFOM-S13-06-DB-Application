const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getDatabaseStatus,
  testConnection,
  exportDatabase,
  importDatabase,
  createBackup
} = require('../utils/database-utils');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/sql' || file.originalname.endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Only SQL files are allowed'), false);
    }
  }
});

// GET /api/database/status - Get database status
router.get('/status', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting database status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database status',
      message: error.message
    });
  }
});

// GET /api/database/test - Test database connection
router.get('/test', async (req, res) => {
  try {
    const result = await testConnection();
    if (result.connected) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Database connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test database connection',
      message: error.message
    });
  }
});

// POST /api/database/export - Export database
router.post('/export', async (req, res) => {
  try {
    const sqlDump = await exportDatabase();
    
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="database_export_${new Date().toISOString().split('T')[0]}.sql"`);
    res.send(sqlDump);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export database',
      message: error.message
    });
  }
});

// POST /api/database/import - Import database
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const sqlContent = req.file.buffer.toString('utf8');
    const result = await importDatabase(sqlContent);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error importing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import database',
      message: error.message
    });
  }
});

// POST /api/database/backup - Create backup
router.post('/backup', async (req, res) => {
  try {
    const result = await createBackup();
    res.json({
      success: true,
      message: result.message,
      data: {
        filename: result.filename
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup',
      message: error.message
    });
  }
});

module.exports = router;

