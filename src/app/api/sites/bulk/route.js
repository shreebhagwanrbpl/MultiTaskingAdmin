import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { domains, companyId, updates } = body;

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields provided to update' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('sites');

    // Build query filter
    let query = {};
    if (Array.isArray(domains) && domains.length > 0) {
      query = { domain: { $in: domains } };
    } else if (companyId && companyId !== 'all') {
      query = { companyId: companyId };
    } else {
      // All websites
      query = {};
    }

    const cleanUpdates = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined && val !== null && val !== '') {
        cleanUpdates[key] = typeof val === 'string' ? val.trim() : val;
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'All update fields are empty' }, { status: 400 });
    }

    cleanUpdates.updatedAt = new Date().toISOString();

    const result = await collection.updateMany(query, { $set: cleanUpdates });

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message: `Successfully bulk updated ${result.modifiedCount} websites in MongoDB Atlas.`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
