const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Add isQuoteWithComplimentary helper function near top
const helperFunc = `
export function isQuoteWithComplimentary(q) {
  if (!q) return false;
  if (q.hasComplimentary) return true;
  if (Number(q.allowedComplementaryBudget || 0) > 0) return true;
  if (
    q.concessionStatus === 'concession_approved' ||
    q.concessionStatus === 'approved_complimentary' ||
    q.concessionStatus === 'concession_applied'
  ) return true;
  if (Array.isArray(q.items) && q.items.some(it => it.isComplimentary || (it.title && String(it.title).toUpperCase().includes('COMPLIMENTARY')))) return true;
  if (Array.isArray(q.complimentaryItems) && q.complimentaryItems.length > 0) return true;
  if (typeof q.subjectQuotation === 'string' && q.subjectQuotation.toLowerCase().includes('complimentary')) return true;
  return false;
}
`;

if (!norm.includes('export function isQuoteWithComplimentary')) {
  norm = norm.replace(
    'export const COMPLIMENTARY_PERK_CATALOG = [',
    `${helperFunc}\nexport const COMPLIMENTARY_PERK_CATALOG = [`
  );
  console.log('Added isQuoteWithComplimentary helper function');
}

// 2. Allow top Command Bar on Complimentary Desk (remove && activeMainTab !== 'complementary')
const oldBarCondition = "{activeMainTab !== 'completed' && activeMainTab !== 'complementary' && (";
const newBarCondition = "{activeMainTab !== 'completed' && (";

if (norm.includes(oldBarCondition)) {
  norm = norm.replace(oldBarCondition, newBarCondition);
  console.log('Successfully enabled top command bar on Complimentary Desk');
} else {
  console.log('oldBarCondition not found');
}

// 3. In Customer Detail View (activeCustomerGroup.quotations.map), add Complimentary Badge and highlight
const oldCardHeader = `{/* Header Row */}
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
                                  </div>`;

const newCardHeader = `{/* Header Row */}
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
                                    >tatiob
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
                                  </div>`;

if (norm.includes(oldCardHeader)) {
  norm = norm.replace(oldCardHeader, newCardHeader);
  console.log('Successfully added complimentary badge to quotation cards in Customer Detail View');
} else {
  console.log('oldCardHeader not found');
}

// 4. Also add complimentary item highlight block right under subject & line items in Customer Detail View
const oldSubjectBlock = `                                {/* Subject & Line items */}
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
                              </div>`;

const newSubjectBlock = `                                {/* Subject & Line items */}
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
                                        {q.items?.filter(it => it.isComplimentary || (it.title && String(it.title).toUpperCase().includes('COMPLIMENTARY'))).map(it => it.title).join(', ') || 'Official Authorized Complimentary Perk'}
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

if (norm.includes(oldSubjectBlock)) {
  norm = norm.replace(oldSubjectBlock, newSubjectBlock);
  console.log('Successfully added complimentary perk highlight block');
} else {
  console.log('oldSubjectBlock not found');
}

// 5. In Main Quotations History Grid (PAGE VIEW 3), add badge if any quotes have complimentary
const oldGridBadges = `{group.quotations.length > 1 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      <Layers size={10} className="text-indigo-600" />
                                      <span>{group.quotations.length} Quotations</span>
                                    </span>
                                  ) : (`;

const newGridBadges = `{group.quotations.some(isQuoteWithComplimentary) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                                      <Gift size={10} className="text-amber-700" />
                                      <span>Complimentary</span>
                                    </span>
                                  )}

                                  {group.quotations.length > 1 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      <Layers size={10} className="text-indigo-600" />
                                      <span>{group.quotations.length} Quotations</span>
                                    </span>
                                  ) : (`;

if (norm.includes(oldGridBadges)) {
  norm = norm.replace(oldGridBadges, newGridBadges);
  console.log('Successfully added complimentary badge in Main History Grid');
} else {
  console.log('oldGridBadges not found');
}

// 6. In History Drawer (lines 6766+), add complimentary badge
const oldDrawerRow = `<div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{q.customerName}</span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600">₹{formatCurrency(q.grandTotal || q.totalAmount)}</span>
                    </div>`;

const newDrawerRow = `<div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate">{q.customerName}</span>
                        {isQuoteWithComplimentary(q) && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 shrink-0">
                            🎁 Comp
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 shrink-0">₹{formatCurrency(q.grandTotal || q.totalAmount)}</span>
                    </div>`;

if (norm.includes(oldDrawerRow)) {
  norm = norm.replace(oldDrawerRow, newDrawerRow);
  console.log('Successfully added complimentary badge in History Drawer');
} else {
  console.log('oldDrawerRow not found');
}

const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('All changes applied successfully!');

