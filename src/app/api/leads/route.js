import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getLeadTimestamp, stableLeadSort } from '../../../lib/leadUtils';
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
  // Purely in-memory cache, DO NOT write to src/data/leads.json on disk.
  // MongoDB is the sole persistent store.
  global._biomedical_leads = list;
  return true;
}

export function cleanLeadHospital(hosp) {
  if (!hosp || typeof hosp !== 'string') return 'NA';
  const trimmed = hosp.trim();
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    trimmed === 'NA' ||
    trimmed === 'N/A' ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    lower.includes('healthcare institution') ||
    lower.includes('health institute') ||
    lower.includes('healthcare facility') ||
    lower.includes('healthcare center') ||
    lower.includes('customer hospital') ||
    lower === 'hospital / healthcare center' ||
    lower === 'hospital / healthcare institution' ||
    lower === 'hospital' ||
    lower === 'general hospital' ||
    lower === 'clinic / hospital'
  ) {
    return 'NA';
  }
  return trimmed;
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
      const cleanH = cleanLeadHospital(lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName);
      lead.hospital = cleanH;
      lead.hospitalName = cleanH;
      if (lead.rawLeadData) {
        lead.rawLeadData.hospitalName = cleanH;
      }

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
    const uniqueLeads = [];

    for (const lead of sortedEnriched) {
      const cleanId = lead.id || String(lead._id);
      if (seenLeadIds.has(cleanId)) continue;
      seenLeadIds.add(cleanId);
      uniqueLeads.push(lead);
    }

    // Guarantee absolute deterministic chronological ordering (newest arrival first)
    uniqueLeads.sort(stableLeadSort);

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
      const cleanH = cleanLeadHospital(lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName);
      lead.hospital = cleanH;
      lead.hospitalName = cleanH;
      if (lead.rawLeadData) {
        lead.rawLeadData.hospitalName = cleanH;
      }

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
    const uniqueMemLeads = [];

    for (const lead of sortedMemEnriched) {
      const cleanId = lead.id || String(lead._id);
      if (seenMemIds.has(cleanId)) continue;
      seenMemIds.add(cleanId);
      uniqueMemLeads.push(lead);
    }

    // Guarantee absolute deterministic chronological ordering (newest arrival first)
    uniqueMemLeads.sort(stableLeadSort);

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

    const cleanHosp = cleanLeadHospital(body.hospital || body.hospitalName || body.rawLeadData?.hospitalName);

    const newLead = {
      ...body,
      hospital: cleanHosp,
      hospitalName: cleanHosp,
      rawLeadData: body.rawLeadData ? {
        ...body.rawLeadData,
        hospitalName: cleanHosp
      } : body.rawLeadData,
      id: leadId,
      date: body.date && body.date !== 'Just now' ? body.date : formattedDate,
      time: body.time || formattedTime,
      dateTime: body.dateTime || formattedDateTime,
      createdAt: body.createdAt || nowIso,
      updatedAt: nowIso,
      status: body.status || 'Pending RFQ'
    };

    // 1. Always update local JSON file & memory by exact lead ID
    const currentList = readLocalLeads();
    const existingIdx = currentList.findIndex(l => l.id && l.id === leadId);

    let updatedList;
    if (existingIdx >= 0) {
      const existing = currentList[existingIdx];
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

      const query = { id: leadId };
      const { createdAt, _id, ...fieldsToSet } = newLead;

      // Preserve previously locked approved price if customer negotiates lower (e.g. 1400 vs 1500)
      if (typeof existingDoc !== 'undefined' && existingDoc && (existingDoc.approvedPrice || existingDoc.lockedApprovedPrice)) {
        const prevApproved = parseFloat(existingDoc.lockedApprovedPrice || existingDoc.approvedPrice);
        const incomingBid = parseFloat(newLead.expectedPrice || 0);
        if (incomingBid > 0 && incomingBid < prevApproved) {
          fieldsToSet.lockedApprovedPrice = prevApproved;
          fieldsToSet.customerRevisedBid = incomingBid;
          fieldsToSet.approvedPrice = prevApproved; // Base floor locked
          fieldsToSet.price = prevApproved;
          fieldsToSet.isPriceNegotiated = true;
          fieldsToSet.negotiationStatus = 'approved';
          fieldsToSet.adminNote = `Customer bargained for ₹${incomingBid.toLocaleString('en-IN')}. Floor locked at ₹${prevApproved.toLocaleString('en-IN')}. Bridge with ₹${(prevApproved - incomingBid).toLocaleString('en-IN')} complementary add-on.`;
        }
      }
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

const DELETED_RECORDS_FILE = path.join(process.cwd(), 'src', 'data', 'deleted_records.json');

async function archiveRecords(items, deletedBy, itemType = 'lead') {
  if (!items || items.length === 0) return;
  const nowIso = new Date().toISOString();
  const recordsToArchive = items.map(item => ({
    id: `del-${item.id || item._id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    originalId: item.id || String(item._id || ''),
    itemType: itemType,
    title: item.hospital || item.hospitalName || item.customerName || item.equipment || 'Hospital Inquiry',
    doctorName: item.doctorName || item.contact || item.customerName || '',
    hospital: item.hospital || item.hospitalName || '',
    phone: item.phone || item.customerPhone || '',
    email: item.email || item.customerEmail || '',
    equipment: item.equipment || item.productName || item.hardware || '',
    amount: item.amount || item.quoteAmount || item.totalAmount || '₹0',
    sourceWebsite: item.sourceWebsite || item.siteDomain || 'rajbiosis.com',
    status: item.status || 'Archived',
    deletedBy: {
      name: deletedBy?.name || 'Admin',
      role: deletedBy?.role || 'Administrator',
      email: deletedBy?.email || ''
    },
    deletedAt: nowIso,
    recordData: item
  }));

  // 1. In-memory archive update (MongoDB is the sole persistent store, do NOT write to disk)
  try {
    const existing = (global._biomedical_deleted_records && Array.isArray(global._biomedical_deleted_records))
      ? global._biomedical_deleted_records
      : [];
    const combined = [...recordsToArchive, ...existing];
    global._biomedical_deleted_records = combined;
  } catch (err) {
    console.warn('Memory archive save error:', err);
  }

  // 2. MongoDB insert
  try {
    const db = await getDatabase();
    await db.collection('deleted_records').insertMany(recordsToArchive);
  } catch (dbErr) {
    console.warn('MongoDB archive save error:', dbErr);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    const deleteTest = searchParams.get('deleteTest');
    const clearAll = searchParams.get('all') === 'true' || searchParams.get('clearAll') === 'true';

    // Support json body with { ids: [...], deletedBy: { ... } }
    let bodyIds = [];
    let deletedBy = { name: 'Admin', role: 'HQ Admin', email: '' };
    try {
      const body = await request.json();
      if (body) {
        if (Array.isArray(body.ids)) bodyIds = body.ids;
        if (body.deletedBy) deletedBy = body.deletedBy;
      }
    } catch (e) {}

    let targetIds = [];
    if (idsParam) {
      targetIds = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    } else if (bodyIds.length > 0) {
      targetIds = bodyIds.map(s => String(s).trim()).filter(Boolean);
    } else if (id) {
      targetIds = [id.trim()];
    }

    let currentList = readLocalLeads();

    if (clearAll) {
      let allLeads = [...currentList];
      try {
        const db = await getDatabase();
        const mongoAll = await db.collection('leads').find({}).toArray();
        const known = new Set(allLeads.map(l => l.id || String(l._id)));
        mongoAll.forEach(m => {
          if (!known.has(m.id || String(m._id))) allLeads.push(m);
        });
      } catch (e) {}
      await archiveRecords(allLeads, deletedBy, 'lead');

      writeLocalLeads([]);
      try {
        const db = await getDatabase();
        await db.collection('leads').deleteMany({});
        await db.collection('quotations').deleteMany({});
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

    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No lead ID provided for deletion' }, { status: 400, headers: CORS_HEADERS });
    }

    // 1. Gather all leads to archive (from local AND MongoDB)
    let leadsToDelete = currentList.filter(l => 
      targetIds.includes(l.id) || 
      (l._id && targetIds.includes(String(l._id)))
    );

    try {
      const db = await getDatabase();
      const { ObjectId } = await import('mongodb');
      const mongoLeads = await db.collection('leads').find({
        $or: [
          { id: { $in: targetIds } },
          ...targetIds.filter(t => t && t.length === 24).map(t => {
            try {
              return { _id: new ObjectId(t) };
            } catch (e) {
              return { id: t };
            }
          })
        ]
      }).toArray();
      const knownIds = new Set(leadsToDelete.map(l => l.id || String(l._id)));
      mongoLeads.forEach(ml => {
        const idKey = ml.id || String(ml._id);
        if (!knownIds.has(idKey)) {
          leadsToDelete.push(ml);
          knownIds.add(idKey);
        }
      });
    } catch (e) {}

    // Archive leads safely into audit vault
    await archiveRecords(leadsToDelete, deletedBy, 'lead');

    const quotationRefsToDelete = leadsToDelete.map(l => l.quotationRef).filter(Boolean);
    const quotationIdsToDelete = leadsToDelete.map(l => l.quotationId).filter(Boolean);

    // Also archive associated quotations if any
    try {
      const db = await getDatabase();
      const quotesCollection = db.collection('quotations');
      const quoteOrConditions = [
        { leadId: { $in: targetIds } },
        { id: { $in: targetIds } }
      ];
      if (quotationRefsToDelete.length > 0) quoteOrConditions.push({ refNo: { $in: quotationRefsToDelete } });
      if (quotationIdsToDelete.length > 0) quoteOrConditions.push({ id: { $in: quotationIdsToDelete } });
      const quotesToDelete = await quotesCollection.find({ $or: quoteOrConditions }).toArray();
      if (quotesToDelete && quotesToDelete.length > 0) {
        await archiveRecords(quotesToDelete, deletedBy, 'quotation');
      }
    } catch (e) {}

    // 2. Remove from in-memory leads (Do NOT write to src/data/leads.json)
    const filtered = currentList.filter(l => 
      !targetIds.includes(l.id) && 
      (!l._id || !targetIds.includes(String(l._id)))
    );
    writeLocalLeads(filtered);

    // 3. Remove from in-memory quotations (Do NOT write to src/data/quotations.json)
    if (global._biomedical_quotations && Array.isArray(global._biomedical_quotations)) {
      global._biomedical_quotations = global._biomedical_quotations.filter(q => 
        !targetIds.includes(q.leadId) && 
        !targetIds.includes(q.id) && 
        !quotationRefsToDelete.includes(q.refNo) &&
        !quotationIdsToDelete.includes(q.id)
      );
    }

    // 4. Delete from MongoDB leads collection & quotations collection permanently
    try {
      const db = await getDatabase();
      const leadsCollection = db.collection('leads');
      const { ObjectId } = await import('mongodb');

      const orConditions = targetIds.map(tId => ({ id: tId }));
      targetIds.forEach(tId => {
        if (ObjectId.isValid(tId)) {
          orConditions.push({ _id: new ObjectId(tId) });
        }
      });
      await leadsCollection.deleteMany({ $or: orConditions });

      // Permanently remove matching quotations from MongoDB
      const quotationsCollection = db.collection('quotations');
      const quoteOrConditions = [
        { leadId: { $in: targetIds } },
        { id: { $in: targetIds } }
      ];
      if (quotationRefsToDelete.length > 0) {
        quoteOrConditions.push({ refNo: { $in: quotationRefsToDelete } });
      }
      if (quotationIdsToDelete.length > 0) {
        quoteOrConditions.push({ id: { $in: quotationIdsToDelete } });
      }
      await quotationsCollection.deleteMany({ $or: quoteOrConditions }).catch(() => {});
    } catch (dbErr) {
      console.warn('MongoDB delete leads error:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      deletedIds: targetIds,
      deletedCount: targetIds.length,
      message: `Permanently deleted ${targetIds.length} lead(s) and history from entire system`
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, ...fieldsToUpdate } = body;

    const currentList = readLocalLeads();
    const quoteNum = body.quoteNumber || body.rawLeadData?.quoteNumber;
    const foundIdx = currentList.findIndex(l => 
      (id && l.id === id) || 
      (_id && (l._id === _id || String(l._id) === String(_id))) ||
      (quoteNum && (l.quoteNumber === quoteNum || l.rawLeadData?.quoteNumber === quoteNum || l.id === quoteNum))
    );
    if (foundIdx >= 0) {
      currentList[foundIdx] = {
        ...currentList[foundIdx],
        ...fieldsToUpdate,
        rawLeadData: {
          ...(currentList[foundIdx].rawLeadData || {}),
          ...fieldsToUpdate
        },
        updatedAt: new Date().toISOString()
      };
      writeLocalLeads(currentList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const orConditions = [];
      if (_id) {
        try {
          const { ObjectId } = await import('mongodb');
          orConditions.push({ _id: new ObjectId(_id) });
        } catch (e) {
          orConditions.push({ _id: _id });
        }
      }
      if (id) {
        orConditions.push({ id });
        orConditions.push({ 'rawLeadData.id': id });
        orConditions.push({ 'rawLeadData.quoteNumber': id });
        orConditions.push({ quoteNumber: id });
      }
      if (quoteNum) {
        orConditions.push({ quoteNumber: quoteNum });
        orConditions.push({ 'rawLeadData.quoteNumber': quoteNum });
      }
      const query = orConditions.length > 0 ? { $or: orConditions } : { id };

      const updatePayload = {
        ...fieldsToUpdate,
        ...(fieldsToUpdate.status ? { 'rawLeadData.status': fieldsToUpdate.status } : {}),
        ...(fieldsToUpdate.quotationRef ? { 'rawLeadData.quotationRef': fieldsToUpdate.quotationRef } : {}),
        ...(fieldsToUpdate.isQuotationCreated ? { 'rawLeadData.isQuotationCreated': true } : {}),
        updatedAt: new Date().toISOString()
      };

      await collection.updateOne(query, {
        $set: updatePayload
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

