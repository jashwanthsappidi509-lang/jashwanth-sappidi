import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, ArrowUpRight, ArrowDownRight, MapPin, TrendingUp, ChevronRight, ArrowUpDown, Loader2, Globe, Info } from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Fiber', 'Oilseeds'];
const SORT_OPTIONS = [
  { label: 'Recently Updated', value: 'updated_at' },
  { label: 'Price', value: 'price' },
  { label: 'Change %', value: 'change' },
  { label: 'Crop Name', value: 'crop' },
];

export default function Market() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('updated_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const globalIndices = [
    { name: t('FAO Food Price Index'), value: 125.3, change: 0.9, icon: Globe },
    { name: t('Cereal Price Index'), value: 108.6, change: 1.1, icon: ShoppingBag },
    { name: t('Vegetable Oil Price Index'), value: 174.2, change: 3.3, icon: ShoppingBag },
    { name: t('Meat Price Index'), value: 126.2, change: 0.8, icon: ShoppingBag },
    { name: t('Dairy Price Index'), value: 119.3, change: -1.2, icon: ShoppingBag },
    { name: t('Sugar Price Index'), value: 86.2, change: -4.1, icon: ShoppingBag },
  ];

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const data = await api.getMarketPrices({
        crop: searchTerm,
        category,
        sortBy,
        order
      });
      setPrices(data);
    } catch (error) {
      console.error('Error fetching market prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrices();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, category, sortBy, order]);

  return (
    <div className="space-y-12">
      {/* Global Trends Header */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Globe className="text-blue-600" size={32} />
              {t('Global Food Price Index')}
            </h2>
            <p className="text-gray-500 mt-1">{t('Monthly change in international prices of a basket of food commodities')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{t('February 2026')}</p>
            <p className="text-xs text-gray-400">{t('Source: FAO')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {globalIndices.map((index, idx) => (
            <motion.div
              key={index.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate">{index.name}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{index.value}</p>
                  <div className={`flex items-center text-[10px] font-bold mt-1 ${index.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {index.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(index.change)}%
                  </div>
                </div>
                <div className={`p-2 rounded-xl ${idx === 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                  <index.icon size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('Market Prices')}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <TrendingUp className="text-orange-500" size={16} />
            <span>{t('Real-time Market Data')}</span>
          </div>
        </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search crops or states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 border rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-sm font-medium ${
              showFilters ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          category === cat 
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order</label>
                  <button 
                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                    className="w-full p-3 bg-gray-50 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all text-sm font-medium"
                  >
                    <span>{order === 'asc' ? 'Ascending' : 'Descending'}</span>
                    <ArrowUpDown size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="font-medium text-gray-500">Updating market data...</p>
        </div>
      ) : prices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((item, index) => (
            <motion.div
              key={`${item.crop}-${item.state}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{item.crop}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase tracking-tighter">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {item.state}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  item.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.change > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {Math.abs(item.change)}%
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-gray-50 pt-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Price</p>
                  <p className="text-3xl font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">per quintal</p>
                </div>
                <button className="p-3 bg-gray-50 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
      </div>

      {/* Market Insights */}
      <div className="bg-[#8B4513] rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl shadow-orange-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Market Intelligence Report</h2>
            <p className="text-white/80 leading-relaxed text-base md:text-lg">
              Wheat prices are expected to rise by 5-8% in the coming weeks due to high demand in neighboring states. Consider holding your stock for better returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm flex-1">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Top Gainer</p>
                <p className="text-lg md:text-xl font-bold">Cotton (+5.4%)</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm flex-1">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Volume Alert</p>
                <p className="text-lg md:text-xl font-bold">Rice (High)</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
            <h4 className="font-bold mb-4 text-xl">Price Forecast</h4>
            <div className="space-y-4">
              {[
                { crop: 'Wheat', trend: 'up', color: 'text-green-400' },
                { crop: 'Maize', trend: 'stable', color: 'text-blue-400' },
                { crop: 'Rice', trend: 'down', color: 'text-red-400' },
              ].map((item) => (
                <div key={item.crop} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="font-medium">{item.crop}</span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${item.color}`}>{item.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
