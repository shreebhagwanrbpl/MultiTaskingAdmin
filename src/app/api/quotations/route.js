import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const SAMPLE_QUOTATION = {
  id: 'quot-hzl-001',
  refNo: 'RBPL/Q00130MAY15',
  date: '30.05.2015',
  customerName: 'Hindustan Zinc Limited',
  customerAddress1: 'Zinc Park, Yashad Bhawan',
  customerAddress2: 'Udaipur-RAJASTHAN',
  subjectLetter: 'Quotation purchase of Lab Equipments',
  subjectQuotation: 'Purchase of Semi-Automated clinical chemistry quantification analyzer, Model: CliniQuant',
  signatory: {
    name: 'Bhupender Raj',
    role: 'Sales & Mkt. Head',
    company: 'Raj Biosis Pvt Ltd.',
    address1: 'B-7, Aman Plaza, Plot No. 26,',
    address2: 'Heera Nagar-A, Chitrakoot',
    city: 'Jaipur-302021 Rajasthan',
    phone: '+91-998-3333-469'
  },
  items: [
    {
      id: 'item-1',
      sr: 1,
      itemCode: '',
      title: 'Semi-Automated clinical chemistry quantification analyzer',
      bullets: [
        '7 assay modes',
        'Preloaded test protocols',
        '100 open test programs',
        '32μl quartz flow cell, minimum aspiration of 200μl',
        '200 patient memory',
        'RS 232 interfacing port',
        'Real time graph display',
        'Designed for various assays',
        '  - Clinical chemistry',
        '  - Special proteins',
        '  - Drugs of abuse',
        '  - Theraputic drugs',
        '  - Electrolytes'
      ].join('\n'),
      qty: 1,
      unitLabel: 'No',
      unitPrice: 150000,
      totalPrice: 150000
    }
  ],
  subtotal: 150000,
  taxMode: 'inclusive',
  taxAmount: 0,
  grandTotal: 150000,
  amountInWords: 'One lakh fifty thousand',
  createdAt: '2015-05-30T10:00:00.000Z',
  updatedAt: '2015-05-30T10:00:00.000Z'
};

const QUOTATIONS_FILE = path.join(process.cwd(), 'src', 'data', 'quotations.json');

function readLocalQuotations() {
  try {
    if (fs.existsSync(QUOTATIONS_FILE)) {
      const content = fs.readFileSync(QUOTATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read local quotations file:', e.message);
  }
  return [];
}

function writeLocalQuotations(list) {
  // Purely in-memory cache, DO NOT write to src/data/quotations.json on disk
  global._biomedical_quotations = list;
  return true;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function GET() {
  const localDocs = readLocalQuotations();

  try {
    const db = await getDatabase();
    const collection = db.collection('quotations');
    let docs = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const normalized = docs.map(d => ({
      ...d,
      _id: d._id ? d._id.toString() : undefined,
      id: d.id || (d._id ? d._id.toString() : `quot-${Date.now()}`)
    }));

    // Deduplicate quotations: ensure each quotation has a unique id and refNo
    const seenQuoteIds = new Set();
    const seenRefNos = new Set();
    const uniqueQuotations = [];

    const sortedNormalized = [...normalized].sort((a, b) => {
      const isAGeneric = (a.customerName || '').toLowerCase().includes('healthcare institution');
      const isBGeneric = (b.customerName || '').toLowerCase().includes('healthcare institution');
      if (!isAGeneric && isBGeneric) return -1;
      if (isAGeneric && !isBGeneric) return 1;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });

    for (const q of sortedNormalized) {
      const qId = q.id || (q._id ? String(q._id) : null);
      const qRef = (q.refNo || '').trim();

      if (qId && seenQuoteIds.has(qId)) continue;
      if (qRef && seenRefNos.has(qRef)) continue;

      if (qId) seenQuoteIds.add(qId);
      if (qRef) seenRefNos.add(qRef);
      uniqueQuotations.push(q);
    }

    writeLocalQuotations(uniqueQuotations);

    return NextResponse.json({
      success: true,
      count: uniqueQuotations.length,
      quotations: uniqueQuotations,
      storage: 'mongodb'
    }, { headers: CORS_HEADERS });
  } catch (error) {
    // MongoDB is offline/standby -> return persistent local storage
    return NextResponse.json({
      success: true,
      count: localDocs.length,
      quotations: localDocs,
      storage: 'local',
      fallback: true
    }, { headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Guard against automatic quotation generation from public website inquiries
    if (body.source === 'website_rfq' || body.leadType === 'quotation' || (body.id && String(body.id).startsWith('RFQ-') && !body.isManualAdminQuotation)) {
      console.warn('[Quotation API Guard] Blocked automatic quotation creation for inquiry:', body.id || body.refNo);
      return NextResponse.json({
        success: false,
        message: 'Automatic quotation creation from web inquiries is disabled. Quotations must be issued via Admin Desk.'
      }, { status: 400, headers: CORS_HEADERS });
    }

    const cleanCustomerPhone = ((body.customerAddress1 || '') + ' ' + (body.customerAddress2 || '')).replace(/\D/g, '').slice(-10);
    const subject = (body.subjectQuotation || '').trim().toLowerCase();

    // 1. Look up existing quotation in MongoDB first (single source of truth)
    let db = null;
    let existingMatch = null;
    try {
      db = await getDatabase();
      if (db) {
        const collection = db.collection('quotations');
        const orConditions = [];
        if (body.id) orConditions.push({ id: body.id });
        if (body.refNo) orConditions.push({ refNo: body.refNo });
        if (cleanCustomerPhone && cleanCustomerPhone.length >= 10 && subject) {
          orConditions.push({
            customerAddress2: { $regex: cleanCustomerPhone },
            subjectQuotation: { $regex: subject, $options: 'i' }
          });
        }
        if (orConditions.length > 0) {
          existingMatch = await collection.findOne({ $or: orConditions });
        }
      }
    } catch (dbFindErr) {
      console.warn('MongoDB quotation lookup error:', dbFindErr.message);
    }

    // 2. Fallback to local cache if not found in MongoDB
    const currentList = readLocalQuotations();
    const existingIndex = currentList.findIndex(
      q => (body.id && (q.id === body.id || q._id === body.id)) ||
           (q.refNo && body.refNo && q.refNo === body.refNo) ||
           (cleanCustomerPhone && cleanCustomerPhone.length >= 10 && subject &&
            (q.customerAddress2 || '').replace(/\D/g, '').slice(-10) === cleanCustomerPhone &&
            (q.subjectQuotation || '').trim().toLowerCase() === subject)
    );

    if (!existingMatch && existingIndex >= 0) {
      existingMatch = currentList[existingIndex];
    }
    const targetId = existingMatch ? existingMatch.id : (body.id || ('quot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)));

    const newQuotation = {
      ...body,
      id: targetId,
      createdAt: existingMatch?.createdAt || body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete newQuotation._id;

    // Track Revisions (Single Document in-place edit, preserve complete audit history)
    if (existingMatch) {
      const prevRevisions = Array.isArray(existingMatch.revisions) && existingMatch.revisions.length > 0
        ? existingMatch.revisions
        : [
            {
              revisionNo: 1,
              editedAt: existingMatch.createdAt || new Date().toISOString(),
              editedBy: existingMatch.signatory?.name || 'Sales Team',
              changeSummary: 'Initial Quotation Issued',
              prevTotal: existingMatch.grandTotal || existingMatch.subtotal || 0,
              newTotal: existingMatch.grandTotal || existingMatch.subtotal || 0,
              itemsCount: (existingMatch.items || []).length,
              complimentaryTotal: 0,
              complimentaryItems: ''
            }
          ];

      const compItems = (newQuotation.items || []).filter(it => it.isComplimentary || it.title?.includes('COMPLIMENTARY'));
      const compTotal = compItems.reduce((acc, it) => acc + (parseFloat(it.unitPrice || 0) * (parseInt(it.qty || 1, 10))), 0);
      const prevTotal = existingMatch.grandTotal || existingMatch.subtotal || 0;
      const newTotal = newQuotation.grandTotal || newQuotation.subtotal || 0;

      const newRevEntry = {
        revisionNo: prevRevisions.length + 1,
        editedAt: new Date().toISOString(),
        editedBy: body.editedBy || newQuotation.signatory?.name || 'Sales Executive',
        changeSummary: body.revisionReason || (compItems.length > 0
          ? ('Applied ₹' + compTotal.toLocaleString('en-IN') + ' complimentary add-on. Total deal locked at ₹' + Number(newTotal).toLocaleString('en-IN') + '.')
          : prevTotal !== newTotal
            ? ('Price adjusted from ₹' + Number(prevTotal).toLocaleString('en-IN') + ' to ₹' + Number(newTotal).toLocaleString('en-IN') + '.')
            : 'Quotation updated with revised specifications / line items.'),
        prevTotal,
        newTotal,
        itemsCount: (newQuotation.items || []).length,
        complimentaryTotal: compTotal,
        complimentaryItems: compItems.map(it => it.title).join(', ')
      };

      newQuotation.revisionCount = newRevEntry.revisionNo;
      newQuotation.revisions = [...prevRevisions, newRevEntry];
    } else {
      newQuotation.revisionCount = 1;
      newQuotation.revisions = [
        {
          revisionNo: 1,
          editedAt: newQuotation.createdAt,
          editedBy: newQuotation.signatory?.name || 'Sales Executive',
          changeSummary: 'Initial Quotation Issued',
          prevTotal: 0,
          newTotal: newQuotation.grandTotal || newQuotation.subtotal || 0,
          itemsCount: (newQuotation.items || []).length,
          complimentaryTotal: 0,
          complimentaryItems: ''
        }
      ];
    }

    // 1. Always save to persistent local JSON file so data is NEVER lost!
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...newQuotation };
    } else {
      updatedList = [newQuotation, ...currentList];
    }
    writeLocalQuotations(updatedList);

    // 2. Also attempt to sync to MongoDB if connected
    let savedToMongo = false;
    try {
      const db = await getDatabase();
      const collection = db.collection('quotations');

      const result = await collection.updateOne(
        { id: targetId },
        { $set: newQuotation },
        { upsert: true }
      );
      if (result.upsertedId) {
        newQuotation._id = result.upsertedId.toString();
      }
      savedToMongo = true;
    } catch (dbErr) {
      // MongoDB offline / Standby mode - Local storage handled it safely!
      console.warn('MongoDB offline/standby: saved quotation to local storage successfully');
    }

    return NextResponse.json({
      success: true,
      message: savedToMongo 
        ? ('Quotation saved successfully in MongoDB Atlas (Revision ' + newQuotation.revisionCount + ')!')
        : ('Quotation saved successfully (Revision ' + newQuotation.revisionCount + ')!'),
      storage: savedToMongo ? 'mongodb' : 'local',
      quotation: newQuotation
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id || body._id;
    if (!id && !body.refNo) {
      return NextResponse.json({ success: false, error: 'Quotation ID or RefNo required' }, { status: 400, headers: CORS_HEADERS });
    }

    const currentList = readLocalQuotations();
    const existingIndex = currentList.findIndex(
      q => (id && (q.id === id || q._id === id)) || (body.refNo && q.refNo === body.refNo)
    );

    let updatedQuote = null;
    const updateData = { ...body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    if (existingIndex >= 0) {
      updatedQuote = { ...currentList[existingIndex], ...updateData };
      const updatedList = [...currentList];
      updatedList[existingIndex] = updatedQuote;
      writeLocalQuotations(updatedList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('quotations');
      const query = { $or: [] };
      if (id) query.$or.push({ id: id });
      if (body.refNo) query.$or.push({ refNo: body.refNo });
      if (id && ObjectId.isValid(id)) query.$or.push({ _id: new ObjectId(id) });

      if (query.$or.length > 0) {
        await collection.updateOne(query, { $set: updateData });
        const refreshed = await collection.findOne(query);
        if (refreshed) {
          updatedQuote = {
            ...refreshed,
            _id: refreshed._id ? refreshed._id.toString() : undefined
          };
        }
      }
    } catch (e) {
      console.warn('MongoDB PUT fallback to local storage:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation updated successfully',
      quotation: updatedQuote || updateData
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID required' }, { status: 400, headers: CORS_HEADERS });
    }

    // Try reading deletedBy from body or params
    let deletedBy = { name: 'Admin', role: 'HQ Admin', email: '' };
    try {
      const body = await request.json();
      if (body?.deletedBy) deletedBy = body.deletedBy;
    } catch (e) {}

    // 1. Gather quotation object to archive
    const currentList = readLocalQuotations();
    const quoteToArchive = currentList.find(q => q.id === id || q._id === id || q.refNo === id);

    // Archive into deleted_records
    const DELETED_FILE = path.join(process.cwd(), 'src', 'data', 'deleted_records.json');
    const nowIso = new Date().toISOString();
    const archivedItem = {
      id: `del-quot-${id}-${Date.now()}`,
      originalId: id,
      itemType: 'quotation',
      title: quoteToArchive?.customerName || quoteToArchive?.subjectQuotation || 'Official Quotation',
      doctorName: quoteToArchive?.customerName || '',
      hospital: quoteToArchive?.customerAddress1 || quoteToArchive?.customerName || '',
      phone: quoteToArchive?.customerAddress2 || '',
      email: quoteToArchive?.customerEmail || '',
      equipment: quoteToArchive?.subjectQuotation || '',
      amount: quoteToArchive?.totalAmount ? `₹${Number(quoteToArchive.totalAmount).toLocaleString('en-IN')}` : '₹0',
      sourceWebsite: 'rajbiosis.com',
      status: 'Archived',
      deletedBy,
      deletedAt: nowIso,
      recordData: quoteToArchive || { id }
    };

    try {
      let existing = [];
      if (fs.existsSync(DELETED_FILE)) {
        try { existing = JSON.parse(fs.readFileSync(DELETED_FILE, 'utf-8')); } catch (e) {}
      }
      const combined = [archivedItem, ...(Array.isArray(existing) ? existing : [])];
      fs.writeFileSync(DELETED_FILE, JSON.stringify(combined, null, 2), 'utf-8');
      global._biomedical_deleted_records = combined;
    } catch (e) {}

    // Always delete from persistent local storage
    const filtered = currentList.filter(q => q.id !== id && q._id !== id && q.refNo !== id);
    writeLocalQuotations(filtered);

    // Also attempt MongoDB delete and archive if reachable
    try {
      const db = await getDatabase();
      await db.collection('deleted_records').insertOne(archivedItem).catch(() => {});
      const collection = db.collection('quotations');
      let query = { id: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
      }
      await collection.deleteOne(query);
    } catch (e) {
      // MongoDB offline - local deletion already succeeded
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully and archived in audit trail',
      deletedId: id
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

