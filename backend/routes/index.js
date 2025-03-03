const express = require('express');
const destinationRoutes = require('./destinationRoutes');
const flightRoutes = require('./flightRoutes');
const accommodationRoutes = require('./accommodationRoutes');
const budgetRoutes = require('./budgetRoutes');
const costOfLivingRoutes = require('./costOfLivingRoutes');

const router = express.Router();

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    apiMode: process.env.USE_MOCK_DATA === 'true' ? 'mock' : 'live',
    cacheStats: {
      keys: 0,
      hits: 0,
      misses: 0
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register all routes
router.use('/destinations', destinationRoutes);
router.use('/flights', flightRoutes);
router.use('/accommodations', accommodationRoutes);
router.use('/budget', budgetRoutes);
router.use('/costs', costOfLivingRoutes);


module.exports = router;