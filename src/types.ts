export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  condition: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

export interface CropRecommendation {
  crop: string;
  confidence: number;
  description: string;
}

export interface MarketPrice {
  crop: string;
  state: string;
  price: number;
  change: number;
}

export interface YieldPrediction {
  year: number;
  yield: number;
}

export interface FarmerProfile {
  name: string;
  location: string;
  farmSize: string;
  history: string[];
}
