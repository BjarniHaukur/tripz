const { cachedRequest } = require('./utils');
const { getCheapestFlights } = require('./flightService');
const { getAccommodationCosts } = require('./costOfLivingService');
require('dotenv').config();

// In a real application, we would use a database for this
// For now, we'll use a hardcoded list of popular destinations
const popularDestinations = [
  { id: 'bkk', city: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
  { id: 'lsb', city: 'Lisbon', country: 'Portugal', image: 'https://images.unsplash.com/photo-1558370781-d6196949e317' },
  { id: 'hcmc', city: 'Ho Chi Minh City', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482' },
  { id: 'bcn', city: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
  { id: 'prg', city: 'Prague', country: 'Czech Republic', image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef' },
  { id: 'tky', city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26' },
  { id: 'cdmx', city: 'Mexico City', country: 'Mexico', image: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396' },
  { id: 'brl', city: 'Berlin', country: 'Germany', image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f' },
  { id: 'ist', city: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200' },
  { id: 'bkk', city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2' },
  { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325' },
  { id: 'cpt', city: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99' }
];

/**
 * Get destination description from Google Knowledge Graph API
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<string>} - Destination description
 */
const getDestinationDescription = async (city, country) => {
  try {
    // For demo purposes, we'll return a hardcoded description
    // In a real application, you would call an API like Google Knowledge Graph
    return `${city} is a vibrant city in ${country} known for its unique culture, delicious food, and beautiful landscapes.`;
  } catch (error) {
    console.error(`Error getting description for ${city}, ${country}:`, error);
    return `${city}, ${country}`;
  }
};

/**
 * Get best time to visit information
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<Array<string>>} - Array of best months to visit
 */
const getBestTimeToVisit = async (city, country) => {
  try {
    // For demo purposes, we'll return hardcoded data
    // In a real application, you would call a climate API
    const bestTimes = {
      'Bangkok': ['November', 'December', 'January', 'February'],
      'Lisbon': ['March', 'April', 'May', 'September', 'October'],
      'Ho Chi Minh City': ['December', 'January', 'February', 'March'],
      'Barcelona': ['April', 'May', 'June', 'September', 'October'],
      'Prague': ['March', 'April', 'May', 'September', 'October'],
      'Tokyo': ['March', 'April', 'October', 'November'],
      'Mexico City': ['March', 'April', 'May', 'October', 'November'],
      'Berlin': ['May', 'June', 'July', 'August', 'September'],
      'Istanbul': ['April', 'May', 'June', 'September', 'October'],
      'Bali': ['April', 'May', 'June', 'September', 'October'],
      'Rio de Janeiro': ['March', 'April', 'May', 'September', 'October'],
      'Cape Town': ['February', 'March', 'April', 'September', 'October']
    };
    
    return bestTimes[city] || ['April', 'May', 'September', 'October'];
  } catch (error) {
    console.error(`Error getting best time to visit for ${city}, ${country}:`, error);
    return ['April', 'May', 'September', 'October'];
  }
};

/**
 * Get destination categories
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<Array<string>>} - Array of categories
 */
const getDestinationCategories = async (city, country) => {
  try {
    // For demo purposes, we'll return hardcoded data
    // In a real application, you would determine this from a database or API
    const categories = {
      'Bangkok': ['food', 'culture', 'nightlife', 'shopping'],
      'Lisbon': ['beach', 'culture', 'food', 'architecture'],
      'Ho Chi Minh City': ['food', 'culture', 'history', 'shopping'],
      'Barcelona': ['beach', 'architecture', 'food', 'nightlife'],
      'Prague': ['history', 'architecture', 'beer', 'culture'],
      'Tokyo': ['food', 'technology', 'shopping', 'culture'],
      'Mexico City': ['food', 'culture', 'history', 'arts'],
      'Berlin': ['nightlife', 'history', 'arts', 'culture'],
      'Istanbul': ['history', 'culture', 'food', 'architecture'],
      'Bali': ['beach', 'nature', 'spirituality', 'relaxation'],
      'Rio de Janeiro': ['beach', 'nightlife', 'culture', 'natural beauty'],
      'Cape Town': ['nature', 'beach', 'food', 'adventure']
    };
    
    return categories[city] || ['culture', 'food', 'sightseeing'];
  } catch (error) {
    console.error(`Error getting categories for ${city}, ${country}:`, error);
    return ['culture', 'food', 'sightseeing'];
  }
};

/**
 * Get detailed information for a destination
 * @param {string} destinationId - Destination ID
 * @returns {Promise<Object>} - Detailed destination information
 */
const getDestinationDetails = async (destinationId) => {
  // Find the destination in our list
  const destination = popularDestinations.find(d => d.id === destinationId);
  if (!destination) {
    throw new Error(`Destination with ID ${destinationId} not found`);
  }
  
  try {
    // Get all the data we need for this destination
    const [
      description,
      costData,
      bestTime,
      categories
    ] = await Promise.all([
      getDestinationDescription(destination.city, destination.country),
      getAccommodationCosts(destination.city, destination.country),
      getBestTimeToVisit(destination.city, destination.country),
      getDestinationCategories(destination.city, destination.country)
    ]);
    
    // Combine all the data
    return {
      id: destination.id,
      name: destination.city,
      country: destination.country,
      description,
      imageUrl: destination.image,
      currency: costData.destination.currency,
      exchangeRate: costData.destination.exchangeRate,
      costs: costData.dailyCosts,
      detailedCosts: costData.detailedCosts,
      totalDailyCost: costData.totalDailyCost,
      bestTimeToVisit: bestTime,
      categories
    };
  } catch (error) {
    console.error(`Error getting details for destination ${destinationId}:`, error);
    throw error;
  }
};

/**
 * Get all available destinations
 * @returns {Promise<Array<Object>>} - Array of destinations with basic info
 */
const getAllDestinations = async () => {
  try {
    const destinations = await Promise.all(
      popularDestinations.map(async (dest) => {
        try {
          // Get cost data for each destination
          const costData = await getAccommodationCosts(dest.city, dest.country);
          
          // Get description
          const description = await getDestinationDescription(dest.city, dest.country);
          
          return {
            id: dest.id,
            name: dest.city,
            country: dest.country,
            description,
            imageUrl: dest.image,
            currency: costData.destination.currency,
            exchangeRate: costData.destination.exchangeRate,
            costs: costData.dailyCosts,
            totalDailyCost: costData.totalDailyCost
          };
        } catch (error) {
          console.error(`Error processing destination ${dest.city}:`, error);
          // Return basic info without cost data
          return {
            id: dest.id,
            name: dest.city,
            country: dest.country,
            imageUrl: dest.image,
            description: `${dest.city} is a vibrant city in ${dest.country}.`
          };
        }
      })
    );
    
    return destinations;
  } catch (error) {
    console.error('Error getting all destinations:', error);
    throw error;
  }
};

/**
 * Find optimal destinations based on budget and preferences
 * @param {number} budget - Total budget in USD
 * @param {number} days - Trip duration in days
 * @param {string} origin - Origin location for flights
 * @returns {Promise<Array<Object>>} - Array of optimal destinations
 */
const findOptimalDestinations = async (budget, days, origin = 'NYC') => {
  try {
    // Get all destinations
    const destinations = await getAllDestinations();
    
    // For each destination, calculate the total cost
    const destinationsWithCosts = await Promise.all(
      destinations.map(async (dest) => {
        try {
          // Get flights for this destination
          const flights = await getCheapestFlights(dest.id, [origin]);
          
          // Use the flight price if available, otherwise estimate
          const flightCost = flights && flights.length > 0 ? flights[0].price : 800;
          
          // Calculate total cost
          const dailyCost = dest.totalDailyCost || 100;
          const totalCost = flightCost + (dailyCost * days);
          
          return {
            ...dest,
            flightCost,
            dailyCost,
            totalCost,
            isWithinBudget: totalCost <= budget,
            savingsAmount: budget - totalCost
          };
        } catch (error) {
          console.error(`Error calculating costs for ${dest.name}:`, error);
          // Return with estimated costs
          const estimatedDailyCost = 100;
          const estimatedFlightCost = 800;
          const estimatedTotalCost = estimatedFlightCost + (estimatedDailyCost * days);
          
          return {
            ...dest,
            flightCost: estimatedFlightCost,
            dailyCost: estimatedDailyCost,
            totalCost: estimatedTotalCost,
            isWithinBudget: estimatedTotalCost <= budget,
            savingsAmount: budget - estimatedTotalCost,
            isEstimated: true
          };
        }
      })
    );
    
    // Filter for destinations within budget and sort by savings
    return destinationsWithCosts
      .filter(dest => dest.isWithinBudget)
      .sort((a, b) => b.savingsAmount - a.savingsAmount);
  } catch (error) {
    console.error('Error finding optimal destinations:', error);
    throw error;
  }
};

module.exports = {
  getAllDestinations,
  getDestinationDetails,
  findOptimalDestinations
};