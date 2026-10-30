const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/page.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetRegex = /\s*<\/main>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/;

const modalAndToastCode = `
        {/* Price Negotiation Review Modal for Admin */}
        {negotiationModalLead && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 text-slate-800 animate-in fade-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-lg">
                    ⚖️
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Biomedical Equipment Price Approval Desk
                    </h3>
                    <p className="text-xs text-slate-500">
                      Institutional review of customer expected purchase rate
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNegotiationModalLead(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Customer & Product Information Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Hospital / Institution:</span>
                  <strong className="text-slate-900 font-bold">{negotiationModalLead.hospital || negotiationModalLead.hospitalName || 'Healthcare Facility'}</strong>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Procurement Contact:</span>
                  <span className="text-slate-800">{negotiationModalLead.doctorName || negotiationModalLead.customerName || 'Procurement Lead'} ({negotiationModalLead.phone || '-'})</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Equipment Requested:</span>
                  <strong className="text-slate-900 font-bold">{negotiationModalLead.equipment || negotiationModalLead.productName || 'Biomedical System'}</strong>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-mono font-bold text-slate-800">{negotiationModalLead.quantity || '1 Unit'}</span>
                </div>
              </div>

              {/* Side-by-Side Price Comparison */}
              {(() => {
                const actualPrice = negotiationModalLead.actualPrice || 150000;
                const expectedPrice = negotiationModalLead.expectedPrice || negotiationModalLead.price || 120000;
                const diff = actualPrice - expectedPrice;
                const discountPct = Math.round((diff / actualPrice) * 100);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Actual Catalog / GeM Price */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          1. Product Actual Price (GeM)
                        </span>
                        <div className="text-xl font-black font-mono text-slate-900">
                          ₹{actualPrice.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Official registered catalog MRP per unit
                        </span>
                      </div>

                      {/* Customer Expected Price */}
                      <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                            2. Customer Expected Price
                          </span>
                          {diff > 0 && (
                            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                              -{discountPct}%
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-black font-mono text-amber-900">
                          ₹{expectedPrice.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-amber-800 block">
                          Difference: ₹{diff.toLocaleString('en-IN')} below MRP
                        </span>
                      </div>
                    </div>

                    {/* Decision Choices */}
                    <div className="space-y-3.5 pt-1">
                      
                      {/* Choice 1: Approve Customer Price */}
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>✅ Option A: Approve Customer Expected Price</span>
                          </h4>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Maan lo yeh sale karne ka sahi price hai, to yahan se direct approve karein.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={negotiationSubmitting}
                          onClick={() => handleApproveCustomerPrice(negotiationModalLead)}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve Customer Price (₹{expectedPrice.toLocaleString('en-IN')})</span>
                        </button>
                      </div>

                      {/* Choice 2: Propose In-Between Counter Offer */}
                      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <span>🤝 Option B: In-Between Price (Hum Yeh De Sakte Hai)</span>
                          </h4>
                          <p className="text-[11px] text-indigo-800 mt-0.5">
                            Agar customer price company ke liye viable nahi hai, to in-between counter price set karein jo employee ko dikhega.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              In-Between Counter Price (₹ per unit)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                value={counterPriceInput}
                                onChange={(e) => setCounterPriceInput(e.target.value)}
                                placeholder={String(Math.round((actualPrice + expectedPrice) / 2))}
                                className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Admin Note / Justification
                            </label>
                            <input
                              type="text"
                              value={counterNoteInput}
                              onChange={(e) => setCounterNoteInput(e.target.value)}
                              placeholder="e.g. Includes 2yr warranty + installation"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={negotiationSubmitting}
                          onClick={() => handleCounterOfferPrice(negotiationModalLead, counterPriceInput, counterNoteInput)}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Set In-Between Counter Offer (₹{parseFloat(counterPriceInput || 0).toLocaleString('en-IN')})</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 max-w-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white">{toastNotification.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastNotification.message}</p>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        </main>
      </div>
    </div>
  );
}`;

if (targetRegex.test(content) && !content.includes('negotiationModalLead && (')) {
  content = content.replace(targetRegex, modalAndToastCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully inserted Negotiation Modal and Toast at bottom of page.jsx');
} else {
  console.error('Could not match targetRegex at bottom of page.jsx');
  process.exit(1);
}

