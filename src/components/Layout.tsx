import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  TrendingUp, 
  CloudSun, 
  User, 
  Menu, 
  X, 
  Home,
  ShoppingBag,
  LogOut,
  ChevronRight,
  MessageSquare,
  ScanLine,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, INDIAN_LANGUAGES } from '../context/LanguageContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('Home'), path: '/', icon: Home },
    { name: t('Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('Crop Information'), path: '/crops', icon: Sprout },
    { name: t('Crop Analysis'), path: '/analysis', icon: ScanLine },
    { name: t('Crop Recommendation'), path: '/recommendation', icon: Sprout },
    { name: t('Fertilizer Suggestion'), path: '/fertilizer', icon: FlaskConical },
    { name: t('Yield Prediction'), path: '/prediction', icon: TrendingUp },
    { name: t('Market Prices'), path: '/market', icon: ShoppingBag },
    { name: t('Weather Insights'), path: '/weather', icon: CloudSun },
    { name: t('Expert AI Assistant'), path: '/expert-assistant', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="p-6 flex items-center justify-between">
        {(isSidebarOpen || mobile) ? (
          <Link to="/" className="flex items-center space-x-2" onClick={() => mobile && setIsMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
              <Sprout className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">AgroVision</span>
          </Link>
        ) : (
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mx-auto">
            <Sprout className="text-white" size={24} />
          </div>
        )}
        {mobile && (
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-2xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-green-50 text-green-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={22} className={(isSidebarOpen || mobile) ? 'mr-3' : 'mx-auto'} />
              {(isSidebarOpen || mobile) && <span className="font-semibold">{item.name}</span>}
              {(!isSidebarOpen && !mobile) && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        {user ? (
          <div className={`flex items-center ${(isSidebarOpen || mobile) ? 'p-3' : 'justify-center'} rounded-2xl bg-gray-50/50`}>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold border-2 border-white shadow-sm">
                {user.displayName?.[0] || 'F'}
              </div>
            )}
            {(isSidebarOpen || mobile) && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{t('Farmer')}</p>
              </div>
            )}
            {(isSidebarOpen || mobile) && (
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={`flex items-center ${(isSidebarOpen || mobile) ? 'p-3' : 'justify-center'} rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-900/10`}
          >
            <User size={20} className={(isSidebarOpen || mobile) ? 'mr-3' : ''} />
            {(isSidebarOpen || mobile) && <span className="font-bold">{t('Sign In')}</span>}
          </Link>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-gray-900">AgroVision</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex bg-white border-r border-gray-100 flex-col h-screen sticky top-0 z-50"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
                <span className="text-xs font-bold text-gray-600">{language.nativeName}</span>
                <ChevronRight size={14} className="rotate-90 text-gray-400" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-1">
                  {INDIAN_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${
                        language.code === lang.code 
                          ? 'bg-green-50 text-green-600 font-bold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{lang.name}</span>
                        <span className="text-[10px] opacity-60">{lang.nativeName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-1 text-sm font-bold text-gray-400">
              <Link to="/" className="hover:text-gray-900 transition-colors">AgroVision</Link>
              <ChevronRight size={14} />
              <span className="text-gray-900 capitalize">{location.pathname.split('/')[1] || 'Home'}</span>
            </div>
            {user && (
              <Link to="/profile" className="flex items-center space-x-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">{user.displayName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Farmer')}</p>
                </div>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || ''} 
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                    {user.displayName?.[0] || 'F'}
                  </div>
                )}
              </Link>
            )}
          </div>
        </header>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
