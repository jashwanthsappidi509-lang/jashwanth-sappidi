import React, { useState } from 'react';
import { Sprout, Search, MapPin, Calendar, Droplets, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import VoiceTranscriber from '../components/VoiceTranscriber';

interface RecommendationResult {
  crop: string;
  confidence: number;
  season: string;
  water: 'Low' | 'Medium' | 'High';
  description: string;
  soilPhMatch: boolean;
}

export default function Recommendation() {
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: '',
    soilType: 'Alluvial Soil',
    season: 'Rabi (Winter)',
    n: '',
    p: '',
    k: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert agricultural scientist. Based on the following soil and location data, recommend the best 3 crops to grow.
Location: ${formData.location}
Soil Type: ${formData.soilType}
Season: ${formData.season}
Nitrogen (N): ${formData.n} mg/kg
Phosphorus (P): ${formData.p} mg/kg
Potassium (K): ${formData.k} mg/kg

Provide a detailed reason for each recommendation. Return the results in JSON format.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                crop: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                season: { type: Type.STRING },
                water: { 
                  type: Type.STRING,
                  enum: ['Low', 'Medium', 'High']
                },
                description: { type: Type.STRING },
                soilPhMatch: { type: Type.BOOLEAN }
              },
              required: ['crop', 'confidence', 'season', 'water', 'description', 'soilPhMatch']
            }
          }
        }
      });

      const results = JSON.parse(response.text);
      setRecommendations(results);
      setShowResults(true);
    } catch (err) {
      console.error('Recommendation error:', err);
      setError('Failed to get recommendations. Please check your inputs and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Recommendation</h1>
          <p className="text-gray-500 mt-1">Intelligent soil analysis for optimal crop selection</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 font-bold">
          <Sprout size={16} />
          <span>Powered by Gemini Flash</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Soil & Location Details</h3>
          
          <div className="mb-6">
            <VoiceTranscriber 
              onTranscription={(text) => setFormData({ ...formData, location: text })}
              placeholder="Speak your location..."
            />
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin size={16} className="mr-2 text-green-600" />
                Location
              </label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your region"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Sprout size={16} className="mr-2 text-green-600" />
                Soil Type
              </label>
              <select 
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white"
              >
                <option>Alluvial Soil</option>
                <option>Black Soil</option>
                <option>Red Soil</option>
                <option>Laterite Soil</option>
                <option>Desert Soil</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar size={16} className="mr-2 text-green-600" />
                Season
              </label>
              <select 
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white"
              >
                <option>Kharif (Monsoon)</option>
                <option>Rabi (Winter)</option>
                <option>Zaid (Summer)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nitrogen (N)</label>
                <input 
                  type="number" 
                  value={formData.n}
                  onChange={(e) => setFormData({ ...formData, n: e.target.value })}
                  placeholder="mg/kg" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phosphorus (P)</label>
                <input 
                  type="number" 
                  value={formData.p}
                  onChange={(e) => setFormData({ ...formData, p: e.target.value })}
                  placeholder="mg/kg" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSearching}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/10 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing Soil...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Get Recommendations</span>
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
            {!showResults && !isSearching && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <Sprout size={40} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-500 max-w-sm">Enter your soil and location details to get personalized crop recommendations.</p>
              </motion.div>
            )}

            {isSearching && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-gray-100"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout size={48} className="text-green-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Data</h3>
                <p className="text-gray-500">Our AI is analyzing soil nutrients, historical weather patterns, and market trends...</p>
              </motion.div>
            )}

            {showResults && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Recommended Crops</h3>
                  <span className="text-sm text-green-600 font-bold uppercase tracking-widest">{recommendations.length} Matches Found</span>
                </div>

                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.crop}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shadow-sm">
                          <Sprout size={40} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900">{rec.crop}</h4>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                              <Calendar size={12} className="mr-1.5" /> {rec.season}
                            </span>
                            <span className="flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                              <Droplets size={12} className="mr-1.5" /> {rec.water} Water
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-green-600">{rec.confidence}%</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</div>
                      </div>
                    </div>
                    <p className="mt-8 text-gray-600 leading-relaxed border-t border-gray-50 pt-6 font-medium">
                      {rec.description}
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center text-sm text-green-700 font-bold">
                        <CheckCircle2 size={18} className="mr-2" />
                        {rec.soilPhMatch ? 'Optimal for your soil pH' : 'Requires soil adjustment'}
                      </div>
                      <button className="flex items-center text-sm font-bold text-gray-900 hover:text-green-600 transition-colors">
                        View Cultivation Guide <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-600 shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Expert Insight</h4>
                    <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                      These recommendations are generated using advanced AI models considering your specific soil parameters. For high-stakes decisions, we recommend a laboratory soil test.
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

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
