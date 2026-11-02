import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

const DELETED_FILE = path.join(process.cwd(), 'src', 'data', 'deleted_records.json');

function readLocalDeleted() {
  try {
    if (fs.existsSync(DELETED_FILE)) {
      const content = fs.readFileSync(DELETED_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read local deleted records:', e.message);
  }
  return global._biomedical_deleted_records && Array.isArray(global._biomedical_deleted_records)
    ? global._biomedical_deleted_records
    : [];
}

function writeLocalDeleted(list) {
  global._biomedical_deleted_records = list;
  try {
    const dir = path.dirname(DELETED_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DELETED_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write local deleted records:', e.message);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const localList = readLocalDeleted();
  try {
    const db = await getDatabase();
    const collection = db.collection('deleted_records');
    const records = await collection.find({}).sort({ deletedAt: -1 }).toArray();

    // Deduplicate between MongoDB and local
    const map = new Map();
    localList.forEach(r => map.set(r.id || r.originalId, r));
    records.forEach(r => map.set(r.id || r.originalId, { ...r, _id: String(r._id) }));

    const merged = Array.from(map.values()).sort((a, b) => {
      return new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0);
    });

    writeLocalDeleted(merged);

    return NextResponse.json({
      success: true,
      count: merged.length,
      records: merged,
      source: 'mongodb'
    }, { headers: CORS_HEADERS });
  } catch (e) {
    return NextResponse.json({
      success: true,
      count: localList.length,
      records: localList,
      source: 'local'
    }, { headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const recordId = body.id || `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newRecord = {
      id: recordId,
      originalId: body.originalId || body.id,
      itemType: body.itemType || 'lead',
      title: body.title || body.hospital || body.customerName || 'Inquiry',
      doctorName: body.doctorName || body.contact || '',
      hospital: body.hospital || body.hospitalName || '',
      phone: body.phone || body.customerPhone || '',
      email: body.email || body.customerEmail || '',
      equipment: body.equipment || body.productName || '',
      amount: body.amount || body.quoteAmount || body.totalAmount || '₹0',
      sourceWebsite: body.sourceWebsite || body.siteDomain || 'rajbiosis.com',
      deletedBy: {
        name: body.deletedBy?.name || 'Admin',
        role: body.deletedBy?.role || 'Administrator',
        email: body.deletedBy?.email || ''
      },
      deletedAt: body.deletedAt || nowIso,
      recordData: body.recordData || body
    };

    const currentList = readLocalDeleted();
    const updatedList = [newRecord, ...currentList.filter(r => r.id !== recordId && r.originalId !== newRecord.originalId)];
    writeLocalDeleted(updatedList);

    try {
      const db = await getDatabase();
      await db.collection('deleted_records').updateOne(
        { $or: [{ id: recordId }, { originalId: newRecord.originalId }] },
        { $set: newRecord },
        { upsert: true }
      );
    } catch (dbErr) {}

    return NextResponse.json({ success: true, record: newRecord }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// Restore a deleted record back to active system
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, originalId } = body;

    const currentList = readLocalDeleted();
    const recordToRestore = currentList.find(r => r.id === id || r.originalId === (originalId || id));

    if (!recordToRestore) {
      return NextResponse.json({ success: false, error: 'Record not found in archive' }, { status: 404, headers: CORS_HEADERS });
    }

    const { itemType, recordData } = recordToRestore;

    // 1. Re-insert into active collection
    const db = await getDatabase().catch(() => null);

    if (itemType === 'lead') {
      const leadPayload = recordData?.leadData || recordData || {
        id: recordToRestore.originalId,
        hospital: recordToRestore.hospital,
        doctorName: recordToRestore.doctorName,
        phone: recordToRestore.phone,
        email: recordToRestore.email,
        equipment: recordToRestore.equipment,
        amount: recordToRestore.amount,
        siteDomain: recordToRestore.sourceWebsite,
        createdAt: new Date().toISOString()
      };

      if (db) {
        await db.collection('leads').updateOne(
          { id: leadPayload.id },
          { $set: { ...leadPayload, restoredAt: new Date().toISOString() } },
          { upsert: true }
        ).catch(() => {});
      }

      // Local leads sync
      const LEADS_FILE = path.join(process.cwd(), 'src', 'data', 'leads.json');
      try {
        let lList = [];
        if (fs.existsSync(LEADS_FILE)) lList = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
        lList = [leadPayload, ...lList.filter(l => l.id !== leadPayload.id)];
        fs.writeFileSync(LEADS_FILE, JSON.stringify(lList, null, 2), 'utf-8');
        global._biomedical_leads = lList;
      } catch (e) {}
    } else if (itemType === 'quotation') {
      const quotePayload = recordData?.quotationData || recordData;
      if (db) {
        await db.collection('quotations').updateOne(
          { $or: [{ id: quotePayload.id }, { refNo: quotePayload.refNo }] },
          { $set: { ...quotePayload, restoredAt: new Date().toISOString() } },
          { upsert: true }
        ).catch(() => {});
      }
    }

    // 2. Remove from deleted records archive
    const updatedList = currentList.filter(r => r.id !== id && r.originalId !== (originalId || id));
    writeLocalDeleted(updatedList);

    if (db) {
      await db.collection('deleted_records').deleteOne({
        $or: [{ id: id }, { originalId: (originalId || id) }]
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Record ${recordToRestore.originalId || id} restored successfully to active system`,
      restoredItem: recordToRestore
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// Permanent purge from archive
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    let currentList = readLocalDeleted();

    if (clearAll) {
      writeLocalDeleted([]);
      try {
        const db = await getDatabase();
        await db.collection('deleted_records').deleteMany({});
      } catch (e) {}
      return NextResponse.json({ success: true, message: 'All archived records permanently purged' }, { headers: CORS_HEADERS });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400, headers: CORS_HEADERS });
    }

    const filtered = currentList.filter(r => r.id !== id && r.originalId !== id);
    writeLocalDeleted(filtered);

    try {
      const db = await getDatabase();
      await db.collection('deleted_records').deleteOne({ $or: [{ id }, { originalId: id }] });
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Archived record ${id} permanently wiped` }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

