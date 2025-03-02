import axios from 'axios';

// Use the environment variable if available, otherwise fallback to the default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

export interface Destination {
  id: string;
  name: string;
  country: string;
  currency: string;
  exchangeRate: number;
  imageUrl: string;
  description: string;
  costs: {
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
  };
  totalDailyCost?: number;
  bestTimeToVisit: string[];
  categories: string[];
}

export interface Flight {
  id?: string;
  origin: string;
  destination: string;
  price: number;
  duration: string | number;
  stops: number;
  departureDate?: string;
  returnDate?: string;
  url?: string;
}

export interface Accommodation {
  id: string;
  destination?: string;
  name: string;
  type: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
}

export interface BudgetAnalysis {
  destination: string;
  country?: string;
  budget: number;
  days: number;
  origin?: string;
  costs: {
    flight: number;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    totalDaily?: number;
    totalInCountry?: number;
    total: number;
  };
  budgetBreakdown?: {
    total: number;
    flight: number;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    remaining: number;
  };
  dailyCost?: number;
  remainingBudget: number;
  isWithinBudget: boolean;
  currency?: string;
  exchangeRate?: number;
}

export interface OptimalDestination {
  id: string;
  name: string;
  country: string;
  totalCost: number;
  flightCost: number;
  dailyCost: number;
  isWithinBudget: boolean;
  savingsAmount: number;
  imageUrl: string;
  currency: string;
  isEstimated?: boolean;
}

export interface OptimalDuration {
  destination: string;
  country: string;
  budget: number;
  flightCost: number;
  dailyCost: number;
  maxPossibleDays: number;
  optimalDuration: {
    days: number;
    totalCost: number;
    costPerDay: number;
    flightCostPercentage: number;
    isWithinBudget: boolean;
    remainingBudget: number;
  } | null;
  possibleDurations: Array<{
    days: number;
    totalCost: number;
    costPerDay: number;
    flightCostPercentage: number;
    isWithinBudget: boolean;
    remainingBudget: number;
  }>;
  currency: string;
  exchangeRate: number;
}

export interface ApiStatus {
  status: string;
  apiMode: string;
  cacheStats: {
    keys: number;
    hits: number;
    misses: number;
  };
  environment: string;
}

// Create axios instance with default settings
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    console.error(`API Error: ${errorMessage}`);
    return Promise.reject(error);
  }
);

const api = {
  // API Status
  getApiStatus: async (): Promise<ApiStatus> => {
    const response = await apiClient.get('/status');
    return response.data;
  },

  // Destinations
  getDestinations: async (): Promise<Destination[]> => {
    const response = await apiClient.get('/destinations');
    return response.data;
  },

  getDestination: async (id: string): Promise<Destination> => {
    const response = await apiClient.get(`/destinations/${id}`);
    return response.data;
  },

  getOptimalDestinations: async (budget: number, days: number, origin?: string): Promise<OptimalDestination[]> => {
    const params = { budget, days, origin };
    const response = await apiClient.get('/destinations/optimal', { params });
    return response.data;
  },

  // Flights
  getFlights: async (
    origin?: string, 
    destination?: string, 
    departureDate?: string, 
    returnDate?: string
  ): Promise<Flight[]> => {
    const params = { origin, destination, departureDate, returnDate };
    const response = await apiClient.get('/flights', { params });
    return response.data;
  },

  // Accommodations
  getAccommodations: async (
    destination: string,
    checkIn?: string,
    checkOut?: string
  ): Promise<Accommodation[]> => {
    const params = { destination, checkIn, checkOut };
    const response = await apiClient.get('/accommodations', { params });
    const results = response.data?.result || [];
    
    return results.map((item: any) => ({
      id: item.hotel_id || item.id,
      name: item.hotel_name || item.name,
      type: item.accommodation_type_name || item.type || 'Hotel',
      pricePerNight: item.price_breakdown?.gross_price || item.min_total_price || item.pricePerNight,
      rating: item.review_score || item.rating || 0,
      amenities: item.facilities_block?.facilities?.map((f: any) => f.name) || item.amenities || []
    }));
  },

  getAccommodationPrices: async (destination: string, days?: number): Promise<any> => {
    const params = { destination, days };
    const response = await apiClient.get('/accommodations/prices', { params });
    return response.data;
  },

  // Budget Analysis
  getBudgetAnalysis: async (
    destination: string, 
    budget: number, 
    days: number,
    origin?: string
  ): Promise<BudgetAnalysis> => {
    const params = { destination, budget, days, origin };
    const response = await apiClient.get('/budget/analysis', { params });
    return response.data;
  },

  getOptimalDuration: async (
    destination: string,
    budget: number,
    origin?: string
  ): Promise<OptimalDuration> => {
    const params = { destination, budget, origin };
    const response = await apiClient.get('/budget/optimal-duration', { params });
    return response.data;
  },

  // Cost of Living
  getCityPrices: async (city: string, country: string): Promise<any> => {
    const params = { city, country };
    const response = await apiClient.get('/costs/city', { params });
    return response.data;
  },

  getExchangeRates: async (baseCurrency?: string): Promise<any> => {
    const params = { baseCurrency };
    const response = await apiClient.get('/costs/exchange-rates', { params });
    return response.data;
  },

  getAccommodationCosts: async (city: string, country: string, days?: number): Promise<any> => {
    const params = { city, country, days };
    const response = await apiClient.get('/costs/accommodation', { params });
    return response.data;
  }
};

export default api;