# Tripz Developer Guide

This guide provides detailed information for developers working on the Tripz budget-aware travel planning application.

## Development Environment Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Git

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/tripz.git
cd tripz
```

2. Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Configure environment variables
```bash
cp backend/.env.example backend/.env
```

4. Start the development servers
```bash
# In one terminal, start the backend
cd backend && npm run dev

# In another terminal, start the frontend
cd frontend && npm start
```

## Project Structure

### Backend Structure

```
backend/
├── .env                # Environment variables
├── index.js            # Entry point
├── mockData.js         # Mock data for development
├── package.json        # Dependencies
├── routes/             # API routes
│   ├── index.js        # Route aggregator
│   ├── destinationRoutes.js
│   ├── flightRoutes.js
│   ├── accommodationRoutes.js
│   ├── budgetRoutes.js
│   └── costOfLivingRoutes.js
└── services/           # Business logic and API integrations
    ├── index.js        # Service aggregator
    ├── utils.js        # Utility functions
    ├── destinationService.js
    ├── flightService.js
    ├── accommodationService.js
    ├── budgetService.js
    └── costOfLivingService.js
```

### Frontend Structure

```
frontend/
├── .env                # Environment variables
├── package.json        # Dependencies
├── public/             # Static assets
└── src/
    ├── components/     # Reusable UI components
    │   └── Navbar.tsx
    ├── pages/          # Page components
    │   ├── HomePage.tsx
    │   ├── SearchPage.tsx
    │   ├── DestinationPage.tsx
    │   ├── BudgetCalculatorPage.tsx
    │   └── ComparisonPage.tsx
    ├── services/       # API communication
    │   └── api.ts
    ├── App.tsx         # Root component
    └── index.tsx       # Entry point
```

## API Reference

### Destination Endpoints

#### GET `/api/destinations`
- Returns a list of all available destinations
- No parameters required

#### GET `/api/destinations/:id`
- Returns detailed information about a specific destination
- Parameters:
  - `id`: Destination ID

#### GET `/api/destinations/optimal`
- Returns destinations optimized for a given budget and duration
- Query Parameters:
  - `budget`: Total budget in USD
  - `days`: Trip duration in days
  - `origin` (optional): Origin location code

### Flight Endpoints

#### GET `/api/flights`
- Returns flight information
- Query Parameters:
  - `origin` (optional): Origin location code
  - `destination` (optional): Destination location code
  - `departureDate` (optional): Departure date (YYYY-MM-DD)
  - `returnDate` (optional): Return date (YYYY-MM-DD)

### Accommodation Endpoints

#### GET `/api/accommodations`
- Returns accommodation options
- Query Parameters:
  - `destination`: Destination location code or name
  - `checkIn` (optional): Check-in date (YYYY-MM-DD)
  - `checkOut` (optional): Check-out date (YYYY-MM-DD)

#### GET `/api/accommodations/prices`
- Returns average accommodation prices for a destination
- Query Parameters:
  - `destination`: Destination name
  - `days` (optional): Number of days

### Budget Endpoints

#### GET `/api/budget/analysis`
- Returns budget analysis for a specific destination
- Query Parameters:
  - `destination`: Destination ID
  - `budget`: Total budget in USD
  - `days`: Trip duration in days
  - `origin` (optional): Origin location code

#### GET `/api/budget/optimal-duration`
- Returns optimal trip duration analysis
- Query Parameters:
  - `destination`: Destination ID
  - `budget`: Total budget in USD
  - `origin` (optional): Origin location code

### Cost of Living Endpoints

#### GET `/api/costs/city`
- Returns cost of living data for a city
- Query Parameters:
  - `city`: City name
  - `country`: Country name

#### GET `/api/costs/exchange-rates`
- Returns exchange rates
- Query Parameters:
  - `baseCurrency` (optional): Base currency code (default: USD)

#### GET `/api/costs/accommodation`
- Returns accommodation costs based on hotel data and cost of living data
- Query Parameters:
  - `city`: City name
  - `country`: Country name
  - `days` (optional): Number of days

## External API Integration

### API Keys Setup

To use the external APIs, you need to obtain API keys and add them to your `.env` file:

1. **Skyscanner API**
   - Sign up at [RapidAPI](https://rapidapi.com/skyscanner/api/skyscanner-flight-search)
   - Subscribe to the API to get your API key
   - Add to `.env`: `SKYSCANNER_API_KEY=your_key_here`

2. **Booking.com API**
   - Sign up at [RapidAPI](https://rapidapi.com/apidojo/api/booking)
   - Subscribe to the API to get your API key
   - Add to `.env`: `BOOKING_API_KEY=your_key_here`

3. **Numbeo API**
   - Sign up at [RapidAPI](https://rapidapi.com/numbeo/api/cost-of-living-and-prices)
   - Subscribe to the API to get your API key
   - Add to `.env`: `NUMBEO_API_KEY=your_key_here`

4. Set `USE_MOCK_DATA=false` in the `.env` file to use real APIs

### API Caching Strategy

The application implements a caching strategy to minimize external API calls:

- Flight searches are cached for 1 hour
- Destination information is cached for 24 hours
- Cost of living data is cached for 24 hours
- Exchange rates are cached for 24 hours

You can adjust the cache TTL (time to live) in `.env` by setting:
```
CACHE_TTL=3600 # Cache time to live in seconds (1 hour)
```

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules configured in the project
- Use functional components with React Hooks
- Keep components small and focused on a single responsibility
- Use async/await for asynchronous operations

### Adding New Features

1. **Backend**:
   - Add new service functions in the appropriate service file
   - Add new API endpoints in the appropriate route file
   - Update the mock data if needed
   - Add appropriate caching

2. **Frontend**:
   - Add new API methods in `services/api.ts`
   - Create new components in the `components` directory
   - Add new pages in the `pages` directory
   - Update `App.tsx` with new routes if needed

### Running in Development Mode

```bash
# Backend development with auto-reload
cd backend && npm run dev

# Frontend development with hot-reload
cd frontend && npm start
```

### Troubleshooting Common Issues

#### API Rate Limits

If you're hitting API rate limits, try:
- Extending the cache TTL
- Using more specific API queries
- Implementing request throttling
- Temporarily switching to mock data mode

#### Mock Data Issues

If you encounter issues with mock data:
- Check that mock data structure matches the API structure
- Ensure IDs are consistent across different mock data sets
- Add more diverse test cases to the mock data

#### Frontend/Backend Communication

If the frontend can't communicate with the backend:
- Verify the API URL is correct in `frontend/.env`
- Check that CORS is properly configured in the backend
- Ensure the backend server is running

## Deployment

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Prepare backend for production
cd backend
# Set NODE_ENV=production in .env
```

### Deployment Options

1. **Traditional Hosting**
   - Deploy the backend to a Node.js host (Heroku, DigitalOcean, etc.)
   - Deploy the frontend build to a static file host (Netlify, Vercel, etc.)
   - Configure environment variables on the hosting platform

2. **Docker Deployment**
   - Use the provided Dockerfile to build a container
   - Deploy container to a container hosting service

3. **Serverless**
   - Convert backend to serverless functions
   - Deploy frontend to a static host
   - Configure environment variables

Remember to never expose API keys in the frontend code or commit them to version control!