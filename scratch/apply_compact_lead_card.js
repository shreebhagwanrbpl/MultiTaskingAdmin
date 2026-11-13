const fs = require('fs');

const filePath = 'src/app/components/WebQuotationManager.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Target the start of LeadInquiryCard body
const targetStart = `  const leadProducts = getLeadProducts(lead);
  const isMulti = leadProducts.length > 1 || lead.equipment?.toLowerCase().includes('bulk') || lead.rawLeadData?.isMultiItem;`;

const newStart = `  const leadProducts = getLeadProducts(lead);
  const isBulk = leadProducts.length > 2;
  const isMulti = leadProducts.length > 1 || lead.equipment?.toLowerCase().includes('bulk') || lead.rawLeadData?.isMultiItem;`;

content = content.replace(targetStart, newStart);

// Target header badge in LeadInquiryCard
const targetBadge = `        <div className="flex items-center gap-2">
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
        </div>`;

const newBadge = `        <div className="flex items-center gap-2">
          {leadProducts.length > 2 ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-sky-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Package size={13} className="text-indigo-600" />
              <span>Bulk Request ({leadProducts.length} Products)</span>
            </span>
          ) : leadProducts.length === 2 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1">
              <Package size={12} className="text-sky-600" />
              <span>2 Products</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>New RFQ</span>
            </span>
          )}
        </div>`;

content = content.replace(targetBadge, newBadge);

// Target the body of LeadInquiryCard (before bottom footer bar)
const targetBody = `      {/* 2-Column Split: Left (Customer Details) | Right (Products List) */}
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
      </div>`;

const newBody = `      {/* If > 2 products, use the spacious 2-Column Split View. Otherwise, keep it compact and clean! */}
      {isBulk ? (
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
                  <span>Requested Equipment ({leadProducts.length} Items)</span>
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
      ) : (
        /* COMPACT SINGLE-STACK VIEW (1 or 2 items only) */
        <div className="p-4 sm:p-5 space-y-3 bg-white flex-1 pl-6">
          {/* Horizontal Customer Details Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
            <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <User size={13} className="text-sky-600 shrink-0" />
              <span>{displayContact}</span>
            </span>

            {displayPhone && displayPhone !== 'NA' && (
              <span className="flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <Phone size={12} className="text-emerald-600 shrink-0" />
                <span>{displayPhone}</span>
              </span>
            )}

            {displayEmail && displayEmail !== 'NA' && (
              <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hidden md:inline-flex">
                <Mail size={12} className="text-indigo-600 shrink-0" />
                <span className="truncate max-w-[200px]" title={displayEmail}>{displayEmail}</span>
              </span>
            )}

            {displayLocation && displayLocation !== 'NA' && (
              <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <MapPin size={12} className="text-amber-600 shrink-0" />
                <span>{displayLocation}</span>
              </span>
            )}

            <span className="ml-auto font-mono font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
              Total: <span className="font-black">{displayTotal}</span>
            </span>
          </div>

          {/* Requested Equipment Items (1 or 2 items) */}
          <div className="space-y-2">
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
                    <div className="font-bold text-slate-900 line-clamp-1 text-xs flex items-center gap-1.5" title={p.name || p.title || p.productName}>
                      <Package size={14} className="text-indigo-500 shrink-0" />
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
      )}`;

content = content.replace(targetBody, newBody);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated LeadInquiryCard with conditional compact/bulk layout!');

