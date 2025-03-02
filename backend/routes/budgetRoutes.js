const express = require('express');
const { budgetService } = require('../services');

const router = express.Router();

/**
 * @route GET /api/budget/analysis
 * @description Analyze budget for a specific destination
 * @access Public
 */
router.get('/analysis', async (req, res) => {
  const { destination, budget, days, origin } = req.query;
  
  if (!destination || !budget || !days) {
    return res.status(400).json({ error: 'Destination, budget, and days are required' });
  }
  
  try {
    const analysis = await budgetService.analyzeBudget(
      destination,
      Number(budget),
      Number(days),
      origin || 'NYC'
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Error in GET /budget/analysis:', error);
    res.status(500).json({ error: 'Failed to analyze budget' });
  }
});

/**
 * @route GET /api/budget/optimal-duration
 * @description Find optimal trip duration for a given budget
 * @access Public
 */
router.get('/optimal-duration', async (req, res) => {
  const { destination, budget, origin } = req.query;
  
  if (!destination || !budget) {
    return res.status(400).json({ error: 'Destination and budget are required' });
  }
  
  try {
    const analysis = await budgetService.findOptimalDuration(
      destination,
      Number(budget),
      origin || 'NYC'
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Error in GET /budget/optimal-duration:', error);
    res.status(500).json({ error: 'Failed to find optimal duration' });
  }
});

module.exports = router;