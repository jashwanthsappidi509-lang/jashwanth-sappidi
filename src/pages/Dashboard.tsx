import React, { useEffect, useState } from 'react';
import { 
  CloudSun, 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [yieldHistory, setYieldHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public data first
        const [weatherData, marketData] = await Promise.all([
          api.getWeather().catch(err => { console.error(err); return null; }),
          api.getMarketPrices({}).catch(err => { console.error(err); return []; })
        ]);
        
        setWeather(weatherData);
        setMarketPrices(marketData);

        // Try to fetch private data if token exists
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await api.getProfile();
            // If profile succeeds, we could fetch history here
          } catch (err) {
            console.warn('User not logged in or session expired');
          }
        }

        // Always set some mock history for the chart for now
        setYieldHistory([
          { year: 2019, yield: 2.4 },
          { year: 2020, yield: 2.6 },
          { year: 2021, yield: 2.3 },
          { year: 2022, yield: 2.8 },
          { year: 2023, yield: 3.1 },
          { year: 2024, yield: 3.3 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: t('Current Temp'), value: weather ? `${weather.temp}°C` : '--', icon: Thermometer, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: t('Humidity'), value: weather ? `${weather.humidity}%` : '--', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('Wind Speed'), value: '12 km/h', icon: Wind, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('Soil Health'), value: 'Good', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('Farmer Dashboard')}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>{t('Live Updates')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Current</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Yield Prediction Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">{t('Crop Yield Prediction')}</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>{t('Actual')}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
                <span>{t('Predicted')}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldHistory}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Risks */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="text-orange-500 mr-2" size={24} />
            {t('Weather Alerts')}
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <h4 className="font-bold text-orange-800 text-sm">Heavy Rain Expected</h4>
              <p className="text-orange-700 text-xs mt-1">High probability of heavy rainfall in the next 48 hours. Ensure proper drainage.</p>
              <span className="text-[10px] text-orange-600 mt-2 block font-medium uppercase tracking-wider">2 hours ago</span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <h4 className="font-bold text-blue-800 text-sm">Frost Warning</h4>
              <p className="text-blue-700 text-xs mt-1">Temperature may drop below 5°C tonight. Protect sensitive crops.</p>
              <span className="text-[10px] text-blue-600 mt-2 block font-medium uppercase tracking-wider">5 hours ago</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-6 flex items-center">
            <ShoppingBag className="text-green-500 mr-2" size={24} />
            {t('Market Trends')}
          </h3>
          <div className="space-y-4">
            {marketPrices.slice(0, 3).map((item) => (
              <div key={item.crop} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-gray-600">{item.crop[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.crop}</h4>
                    <p className="text-gray-500 text-xs">{item.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">₹{item.price}</p>
                  <p className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
