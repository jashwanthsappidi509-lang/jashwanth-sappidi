import React, { useState } from 'react';
import { FlaskConical, Search, Sprout, Droplets, Info, AlertCircle, CheckCircle2, ChevronRight, Thermometer, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface FertilizerResult {
  fertilizer: string;
  dosage: string;
  applicationMethod: string;
  frequency: string;
  reason: string;
  nutrients: { n: number; p: number; k: number };
}

export default function FertilizerRecommendation() {
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<FertilizerResult | null>(null);

  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    soilPh: '6.5',
    n: '',
    p: '',
    k: '',
    moisture: '40',
    temperature: '25'
  });

  const bighaatSuggestions = [
    "IFFCO Urea",
    "Coromandel Gromor 14-35-14",
    "MCFP NPK 19-19-19",
    "YaraMila Complex",
    "Zuari Jai Kisaan DAP"
  ];

  const getLocalRecommendation = (data: typeof formData): FertilizerResult => {
    const n = parseInt(data.n) || 0;
    const p = parseInt(data.p) || 0;
    const k = parseInt(data.k) || 0;
    const ph = parseFloat(data.soilPh) || 7.0;
    const crop = data.cropType;

    let fertilizer = "NPK 19-19-19";
    let reason = "Your soil has a balanced nutrient profile. A general-purpose NPK fertilizer will maintain health.";
    let dosage = "5 kg per acre";
    let method = "Soil Application / Fertigation";
    let frequency = "Once every 15 days";
    let n_val = 19, p_val = 19, k_val = 19;

    // Decision Tree Logic
    if (ph < 5.5) {
      fertilizer = "Lime (Calcium Carbonate)";
      reason = "Soil is too acidic (Low pH). Lime helps neutralize acidity and improves nutrient uptake.";
      dosage = "500 kg per acre";
      method = "Broadcast on soil before planting";
      frequency = "Once per season";
      n_val = 0; p_val = 0; k_val = 0;
    } else if (ph > 8.0) {
      fertilizer = "Gypsum";
      reason = "Soil is too alkaline (High pH). Gypsum helps reduce alkalinity and improves soil structure.";
      dosage = "200 kg per acre";
      method = "Mix with topsoil";
      frequency = "Once per season";
      n_val = 0; p_val = 0; k_val = 0;
    } else if (n < 40) {
      fertilizer = "Urea";
      reason = "Nitrogen levels are low. Urea provides high nitrogen for rapid vegetative growth.";
      dosage = "50 kg per acre";
      method = "Top dressing (Broadcast)";
      frequency = "2-3 split doses during growth";
      n_val = 46; p_val = 0; k_val = 0;
    } else if (p < 20) {
      fertilizer = "DAP (Diammonium Phosphate)";
      reason = "Phosphorus levels are low. DAP is essential for root development and early growth.";
      dosage = "40 kg per acre";
      method = "Basal application (at sowing)";
      frequency = "Once at the time of planting";
      n_val = 18; p_val = 46; k_val = 0;
    } else if (k < 30) {
      fertilizer = "MOP (Muriate of Potash)";
      reason = "Potassium levels are low. Potash improves disease resistance and grain quality.";
      dosage = "30 kg per acre";
      method = "Soil application";
      frequency = "Split into two doses";
      n_val = 0; p_val = 0; k_val = 60;
    }

    // Crop Specific Adjustments
    if (crop === 'Rice' && n < 60) {
      fertilizer = "Ammonium Sulfate";
      reason = "Rice requires high nitrogen and sulfur. This fertilizer is ideal for flooded conditions.";
      n_val = 21; p_val = 0; k_val = 0;
    }

    return {
      fertilizer,
      dosage,
      applicationMethod: method,
      frequency,
      reason,
      nutrients: { n: n_val, p: p_val, k: k_val }
    };
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    
    // Simulate network delay for "ML processing" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Use local logic for offline capability as requested
      const result = getLocalRecommendation(formData);
      setRecommendation(result);
      setShowResults(true);
    } catch (err) {
      console.error('Fertilizer error:', err);
      setError('Failed to get fertilizer recommendation. Please check your inputs.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fertilizer Suggestion</h1>
          <p className="text-gray-500 mt-1">Data-driven nutrient management for your crops</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-100 font-bold">
          <FlaskConical size={16} />
          <span>Decision Tree Model</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t('Soil Nutrient Profile')}</h3>
          
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Sprout size={16} className="mr-2 text-purple-600" />
                {t('Target Crop')}
              </label>
              <select 
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white"
              >
                <option>Wheat</option>
                <option>Rice</option>
                <option>Maize</option>
                <option>Cotton</option>
                <option>Soybean</option>
                <option>Sugarcane</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Droplets size={16} className="mr-2 text-purple-600" />
                  {t('Soil pH')}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.soilPh}
                  onChange={(e) => setFormData({ ...formData, soilPh: e.target.value })}
                  placeholder="e.g., 6.5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Waves size={16} className="mr-2 text-purple-600" />
                  {t('Moisture')} (%)
                </label>
                <input 
                  type="number" 
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  placeholder="40"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Thermometer size={16} className="mr-2 text-purple-600" />
                {t('Temperature')} (°C)
              </label>
              <input 
                type="number" 
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="25"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nitrogen (N)</label>
                <input 
                  type="number" 
                  value={formData.n}
                  onChange={(e) => setFormData({ ...formData, n: e.target.value })}
                  placeholder="mg/kg" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phosphorus (P)</label>
                <input 
                  type="number" 
                  value={formData.p}
                  onChange={(e) => setFormData({ ...formData, p: e.target.value })}
                  placeholder="mg/kg" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Potassium (K)</label>
                <input 
                  type="number" 
                  value={formData.k}
                  onChange={(e) => setFormData({ ...formData, k: e.target.value })}
                  placeholder="mg/kg" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/10 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('Analyzing Nutrients...')}</span>
                </>
              ) : (
                <>
                  <FlaskConical size={20} />
                  <span>{t('Get Fertilizer Suggestion')}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!showResults && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300"
              >
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                  <FlaskConical size={40} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Nutrient Analysis Ready')}</h3>
                <p className="text-gray-500 max-w-sm">{t('Enter your soil NPK values to receive a customized fertilizer application schedule.')}</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-gray-100"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FlaskConical size={48} className="text-purple-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('Calculating Requirements')}</h3>
                <p className="text-gray-500">{t('Our Decision Tree model is mapping soil deficiencies to optimal fertilizer combinations...')}</p>
              </motion.div>
            )}

            {showResults && recommendation && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Recommendation */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <FlaskConical size={32} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{recommendation.fertilizer}</h4>
                        <p className="text-purple-600 font-bold text-sm uppercase tracking-wider">{t('Recommended Fertilizer')}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center">
                      <CheckCircle2 size={16} className="mr-2" />
                      {t('Optimal Match')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Dosage')}</p>
                      <p className="text-lg font-bold text-gray-900">{recommendation.dosage}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Method')}</p>
                      <p className="text-lg font-bold text-gray-900">{recommendation.applicationMethod}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Frequency')}</p>
                      <p className="text-lg font-bold text-gray-900">{recommendation.frequency}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-6">
                    <h5 className="font-bold text-gray-900 mb-2">{t('Reason')}</h5>
                    <p className="text-gray-600 leading-relaxed">{recommendation.reason}</p>
                  </div>
                </div>

                {/* BigHaat Style Suggestions */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{t('Common Market Products')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bighaatSuggestions.map((product) => (
                      <div key={product} className="flex items-center p-4 bg-purple-50 rounded-2xl border border-purple-100 group hover:bg-purple-100 transition-colors">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 text-purple-600">
                          <Sprout size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{product}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrient Balance */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{t('Required Nutrient Balance')}</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gray-700">Nitrogen (N)</span>
                        <span className="text-purple-600">{recommendation.nutrients.n}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${recommendation.nutrients.n}%` }}
                          className="h-full bg-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gray-700">Phosphorus (P)</span>
                        <span className="text-blue-600">{recommendation.nutrients.p}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${recommendation.nutrients.p}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gray-700">Potassium (K)</span>
                        <span className="text-green-600">{recommendation.nutrients.k}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${recommendation.nutrients.k}%` }}
                          className="h-full bg-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-600 shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">{t('Application Tip')}</h4>
                    <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                      {t('Always apply fertilizers when the soil is moist. Avoid application during peak sun hours to prevent nutrient evaporation and leaf burn.')}
                    </p>
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
