const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Handle PORT: if empty string or undefined, use 0 (auto-assign) or fallback to
// 3001
let preferredPort = process.env.PORT;
if (!preferredPort || preferredPort.trim() === '') {
  // If PORT is empty, use 0 to auto-assign a free port
  preferredPort = 0;
} else {
  preferredPort = parseInt(preferredPort, 10) || 3001;
}

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const guestsRoutes = require('./routes/guests');
const weddingsRoutes = require('./routes/weddings');
const couplesRoutes = require('./routes/couples');
const dietaryRoutes = require('./routes/dietary-restrictions');
const tablesRoutes = require('./routes/tables');
const menuItemsRoutes = require('./routes/menu-items');
const packagesRoutes = require('./routes/packages');
const inventoryRoutes = require('./routes/inventory');
const ingredientsRoutes = require('./routes/ingredients');
const reportsRoutes = require('./routes/reports');
const databaseRoutes = require('./routes/database');
const healthRoute = require('./routes/health');

// Use routes
app.use('/guests', guestsRoutes);
app.use('/weddings', weddingsRoutes);
app.use('/couples', couplesRoutes);
app.use('/dietary-restrictions', dietaryRoutes);
app.use('/tables', tablesRoutes);
app.use('/menu-items', menuItemsRoutes);
app.use('/packages', packagesRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/reports', reportsRoutes);
app.use('/database', databaseRoutes);
app.use('/health', healthRoute);

// Store the server instance globally for the test route
let serverInstance = null;

// Test route to verify connection and return port info
app.get('/test', (req, res) => {
  const port = serverInstance ? serverInstance.address().port : null;
  res.json({
    message: 'Wedding System Management API is running!',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Route to get the current port (for frontend auto-detection)
app.get('/port', (req, res) => {
  const port = serverInstance ? serverInstance.address().port : null;
  if (port) {
    res.json({ port: port });
  } else {
    res.status(500).json({ error: 'Server port not available' });
  }
});

// Serve port.txt file for frontend auto-detection
app.get('/port.txt', (req, res) => {
  const port = serverInstance ? serverInstance.address().port : null;
  if (port) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(port.toString());
  } else {
    res.status(500).send('Port not available');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({error: 'Something went wrong!', message: err.message});
});

// Function to save port to file
function savePortToFile(port) {
  const logsDir = path.join(__dirname, 'logs');
  // Ensure logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const portFile = path.join(logsDir, 'port.txt');
  try {
    fs.writeFileSync(portFile, port.toString(), 'utf8');
    console.log(`💾 Port saved to ${portFile}`);
  } catch (err) {
    console.warn(`⚠️ Could not save port to file: ${err.message}`);
  }
}

// Start server with automatic port fallback
const server = app.listen(preferredPort, () => {
  serverInstance = server;
  const actualPort = server.address().port;
  console.log(`🚀 Wedding System Management API running on port ${actualPort}`);
  console.log(`📍 http://localhost:${actualPort}`);
  savePortToFile(actualPort);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${preferredPort} is in use. Selecting a free port...`);
    const fallbackServer = app.listen(0, () => {
      serverInstance = fallbackServer;
      const actualPort = fallbackServer.address().port;
      console.log(`🚀 Server running on new free port ${actualPort}`);
      console.log(`📍 http://localhost:${actualPort}`);
      savePortToFile(actualPort);
    });
  } else {
    console.error(err);
  }
});
