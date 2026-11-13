const fs = require('fs');

console.log('--- 1. Updating MultiTaskingAdmin /api/leads/route.js ---');
const adminRoutePath = 'src/app/api/leads/route.js';
let adminRouteContent = fs.readFileSync(adminRoutePath, 'utf8');

const targetAdminPut = `    const foundIdx = currentList.findIndex(l => (id && l.id === id) || (_id && (l._id === _id || String(l._id) === String(_id))));
    if (foundIdx >= 0) {
      currentList[foundIdx] = {
        ...currentList[foundIdx],
        ...fieldsToUpdate,
        updatedAt: new Date().toISOString()
      };
      writeLocalLeads(currentList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      let query = {};
      if (_id && id) {
        try {
          const { ObjectId } = await import('mongodb');
          query = { $or: [{ _id: new ObjectId(_id) }, { id: id }] };
        } catch (e) {
          query = { $or: [{ _id: _id }, { id: id }] };
        }
      } else if (_id) {
        try {
          const { ObjectId } = await import('mongodb');
          query = { _id: new ObjectId(_id) };
        } catch (e) {
          query = { _id: _id };
        }
      } else if (id) {
        query = { id };
      }
      await collection.updateOne(query, {
        $set: {
          ...fieldsToUpdate,
          updatedAt: new Date().toISOString()
        }
      });`;

const newAdminPut = `    const quoteNum = body.quoteNumber || body.rawLeadData?.quoteNumber;
    const foundIdx = currentList.findIndex(l => 
      (id && l.id === id) || 
      (_id && (l._id === _id || String(l._id) === String(_id))) ||
      (quoteNum && (l.quoteNumber === quoteNum || l.rawLeadData?.quoteNumber === quoteNum || l.id === quoteNum))
    );
    if (foundIdx >= 0) {
      currentList[foundIdx] = {
        ...currentList[foundIdx],
        ...fieldsToUpdate,
        rawLeadData: {
          ...(currentList[foundIdx].rawLeadData || {}),
          ...fieldsToUpdate
        },
        updatedAt: new Date().toISOString()
      };
      writeLocalLeads(currentList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const orConditions = [];
      if (_id) {
        try {
          const { ObjectId } = await import('mongodb');
          orConditions.push({ _id: new ObjectId(_id) });
        } catch (e) {
          orConditions.push({ _id: _id });
        }
      }
      if (id) {
        orConditions.push({ id });
        orConditions.push({ 'rawLeadData.id': id });
        orConditions.push({ 'rawLeadData.quoteNumber': id });
        orConditions.push({ quoteNumber: id });
      }
      if (quoteNum) {
        orConditions.push({ quoteNumber: quoteNum });
        orConditions.push({ 'rawLeadData.quoteNumber': quoteNum });
      }
      const query = orConditions.length > 0 ? { $or: orConditions } : { id };

      const updatePayload = {
        ...fieldsToUpdate,
        ...(fieldsToUpdate.status ? { 'rawLeadData.status': fieldsToUpdate.status } : {}),
        ...(fieldsToUpdate.quotationRef ? { 'rawLeadData.quotationRef': fieldsToUpdate.quotationRef } : {}),
        ...(fieldsToUpdate.isQuotationCreated ? { 'rawLeadData.isQuotationCreated': true } : {}),
        updatedAt: new Date().toISOString()
      };

      await collection.updateOne(query, {
        $set: updatePayload
      });`;

const normAdminRoute = adminRouteContent.replace(/\r\n/g, '\n');
const normTargetAdminPut = targetAdminPut.replace(/\r\n/g, '\n');

if (normAdminRoute.includes(normTargetAdminPut)) {
  fs.writeFileSync(adminRoutePath, normAdminRoute.replace(normTargetAdminPut, newAdminPut.replace(/\r\n/g, '\n')), 'utf8');
  console.log('Admin leads PUT route updated successfully!');
} else {
  console.warn('targetAdminPut not matched');
}

console.log('--- 2. Adding PUT method to rajbiosis.com /api/leads/route.js ---');
const rajbiosisLeadRoutePath = 'c:/Users/Admin/Documents/GitHub/rajbiosis.com/src/app/api/leads/route.js';
let rajbiosisLeadRoute = fs.readFileSync(rajbiosisLeadRoutePath, 'utf8').replace(/\r\n/g, '\n');

const putMethodForRajbiosis = `
export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id || body._id;
    const quoteNum = body.quoteNumber || body.rawLeadData?.quoteNumber;
    if (!id && !quoteNum) {
      return NextResponse.json({ success: false, error: 'Lead ID or Quote Number required' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('leads');
    const now = new Date().toISOString();

    const { _id, id: leadId, ...fieldsToUpdate } = body;

    const orConditions = [];
    if (_id) {
      try {
        const { ObjectId } = await import('mongodb');
        orConditions.push({ _id: new ObjectId(_id) });
      } catch (e) {
        orConditions.push({ _id: _id });
      }
    }
    if (id) {
      orConditions.push({ id });
      orConditions.push({ 'rawLeadData.id': id });
      orConditions.push({ 'rawLeadData.quoteNumber': id });
      orConditions.push({ quoteNumber: id });
    }
    if (quoteNum) {
      orConditions.push({ quoteNumber: quoteNum });
      orConditions.push({ 'rawLeadData.quoteNumber': quoteNum });
    }

    const query = orConditions.length > 0 ? { $or: orConditions } : { id };

    const updatePayload = {
      ...fieldsToUpdate,
      ...(fieldsToUpdate.status ? { 'rawLeadData.status': fieldsToUpdate.status } : {}),
      ...(fieldsToUpdate.quotationRef ? { 'rawLeadData.quotationRef': fieldsToUpdate.quotationRef } : {}),
      ...(fieldsToUpdate.isQuotationCreated ? { 'rawLeadData.isQuotationCreated': true } : {}),
      updatedAt: now
    };

    const result = await collection.updateOne(query, { $set: updatePayload });

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
`;

if (!rajbiosisLeadRoute.includes('export async function PUT')) {
  rajbiosisLeadRoute += putMethodForRajbiosis;
  fs.writeFileSync(rajbiosisLeadRoutePath, rajbiosisLeadRoute, 'utf8');
  console.log('Added PUT to rajbiosis.com /api/leads/route.js');
} else {
  console.log('PUT already exists in rajbiosis.com /api/leads/route.js');
}

console.log('--- 3. Updating rajbiosis.com profile/page.jsx to sync inquiries dynamically ---');
const profilePath = 'c:/Users/Admin/Documents/GitHub/rajbiosis.com/src/app/profile/page.jsx';
let profileContent = fs.readFileSync(profilePath, 'utf8').replace(/\r\n/g, '\n');

// 3a. Target normalizedInquiries to add isQuoteCreated
const targetNorm = `    let isConfirmed = false;
    const st = (item.status || '').toLowerCase();
    const stage = (item.lifecycleStage || '').toLowerCase();

    if (
      stage.includes('paid') ||
      stage.includes('transit') ||
      stage.includes('deliver') ||
      st.includes('confirm') ||
      st.includes('paid') ||
      st.includes('dispatch') ||
      st.includes('deliver')
    ) {
      isConfirmed = true;
    }

    return {
      ...item,
      productImage: image,
      isConfirmed,
      quoteNumber: item.quoteNumber || item.id,
      unitPrice: item.unitPrice || 485000,
      grandTotal: item.grandTotal || item.unitPrice || 543200
    };`;

const newNorm = `    let isConfirmed = false;
    const st = (item.status || '').toLowerCase();
    const stage = (item.lifecycleStage || '').toLowerCase();

    if (
      stage.includes('paid') ||
      stage.includes('transit') ||
      stage.includes('deliver') ||
      st.includes('confirm') ||
      st.includes('paid') ||
      st.includes('dispatch') ||
      st.includes('deliver')
    ) {
      isConfirmed = true;
    }

    const isQuoteCreated = Boolean(
      item.isQuotationCreated ||
      item.quotationRef ||
      st.includes('quotation created') ||
      st.includes('quote generated') ||
      st.includes('quote ready') ||
      st.includes('quotation ready')
    );

    return {
      ...item,
      productImage: image,
      isConfirmed,
      isQuoteCreated,
      quoteNumber: item.quotationRef || item.quoteNumber || item.id,
      unitPrice: item.unitPrice || 485000,
      grandTotal: item.grandTotal || item.unitPrice || 543200
    };`;

if (profileContent.includes(targetNorm)) {
  profileContent = profileContent.replace(targetNorm, newNorm);
  console.log('3a. normalizedInquiries updated with isQuoteCreated');
} else {
  console.warn('3a. targetNorm not matched');
}

// 3b. Add live sync useEffect into profile/page.jsx right after customer inquiries load
const targetInquiriesLoad = `    // Load customer inquiries
    let rawInquiries = getUserInquiries();
    if (!rawInquiries || rawInquiries.length === 0) {
      rawInquiries = getDefaultSampleInquiries(storedProfile?.district || 'Jaipur');
    }
    setInquiries(rawInquiries);`;

const newInquiriesLoad = `    // Load customer inquiries
    let rawInquiries = getUserInquiries();
    if (!rawInquiries || rawInquiries.length === 0) {
      rawInquiries = getDefaultSampleInquiries(storedProfile?.district || 'Jaipur');
    }
    setInquiries(rawInquiries);

    // Live sync customer inquiries with MongoDB leads & quotations from Admin
    const syncCustomerInquiriesLive = async () => {
      try {
        const prof = getUserProfile() || {};
        const cleanPhone = (prof.phone || '').replace(/\\D/g, '').slice(-10);
        const cleanEmail = (prof.email || '').trim().toLowerCase();

        const params = new URLSearchParams();
        if (cleanPhone) params.set('phone', cleanPhone);
        if (cleanEmail) params.set('email', cleanEmail);

        const res = await fetch(\`/api/leads?\${params.toString()}\`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !Array.isArray(data.leads)) return;

        const backendLeads = data.leads;

        // Also fetch quotations
        let backendQuotes = [];
        try {
          const qRes = await fetch('/api/quotations');
          if (qRes.ok) {
            const qData = await qRes.json();
            if (qData.success && Array.isArray(qData.quotations)) {
              backendQuotes = qData.quotations;
            }
          }
        } catch (e) {}

        const currentInqs = getUserInquiries();
        let changed = false;

        const updatedInqs = currentInqs.map(item => {
          // Find matching lead in backendLeads
          const matchLead = backendLeads.find(l => {
            if (l.id && (l.id === item.id || l.id === item.quoteNumber)) return true;
            if (l.rawLeadData?.id && (l.rawLeadData.id === item.id || l.rawLeadData.id === item.quoteNumber)) return true;
            if (l.rawLeadData?.quoteNumber && (l.rawLeadData.quoteNumber === item.quoteNumber || l.rawLeadData.quoteNumber === item.id)) return true;
            // Match by equipment name
            const lEq = (l.equipment || l.productName || '').trim().toLowerCase();
            const itEq = (item.productName || item.equipment || '').trim().toLowerCase();
            if (lEq && itEq && (lEq === itEq || lEq.includes(itEq) || itEq.includes(lEq))) return true;
            return false;
          });

          // Find matching quote in backendQuotes
          const matchQuote = backendQuotes.find(q => {
            if (matchLead?.quotationRef && (q.refNo === matchLead.quotationRef || q.id === matchLead.quotationRef)) return true;
            if (item.quotationRef && (q.refNo === item.quotationRef || q.id === item.quotationRef)) return true;
            if (item.id && q.leadId === item.id) return true;
            return false;
          });

          if (!matchLead && !matchQuote) return item;

          const isQuoteCreated = Boolean(
            matchLead?.isQuotationCreated ||
            matchLead?.quotationRef ||
            matchQuote ||
            (matchLead?.status && matchLead.status.toLowerCase().includes('quotation created'))
          );

          const quotationRef = matchLead?.quotationRef || matchQuote?.refNo || item.quotationRef;
          const status = isQuoteCreated ? 'Quotation Created' : (matchLead?.status || item.status);
          const negotiationStatus = matchLead?.negotiationStatus || item.negotiationStatus;
          const approvedPrice = matchLead?.approvedPrice || item.approvedPrice;

          let statusNote = item.statusNote;
          if (isQuoteCreated) {
            statusNote = \`Official Quotation \${quotationRef ? \`(\${quotationRef})\` : ''} has been created & ready by Admin. Click "View Formal Quotation" to review proforma.\`;
          } else if (negotiationStatus === 'approved') {
            statusNote = \`Customer target offer of ₹\${Number(approvedPrice || 0).toLocaleString('en-IN')} approved by Admin. Quotation draft being finalized.\`;
          } else if (matchLead?.statusNote) {
            statusNote = matchLead.statusNote;
          }

          if (
            item.status !== status ||
            item.isQuotationCreated !== isQuoteCreated ||
            item.quotationRef !== quotationRef ||
            item.statusNote !== statusNote ||
            item.negotiationStatus !== negotiationStatus
          ) {
            changed = true;
            return {
              ...item,
              status,
              isQuotationCreated: isQuoteCreated,
              quotationRef: quotationRef || item.quotationRef,
              negotiationStatus,
              approvedPrice,
              statusNote,
              grandTotal: matchQuote?.grandTotal || (approvedPrice ? Math.round(Number(approvedPrice) * 1.12) : item.grandTotal)
            };
          }
          return item;
        });

        if (changed) {
          try {
            localStorage.setItem('rajbiosis_enquiries', JSON.stringify(updatedInqs));
          } catch (e) {}
          setInquiries(updatedInqs);
        }
      } catch (err) {
        console.warn('Sync customer inquiries error:', err);
      }
    };

    syncCustomerInquiriesLive();
    const liveSyncTimer = setInterval(syncCustomerInquiriesLive, 4000);`;

if (profileContent.includes(targetInquiriesLoad)) {
  profileContent = profileContent.replace(targetInquiriesLoad, newInquiriesLoad);
  console.log('3b. Added live sync function to profile/page.jsx');
} else {
  console.warn('3b. targetInquiriesLoad not matched');
}

// 3c. Update UI status badge and status note in card rendering
const targetCardStatusBadge = `                            {/* Status Badge & Quoted Price */}
                            <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                              <div>
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    <span>Confirmed &amp; In Process</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock size={12} className="text-amber-600" />
                                    <span>Pending Approval</span>
                                  </span>
                                )}
                              </div>`;

const newCardStatusBadge = `                            {/* Status Badge & Quoted Price */}
                            <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                              <div>
                                {item.isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    <span>Confirmed &amp; In Process</span>
                                  </span>
                                ) : item.isQuoteCreated ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                    <CheckCircle2 size={13} className="text-emerald-700" />
                                    <span>Quotation Created &amp; Ready</span>
                                  </span>
                                ) : (item.negotiationStatus === 'approved' || (item.status || '').toLowerCase().includes('approved')) ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
                                    <CheckCircle2 size={12} className="text-sky-600" />
                                    <span>Price Approved</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock size={12} className="text-amber-600" />
                                    <span>Pending Approval</span>
                                  </span>
                                )}
                              </div>`;

if (profileContent.includes(targetCardStatusBadge)) {
  profileContent = profileContent.replace(targetCardStatusBadge, newCardStatusBadge);
  console.log('3c. Updated status badge rendering in profile/page.jsx');
} else {
  console.warn('3c. targetCardStatusBadge not matched');
}

// 3d. Update card status note styling and message
const targetCardStatusNote = `                          {/* Concise Status Note */}
                          <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2">
                            {isConfirmed ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={13} className="text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">
                              {item.statusNote ||
                                (isConfirmed
                                  ? 'Quotation confirmed. Equipment allocated in regional dispatch depot.'
                                  : 'Official quotation generated. Under hospital purchase committee review.')}
                            </span>
                          </div>`;

const newCardStatusNote = `                          {/* Concise Status Note */}
                          <div className={\`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 \${
                            item.isConfirmed || item.isQuoteCreated
                              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-slate-50/90 border-slate-200/70 text-slate-600'
                          }\`}>
                            {item.isConfirmed || item.isQuoteCreated ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={13} className="text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">
                              {item.statusNote ||
                                (item.isConfirmed
                                  ? 'Quotation confirmed. Equipment allocated in regional dispatch depot.'
                                  : item.isQuoteCreated
                                    ? \`Official Quotation \${item.quotationRef ? \`(\${item.quotationRef})\` : ''} has been created & ready by Admin. Click "View Formal Quotation" to review proforma.\`
                                    : 'Official quotation generated. Under hospital purchase committee review.')}
                            </span>
                          </div>`;

if (profileContent.includes(targetCardStatusNote)) {
  profileContent = profileContent.replace(targetCardStatusNote, newCardStatusNote);
  console.log('3d. Updated status note rendering in profile/page.jsx');
} else {
  console.warn('3d. targetCardStatusNote not matched');
}

// 3e. Update quote reference display to highlight quotationRef
const targetQuoteRef = `                                  <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                                    <span>Quote:</span>
                                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                                      {item.quoteNumber || item.id}
                                    </span>`;

const newQuoteRef = `                                  <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                                    <span>Quote:</span>
                                    <span className={\`font-mono font-bold px-1.5 py-0.5 rounded border text-[11px] \${
                                      item.quotationRef
                                        ? 'text-emerald-900 bg-emerald-50 border-emerald-300 font-black'
                                        : 'text-slate-800 bg-slate-100 border-slate-200'
                                    }\`}>
                                      {item.quotationRef || item.quoteNumber || item.id}
                                    </span>`;

if (profileContent.includes(targetQuoteRef)) {
  profileContent = profileContent.replace(targetQuoteRef, newQuoteRef);
  console.log('3e. Updated quote reference display in profile/page.jsx');
} else {
  console.warn('3e. targetQuoteRef not matched');
}

fs.writeFileSync(profilePath, profileContent, 'utf8');
console.log('Finished updating profile/page.jsx successfully!');

