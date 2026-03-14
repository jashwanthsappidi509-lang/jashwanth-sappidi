import React, { useState } from 'react';
import { TrendingUp, Droplets, Thermometer, Wind, Sprout, Search, ArrowRight, Info } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MOCK_YIELD_DATA } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Prediction() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Yield Prediction</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <TrendingUp className="text-blue-500" size={16} />
          <span>Predictive Analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Prediction Parameters</h3>
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Sprout size={16} className="mr-2 text-blue-600" />
                Crop Type
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
                <option>Wheat</option>
                <option>Rice</option>
                <option>Maize</option>
                <option>Cotton</option>
                <option>Soybean</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Droplets size={16} className="mr-2 text-blue-600" />
                Expected Rainfall (mm)
              </label>
              <input 
                type="number" 
                placeholder="e.g., 120"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Thermometer size={16} className="mr-2 text-blue-600" />
                Average Temperature (°C)
              </label>
              <input 
                type="number" 
                placeholder="e.g., 28"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nitrogen (N)</label>
                <input type="number" placeholder="mg/kg" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phosphorus (P)</label>
                <input type="number" placeholder="mg/kg" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPredicting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isPredicting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Calculating Yield...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>Predict Harvest Yield</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!showResult && !isPredicting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp size={40} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Predict</h3>
                <p className="text-gray-500 max-w-sm">Enter your crop and environmental parameters to predict your harvest yield.</p>
              </motion.div>
            )}

            {isPredicting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-gray-100"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp size={48} className="text-blue-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Running Simulations</h3>
                <p className="text-gray-500">Our models are processing historical yield data and current environmental factors...</p>
              </motion.div>
            )}

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Result Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 md:p-10 rounded-3xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                      <h3 className="text-xl md:text-2xl font-bold">Predicted Yield</h3>
                      <span className="bg-white/20 px-3 py-1 md:px-4 md:py-1 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">2024 Season</span>
                    </div>
                    <div className="flex items-baseline space-x-2 md:space-x-4">
                      <span className="text-5xl md:text-7xl font-bold tracking-tighter">3.45</span>
                      <span className="text-lg md:text-2xl text-white/70 font-medium">tons / hectare</span>
                    </div>
                    <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/80 text-sm">
                      <div className="flex items-center">
                        <TrendingUp size={16} className="mr-2 text-green-400" />
                        <span>+12% vs last year</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></div>
                      <div className="flex items-center">
                        <Info size={16} className="mr-2" />
                        <span>95% Confidence Interval</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historical Comparison */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">Yield Comparison (2019 - 2024)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...MOCK_YIELD_DATA, { year: 2024, yield: 3.45 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                        <Tooltip 
                          cursor={{fill: '#f3f4f6'}}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="yield" radius={[8, 8, 0, 0]}>
                          {[...MOCK_YIELD_DATA, { year: 2024, yield: 3.45 }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.year === 2024 ? '#3b82f6' : '#e5e7eb'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
