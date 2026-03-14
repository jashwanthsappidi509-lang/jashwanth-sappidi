export const COLORS = {
  primary: '#2D5A27', // Forest Green
  secondary: '#8B4513', // Saddle Brown
  accent: '#F4A460', // Sandy Brown
  background: '#F5F5F0', // Warm Off-white
  text: '#1A1A1A',
  muted: '#6B7280',
};

export const MOCK_WEATHER = {
  temp: 28,
  humidity: 65,
  rainfall: 120,
  condition: 'Partly Cloudy',
  forecast: [
    { day: 'Mon', temp: 27, condition: 'Sunny' },
    { day: 'Tue', temp: 29, condition: 'Cloudy' },
    { day: 'Wed', temp: 26, condition: 'Rain' },
    { day: 'Thu', temp: 28, condition: 'Sunny' },
    { day: 'Fri', temp: 30, condition: 'Sunny' },
    { day: 'Sat', temp: 31, condition: 'Partly Cloudy' },
    { day: 'Sun', temp: 29, condition: 'Cloudy' },
  ],
};

export const MOCK_MARKET_PRICES = [
  { crop: 'Wheat', state: 'Punjab', price: 2100, change: 2.5 },
  { crop: 'Rice', state: 'West Bengal', price: 1950, change: -1.2 },
  { crop: 'Maize', state: 'Karnataka', price: 1800, change: 0.8 },
  { crop: 'Cotton', state: 'Gujarat', price: 6200, change: 5.4 },
  { crop: 'Soybean', state: 'Madhya Pradesh', price: 4500, change: -0.5 },
];

export const MOCK_YIELD_DATA = [
  { year: 2019, yield: 2.4 },
  { year: 2020, yield: 2.6 },
  { year: 2021, yield: 2.3 },
  { year: 2022, yield: 2.8 },
  { year: 2023, yield: 3.1 },
  { year: 2024, yield: 3.3 },
];
