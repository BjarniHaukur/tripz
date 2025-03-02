import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia,
  Button,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { OptimalDestination } from '../services/api';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [destinations, setDestinations] = useState<OptimalDestination[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const origin = queryParams.get('origin') || '';
  const budget = Number(queryParams.get('budget')) || 1000;
  const days = Number(queryParams.get('days')) || 7;

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getOptimalDestinations(budget, days, origin);
        setDestinations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Failed to fetch destinations. Please try again.');
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [origin, budget, days]);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Showing destinations within your budget of ${budget} for {days} days
          {origin && ` from ${origin}`}
        </Typography>

        {destinations.length === 0 ? (
          <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6">No destinations found within your budget</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Try increasing your budget or reducing the number of days.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 3 }}
              onClick={() => navigate('/')}
            >
              Back to Search
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {destinations.map((destination) => (
              <Grid item key={destination.id} xs={12}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/destination/${destination.id}`)}>
                    <Grid container>
                      <Grid item xs={12} md={4}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={destination.imageUrl}
                          alt={destination.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h5" component="div">
                              {destination.name}, {destination.country}
                            </Typography>
                            <Chip 
                              label={`Save $${destination.savingsAmount}`} 
                              color="success" 
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" color="primary">
                              Total Cost: ${destination.totalCost}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FlightIcon color="action" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    Flight: ${destination.flightCost}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <HotelIcon color="action" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    Accommodation
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FastfoodIcon color="action" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    Food
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <DirectionsBusIcon color="action" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    Transportation
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Daily cost: ${destination.dailyCost}/day
                            </Typography>
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default SearchPage;