import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve('agrovision.db');

export function initDB() {
  const db = new Database(dbPath);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      google_id TEXT UNIQUE,
      profile_picture TEXT,
      location TEXT,
      farm_size TEXT,
      soil_type TEXT,
      current_crops TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add missing columns if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const columns = tableInfo.map(col => col.name);
  
  if (!columns.includes('google_id')) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE');
  }
  if (!columns.includes('profile_picture')) {
    db.exec('ALTER TABLE users ADD COLUMN profile_picture TEXT');
  }
  if (!columns.includes('password')) {
    // This shouldn't happen based on previous schema, but just in case
    db.exec('ALTER TABLE users ADD COLUMN password TEXT');
  }
  if (!columns.includes('soil_type')) {
    db.exec('ALTER TABLE users ADD COLUMN soil_type TEXT');
  }
  if (!columns.includes('current_crops')) {
    db.exec('ALTER TABLE users ADD COLUMN current_crops TEXT');
  }
  
  // Ensure password can be null (for google users)
  // SQLite doesn't support ALTER TABLE DROP NOT NULL easily, 
  // but we can try to make it nullable if it's not already.
  // Actually, better-sqlite3 doesn't support complex migrations well without temp tables.
  // For now, we'll assume the columns are added correctly.

  // Predictions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      crop_type TEXT,
      predicted_yield REAL,
      parameters TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Market Prices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop TEXT NOT NULL,
      category TEXT NOT NULL,
      state TEXT NOT NULL,
      price REAL NOT NULL,
      change REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add category column if it doesn't exist
  const marketTableInfo = db.prepare("PRAGMA table_info(market_prices)").all() as any[];
  const marketColumns = marketTableInfo.map(col => col.name);
  if (!marketColumns.includes('category')) {
    db.exec("ALTER TABLE market_prices ADD COLUMN category TEXT DEFAULT 'Grains'");
  }

  // Seed market prices if empty or if we want to refresh with categories
  const count = db.prepare('SELECT COUNT(*) as count FROM market_prices').get() as { count: number };
  if (count.count <= 5) { // Refresh if we only have the initial 5 or none
    db.exec('DELETE FROM market_prices');
    const insert = db.prepare('INSERT INTO market_prices (crop, category, state, price, change) VALUES (?, ?, ?, ?, ?)');
    const prices = [
      ['Wheat', 'Grains', 'Punjab', 2100, 2.5],
      ['Rice', 'Grains', 'West Bengal', 1950, -1.2],
      ['Maize', 'Grains', 'Karnataka', 1800, 0.8],
      ['Cotton', 'Fiber', 'Gujarat', 6200, 5.4],
      ['Soybean', 'Oilseeds', 'Madhya Pradesh', 4500, -0.5],
      ['Tomato', 'Vegetables', 'Maharashtra', 1200, -15.2],
      ['Potato', 'Vegetables', 'Uttar Pradesh', 950, 4.1],
      ['Onion', 'Vegetables', 'Maharashtra', 1500, 12.5],
      ['Apple', 'Fruits', 'Himachal Pradesh', 8500, 2.3],
      ['Banana', 'Fruits', 'Tamil Nadu', 2200, -1.5],
      ['Mango', 'Fruits', 'Andhra Pradesh', 4500, 8.0],
    ];
    for (const p of prices) {
      insert.run(p[0], p[1], p[2], p[3], p[4]);
    }
  }

  return db;
}

export const db = initDB();
