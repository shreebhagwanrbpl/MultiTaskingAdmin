import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

const INITIAL_LEADS = [
  {
    id: 'lead-101',
    doctorName: 'Dr. S. K. Mehta',
    hospital: 'Apollo Super Speciality Hospital',
    city: 'Bengaluru',
    email: 'dr.mehta@apollohospitals.com',
    phone: '+91 98210 55443',
    siteDomain: 'pulmocare.in',
    brandName: 'PulmoCare Devices',
    equipment: 'RajBiosis-Vent Pro-X9 ICU Mechanical Ventilator (x2)',
    quoteAmount: '₹9,70,000',
    date: '10 Mins ago',
    status: 'Pending RFQ'
  },
  {
    id: 'lead-102',
    doctorName: 'Er. Rajesh K. Varma',
    hospital: 'Fortis Escorts Heart Institute',
    city: 'New Delhi',
    email: 'rajesh.varma@fortishealthcare.com',
    phone: '+91 98112 44321',
    siteDomain: 'cardiopulse.in',
    brandName: 'CardioPulse Medical',
    equipment: 'CardioPulse Multi-Para Telemetry Station (x6)',
    quoteAmount: '₹2,74,000',
    date: '35 Mins ago',
    status: 'Quote Sent'
  },
  {
    id: 'lead-103',
    doctorName: 'Dr. Anita Sen',
    hospital: 'Tata Memorial Hospital',
    city: 'Mumbai',
    email: 'anita.sen@tmc.gov.in',
    phone: '+91 98450 77881',
    siteDomain: 'surgitech.in',
    brandName: 'SurgiTech Systems',
    equipment: 'RajBiosis AuraSurg 4K UHD Tower (x1)',
    quoteAmount: '₹14,50,000',
    date: '1 Hour ago',
    status: 'Pending RFQ'
  },
  {
    id: 'lead-104',
    doctorName: 'Dr. K. Srinivas',
    hospital: 'Care Diagnostic Centre',
    city: 'Hyderabad',
    email: 'srinivas.k@carediagnostics.in',
    phone: '+91 99881 22334',
    siteDomain: 'rajbiosis.com',
    brandName: 'Raj Biosis',
    equipment: 'RayMaster 500mA Fixed Digital X-Ray (x1)',
    quoteAmount: '₹18,50,000',
    date: '3 Hours ago',
    status: 'Quote Sent'
  },
  {
    id: 'lead-105',
    doctorName: 'Dr. Rajiv Anand',
    hospital: 'Max Super Speciality Hospital',
    city: 'New Delhi',
    email: 'rajiv.anand@maxhealthcare.com',
    phone: '+91 98101 99002',
    siteDomain: 'pulmocare.in',
    brandName: 'PulmoCare Devices',
    equipment: 'DefiQuick Biphasic Defibrillator (x3)',
    quoteAmount: '₹5,85,000',
    date: '5 Hours ago',
    status: 'Order Pipeline'
  }
];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('leads');
    let leads = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: leads.length,
      leads
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      error: err.message,
      count: 0,
      leads: []
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
      const existingIdx = INITIAL_LEADS.findIndex(l => l.id === leadId || (l.phone === body.phone && l.equipment === body.equipment));
      if (existingIdx >= 0) {
        INITIAL_LEADS[existingIdx] = { ...INITIAL_LEADS[existingIdx], ...newLead };
        return NextResponse.json({ success: true, source: 'fallback', updated: true, lead: INITIAL_LEADS[existingIdx] });
      }
      INITIAL_LEADS.unshift(newLead);
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
    } catch (e) {}

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
      const found = INITIAL_LEADS.find(l => l.id === id || l._id === _id);
      if (found) {
        found.status = status || 'Quote Generated';
      }
      return NextResponse.json({ success: true, updated: true, source: 'fallback' });
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

