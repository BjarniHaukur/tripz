import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component={RouterLink} to="/" sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white' 
          }}>
            Tripz
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/search"
            >
              Search
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/calculator"
            >
              Budget Calculator
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/compare"
            >
              Compare Destinations
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;