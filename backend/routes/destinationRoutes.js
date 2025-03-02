const express = require('express');
const { destinationService } = require('../services');

const router = express.Router();

/**
 * @route GET /api/destinations
 * @description Get all destinations
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const destinations = await destinationService.getAllDestinations();
    res.json(destinations);
  } catch (error) {
    console.error('Error in GET /destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

/**
 * @route GET /api/destinations/:id
 * @description Get a specific destination by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const destination = await destinationService.getDestinationDetails(req.params.id);
    res.json(destination);
  } catch (error) {
    console.error(`Error in GET /destinations/${req.params.id}:`, error);
    res.status(404).json({ error: 'Destination not found' });
  }
});

/**
 * @route GET /api/destinations/optimal
 * @description Find optimal destinations based on budget and preferences
 * @access Public
 */
router.get('/optimal', async (req, res) => {
  const { budget, days, origin } = req.query;
  
  if (!budget || !days) {
    return res.status(400).json({ error: 'Budget and days are required' });
  }
  
  try {
    const destinations = await destinationService.findOptimalDestinations(
      Number(budget),
      Number(days),
      origin
    );
    res.json(destinations);
  } catch (error) {
    console.error('Error in GET /destinations/optimal:', error);
    res.status(500).json({ error: 'Failed to find optimal destinations' });
  }
});

module.exports = router;