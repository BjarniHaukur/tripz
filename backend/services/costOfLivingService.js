const { cachedRequest, retryWithBackoff } = require('./utils');
require('dotenv').config();

// API Configuration
const NUMBEO_API_KEY = process.env.NUMBEO_API_KEY;
const NUMBEO_BASE_URL = process.env.NUMBEO_BASE_URL || 'https://cost-of-living-and-prices.p.rapidapi.com';

// Default headers for Numbeo API requests
const headers = {
  'X-RapidAPI-Key': NUMBEO_API_KEY,
  'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
};

/**
 * Get cost of living data for a city
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<Object>} - Cost of living data
 */
const getCityPrices = async (city, country) => {
  const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
  const formattedCountry = country.toLowerCase().replace(/\s+/g, '-');
  const cacheKey = `city_prices_${formattedCity}_${formattedCountry}`;
  
  const options = {
    method: 'GET',
    url: `${NUMBEO_BASE_URL}/prices`,
    params: {
      city_name: city,
      country_name: country
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    return await cachedRequest(options.url, options, cacheKey, 86400); // Cache for 24 hours
  });
};

/**
 * Get exchange rates for a currency
 * @param {string} baseCurrency - Base currency code
 * @returns {Promise<Object>} - Exchange rates
 */
const getExchangeRates = async (baseCurrency = 'USD') => {
  const cacheKey = `exchange_rates_${baseCurrency}`;
  
  const options = {
    method: 'GET',
    url: `${NUMBEO_BASE_URL}/exchange-rates`,
    params: {
      base_currency: baseCurrency
    },
    headers
  };
  
  // We use retryWithBackoff to handle rate limiting
  return retryWithBackoff(async () => {
    return await cachedRequest(options.url, options, cacheKey, 86400); // Cache for 24 hours
  });
};

/**
 * Get average costs for a destination
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<Object>} - Average costs for various categories
 */
const getDestinationCosts = async (city, country) => {
  try {
    // Get city prices and exchange rates
    const [pricesData, exchangeRatesData] = await Promise.all([
      getCityPrices(city, country),
      getExchangeRates()
    ]);
    
    // Extract prices from the response
    const prices = pricesData.prices || [];
    const currency = pricesData.currency_code || 'USD';
    
    // Get exchange rate for local currency to USD
    const exchangeRate = currency === 'USD' ? 1 : 
      (exchangeRatesData.exchange_rates.find(rate => rate.currency === currency)?.rate || 1);
    
    // Helper function to convert local price to USD
    const toUSD = (price) => price / exchangeRate;
    
    // Extract relevant costs
    const foodCosts = {
      inexpensiveRestaurant: findPriceByName(prices, 'Meal, Inexpensive Restaurant', toUSD),
      midrangeRestaurant: findPriceByName(prices, 'Meal for 2 People, Mid-range Restaurant, Three-course', toUSD) / 2,
      fastFood: findPriceByName(prices, 'McMeal at McDonalds (or Equivalent Combo Meal)', toUSD),
      groceries: [
        findPriceByName(prices, 'Milk (regular), (1 liter)', toUSD),
        findPriceByName(prices, 'Loaf of Fresh White Bread (500g)', toUSD),
        findPriceByName(prices, 'Rice (white), (1kg)', toUSD),
        findPriceByName(prices, 'Eggs (regular) (12)', toUSD),
        findPriceByName(prices, 'Local Cheese (1kg)', toUSD),
        findPriceByName(prices, 'Chicken Fillets (1kg)', toUSD),
        findPriceByName(prices, 'Beef Round (1kg)', toUSD),
        findPriceByName(prices, 'Apples (1kg)', toUSD),
        findPriceByName(prices, 'Banana (1kg)', toUSD),
        findPriceByName(prices, 'Oranges (1kg)', toUSD),
        findPriceByName(prices, 'Tomato (1kg)', toUSD),
        findPriceByName(prices, 'Potato (1kg)', toUSD),
        findPriceByName(prices, 'Onion (1kg)', toUSD),
        findPriceByName(prices, 'Water (1.5 liter bottle)', toUSD)
      ].reduce((sum, price) => sum + price, 0)
    };
    
    const transportationCosts = {
      localTransportOneWay: findPriceByName(prices, 'One-way Ticket (Local Transport)', toUSD),
      localTransportMonthly: findPriceByName(prices, 'Monthly Pass (Regular Price)', toUSD),
      taxi1km: findPriceByName(prices, 'Taxi 1km (Normal Tariff)', toUSD),
      taxiStart: findPriceByName(prices, 'Taxi Start (Normal Tariff)', toUSD)
    };
    
    const accommodationCosts = {
      monthlyRentOneBedroomCenter: findPriceByName(prices, 'Apartment (1 bedroom) in City Centre', toUSD),
      monthlyRentOneBedroomOutside: findPriceByName(prices, 'Apartment (1 bedroom) Outside of Centre', toUSD),
      hotelNight: 0, // This isn't provided by Numbeo, will need estimating
      hostelNight: 0  // This isn't provided by Numbeo, will need estimating
    };
    
    const activitiesCosts = {
      cinemaNationalCurrency: findPriceByName(prices, 'Cinema, International Release, 1 Seat', 1),
      fitnessClubMonthly: findPriceByName(prices, 'Fitness Club, Monthly Fee for 1 Adult', toUSD),
      beerDomestic: findPriceByName(prices, 'Domestic Beer (0.5 liter draught)', toUSD),
      beerImported: findPriceByName(prices, 'Imported Beer (0.33 liter bottle)', toUSD),
      cappuccino: findPriceByName(prices, 'Cappuccino (regular)', toUSD)
    };
    
    // Calculate daily costs
    const dailyFoodCost = foodCosts.inexpensiveRestaurant + foodCosts.fastFood + (foodCosts.groceries / 7);
    const dailyTransportCost = transportationCosts.localTransportOneWay * 2;
    const dailyActivitiesCost = activitiesCosts.beerDomestic + activitiesCosts.cappuccino + (activitiesCosts.cinemaNationalCurrency / exchangeRate / 3);
    const dailyAccommodationCost = accommodationCosts.hotelNight || (accommodationCosts.monthlyRentOneBedroomCenter / 30);
    
    return {
      destination: {
        city,
        country,
        currency,
        exchangeRate
      },
      detailedCosts: {
        food: foodCosts,
        transportation: transportationCosts,
        accommodation: accommodationCosts,
        activities: activitiesCosts
      },
      dailyCosts: {
        food: Math.round(dailyFoodCost),
        transportation: Math.round(dailyTransportCost),
        activities: Math.round(dailyActivitiesCost),
        accommodation: Math.round(dailyAccommodationCost)
      },
      totalDailyCost: Math.round(dailyFoodCost + dailyTransportCost + dailyActivitiesCost + dailyAccommodationCost)
    };
  } catch (error) {
    console.error(`Error getting costs for ${city}, ${country}:`, error);
    throw error;
  }
};

/**
 * Helper function to find a price by its name
 * @param {Array} prices - Array of price objects
 * @param {string} name - Name of the price to find
 * @param {Function} converter - Function to convert price
 * @returns {number} - The converted price, or 0 if not found
 */
function findPriceByName(prices, name, converter) {
  const priceObj = prices.find(p => p.item_name === name);
  return priceObj ? converter(priceObj.usd.avg) : 0;
}

/**
 * Get accommodation costs based on hotel data and cost of living data
 * @param {string} city - City name
 * @param {string} country - Country name
 * @param {number} days - Number of days to stay
 * @returns {Promise<Object>} - Accommodation costs
 */
const getAccommodationCosts = async (city, country, days = 7) => {
  try {
    // Import the accommodation service
    const { getAverageAccommodationPrices } = require('./accommodationService');
    
    // Get both cost of living and accommodation prices
    const [colData, accommodationData] = await Promise.all([
      getDestinationCosts(city, country),
      getAverageAccommodationPrices(`${city}, ${country}`, days)
    ]);
    
    // Calculate daily rates
    const dailyRates = {};
    if (accommodationData.pricesByType) {
      Object.entries(accommodationData.pricesByType).forEach(([type, data]) => {
        dailyRates[type.toLowerCase()] = data.average / days;
      });
    }
    
    // Update the accommodation costs
    colData.detailedCosts.accommodation.hotelNight = dailyRates.hotel || dailyRates.apartment || (accommodationData.overallAveragePrice / days);
    colData.detailedCosts.accommodation.hostelNight = dailyRates.hostel || (dailyRates.hotel / 3) || (accommodationData.overallAveragePrice / days / 3);
    
    // Update the daily accommodation cost
    colData.dailyCosts.accommodation = Math.round(colData.detailedCosts.accommodation.hotelNight);
    
    // Update the total daily cost
    colData.totalDailyCost = Math.round(
      colData.dailyCosts.food + 
      colData.dailyCosts.transportation + 
      colData.dailyCosts.activities + 
      colData.dailyCosts.accommodation
    );
    
    return colData;
  } catch (error) {
    // If there's an error getting accommodation data, return just the cost of living data
    console.error(`Error getting accommodation costs for ${city}, ${country}:`, error);
    return getDestinationCosts(city, country);
  }
};

// Export all cost of living related functions
module.exports = {
  getCityPrices,
  getExchangeRates,
  getDestinationCosts,
  getAccommodationCosts
};