import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { PRODUCTS as INITIAL_PRODUCTS } from '../../../data/products';

// Default initial website assignments per company
export const DEFAULT_COMPANY_WEBSITES = {
  rajbiosis: ['rajbiosis.com', 'cardiopulse.in', 'laparovision.com'],
  human_bio: ['humanbiomedicals.in', 'pulmocare.in', 'nephrolife.in'],
  global_bio: ['globalbiomedical.com', 'surgitech.in', 'orthodrive.in']
};

/**
 * Checks if a product is visible on a specific website domain
 */
export function isProductVisibleOnWebsite(p, siteDomain) {
  if (!siteDomain || siteDomain === 'all') {
    return p.isVisible !== false;
  }
  // If globally turned off
  if (p.isVisible === false) return false;

  // If explicitly in hiddenWebsites list
  if (Array.isArray(p.hiddenWebsites) && p.hiddenWebsites.includes(siteDomain)) {
    return false;
  }
  // If explicitly flagged false in websiteVisibility map
  if (p.websiteVisibility && p.websiteVisibility[siteDomain] === false) {
    return false;
  }

  // If assignedWebsites does not include 'all' and does not include siteDomain
  if (Array.isArray(p.assignedWebsites) && p.assignedWebsites.length > 0 && !p.assignedWebsites.includes('all')) {
    if (!p.assignedWebsites.includes(siteDomain)) {
      return false;
    }
  }

  return true;
}

/**
 * Normalizes a product document from MongoDB or raw data into the standard 18 fields
 * plus multi-company and website visibility controls.
 */
function normalizeProduct(p) {
  const brandLower = String(p.brand || '').toLowerCase();
  let defaultCompany = 'rajbiosis';
  if (brandLower.includes('human')) defaultCompany = 'human_bio';
  if (brandLower.includes('global')) defaultCompany = 'global_bio';

  const companyId = p.companyId || defaultCompany;
  const subCategory = p['sub category'] || p.subCategory || '';
  const productType = p.productType || (subCategory ? 'hierarchical' : 'normal');

  return {
    _id: p._id ? p._id.toString() : undefined,
    id: p.id || (p._id ? p._id.toString() : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    companyId: companyId,
    productType: productType, // 'normal' | 'hierarchical'
    isVisible: p.isVisible !== undefined ? !!p.isVisible : true,
    hiddenWebsites: Array.isArray(p.hiddenWebsites) ? p.hiddenWebsites : [],
    websiteVisibility: (typeof p.websiteVisibility === 'object' && p.websiteVisibility !== null) ? p.websiteVisibility : {},
    assignedWebsites: Array.isArray(p.assignedWebsites) && p.assignedWebsites.length > 0
      ? p.assignedWebsites
      : ['all'], // 'all' means all websites of this company

    // 18 Exact Excel Columns
    title: p.title || p.name || 'Untitled Medical Device',
    price: typeof p.price === 'number' ? p.price : (parseFloat(String(p.price || 0).replace(/[^0-9.]/g, '')) || 0),
    desc: p.desc || p.shortDesc || p.description || '',
    capacity: p.capacity || (p.specs ? p.specs['Tidal Volume Range'] || p.specs['Constant Throughput'] || '' : ''),
    throughput: p.throughput || (p.specs ? p.specs['Constant Throughput'] || '' : ''),
    instrument: p.instrument || (p.specs ? p.specs['Gas Supply'] || p.specs['Electric Actuators'] || '' : ''),
    model: p.model || p.sku || '',
    usage: p.usage || '',
    brand: p.brand || (companyId === 'rajbiosis' ? 'Raj Biosis' : companyId === 'human_bio' ? 'Human Biomedicals' : 'Global Biomedical'),
    parameters: p.parameters || (p.specs ? p.specs['Ventilation Modes'] || p.specs['Functions'] || '' : ''),
    automation: p.automation || 'Standard Clinical',
    availability: p.availability || p.stockStatus || 'In Stock',
    size: p.size || '',
    images: p.images || p.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    video: p.video || '',
    pdf: p.pdf || '',
    category: p.category || 'General Medical Devices',
    'sub category': subCategory,
    subCategory: subCategory,

    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString()
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const website = searchParams.get('website');
    const category = searchParams.get('category');
    const productType = searchParams.get('productType');
    const visibility = searchParams.get('visibility'); // 'visible' | 'hidden' | 'all'
    const adminMode = searchParams.get('adminMode') === 'true';
    const search = searchParams.get('search');

    const db = await getDatabase();
    const collection = db.collection('products');

    const query = {};

    if (companyId && companyId !== 'all') {
      query.companyId = companyId;
    }

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (productType && productType !== 'all') {
      if (productType === 'normal') {
        query.$or = [
          { productType: 'normal' },
          { subCategory: '' },
          { 'sub category': '' },
          { subCategory: { $exists: false } }
        ];
      } else if (productType === 'hierarchical') {
        query.$and = [
          { subCategory: { $exists: true, $ne: '' } }
        ];
      }
    }

    // Standard Storefront Query (External Website calls this to get its visible products)
    if (website && website !== 'all' && !adminMode) {
      query.isVisible = { $ne: false };
      query.hiddenWebsites = { $ne: website };
      query.$or = [
        { assignedWebsites: 'all' },
        { assignedWebsites: website }
      ];
    } else if (website && website !== 'all' && adminMode) {
      // In Admin Mode for a specific website:
      if (visibility === 'visible') {
        query.isVisible = { $ne: false };
        query.hiddenWebsites = { $ne: website };
        query.$or = [
          { assignedWebsites: 'all' },
          { assignedWebsites: website }
        ];
      } else if (visibility === 'hidden') {
        query.$or = [
          { isVisible: false },
          { hiddenWebsites: website },
          { $and: [{ assignedWebsites: { $ne: 'all' } }, { assignedWebsites: { $ne: website } }] }
        ];
      }
    } else {
      // Global admin visibility filter
      if (visibility === 'visible') {
        query.isVisible = { $ne: false };
      } else if (visibility === 'hidden') {
        query.isVisible = false;
      }
    }

    if (search && search.trim()) {
      const qRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: qRegex },
        { name: qRegex },
        { model: qRegex },
        { sku: qRegex },
        { brand: qRegex },
        { category: qRegex },
        { subCategory: qRegex },
        { 'sub category': qRegex },
        { desc: qRegex }
      ];
    }

    let docs = await collection.find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();

    // If database is completely empty and no filters applied, seed with formatted initial products
    if (docs.length === 0 && Object.keys(query).length === 0) {
      const defaultDocs = INITIAL_PRODUCTS.map((p, idx) => {
        let assignedCompany = 'rajbiosis';
        if (idx % 3 === 1) assignedCompany = 'human_bio';
        if (idx % 3 === 2) assignedCompany = 'global_bio';
        return normalizeProduct({ ...p, companyId: assignedCompany });
      });

      if (defaultDocs.length > 0) {
        try {
          await collection.insertMany(defaultDocs);
          docs = defaultDocs;
        } catch (e) {
          docs = defaultDocs;
        }
      }
    }

    const normalized = docs.map(normalizeProduct);

    return NextResponse.json({
      success: true,
      count: normalized.length,
      products: normalized
    });
  } catch (error) {
    console.warn('MongoDB products fallback:', error);

    // Fallback in-memory
    const normalized = INITIAL_PRODUCTS.map((p, idx) => {
      let assignedCompany = 'rajbiosis';
      if (idx % 3 === 1) assignedCompany = 'human_bio';
      if (idx % 3 === 2) assignedCompany = 'global_bio';
      return normalizeProduct({ ...p, companyId: assignedCompany });
    });

    return NextResponse.json({
      success: true,
      count: normalized.length,
      products: normalized,
      fallback: true,
      error: error.message
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const collection = db.collection('products');

    // Batch insertion from Excel or multi-file upload
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: true, count: 0, message: 'Empty list received' });
      }

      const normalizedList = body.map(item => {
        const itemObj = normalizeProduct(item);
        delete itemObj._id; // Let Mongo generate ID or handle gracefully
        return itemObj;
      });

      const result = await collection.insertMany(normalizedList);
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.insertedCount} products into MongoDB`,
        insertedCount: result.insertedCount
      });
    }

    // Single product creation
    const newProduct = normalizeProduct(body);
    delete newProduct._id;
    newProduct.createdAt = new Date().toISOString();
    newProduct.updatedAt = new Date().toISOString();

    const result = await collection.insertOne(newProduct);
    newProduct._id = result.insertedId.toString();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully in MongoDB',
      product: newProduct
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const productId = body.id || body._id;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('products');

    let query = { id: productId };
    if (ObjectId.isValid(productId)) {
      query = { $or: [{ _id: new ObjectId(productId) }, { id: productId }] };
    }

    // 1. Dedicated Website-Level Visibility Toggle
    if (body.targetWebsite && body.isVisibleOnWebsite !== undefined) {
      const { targetWebsite, isVisibleOnWebsite } = body;
      const mongoUpdate = {
        $set: {
          updatedAt: new Date().toISOString(),
          [`websiteVisibility.${targetWebsite}`]: isVisibleOnWebsite
        }
      };

      if (isVisibleOnWebsite) {
        // Making visible: remove from hiddenWebsites
        mongoUpdate.$pull = { hiddenWebsites: targetWebsite };
      } else {
        // Hiding: add to hiddenWebsites
        mongoUpdate.$addToSet = { hiddenWebsites: targetWebsite };
      }

      const result = await collection.updateOne(query, mongoUpdate);
      return NextResponse.json({
        success: true,
        message: `Product visibility for "${targetWebsite}" set to ${isVisibleOnWebsite ? 'Visible' : 'Hidden'}`,
        modifiedCount: result.modifiedCount
      });
    }

    // 2. Bulk Website Actions (Show on all / Hide from all)
    if (body.bulkWebsitesAction === 'show_all') {
      const result = await collection.updateOne(query, {
        $set: {
          hiddenWebsites: [],
          websiteVisibility: {},
          assignedWebsites: ['all'],
          isVisible: true,
          updatedAt: new Date().toISOString()
        }
      });
      return NextResponse.json({
        success: true,
        message: 'Product set to Live across all websites',
        modifiedCount: result.modifiedCount
      });
    }

    if (body.bulkWebsitesAction === 'hide_all') {
      const result = await collection.updateOne(query, {
        $set: {
          isVisible: false,
          updatedAt: new Date().toISOString()
        }
      });
      return NextResponse.json({
        success: true,
        message: 'Product hidden from all websites',
        modifiedCount: result.modifiedCount
      });
    }

    // 3. Standard update for general edits
    const updateData = { ...body };
    delete updateData._id; // Do not overwrite Mongo's _id
    updateData.updatedAt = new Date().toISOString();

    const result = await collection.updateOne(query, { $set: updateData });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully in MongoDB',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('_id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('products');

    let query = { id: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
    }

    const result = await collection.deleteOne(query);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully from MongoDB',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
