import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brandsDir = path.join(process.cwd(), 'public', 'brands');
    if (!fs.existsSync(brandsDir)) {
      return NextResponse.json({ logos: [] });
    }

    const files = fs.readdirSync(brandsDir);
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

    const logos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
      })
      .map((file) => ({
        filename: file,
        url: `/brands/${encodeURIComponent(file)}`
      }));

    return NextResponse.json({ logos }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error reading brand logos:', error);
    return NextResponse.json({ logos: [], error: error.message }, { status: 500 });
  }
}

