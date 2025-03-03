const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const apiRoutes = require('./routes');
const mockData = require('./mockData');
const { utils } = require('./services');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    apiMode: process.env.USE_MOCK_DATA === 'true' ? 'mock' : 'live',
    cacheStats: utils.cache.getStats(),
    environment: process.env.NODE_ENV
  });
});

// Check if we should use mock data (for development without API keys)
if (process.env.USE_MOCK_DATA === 'true') {
  console.log('Using mock data for API responses');
  
  // Mock API endpoints
  app.get('/api/destinations', (req, res) => {
    res.json(mockData.destinations);
  });

  // Individual destination endpoint
  app.get('/api/destinations/:id', (req, res) => {
    const destination = mockData.destinations.find(d => d.id === req.params.id);
    
    if (destination) {
      return res.json(destination);
    }
    
    res.status(404).json({ error: 'Destination not found' });
  });

  app.get('/api/flights', (req, res) => {
    const { origin, budget } = req.query;
    
    let results = mockData.flights;
    
    if (origin) {
      results = results.filter(flight => flight.origin.toLowerCase() === origin.toLowerCase());
    }
    
    if (budget) {
      results = results.filter(flight => flight.price <= parseInt(budget));
    }
    
    res.json(results);
  });

  app.get('/api/accommodations', (req, res) => {
    const { destination } = req.query;
    
    let results = mockData.accommodations;
    
    if (destination) {
      results = results.filter(acc => acc.destination.toLowerCase() === destination.toLowerCase());
    }
    
    res.json(results);
  });

  app.get('/api/budget/analysis', (req, res) => {
    const { destination, budget, days } = req.query;
    
    if (!destination || !budget || !days) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const dest = mockData.destinations.find(d => d.id === destination);
    
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    const flight = mockData.flights.find(f => f.destination === destination);
    const flightCost = flight ? flight.price : 0;
    
    const dailyCosts = {
      accommodation: dest.costs.accommodation,
      food: dest.costs.food,
      transportation: dest.costs.transportation,
      activities: dest.costs.activities
    };
    
    const totalDailyCost = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0);
    const totalAccommodationCost = dailyCosts.accommodation * parseInt(days);
    const totalFoodCost = dailyCosts.food * parseInt(days);
    const totalTransportationCost = dailyCosts.transportation * parseInt(days);
    const totalActivitiesCost = dailyCosts.activities * parseInt(days);
    const totalTripCost = flightCost + (totalDailyCost * parseInt(days));
    
    const remainingBudget = parseInt(budget) - totalTripCost;
    const isWithinBudget = remainingBudget >= 0;
    
    const analysis = {
      destination: dest.name,
      budget: parseInt(budget),
      days: parseInt(days),
      costs: {
        flight: flightCost,
        accommodation: totalAccommodationCost,
        food: totalFoodCost,
        transportation: totalTransportationCost,
        activities: totalActivitiesCost,
        total: totalTripCost
      },
      dailyCost: totalDailyCost,
      remainingBudget,
      isWithinBudget
    };
    
    res.json(analysis);
  });

  app.get('/api/destinations/optimal', (req, res) => {
    const { budget, days, origin } = req.query;
    
    if (!budget || !days) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const results = mockData.destinations.map(dest => {
      const flight = mockData.flights.find(f => f.destination === dest.id && 
                               (!origin || f.origin.toLowerCase() === origin.toLowerCase()));
      
      if (!flight) return null;
      
      const flightCost = flight.price;
      const dailyCost = dest.costs.accommodation + dest.costs.food + 
                    dest.costs.transportation + dest.costs.activities;
      const totalCost = flightCost + (dailyCost * parseInt(days));
      
      return {
        id: dest.id,
        name: dest.name,
        country: dest.country,
        totalCost,
        flightCost,
        dailyCost,
        isWithinBudget: totalCost <= parseInt(budget),
        savingsAmount: parseInt(budget) - totalCost,
        imageUrl: dest.imageUrl,
        currency: dest.currency
      };
    }).filter(item => item && item.isWithinBudget)
      .sort((a, b) => b.savingsAmount - a.savingsAmount);
    
    res.json(results);
  });
} else {
  // Use real API routes with mock data fallback
  app.use('/api', apiRoutes);
  
  // Add fallback route for individual destinations after regular routes
  app.get('/api/destinations/:id', (req, res) => {
    const destination = mockData.destinations.find(d => d.id === req.params.id);
    
    if (destination) {
      return res.json(destination);
    }
    
    res.status(404).json({ error: 'Destination not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});