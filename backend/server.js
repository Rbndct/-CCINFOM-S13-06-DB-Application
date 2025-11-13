const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const guestsRoutes = require('./routes/guests');
const weddingsRoutes = require('./routes/weddings');
const couplesRoutes = require('./routes/couples');
const dietaryRoutes = require('./routes/dietaryRestrictions');
const tablesRoutes = require('./routes/tables');
const healthRoute = require('./routes/health');

// Use routes
app.use('/guests', guestsRoutes);
app.use('/weddings', weddingsRoutes);
app.use('/couples', couplesRoutes);
app.use('/dietary-restrictions', dietaryRoutes);
app.use('/tables', tablesRoutes);
app.use('/health', healthRoute);

// Test route to verify connection
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Wedding System Management API is running!',
    timestamp: new Date().toISOString()
  });
});

// (moved to /health route)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding System Management API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
