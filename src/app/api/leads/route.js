import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

// Blank initial leads - start completely fresh
const INITIAL_LEADS = [];

global._biomedical_leads = [];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('leads');
    const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: leads.length,
      leads: leads || []
    });
  } catch (err) {
    if (!global._biomedical_leads) {
      global._biomedical_leads = [];
    }
    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      error: err.message,
      count: global._biomedical_leads.length,
      leads: global._biomedical_leads
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newLead = {
      id: body.id || `lead-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      date: 'Just now',
      status: body.status || 'Pending RFQ'
    };

    if (!global._biomedical_leads) {
      global._biomedical_leads = [];
    }
    global._biomedical_leads.unshift(newLead);

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const result = await collection.insertOne(newLead);
      return NextResponse.json({
        success: true,
        source: 'mongodb',
        lead: { ...newLead, _id: result.insertedId }
      });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        lead: newLead
      });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, status } = body;

    if (!global._biomedical_leads) {
      global._biomedical_leads = [];
    }
    const found = global._biomedical_leads.find(l => (id && l.id === id) || (_id && (l._id === _id || String(l._id) === String(_id))));
    if (found) {
      found.status = status || 'Quote Generated';
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const query = id ? { id } : {};
      if (_id && !id) {
        try {
          const { ObjectId } = await import('mongodb');
          query._id = new ObjectId(_id);
        } catch (e) {
          query._id = _id;
        }
      }
      await collection.updateOne(query, {
        $set: {
          status: status || 'Quote Generated',
          updatedAt: new Date().toISOString()
        }
      });
      return NextResponse.json({ success: true, updated: true, source: 'mongodb' });
    } catch (dbErr) {
      return NextResponse.json({ success: true, updated: true, source: 'fallback' });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Clear all leads endpoint
export async function DELETE() {
  try {
    global._biomedical_leads = [];
    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      await collection.deleteMany({});
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'mongodb' });
    } catch (dbErr) {
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'fallback' });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}
