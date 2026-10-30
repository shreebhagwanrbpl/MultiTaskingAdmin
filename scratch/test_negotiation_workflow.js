const http = require('http');

async function postJson(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const bodyStr = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    };
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, text: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, text: responseBody });
        }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('--- Step 1: Submitting Negotiable Price RFQ from Website ---');
  const testLeadId = 'lead-neg-test-' + Date.now();
  const rfqLead = {
    id: testLeadId,
    doctorName: 'Dr. Vikramaditya Sharma, MD',
    hospital: 'Fortis Escorts Hospital',
    city: 'Jaipur, Rajasthan',
    address: 'Jawaharlal Nehru Marg, Jaipur',
    email: 'v.sharma@fortishealthcare.com',
    phone: '+91 99887 76655',
    equipment: 'SonoVision Ultra-4D Color Doppler Ultrasound Scanner',
    productName: 'SonoVision Ultra-4D Color Doppler Ultrasound Scanner',
    productSku: 'RAJ-RAD-4DU',
    price: 750000,
    actualPrice: 890000,
    expectedPrice: 750000,
    actualTotal: 890000,
    isPriceNegotiated: true,
    negotiationStatus: 'pending_approval',
    approvedPrice: null,
    adminCounterPrice: null,
    adminNote: null,
    quoteAmount: '₹7,50,000',
    estimatedValue: 750000,
    sourceDomain: 'rajbiosis.com',
    siteDomain: 'rajbiosis.com',
    brandName: 'Raj Biosis',
    status: 'Pending Price Approval',
    isProfileComplete: true,
    quantity: '1 Unit'
  };

  const postRes = await postJson('http://localhost:3002/api/leads', rfqLead);
  console.log('POST /api/leads status:', postRes.status, 'Success:', postRes.data.success);
  if (!postRes.data.success) {
    throw new Error('Failed to create test lead');
  }

  console.log('\n--- Step 2: Fetching Leads to verify Pending Approval state ---');
  const fetchRes = await getJson('http://localhost:3002/api/leads');
  const foundLead = fetchRes.data.leads.find(l => l.id === testLeadId);
  console.log('Found Lead:', {
    id: foundLead.id,
    actualPrice: foundLead.actualPrice,
    expectedPrice: foundLead.expectedPrice,
    isPriceNegotiated: foundLead.isPriceNegotiated,
    negotiationStatus: foundLead.negotiationStatus
  });

  if (foundLead.negotiationStatus !== 'pending_approval') {
    throw new Error('Expected negotiationStatus to be pending_approval');
  }

  console.log('\n--- Step 3: Admin Proposes In-Between Counter Offer (₹8,10,000) ---');
  const counterUpdate = {
    id: testLeadId,
    isPriceNegotiated: true,
    negotiationStatus: 'counter_offered',
    adminCounterPrice: 810000,
    price: 810000,
    quoteAmount: '₹8,10,000',
    adminNote: 'Hospital institutional pricing with 2-Year OEM Comprehensive Warranty included.',
    approvedBy: 'Bhupender Raj (Admin)',
    status: 'Counter Offered'
  };

  const putRes = await postJson('http://localhost:3002/api/leads', counterUpdate, 'PUT');
  console.log('PUT /api/leads status:', putRes.status, 'Success:', putRes.data.success);

  console.log('\n--- Step 4: Verify Counter-Offer Updated in DB ---');
  const fetchRes2 = await getJson('http://localhost:3002/api/leads');
  const updatedLead = fetchRes2.data.leads.find(l => l.id === testLeadId);
  console.log('Updated Lead after Counter Offer:', {
    id: updatedLead.id,
    negotiationStatus: updatedLead.negotiationStatus,
    adminCounterPrice: updatedLead.adminCounterPrice,
    adminNote: updatedLead.adminNote,
    status: updatedLead.status
  });

  if (updatedLead.negotiationStatus !== 'counter_offered' || updatedLead.adminCounterPrice !== 810000) {
    throw new Error('Failed to verify counter-offered state');
  }

  console.log('\n--- Step 5: Admin Approves the Customer Expected Price Directly ---');
  const approveUpdate = {
    id: testLeadId,
    isPriceNegotiated: true,
    negotiationStatus: 'approved',
    approvedPrice: 750000,
    price: 750000,
    quoteAmount: '₹7,50,000',
    adminNote: 'Customer institutional price approved by Admin.',
    approvedBy: 'Bhupender Raj (Admin)',
    status: 'Price Approved'
  };

  const putRes2 = await postJson('http://localhost:3002/api/leads', approveUpdate, 'PUT');
  console.log('PUT /api/leads approve status:', putRes2.status, 'Success:', putRes2.data.success);

  const fetchRes3 = await getJson('http://localhost:3002/api/leads');
  const approvedLead = fetchRes3.data.leads.find(l => l.id === testLeadId);
  console.log('Lead after Final Approval:', {
    id: approvedLead.id,
    negotiationStatus: approvedLead.negotiationStatus,
    approvedPrice: approvedLead.approvedPrice,
    status: approvedLead.status
  });

  if (approvedLead.negotiationStatus !== 'approved' || approvedLead.approvedPrice !== 750000) {
    throw new Error('Failed to verify approved state');
  }

  console.log('\n--- Step 6: Cleaning up test lead ---');
  await postJson(`http://localhost:3002/api/leads?id=${testLeadId}`, {}, 'DELETE');
  console.log('Cleaned up test lead successfully.');

  console.log('\n🎉 ALL NEGOTIATION WORKFLOW TESTS PASSED PERFECTLY!');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});

