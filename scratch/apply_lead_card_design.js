const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF for consistent replacement
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. In handleMakeQuotationFromLead, handle multi-item items populating and saving
const targetItemsSearch = `    if (lead.items && Array.isArray(lead.items) && lead.items.length > 0) {
      const parsedItems = lead.items.map((it, idx) => ({
        id: \`cart-item-\${idx}-\${Date.now()}\`,
        sr: idx + 1,
        itemCode: it.sku || \`ITEM-\${idx + 1}\`,
        title: it.description || it.name,
        bullets: it.specs || 'CDSCO Medical Device Certified • Complete On-Site Commissioning',
        qty: it.quantity || 1,
        unitLabel: 'No',
        unitPrice: it.rate || it.price || 0
      }));
      setItems(parsedItems);
    } else {
      setItems([leadQuotationItem]);
    }`;

const replacementItemsCode = `    const rawCartList = (
      (Array.isArray(lead.rawLeadData?.cartProducts) && lead.rawLeadData.cartProducts.length > 0) ? lead.rawLeadData.cartProducts :
      (Array.isArray(lead.cartProducts) && lead.cartProducts.length > 0) ? lead.cartProducts :
      (Array.isArray(lead.items) && lead.items.length > 0) ? lead.items :
      (Array.isArray(lead.rawLeadData?.items) && lead.rawLeadData.items.length > 0) ? lead.rawLeadData.items :
      null
    );

    let finalQuotationItems = [leadQuotationItem];

    if (rawCartList && rawCartList.length > 0) {
      finalQuotationItems = rawCartList.map((it, idx) => {
        const itTitle = it.name || it.title || it.productName || it.description || \`Equipment Item \${idx + 1}\`;
        const itSku = it.sku || it.productSku || \`MED-ITEM-\${idx + 1}\`;
        const itQty = parseInt(it.qty || it.quantity || 1, 10) || 1;
        const itPrice = parseFloat(it.price || it.rate || it.unitPrice || 0);

        const matchedCp = catalogProducts.find(cp =>
          (it.id && cp.id === it.id) ||
          (itSku && cp.sku && cp.sku.toLowerCase() === itSku.toLowerCase()) ||
          (cp.name && cp.name.toLowerCase().includes(itTitle.toLowerCase())) ||
          (itTitle && itTitle.toLowerCase().includes((cp.name || '').toLowerCase()))
        );

        let itemBullets = [];
        if (matchedCp?.specs && typeof matchedCp.specs === 'object') {
          itemBullets = Object.entries(matchedCp.specs).slice(0, 4).map(([k, v]) => \`\${k}: \${v}\`);
        } else if (matchedCp?.features && Array.isArray(matchedCp.features)) {
          itemBullets = matchedCp.features.slice(0, 4);
        }
        if (itemBullets.length === 0 && it.warranty) {
          itemBullets.push(it.warranty);
        }
        if (itemBullets.length === 0) {
          itemBullets = [
            'CDSCO Medical Device Rules 2017 & ISO 13485:2016 Certified Direct OEM Unit',
            'Complete unboxing, hospital electrical grounding & on-site clinical commissioning',
            'Includes Comprehensive OEM Warranty & 24/7 on-call engineering breakdown response'
          ];
        }

        return {
          id: \`cart-item-\${idx}-\${Date.now()}\`,
          sr: idx + 1,
          itemCode: itSku,
          title: itTitle,
          bullets: itemBullets.join('\\n'),
          qty: itQty,
          unitLabel: 'No',
          unitPrice: itPrice
        };
      });

      setItems(finalQuotationItems);
    } else {
      setItems([leadQuotationItem]);
    }`;

if (norm.includes(targetItemsSearch)) {
  norm = norm.replace(targetItemsSearch, replacementItemsCode);
  console.log('Successfully updated items mapping in handleMakeQuotationFromLead');
} else {
  console.log('Warning: targetItemsSearch not found in normalized content');
}

// Update newQuotationRecord in handleMakeQuotationFromLead
const targetRecordSearch = `    // Save official quotation to /api/quotations
    const newQuotationRecord = {
      refNo: freshRef,
      leadId: lead.id,
      date: getTodayFormatted(),
      customerName: hospitalName,
      customerAddress1: [doctorPart, phonePart].filter(Boolean).join(', '),
      customerAddress2: [cityPart, emailPart].filter(Boolean).join(' • '),
      subjectLetter: \`Quotation purchase of \${itemTitle}\`,
      subjectQuotation: \`Purchase of \${itemTitle}\${itemCode ? \`, Model: \${itemCode}\` : ''}\`,
      items: [leadQuotationItem],
      totalAmount: unitPrice * rawQty,
      status: 'Ready',
      isManualAdminQuotation: true,
      lead
    };`;

const replacementRecordCode = `    // 4b. Multi-item subjects
    const isMultiPortfolio = rawCartList && rawCartList.length > 1;
    const computedSubjectLetter = isMultiPortfolio
      ? \`Quotation for Portfolio of \${rawCartList.length} Medical Equipment Systems\`
      : \`Quotation purchase of \${itemTitle}\`;
    const computedSubjectQuotation = isMultiPortfolio
      ? \`Supply, Installation & Clinical Commissioning of \${rawCartList.length} Medical Diagnostic & OT Systems\`
      : \`Purchase of \${itemTitle}\${itemCode ? \`, Model: \${itemCode}\` : ''}\`;

    setSubjectLetter(computedSubjectLetter);
    setSubjectQuotation(computedSubjectQuotation);

    const totalQuotationAmount = finalQuotationItems.reduce(
      (sum, it) => sum + ((Number(it.unitPrice) || 0) * (Number(it.qty) || 1)),
      0
    );

    // Save official quotation to /api/quotations
    const newQuotationRecord = {
      refNo: freshRef,
      leadId: lead.id,
      date: getTodayFormatted(),
      customerName: finalCustomerName,
      customerAddress1: [doctorPart, phonePart].filter(Boolean).join(', '),
      customerAddress2: [cityPart, emailPart].filter(Boolean).join(' • '),
      subjectLetter: computedSubjectLetter,
      subjectQuotation: computedSubjectQuotation,
      items: finalQuotationItems,
      totalAmount: totalQuotationAmount,
      status: 'Ready',
      isManualAdminQuotation: true,
      lead
    };`;

if (norm.includes(targetRecordSearch)) {
  norm = norm.replace(targetRecordSearch, replacementRecordCode);
  console.log('Successfully updated newQuotationRecord in handleMakeQuotationFromLead');
} else {
  console.log('Warning: targetRecordSearch not found in normalized content');
}

// 2. Define LeadInquiryCard helper component
const leadInquiryCardComponent = `
// ============================================================================
// CLEAN 2-COLUMN LEAD INQUIRY CARD: LEFT (CUSTOMER DETAILS) | RIGHT (PRODUCTS)
// ============================================================================
const LeadInquiryCard = ({
  lead,
  idx,
  isAdmin,
  getMatchedCustomer,
  cleanLeadHospital,
  getLeadProducts,
  isLeadNegotiablePending,
  handleRequestAdminApproval,
  openNegotiationModal,
  handleMakeQuotationFromLead,
  handleDeleteWebLead
}) => {
  const matchedCustomer = getMatchedCustomer(lead);
  const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
  const displayHospital = cleanLeadHospital(rawHosp);
  const displayContact = matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'NA';
  const displayPhone = matchedCustomer?.phone || lead.phone || 'NA';
  const displayEmail = matchedCustomer?.email || lead.email || 'NA';
  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'NA';
  const leadProducts = getLeadProducts(lead);
  const isMulti = leadProducts.length > 1 || lead.equipment?.toLowerCase().includes('bulk') || lead.rawLeadData?.isMultiItem;

  const displayTotal = lead.quoteAmount
    ? (String(lead.quoteAmount).startsWith('₹') ? lead.quoteAmount : \`₹\${lead.quoteAmount}\`)
    : \`₹\${leadProducts.reduce((sum, p) => sum + (Number(p.price || p.unitPrice || 0) * Number(p.qty || 1)), 0).toLocaleString('en-IN')}\`;

  return (
    <div
      key={lead.id || lead._id || idx}
      className="rounded-2xl transition-all duration-200 bg-white border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col group"
    >
      {/* Accent Strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500" />

      {/* Top Header Row */}
      <div className="pl-5 pr-4 py-3 bg-gradient-to-r from-slate-50 via-amber-50/20 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm sm:text-base tracking-tight">
            <Building2 size={16} className="text-amber-600 shrink-0" />
            <span>{displayHospital}</span>
          </div>

          {lead.siteDomain && (
            <span className="text-[11px] bg-white text-slate-600 font-mono px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold shadow-2xs">
              <span>🌐</span>
              <span>{lead.siteDomain}</span>
            </span>
          )}

          <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <Clock size={11} className="text-slate-400" />
            <span>
              {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (lead.date || 'Just now'))}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isMulti ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-sky-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Package size={13} className="text-indigo-600" />
              <span>Cart Bulk Inquiry ({leadProducts.length} Items)</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>New RFQ</span>
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Split: Left (Customer Details) | Right (Products List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 pl-2">
        {/* LEFT COLUMN: Customer Details (lg:col-span-5) */}
        <div className="p-4 sm:p-5 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100 lg:col-span-5 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
            <User size={12} className="text-slate-400" />
            <span>Customer Details</span>
          </div>

          <div className="space-y-2">
            {/* Customer Name */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <User size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Customer Name</div>
                <div className="text-xs font-bold text-slate-900 truncate" title={displayContact}>{displayContact}</div>
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Mobile Number</div>
                <div className="text-xs font-mono font-bold text-slate-800 truncate">{displayPhone || 'NA'}</div>
              </div>
            </div>

            {/* Official Email */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Email Address</div>
                <div className="text-xs font-medium text-slate-700 truncate" title={displayEmail}>{displayEmail || 'NA'}</div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Location</div>
                <div className="text-xs font-semibold text-slate-800 truncate" title={displayLocation}>{displayLocation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Products In Inquiry (lg:col-span-7) */}
        <div className="p-4 sm:p-5 lg:col-span-7 flex flex-col justify-between bg-white space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package size={12} className="text-indigo-500" />
                <span>Requested Equipment ({leadProducts.length} {leadProducts.length > 1 ? 'Items' : 'Item'})</span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                Total: <span className="font-black font-mono">{displayTotal}</span>
              </div>
            </div>

            {/* Products List */}
            <div className="mt-2.5 space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {leadProducts.map((p, pIdx) => {
                const pQty = p.qty || p.quantity || 1;
                const pPrice = Number(p.price || p.rate || p.unitPrice || 0);
                const pTotal = pPrice * pQty;

                return (
                  <div
                    key={p.id || p.sku || pIdx}
                    className="bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl p-3 border border-slate-200/70 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="font-bold text-slate-900 line-clamp-1 text-xs" title={p.name || p.title || p.productName}>
                        <span className="text-indigo-600 font-mono font-bold mr-1.5">#{pIdx + 1}</span>
                        <span>{p.name || p.title || p.productName || 'Equipment Item'}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 font-mono">
                        {p.sku && (
                          <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                            {p.sku}
                          </span>
                        )}
                        {p.brand && <span className="text-slate-400">• {p.brand}</span>}
                        {p.warranty && <span className="text-slate-400 hidden sm:inline">• {p.warranty}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-slate-900 text-xs">
                        ₹{pTotal > 0 ? pTotal.toLocaleString('en-IN') : pPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {pQty > 1 ? \`\${pQty} × ₹\${pPrice.toLocaleString('en-IN')}\` : \`Qty: \${pQty}\`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER BAR: WhatsApp, Status / Bids & MAKE QUOTATION Button */}
      <div className="pl-5 pr-4 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {displayPhone && (
            <a
              href={\`https://wa.me/91\${(displayPhone || '').replace(/\\D/g, '').slice(-10)}\`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-2xs"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Chat</span>
            </a>
          )}

          {/* Pricing / Negotiation Badges */}
          {lead.isPriceNegotiated || lead.expectedPrice ? (
            lead.negotiationStatus === 'approved' ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            ) : lead.negotiationStatus === 'counter_offered' ? (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                <span>🤝</span>
                <span>Counter: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                <Tag size={13} className="text-amber-600" />
                <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            )
          ) : null}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => handleDeleteWebLead(lead, e)}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200"
            title="Permanently Delete Lead"
          >
            <Trash2 size={15} />
          </button>

          {/* Edit negotiation price button if admin */}
          {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
            <button
              type="button"
              onClick={() => openNegotiationModal(lead)}
              className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-slate-200"
              title="Adjust approved price or counter offer"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* Prominent MAKE QUOTATION Button */}
          {isLeadNegotiablePending(lead) ? (
            !isAdmin ? (
              <button
                type="button"
                onClick={() => handleRequestAdminApproval(lead)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/30 uppercase tracking-wide"
                title="Customer submitted target discount request. Admin price authorization required."
              >
                <Lock size={14} className="text-amber-100" />
                <span>Request Admin Approval</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openNegotiationModal(lead)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse hover:scale-105 active:scale-95 ring-2 ring-rose-400/30 uppercase tracking-wide"
                title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
              >
                <ShieldCheck size={14} className="text-amber-100" />
                <span>Review & Approve Price</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => handleMakeQuotationFromLead(lead)}
              className={\`px-6 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wide \${lead.negotiationStatus === 'approved'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white ring-2 ring-emerald-400/30'
                : lead.negotiationStatus === 'counter_offered'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white ring-2 ring-indigo-400/30'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white ring-2 ring-amber-400/30'
                }\`}
            >
              <Sparkles size={14} className="text-white" />
              <span>
                {lead.negotiationStatus === 'approved'
                  ? \`Make Quotation (Approved: ₹\${Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')})\`
                  : lead.negotiationStatus === 'counter_offered'
                    ? \`Make Quotation (Counter: ₹\${Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')})\`
                    : \`Make Quotation \${leadProducts.length > 1 ? \`(\${leadProducts.length} Items)\` : ''}\`}
              </span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
`;

if (!norm.includes('const LeadInquiryCard =')) {
  norm = norm.replace(
    'export default function WebQuotationManager(',
    `${leadInquiryCardComponent}\n\nexport default function WebQuotationManager(`
  );
  console.log('Injected LeadInquiryCard component definition');
}

// 3. Replace the pendingWebLeads.map inside activeMainTab === 'leads'
const oldTabLoop = `              pendingWebLeads.map((lead, idx) => {
                const matchedCustomer = getMatchedCustomer(lead);
                const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
                const displayHospital = cleanLeadHospital(rawHosp);
                const displayContact = matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'NA';
                const displayPhone = matchedCustomer?.phone || lead.phone || 'NA';
                const displayEmail = matchedCustomer?.email || lead.email || 'NA';
                const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'NA';
                const displayEquipment = lead.equipment || lead.productName || 'Medical Equipment';
                const displayAmount = lead.quoteAmount ? String(lead.quoteAmount).replace(/^₹\\s*/, '') : (lead.price ? Number(lead.price).toLocaleString('en-IN') : '1,50,000');

                return (
                  <div
                    key={lead.id || lead._id || idx}
                    className="rounded-2xl transition-all duration-200 bg-white border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-md p-4 sm:p-5 relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500" />

                    <div className="pl-3 sm:pl-4 space-y-3">
                      {/* Top Row: Hospital, Domain & Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition tracking-tight">
                            {displayHospital}
                          </h4>
                          {lead.siteDomain && (
                            <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold">
                              <span>🌐</span>
                              <span>{lead.siteDomain}</span>
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/70">
                            <Clock size={11} className="text-slate-400" />
                            <span>
                              {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (lead.date || 'Just now'))}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>New RFQ</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle: 4 Contact / Location details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <User size={14} className="text-sky-600 shrink-0" />
                          <span className="text-slate-700 font-medium truncate" title={displayContact}>{displayContact}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <Phone size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-slate-800 font-mono font-bold truncate">{displayPhone || 'No phone'}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <Mail size={14} className="text-indigo-600 shrink-0" />
                          <span className="text-slate-600 truncate" title={displayEmail}>{displayEmail || 'No email'}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <MapPin size={14} className="text-amber-600 shrink-0" />
                          <span className="text-slate-700 truncate" title={displayLocation}>{displayLocation}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Hardware Requested & Price Negotiation / MAKE QUOTATION BUTTON */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-bold flex items-center gap-1.5">
                            <Package size={13} className="text-indigo-600" />
                            <span>{displayEquipment}</span>
                          </div>

                          {/* Pricing Display with Real-Time Negotiation Badges */}
                          {lead.isPriceNegotiated || lead.expectedPrice ? (
                            lead.negotiationStatus === 'approved' ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : lead.negotiationStatus === 'counter_offered' ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                  <span>🤝</span>
                                  <span>In-Between: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                                  <Tag size={13} className="text-amber-600" />
                                  <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Approval Pending
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1">
                              <span>₹{displayAmount}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {displayPhone && (
                            <a
                              href={\`https://wa.me/91\${(displayPhone || '').replace(/\\D/g, '').slice(-10)}\`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* ACTION BUTTON: APPROVAL OR MAKE QUOTATION */}
                          {isLeadNegotiablePending(lead) ? (
                            !isAdmin ? (
                              <button
                                type="button"
                                onClick={() => handleRequestAdminApproval(lead)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/30 uppercase tracking-wide"
                                title="Customer submitted target discount request. Admin price authorization required."
                              >
                                <Lock size={14} className="text-amber-100" />
                                <span>Request Admin Approval</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openNegotiationModal(lead)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse hover:scale-105 active:scale-95 ring-2 ring-rose-400/30 uppercase tracking-wide"
                                title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
                              >
                                <ShieldCheck size={14} className="text-amber-100" />
                                <span>Review & Approve Price</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleMakeQuotationFromLead(lead)}
                                className={\`px-5 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wide \${lead.negotiationStatus === 'approved'
                                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white ring-2 ring-emerald-400/30'
                                  : lead.negotiationStatus === 'counter_offered'
                                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white ring-2 ring-indigo-400/30'
                                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white ring-2 ring-amber-400/30'
                                  }\`}
                              >
                                <Sparkles size={14} className="text-white" />
                                <span>
                                  {lead.negotiationStatus === 'approved'
                                    ? \`Make Quotation (Approved: ₹\${Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')})\`
                                    : lead.negotiationStatus === 'counter_offered'
                                      ? \`Make Quotation (Counter: ₹\${Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')})\`
                                      : 'Make Quotation'}
                                </span>
                                <ArrowRight size={13} />
                              </button>
                              {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
                                <button
                                  type="button"
                                  onClick={() => openNegotiationModal(lead)}
                                  className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-slate-200"
                                  title="Adjust approved price or counter offer"
                                >
                                  <Edit3 size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteWebLead(lead, e)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200"
                                title="Permanently Delete Lead"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })`;

const newTabLoop = `              pendingWebLeads.map((lead, idx) => (
                <LeadInquiryCard
                  key={lead.id || lead._id || idx}
                  lead={lead}
                  idx={idx}
                  isAdmin={isAdmin}
                  getMatchedCustomer={getMatchedCustomer}
                  cleanLeadHospital={cleanLeadHospital}
                  getLeadProducts={getLeadProducts}
                  isLeadNegotiablePending={isLeadNegotiablePending}
                  handleRequestAdminApproval={handleRequestAdminApproval}
                  openNegotiationModal={openNegotiationModal}
                  handleMakeQuotationFromLead={handleMakeQuotationFromLead}
                  handleDeleteWebLead={handleDeleteWebLead}
                />
              ))`;

if (norm.includes(oldTabLoop)) {
  norm = norm.replace(oldTabLoop, newTabLoop);
  console.log('Successfully replaced oldTabLoop with LeadInquiryCard');
} else {
  console.log('Warning: oldTabLoop not matched');
}

// 4. Also replace the modal loop
const oldModalLoop = `                pendingWebLeads.map((lead, idx) => {
                  const matchedCustomer = getMatchedCustomer(lead);
                  const complete = isProfileComplete(lead);
                  const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
                  const displayHospital = cleanLeadHospital(rawHosp);
                  const displayContact = matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'NA';
                  const displayPhone = matchedCustomer?.phone || lead.phone || 'NA';
                  const displayEmail = matchedCustomer?.email || lead.email || 'NA';
                  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'NA';

                  return (
                    <div
                      key={lead.id || lead._id || idx}
                      className={\`rounded-2xl transition-all duration-200 bg-white border \${complete
                        ? 'border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300'
                        : 'border-amber-200/90 shadow-sm hover:shadow-md hover:border-amber-300'
                        } relative overflow-hidden group\`}
                    >
                      {/* Left Status Strip */}
                      <div
                        className={\`absolute left-0 top-0 bottom-0 w-1.5 \${complete ? 'bg-emerald-500' : 'bg-gradient-to-b from-amber-400 to-orange-500'
                          }\`}
                      />

                      <div className="p-5 sm:p-6 space-y-4 pl-6 sm:pl-7">
                        {/* Header Row: Hospital Name & Status Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                              {displayHospital}
                            </h4>

                            {lead.siteDomain && (
                              <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold">
                                <span>🌐</span>
                                <span>{lead.siteDomain}</span>
                              </span>
                            )}

                            <span className="text-xs text-slate-500 font-mono font-medium flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                              <Clock size={12} className="text-slate-400" />
                              <span>
                                {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (lead.date || 'Just now'))}
                              </span>
                            </span>
                          </div>

                          <div>
                            {complete ? (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300/80 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Profile Complete</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-300/80 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Profile Incomplete</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info 4-Card Grid (Spacious, Never Overlapping) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Contact Person */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                              <User size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</div>
                              <div className="text-xs font-bold text-slate-900 truncate" title={displayContact}>
                                {displayContact}
                              </div>
                            </div>
                          </div>

                          {/* 2. Mobile Phone */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Phone size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone</div>
                              <div className="text-xs font-mono font-bold text-slate-800 truncate">
                                {displayPhone || <span className="text-slate-400 font-sans italic">Not provided</span>}
                              </div>
                            </div>
                          </div>

                          {/* 3. Official Email */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Mail size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</div>
                              <div className="text-xs font-medium text-slate-700 truncate" title={displayEmail || 'Not provided'}>
                                {displayEmail || <span className="text-slate-400 italic">Not provided</span>}
                              </div>
                            </div>
                          </div>

                          {/* 4. Location */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</div>
                              <div className="text-xs font-semibold text-slate-800 truncate" title={displayLocation}>
                                {displayLocation}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Hardware Requested & Actions */}
                        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-t border-slate-100">
                          {/* Hardware & Price */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="px-3.5 py-2 rounded-xl bg-indigo-50/90 text-indigo-950 border border-indigo-100 text-xs font-bold flex items-center gap-2 shadow-2xs">
                              <span className="text-sm">📦</span>
                              <span>{lead.equipment || lead.productName || 'Requested Hardware'}</span>
                            </div>
                            {lead.isPriceNegotiated || lead.expectedPrice ? (
                              lead.negotiationStatus === 'approved' ? (
                                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              ) : lead.negotiationStatus === 'counter_offered' ? (
                                <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs">
                                  <span>🤝</span>
                                  <span>In-Between: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              ) : (
                                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                                  <Tag size={13} className="text-amber-600" />
                                  <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              )
                            ) : (
                              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 font-mono font-black text-xs flex items-center gap-1 shadow-2xs">
                                <span>₹{lead.quoteAmount ? String(lead.quoteAmount).replace(/^₹\\s*/, '') : (lead.price ? Number(lead.price).toLocaleString('en-IN') : '1,50,000')}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                            {displayPhone && (
                              <a
                                href={\`https://wa.me/91\${(displayPhone || '').replace(/\\D/g, '').slice(-10)}\`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-2xs"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={14} />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            )}

                            {/* Main Action Button */}
                            {isLeadNegotiablePending(lead) ? (
                              !isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsLeadDrawerOpen(false);
                                    handleRequestAdminApproval(lead);
                                  }}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/30 uppercase tracking-wide"
                                  title="Customer submitted target discount request. Admin price authorization required."
                                >
                                  <Lock size={14} className="text-amber-100" />
                                  <span>Request Approval</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsLeadDrawerOpen(false);
                                    openNegotiationModal(lead);
                                  }}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse hover:scale-105 active:scale-95 ring-2 ring-rose-400/30 uppercase tracking-wide"
                                  title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
                                >
                                  <ShieldCheck size={14} className="text-amber-100" />
                                  <span>Review Price</span>
                                </button>
                              )
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsLeadDrawerOpen(false);
                                    handleMakeQuotationFromLead(lead);
                                  }}
                                  className={\`px-5 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wide \${lead.negotiationStatus === 'approved'
                                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white ring-2 ring-emerald-400/30'
                                    : lead.negotiationStatus === 'counter_offered'
                                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white ring-2 ring-indigo-400/30'
                                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white ring-2 ring-amber-400/30'
                                    }\`}
                                >
                                  <Sparkles size={14} className="text-white" />
                                  <span>Make Quotation</span>
                                  <ArrowRight size={13} />
                                </button>
                                {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsLeadDrawerOpen(false);
                                      openNegotiationModal(lead);
                                    }}
                                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-slate-200"
                                    title="Adjust approved price or counter offer"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteWebLead(lead, e)}
                                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200"
                                  title="Permanently Delete Lead"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })`;

const newModalLoop = `                pendingWebLeads.map((lead, idx) => (
                  <LeadInquiryCard
                    key={lead.id || lead._id || idx}
                    lead={lead}
                    idx={idx}
                    isAdmin={isAdmin}
                    getMatchedCustomer={getMatchedCustomer}
                    cleanLeadHospital={cleanLeadHospital}
                    getLeadProducts={getLeadProducts}
                    isLeadNegotiablePending={isLeadNegotiablePending}
                    handleRequestAdminApproval={(l) => {
                      setIsLeadDrawerOpen(false);
                      handleRequestAdminApproval(l);
                    }}
                    openNegotiationModal={(l) => {
                      setIsLeadDrawerOpen(false);
                      openNegotiationModal(l);
                    }}
                    handleMakeQuotationFromLead={(l) => {
                      setIsLeadDrawerOpen(false);
                      handleMakeQuotationFromLead(l);
                    }}
                    handleDeleteWebLead={handleDeleteWebLead}
                  />
                ))`;

if (norm.includes(oldModalLoop)) {
  norm = norm.replace(oldModalLoop, newModalLoop);
  console.log('Successfully replaced oldModalLoop with LeadInquiryCard');
} else {
  console.log('Warning: oldModalLoop not matched');
}

// Convert back to CRLF if file was CRLF originally
const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('All changes written to WebQuotationManager.jsx successfully!');

