const NodeCache = require('node-cache');
const axios = require('axios');
require('dotenv').config();

// Create cache with TTL of 1 hour by default
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 });

/**
 * Make an API request with caching
 * @param {string} url - The URL to request
 * @param {Object} options - Axios request options
 * @param {string} cacheKey - Key to use for caching
 * @param {number} ttl - Cache TTL in seconds
 * @returns {Promise<any>} - Response data
 */
const cachedRequest = async (url, options = {}, cacheKey, ttl) => {
  // Check if we have a cached response
  if (cacheKey && cache.has(cacheKey)) {
    console.log(`Cache hit for ${cacheKey}`);
    return cache.get(cacheKey);
  }

  try {
    console.log(`Making API request to ${url}`);
    const response = await axios(url, options);
    
    // Cache the response if a cache key was provided
    if (cacheKey) {
      cache.set(cacheKey, response.data, ttl);
    }
    
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    
    // If we have a response, throw the error with status text
    if (error.response) {
      const { status, statusText, data } = error.response;
      throw new Error(`API Error (${status} ${statusText}): ${JSON.stringify(data)}`);
    }
    
    // Otherwise, re-throw the original error
    throw error;
  }
};

/**
 * Formats a date for API requests (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get dates for a future trip
 * @param {number} daysFromNow - When the trip starts
 * @param {number} duration - Length of trip in days
 * @returns {Object} - Contains departure and return dates
 */
const getTripDates = (daysFromNow = 30, duration = 7) => {
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + daysFromNow);
  
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + duration);
  
  return {
    departureDate: formatDate(departureDate),
    returnDate: formatDate(returnDate)
  };
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise<any>} - Result of the function
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      // If we've reached max retries or this isn't a 429 error, don't retry
      if (retries >= maxRetries || 
         (error.response && error.response.status !== 429)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
  cache,
  cachedRequest,
  formatDate,
  getTripDates,
  retryWithBackoff
};