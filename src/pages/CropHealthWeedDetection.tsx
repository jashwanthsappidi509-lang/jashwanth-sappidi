import React, { useState, useRef } from 'react';
import { 
  ScanLine, 
  Bug, 
  Sprout, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Download, 
  Loader2, 
  Upload, 
  Image as ImageIcon,
  Activity,
  Info,
  ArrowRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";

interface DiseaseAnalysis {
  diseaseName: string;
  severity: 'Low' | 'Moderate' | 'High';
  recommendation: string;
  confidence: number;
}

interface WeedDetection {
  totalWeeds: number;
  suggestedAction: string;
  weeds: {
    label: string;
    box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  }[];
}

export default function CropHealthWeedDetection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'disease' | 'weed'>('disease');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiseaseAnalysis | null>(null);
  const [weedResult, setWeedResult] = useState<WeedDetection | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(10);
      reader.onprogress = (data) => {
        if (data.lengthComputable) {
          setUploadProgress(Math.round((data.loaded / data.total) * 100));
        }
      };
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setWeedResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const base64Data = selectedImage.split(',')[1];

      if (activeTab === 'disease') {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                  },
                },
                {
                  text: `Analyze this plant leaf image for diseases. 
                  Possible classes: Leaf Spot, Powdery Mildew, Leaf Mold, Spider Mites, Bean Rust.
                  Return JSON with:
                  - diseaseName: string
                  - severity: "Low" | "Moderate" | "High"
                  - recommendation: string
                  - confidence: number (0-1)
                  `,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diseaseName: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                recommendation: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['diseaseName', 'severity', 'recommendation', 'confidence']
            }
          }
        });

        const result = JSON.parse(response.text);
        setAnalysisResult(result);
      } else {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                  },
                },
                {
                  text: `Detect weeds in this crop field image. 
                  Return JSON with:
                  - totalWeeds: number
                  - suggestedAction: "Manual removal" | "Use targeted herbicide"
                  - weeds: array of objects with { label: string, box_2d: [ymin, xmin, ymax, xmax] }
                  `,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                totalWeeds: { type: Type.NUMBER },
                suggestedAction: { type: Type.STRING },
                weeds: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      box_2d: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER }
                      }
                    },
                    required: ['label', 'box_2d']
                  }
                }
              },
              required: ['totalWeeds', 'suggestedAction', 'weeds']
            }
          }
        });

        const result = JSON.parse(response.text);
        setWeedResult(result);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setWeedResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadReport = () => {
    const reportContent = `
      AgroVision AI Analysis Report
      ----------------------------
      Date: ${new Date().toLocaleDateString()}
      Type: ${activeTab === 'disease' ? 'Plant Disease Detection' : 'Weed Detection'}
      
      ${activeTab === 'disease' && analysisResult ? `
      Disease Detected: ${analysisResult.diseaseName}
      Severity Level: ${analysisResult.severity}
      Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%
      Recommendation: ${analysisResult.recommendation}
      ` : ''}
      
      ${activeTab === 'weed' && weedResult ? `
      Total Weeds Detected: ${weedResult.totalWeeds}
      Suggested Action: ${weedResult.suggestedAction}
      ` : ''}
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrovision_report_${activeTab}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ScanLine className="text-green-600" size={32} />
            {t('AI Crop Health & Weed Detection')}
          </h1>
          <p className="text-gray-500 mt-1">{t('Detect plant diseases and weeds using AI')}</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => { setActiveTab('disease'); reset(); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'disease' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('Plant Disease Detection')}
          </button>
          <button
            onClick={() => { setActiveTab('weed'); reset(); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'weed' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('Weed Detection')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-7 space-y-6">
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`relative aspect-video rounded-[40px] border-4 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
              selectedImage 
                ? 'border-green-500/50 bg-green-50/30' 
                : 'border-gray-200 bg-white hover:border-green-500/50 hover:bg-green-50/30'
            }`}
          >
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={selectedImage} 
                  alt="Upload" 
                  className="w-full h-full object-cover"
                />
                {/* Bounding Boxes for Weeds */}
                {activeTab === 'weed' && weedResult && (
                  <div className="absolute inset-0 pointer-events-none">
                    {weedResult.weeds.map((weed, idx) => (
                      <div 
                        key={idx}
                        className="absolute border-2 border-red-500 bg-red-500/20 rounded-sm"
                        style={{
                          top: `${weed.box_2d[0] / 10}%`,
                          left: `${weed.box_2d[1] / 10}%`,
                          height: `${(weed.box_2d[2] - weed.box_2d[0]) / 10}%`,
                          width: `${(weed.box_2d[3] - weed.box_2d[1]) / 10}%`,
                        }}
                      >
                        <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 rounded">
                          {weed.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold flex items-center gap-2">
                    <Upload size={20} />
                    {t('Change Photo')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:scale-110 transition-transform">
                  <ImageIcon size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === 'disease' ? t('Upload a leaf photo') : t('Upload a field photo')}
                </h3>
                <p className="text-gray-500 font-medium max-w-[280px] mx-auto">
                  {t('Take a clear photo of the leaves or affected area for best results')}
                </p>
              </div>
            )}
            
            {uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-green-500"
                />
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

          <div className="flex gap-4">
            <button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('Analyzing...')}
                </>
              ) : (
                <>
                  <Search size={20} />
                  {t('Analyze Crop')}
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

        {/* Results Section */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-green-600" size={24} />
                {t('Analysis Results')}
              </h2>
              { (analysisResult || weedResult) && (
                <button 
                  onClick={downloadReport}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-green-600 transition-colors"
                >
                  <Download size={20} />
                </button>
              )}
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {analysisResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <Bug size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{t('Disease Detected')}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-green-600 border border-green-100">
                          <CheckCircle2 size={12} />
                          {(analysisResult.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{analysisResult.diseaseName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Severity Level')}</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            analysisResult.severity === 'Low' ? 'bg-green-500' :
                            analysisResult.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <p className="font-bold text-gray-700">{t(analysisResult.severity)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Confidence Score')}</p>
                        <p className="font-bold text-gray-700">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <ShieldAlert size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('Treatment Recommendation')}</span>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {analysisResult.recommendation}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                      <Info size={18} className="text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-800 leading-relaxed">
                        {t('Short advisory text for farmers')}
                      </p>
                    </div>
                  </motion.div>
                ) : weedResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('Total weeds detected')}</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{weedResult.totalWeeds}</p>
                    </div>

                    <div className="p-6 bg-green-50 rounded-3xl border border-green-100 space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <Sprout size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('Suggested action')}</span>
                      </div>
                      <p className="text-lg font-bold text-green-800">
                        {t(weedResult.suggestedAction)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Detected Weeds')}</p>
                      <div className="flex flex-wrap gap-2">
                        {weedResult.weeds.map((weed, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                            {weed.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : !isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <ScanLine size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Ready to Analyze')}</h3>
                    <p className="text-gray-500 font-medium max-w-[280px]">
                      {activeTab === 'disease' 
                        ? t('Upload a leaf photo to detect possible diseases') 
                        : t('Upload a field photo to identify weeds')}
                    </p>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Analyzing...')}</h3>
                    <p className="text-gray-500 font-medium animate-pulse">{t('Consulting our agricultural database')}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#2D5A27] p-8 rounded-[40px] text-white space-y-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Info size={24} />
          </div>
          <h3 className="text-xl font-bold">{t('Expert Advisory')}</h3>
          <p className="text-white/80 leading-relaxed">
            {t('Early detection of diseases and weeds can save up to 40% of your crop yield. Our AI models are trained on thousands of agricultural images to provide accurate results.')}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <FileText size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('Download Report')}</h3>
          <p className="text-gray-500 leading-relaxed">
            {t('Generate a detailed PDF or text report of your analysis to share with agricultural experts or keep for your records.')}
          </p>
          <button 
            disabled={!analysisResult && !weedResult}
            onClick={downloadReport}
            className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all disabled:opacity-50"
          >
            {t('Download Now')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
