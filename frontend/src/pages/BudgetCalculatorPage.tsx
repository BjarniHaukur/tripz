import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Slider,
  InputAdornment,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  SelectChangeEvent
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HotelIcon from '@mui/icons-material/Hotel';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import FlightIcon from '@mui/icons-material/Flight';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import api, { Destination, BudgetAnalysis, OptimalDuration } from '../services/api';

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
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
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

const BudgetCalculatorPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDestId = queryParams.get('destination') || '';
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzingOptimal, setAnalyzingOptimal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  const [selectedDestination, setSelectedDestination] = useState<string>(initialDestId);
  const [budget, setBudget] = useState<number>(1500);
  const [days, setDays] = useState<number>(7);
  const [origin, setOrigin] = useState<string>('NYC');
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [optimalDuration, setOptimalDuration] = useState<OptimalDuration | null>(null);

  const originOptions = ['NYC', 'LAX', 'CHI'];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getDestinations();
        setDestinations(data);
        setLoading(false);
        
        // If we have an initial destination and it exists in the data, run the analysis
        if (initialDestId && data.some(d => d.id === initialDestId)) {
          handleCalculate();
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Failed to fetch destinations. Please try again.');
        setLoading(false);
      }
    };

    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDestId]);

  const handleDestinationChange = (event: SelectChangeEvent) => {
    setSelectedDestination(event.target.value);
    setAnalysis(null); // Clear previous analysis when destination changes
    setOptimalDuration(null);
  };

  const handleOriginChange = (event: SelectChangeEvent) => {
    setOrigin(event.target.value);
    setAnalysis(null); // Clear analysis when origin changes
    setOptimalDuration(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // If switching to optimal duration tab and we haven't fetched the data yet
    if (newValue === 1 && selectedDestination && !optimalDuration) {
      handleFindOptimalDuration();
    }
  };

  const handleCalculate = async () => {
    if (!selectedDestination) {
      setError('Please select a destination');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      const data = await api.getBudgetAnalysis(selectedDestination, budget, days, origin);
      setAnalysis(data);
      setAnalyzing(false);
    } catch (error) {
      console.error('Error calculating budget:', error);
      setError('Failed to calculate budget. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleFindOptimalDuration = async () => {
    if (!selectedDestination) {
      setError('Please select a destination');
      return;
    }

    try {
      setAnalyzingOptimal(true);
      setError(null);
      const data = await api.getOptimalDuration(selectedDestination, budget, origin);
      setOptimalDuration(data);
      setAnalyzingOptimal(false);
    } catch (error) {
      console.error('Error finding optimal duration:', error);
      setError('Failed to find optimal duration. Please try again.');
      setAnalyzingOptimal(false);
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

  const selectedDest = destinations.find(d => d.id === selectedDestination);
  
  // Prepare data for the pie chart if we have analysis
  const costData = analysis ? [
    { name: 'Flight', value: analysis.costs.flight },
    { name: 'Accommodation', value: analysis.costs.accommodation },
    { name: 'Food', value: analysis.costs.food },
    { name: 'Transportation', value: analysis.costs.transportation },
    { name: 'Activities', value: analysis.costs.activities },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const budgetPercentage = analysis ? (analysis.costs.total / budget) * 100 : 0;

  // Data for the optimal duration chart
  const durationChartData = optimalDuration ? 
    optimalDuration.possibleDurations.map(d => ({
      days: d.days,
      totalCost: d.totalCost,
      costPerDay: d.costPerDay,
      flightPercentage: d.flightCostPercentage,
      isOptimal: optimalDuration.optimalDuration && d.days === optimalDuration.optimalDuration.days
    })) : [];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Budget Calculator
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Calculate how far your budget will go for your travel plans
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        )}

        <Paper sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="destination-select-label">Destination</InputLabel>
                <Select
                  labelId="destination-select-label"
                  value={selectedDestination}
                  label="Destination"
                  onChange={handleDestinationChange}
                >
                  {destinations.map((dest) => (
                    <MenuItem key={dest.id} value={dest.id}>
                      {dest.name}, {dest.country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="origin-select-label">Origin</InputLabel>
                <Select
                  labelId="origin-select-label"
                  value={origin}
                  label="Origin"
                  onChange={handleOriginChange}
                >
                  {originOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Total Budget (USD)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon sx={{ color: 'action.active', mr: 1 }} />
                <Slider
                  value={budget}
                  onChange={(e, newValue) => {
                    setBudget(newValue as number);
                    setAnalysis(null);
                    setOptimalDuration(null);
                  }}
                  min={500}
                  max={5000}
                  step={100}
                  valueLabelDisplay="auto"
                  sx={{ mx: 2 }}
                />
                <Typography>{budget}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography gutterBottom>Trip Duration (Days)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ color: 'action.active', mr: 1 }} />
                <Slider
                  value={days}
                  onChange={(e, newValue) => {
                    setDays(newValue as number);
                    setAnalysis(null);
                  }}
                  min={3}
                  max={30}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ mx: 2 }}
                />
                <Typography>{days}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleCalculate}
                disabled={!selectedDestination || analyzing}
                sx={{ minWidth: 200 }}
              >
                {analyzing ? <CircularProgress size={24} /> : 'Calculate Budget'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {(analysis || optimalDuration) && (
          <Paper sx={{ p: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="budget calculator tabs">
                <Tab label="Budget Analysis" id="budget-tab-0" />
                <Tab label="Optimal Duration" id="budget-tab-1" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {analysis && (
                <>
                  <Typography variant="h5" gutterBottom>
                    Budget Analysis for {analysis.destination}
                  </Typography>
                  
                  <Box sx={{ my: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Budget Usage: ${analysis.costs.total.toLocaleString()} / ${budget.toLocaleString()}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budgetPercentage, 100)} 
                      color={analysis.isWithinBudget ? "success" : "error"}
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography variant="body2" color={analysis.isWithinBudget ? "success.main" : "error"}>
                      {analysis.isWithinBudget 
                        ? `Your budget is sufficient with $${analysis.remainingBudget.toLocaleString()} remaining` 
                        : `You are over budget by $${Math.abs(analysis.remainingBudget).toLocaleString()}`}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
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
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Expense Details</Typography>
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FlightIcon sx={{ mr: 2, color: COLORS[0] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Flight from {origin}</Typography>
                              <Typography variant="h6">${analysis.costs.flight.toLocaleString()}</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <HotelIcon sx={{ mr: 2, color: COLORS[1] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Accommodation</Typography>
                              <Typography variant="h6">${analysis.costs.accommodation.toLocaleString()}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${(analysis.costs.accommodation / days).toFixed(0)} per night × {days} nights
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FastfoodIcon sx={{ mr: 2, color: COLORS[2] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Food</Typography>
                              <Typography variant="h6">${analysis.costs.food.toLocaleString()}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${(analysis.costs.food / days).toFixed(0)} per day × {days} days
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DirectionsBusIcon sx={{ mr: 2, color: COLORS[3] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Transportation</Typography>
                              <Typography variant="h6">${analysis.costs.transportation.toLocaleString()}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${(analysis.costs.transportation / days).toFixed(0)} per day × {days} days
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalActivityIcon sx={{ mr: 2, color: COLORS[4] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Activities</Typography>
                              <Typography variant="h6">${analysis.costs.activities.toLocaleString()}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${(analysis.costs.activities / days).toFixed(0)} per day × {days} days
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>Budget Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                        <Typography variant="h5">${analysis.costs.total.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Daily Cost</Typography>
                        <Typography variant="h5">${(analysis.costs.totalDaily || analysis.dailyCost || (analysis.costs.total - analysis.costs.flight) / days).toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
                        <Typography variant="h5">${budget.toLocaleString()}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: analysis.isWithinBudget ? 'success.light' : 'error.light' }}>
                        <Typography variant="subtitle2" color="white">Remaining</Typography>
                        <Typography variant="h5" color="white">
                          ${analysis.remainingBudget.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {analysis.budgetBreakdown && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>Budget Breakdown Percentages</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Flight</Typography>
                            <Typography variant="h5">{analysis.budgetBreakdown.flight.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Accommodation</Typography>
                            <Typography variant="h5">{analysis.budgetBreakdown.accommodation.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Food</Typography>
                            <Typography variant="h5">{analysis.budgetBreakdown.food.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Transportation</Typography>
                            <Typography variant="h5">{analysis.budgetBreakdown.transportation.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Activities</Typography>
                            <Typography variant="h5">{analysis.budgetBreakdown.activities.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                            <Typography variant="subtitle2" color="white">Remaining</Typography>
                            <Typography variant="h5" color="white">{analysis.budgetBreakdown.remaining.toFixed(1)}%</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {analyzingOptimal ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : optimalDuration ? (
                <>
                  <Typography variant="h5" gutterBottom>
                    Optimal Trip Duration for {optimalDuration.destination}
                  </Typography>
                  
                  <Box sx={{ mt: 3, mb: 4 }}>
                    <Typography variant="body1">
                      For your budget of ${budget.toLocaleString()}, the optimal trip duration is{' '}
                      <strong>{optimalDuration.optimalDuration?.days || 'N/A'} days</strong>{' '}
                      which costs{' '}
                      <strong>${optimalDuration.optimalDuration?.totalCost.toLocaleString() || 'N/A'}</strong>{' '}
                      (${optimalDuration.optimalDuration?.costPerDay.toFixed(2) || 'N/A'} per day).
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      You can stay a maximum of <strong>{optimalDuration.maxPossibleDays} days</strong> within your budget.
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Cost vs. Duration Analysis</Typography>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={durationChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="days" 
                              label={{ value: 'Trip Duration (Days)', position: 'insideBottomRight', offset: -10 }}
                            />
                            <YAxis 
                              yAxisId="left"
                              label={{ value: 'Total Cost ($)', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 400]}
                              label={{ value: 'Cost per Day ($)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip formatter={(value, name) => {
                              if (name === 'totalCost') return [`$${Number(value).toLocaleString()}`, 'Total Cost'];
                              if (name === 'costPerDay') return [`$${Number(value).toFixed(2)}`, 'Cost per Day'];
                              if (name === 'flightPercentage') return [`${Number(value).toFixed(1)}%`, 'Flight % of Total'];
                              return [value, name];
                            }} />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="totalCost" 
                              stroke="#8884d8" 
                              name="Total Cost"
                              strokeWidth={2}
                              dot={(props: any) => {
                                const { cx, cy, payload } = props;
                                return payload.isOptimal ? (
                                  <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="8" />
                                  </svg>
                                ) : (
                                  <circle cx={cx} cy={cy} r={4} fill="#8884d8" />
                                );
                              }}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="costPerDay" 
                              stroke="#82ca9d" 
                              name="Cost per Day"
                              strokeWidth={2}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="flightPercentage" 
                              stroke="#ff7300" 
                              name="Flight % of Total"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        The red dot indicates the optimal duration with the lowest cost per day.
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>Trip Cost Analysis</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Fixed Costs</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FlightIcon sx={{ mr: 2, color: COLORS[0] }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1">Flight from {origin}</Typography>
                              <Typography variant="h6">${optimalDuration.flightCost.toLocaleString()}</Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Fixed costs are the same regardless of trip duration. The flight cost represents{' '}
                            {optimalDuration.optimalDuration ? (
                              <strong>{optimalDuration.optimalDuration.flightCostPercentage.toFixed(1)}%</strong>
                            ) : ''}
                            {' '}of the total cost for the optimal duration.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Daily Costs</Typography>
                          <Typography variant="h5" color="primary">${optimalDuration.dailyCost.toLocaleString()}/day</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            This includes accommodation, food, transportation, and activities in {optimalDuration.destination}.
                            A longer trip spreads the fixed costs over more days, reducing the average daily cost.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Budget Impact</Typography>
                          {optimalDuration.optimalDuration ? (
                            <>
                              <Typography variant="h5" color={optimalDuration.optimalDuration.isWithinBudget ? "success.main" : "error"}>
                                ${optimalDuration.optimalDuration.remainingBudget.toLocaleString()}{' '}
                                {optimalDuration.optimalDuration.isWithinBudget ? 'remaining' : 'over budget'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                With the optimal duration of {optimalDuration.optimalDuration.days} days, your trip will cost{' '}
                                ${optimalDuration.optimalDuration.totalCost.toLocaleString()}, leaving you with{' '}
                                ${optimalDuration.optimalDuration.remainingBudget.toLocaleString()}{' '}
                                {optimalDuration.optimalDuration.isWithinBudget ? 'remaining' : 'over budget'}.
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body1">
                              No optimal duration found within your budget.
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Note: The optimal duration provides the best value by balancing fixed costs (flights) with daily expenses.
                      This calculation assumes flight prices remain constant regardless of the trip duration.
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Find the optimal trip duration for your budget
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Discover how long you can stay at your chosen destination to get the best value from your budget.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleFindOptimalDuration}
                    disabled={!selectedDestination}
                    sx={{ mt: 2 }}
                  >
                    Find Optimal Duration
                  </Button>
                </Box>
              )}
            </TabPanel>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default BudgetCalculatorPage;