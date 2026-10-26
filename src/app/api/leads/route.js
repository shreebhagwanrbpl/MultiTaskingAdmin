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
    const leadId = body.id || ('lead-' + Date.now());
    const newLead = {
      ...body,
      id: leadId,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: body.date || 'Just now',
      status: body.status || 'Pending RFQ'
    };

    if (!global._biomedical_leads) {
      global._biomedical_leads = [];
    }
    global._biomedical_leads.unshift(newLead);

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');

      // Check if lead already exists by ID OR (same phone + same equipment on this site domain)
      const orConditions = [{ id: leadId }];
      if (body.phone && body.equipment) {
        orConditions.push({
          phone: body.phone,
          equipment: body.equipment,
          siteDomain: body.siteDomain || 'rajbiosis.com'
        });
      }

      const existing = await collection.findOne({ $or: orConditions });
      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...newLead,
              id: existing.id || leadId,
              createdAt: existing.createdAt || newLead.createdAt,
              updatedAt: new Date().toISOString()
            }
          }
        );
        return NextResponse.json({
          success: true,
          source: 'mongodb',
          updated: true,
          lead: { ...existing, ...newLead }
        });
      }

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteTest = searchParams.get('deleteTest');
    const db = await getDatabase();
    const collection = db.collection('leads');

    if (deleteTest === 'true') {
      await collection.deleteMany({
        $or: [
          { id: { $regex: 'test', $options: 'i' } },
          { doctorName: { $regex: 'test', $options: 'i' } },
          { id: { $regex: '^cust-', $options: 'i' } },
          { equipment: { $regex: '^Profile Registration', $options: 'i' } }
        ]
      });
      return NextResponse.json({ success: true, message: 'Deleted test and profile registration entries' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });
    }

    let query = { id };
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(id)) {
        query = { $or: [{ id }, { _id: new ObjectId(id) }] };
      }
    } catch (e) { }

    await collection.deleteOne(query);
    return NextResponse.json({ success: true, deletedId: id });
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
