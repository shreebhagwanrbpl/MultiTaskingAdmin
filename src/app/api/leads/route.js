import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

const LEADS_FILE = path.join(process.cwd(), 'src', 'data', 'leads.json');

function readLocalLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const content = fs.readFileSync(LEADS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read local leads file:', e.message);
  }
  return global._biomedical_leads && Array.isArray(global._biomedical_leads)
    ? global._biomedical_leads
    : [];
}

function writeLocalLeads(list) {
  try {
    const dir = path.dirname(LEADS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    global._biomedical_leads = list;
    return true;
  } catch (e) {
    console.warn('Failed to write local leads file:', e.message);
    global._biomedical_leads = list;
    return false;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  const localLeads = readLocalLeads();

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
        const hosp = (matched.hospitalName || lead.hospital || '').trim();
        const doc = (matched.fullName || lead.doctorName || '').trim();
        const addr = (matched.address || lead.address || '').trim();
        const dist = (matched.district || lead.city || '').trim();
        const st = (matched.state || lead.state || '').trim();
        const pin = (matched.pincode || lead.pincode || '').toString().trim();
        const em = (matched.email || lead.email || '').trim();
        const ph = (matched.phone || lead.phone || '').replace(/\D/g, '');

        const isGeneric = !hosp || [
          'clinic / hospital', 'healthcare facility', 'general hospital', 'hospital',
          'customer hospital / lab', 'customer hospital / diagnostic lab'
        ].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution'));

        const isComplete = Boolean(
          !isGeneric &&
          hosp.length >= 3 &&
          doc.length >= 2 &&
          doc.toLowerCase() !== 'medical client' &&
          ph.length >= 10 &&
          em.length >= 5 &&
          em.includes('@') &&
          st.length >= 2 &&
          dist.length >= 2 &&
          dist.toLowerCase() !== 'india' &&
          addr.length >= 3 &&
          pin.length >= 4
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
              district: dist || lead.rawLeadData?.district,
              pincode: pin || lead.rawLeadData?.pincode,
              state: st || lead.rawLeadData?.state
            }
          };
        } else {
          return {
            ...lead,
            isProfileComplete: false,
            hospital: hosp || lead.hospital,
            doctorName: doc || lead.doctorName,
            address: addr || lead.address,
            city: dist || lead.city,
            rawLeadData: {
              ...(lead.rawLeadData || {}),
              isProfileComplete: false,
              hospitalName: hosp || lead.rawLeadData?.hospitalName,
              customerName: doc || lead.rawLeadData?.customerName,
              address: addr || lead.rawLeadData?.address,
              district: dist || lead.rawLeadData?.district,
              pincode: pin || lead.rawLeadData?.pincode,
              state: st || lead.rawLeadData?.state
            }
          };
        }
      }
      return lead;
    });

    if (enrichedLeads.length > 0) {
      writeLocalLeads(enrichedLeads);
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: enrichedLeads.length,
      leads: enrichedLeads || []
    }, { headers: CORS_HEADERS });
  } catch (err) {
    let memCustomers = [];
    try {
      const custFile = path.join(process.cwd(), 'src', 'data', 'customers.json');
      if (fs.existsSync(custFile)) {
        memCustomers = JSON.parse(fs.readFileSync(custFile, 'utf-8'));
      }
    } catch (e) {
      memCustomers = global._biomedical_customers || [];
    }

    const customerByPhone = new Map();
    const customerByEmail = new Map();
    memCustomers.forEach(c => {
      const p = (c.phone || '').replace(/\D/g, '').slice(-10);
      const e = (c.email || '').trim().toLowerCase();
      if (p) customerByPhone.set(p, c);
      if (e) customerByEmail.set(e, c);
    });

    const enrichedMemLeads = (localLeads || []).map(lead => {
      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || lead.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
      const emailClean = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').trim().toLowerCase();
      const matched = customerByPhone.get(phoneClean) || customerByEmail.get(emailClean);

      if (matched) {
        const hosp = (matched.hospitalName || lead.hospital || '').trim();
        const doc = (matched.fullName || lead.doctorName || '').trim();
        const addr = (matched.address || lead.address || '').trim();
        const dist = (matched.district || lead.city || '').trim();
        const st = (matched.state || lead.state || '').trim();
        const pin = (matched.pincode || lead.pincode || '').toString().trim();
        const em = (matched.email || lead.email || '').trim();
        const ph = (matched.phone || lead.phone || '').replace(/\D/g, '');

        const isGeneric = !hosp || [
          'clinic / hospital', 'healthcare facility', 'general hospital', 'hospital',
          'customer hospital / lab', 'customer hospital / diagnostic lab'
        ].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution'));

        const isComplete = Boolean(
          !isGeneric &&
          hosp.length >= 3 &&
          doc.length >= 2 &&
          doc.toLowerCase() !== 'medical client' &&
          ph.length >= 10 &&
          em.length >= 5 &&
          em.includes('@') &&
          st.length >= 2 &&
          dist.length >= 2 &&
          dist.toLowerCase() !== 'india' &&
          addr.length >= 3 &&
          pin.length >= 4
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
              district: dist || lead.rawLeadData?.district,
              pincode: pin || lead.rawLeadData?.pincode,
              state: st || lead.rawLeadData?.state
            }
          };
        } else {
          return {
            ...lead,
            isProfileComplete: false,
            hospital: hosp || lead.hospital,
            doctorName: doc || lead.doctorName,
            address: addr || lead.address,
            city: dist || lead.city,
            rawLeadData: {
              ...(lead.rawLeadData || {}),
              isProfileComplete: false,
              hospitalName: hosp || lead.rawLeadData?.hospitalName,
              customerName: doc || lead.rawLeadData?.customerName,
              address: addr || lead.rawLeadData?.address,
              district: dist || lead.rawLeadData?.district,
              pincode: pin || lead.rawLeadData?.pincode,
              state: st || lead.rawLeadData?.state
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
    }, { headers: CORS_HEADERS });
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

    // 1. Always update local JSON file & memory
    const currentList = readLocalLeads();
    const existingIdx = currentList.findIndex(l => l.id === leadId);
    let updatedList;
    if (existingIdx >= 0) {
      updatedList = [...currentList];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...newLead };
    } else {
      updatedList = [newLead, ...currentList];
    }
    writeLocalLeads(updatedList);

    // 2. Also try MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('leads');

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
        }, { headers: CORS_HEADERS });
      }

      const result = await collection.insertOne(newLead);
      return NextResponse.json({
        success: true,
        source: 'mongodb',
        lead: { ...newLead, _id: result.insertedId }
      }, { headers: CORS_HEADERS });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        lead: newLead
      }, { headers: CORS_HEADERS });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteTest = searchParams.get('deleteTest');
    const clearAll = searchParams.get('all') === 'true' || searchParams.get('clearAll') === 'true';

    let currentList = readLocalLeads();

    if (clearAll) {
      writeLocalLeads([]);
      try {
        const db = await getDatabase();
        await db.collection('leads').deleteMany({});
      } catch (e) {}
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'local' }, { headers: CORS_HEADERS });
    }

    if (deleteTest === 'true') {
      currentList = currentList.filter(l => {
        const str = JSON.stringify(l).toLowerCase();
        return !str.includes('test') && !l.id?.startsWith('cust-') && !l.equipment?.startsWith('Profile Registration');
      });
      writeLocalLeads(currentList);
      try {
        const db = await getDatabase();
        await db.collection('leads').deleteMany({
          $or: [
            { id: { $regex: 'test', $options: 'i' } },
            { doctorName: { $regex: 'test', $options: 'i' } },
            { id: { $regex: '^cust-', $options: 'i' } },
            { equipment: { $regex: '^Profile Registration', $options: 'i' } }
          ]
        });
      } catch (e) {}
      return NextResponse.json({ success: true, message: 'Deleted test entries' }, { headers: CORS_HEADERS });
    }

    if (!id) {
      writeLocalLeads([]);
      try {
        const db = await getDatabase();
        await db.collection('leads').deleteMany({});
      } catch (e) {}
      return NextResponse.json({ success: true, count: 0, cleared: true, source: 'local' }, { headers: CORS_HEADERS });
    }

    const filtered = currentList.filter(l => l.id !== id && l._id !== id);
    writeLocalLeads(filtered);

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const { ObjectId } = await import('mongodb');
      let query = { id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ id }, { _id: new ObjectId(id) }] };
      }
      await collection.deleteOne(query);
    } catch (e) {}

    return NextResponse.json({ success: true, deletedId: id }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, status } = body;

    const currentList = readLocalLeads();
    const foundIdx = currentList.findIndex(l => (id && l.id === id) || (_id && (l._id === _id || String(l._id) === String(_id))));
    if (foundIdx >= 0) {
      currentList[foundIdx].status = status || 'Quote Generated';
      currentList[foundIdx].updatedAt = new Date().toISOString();
      writeLocalLeads(currentList);
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
      return NextResponse.json({ success: true, updated: true, source: 'mongodb' }, { headers: CORS_HEADERS });
    } catch (dbErr) {
      return NextResponse.json({ success: true, updated: true, source: 'fallback' }, { headers: CORS_HEADERS });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
