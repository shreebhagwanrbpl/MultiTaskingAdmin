const fs = require('fs');
const filePath = 'src/app/components/WebQuotationManager.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// Target block in activeCustomerGroup.quotations.map
const targetStart = `                          <div
                            key={qId}
                            className={\`bg-white rounded-2xl p-5 border transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden \${
                              isQuoteWithComplimentary(q)
                                ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md hover:border-amber-400'
                                : 'border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md'
                            }\`}
                          >
                            <div className={\`absolute top-0 left-0 right-0 h-1.5 \${
                              isQuoteWithComplimentary(q)
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500'
                            }\`} />

                            <div className="space-y-3 pt-1">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                      {q.refNo || 'REF-PENDING'}
                                    </span>
                                    {/* Revision badge */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingQuotationAudit(q);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                                      title="Click to view complete revision history and edit log"
                                    >
                                      <History size={10} className="text-purple-600" />
                                      <span>
                                        Rev {q.revisionCount || (q.revisions?.length || 1)}
                                        {q.revisions && q.revisions.length > 1 ? \` (\${q.revisions.length - 1} edit\${q.revisions.length > 2 ? 's' : ''})\` : ' (Initial)'}
                                      </span>
                                    </button>

                                    {/* PROMINENT COMPLIMENTARY BADGE ON QUOTATIONS WITH PERKS */}
                                    {isQuoteWithComplimentary(q) && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs border border-amber-400 tracking-wide uppercase">
                                        <Gift size={10} className="text-white shrink-0" />
                                        <span>Complimentary Added {q.allowedComplementaryBudget ? \`(₹\${Number(q.allowedComplementaryBudget).toLocaleString('en-IN')})\` : ''}</span>
                                      </span>
                                    )}

                                    {q.concessionStatus === 'concession_requested' && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1">
                                        <PhoneCall size={9} />
                                        <span>Demanded: ₹{Number(q.customerDemandedPrice || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    )}
                                    {q.concessionStatus === 'concession_approved' && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <Gift size={9} />
                                        <span>Auth Perk: ₹{Number(q.allowedComplementaryBudget || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition mt-1.5 truncate" title={q.customerName}>
                                    {q.customerName || 'Unnamed Customer'}
                                  </h4>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                  {q.date || 'Recent'}
                                </span>
                              </div>

                              {/* Subject & Line items */}
                              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs">
                                <div className="text-slate-700 font-medium truncate flex items-center gap-1.5" title={firstTitle}>
                                  <Package size={13} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{firstTitle}</span>
                                </div>
                                {itemsList.length > 1 && (
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    + {itemsList.length - 1} more item(s) included
                                  </div>
                                )}
                                {q.customerAddress1 && (
                                  <div className="text-[11px] text-slate-500 truncate" title={q.customerAddress1}>
                                    📍 {q.customerAddress1}
                                  </div>
                                )}
                              </div>

                              {/* Complimentary Perk Detail Chip (Visible when complimentary given) */}
                              {isQuoteWithComplimentary(q) && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base shrink-0">🎁</span>
                                    <div className="min-w-0">
                                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800">Complimentary Item Included</div>
                                      <div className="text-xs font-bold text-amber-950 truncate">
                                        {q.items?.filter(it => it.isComplimentary || (it.title && String(it.title).toUpperCase().includes('COMPLIMENTARY'))).map(it => it.title).join(', ') || 'Official Authorized Complimentary Perk Added'}
                                      </div>
                                    </div>
                                  </div>
                                  {q.allowedComplementaryBudget > 0 && (
                                    <span className="font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded text-[11px] shrink-0 border border-amber-300">
                                      ₹{Number(q.allowedComplementaryBudget).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Amount Pill */}`;

const replacementBlock = `                          <div
                            key={qId}
                            className={\`bg-white rounded-2xl p-5 border transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden \${
                              isQuoteWithComplimentary(q)
                                ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md hover:border-amber-400'
                                : 'border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md'
                            }\`}
                          >
                            <div className={\`absolute top-0 left-0 right-0 h-1.5 \${
                              isQuoteWithComplimentary(q)
                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500'
                            }\`} />

                            {/* DOCKED TOP-LEFT COMPLIMENTARY BADGE (EXACT RED MARKER POSITION) */}
                            {isQuoteWithComplimentary(q) && (
                              <div className="-mt-5 -ml-5 mb-0.5 self-start z-10">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-br-2xl text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs tracking-wider uppercase">
                                  <Gift size={12} className="text-white shrink-0" />
                                  <span>Complimentary Added {q.allowedComplementaryBudget ? \`(₹\${Number(q.allowedComplementaryBudget).toLocaleString('en-IN')})\` : ''}</span>
                                </span>
                              </div>
                            )}

                            <div className="space-y-3 pt-1">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                      {q.refNo || 'REF-PENDING'}
                                    </span>
                                    {/* Revision badge */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingQuotationAudit(q);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                                      title="Click to view complete revision history and edit log"
                                    >
                                      <History size={10} className="text-purple-600" />
                                      <span>
                                        Rev {q.revisionCount || (q.revisions?.length || 1)}
                                        {q.revisions && q.revisions.length > 1 ? \` (\${q.revisions.length - 1} edit\${q.revisions.length > 2 ? 's' : ''})\` : ' (Initial)'}
                                      </span>
                                    </button>

                                    {q.concessionStatus === 'concession_requested' && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1">
                                        <PhoneCall size={9} />
                                        <span>Demanded: ₹{Number(q.customerDemandedPrice || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    )}
                                    {q.concessionStatus === 'concession_approved' && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <Gift size={9} />
                                        <span>Auth Perk: ₹{Number(q.allowedComplementaryBudget || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition mt-1.5 truncate" title={q.customerName}>
                                    {q.customerName || 'Unnamed Customer'}
                                  </h4>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                  {q.date || 'Recent'}
                                </span>
                              </div>

                              {/* Subject & Line items */}
                              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs">
                                <div className="text-slate-700 font-medium truncate flex items-center gap-1.5" title={firstTitle}>
                                  <Package size={13} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{firstTitle}</span>
                                </div>
                                {itemsList.length > 1 && (
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    + {itemsList.length - 1} more item(s) included
                                  </div>
                                )}
                                {q.customerAddress1 && (
                                  <div className="text-[11px] text-slate-500 truncate" title={q.customerAddress1}>
                                    📍 {q.customerAddress1}
                                  </div>
                                )}
                              </div>

                              {/* Amount Pill */}`;

if (norm.includes(targetStart)) {
  norm = norm.replace(targetStart, replacementBlock);
  console.log('Successfully positioned corner badge at top-left and removed duplicate middle box');
} else {
  console.log('targetStart not found');
}

const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('Changes written successfully.');

