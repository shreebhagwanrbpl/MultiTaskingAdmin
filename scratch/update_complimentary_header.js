const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Update Top Command Bar branding to dynamically show 'Complimentary Quotation Desk' when on complementary tab
const oldTopBrand = `            {/* Left: Branding & Direct Switcher to Leads */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-wrap">
              <div
                onClick={() => setActiveMainTab('leads')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                title="Click to go back to Web Quotation desk"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 transition">
                  <FileText size={22} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap group-hover:text-sky-600 transition">
                  Web Quotation
                </h2>
              </div>`;

const newTopBrand = `            {/* Left: Branding & Direct Switcher to Leads */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-wrap">
              <div
                onClick={() => setActiveMainTab('leads')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                title="Click to go back to Web Quotation desk"
              >
                <div className={\`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 transition \${
                  activeMainTab === 'complementary'
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white'
                    : 'bg-gradient-to-tr from-sky-500 via-indigo-500 to-indigo-600 text-white'
                }\`}>
                  {activeMainTab === 'complementary' ? <Gift size={22} /> : <FileText size={22} />}
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap group-hover:text-sky-600 transition">
                  {activeMainTab === 'complementary' ? 'Complimentary Quotation Desk' : 'Web Quotation'}
                </h2>
              </div>

              {activeMainTab === 'complementary' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {effectiveBudget > 0 && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <span>Perk Allowance:</span>
                      <strong className="text-amber-950 font-black">₹{effectiveBudget.toLocaleString('en-IN')}</strong>
                    </span>
                  )}
                  {customerName && (
                    <span className="text-xs text-slate-500 font-semibold hidden md:inline bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      Customer: <span className="text-slate-800 font-bold">{customerName}</span>
                    </span>
                  )}
                </div>
              )}`;

if (norm.includes(oldTopBrand)) {
  norm = norm.replace(oldTopBrand, newTopBrand);
  console.log('Successfully updated top command bar branding');
} else {
  console.log('Warning: oldTopBrand not found');
}

// 2. Remove the redundant second header card inside activeMainTab === 'complementary'
const oldSecondCard = `        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Card - Direct Mode vs Customer Concession Mode */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {hasCustomerConcession ? 'Complimentary Concession Desk' : 'Complimentary Perks & Accessories Catalog'}
                    </h2>
                    {hasCustomerConcession && (
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Perk Allowance: ₹{effectiveBudget.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hasCustomerConcession
                      ? (customerName ? \`Customer: \${customerName} • \` : '') + \`Add free perks to maintain deal revenue floor.\`
                      : 'Browse and add official company complimentary items (₹50 to ₹1,000) to quotations.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('quotation');
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('switch_web_quotation_tab', { detail: 'quotation' }));
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-200"
                >
                  ← Back to Quotation Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('quotation');
                    setActiveLayout('preview');
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('switch_web_quotation_tab', { detail: 'quotation' }));
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  View 4-Page PDF →
                </button>
              </div>
            </div>

            {/* ONLY DISPLAY DEAL CONCESSION METRICS IF USER CAME THROUGH AN ACTIVE CUSTOMER CONCESSION */}`;

const newSecondCard = `        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* ONLY DISPLAY DEAL CONCESSION METRICS IF USER CAME THROUGH AN ACTIVE CUSTOMER CONCESSION */}`;

if (norm.includes(oldSecondCard)) {
  norm = norm.replace(oldSecondCard, newSecondCard);
  console.log('Successfully removed redundant lower header card');
} else {
  console.log('Warning: oldSecondCard not found');
}

const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('All changes applied successfully!');

