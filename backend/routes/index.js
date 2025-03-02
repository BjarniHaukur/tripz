const express = require('express');
const destinationRoutes = require('./destinationRoutes');
const flightRoutes = require('./flightRoutes');
const accommodationRoutes = require('./accommodationRoutes');
const budgetRoutes = require('./budgetRoutes');
const costOfLivingRoutes = require('./costOfLivingRoutes');

const router = express.Router();

// Register all routes
router.use('/destinations', destinationRoutes);
router.use('/flights', flightRoutes);
router.use('/accommodations', accommodationRoutes);
router.use('/budget', budgetRoutes);
router.use('/costs', costOfLivingRoutes);

module.exports = router;