import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia,
  TextField,
  Button,
  Autocomplete,
  Slider,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api, { Destination } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [origin, setOrigin] = useState<string>('');
  const [budget, setBudget] = useState<number>(1000);
  const [days, setDays] = useState<number>(7);

  const originOptions = ['NYC', 'LAX', 'CHI'];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await api.getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };

    fetchDestinations();
  }, []);

  const handleSearch = () => {
    navigate(`/search?origin=${origin}&budget=${budget}&days=${days}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Find Budget-Friendly Travel Destinations
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Discover destinations that balance flight costs with daily expenses
        </Typography>

        {/* Search Box */}
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Autocomplete
                value={origin}
                onChange={(event, newValue) => {
                  setOrigin(newValue || '');
                }}
                options={originOptions}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Origin" 
                    fullWidth 
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Budget (USD)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon sx={{ color: 'action.active', mr: 1 }} />
                <Slider
                  value={budget}
                  onChange={(e, newValue) => setBudget(newValue as number)}
                  min={500}
                  max={5000}
                  step={100}
                  valueLabelDisplay="auto"
                  sx={{ mr: 2 }}
                />
                <Typography>{budget}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Days</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ color: 'action.active', mr: 1 }} />
                <Slider
                  value={days}
                  onChange={(e, newValue) => setDays(newValue as number)}
                  min={3}
                  max={30}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ mr: 2 }}
                />
                <Typography>{days}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Featured Destinations */}
        <Typography variant="h4" component="h2" gutterBottom>
          Popular Destinations
        </Typography>
        <Grid container spacing={4}>
          {destinations.slice(0, 6).map((destination) => (
            <Grid item key={destination.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => navigate(`/destination/${destination.id}`)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={destination.imageUrl}
                    alt={destination.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {destination.name}, {destination.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {destination.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.primary">
                        Daily cost: ${destination.costs.accommodation + destination.costs.food + destination.costs.transportation + destination.costs.activities}/day
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;