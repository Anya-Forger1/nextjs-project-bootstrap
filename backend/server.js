const express = require('express');
const cors = require('cors');
const path = require('path');
const salesRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sales Forecast API server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/medicines`);
  console.log(`   GET http://localhost:${PORT}/api/sales?medicine=X&month=Y&week=Z`);
  console.log(`   GET http://localhost:${PORT}/api/recommendations`);
});

module.exports = app;
