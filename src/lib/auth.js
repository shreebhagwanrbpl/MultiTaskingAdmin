import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDatabase } from './mongodb';
import { DEMO_USERS } from '../data/roles';

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');

// Hash password with salt
export function hashPassword(password, salt) {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: userSalt };
}

// Verify password
export function verifyPassword(password, storedHash, storedSalt) {
  if (!storedHash || !storedSalt) {
    // Fallback for plain demo passwords if unhashed
    return password === storedHash;
  }
  const hash = crypto.pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// Generate simple secure session token
export function generateSessionToken(user) {
  const payload = {
    id: user.id || user._id,
    email: user.email,
    role: user.role,
    district: user.district,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Read local fallback users
export function readLocalUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read users.json:', e.message);
  }

  // Fallback to in-memory / demo users
  if (!global._biomedical_users || global._biomedical_users.length === 0) {
    const initializedDemos = DEMO_USERS.map(u => {
      const { hash, salt } = hashPassword(u.password);
      return {
        ...u,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString()
      };
    });
    global._biomedical_users = initializedDemos;
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(initializedDemos, null, 2), 'utf-8');
    } catch (e) {
      // safe fallback
    }
  }
  return global._biomedical_users;
}

// Write local fallback users
export function writeLocalUsers(users) {
  global._biomedical_users = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // silent fallback
  }
}

// Get user collection from MongoDB
export async function getUsersCollection() {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');

    // Ensure index on email and phone
    try {
      await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
      await collection.createIndex({ phone: 1 }, { sparse: true });
    } catch (e) {
      // index already exists or non-fatal
    }

    // Seed demo users if collection is empty
    const count = await collection.countDocuments();
    if (count === 0) {
      const seeds = DEMO_USERS.map(u => {
        const { hash, salt } = hashPassword(u.password);
        return {
          ...u,
          passwordHash: hash,
          passwordSalt: salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      await collection.insertMany(seeds);
    }

    return collection;
  } catch (err) {
    console.warn('MongoDB connection for users unavailable, using fallback:', err.message);
    return null;
  }
}

