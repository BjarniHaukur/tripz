const express = require('express');
const { accommodationService } = require('../services');

const router = express.Router();

/**
 * @route GET /api/accommodations
 * @description Search for accommodations
 * @access Public
 */
router.get('/', async (req, res) => {
  const { destination, checkIn, checkOut, adults, currency } = req.query;
  
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }
  
  try {
    // Get destination ID
    const destinationId = await accommodationService.getDestinationId(destination);
    
    // Get accommodations
    const accommodations = await accommodationService.searchAccommodations(
      destinationId,
      checkIn,
      checkOut,
      Number(adults) || 2,
      currency || 'USD'
    );
    
    res.json(accommodations);
  } catch (error) {
    console.error('Error in GET /accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

/**
 * @route GET /api/accommodations/prices
 * @description Get average accommodation prices for a destination
 * @access Public
 */
router.get('/prices', async (req, res) => {
  const { destination, days } = req.query;
  
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }
  
  try {
    const prices = await accommodationService.getAverageAccommodationPrices(
      destination,
      Number(days) || 7
    );
    
    res.json(prices);
  } catch (error) {
    console.error('Error in GET /accommodations/prices:', error);
    res.status(500).json({ error: 'Failed to fetch accommodation prices' });
  }
});

module.exports = router;