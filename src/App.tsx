import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Recommendation from './pages/Recommendation';
import Prediction from './pages/Prediction';
import Market from './pages/Market';
import Weather from './pages/Weather';
import CropAnalysis from './pages/CropAnalysis';
import CropHealthWeedDetection from './pages/CropHealthWeedDetection';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <ProtectedRoute>
                  <CropAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendation" 
              element={
                <ProtectedRoute>
                  <Recommendation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/prediction" 
              element={
                <ProtectedRoute>
                  <Prediction />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/market" 
              element={
                <ProtectedRoute>
                  <Market />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/weather" 
              element={
                <ProtectedRoute>
                  <Weather />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-detection" 
              element={
                <ProtectedRoute>
                  <CropHealthWeedDetection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assistant" 
              element={
                <ProtectedRoute>
                  <Assistant />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  </AuthProvider>
  );
}
