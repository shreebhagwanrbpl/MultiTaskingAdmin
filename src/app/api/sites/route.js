import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

import { INITIAL_SITES } from '../../../data/initialSites';


export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('sites');
    const sites = await collection.find({}).toArray();

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: sites.length,
      sites
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      source: 'error',
      isDbConnected: false,
      error: err.message,
      count: 0,
      sites: []
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const collection = db.collection('sites');

    const filters = [];
    if (body._id && ObjectId.isValid(body._id)) filters.push({ _id: new ObjectId(body._id) });
    if (body.id) filters.push({ id: body.id });
    if (body.domain) filters.push({ domain: body.domain.toLowerCase().trim() });

    if (filters.length > 0) {
      const existing = await collection.findOne({ $or: filters });
      if (existing) {
        const { _id, ...updateData } = body;
        await collection.updateOne({ _id: existing._id }, { 
          $set: { 
            ...updateData, 
            updatedAt: new Date().toISOString() 
          } 
        });
        return NextResponse.json({
          success: true,
          source: 'mongodb',
          action: 'updated',
          site: { ...existing, ...updateData }
        });
      }
    }

    const newSite = {
      ...body,
      createdAt: new Date().toISOString(),
      active: true,
      leadsCount: body.leadsCount || 0
    };

    const result = await collection.insertOne(newSite);
    return NextResponse.json({
      success: true,
      source: 'mongodb',
      action: 'created',
      site: { ...newSite, _id: result.insertedId }
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const domain = searchParams.get('domain');
    const _id = searchParams.get('_id');

    const db = await getDatabase();
    const collection = db.collection('sites');

    const orConditions = [];

    // 1. By domain
    if (domain && domain !== 'undefined') {
      orConditions.push({ domain: domain.toLowerCase().trim() });
    }

    // 2. By custom string ID
    if (id && id !== 'undefined') {
      orConditions.push({ id: id.trim() });
      if (ObjectId.isValid(id.trim())) {
        try {
          orConditions.push({ _id: new ObjectId(id.trim()) });
        } catch {}
      }
    }

    // 3. By MongoDB ObjectId
    if (_id && _id !== 'undefined' && ObjectId.isValid(_id.trim())) {
      try {
        orConditions.push({ _id: new ObjectId(_id.trim()) });
      } catch {}
    }

    if (orConditions.length === 0) {
      return NextResponse.json({ error: 'Provide valid id, domain, or _id' }, { status: 400 });
    }

    const result = await collection.deleteMany({ $or: orConditions });

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount, 
      message: result.deletedCount > 0 ? 'Site deleted successfully from MongoDB' : 'No matching site found in MongoDB' 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
