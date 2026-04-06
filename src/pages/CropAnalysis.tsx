import React, { useState, useRef } from 'react';
import { 
  ScanLine, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Sprout, 
  Bug, 
  Droplets, 
  ThermometerSun,
  ArrowRight,
  Activity,
  ShieldAlert,
  Leaf,
  Info,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCropHealth } from '../services/gemini';
import VoiceTranscriber from '../components/VoiceTranscriber';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface FertilizerRecommendation {
  recommendedFertilizer: string;
  dosage: string;
  applicationMethod: string;
}

interface AnalysisResult {
  plantName: string;
  healthStatus: 'Healthy' | 'Unhealthy';
  disease: string | null;
  symptoms: string[];
  cause: string | null;
  treatment: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
}

export default function CropAnalysis() {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fertilizerRecommendation, setFertilizerRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [farmSize, setFarmSize] = useState<number>(1);
  const [voiceNotes, setVoiceNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const result = await analyzeCropHealth(base64Data, voiceNotes, language);
      
      setAnalysis(result);

      // Fetch fertilizer recommendations if unhealthy and cause mentions nutrients
      if (result.healthStatus === 'Unhealthy' && (result.cause?.toLowerCase().includes('nutrient') || result.disease?.toLowerCase().includes('deficiency'))) {
        try {
          const mockNPK = {
            n: result.cause?.toLowerCase().includes('nitrogen') ? 30 : 60,
            p: result.cause?.toLowerCase().includes('phosphorus') ? 20 : 40,
            k: result.cause?.toLowerCase().includes('potassium') ? 20 : 40,
            soilType: 'Loamy'
          };
          const fertResult = await api.getFertilizer(mockNPK);
          setFertilizerRecommendation(fertResult);
        } catch (fertErr) {
          console.error('Fertilizer recommendation error:', fertErr);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t('Failed to analyze image. Please try again with a clearer photo.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setFertilizerRecommendation(null);
    setFarmSize(1);
    setVoiceNotes('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateTotalFertilizer = () => {
    if (!fertilizerRecommendation) return { amount: 0, unit: 'kg', perUnit: 'hectare' };
    const match = fertilizerRecommendation.dosage.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*(?:\/|per)\s*([a-zA-Z]+)/i);
    if (match) {
      return {
        amount: (parseFloat(match[1]) * farmSize).toFixed(1),
        unit: match[2],
        perUnit: match[3]
      };
    }
    // Fallback if regex fails
    const numMatch = fertilizerRecommendation.dosage.match(/(\d+(?:\.\d+)?)/);
    return {
      amount: numMatch ? (parseFloat(numMatch[1]) * farmSize).toFixed(1) : 0,
      unit: 'kg',
      perUnit: 'unit'
    };
  };

  const calculation = calculateTotalFertilizer();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ScanLine className="text-green-600" size={32} />
            {t('Crop Analysis')}
          </h1>
          <p className="text-gray-500 mt-1">{t('Upload a photo of your crop for instant AI-powered health diagnosis')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`relative aspect-square rounded-[40px] border-4 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
              selectedImage 
                ? 'border-green-500/50 bg-green-50/30' 
                : 'border-gray-200 bg-white hover:border-green-500/50 hover:bg-green-50/30'
            }`}
          >
            {selectedImage ? (
              <>
                <img 
                  src={selectedImage} 
                  alt="Selected crop" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold flex items-center gap-2">
                    <Upload size={20} />
                    {t('Change Photo')}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:scale-110 transition-transform">
                  <ImageIcon size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Upload Crop Photo')}</h3>
                <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
                  {t('Take a clear photo of the leaves or affected area for best results')}
                </p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('Describe Symptoms (Voice)')}</h4>
            <VoiceTranscriber 
              onTranscription={(text) => setVoiceNotes(prev => prev ? `${prev} ${text}` : text)}
              placeholder={t('Describe what you see...')}
            />
            {voiceNotes && (
              <div className="p-4 bg-white rounded-2xl border border-gray-100 text-sm text-gray-600 italic">
                "{voiceNotes}"
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                !selectedImage || isAnalyzing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-green-900/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('Analyzing...')}
                </>
              ) : (
                <>
                  <ScanLine size={20} />
                  {t('Analyze Crop')}
                </>
              )}
            </button>
            {selectedImage && !isAnalyzing && (
              <button
                onClick={reset}
                className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                {t('Reset')}
              </button>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={24} />
                {t('Analysis Results')}
              </h2>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest">
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 bg-green-600 rounded-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-green-600 rounded-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-green-600 rounded-full"
                    />
                  </div>
                  {t('Processing')}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence mode="wait">
                {analysis ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {/* Summary Header */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <Leaf size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t('Plant')}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{analysis.plantName}</p>
                      </div>
                      <div className={`p-6 rounded-3xl border ${
                        analysis.healthStatus === 'Healthy' ? 'bg-green-50 border-green-100 text-green-700' :
                        'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                          <Activity size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t('Status')}</span>
                        </div>
                        <p className="text-lg font-bold">{t(analysis.healthStatus)}</p>
                      </div>
                    </div>

                    {/* Disease & Cause */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Diagnosis')}</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">{t('Disease/Pest:')}</p>
                            <p className="text-sm text-gray-600">{analysis.disease || t('None detected')}</p>
                          </div>
                          {analysis.cause && (
                            <div>
                              <p className="text-sm font-bold text-gray-900 mb-1">{t('Possible Cause:')}</p>
                              <p className="text-sm text-gray-600">{analysis.cause}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('Visible Symptoms')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.symptoms.map((symptom, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Treatment */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('Recommended Treatment')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sprout size={14} />
                            {t('Organic Solutions')}
                          </h4>
                          <ul className="space-y-2">
                            {analysis.treatment.organic.map((item, idx) => (
                              <li key={idx} className="text-sm text-emerald-800 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl">
                          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldAlert size={14} />
                            {t('Chemical Solutions')}
                          </h4>
                          <ul className="space-y-2">
                            {analysis.treatment.chemical.map((item, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Prevention */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('Preventive Measures')}</h3>
                      <div className="space-y-2">
                        {analysis.prevention.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-green-600 shadow-sm shrink-0 mt-0.5">
                              <CheckCircle2 size={14} />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fertilizer Recommendation Section */}
                    <AnimatePresence>
                      {fertilizerRecommendation && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <ShoppingBag size={24} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{t('Fertilizer Recommendation')}</h3>
                                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">{t('Based on identified nutrient deficiency')}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-1">
                                <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest">{t('Recommended Type')}</p>
                                <p className="text-lg font-bold">{t(fertilizerRecommendation.recommendedFertilizer)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest">{t('Dosage')}</p>
                                <p className="text-lg font-bold">{t(fertilizerRecommendation.dosage)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest">{t('Application Method')}</p>
                                <p className="text-lg font-bold">{t(fertilizerRecommendation.applicationMethod)}</p>
                              </div>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-emerald-100 text-sm bg-white/10 p-4 rounded-2xl border border-white/10">
                              <Info size={18} className="shrink-0" />
                              <p>{t('Always follow local agricultural guidelines and conduct a professional soil test for precise application.')}</p>
                            </div>

                            {/* Calculator Section */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-4 w-full md:w-auto">
                                  <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-100/80">{t('Requirement Calculator')}</h4>
                                  <div className="flex items-center gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest">{t('Farm Size')}</p>
                                      <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/10">
                                        <input 
                                          type="number" 
                                          value={farmSize}
                                          onChange={(e) => setFarmSize(Math.max(0.1, parseFloat(e.target.value) || 0))}
                                          className="w-20 bg-transparent border-none focus:ring-0 text-lg font-bold text-white px-3"
                                          step="0.1"
                                        />
                                        <span className="pr-3 text-sm font-bold text-emerald-100 uppercase">{t(calculation.perUnit)}s</span>
                                      </div>
                                    </div>
                                    <ArrowRight className="text-emerald-100/40 mt-4" size={20} />
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest">{t('Total Needed')}</p>
                                      <p className="text-2xl font-black text-white">{calculation.amount} <span className="text-sm font-bold text-emerald-200">{t(calculation.unit)}</span></p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 w-full md:w-auto">
                                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Activity size={20} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest">{t('Precision Estimate')}</p>
                                    <p className="text-sm font-bold">{t('Adjust size for exact dosage')}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : !isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <ScanLine size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Ready to Analyze')}</h3>
                    <p className="text-gray-500 font-medium max-w-[280px]">{t('Upload a photo of your crop to see AI-powered health insights here')}</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-green-600" size={48} />
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Analyzing Crop...')}</h3>
                    <p className="text-gray-500 font-medium animate-pulse">{t('Consulting our agricultural database')}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <ThermometerSun size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{t('Lighting Matters')}</h4>
            <p className="text-gray-500 text-xs mt-1">{t('Take photos in natural daylight for the most accurate color detection.')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
            <ScanLine size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{t('Focus on Issues')}</h4>
            <p className="text-gray-500 text-xs mt-1">{t('Get close to spots, wilting, or pests to help the AI identify specific problems.')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
            <Droplets size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{t('Clean Leaves')}</h4>
            <p className="text-gray-500 text-xs mt-1">{t('Wipe off heavy dust or mud from the leaves before taking the photo.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
