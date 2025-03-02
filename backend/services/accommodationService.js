const { cachedRequest, getTripDates, retryWithBackoff } = require('./utils');
require('dotenv').config();

// API Configuration
const BOOKING_API_KEY = process.env.BOOKING_API_KEY;
const BOOKING_BASE_URL = process.env.BOOKING_BASE_URL || 'https://booking-com.p.rapidapi.com';

// Default headers for Booking.com API requests
const headers = {
  'X-RapidAPI-Key': BOOKING_API_KEY,
  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
};

/**
 * Search for accommodations in a destination
 * @param {string} destinationId - Destination ID in Booking.com format
 * @param {string} checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} adults - Number of adults
 * @param {string} currency - Currency code
 * @returns {Promise<Object>} - Accommodation search results
 */
const searchAccommodations = async (
  destinationId, 
  checkIn, 
  checkOut, 
  adults = 2,
  currency = 'USD'
) => {
  // Create cache key
  const cacheKey = `accommodations_${destinationId}_${checkIn}_${checkOut}_${adults}_${currency}`;
  
  // If we don't have check-in/check-out dates, calculate them
  if (!checkIn || !checkOut) {
    const dates = getTripDates();
    checkIn = dates.departureDate;
    checkOut = dates.returnDate;
  }
  
  const options = {
    method: 'GET',
    url: `${BOOKING_BASE_URL}/v1/hotels/search`,
    params: {
      dest_id: destinationId,
      dest_type: 'city',
      checkin_date: checkIn,
      checkout_date: checkOut,
      adults_number: adults.toString(),
      room_number: '1',
      order_by: 'popularity',
      filter_by_currency: currency,
      locale: 'en-us',
      page_number: '1',
      units: 'metric',
      include_adjacency: 'true'
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    return await cachedRequest(options.url, options, cacheKey, 3600); // Cache for 1 hour
  });
};

/**
 * Get destination ID by location name
 * @param {string} locationName - Name of the location to search for
 * @returns {Promise<string>} - Destination ID
 */
const getDestinationId = async (locationName) => {
  const cacheKey = `destination_id_${locationName.toLowerCase().replace(/\s+/g, '_')}`;
  
  const options = {
    method: 'GET',
    url: `${BOOKING_BASE_URL}/v1/hotels/locations`,
    params: {
      name: locationName,
      locale: 'en-us'
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    const locations = await cachedRequest(options.url, options, cacheKey, 86400); // Cache for 24 hours
    
    if (!locations || locations.length === 0) {
      throw new Error(`No locations found for '${locationName}'`);
    }
    
    // Find the first city result
    const city = locations.find(loc => loc.dest_type === 'city');
    if (city) {
      return city.dest_id;
    }
    
    // If no city was found, return the first result
    return locations[0].dest_id;
  });
};

/**
 * Get accommodation details by hotel ID
 * @param {string} hotelId - Hotel ID
 * @returns {Promise<Object>} - Hotel details
 */
const getAccommodationDetails = async (hotelId) => {
  const cacheKey = `hotel_details_${hotelId}`;
  
  const options = {
    method: 'GET',
    url: `${BOOKING_BASE_URL}/v1/hotels/data`,
    params: {
      hotel_id: hotelId,
      locale: 'en-us'
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    return await cachedRequest(options.url, options, cacheKey, 86400); // Cache for 24 hours
  });
};

/**
 * Get average accommodation prices for a destination
 * @param {string} destinationName - Name of the destination
 * @param {number} days - Number of days to stay
 * @returns {Promise<Object>} - Average prices by accommodation type
 */
const getAverageAccommodationPrices = async (destinationName, days = 7) => {
  try {
    // Get destination ID
    const destId = await getDestinationId(destinationName);
    
    // Calculate dates
    const dates = getTripDates(30, days);
    
    // Get accommodations
    const result = await searchAccommodations(destId, dates.departureDate, dates.returnDate);
    
    // Calculate average prices by property type
    const pricesByType = {};
    let totalCount = 0;
    let totalPrice = 0;
    
    if (result && result.result && Array.isArray(result.result)) {
      result.result.forEach(hotel => {
        if (hotel.price_breakdown && hotel.price_breakdown.gross_price) {
          const price = hotel.price_breakdown.gross_price;
          const type = hotel.accommodation_type_name || 'Other';
          
          if (!pricesByType[type]) {
            pricesByType[type] = { total: 0, count: 0, average: 0 };
          }
          
          pricesByType[type].total += price;
          pricesByType[type].count++;
          totalPrice += price;
          totalCount++;
        }
      });
      
      // Calculate averages
      Object.keys(pricesByType).forEach(type => {
        const typeData = pricesByType[type];
        typeData.average = typeData.total / typeData.count;
      });
    }
    
    // Calculate overall average
    const overallAverage = totalCount > 0 ? totalPrice / totalCount : 0;
    
    return {
      destination: destinationName,
      destinationId: destId,
      overallAveragePrice: overallAverage,
      pricesByType,
      currency: 'USD',
      numberOfDays: days
    };
  } catch (error) {
    console.error(`Error getting accommodation prices for ${destinationName}:`, error);
    throw error;
  }
};

// Export all accommodation-related functions
module.exports = {
  searchAccommodations,
  getDestinationId,
  getAccommodationDetails,
  getAverageAccommodationPrices
};