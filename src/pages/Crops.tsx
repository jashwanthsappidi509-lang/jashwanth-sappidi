import React, { useState } from 'react';
import { Search, Filter, Sprout, ThermometerSun, Droplets, MapPin, Info, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { recommendCrops } from '../services/gemini';
import { INDIAN_CROPS, Crop } from '../data/crops';

export default function Crops() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

  const categories = ['All', ...Array.from(new Set(INDIAN_CROPS.map(c => c.category)))];

  const handleGetRecommendations = async () => {
    setIsRecommending(true);
    try {
      const location = user?.location || 'Maharashtra';
      const soilType = user?.soilType || 'Black Soil';
      const season = 'Kharif'; // Could be dynamic based on current month
      const result = await recommendCrops(location, soilType, season, language);
      setRecommendations(result);
    } catch (error) {
      console.error('Recommendation failed:', error);
    } finally {
      setIsRecommending(false);
    }
  };

  const filteredCrops = INDIAN_CROPS.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sprout className="text-green-600" size={32} />
            {t('Crop Information')}
          </h1>
          <p className="text-gray-500 mt-1">{t('Explore major crops grown in India with detailed cultivation guides')}</p>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[40px] p-8 text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-100">
                <Sparkles size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('AI Powered')}</span>
              </div>
              <h2 className="text-2xl font-bold">{t('Get Personalized Crop Recommendations')}</h2>
              <p className="text-green-100/80 text-sm max-w-md">
                {t('Based on your location, soil type, and current season, we can suggest the most profitable crops for you.')}
              </p>
            </div>
            <button 
              onClick={handleGetRecommendations}
              disabled={isRecommending}
              className="bg-white text-green-700 px-8 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {isRecommending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {t('Get Recommendations')}
            </button>
          </div>

          <AnimatePresence>
            {recommendations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl"
                  >
                    <h4 className="text-lg font-bold mb-2">{rec.name}</h4>
                    <p className="text-xs text-green-100/70 mb-4 leading-relaxed">{rec.reason}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-green-100/50 uppercase tracking-widest">{t('Yield')}</p>
                        <p className="text-sm font-bold">{rec.expectedYield}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-green-100/50 uppercase tracking-widest">{t('Duration')}</p>
                        <p className="text-sm font-bold">{rec.duration}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={t('Search crops...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap shadow-sm border ${
                selectedCategory === cat 
                  ? 'bg-green-600 text-white border-green-600 shadow-green-900/10' 
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop, idx) => (
          <motion.div
            key={crop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedCrop(crop)}
            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="relative aspect-[4/3]">
              <img 
                src={crop.image} 
                alt={crop.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-900">
                {t(crop.category)}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t(crop.name)}</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={16} className="text-green-600" />
                  <span className="text-xs font-medium">{t(crop.season)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Droplets size={16} className="text-blue-500" />
                  <span className="text-xs font-medium">{t(crop.irrigation)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{t('View Details')}</span>
                <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Crop Detail Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCrop(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="relative h-64 shrink-0">
                <img 
                  src={selectedCrop.image} 
                  alt={selectedCrop.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {t(selectedCrop.category)}
                  </span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {t(selectedCrop.season)}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t(selectedCrop.name)}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Soil Type')}</p>
                      <p className="text-sm font-bold text-gray-900">{t(selectedCrop.soil)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                      <ThermometerSun size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Temperature')}</p>
                      <p className="text-sm font-bold text-gray-900">{t(selectedCrop.temperature)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={14} />
                      {t('Description')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{t(selectedCrop.description)}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Droplets size={14} />
                      {t('Irrigation Requirements')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{t(selectedCrop.irrigation)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
