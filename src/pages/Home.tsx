import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, CloudSun, ShoppingBag, ArrowRight, ScanLine, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('Crop Analysis'),
      description: t('Upload a photo of your crop'),
      icon: ScanLine,
      color: 'bg-purple-100 text-purple-700',
      path: '/analysis',
    },
    {
      title: t('Crop Recommendation'),
      description: t('Get AI-powered recommendations'),
      icon: Sprout,
      color: 'bg-green-100 text-green-700',
      path: '/recommendation',
    },
    {
      title: t('Yield Prediction'),
      description: t('Predict your harvest yield'),
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
      path: '/prediction',
    },
    {
      title: t('Weather Insights'),
      description: t('Stay ahead with real-time weather updates'),
      icon: CloudSun,
      color: 'bg-yellow-100 text-yellow-700',
      path: '/weather',
    },
    {
      title: t('Market Prices'),
      description: t('Track real-time market prices'),
      icon: ShoppingBag,
      color: 'bg-orange-100 text-orange-700',
      path: '/market',
    },
    {
      title: t('AI Crop Health & Weed Detection'),
      description: t('Detect plant diseases and weeds using AI'),
      icon: ScanLine,
      color: 'bg-emerald-100 text-emerald-700',
      path: '/health-detection',
    },
    {
      title: t('AI Assistant'),
      description: t('Ask anything about farming...'),
      icon: MessageSquare,
      color: 'bg-red-100 text-red-700',
      path: '/assistant',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop" 
          alt="Agriculture" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-6 md:px-12">
          <div className="max-w-2xl text-white space-y-4 md:space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-bold leading-tight"
            >
              {t('Empowering Farmers with')} <span className="text-green-400">{t('Smart Data')}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/80"
            >
              {t('AgroVision provides advanced analytics')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-green-900/20 group"
              >
                {t('Get Started')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">{t('Why Choose AgroVision?')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('Our platform combines traditional farming wisdom')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group h-full"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2D5A27] rounded-3xl p-12 text-center text-white space-y-8">
        <h2 className="text-4xl font-bold">{t('Ready to transform your farm?')}</h2>
        <p className="text-white/80 max-w-2xl mx-auto text-lg">
          {t('Join thousands of farmers')}
        </p>
        <Link 
          to="/profile" 
          className="inline-flex items-center px-8 py-4 bg-white text-[#2D5A27] hover:bg-gray-100 rounded-full font-semibold text-lg transition-all shadow-lg"
        >
          {t('Create Your Profile')}
        </Link>
      </section>
    </div>
  );
}
