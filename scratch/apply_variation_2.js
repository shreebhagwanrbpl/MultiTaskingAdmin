const fs = require('fs');

const filePath = 'src/app/components/WebQuotationManager.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetSnippet = `{/* DOCKED TOP-LEFT COMPLIMENTARY BADGE (EXACT RED MARKER POSITION) */}
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
                              </div>`;

const replacementSnippet = `{/* VARIATION 2: 45° DIAGONAL CORNER RIBBON WITH ZIGZAG CUTTING EDGES */}
                            {isQuoteWithComplimentary(q) && (
                              <div className="w-[115px] h-[115px] overflow-hidden absolute top-0 left-0 z-20 pointer-events-none">
                                <div className="absolute -left-10 top-4 w-44 transform -rotate-45 drop-shadow-md">
                                  <svg width="175" height="28" viewBox="0 0 175 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <linearGradient id={\`grad-ribbon-\${qId}\`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="50%" stopColor="#ea580c" />
                                        <stop offset="100%" stopColor="#e11d48" />
                                      </linearGradient>
                                    </defs>
                                    <path
                                      d="M 0 3 L 5 0 L 10 3 L 15 0 L 20 3 L 25 0 L 30 3 L 35 0 L 40 3 L 45 0 L 50 3 L 55 0 L 60 3 L 65 0 L 70 3 L 75 0 L 80 3 L 85 0 L 90 3 L 95 0 L 100 3 L 105 0 L 110 3 L 115 0 L 120 3 L 125 0 L 130 3 L 135 0 L 140 3 L 145 0 L 150 3 L 155 0 L 160 3 L 165 0 L 170 3 L 175 0 L 175 25 L 170 28 L 165 25 L 160 28 L 155 25 L 150 28 L 145 25 L 140 28 L 135 25 L 130 28 L 125 25 L 120 28 L 115 25 L 110 28 L 105 25 L 100 28 L 95 25 L 90 28 L 85 25 L 80 28 L 75 25 L 70 28 L 65 25 L 60 28 L 55 25 L 50 28 L 45 25 L 40 28 L 35 25 L 30 28 L 25 25 L 20 28 L 15 25 L 10 28 L 5 25 L 0 28 Z"
                                      fill={\`url(#grad-ribbon-\${qId})\`}
                                      stroke="#ffffff"
                                      strokeWidth="0.5"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center gap-1 text-white font-black text-[9px] tracking-wider uppercase pointer-events-none">
                                    <span>🎁</span>
                                    <span>Complimentary</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3 pt-1">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className={\`flex items-center gap-1.5 flex-wrap \${isQuoteWithComplimentary(q) ? 'pl-14' : ''}\`}>
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
                                  </div>
                                  <div className={\`flex items-center justify-between gap-2 mt-1.5 \${isQuoteWithComplimentary(q) ? 'pl-4' : ''}\`}>
                                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition truncate" title={q.customerName}>
                                      {q.customerName || 'Unnamed Customer'}
                                    </h4>
                                    {isQuoteWithComplimentary(q) && q.allowedComplementaryBudget ? (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                                        +₹{Number(q.allowedComplementaryBudget).toLocaleString('en-IN')} Perk
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                  {q.date || 'Recent'}
                                </span>
                              </div>`;

// Normalize line endings
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetSnippet.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacementSnippet.replace(/\r\n/g, '\n'));
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully replaced target snippet with Variation 2!');
} else {
  console.error('Target snippet not found! Let us check index:');
  const idx = normContent.indexOf('DOCKED TOP-LEFT COMPLIMENTARY BADGE');
  console.log('Index of badge marker:', idx);
}

