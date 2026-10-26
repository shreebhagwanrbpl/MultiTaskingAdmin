import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { PRODUCTS as INITIAL_PRODUCTS } from '../../../data/products';

// Default initial website assignments per company
export const DEFAULT_COMPANY_WEBSITES = {
  rajbiosis: ['rajbiosis.com'],
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

  const priceVal = typeof p.price === 'number' ? p.price : (parseFloat(String(p.price || 0).replace(/[^0-9.]/g, '')) || 0);
  const mrpVal = typeof p.mrp === 'number' ? p.mrp : (parseFloat(String(p.mrp || 0).replace(/[^0-9.]/g, '')) || (priceVal ? Math.round(priceVal * 1.25) : 0));
  const defaultOffer = mrpVal > priceVal && mrpVal > 0 ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 15;
  const offerVal = p.offer !== undefined ? Number(p.offer) : (p.discount !== undefined ? Number(p.discount) : defaultOffer);
  const gstRateVal = p.gstRate !== undefined ? Number(p.gstRate) : 18;
  const hsnCodeVal = p.hsnCode || '9018';
  const skuVal = p.sku || p.model || ('SKU-' + Math.floor(1000 + Math.random() * 9000));
  const qtyVal = typeof p.quantity === 'number' ? p.quantity : (typeof p.stockCount === 'number' ? p.stockCount : (parseInt(p.quantity || p.stockCount || 24, 10) || 24));
  const expiryVal = p.expiryDate || '2028-06-30';
  const batchVal = p.batchNo || ('LOT-' + String(skuVal).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase());

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

    // Product Commercials, Inventory & Expiry
    title: p.title || p.name || 'Untitled Medical Device',
    name: p.name || p.title || 'Untitled Medical Device',
    sku: skuVal,
    price: priceVal,
    mrp: mrpVal,
    offer: offerVal,
    discount: offerVal,
    gstRate: gstRateVal,
    hsnCode: hsnCodeVal,
    quantity: qtyVal,
    stockCount: qtyVal,
    expiryDate: expiryVal,
    batchNo: batchVal,

    // Specifications & Details
    desc: p.desc || p.shortDesc || p.description || '',
    shortDesc: p.shortDesc || p.desc || p.description || '',
    capacity: p.capacity || (p.specs ? p.specs['Tidal Volume Range'] || p.specs['Constant Throughput'] || '' : ''),
    throughput: p.throughput || (p.specs ? p.specs['Constant Throughput'] || '' : ''),
    instrument: p.instrument || (p.specs ? p.specs['Gas Supply'] || p.specs['Electric Actuators'] || '' : ''),
    model: p.model || skuVal,
    usage: p.usage || '',
    brand: p.brand || (companyId === 'rajbiosis' ? 'Raj Biosis' : companyId === 'human_bio' ? 'Human Biomedicals' : 'Global Biomedical'),
    parameters: p.parameters || (p.specs ? p.specs['Ventilation Modes'] || p.specs['Functions'] || '' : ''),
    automation: p.automation || 'Standard Clinical',
    availability: p.availability || p.stockStatus || (qtyVal > 0 ? 'In Stock' : 'Out of Stock'),
    stockStatus: p.stockStatus || p.availability || (qtyVal > 0 ? 'In Stock' : 'Out of Stock'),
    size: p.size || '',
    images: p.images || p.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    image: p.image || p.images || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
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

    // Database empty check: Do not auto-seed dummy products so admin remains clean for user import
    // User will import products with custom categories and subcategories via Excel

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
    const db = await getDatabase();
    const collection = db.collection('products');

    // =========================================================================
    // BULK OPERATION 1: BULK TITLE WORD REMOVAL / REPLACEMENT
    // =========================================================================
    if (body.bulkTitleWordRemove === true && Array.isArray(body.ids) && body.ids.length > 0) {
      const { ids, removeWord, replaceWith = '', matchCase = false } = body;
      if (!removeWord || !removeWord.trim()) {
        return NextResponse.json({ success: false, error: 'Word to remove is required' }, { status: 400 });
      }

      const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      const filter = {
        $or: [
          { id: { $in: ids } },
          { _id: { $in: objectIds } }
        ]
      };

      const targetDocs = await collection.find(filter).toArray();
      let modified = 0;

      for (const doc of targetDocs) {
        const currentTitle = doc.title || doc.name || '';
        const flags = matchCase ? 'g' : 'gi';
        const escaped = removeWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(escaped, flags);
        let newTitle = currentTitle.replace(reg, replaceWith);
        // Clean up double spaces and dangling hyphens
        newTitle = newTitle.replace(/\s+/g, ' ').replace(/^[\s\-_]+|[\s\-_]+$/g, '').trim();

        if (newTitle !== currentTitle && newTitle.length > 0) {
          const docIdQuery = doc._id ? { _id: doc._id } : { id: doc.id };
          await collection.updateOne(docIdQuery, {
            $set: {
              title: newTitle,
              name: newTitle,
              updatedAt: new Date().toISOString()
            }
          });
          modified++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Word "${removeWord}" processed across ${modified} product titles`,
        modifiedCount: modified
      });
    }

    // =========================================================================
    // BULK OPERATION 2: BULK FIELD UPDATE (Rate, GST, HSN, Offer, Stock, Expiry)
    // =========================================================================
    if (body.bulkUpdate === true && Array.isArray(body.ids) && body.ids.length > 0) {
      const { ids, updateData } = body;
      const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      const filter = {
        $or: [
          { id: { $in: ids } },
          { _id: { $in: objectIds } }
        ]
      };

      const cleanUpdate = { ...updateData };
      delete cleanUpdate._id;
      delete cleanUpdate.id;
      cleanUpdate.updatedAt = new Date().toISOString();

      // Normalize numeric fields if provided
      if (cleanUpdate.price !== undefined) cleanUpdate.price = parseFloat(cleanUpdate.price) || 0;
      if (cleanUpdate.mrp !== undefined) cleanUpdate.mrp = parseFloat(cleanUpdate.mrp) || 0;
      if (cleanUpdate.offer !== undefined) cleanUpdate.offer = Number(cleanUpdate.offer);
      if (cleanUpdate.discount !== undefined) cleanUpdate.discount = Number(cleanUpdate.discount);
      if (cleanUpdate.gstRate !== undefined) cleanUpdate.gstRate = Number(cleanUpdate.gstRate);
      if (cleanUpdate.quantity !== undefined) {
        cleanUpdate.quantity = parseInt(cleanUpdate.quantity, 10) || 0;
        cleanUpdate.stockCount = cleanUpdate.quantity;
        if (!cleanUpdate.availability) {
          cleanUpdate.availability = cleanUpdate.quantity > 0 ? 'In Stock' : 'Out of Stock';
        }
      }

      const result = await collection.updateMany(filter, { $set: cleanUpdate });
      return NextResponse.json({
        success: true,
        message: `Bulk updated ${result.modifiedCount} products successfully`,
        modifiedCount: result.modifiedCount
      });
    }

    // =========================================================================
    // SINGLE PRODUCT UPDATE
    // =========================================================================
    const productId = body.id || body._id;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

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
        mongoUpdate.$pull = { hiddenWebsites: targetWebsite };
      } else {
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

    if (updateData.quantity !== undefined) {
      updateData.quantity = parseInt(updateData.quantity, 10) || 0;
      updateData.stockCount = updateData.quantity;
    }
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price) || 0;
    }
    if (updateData.mrp !== undefined) {
      updateData.mrp = parseFloat(updateData.mrp) || 0;
    }

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
    const idsParam = searchParams.get('ids');

    let ids = [];
    if (idsParam) {
      ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    } else if (id) {
      ids = [id];
    } else {
      try {
        const body = await request.json();
        if (Array.isArray(body.ids)) ids = body.ids;
        else if (body.id) ids = [body.id];
      } catch (e) {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Product ID or IDs required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('products');

    const objectIds = ids.filter(x => ObjectId.isValid(x)).map(x => new ObjectId(x));
    const query = {
      $or: [
        { id: { $in: ids } },
        { _id: { $in: objectIds } }
      ]
    };

    const result = await collection.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} product(s) successfully from MongoDB`,
      deletedCount: result.deletedCount
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
