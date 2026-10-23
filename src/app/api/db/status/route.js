import { NextResponse } from 'next/server';
import { testMongoConnection } from '../../../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const status = await testMongoConnection();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: err.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { uri, action } = body;

    if (action === 'test') {
      const status = await testMongoConnection(uri);
      return NextResponse.json(status);
    }

    if (action === 'save' && uri) {
      // Test first
      const status = await testMongoConnection(uri);
      if (!status.connected) {
        return NextResponse.json({
          success: false,
          error: `Connection test failed: ${status.error}`
        }, { status: 400 });
      }

      const envPath = path.join(process.cwd(), '.env.local');
      const currentDb = process.env.MONGODB_DB || 'Website_Management';
      const envContent = `MONGODB_URI=${uri.trim()}\nMONGODB_DB=${currentDb}\n`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
      process.env.MONGODB_URI = uri.trim();

      return NextResponse.json({
        success: true,
        message: 'MongoDB URI saved and validated successfully!',
        status
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
