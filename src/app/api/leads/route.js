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
    let leads = await collection.find({}).toArray();

    if (!leads || leads.length === 0) {
      await collection.insertMany(INITIAL_LEADS);
      leads = INITIAL_LEADS;
    }

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
      count: INITIAL_LEADS.length,
      leads: INITIAL_LEADS
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

