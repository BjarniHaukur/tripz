# Tripz - Budget-Aware Travel Planning

Tripz is a comprehensive travel planning application that helps users find optimal travel destinations by balancing flight costs with in-country expenses. Instead of just searching for the cheapest flights, Tripz considers the total trip cost including accommodation, food, transportation, and activities.

![Tripz Screenshot](https://via.placeholder.com/1200x630?text=Tripz+Budget+Travel+Planning+App)

## Features

- **Budget-First Approach**: Start with your total travel budget and see where you can go
- **Destination Comparison**: Compare multiple destinations based on total trip cost
- **Cost Breakdown**: Visualize how your money would be spent in different locations
- **Duration Optimization**: Determine optimal trip duration based on flight costs vs. daily expenses
- **Personalized Recommendations**: Suggest destinations based on your preferences and budget

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/tripz.git
cd tripz
```

2. Install dependencies for all parts of the application
```
npm run install:all
```

3. Configure the API keys (optional)
   - By default, the application runs with mock data
   - To use real APIs, create a `.env` file in the `backend` directory based on `.env.example`
   - Update the `USE_MOCK_DATA` value to `false` to use real APIs

4. Start the application (runs both backend and frontend)
```
npm start
```

The application will be available at:
- Frontend: http://localhost:3030
- Backend API: http://localhost:5050

## API Configuration

The application can use the following external APIs:

### Flight Data
- **Skyscanner API**: For flight prices and availability
- Get an API key from [RapidAPI Skyscanner](https://rapidapi.com/skyscanner/api/skyscanner-flight-search)

### Accommodation Data
- **Booking.com API**: For accommodation prices and details
- Get an API key from [RapidAPI Booking.com](https://rapidapi.com/apidojo/api/booking)

### Cost of Living Data
- **Numbeo API**: For daily expense estimates in different cities
- Get an API key from [RapidAPI Numbeo](https://rapidapi.com/numbeo/api/cost-of-living-and-prices)

## API Modes

The application can run in two modes:

### Mock Data Mode (default)
- Uses predefined mock data for destinations, flights, and accommodations
- Great for development and testing without API keys
- Set `USE_MOCK_DATA=true` in the `.env` file

### Live API Mode
- Connects to real external APIs for up-to-date data
- Requires API keys to be set in the `.env` file
- Set `USE_MOCK_DATA=false` in the `.env` file

## How It Works

1. **Enter your budget and travel preferences**
   - Total budget amount
   - Trip duration
   - Origin airport

2. **Explore destinations within your budget**
   - View total cost estimates
   - See how much you'd save at each destination

3. **Compare destinations**
   - View side-by-side cost breakdowns
   - Compare daily expenses across multiple places

4. **Calculate detailed budgets**
   - See exactly how your money would be spent
   - Understand the balance between flight costs and daily expenses
   
5. **Find optimal trip duration**
   - Determine the best length for your trip based on your budget
   - See how fixed costs (flights) vs. daily costs affect total value

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Recharts for data visualization
- React Router for navigation
- Axios for API requests

### Backend
- Node.js
- Express
- API integrations with caching
- Mock data for development mode

## Future Enhancements

- User accounts to save favorite destinations and trips
- Seasonal price variations
- More granular cost categories
- Currency conversion options
- Mobile app version

## License

This project is licensed under the MIT License - see the LICENSE file for details