import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

// Blank initial leads - start completely fresh
const INITIAL_LEADS = [];

global._biomedical_leads = [];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('leads');
    const customersCollection = db.collection('customers');

    const [leads, customers] = await Promise.all([
      collection.find({}).sort({ createdAt: -1 }).toArray(),
      customersCollection.find({}).toArray().catch(() => [])
    ]);

    // Build fast lookup by phone & email
    const customerByPhone = new Map();
    const customerByEmail = new Map();
    (customers || []).forEach(c => {
      const p = (c.phone || '').replace(/\D/g, '').slice(-10);
      const e = (c.email || '').trim().toLowerCase();
      if (p) customerByPhone.set(p, c);
      if (e) customerByEmail.set(e, c);
    });

    const enrichedLeads = (leads || []).map(lead => {
      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || lead.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
      const emailClean = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').trim().toLowerCase();
      const matched = customerByPhone.get(phoneClean) || customerByEmail.get(emailClean);

      if (matched) {
        const hosp = (matched.hospitalName || '').trim();
        const doc = (matched.fullName || '').trim();
        const addr = (matched.address || '').trim();
        const dist = (matched.district || '').trim();
        const isComplete = Boolean(
          hosp.length >= 3 &&
          !['clinic / hospital', 'healthcare facility', 'general hospital', 'hospital'].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution')) &&
          doc.length >= 2 &&
          (addr.length >= 3 || dist.length >= 3)
        );

        if (isComplete) {
          return {
            ...lead,
            isProfileComplete: true,
            hospital: hosp || lead.hospital,
            doctorName: doc || lead.doctorName,
            address: addr || lead.address,
            city: dist || lead.city,
            rawLeadData: {
              ...(lead.rawLeadData || {}),
              isProfileComplete: true,
              hospitalName: hosp || lead.rawLeadData?.hospitalName,
              customerName: doc || lead.rawLeadData?.customerName,
              address: addr || lead.rawLeadData?.address,
              district: dist || lead.rawLeadData?.district
            }
          };
        }
      }
      return lead;
    });

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: enrichedLeads.length,
      leads: enrichedLeads || []
    });
  } catch (err) {
    if (!global._biomedical_leads) {
      global._biomedical_leads = [];
    }
    const memCustomers = global._biomedical_customers || [];
    const customerByPhone = new Map();
    const customerByEmail = new Map();
    memCustomers.forEach(c => {
      const p = (c.phone || '').replace(/\D/g, '').slice(-10);
      const e = (c.email || '').trim().toLowerCase();
      if (p) customerByPhone.set(p, c);
      if (e) customerByEmail.set(e, c);
    });

    const enrichedMemLeads = (global._biomedical_leads || []).map(lead => {
      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || lead.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
      const emailClean = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').trim().toLowerCase();
      const matched = customerByPhone.get(phoneClean) || customerByEmail.get(emailClean);

      if (matched) {
        const hosp = (matched.hospitalName || '').trim();
        const doc = (matched.fullName || '').trim();
        const addr = (matched.address || '').trim();
        const dist = (matched.district || '').trim();
        const isComplete = Boolean(
          hosp.length >= 3 &&
          !['clinic / hospital', 'healthcare facility', 'general hospital', 'hospital'].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution')) &&
          doc.length >= 2 &&
          (addr.length >= 3 || dist.length >= 3)
        );

        if (isComplete) {
          return {
            ...lead,
            isProfileComplete: true,
            hospital: hosp || lead.hospital,
            doctorName: doc || lead.doctorName,
            address: addr || lead.address,
            city: dist || lead.city,
            rawLeadData: {
              ...(lead.rawLeadData || {}),
              isProfileComplete: true,
              hospitalName: hosp || lead.rawLeadData?.hospitalName,
              customerName: doc || lead.rawLeadData?.customerName,
              address: addr || lead.rawLeadData?.address,
              district: dist || lead.rawLeadData?.district
            }
          };
        }
      }
      return lead;
    });

    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      error: err.message,
      count: enrichedMemLeads.length,
      leads: enrichedMemLeads
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
    const clearAll = searchParams.get('all') === 'true' || searchParams.get('clearAll') === 'true';
    const db = await getDatabase();
    const collection = db.collection('leads');

    if (global._biomedical_leads) {
      global._biomedical_leads = [];
    }

    if (clearAll) {
      await collection.deleteMany({});
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'mongodb' });
    }

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
      // If neither id nor specific action provided, clear all
      await collection.deleteMany({});
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'mongodb' });
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
