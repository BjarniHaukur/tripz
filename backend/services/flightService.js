const { cachedRequest, getTripDates, retryWithBackoff } = require('./utils');
require('dotenv').config();

// API Configuration
const SKYSCANNER_API_KEY = process.env.SKYSCANNER_API_KEY;
const SKYSCANNER_BASE_URL = process.env.SKYSCANNER_BASE_URL || 'https://skyscanner-api.p.rapidapi.com';

// Default headers for Skyscanner API requests
const headers = {
  'X-RapidAPI-Key': SKYSCANNER_API_KEY,
  'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
};

/**
 * Search for flights using Skyscanner API
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @param {string} departureDate - Departure date (YYYY-MM-DD)
 * @param {string} returnDate - Return date (YYYY-MM-DD)
 * @param {number} adults - Number of adults
 * @returns {Promise<Object>} - Flight search results
 */
const searchFlights = async (origin, destination, departureDate, returnDate, adults = 1) => {
  // Create cache key
  const cacheKey = `flights_${origin}_${destination}_${departureDate}_${returnDate}_${adults}`;
  
  // If we don't have departure/return dates, calculate them
  if (!departureDate || !returnDate) {
    const dates = getTripDates();
    departureDate = dates.departureDate;
    returnDate = dates.returnDate;
  }
  
  const options = {
    method: 'GET',
    url: `${SKYSCANNER_BASE_URL}/v3/flights/live/search/create`,
    params: {
      adults: adults.toString(),
      origin,
      destination,
      departureDate,
      returnDate,
      currency: 'USD',
      market: 'US',
      locale: 'en-US'
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    return await cachedRequest(options.url, options, cacheKey, 3600); // Cache for 1 hour
  });
};

/**
 * Get cheapest flights to a destination from multiple origins
 * @param {string} destination - Destination IATA code
 * @param {Array<string>} origins - Array of origin IATA codes
 * @param {string} departureDate - Departure date (YYYY-MM-DD)
 * @param {string} returnDate - Return date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of cheapest flights
 */
const getCheapestFlights = async (destination, origins = ['NYC', 'LAX', 'CHI'], departureDate, returnDate) => {
  // Get dates if not provided
  if (!departureDate || !returnDate) {
    const dates = getTripDates();
    departureDate = dates.departureDate;
    returnDate = dates.returnDate;
  }
  
  // Create requests for each origin
  const requests = origins.map(origin => 
    searchFlights(origin, destination, departureDate, returnDate)
      .then(result => {
        // Extract the cheapest flight from the results
        const itineraries = result.itineraries || [];
        if (itineraries.length === 0) return null;
        
        // Sort by price and get the cheapest
        const cheapest = itineraries.sort((a, b) => 
          a.price.raw - b.price.raw
        )[0];
        
        return {
          origin,
          destination,
          price: cheapest.price.raw,
          currency: cheapest.price.currency || 'USD',
          duration: cheapest.legs[0].durationInMinutes,
          stops: cheapest.legs[0].segments.length - 1,
          departureDate,
          returnDate,
          url: cheapest.deepLink
        };
      })
      .catch(error => {
        console.error(`Error fetching flights from ${origin} to ${destination}:`, error);
        return null;
      })
  );
  
  // Wait for all requests to complete and filter out nulls
  const results = await Promise.all(requests);
  return results.filter(Boolean);
};

// Export all flight-related functions
module.exports = {
  searchFlights,
  getCheapestFlights
};