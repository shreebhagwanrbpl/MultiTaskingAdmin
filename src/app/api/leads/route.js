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
  // Purely in-memory cache, DO NOT write to src/data/leads.json on disk
  global._biomedical_leads = list;
  return true;
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

    // Deduplicate leads: prioritize complete profile leads and newest records
    const sortedEnriched = [...enrichedLeads].sort((a, b) => {
      if (a.isProfileComplete && !b.isProfileComplete) return -1;
      if (!a.isProfileComplete && b.isProfileComplete) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const seenLeadIds = new Set();
    const seenCustomerEquipment = new Set();
    const uniqueLeads = [];

    for (const lead of sortedEnriched) {
      const cleanId = lead.id || String(lead._id);
      const cleanPhone = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const cleanEquip = (lead.equipment || lead.productName || lead.rawLeadData?.productName || '').trim().toLowerCase();
      const custEquipKey = cleanPhone && cleanEquip ? `${cleanPhone}::${cleanEquip}` : null;

      if (seenLeadIds.has(cleanId)) continue;
      if (custEquipKey && seenCustomerEquipment.has(custEquipKey)) continue;

      seenLeadIds.add(cleanId);
      if (custEquipKey) seenCustomerEquipment.add(custEquipKey);
      uniqueLeads.push(lead);
    }

    if (uniqueLeads.length > 0) {
      writeLocalLeads(uniqueLeads);
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: uniqueLeads.length,
      leads: uniqueLeads
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

    const sortedMemEnriched = [...enrichedMemLeads].sort((a, b) => {
      if (a.isProfileComplete && !b.isProfileComplete) return -1;
      if (!a.isProfileComplete && b.isProfileComplete) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const seenMemIds = new Set();
    const seenMemCustomerEquipment = new Set();
    const uniqueMemLeads = [];

    for (const lead of sortedMemEnriched) {
      const cleanId = lead.id || String(lead._id);
      const cleanPhone = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const cleanEquip = (lead.equipment || lead.productName || lead.rawLeadData?.productName || '').trim().toLowerCase();
      const custEquipKey = cleanPhone && cleanEquip ? `${cleanPhone}::${cleanEquip}` : null;

      if (seenMemIds.has(cleanId)) continue;
      if (custEquipKey && seenMemCustomerEquipment.has(custEquipKey)) continue;

      seenMemIds.add(cleanId);
      if (custEquipKey) seenMemCustomerEquipment.add(custEquipKey);
      uniqueMemLeads.push(lead);
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      error: err.message,
      count: uniqueMemLeads.length,
      leads: uniqueMemLeads
    }, { headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const leadId = body.id || ('lead-' + Date.now());
    const now = new Date();
    const nowIso = now.toISOString();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDateTime = `${formattedDate}, ${formattedTime}`;

    const newLead = {
      ...body,
      id: leadId,
      date: body.date && body.date !== 'Just now' ? body.date : formattedDate,
      time: body.time || formattedTime,
      dateTime: body.dateTime || formattedDateTime,
      createdAt: body.createdAt || nowIso,
      updatedAt: nowIso,
      status: body.status || 'Pending RFQ'
    };

    // 1. Always update local JSON file & memory with phone+equipment deduplication
    const currentList = readLocalLeads();
    const cleanPhone = (newLead.phone || newLead.customerPhone || newLead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
    const cleanEquip = (newLead.equipment || newLead.productName || newLead.rawLeadData?.productName || '').trim().toLowerCase();

    const existingIdx = currentList.findIndex(l => {
      if (l.id && l.id === leadId) return true;
      const lPhone = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const lEquip = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
      return cleanPhone && cleanEquip && lPhone === cleanPhone && lEquip === cleanEquip;
    });

    let updatedList;
    if (existingIdx >= 0) {
      const existing = currentList[existingIdx];
      newLead.id = existing.id || leadId; // Preserve original id so client & server remain in sync
      updatedList = [...currentList];
      updatedList[existingIdx] = { ...existing, ...newLead, updatedAt: nowIso };
    } else {
      updatedList = [newLead, ...currentList];
    }
    writeLocalLeads(updatedList);

    // 2. Also try MongoDB with ATOMIC UPSERT (no race conditions)
    try {
      const db = await getDatabase();
      const collection = db.collection('leads');

      const cleanPhone = (newLead.phone || newLead.customerPhone || '').replace(/\D/g, '').slice(-10);
      let targetLeadId = leadId;

      // Check if an existing lead exists for this customer (by phone) and same equipment
      if (cleanPhone && newLead.equipment) {
        const existingDoc = await collection.findOne({
          $or: [
            { id: leadId },
            {
              phone: { $regex: cleanPhone + '$' },
              equipment: newLead.equipment
            }
          ]
        });
        if (existingDoc && existingDoc.id) {
          targetLeadId = existingDoc.id;
          newLead.id = existingDoc.id;
        }
      }

      const query = { id: targetLeadId };
      const { createdAt, _id, ...fieldsToSet } = newLead;
      const updateResult = await collection.updateOne(
        query,
        {
          $set: {
            ...fieldsToSet,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: createdAt || new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        updated: Boolean(updateResult.matchedCount > 0),
        lead: newLead
      }, { headers: CORS_HEADERS });
    } catch (dbErr) {
      console.warn('[MongoDB save error in /api/leads]:', dbErr);
      return NextResponse.json({
        success: true,
        source: 'fallback',
        dbError: dbErr.message,
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

    const filtered = currentList.filter(l => l.id !== id && l._id !== id && String(l._id) !== id);
    writeLocalLeads(filtered);

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const { ObjectId } = await import('mongodb');
      const orConditions = [{ id: id }, { _id: id }];
      if (ObjectId.isValid(id)) {
        orConditions.push({ _id: new ObjectId(id) });
      }
      await collection.deleteMany({ $or: orConditions });
    } catch (e) {}

    return NextResponse.json({ success: true, deletedId: id }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, ...fieldsToUpdate } = body;

    const currentList = readLocalLeads();
    const foundIdx = currentList.findIndex(l => (id && l.id === id) || (_id && (l._id === _id || String(l._id) === String(_id))));
    if (foundIdx >= 0) {
      currentList[foundIdx] = {
        ...currentList[foundIdx],
        ...fieldsToUpdate,
        updatedAt: new Date().toISOString()
      };
      writeLocalLeads(currentList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      let query = {};
      if (_id && id) {
        try {
          const { ObjectId } = await import('mongodb');
          query = { $or: [{ _id: new ObjectId(_id) }, { id: id }] };
        } catch (e) {
          query = { $or: [{ _id: _id }, { id: id }] };
        }
      } else if (_id) {
        try {
          const { ObjectId } = await import('mongodb');
          query = { _id: new ObjectId(_id) };
        } catch (e) {
          query = { _id: _id };
        }
      } else if (id) {
        query = { id };
      }
      await collection.updateOne(query, {
        $set: {
          ...fieldsToUpdate,
          updatedAt: new Date().toISOString()
        }
      });
      return NextResponse.json({
        success: true,
        updated: true,
        source: 'mongodb',
        lead: foundIdx >= 0 ? currentList[foundIdx] : null
      }, { headers: CORS_HEADERS });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        updated: true,
        source: 'fallback',
        lead: foundIdx >= 0 ? currentList[foundIdx] : null
      }, { headers: CORS_HEADERS });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

