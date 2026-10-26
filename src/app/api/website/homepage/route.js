import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { DEFAULT_HOMEPAGE_CONFIG } from '../../../../data/defaultHomepage';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'homepageConfig.json');

function readLocalFallback() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('Failed to read local fallback cache:', e.message);
  }
  return DEFAULT_HOMEPAGE_CONFIG;
}

function writeLocalFallback(data) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write local fallback cache:', e.message);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || 'rajbiosis.com';

  try {
    const db = await getDatabase();
    const collection = db.collection('homepage_config');
    const config = await collection.findOne({ domain: domain.toLowerCase() });

    if (config) {
      const { _id, ...cleanConfig } = config;
      // Keep local cache in sync
      writeLocalFallback(cleanConfig);
      return NextResponse.json({
        success: true,
        source: 'mongodb',
        isDbConnected: true,
        data: cleanConfig
      });
    }

    // Not yet initialized in MongoDB, return default seed and seed to MongoDB in background
    const initialData = readLocalFallback();
    try {
      await collection.updateOne(
        { domain: domain.toLowerCase() },
        { $set: { ...initialData, domain: domain.toLowerCase(), updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } catch {}

    return NextResponse.json({
      success: true,
      source: 'seeded_mongodb',
      isDbConnected: true,
      data: initialData
    });
  } catch (err) {
    // Graceful offline fallback
    const fallbackData = readLocalFallback();
    return NextResponse.json({
      success: true,
      source: 'local_storage',
      isDbConnected: false,
      error: err.message,
      data: fallbackData
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const domain = (body.domain || 'rajbiosis.com').toLowerCase();

    const dataToSave = {
      ...body,
      domain,
      updatedAt: new Date().toISOString()
    };

    // 1. Always save to local fallback for zero-downtime resilience
    writeLocalFallback(dataToSave);

    // 2. Try saving to MongoDB
    let savedToMongo = false;
    let mongoError = null;

    try {
      const db = await getDatabase();
      const collection = db.collection('homepage_config');
      
      const { _id, ...docWithoutId } = dataToSave;
      const result = await collection.updateOne(
        { domain },
        { $set: docWithoutId },
        { upsert: true }
      );

      savedToMongo = true;
    } catch (mErr) {
      mongoError = mErr.message;
      console.warn('MongoDB save warning (saved locally):', mErr.message);
    }

    return NextResponse.json({
      success: true,
      savedToMongo,
      mongoError,
      source: savedToMongo ? 'mongodb' : 'local_storage',
      data: dataToSave
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
