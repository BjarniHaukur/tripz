import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import FlightIcon from '@mui/icons-material/Flight';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api, { Destination, Flight } from '../services/api';

const ComparisonPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [origin, setOrigin] = useState<string>('NYC');
  const [days, setDays] = useState<number>(7);
  
  const originOptions = ['NYC', 'LAX', 'CHI'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [destinationsData, flightsData] = await Promise.all([
          api.getDestinations(),
          api.getFlights()
        ]);
        
        setDestinations(destinationsData);
        setFlights(flightsData);
        setLoading(false);
        
        // Initialize with two destinations for comparison
        if (destinationsData.length >= 2) {
          setSelectedDestinations([destinationsData[0].id, destinationsData[1].id]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDestinationChange = (index: number) => (event: SelectChangeEvent) => {
    const newDestinations = [...selectedDestinations];
    newDestinations[index] = event.target.value;
    setSelectedDestinations(newDestinations);
  };

  const handleOriginChange = (event: SelectChangeEvent) => {
    setOrigin(event.target.value);
  };

  const handleAddDestination = () => {
    if (selectedDestinations.length < 4) {
      // Find a destination not already selected
      const availableDest = destinations.find(d => !selectedDestinations.includes(d.id));
      if (availableDest) {
        setSelectedDestinations([...selectedDestinations, availableDest.id]);
      }
    }
  };

  const handleRemoveDestination = (index: number) => {
    if (selectedDestinations.length > 2) {
      const newDestinations = [...selectedDestinations];
      newDestinations.splice(index, 1);
      setSelectedDestinations(newDestinations);
    }
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

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
      </Container>
    );
  }

  // Get the selected destination objects
  const selectedDestinationObjects = selectedDestinations.map(id => 
    destinations.find(d => d.id === id)
  ).filter(Boolean) as Destination[];

  // Get flight costs for selected destinations from the selected origin
  const flightCosts = selectedDestinationObjects.map(dest => {
    const flight = flights.find(f => f.destination === dest.id && f.origin === origin);
    return flight ? flight.price : 0;
  });

  // Calculate total costs for each destination
  const totalCosts = selectedDestinationObjects.map((dest, index) => {
    const flightCost = flightCosts[index];
    const dailyCost = dest.costs.accommodation + dest.costs.food + dest.costs.transportation + dest.costs.activities;
    return flightCost + (dailyCost * days);
  });

  // Prepare data for charts
  const costBreakdownData = selectedDestinationObjects.map((dest, index) => ({
    name: dest.name,
    Flight: flightCosts[index],
    Accommodation: dest.costs.accommodation * days,
    Food: dest.costs.food * days,
    Transportation: dest.costs.transportation * days,
    Activities: dest.costs.activities * days,
  }));

  const dailyCostData = selectedDestinationObjects.map(dest => ({
    name: dest.name,
    Accommodation: dest.costs.accommodation,
    Food: dest.costs.food,
    Transportation: dest.costs.transportation,
    Activities: dest.costs.activities,
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Destination Comparison
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Compare costs and details between multiple destinations
        </Typography>

        <Paper sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="origin-select-label">Origin</InputLabel>
                <Select
                  labelId="origin-select-label"
                  value={origin}
                  label="Origin"
                  onChange={handleOriginChange}
                >
                  {originOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }}>Trip Duration:</Typography>
                <Chip label={`${days} days`} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                onClick={handleAddDestination}
                disabled={selectedDestinations.length >= 4}
                sx={{ mr: 2 }}
              >
                Add Destination
              </Button>
            </Grid>
          </Grid>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {selectedDestinationObjects.map((dest, index) => (
              <Grid item xs={12} sm={6} md={selectedDestinations.length > 2 ? 3 : 6} key={dest.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Destination {index + 1}</Typography>
                      {selectedDestinations.length > 2 && (
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => handleRemoveDestination(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id={`destination-${index}-label`}>Destination</InputLabel>
                      <Select
                        labelId={`destination-${index}-label`}
                        value={dest.id}
                        label="Destination"
                        onChange={handleDestinationChange(index)}
                      >
                        {destinations.map((d) => (
                          <MenuItem 
                            key={d.id} 
                            value={d.id}
                            disabled={selectedDestinations.includes(d.id) && d.id !== dest.id}
                          >
                            {d.name}, {d.country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box 
                      component="img"
                      src={dest.imageUrl}
                      alt={dest.name}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {dest.description.substring(0, 100)}...
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ mr: 1 }} />
                      Total Cost: ${totalCosts[index]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Total Cost Comparison</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={costBreakdownData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Cost (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="Flight" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Accommodation" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="Food" stackId="a" fill="#ffc658" />
                    <Bar dataKey="Transportation" stackId="a" fill="#ff7300" />
                    <Bar dataKey="Activities" stackId="a" fill="#0088fe" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Daily Cost Comparison</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyCostData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Daily Cost (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="Accommodation" fill="#82ca9d" />
                    <Bar dataKey="Food" fill="#ffc658" />
                    <Bar dataKey="Transportation" fill="#ff7300" />
                    <Bar dataKey="Activities" fill="#0088fe" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Detailed Cost Comparison</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Expense</TableCell>
                      {selectedDestinationObjects.map(dest => (
                        <TableCell key={dest.id} align="right">{dest.name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlightIcon sx={{ mr: 1 }} />
                          Flight (from {origin})
                        </Box>
                      </TableCell>
                      {flightCosts.map((cost, i) => (
                        <TableCell key={i} align="right">${cost}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HotelIcon sx={{ mr: 1 }} />
                          Accommodation (per night)
                        </Box>
                      </TableCell>
                      {selectedDestinationObjects.map(dest => (
                        <TableCell key={dest.id} align="right">${dest.costs.accommodation}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FastfoodIcon sx={{ mr: 1 }} />
                          Food (per day)
                        </Box>
                      </TableCell>
                      {selectedDestinationObjects.map(dest => (
                        <TableCell key={dest.id} align="right">${dest.costs.food}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsBusIcon sx={{ mr: 1 }} />
                          Transportation (per day)
                        </Box>
                      </TableCell>
                      {selectedDestinationObjects.map(dest => (
                        <TableCell key={dest.id} align="right">${dest.costs.transportation}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalActivityIcon sx={{ mr: 1 }} />
                          Activities (per day)
                        </Box>
                      </TableCell>
                      {selectedDestinationObjects.map(dest => (
                        <TableCell key={dest.id} align="right">${dest.costs.activities}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                      <TableCell>Total for {days} days</TableCell>
                      {totalCosts.map((cost, i) => (
                        <TableCell key={i} align="right">${cost}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ComparisonPage;