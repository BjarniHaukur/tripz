const { getDestinationDetails } = require('./destinationService');
const { getCheapestFlights } = require('./flightService');

/**
 * Analyze budget for a specific destination
 * @param {string} destinationId - Destination ID
 * @param {number} budget - Total budget in USD
 * @param {number} days - Trip duration in days
 * @param {string} origin - Origin location for flights
 * @returns {Promise<Object>} - Budget analysis
 */
const analyzeBudget = async (destinationId, budget, days, origin = 'NYC') => {
  try {
    // Get destination details
    const destination = await getDestinationDetails(destinationId);
    
    // Get flights
    const flights = await getCheapestFlights(destinationId, [origin]);
    
    // Use the flight price if available, otherwise estimate
    const flightCost = flights && flights.length > 0 ? flights[0].price : 800;
    
    // Calculate costs for each category
    const accommodationCost = destination.costs.accommodation * days;
    const foodCost = destination.costs.food * days;
    const transportationCost = destination.costs.transportation * days;
    const activitiesCost = destination.costs.activities * days;
    
    // Calculate total cost
    const totalDailyCost = destination.totalDailyCost;
    const totalInCountryCost = totalDailyCost * days;
    const totalTripCost = flightCost + totalInCountryCost;
    
    // Calculate budget metrics
    const remainingBudget = budget - totalTripCost;
    const isWithinBudget = remainingBudget >= 0;
    
    // Calculate budget breakdown percentages
    const totalBudgetPercentage = (totalTripCost / budget) * 100;
    const flightBudgetPercentage = (flightCost / budget) * 100;
    const accommodationBudgetPercentage = (accommodationCost / budget) * 100;
    const foodBudgetPercentage = (foodCost / budget) * 100;
    const transportationBudgetPercentage = (transportationCost / budget) * 100;
    const activitiesBudgetPercentage = (activitiesCost / budget) * 100;
    
    return {
      destination: destination.name,
      country: destination.country,
      budget,
      days,
      origin,
      costs: {
        flight: flightCost,
        accommodation: accommodationCost,
        food: foodCost,
        transportation: transportationCost,
        activities: activitiesCost,
        totalDaily: totalDailyCost,
        totalInCountry: totalInCountryCost,
        total: totalTripCost
      },
      budgetBreakdown: {
        total: totalBudgetPercentage,
        flight: flightBudgetPercentage,
        accommodation: accommodationBudgetPercentage,
        food: foodBudgetPercentage,
        transportation: transportationBudgetPercentage,
        activities: activitiesBudgetPercentage,
        remaining: 100 - totalBudgetPercentage
      },
      remainingBudget,
      isWithinBudget,
      currency: destination.currency,
      exchangeRate: destination.exchangeRate
    };
  } catch (error) {
    console.error(`Error analyzing budget for destination ${destinationId}:`, error);
    throw error;
  }
};

/**
 * Find the optimal trip duration for a given budget
 * @param {string} destinationId - Destination ID
 * @param {number} budget - Total budget in USD
 * @param {string} origin - Origin location for flights
 * @returns {Promise<Object>} - Optimal trip duration analysis
 */
const findOptimalDuration = async (destinationId, budget, origin = 'NYC') => {
  try {
    // Get destination details
    const destination = await getDestinationDetails(destinationId);
    
    // Get flights
    const flights = await getCheapestFlights(destinationId, [origin]);
    
    // Use the flight price if available, otherwise estimate
    const flightCost = flights && flights.length > 0 ? flights[0].price : 800;
    
    // Calculate daily cost
    const dailyCost = destination.totalDailyCost;
    
    // Calculate maximum possible days
    const maxPossibleDays = Math.floor((budget - flightCost) / dailyCost);
    
    // Create an array of possible durations
    const durations = [];
    for (let days = 3; days <= 30; days++) {
      const totalCost = flightCost + (dailyCost * days);
      const costPerDay = totalCost / days;
      const flightCostPercentage = (flightCost / totalCost) * 100;
      
      durations.push({
        days,
        totalCost,
        costPerDay,
        flightCostPercentage,
        isWithinBudget: totalCost <= budget,
        remainingBudget: budget - totalCost
      });
    }
    
    // Filter for durations within budget
    const possibleDurations = durations.filter(d => d.isWithinBudget);
    
    // Find the optimal duration (lowest cost per day within budget)
    const optimalDuration = possibleDurations.sort((a, b) => a.costPerDay - b.costPerDay)[0];
    
    return {
      destination: destination.name,
      country: destination.country,
      budget,
      flightCost,
      dailyCost,
      maxPossibleDays: Math.max(0, maxPossibleDays),
      optimalDuration: optimalDuration || null,
      possibleDurations: possibleDurations,
      currency: destination.currency,
      exchangeRate: destination.exchangeRate
    };
  } catch (error) {
    console.error(`Error finding optimal duration for destination ${destinationId}:`, error);
    throw error;
  }
};

module.exports = {
  analyzeBudget,
  findOptimalDuration
};