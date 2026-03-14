import React, { useState, useEffect } from 'react';
import { CloudSun, Thermometer, Droplets, Wind, CloudRain, Sun, Cloud, CloudLightning, MapPin, Calendar, ArrowRight, Info, Search, Loader2, Globe } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import VoiceTranscriber from '../components/VoiceTranscriber';

const conditionIcons = {
  'Sunny': Sun,
  'Clear': Sun,
  'Cloudy': Cloud,
  'Overcast': Cloud,
  'Rain': CloudRain,
  'Showers': CloudRain,
  'Partly Cloudy': CloudSun,
  'Mostly Cloudy': CloudSun,
  'Storm': CloudLightning,
  'Thunderstorm': CloudLightning,
  'Humid': Droplets,
  'Mist': Cloud,
  'Fog': Cloud,
};

export default function Weather() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchLiveWeather = async (location: string) => {
    setLoading(true);
    setIsLive(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide current weather and 7-day forecast for ${location}. Return ONLY a JSON object with this structure: { "temp": number, "humidity": number, "rainfall": number, "condition": string, "location": string, "forecast": [{ "day": string, "temp": number, "condition": string }] }. Ensure the condition matches one of: Sunny, Clear, Cloudy, Overcast, Rain, Showers, Partly Cloudy, Mostly Cloudy, Storm, Thunderstorm, Humid, Mist, Fog.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              humidity: { type: Type.NUMBER },
              rainfall: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              location: { type: Type.STRING },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    temp: { type: Type.NUMBER },
                    condition: { type: Type.STRING }
                  }
                }
              }
            }
          }
        },
      });

      const data = JSON.parse(response.text);
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch live weather:', error);
      // Fallback to mock API if Gemini fails
      const data = await api.getWeather(undefined, undefined, location);
      setWeather(data);
      setIsLive(false);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchWeather = async (location?: string) => {
    // Default to live weather for better accuracy as requested
    fetchLiveWeather(location || user?.location || 'Punjab, India');
  };

  useEffect(() => {
    fetchWeather();
  }, [user?.location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setIsSearching(true);
      fetchWeather(searchLocation);
    }
  };

  if (loading && !weather) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Fetching live Google Weather insights...</p>
      </div>
    );
  }

  const CurrentIcon = conditionIcons[weather?.condition as keyof typeof conditionIcons] || CloudSun;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900">Weather Insights</h1>
            {isLive && (
              <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Globe size={10} />
                <span>Live</span>
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">Real-time agricultural weather data via Google Search</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 space-y-2">
            <VoiceTranscriber 
              onTranscription={(text) => {
                setSearchLocation(text);
                fetchWeather(text);
              }}
              placeholder="Speak location..."
            />
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Or type location..."
                className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              />
            </form>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-900 font-bold bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 whitespace-nowrap">
            <MapPin className="text-blue-500" size={16} />
            <span>{weather?.location || 'Detecting...'}</span>
          </div>
        </div>
      </div>

      {/* Current Weather Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-12 rounded-[32px] md:rounded-[40px] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-white/80 font-medium tracking-widest uppercase text-[10px] md:text-xs">
                <Calendar size={14} />
                <span>Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-baseline space-x-4 justify-center md:justify-start">
                <span className="text-6xl md:text-8xl font-bold tracking-tighter">{weather?.temp}°</span>
                <span className="text-xl md:text-2xl text-white/70 font-medium">C</span>
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">{weather?.condition}</h3>
                <p className="text-white/70 text-sm md:text-lg">Feels like {weather?.temp + 2}°C • High {weather?.temp + 4}°C • Low {weather?.temp - 4}°C</p>
              </div>
            </div>
            <div className="mt-8 md:mt-0">
              <CurrentIcon size={120} className="md:w-[160px] md:h-[160px] text-white/90 drop-shadow-2xl" />
            </div>
          </div>

          <div className="mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 border-t border-white/20 pt-8 md:pt-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start text-white/60 mb-1 md:mb-2">
                <Droplets size={16} className="md:w-[18px] md:h-[18px] mr-1 md:mr-2" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Humidity</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{weather?.humidity}%</p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start text-white/60 mb-1 md:mb-2">
                <Wind size={16} className="md:w-[18px] md:h-[18px] mr-1 md:mr-2" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Wind</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">12 km/h</p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start text-white/60 mb-1 md:mb-2">
                <CloudRain size={16} className="md:w-[18px] md:h-[18px] mr-1 md:mr-2" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Rainfall</span>
              </div>
              <p className="text-lg md:text-2xl font-bold">{weather?.rainfall} mm</p>
            </div>
          </div>
        </div>

        {/* Farming Advice */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="text-blue-500 mr-2" size={24} />
              Farming Advice
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <Droplets size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Irrigation Alert</h4>
                  <p className="text-gray-500 text-xs mt-1">
                    {weather?.condition.toLowerCase().includes('rain') 
                      ? 'Rainfall detected. Stop irrigation immediately to prevent waterlogging.' 
                      : 'Predicted rainfall in 48 hours. Postpone heavy irrigation to save water.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <Thermometer size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Pest Control</h4>
                  <p className="text-gray-500 text-xs mt-1">
                    {weather?.humidity > 70 
                      ? 'High humidity levels detected. Extreme risk of fungal growth. Apply fungicides.' 
                      : 'Moderate humidity. Monitor your crops for early signs of pests.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-bold transition-all flex items-center justify-center group">
            Detailed Report
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">7-Day Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {weather?.forecast.map((day: any, index: number) => {
            const DayIcon = conditionIcons[day.condition as keyof typeof conditionIcons] || CloudSun;
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all group cursor-pointer"
              >
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{day.day}</p>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <DayIcon size={24} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{day.temp}°</p>
                <p className="text-xs text-gray-500 mt-1">{day.condition}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
