import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';

const INITIAL_CAMPAIGNS = [
  {
    id: 'CAMP-892101',
    company: 'Raj Biosis Private Limited',
    companyId: 'rajbiosis',
    subject: 'Official Quotation Follow-up & Priority Hospital Allocation',
    audience: '42 Hot Quotation Leads',
    sentAt: 'Today, 11:20 AM',
    openRate: '78.5%',
    status: 'Delivered',
    recipients: 42
  },
  {
    id: 'CAMP-783419',
    company: 'Human Biomedicals',
    companyId: 'human',
    subject: 'Annual Maintenance (AMC) & Biomedical Calibration Notice',
    audience: 'Radiology Chains & Diagnostic Centers',
    sentAt: 'Yesterday, 04:15 PM',
    openRate: '64.2%',
    status: 'Delivered',
    recipients: 110
  },
  {
    id: 'CAMP-654920',
    company: 'Global Biomedical',
    companyId: 'global',
    subject: 'Institutional Subsidy Scheme: Up to 18% Concession',
    audience: 'All Hospitals Network (2,840)',
    sentAt: '14 Oct 2026',
    openRate: '59.8%',
    status: 'Delivered',
    recipients: 2840
  },
  {
    id: 'CAMP-542109',
    company: 'Raj Biosis Private Limited',
    companyId: 'rajbiosis',
    subject: 'Announcing Direct OEM Procurement Portals: Digital Expansion',
    audience: '1,420 Network Procurement Heads',
    sentAt: '12 Oct 2026',
    openRate: '71.0%',
    status: 'Delivered',
    recipients: 1420
  }
];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('campaigns');
    let campaigns = await collection.find({}).sort({ _id: -1 }).toArray();

    if (!campaigns || campaigns.length === 0) {
      await collection.insertMany(INITIAL_CAMPAIGNS);
      campaigns = INITIAL_CAMPAIGNS;
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      isDbConnected: true,
      count: campaigns.length,
      campaigns
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      source: 'fallback',
      isDbConnected: false,
      error: err.message,
      count: INITIAL_CAMPAIGNS.length,
      campaigns: INITIAL_CAMPAIGNS
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const collection = db.collection('campaigns');

    const newCampaign = {
      ...body,
      createdAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newCampaign);
    return NextResponse.json({
      success: true,
      source: 'mongodb',
      campaign: { ...newCampaign, _id: result.insertedId }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
