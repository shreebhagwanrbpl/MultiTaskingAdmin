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
  try {
    const dir = path.dirname(QUOTATIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUOTATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn('Failed to write local quotations file:', e.message);
    return false;
  }
}

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

    writeLocalQuotations(normalized);

    return NextResponse.json({
      success: true,
      count: normalized.length,
      quotations: normalized,
      storage: 'mongodb'
    });
  } catch (error) {
    // MongoDB is offline/standby -> return persistent local storage
    return NextResponse.json({
      success: true,
      count: localDocs.length,
      quotations: localDocs,
      storage: 'local',
      fallback: true
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const newQuotation = {
      ...body,
      id: body.id || `quot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete newQuotation._id;

    // 1. Always save to persistent local JSON file so data is NEVER lost!
    const currentList = readLocalQuotations();
    const existingIndex = currentList.findIndex(
      q => q.id === newQuotation.id || (q.refNo && newQuotation.refNo && q.refNo === newQuotation.refNo)
    );

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
        { $or: [{ id: newQuotation.id }, { refNo: newQuotation.refNo }] },
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
        ? `Quotation saved successfully in MongoDB Atlas for "${newQuotation.customerName}"!`
        : `Quotation saved successfully for "${newQuotation.customerName}"!`,
      storage: savedToMongo ? 'mongodb' : 'local',
      quotation: newQuotation
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID required' }, { status: 400 });
    }

    // Always delete from persistent local storage
    const currentList = readLocalQuotations();
    const filtered = currentList.filter(q => q.id !== id && q._id !== id);
    writeLocalQuotations(filtered);

    // Also attempt MongoDB delete if reachable
    try {
      const db = await getDatabase();
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
      message: 'Quotation deleted successfully',
      deletedId: id
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
