import React, { useState, useRef } from 'react';
import { User, Mail, MapPin, Calendar, Tractor, ShieldCheck, Camera, LogOut, Sprout, Leaf, Droplets, Save, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    location: user?.location || '',
    farmSize: user?.farmSize || '',
    soilType: user?.soilType || '',
    currentCrops: user?.currentCrops || '',
    photoURL: user?.photoURL || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, photoURL: base64String }));
        // Automatically save if not in editing mode, or just update the preview
        if (!isEditing) {
          updateProfile({ ...formData, photoURL: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmer Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account and farm details</p>
        </div>
        <div className="flex items-center space-x-4">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors text-sm"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <CloseIcon size={20} />
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={18} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center h-fit"
        >
          <div className="relative inline-block mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            {formData.photoURL || user.photoURL ? (
              <img 
                src={formData.photoURL || user.photoURL || ''} 
                alt={user.displayName || ''} 
                className="w-32 h-32 rounded-[40px] object-cover border-4 border-white shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 bg-green-100 rounded-[40px] flex items-center justify-center text-green-600 text-4xl font-bold border-4 border-white shadow-xl">
                {user.displayName?.[0] || 'F'}
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-white rounded-2xl shadow-lg border border-gray-100 text-gray-500 hover:text-green-600 transition-colors"
            >
              <Camera size={18} />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Verified Farmer</p>
          
          <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-medium">Member Since</span>
              <span className="text-gray-900 font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-medium">Status</span>
              <span className="flex items-center text-green-600 font-bold">
                <ShieldCheck size={14} className="mr-1" />
                Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Farm Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <User size={14} className="mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  />
                ) : (
                  <p className="text-gray-900 font-bold text-lg">{user.displayName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Mail size={14} className="mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900 font-bold text-lg">{user.email}</p>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <MapPin size={14} className="mr-2" />
                  Farm Location
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    placeholder="e.g. Punjab, India"
                  />
                ) : (
                  <p className="text-gray-900 font-bold text-lg">{user.location || 'Not specified'}</p>
                )}
              </div>

              {/* Farm Size */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Tractor size={14} className="mr-2" />
                  Farm Size
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    placeholder="e.g. 5 Hectares"
                  />
                ) : (
                  <p className="text-gray-900 font-bold text-lg">{user.farmSize || 'Not specified'}</p>
                )}
              </div>

              {/* Soil Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Droplets size={14} className="mr-2" />
                  Soil Type
                </label>
                {isEditing ? (
                  <select 
                    value={formData.soilType}
                    onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  >
                    <option value="">Select Soil Type</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Laterite">Laterite</option>
                    <option value="Desert">Desert</option>
                    <option value="Mountain">Mountain</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-bold text-lg">{user.soilType || 'Not specified'}</p>
                )}
              </div>

              {/* Current Crops */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Leaf size={14} className="mr-2" />
                  Current Crops
                </label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.currentCrops}
                    onChange={(e) => setFormData({...formData, currentCrops: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    placeholder="e.g. Wheat, Rice"
                  />
                ) : (
                  <p className="text-gray-900 font-bold text-lg">{user.currentCrops || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-green-600 p-8 rounded-[32px] shadow-xl shadow-green-900/10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">AgroVision Premium</h3>
              <p className="text-green-100 text-sm max-w-md">Get advanced satellite insights and pest detection alerts directly on your phone.</p>
              <button className="mt-6 px-6 py-3 bg-white text-green-600 rounded-2xl font-bold hover:bg-green-50 transition-colors">
                Upgrade Now
              </button>
            </div>
            <Sprout size={120} className="absolute -bottom-8 -right-8 text-green-500/20 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
