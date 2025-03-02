import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Divider, 
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import FlightIcon from '@mui/icons-material/Flight';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api, { Destination, Flight, Accommodation } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`destination-tabpanel-${index}`}
      aria-labelledby={`destination-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchDestinationData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const destData = await api.getDestination(id);
        setDestination(destData);
        
        const flightData = await api.getFlights(undefined, undefined);
        setFlights(flightData.filter(flight => flight.destination === id));
        
        const accommodationData = await api.getAccommodations(id);
        setAccommodations(accommodationData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destination data:', error);
        setError('Failed to fetch destination data. Please try again.');
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !destination) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 4 }}>
          {error || 'Destination not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const dailyCostTotal = 
    destination.costs.accommodation + 
    destination.costs.food + 
    destination.costs.transportation + 
    destination.costs.activities;

  const costData = [
    { name: 'Accommodation', value: destination.costs.accommodation },
    { name: 'Food', value: destination.costs.food },
    { name: 'Transportation', value: destination.costs.transportation },
    { name: 'Activities', value: destination.costs.activities },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ position: 'relative', height: '300px', mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Box
            component="img"
            src={destination.imageUrl}
            alt={destination.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              p: 2,
            }}
          >
            <Typography variant="h3" component="h1">
              {destination.name}, {destination.country}
            </Typography>
            <Typography variant="subtitle1">
              {destination.description}
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="destination tabs">
              <Tab label="Overview" id="destination-tab-0" />
              <Tab label="Costs" id="destination-tab-1" />
              <Tab label="Flights" id="destination-tab-2" />
              <Tab label="Accommodations" id="destination-tab-3" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Destination Overview</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <HotelIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Accommodation" 
                      secondary={`Average: $${destination.costs.accommodation}/night`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FastfoodIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Food" 
                      secondary={`Average: $${destination.costs.food}/day`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsBusIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Local Transportation" 
                      secondary={`Average: $${destination.costs.transportation}/day`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalActivityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Activities & Attractions" 
                      secondary={`Average: $${destination.costs.activities}/day`} 
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Local Currency: {destination.currency}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Exchange Rate: 1 USD = {(1/destination.exchangeRate).toFixed(2)} {destination.currency}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Best time to visit:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {destination.bestTimeToVisit.map((month) => (
                    <Chip key={month} label={month} size="small" />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Categories:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {destination.categories.map((category) => (
                    <Chip key={category} label={category} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Daily Cost Breakdown</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h6">
                    Total Daily Cost: ${dailyCostTotal}/day
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }} 
                    onClick={() => navigate(`/calculator?destination=${destination.id}`)}
                  >
                    Plan Your Budget
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Cost Details</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Expense Type</TableCell>
                    <TableCell align="right">Cost (USD)</TableCell>
                    <TableCell align="right">Cost ({destination.currency})</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Accommodation (per night)</TableCell>
                    <TableCell align="right">${destination.costs.accommodation}</TableCell>
                    <TableCell align="right">
                      {(destination.costs.accommodation / destination.exchangeRate).toFixed(0)} {destination.currency}
                    </TableCell>
                    <TableCell>Average mid-range options</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Food (per day)</TableCell>
                    <TableCell align="right">${destination.costs.food}</TableCell>
                    <TableCell align="right">
                      {(destination.costs.food / destination.exchangeRate).toFixed(0)} {destination.currency}
                    </TableCell>
                    <TableCell>Mix of local restaurants and street food</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Local Transportation (per day)</TableCell>
                    <TableCell align="right">${destination.costs.transportation}</TableCell>
                    <TableCell align="right">
                      {(destination.costs.transportation / destination.exchangeRate).toFixed(0)} {destination.currency}
                    </TableCell>
                    <TableCell>Public transport and occasional taxis</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Activities (per day)</TableCell>
                    <TableCell align="right">${destination.costs.activities}</TableCell>
                    <TableCell align="right">
                      {(destination.costs.activities / destination.exchangeRate).toFixed(0)} {destination.currency}
                    </TableCell>
                    <TableCell>Museums, tours, and attractions</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Available Flights</Typography>
            {flights.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Origin</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Stops</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flights.map((flight) => (
                      <TableRow key={flight.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FlightIcon sx={{ mr: 1 }} />
                            {flight.origin}
                          </Box>
                        </TableCell>
                        <TableCell>${flight.price}</TableCell>
                        <TableCell>{flight.duration}</TableCell>
                        <TableCell>{flight.stops}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No flight information available for this destination.</Alert>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Accommodation Options</Typography>
            <Grid container spacing={3}>
              {accommodations.map((accommodation) => (
                <Grid item key={accommodation.id} xs={12} md={6} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{accommodation.name}</Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                        <Typography variant="h6" color="primary">
                          ${accommodation.pricePerNight}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          per night
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                        {accommodation.amenities.map((amenity, index) => (
                          <Chip key={index} label={amenity} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default DestinationPage;