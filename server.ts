import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'agrovision_secret_key_2024';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const PORT = 3000;

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${APP_URL}/auth/google/callback`
);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- Google OAuth ---
  app.get('/api/auth/google/url', (req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ 
        error: 'Google Client ID not configured',
        message: 'Please set GOOGLE_CLIENT_ID in your environment variables.'
      });
    }
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent'
    });
    res.json({ url });
  });

  // Endpoint for verifying Google ID tokens directly (common for frontend libraries)
  app.post('/api/auth/google/verify', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID Token is required' });

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid token payload');

      const userInfo = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      };

      // Check if user exists
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userInfo.email) as any;

      if (!user) {
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const insert = db.prepare('INSERT INTO users (name, email, google_id, profile_picture, password) VALUES (?, ?, ?, ?, ?)');
        const result = insert.run(userInfo.name, userInfo.email, userInfo.sub, userInfo.picture, dummyPassword);
        user = { id: result.lastInsertRowid, name: userInfo.name, email: userInfo.email, profile_picture: userInfo.picture };
      } else if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?').run(userInfo.sub, userInfo.picture, user.id);
        user.google_id = userInfo.sub;
        user.profile_picture = userInfo.picture;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          profilePicture: user.profile_picture,
          location: user.location,
          farmSize: user.farm_size,
          soilType: user.soil_type,
          currentCrops: user.current_crops
        } 
      });
    } catch (error) {
      console.error('Google ID Token Verification Error:', error);
      res.status(401).json({ error: 'Invalid Google ID Token' });
    }
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await googleClient.getToken(code as string);
      googleClient.setCredentials(tokens);

      const userInfoRes = await googleClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });
      const userInfo: any = userInfoRes.data;

      // Check if user exists
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userInfo.email) as any;

      if (!user) {
        // Create new user
        // We provide a random password in case the column has a NOT NULL constraint from an older schema
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const insert = db.prepare('INSERT INTO users (name, email, google_id, profile_picture, password) VALUES (?, ?, ?, ?, ?)');
        const result = insert.run(userInfo.name, userInfo.email, userInfo.sub, userInfo.picture, dummyPassword);
        user = { id: result.lastInsertRowid, name: userInfo.name, email: userInfo.email, profile_picture: userInfo.picture };
      } else if (!user.google_id) {
        // Link google account if email matches
        db.prepare('UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?').run(userInfo.sub, userInfo.picture, user.id);
        user.google_id = userInfo.sub;
        user.profile_picture = userInfo.picture;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${token}',
                  user: ${JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profile_picture,
                    location: user.location,
                    farmSize: user.farm_size,
                    soilType: user.soil_type,
                    currentCrops: user.current_crops
                  })}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google Auth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // --- User Management ---
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, location, farmSize, soilType, currentCrops } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insert = db.prepare('INSERT INTO users (name, email, password, location, farm_size, soil_type, current_crops) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const result = insert.run(name, email, hashedPassword, location, farmSize, soilType, currentCrops);
      res.status(201).json({ id: result.lastInsertRowid, message: 'User registered successfully' });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        location: user.location, 
        farmSize: user.farm_size, 
        profilePicture: user.profile_picture,
        soilType: user.soil_type,
        currentCrops: user.current_crops
      } 
    });
  });

  app.get('/api/user/profile', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, location, farm_size, soil_type, current_crops, profile_picture, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.put('/api/user/profile', authenticateToken, (req: any, res) => {
    const { name, location, farmSize, soilType, currentCrops, profilePicture } = req.body;
    try {
      db.prepare('UPDATE users SET name = ?, location = ?, farm_size = ?, soil_type = ?, current_crops = ?, profile_picture = ? WHERE id = ?')
        .run(name, location, farmSize, soilType, currentCrops, profilePicture, req.user.id);
      
      const updatedUser = db.prepare('SELECT id, name, email, location, farm_size, soil_type, current_crops, profile_picture FROM users WHERE id = ?').get(req.user.id);
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });
      res.json(updatedUser);
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // --- Crop Recommendation System ---
  app.post('/api/recommendations', (req, res) => {
    const { soilType, location, season, n, p, k } = req.body;
    
    // Mock ML Logic: Rules-based recommendation
    let recommendations = [];
    if (season === 'Rabi (Winter)') {
      recommendations = [
        { crop: 'Wheat', confidence: 92, description: 'Ideal for current cool season and nitrogen levels.' },
        { crop: 'Barley', confidence: 85, description: 'Resilient to temperature fluctuations.' }
      ];
    } else if (season === 'Kharif (Monsoon)') {
      recommendations = [
        { crop: 'Rice', confidence: 94, description: 'High rainfall expected, perfect for rice cultivation.' },
        { crop: 'Maize', confidence: 88, description: 'Matches soil nutrients and humidity levels.' }
      ];
    } else {
      recommendations = [
        { crop: 'Moong Dal', confidence: 80, description: 'Short duration crop suitable for summer.' }
      ];
    }

    res.json(recommendations);
  });

  // --- Crop Yield Prediction ---
  app.post('/api/predictions/yield', authenticateToken, (req: any, res) => {
    const { cropType, rainfall, temperature, n, p, k } = req.body;
    
    // Mock ML Logic: Simple linear simulation
    const baseYield = 2.5;
    const predictedYield = baseYield + (rainfall / 1000) + (temperature / 100) + (n / 500);
    const finalYield = parseFloat(predictedYield.toFixed(2));

    // Store prediction
    const insert = db.prepare('INSERT INTO predictions (user_id, crop_type, predicted_yield, parameters) VALUES (?, ?, ?, ?)');
    insert.run(req.user.id, cropType, finalYield, JSON.stringify({ rainfall, temperature, n, p, k }));

    res.json({ 
      yield: finalYield, 
      unit: 'tons/hectare',
      confidence: 0.95,
      comparison: '+12% vs last year'
    });
  });

  app.get('/api/predictions/history', authenticateToken, (req: any, res) => {
    const history = db.prepare('SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(history);
  });

  // --- Weather Data Integration ---
  app.get('/api/weather', async (req, res) => {
    const { lat, lon, location } = req.query;
    
    // Default location if none provided
    const targetLocation = (location as string) || 'Punjab, India';
    
    // Generate slightly different mock data based on location to make it feel "real"
    const isSouth = targetLocation.toLowerCase().includes('karnataka') || targetLocation.toLowerCase().includes('tamil');
    const isNorth = targetLocation.toLowerCase().includes('punjab') || targetLocation.toLowerCase().includes('haryana');
    
    const baseTemp = isSouth ? 32 : (isNorth ? 26 : 28);
    const baseHumidity = isSouth ? 75 : 60;

    res.json({
      temp: baseTemp,
      humidity: baseHumidity,
      rainfall: 120,
      condition: isSouth ? 'Humid' : 'Partly Cloudy',
      location: targetLocation,
      forecast: [
        { day: 'Mon', temp: baseTemp - 1, condition: 'Sunny' },
        { day: 'Tue', temp: baseTemp + 1, condition: 'Cloudy' },
        { day: 'Wed', temp: baseTemp - 2, condition: 'Rain' },
        { day: 'Thu', temp: baseTemp, condition: 'Sunny' },
        { day: 'Fri', temp: baseTemp + 2, condition: 'Sunny' },
        { day: 'Sat', temp: baseTemp + 3, condition: 'Partly Cloudy' },
        { day: 'Sun', temp: baseTemp + 1, condition: 'Cloudy' },
      ]
    });
  });

  // --- Market Price Module ---
  app.get('/api/market/prices', (req, res) => {
    const { crop, state, category, sortBy, order } = req.query;
    let query = 'SELECT * FROM market_prices WHERE 1=1';
    const params: any[] = [];

    if (crop) {
      query += ' AND crop LIKE ?';
      params.push(`%${crop}%`);
    }
    if (state) {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Sorting
    const validSortFields = ['price', 'change', 'crop', 'updated_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'updated_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const prices = db.prepare(query).all(params);
    res.json(prices);
  });

  // --- Soil & Fertilizer Recommendation ---
  app.post('/api/recommendations/fertilizer', (req, res) => {
    const { n, p, k, soilType } = req.body;
    
    let recommendation = '';
    if (n < 50) recommendation = 'Urea (Nitrogen-rich)';
    else if (p < 30) recommendation = 'DAP (Phosphorus-rich)';
    else if (k < 30) recommendation = 'MOP (Potassium-rich)';
    else recommendation = 'NPK 19-19-19 (Balanced)';

    res.json({ 
      recommendedFertilizer: recommendation,
      dosage: '50kg per hectare',
      applicationMethod: 'Soil application during sowing'
    });
  });

  // --- API Catch-all ---
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled Error:', err);
    if (req.path.startsWith('/api')) {
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    } else {
      next(err);
    }
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgroVision Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
