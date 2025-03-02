const express = require('express');
const { flightService } = require('../services');

const router = express.Router();

/**
 * @route GET /api/flights
 * @description Search for flights
 * @access Public
 */
router.get('/', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults } = req.query;
  
  try {
    // If destination is provided, get flights for that destination
    if (destination) {
      const flights = await flightService.getCheapestFlights(
        destination,
        origin ? [origin] : ['NYC', 'LAX', 'CHI'],
        departureDate,
        returnDate
      );
      return res.json(flights);
    }
    
    // If origin and destination are provided, search for specific flights
    if (origin && destination) {
      const results = await flightService.searchFlights(
        origin,
        destination,
        departureDate,
        returnDate,
        Number(adults) || 1
      );
      return res.json(results);
    }
    
    // Otherwise, return an error
    res.status(400).json({ error: 'Origin or destination is required' });
  } catch (error) {
    console.error('Error in GET /flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

module.exports = router;