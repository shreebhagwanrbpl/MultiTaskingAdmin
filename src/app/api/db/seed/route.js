import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { INITIAL_SITES } from '../../../../data/initialSites';

export async function POST() {
  try {
    const db = await getDatabase();
    const sitesCollection = db.collection('sites');
    
    // Check if sites collection has items
    let siteCount = await sitesCollection.countDocuments();
    if (siteCount === 0) {
      await sitesCollection.insertMany(INITIAL_SITES);
      siteCount = INITIAL_SITES.length;
    }

    const leadCount = await db.collection('leads').countDocuments();

    return NextResponse.json({
      success: true,
      message: 'MongoDB collections verified and seeded with multi-company platforms',
      counts: {
        sites: siteCount,
        leads: leadCount
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
