import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

const CARTS_FILE = path.join(process.cwd(), 'src', 'data', 'customer_carts.json');

function readLocalCarts() {
  try {
    if (fs.existsSync(CARTS_FILE)) {
      const content = fs.readFileSync(CARTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read local customer carts:', e.message);
  }
  return global._biomedical_customer_carts && Array.isArray(global._biomedical_customer_carts)
    ? global._biomedical_customer_carts
    : [];
}

function writeLocalCarts(list) {
  global._biomedical_customer_carts = list;
  try {
    const dir = path.dirname(CARTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CARTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write local customer carts:', e.message);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const phone = searchParams.get('phone');

  let localList = readLocalCarts();

  try {
    const db = await getDatabase();
    const collection = db.collection('customer_carts');
    const mongoCarts = await collection.find({}).toArray();

    const map = new Map();
    localList.forEach(c => map.set(c.customerId || c.phone, c));
    mongoCarts.forEach(c => map.set(c.customerId || c.phone, { ...c, _id: String(c._id) }));

    const merged = Array.from(map.values());
    writeLocalCarts(merged);

    if (customerId || phone) {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      const match = merged.find(c => 
        (customerId && (c.customerId === customerId || c.id === customerId)) ||
        (cleanPhone && (c.phone || '').replace(/\D/g, '').includes(cleanPhone))
      );
      return NextResponse.json({
        success: true,
        source: 'mongodb',
        customerCart: match || null
      }, { headers: CORS_HEADERS });
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      count: merged.length,
      carts: merged
    }, { headers: CORS_HEADERS });
  } catch (e) {
    if (customerId || phone) {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      const match = localList.find(c => 
        (customerId && (c.customerId === customerId || c.id === customerId)) ||
        (cleanPhone && (c.phone || '').replace(/\D/g, '').includes(cleanPhone))
      );
      return NextResponse.json({
        success: true,
        source: 'local',
        customerCart: match || null
      }, { headers: CORS_HEADERS });
    }

    return NextResponse.json({
      success: true,
      source: 'local',
      count: localList.length,
      carts: localList
    }, { headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, customerId, phone, customerData, product, productId, quantity = 1, listType = 'cart' } = body;

    let currentList = readLocalCarts();
    const cleanPhone = (phone || customerData?.phone || '').replace(/\D/g, '').slice(-10);

    // Find customer index
    let idx = currentList.findIndex(c => 
      (customerId && (c.customerId === customerId || c.id === customerId)) ||
      (cleanPhone && (c.phone || '').replace(/\D/g, '').includes(cleanPhone))
    );

    // If customer doesn't exist, create customer cart shell
    if (idx === -1) {
      const newEntry = {
        customerId: customerId || `cust-${cleanPhone || Date.now()}`,
        customerName: customerData?.customerName || customerData?.fullName || 'Valued Customer',
        hospitalName: customerData?.hospitalName || 'Medical Center / Clinic',
        phone: cleanPhone || customerData?.phone || '',
        email: customerData?.email || '',
        district: customerData?.district || 'Jaipur',
        address: customerData?.address || '',
        siteDomain: customerData?.siteDomain || 'rajbiosis.com',
        lastActive: 'Just now',
        updatedAt: new Date().toISOString(),
        cart: [],
        watchlist: []
      };
      currentList.unshift(newEntry);
      idx = 0;
    }

    const target = currentList[idx];
    target.updatedAt = new Date().toISOString();
    target.lastActive = 'Just now';

    // Handle distinct actions
    if (action === 'add_to_cart') {
      const existingCartItem = target.cart.find(i => i.productId === product.productId || i.productId === product.id);
      if (existingCartItem) {
        existingCartItem.quantity = (existingCartItem.quantity || 1) + Number(quantity || 1);
      } else {
        target.cart.unshift({
          productId: product.productId || product.id || `prod-${Date.now()}`,
          name: product.name,
          sku: product.sku || 'SKU-BIO',
          brand: product.brand || 'Raj Biosis OEM',
          category: product.category || 'Medical Equipment',
          price: Number(product.price) || 0,
          mrp: Number(product.mrp || product.price * 1.3) || 0,
          image: product.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          quantity: Number(quantity) || 1,
          addedAt: new Date().toISOString(),
          specs: product.specs || product.shortDesc || '',
          sourceSite: product.sourceSite || target.siteDomain || 'rajbiosis.com'
        });
      }
    } else if (action === 'add_to_watchlist') {
      const existing = target.watchlist.find(i => i.productId === product.productId || i.productId === product.id);
      if (!existing) {
        target.watchlist.unshift({
          productId: product.productId || product.id || `prod-${Date.now()}`,
          name: product.name,
          sku: product.sku || 'SKU-BIO',
          brand: product.brand || 'Raj Biosis OEM',
          category: product.category || 'Medical Equipment',
          price: Number(product.price) || 0,
          mrp: Number(product.mrp || product.price * 1.3) || 0,
          image: product.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          stockStatus: product.stockStatus || 'In Stock',
          addedAt: new Date().toISOString(),
          specs: product.specs || product.shortDesc || '',
          sourceSite: product.sourceSite || target.siteDomain || 'rajbiosis.com'
        });
      }
    } else if (action === 'move_to_watchlist') {
      const itemIdx = target.cart.findIndex(i => i.productId === productId);
      if (itemIdx >= 0) {
        const item = target.cart[itemIdx];
        target.cart.splice(itemIdx, 1);
        if (!target.watchlist.some(w => w.productId === item.productId)) {
          target.watchlist.unshift({
            ...item,
            stockStatus: 'In Stock',
            addedAt: new Date().toISOString()
          });
        }
      }
    } else if (action === 'move_to_cart') {
      const itemIdx = target.watchlist.findIndex(i => i.productId === productId);
      if (itemIdx >= 0) {
        const item = target.watchlist[itemIdx];
        target.watchlist.splice(itemIdx, 1);
        const existingInCart = target.cart.find(c => c.productId === item.productId);
        if (existingInCart) {
          existingInCart.quantity = (existingInCart.quantity || 1) + 1;
        } else {
          target.cart.unshift({
            ...item,
            quantity: 1,
            addedAt: new Date().toISOString()
          });
        }
      }
    } else if (action === 'update_qty') {
      const item = target.cart.find(i => i.productId === productId);
      if (item) {
        const newQ = Number(quantity);
        if (newQ <= 0) {
          target.cart = target.cart.filter(i => i.productId !== productId);
        } else {
          item.quantity = newQ;
        }
      }
    } else if (action === 'remove_item') {
      if (listType === 'cart') {
        target.cart = target.cart.filter(i => i.productId !== productId);
      } else {
        target.watchlist = target.watchlist.filter(i => i.productId !== productId);
      }
    } else if (action === 'clear_cart') {
      target.cart = [];
    } else if (action === 'create_and_send_offer' || action === 'apply_offer') {
      const offerData = {
        ...body.offer,
        offerId: body.offer?.offerId || `OFFER-${Date.now().toString().slice(-6)}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentBy: body.sentBy || 'Rajesh (HQ Admin)'
      };
      target.activeOffer = offerData;
      target.offer = offerData; // backwards compatibility
      target.offersHistory = target.offersHistory || [];
      target.offersHistory.unshift(offerData);

      // Record to campaigns audit if sent via email
      if (body.sendEmail && target.email) {
        try {
          const db = await getDatabase();
          const campaignsCol = db.collection('campaigns');
          await campaignsCol.insertOne({
            id: `CAMP-${offerData.offerId}`,
            company: 'Raj Biosis Private Limited',
            companyId: 'rajbiosis',
            subject: `Exclusive Special Offer: ${offerData.title} for ${target.customerName}`,
            audience: `${target.customerName} (${target.hospitalName})`,
            sentAt: 'Just now',
            openRate: 'Delivered',
            status: 'Delivered',
            recipients: 1,
            offerDetails: offerData,
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Campaign email log fallback:', e.message);
        }
      }
    } else if (action === 'revoke_offer' || action === 'remove_offer') {
      target.activeOffer = null;
      target.offer = null;
    } else if (action === 'save_customer') {
      if (customerData) {
        Object.assign(target, customerData);
      }
    }

    currentList[idx] = target;
    writeLocalCarts(currentList);

    // Save to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('customer_carts');
      await collection.updateOne(
        { $or: [{ customerId: target.customerId }, { phone: target.phone }] },
        { $set: target },
        { upsert: true }
      );
    } catch (e) {
      console.warn('MongoDB cart save fallback:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Cart & Watchlist updated successfully',
      customerCart: target
    }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

