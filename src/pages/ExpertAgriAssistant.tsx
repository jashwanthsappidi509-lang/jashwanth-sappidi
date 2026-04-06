import React, { useState, useRef } from 'react';
import { 
  Sprout, 
  Bug, 
  FlaskConical, 
  ShieldCheck, 
  Activity, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCropHealthExpert } from '../services/gemini';

interface AnalysisResult {
  cropName: string;
  problem: string;
  explanation: string;
  fertilizerRecommendation: {
    name: string;
    mixing: string;
    usage: string;
    frequency: string;
  };
  careTips: {
    watering: string;
    maintenance: string;
    prevention: string;
  };
  confidence: number;
}

export default function ExpertAgriAssistant() {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !description.trim()) {
      setError('Please provide an image or a description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64Image = selectedImage?.split(',')[1];
      const analysis = await analyzeCropHealthExpert(
        { image: base64Image, description },
        language.code
      );
      setResult(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Something went wrong during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setDescription('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl text-green-600 mb-2">
          <Sprout size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{t('Expert Agricultural AI Assistant')}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          {t('Upload a photo or describe your crop health issues to get expert analysis and treatment recommendations.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            {/* Image Upload */}
            <div 
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`relative aspect-square rounded-3xl border-4 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
                selectedImage 
                  ? 'border-green-500/50 bg-green-50/30' 
                  : 'border-gray-200 bg-gray-50 hover:border-green-500/50 hover:bg-green-50/30'
              }`}
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold flex items-center gap-2">
                      <Upload size={20} />
                      {t('Change Photo')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
                    <ImageIcon size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900">{t('Upload Photo')}</h3>
                  <p className="text-xs text-gray-500 mt-1">{t('Take a clear photo of the affected plant part')}</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageSquare size={16} className="text-green-600" />
                {t('Describe the Issue')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('Example: My tomato leaves are turning yellow with brown spots...')}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm min-h-[120px] resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} />
                {t(error)}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!selectedImage && !description.trim())}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t('Analyzing...')}
                  </>
                ) : (
                  <>
                    <Activity size={20} />
                    {t('Start Analysis')}
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
              >
                {t('Reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Confidence & Crop ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <Sprout size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Crop Name')}</p>
                      <p className="text-xl font-bold text-gray-900">{result.cropName}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Confidence Level')}</p>
                      <p className="text-xl font-bold text-gray-900">{result.confidence}%</p>
                    </div>
                  </div>
                </div>

                {/* Problem Detection */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <Bug size={24} />
                    <h2 className="text-xl font-bold">{t('Problem')}</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="font-bold text-red-900 text-lg">{result.problem}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">{t('What is happening:')}</p>
                      <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fertilizer Recommendation */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-green-600">
                    <FlaskConical size={24} />
                    <h2 className="text-xl font-bold">{t('Fertilizer Recommendation')}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">{t('Name')}</p>
                        <p className="text-lg font-bold text-green-900">{result.fertilizerRecommendation.name}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t('How much to mix')}</p>
                        <p className="text-sm text-blue-900">{result.fertilizerRecommendation.mixing}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                        <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">{t('How to use')}</p>
                        <p className="text-sm text-yellow-900">{result.fertilizerRecommendation.usage}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">{t('How often')}</p>
                        <p className="text-sm text-purple-900">{result.fertilizerRecommendation.frequency}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Care Tips */}
                <div className="bg-[#2D5A27] p-8 rounded-[40px] text-white space-y-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} />
                    <h2 className="text-xl font-bold">{t('Simple Care Tips')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-2">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('Watering')}</p>
                      <p className="text-sm text-white/90 leading-relaxed">{result.careTips.watering}</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-2">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('Maintenance')}</p>
                      <p className="text-sm text-white/90 leading-relaxed">{result.careTips.maintenance}</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm space-y-2">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('Prevention')}</p>
                      <p className="text-sm text-white/90 leading-relaxed">{result.careTips.prevention}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-green-600 font-bold hover:bg-green-50 px-6 py-3 rounded-2xl transition-all"
                  >
                    <FileText size={20} />
                    {t('Download Full Report')}
                  </button>
                </div>
              </motion.div>
            ) : isAnalyzing ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-green-600" size={64} />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-green-400 rounded-full blur-2xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('Analyzing Crop Health...')}</h3>
                <div className="space-y-2 max-w-sm">
                  <p className="text-gray-500 font-medium animate-pulse">{t('Identifying crop type and symptoms')}</p>
                  <p className="text-gray-400 text-sm">{t('Our AI is consulting global agricultural databases to provide the best treatment plan.')}</p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-gray-100 shadow-sm opacity-60">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                  <Activity size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('Ready for Analysis')}</h3>
                <p className="text-gray-500 max-w-sm">
                  {t('Provide a photo or description on the left to start the expert health analysis.')}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
