const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/preview/[domain]/page.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables for price negotiation
const oldStateTarget = `  const [rfqQuantity, setRfqQuantity] = useState('1 Unit');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);`;

const newState = `  const [rfqQuantity, setRfqQuantity] = useState('1');
  const [rfqExpectedPrice, setRfqExpectedPrice] = useState('');
  const [rfqCustomerNote, setRfqCustomerNote] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);`;

// 2. Update openRfqModal
const oldOpenRfq = `  const openRfqModal = (prod) => {
    setRfqProduct(prod);
    setRfqSuccess(false);
    setRfqModalOpen(true);
  };`;

const newOpenRfq = `  const openRfqModal = (prod) => {
    setRfqProduct(prod);
    setRfqSuccess(false);
    const basePrice = prod?.price || 150000;
    setRfqExpectedPrice(String(basePrice));
    setRfqQuantity('1');
    setRfqCustomerNote('');
    setRfqModalOpen(true);
  };`;

// 3. Update handleRfqSubmit calculation and payloads
const oldSubmitStart = `    const leadPrice = rfqProduct?.price || 150000;
    const numQty = parseInt(String(rfqQuantity || '1').replace(/\\D/g, ''), 10) || 1;
    const itemTotal = leadPrice * numQty;`;

const newSubmitStart = `    const catalogUnitPrice = rfqProduct?.price || 150000;
    const numQty = parseInt(String(rfqQuantity || '1').replace(/\\D/g, ''), 10) || 1;
    const parsedOfferPrice = parseFloat(String(rfqExpectedPrice || '').replace(/[^0-9.]/g, '')) || catalogUnitPrice;
    const isPriceNegotiated = parsedOfferPrice < catalogUnitPrice;
    const itemTotal = parsedOfferPrice * numQty;
    const actualTotal = catalogUnitPrice * numQty;
    const leadPrice = parsedOfferPrice;`;

// 4. Update quotationPayload and leadPayload
const oldLeadPayloadPattern = /const leadPayload = \{[\s\S]*?date: 'Just now'\s*\};/;

const newLeadPayloadCode = `const leadPayload = {
      id: leadId,
      doctorName: docName,
      hospital: hospName,
      city: cityName,
      address: cityName,
      email: rfqEmail || 'doctor@hospital.org',
      phone: rfqPhone || '+91 98000 00000',
      equipment: prodTitle,
      productName: prodTitle,
      productSku: prodSku,
      productId: rfqProduct?.id || null,
      productImage: rfqProduct?.image || null,
      specs: rfqProduct?.specs || null,
      features: rfqProduct?.features || null,
      price: parsedOfferPrice,
      actualPrice: catalogUnitPrice,
      expectedPrice: parsedOfferPrice,
      actualTotal: actualTotal,
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
      approvedPrice: isPriceNegotiated ? null : catalogUnitPrice,
      adminCounterPrice: null,
      adminNote: null,
      approvedBy: null,
      approvedAt: null,
      quoteAmount: \`₹\${itemTotal.toLocaleString('en-IN')}\`,
      estimatedValue: itemTotal,
      sourceDomain: site.domain,
      siteDomain: site.domain,
      brandName: site.brandName,
      status: isPriceNegotiated ? 'Pending Price Approval' : 'Quote Generated',
      quotationId: quotationId,
      quotationRef: refNo,
      isProfileComplete: true,
      quantity: \`\${numQty} Unit\${numQty > 1 ? 's' : ''}\`,
      customerNote: rfqCustomerNote || '',
      createdAt: new Date().toISOString(),
      date: 'Just now'
    };`;

// 5. Update RFQ Modal JSX form
const oldModalFormPattern = /<form onSubmit=\{handleRfqSubmit\} className="space-y-3 text-xs">[\s\S]*?<\/form>/;

const newModalFormCode = `<form onSubmit={handleRfqSubmit} className="space-y-3 text-xs">
                {rfqProduct ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={rfqProduct.image} alt={rfqProduct.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white" />
                      <div>
                        <span className="font-bold text-slate-900 block">{rfqProduct.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            GeM / Catalog Price: <strong className="text-slate-900">₹{rfqProduct.price?.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            CDSCO Certified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-base">
                      🏥
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Institutional Turnkey Equipment BOQ</span>
                      <span className="text-[10px] text-slate-500 font-mono">Standard Package Baseline: ₹1,50,000</span>
                    </div>
                  </div>
                )}

                {/* Pricing & Commercials Negotiation Section */}
                <div className="p-3 bg-linear-to-br from-sky-50/60 via-slate-50 to-indigo-50/40 rounded-xl border border-sky-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-sky-600">💰</span>
                      <span>Pricing & Negotiation Offer</span>
                    </span>
                    {parseFloat(rfqExpectedPrice) < (rfqProduct?.price || 150000) ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        ⚡ Negotiated Offer (-{Math.round((((rfqProduct?.price || 150000) - parseFloat(rfqExpectedPrice)) / (rfqProduct?.price || 150000)) * 100)}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Standard GeM Rate
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Quantity Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={rfqQuantity}
                        onChange={(e) => setRfqQuantity(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500 font-mono text-xs font-bold"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px] flex items-center justify-between">
                        <span>Target / Offer Price (₹)</span>
                        <span className="text-[10px] text-sky-600 font-normal">Per Unit</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          required
                          value={rfqExpectedPrice}
                          onChange={(e) => setRfqExpectedPrice(e.target.value)}
                          className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500 font-mono text-xs font-bold text-slate-900"
                          placeholder={String(rfqProduct?.price || 150000)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 border-t border-slate-200/60">
                    <span>
                      Est. Total: <strong className="font-mono text-slate-900">₹{((parseFloat(rfqExpectedPrice) || (rfqProduct?.price || 150000)) * (parseInt(rfqQuantity, 10) || 1)).toLocaleString('en-IN')}</strong>
                    </span>
                    {parseFloat(rfqExpectedPrice) < (rfqProduct?.price || 150000) ? (
                      <span className="text-[10px] text-amber-700 font-medium">
                        ⏳ Requires Institutional Admin Approval
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        ✓ Ready for Instant Quotation
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor / Procurement Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar, MS"
                    value={rfqDoctorName}
                    onChange={(e) => setRfqDoctorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      required
                      placeholder="Apollo Specialty"
                      value={rfqHospital}
                      onChange={(e) => setRfqHospital(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={rfqCity}
                      onChange={(e) => setRfqCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98000 00000"
                      value={rfqPhone}
                      onChange={(e) => setRfqPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.org"
                      value={rfqEmail}
                      onChange={(e) => setRfqEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={rfqSubmitting}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: primary }}
                  >
                    {rfqSubmitting ? (
                      'Submitting to Pipeline...'
                    ) : parseFloat(rfqExpectedPrice) < (rfqProduct?.price || 150000) ? (
                      <>
                        <span>Submit Negotiated Offer for Admin Approval</span>
                        <ArrowRight size={13} />
                      </>
                    ) : (
                      <>
                        <span>Generate Official Stamped Quotation</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>`;

// Execute replacements with validation
let modified = content;

// Replace 1: state
if (modified.includes(oldStateTarget)) {
  modified = modified.replace(oldStateTarget, newState);
  console.log('1. Replaced RFQ state');
} else {
  console.warn('Could not match RFQ state exactly');
}

// Replace 2: openRfqModal
if (modified.includes(oldOpenRfq)) {
  modified = modified.replace(oldOpenRfq, newOpenRfq);
  console.log('2. Replaced openRfqModal');
} else {
  console.warn('Could not match openRfqModal exactly');
}

// Replace 3: handleRfqSubmit start
if (modified.includes(oldSubmitStart)) {
  modified = modified.replace(oldSubmitStart, newSubmitStart);
  console.log('3. Replaced submit start');
} else {
  console.warn('Could not match submit start exactly');
}

// Replace 4: leadPayload
if (oldLeadPayloadPattern.test(modified)) {
  modified = modified.replace(oldLeadPayloadPattern, newLeadPayloadCode);
  console.log('4. Replaced leadPayload');
} else {
  console.warn('Could not match leadPayload pattern');
}

// Replace 5: modal form
if (oldModalFormPattern.test(modified)) {
  modified = modified.replace(oldModalFormPattern, newModalFormCode);
  console.log('5. Replaced modal form');
} else {
  console.warn('Could not match modal form pattern');
}

fs.writeFileSync(filePath, modified, 'utf8');
console.log('Successfully patched src/app/preview/[domain]/page.jsx');

