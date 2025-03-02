# Tripz Project Notes

## Project Structure
- Backend: Express API with mock data
- Frontend: React with TypeScript, Material-UI, Recharts

## Commands

### Start the app (both backend and frontend)
```
npm start
```

### Start backend development server with hot reload
```
cd backend && npm run dev
```

### Start frontend development server
```
cd frontend && npm start
```

### Install all dependencies
```
npm run install:all
```

## Backend API Endpoints

- GET `/api/destinations` - Get all destinations
- GET `/api/flights` - Get flights (with optional origin and budget query params)
- GET `/api/accommodations` - Get accommodations (with optional destination query param)
- GET `/api/budget-analysis` - Get budget analysis (requires destination, budget, days query params)
- GET `/api/optimal-destinations` - Get optimal destinations (requires budget, days and optional origin query params)

## Frontend Pages

- `/` - Home page with search form and featured destinations
- `/search` - Search results page showing destinations within budget
- `/destination/:id` - Detailed information about a destination
- `/calculator` - Budget calculator tool
- `/compare` - Destination comparison tool