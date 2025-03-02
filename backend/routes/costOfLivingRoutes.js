const express = require('express');
const { costOfLivingService } = require('../services');

const router = express.Router();

/**
 * @route GET /api/costs/city
 * @description Get cost of living data for a city
 * @access Public
 */
router.get('/city', async (req, res) => {
  const { city, country } = req.query;
  
  if (!city || !country) {
    return res.status(400).json({ error: 'City and country are required' });
  }
  
  try {
    const costs = await costOfLivingService.getDestinationCosts(city, country);
    res.json(costs);
  } catch (error) {
    console.error('Error in GET /costs/city:', error);
    res.status(500).json({ error: 'Failed to fetch city costs' });
  }
});

/**
 * @route GET /api/costs/exchange-rates
 * @description Get exchange rates
 * @access Public
 */
router.get('/exchange-rates', async (req, res) => {
  const { baseCurrency } = req.query;
  
  try {
    const rates = await costOfLivingService.getExchangeRates(baseCurrency || 'USD');
    res.json(rates);
  } catch (error) {
    console.error('Error in GET /costs/exchange-rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

/**
 * @route GET /api/costs/accommodation
 * @description Get accommodation costs for a destination
 * @access Public
 */
router.get('/accommodation', async (req, res) => {
  const { city, country, days } = req.query;
  
  if (!city || !country) {
    return res.status(400).json({ error: 'City and country are required' });
  }
  
  try {
    const costs = await costOfLivingService.getAccommodationCosts(
      city,
      country,
      Number(days) || 7
    );
    
    res.json(costs);
  } catch (error) {
    console.error('Error in GET /costs/accommodation:', error);
    res.status(500).json({ error: 'Failed to fetch accommodation costs' });
  }
});

module.exports = router;