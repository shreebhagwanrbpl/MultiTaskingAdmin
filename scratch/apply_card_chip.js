const fs = require('fs');
const filePath = 'src/app/components/WebQuotationManager.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Update Card border and top strip
const oldCardOuter = `<div
                            key={qId}
                            className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />`;

const newCardOuter = `<div
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
                            }\`} />`;

if (norm.includes(oldCardOuter)) {
  norm = norm.replace(oldCardOuter, newCardOuter);
  console.log('Successfully updated card container and top stripe with amber complimentary accent');
} else {
  console.log('oldCardOuter not found');
}

// 2. Add complimentary item chip
const targetSubjectEnd = `                                {q.customerAddress1 && (
                                  <div className="text-[11px] text-slate-500 truncate" title={q.customerAddress1}>
                                    📍 {q.customerAddress1}
                                  </div>
                                )}
                              </div>`;

const replaceSubjectEnd = `                                {q.customerAddress1 && (
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
                              )}`;

if (norm.includes(targetSubjectEnd)) {
  norm = norm.replace(targetSubjectEnd, replaceSubjectEnd);
  console.log('Successfully added complimentary detail chip inside quotation card');
} else {
  console.log('targetSubjectEnd not found');
}

const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('Saved changes.');

