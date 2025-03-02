// Mock destination data with daily cost estimates
const destinations = [
  {
    id: 'bkk',
    name: 'Bangkok',
    country: 'Thailand',
    currency: 'THB',
    exchangeRate: 0.028, // 1 THB = 0.028 USD
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
    description: 'Vibrant street life, ornate shrines, and modern malls in Thailand\'s capital',
    costs: {
      accommodation: 25, // USD per night (budget option)
      food: 15,          // USD per day
      transportation: 5, // USD per day
      activities: 10     // USD per day
    },
    bestTimeToVisit: ['November', 'December', 'January', 'February'],
    categories: ['food', 'culture', 'nightlife', 'shopping']
  },
  {
    id: 'lsb',
    name: 'Lisbon',
    country: 'Portugal',
    currency: 'EUR',
    exchangeRate: 1.09, // 1 EUR = 1.09 USD
    imageUrl: 'https://images.unsplash.com/photo-1558370781-d6196949e317',
    description: 'Hilly coastal capital with pastel buildings and vintage trams',
    costs: {
      accommodation: 60, // USD per night
      food: 25,          // USD per day
      transportation: 10, // USD per day
      activities: 15     // USD per day
    },
    bestTimeToVisit: ['March', 'April', 'May', 'September', 'October'],
    categories: ['beach', 'culture', 'food', 'architecture']
  },
  {
    id: 'hcmc',
    name: 'Ho Chi Minh City',
    country: 'Vietnam',
    currency: 'VND',
    exchangeRate: 0.000041, // 1 VND = 0.000041 USD
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
    description: 'Bustling city with French colonial landmarks and vibrant street food',
    costs: {
      accommodation: 20, // USD per night
      food: 10,          // USD per day
      transportation: 3, // USD per day
      activities: 8     // USD per day
    },
    bestTimeToVisit: ['December', 'January', 'February', 'March'],
    categories: ['food', 'culture', 'history', 'shopping']
  },
  {
    id: 'brc',
    name: 'Barcelona',
    country: 'Spain',
    currency: 'EUR',
    exchangeRate: 1.09, // 1 EUR = 1.09 USD
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
    description: 'Renowned for Gaudi architecture, delicious tapas, and Mediterranean beaches',
    costs: {
      accommodation: 80, // USD per night
      food: 35,          // USD per day
      transportation: 12, // USD per day
      activities: 20     // USD per day
    },
    bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
    categories: ['beach', 'architecture', 'food', 'nightlife']
  },
  {
    id: 'pgy',
    name: 'Prague',
    country: 'Czech Republic',
    currency: 'CZK',
    exchangeRate: 0.045, // 1 CZK = 0.045 USD
    imageUrl: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef',
    description: 'Historic center with Gothic churches, medieval Astronomical Clock, and castle',
    costs: {
      accommodation: 50, // USD per night
      food: 20,          // USD per day
      transportation: 8, // USD per day
      activities: 15     // USD per day
    },
    bestTimeToVisit: ['March', 'April', 'May', 'September', 'October'],
    categories: ['history', 'architecture', 'beer', 'culture']
  },
  {
    id: 'tky',
    name: 'Tokyo',
    country: 'Japan',
    currency: 'JPY',
    exchangeRate: 0.0067, // 1 JPY = 0.0067 USD
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    description: 'Ultramodern and traditional, with neon-lit skyscrapers and historic temples',
    costs: {
      accommodation: 90, // USD per night
      food: 30,          // USD per day
      transportation: 12, // USD per day
      activities: 25     // USD per day
    },
    bestTimeToVisit: ['March', 'April', 'October', 'November'],
    categories: ['food', 'technology', 'shopping', 'culture']
  },
  {
    id: 'cdmx',
    name: 'Mexico City',
    country: 'Mexico',
    currency: 'MXN',
    exchangeRate: 0.049, // 1 MXN = 0.049 USD
    imageUrl: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396',
    description: 'Historic Aztec temples, colonial architecture, and vibrant arts scene',
    costs: {
      accommodation: 40, // USD per night
      food: 15,          // USD per day
      transportation: 5, // USD per day
      activities: 10     // USD per day
    },
    bestTimeToVisit: ['March', 'April', 'May', 'October', 'November'],
    categories: ['food', 'culture', 'history', 'arts']
  },
  {
    id: 'brc',
    name: 'Berlin',
    country: 'Germany',
    currency: 'EUR',
    exchangeRate: 1.09, // 1 EUR = 1.09 USD
    imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f',
    description: 'Cutting-edge architecture, vibrant nightlife, and rich 20th-century history',
    costs: {
      accommodation: 65, // USD per night
      food: 25,          // USD per day
      transportation: 10, // USD per day
      activities: 15     // USD per day
    },
    bestTimeToVisit: ['May', 'June', 'July', 'August', 'September'],
    categories: ['nightlife', 'history', 'arts', 'culture']
  }
];

// Mock flight data
const flights = [
  // From New York
  { id: 'f1', origin: 'NYC', destination: 'bkk', price: 850, duration: '22h 30m', stops: 1 },
  { id: 'f2', origin: 'NYC', destination: 'lsb', price: 650, duration: '7h 45m', stops: 0 },
  { id: 'f3', origin: 'NYC', destination: 'hcmc', price: 950, duration: '24h 15m', stops: 1 },
  { id: 'f4', origin: 'NYC', destination: 'brc', price: 700, duration: '8h 10m', stops: 0 },
  { id: 'f5', origin: 'NYC', destination: 'pgy', price: 750, duration: '9h 20m', stops: 1 },
  { id: 'f6', origin: 'NYC', destination: 'tky', price: 1100, duration: '14h 15m', stops: 0 },
  { id: 'f7', origin: 'NYC', destination: 'cdmx', price: 350, duration: '5h 30m', stops: 0 },
  { id: 'f8', origin: 'NYC', destination: 'brc', price: 650, duration: '8h 25m', stops: 0 },
  
  // From Los Angeles
  { id: 'f9', origin: 'LAX', destination: 'bkk', price: 750, duration: '19h 45m', stops: 1 },
  { id: 'f10', origin: 'LAX', destination: 'lsb', price: 800, duration: '13h 30m', stops: 1 },
  { id: 'f11', origin: 'LAX', destination: 'hcmc', price: 850, duration: '20h 10m', stops: 1 },
  { id: 'f12', origin: 'LAX', destination: 'brc', price: 850, duration: '12h 40m', stops: 1 },
  { id: 'f13', origin: 'LAX', destination: 'pgy', price: 900, duration: '14h 15m', stops: 1 },
  { id: 'f14', origin: 'LAX', destination: 'tky', price: 850, duration: '11h 50m', stops: 0 },
  { id: 'f15', origin: 'LAX', destination: 'cdmx', price: 300, duration: '3h 30m', stops: 0 },
  { id: 'f16', origin: 'LAX', destination: 'brc', price: 850, duration: '13h 15m', stops: 1 },
  
  // From Chicago
  { id: 'f17', origin: 'CHI', destination: 'bkk', price: 900, duration: '21h 15m', stops: 1 },
  { id: 'f18', origin: 'CHI', destination: 'lsb', price: 700, duration: '9h 25m', stops: 0 },
  { id: 'f19', origin: 'CHI', destination: 'hcmc', price: 1000, duration: '23h 10m', stops: 1 },
  { id: 'f20', origin: 'CHI', destination: 'brc', price: 750, duration: '9h 45m', stops: 0 },
  { id: 'f21', origin: 'CHI', destination: 'pgy', price: 800, duration: '10h 30m', stops: 1 },
  { id: 'f22', origin: 'CHI', destination: 'tky', price: 1200, duration: '13h 45m', stops: 0 },
  { id: 'f23', origin: 'CHI', destination: 'cdmx', price: 400, duration: '4h 45m', stops: 0 },
  { id: 'f24', origin: 'CHI', destination: 'brc', price: 750, duration: '9h 35m', stops: 0 }
];

// Mock accommodation data
const accommodations = [
  // Bangkok
  { 
    id: 'a1', 
    destination: 'bkk', 
    name: 'Budget Hostel Bangkok', 
    type: 'hostel', 
    pricePerNight: 15, 
    rating: 4.2,
    amenities: ['WiFi', 'Breakfast', 'Air Conditioning', 'Lockers']
  },
  { 
    id: 'a2', 
    destination: 'bkk', 
    name: 'Bangkok Boutique Hotel', 
    type: 'hotel', 
    pricePerNight: 45, 
    rating: 4.5,
    amenities: ['WiFi', 'Breakfast', 'Pool', 'Restaurant', 'Bar']
  },
  { 
    id: 'a3', 
    destination: 'bkk', 
    name: 'Riverside Apartment', 
    type: 'apartment', 
    pricePerNight: 60, 
    rating: 4.7,
    amenities: ['WiFi', 'Kitchen', 'Washing Machine', 'Gym', 'Pool']
  },
  
  // Lisbon
  { 
    id: 'a4', 
    destination: 'lsb', 
    name: 'Lisbon Backpackers', 
    type: 'hostel', 
    pricePerNight: 25, 
    rating: 4.3,
    amenities: ['WiFi', 'Breakfast', 'Terrace', 'Common Kitchen']
  },
  { 
    id: 'a5', 
    destination: 'lsb', 
    name: 'Lisbon City Hotel', 
    type: 'hotel', 
    pricePerNight: 85, 
    rating: 4.6,
    amenities: ['WiFi', 'Breakfast', 'Restaurant', 'Room Service']
  },
  { 
    id: 'a6', 
    destination: 'lsb', 
    name: 'Historic Center Apartment', 
    type: 'apartment', 
    pricePerNight: 110, 
    rating: 4.8,
    amenities: ['WiFi', 'Kitchen', 'Washing Machine', 'Balcony', 'Air Conditioning']
  },
  
  // And more accommodations for other destinations...
  // Ho Chi Minh City
  { 
    id: 'a7', 
    destination: 'hcmc', 
    name: 'Saigon Backpackers', 
    type: 'hostel', 
    pricePerNight: 12, 
    rating: 4.1,
    amenities: ['WiFi', 'Breakfast', 'Air Conditioning', 'Rooftop Bar']
  },
  { 
    id: 'a8', 
    destination: 'hcmc', 
    name: 'District 1 Hotel', 
    type: 'hotel', 
    pricePerNight: 40, 
    rating: 4.4,
    amenities: ['WiFi', 'Breakfast', 'Restaurant', 'Spa', 'Gym']
  },
  
  // Barcelona
  { 
    id: 'a9', 
    destination: 'brc', 
    name: 'Barcelona Beach Hostel', 
    type: 'hostel', 
    pricePerNight: 30, 
    rating: 4.3,
    amenities: ['WiFi', 'Breakfast', 'Beach Access', 'Bar']
  },
  { 
    id: 'a10', 
    destination: 'brc', 
    name: 'Gothic Quarter Hotel', 
    type: 'hotel', 
    pricePerNight: 120, 
    rating: 4.7,
    amenities: ['WiFi', 'Breakfast', 'Restaurant', 'Terrace', 'Bar']
  }
];

module.exports = {
  destinations,
  flights,
  accommodations
};