import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const district = searchParams.get('district');

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

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: customers.length,
      customers
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      count: 0,
      customers: []
    }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const collection = db.collection('customers');

    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const id = body.id || (phone ? `cust-${phone.replace(/\D/g, '').slice(-10)}` : `cust-${Date.now()}`);

    // Check if customer already exists by phone, email, or id
    const filterConditions = [];
    if (phone) filterConditions.push({ phone });
    if (email) filterConditions.push({ email });
    if (id) filterConditions.push({ id });

    let existing = null;
    if (filterConditions.length > 0) {
      existing = await collection.findOne({ $or: filterConditions });
    }

    const now = new Date().toISOString();
    let resultRecord;

    if (existing) {
      // Profile Edited
      const prev = existing;
      const incoming = body.profileDetails || body;

      // Detect field-level changes
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

      const editHistory = Array.isArray(existing.editHistory) ? existing.editHistory : [];
      editHistory.unshift(auditEntry);

      const updateData = {
        ...incoming,
        id: existing.id || id,
        lastAction: 'Profile Edited',
        lastActionAt: now,
        updatedAt: now,
        editCount: (existing.editCount || 0) + 1,
        editHistory: editHistory.slice(0, 20) // Keep last 20 audit events
      };
      delete updateData._id;

      await collection.updateOne({ _id: existing._id }, { $set: updateData });
      resultRecord = { ...existing, ...updateData };
    } else {
      // First Time Registration
      const incoming = body.profileDetails || body;
      const initialEntry = {
        timestamp: now,
        action: 'Initial Profile Created',
        summary: `Account registered for ${incoming.fullName || 'User'} (${incoming.hospitalName || 'Clinic'})`,
        changes: []
      };

      const newCustomer = {
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
      delete newCustomer._id;

      const insertResult = await collection.insertOne(newCustomer);
      resultRecord = { ...newCustomer, _id: insertResult.insertedId };
    }

    // Auto-update all matching leads in the leads collection & memory when customer profile is saved/updated
    try {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      const cleanEmail = (email || '').trim().toLowerCase();
      const incomingData = body.profileDetails || body;
      const hosp = (incomingData.hospitalName || '').trim();
      const doc = (incomingData.fullName || '').trim();
      const addr = (incomingData.address || '').trim();
      const dist = (incomingData.district || '').trim();

      const isComplete = Boolean(
        hosp.length >= 3 &&
        !['clinic / hospital', 'healthcare facility', 'general hospital', 'hospital'].some(g => hosp.toLowerCase() === g) &&
        doc.length >= 2 &&
        (addr.length >= 3 || dist.length >= 3)
      );

      const leadsCollection = db.collection('leads');
      const matchConditions = [];
      if (cleanPhone) {
        matchConditions.push({ phone: { $regex: cleanPhone } });
        matchConditions.push({ 'rawLeadData.customerPhone': { $regex: cleanPhone } });
        matchConditions.push({ 'rawLeadData.phone': { $regex: cleanPhone } });
      }
      if (cleanEmail) {
        matchConditions.push({ email: { $regex: `^${cleanEmail}$`, $options: 'i' } });
        matchConditions.push({ 'rawLeadData.customerEmail': { $regex: `^${cleanEmail}$`, $options: 'i' } });
      }

      if (matchConditions.length > 0) {
        const leadUpdateFields = {
          updatedAt: now,
          isProfileComplete: isComplete,
          'rawLeadData.isProfileComplete': isComplete
        };
        if (hosp) {
          leadUpdateFields.hospital = hosp;
          leadUpdateFields['rawLeadData.hospitalName'] = hosp;
        }
        if (doc) {
          leadUpdateFields.doctorName = doc;
          leadUpdateFields['rawLeadData.customerName'] = doc;
        }
        if (addr) {
          leadUpdateFields.address = addr;
          leadUpdateFields['rawLeadData.address'] = addr;
        }
        if (dist) {
          leadUpdateFields.city = dist;
          leadUpdateFields['rawLeadData.district'] = dist;
        }

        await leadsCollection.updateMany(
          { $or: matchConditions },
          { $set: leadUpdateFields }
        );

        // Also update in-memory global leads fallback if present
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
                city: dist || l.city,
                rawLeadData: {
                  ...(l.rawLeadData || {}),
                  isProfileComplete: isComplete,
                  hospitalName: hosp || l.rawLeadData?.hospitalName,
                  customerName: doc || l.rawLeadData?.customerName,
                  address: addr || l.rawLeadData?.address,
                  district: dist || l.rawLeadData?.district
                }
              };
            }
            return l;
          });
        }
      }
    } catch (leadUpdateErr) {
      console.warn('Auto-updating leads on customer profile save error:', leadUpdateErr);
    }

    return NextResponse.json({
      success: true,
      message: existing ? 'Customer profile updated with change audit log' : 'Customer profile registered successfully',
      isNew: !existing,
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

    const db = await getDatabase();
    const collection = db.collection('customers');

    if (clearAll) {
      await collection.deleteMany({});
      return NextResponse.json({ success: true, cleared: true, count: 0 }, { headers: CORS_HEADERS });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400, headers: CORS_HEADERS });
    }

    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    await collection.deleteOne(query);
    return NextResponse.json({ success: true, deletedId: id }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
