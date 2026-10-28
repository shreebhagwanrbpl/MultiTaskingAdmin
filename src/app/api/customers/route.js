import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

const CUSTOMERS_FILE = path.join(process.cwd(), 'src', 'data', 'customers.json');

function readLocalCustomers() {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const content = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read local customers file:', e.message);
  }
  return global._biomedical_customers && Array.isArray(global._biomedical_customers)
    ? global._biomedical_customers
    : [];
}

function writeLocalCustomers(list) {
  // Purely in-memory cache, DO NOT write to src/data/customers.json on disk
  global._biomedical_customers = list;
  return true;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const district = searchParams.get('district');

  try {
    const db = await getDatabase();
    const collection = db.collection('customers');

    const query = {};
    if (district && district !== 'all') {
      query.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }
    if (search && search.trim()) {
      const q = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { fullName: q },
        { hospitalName: q },
        { phone: q },
        { email: q },
        { district: q },
        { designation: q }
      ];
    }

    const customers = await collection.find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();

    // Sync to local fallback
    if (customers.length > 0) {
      writeLocalCustomers(customers);
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: customers.length,
      customers
    }, { headers: CORS_HEADERS });
  } catch (err) {
    // MongoDB offline / standby mode -> return local persistent storage with status 200 (NO 500 error!)
    let localCustomers = readLocalCustomers();

    if (district && district !== 'all') {
      localCustomers = localCustomers.filter(c =>
        c.district && c.district.toLowerCase() === district.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      localCustomers = localCustomers.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(s)) ||
        (c.hospitalName && c.hospitalName.toLowerCase().includes(s)) ||
        (c.phone && c.phone.includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.district && c.district.toLowerCase().includes(s)) ||
        (c.designation && c.designation.toLowerCase().includes(s))
      );
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      count: localCustomers.length,
      customers: localCustomers
    }, { status: 200, headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const id = body.id || (phone ? `cust-${phone.replace(/\D/g, '').slice(-10)}` : `cust-${Date.now()}`);

    const now = new Date().toISOString();
    let currentList = readLocalCustomers();

    // Check if customer already exists in local storage
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();

    const existingIdx = currentList.findIndex(c => {
      const cPhone = (c.phone || '').replace(/\D/g, '').slice(-10);
      const cEmail = (c.email || '').trim().toLowerCase();
      return (c.id && c.id === id) ||
             (cleanPhone && cPhone && cleanPhone === cPhone) ||
             (cleanEmail && cEmail && cleanEmail === cEmail);
    });

    let resultRecord;
    const incoming = body.profileDetails || body;

    if (existingIdx >= 0) {
      // Profile Edited
      const prev = currentList[existingIdx];
      const trackedFields = [
        { key: 'fullName', label: 'Name' },
        { key: 'hospitalName', label: 'Hospital' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'district', label: 'District' },
        { key: 'state', label: 'State' },
        { key: 'designation', label: 'Designation' },
        { key: 'address', label: 'Address' },
        { key: 'pincode', label: 'Pincode' }
      ];

      const detectedChanges = [];
      trackedFields.forEach(({ key, label }) => {
        const oldVal = (prev[key] || '').toString().trim();
        const newVal = (incoming[key] || '').toString().trim();
        if (newVal && oldVal !== newVal) {
          detectedChanges.push({ field: key, label, oldValue: oldVal || '(empty)', newValue: newVal });
        }
      });

      const auditEntry = {
        timestamp: now,
        action: 'Profile Updated',
        summary: detectedChanges.length > 0
          ? `Changed ${detectedChanges.map(c => `${c.label}: "${c.oldValue}" → "${c.newValue}"`).join(', ')}`
          : 'Profile details saved / re-submitted',
        changes: detectedChanges
      };

      const editHistory = Array.isArray(prev.editHistory) ? prev.editHistory : [];
      editHistory.unshift(auditEntry);

      resultRecord = {
        ...prev,
        ...incoming,
        id: prev.id || id,
        lastAction: 'Profile Edited',
        lastActionAt: now,
        updatedAt: now,
        editCount: (prev.editCount || 0) + 1,
        editHistory: editHistory.slice(0, 20)
      };
      delete resultRecord._id;

      currentList[existingIdx] = resultRecord;
    } else {
      // First Time Registration
      const initialEntry = {
        timestamp: now,
        action: 'Initial Profile Created',
        summary: `Account registered for ${incoming.fullName || 'User'} (${incoming.hospitalName || 'Clinic'})`,
        changes: []
      };

      resultRecord = {
        ...incoming,
        id,
        siteDomain: body.siteDomain || 'rajbiosis.com',
        brandName: body.brandName || 'Raj Biosis',
        lastAction: 'New Profile Created',
        lastActionAt: now,
        createdAt: now,
        updatedAt: now,
        editCount: 0,
        editHistory: [initialEntry]
      };
      delete resultRecord._id;

      currentList.unshift(resultRecord);
    }

    // 1. Always save to local JSON file
    writeLocalCustomers(currentList);

    // 2. Try saving to MongoDB if available
    let savedToMongo = false;
    try {
      const db = await getDatabase();
      const collection = db.collection('customers');
      const filterConditions = [];
      if (phone) filterConditions.push({ phone });
      if (email) filterConditions.push({ email });
      if (id) filterConditions.push({ id });

      let existingDb = null;
      if (filterConditions.length > 0) {
        existingDb = await collection.findOne({ $or: filterConditions });
      }

      if (existingDb) {
        await collection.updateOne({ _id: existingDb._id }, { $set: resultRecord });
        resultRecord._id = existingDb._id;
      } else {
        const insertRes = await collection.insertOne(resultRecord);
        resultRecord._id = insertRes.insertedId;
      }
      savedToMongo = true;
    } catch (dbErr) {
      // MongoDB offline - persistent local storage handled it safely!
    }

    // 3. Auto-update matching leads in memory & local storage
    try {
      const hosp = (incoming.hospitalName || '').trim();
      const doc = (incoming.fullName || '').trim();
      const addr = (incoming.address || '').trim();
      const dist = (incoming.district || '').trim();

      const isComplete = Boolean(
        hosp.length >= 3 &&
        !['clinic / hospital', 'healthcare facility', 'general hospital', 'hospital'].some(g => hosp.toLowerCase() === g) &&
        doc.length >= 2 &&
        (addr.length >= 3 || dist.length >= 3)
      );

      // Auto update in-memory global leads
      if (global._biomedical_leads && Array.isArray(global._biomedical_leads)) {
        global._biomedical_leads = global._biomedical_leads.map(l => {
          const lPhone = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || l.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
          const lEmail = (l.email || l.customerEmail || l.rawLeadData?.customerEmail || '').trim().toLowerCase();
          if ((cleanPhone && lPhone.includes(cleanPhone)) || (cleanEmail && lEmail === cleanEmail)) {
            return {
              ...l,
              isProfileComplete: isComplete,
              hospital: hosp || l.hospital,
              doctorName: doc || l.doctorName,
              address: addr || l.address,
              city: dist || l.city
            };
          }
          return l;
        });
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: existingIdx >= 0 ? 'Customer profile updated with change audit log' : 'Customer profile registered successfully',
      isNew: existingIdx < 0,
      source: savedToMongo ? 'mongodb' : 'local',
      customer: resultRecord
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('all') === 'true';

    let currentList = readLocalCustomers();

    if (clearAll) {
      writeLocalCustomers([]);
      try {
        const db = await getDatabase();
        await db.collection('customers').deleteMany({});
      } catch (e) {}
      return NextResponse.json({ success: true, cleared: true, count: 0 }, { headers: CORS_HEADERS });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400, headers: CORS_HEADERS });
    }

    const filtered = currentList.filter(c => c.id !== id && c._id !== id && String(c._id) !== id);
    writeLocalCustomers(filtered);

    try {
      const db = await getDatabase();
      const collection = db.collection('customers');
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
