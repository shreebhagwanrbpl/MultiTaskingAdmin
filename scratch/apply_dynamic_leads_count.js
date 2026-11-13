const fs = require('fs');

const filePath = 'src/app/page.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update import to include useMemo
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useMemo } from 'react';"
);

// 2. Add BroadcastChannel listener in useEffect
const oldPollTimer = `    // Periodic 2-second polling to capture incoming leads, quotations, and concessions
    const pollTimer = setInterval(() => {
      loadLeadsFromDb();
      loadQuotations();
      loadCustomerProfilesCount();
    }, 2000);

    return () => clearInterval(pollTimer);`;

const newPollTimer = `    // Periodic 2-second polling to capture incoming leads, quotations, and concessions
    const pollTimer = setInterval(() => {
      loadLeadsFromDb();
      loadQuotations();
      loadCustomerProfilesCount();
    }, 2000);

    // Real-time channel listener for instant lead quotation conversion & deletions
    let channel;
    try {
      channel = new BroadcastChannel('biomedical_leads_channel');
      channel.onmessage = (event) => {
        if (!event?.data) return;
        const { type, leadId, ids } = event.data;
        if (type === 'LEAD_QUOTATION_CREATED' && leadId) {
          setLeads(prev => prev.map(l => (l.id === leadId || l._id === leadId) ? {
            ...l,
            status: 'Quotation Created',
            quotationRef: event.data.quotationRef || l.quotationRef,
            isQuotationCreated: true
          } : l));
        } else if (type === 'LEADS_DELETED') {
          const toRemove = new Set([...(ids || []), ...(event.data.leadIds || [])]);
          setLeads(prev => prev.filter(l => !toRemove.has(l.id) && !toRemove.has(l._id)));
        } else if (type === 'NEW_WEB_LEAD' && event.data.lead) {
          setLeads(prev => [event.data.lead, ...prev.filter(l => l.id !== event.data.lead.id)]);
        }
      };
    } catch (e) { }

    return () => {
      clearInterval(pollTimer);
      try { channel?.close(); } catch (e) { }
    };`;

content = content.replace(oldPollTimer, newPollTimer);

// 3. Add pendingLeadsCount useMemo after cartTotalBadge
const cartBadgeAnchor = `  const [deletedRecordsCount, setDeletedRecordsCount] = useState(0);
  const [cartTotalBadge, setCartTotalBadge] = useState(0);`;

const newCartBadgeAnchor = `  const [deletedRecordsCount, setDeletedRecordsCount] = useState(0);
  const [cartTotalBadge, setCartTotalBadge] = useState(0);

  // Truly new/pending incoming leads (excludes leads where quotation is already created/dispatched)
  const pendingLeadsCount = useMemo(() => {
    if (!Array.isArray(leads)) return 0;
    return leads.filter(l => {
      if (!l) return false;
      if (l.isQuotationCreated) return false;
      if (l.quotationRef) return false;
      const st = (l.status || '').toLowerCase();
      if (
        st.includes('quotation created') ||
        st.includes('quotation dispatched') ||
        st.includes('completed quote') ||
        st.includes('quote generated') ||
        st.includes('quotation sent')
      ) {
        return false;
      }
      return true;
    }).length;
  }, [leads]);`;

content = content.replace(cartBadgeAnchor, newCartBadgeAnchor);

// 4. Update sidebar Web Quotation button to use pendingLeadsCount
const oldSidebarBtn = `            <button
              onClick={() => {
                setActiveTab('quotation');
                setActiveQuotationDeskTab('leads');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('reset_web_quotation_tab', { detail: 'leads' }));
                }
              }}
              title={\`Web Quotation & Incoming Leads (\${leads.length} Pending)\`}
              className={\`w-full flex items-center \${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group \${activeTab === 'quotation'
                ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }\`}
            >
              <span className={\`flex items-center \${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}\`}>
                <FileText size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Web Quotation</span>}
              </span>
              {isSidebarCollapsed ? (
                leads.length > 0 ? (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sky-600 rounded-full border border-white"></span>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  {leads.length > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5 animate-pulse" title={\`\${leads.length} New Incoming Web Leads\`}>
                      <span>⚡</span>
                      <span>{leads.length}</span>
                    </span>
                  )}
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                    PDF
                  </span>
                </div>
              )}
            </button>`;

const newSidebarBtn = `            <button
              onClick={() => {
                setActiveTab('quotation');
                setActiveQuotationDeskTab('leads');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('reset_web_quotation_tab', { detail: 'leads' }));
                }
              }}
              title={\`Web Quotation & Incoming Leads (\${pendingLeadsCount > 0 ? \`\${pendingLeadsCount} Pending\` : 'All Caught Up'})\`}
              className={\`w-full flex items-center \${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group \${activeTab === 'quotation'
                ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }\`}
            >
              <span className={\`flex items-center \${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}\`}>
                <FileText size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Web Quotation</span>}
              </span>
              {isSidebarCollapsed ? (
                pendingLeadsCount > 0 ? (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sky-600 rounded-full border border-white"></span>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  {pendingLeadsCount > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5 animate-pulse" title={\`\${pendingLeadsCount} New Incoming Web Leads\`}>
                      <span>⚡</span>
                      <span>{pendingLeadsCount}</span>
                    </span>
                  )}
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                    PDF
                  </span>
                </div>
              )}
            </button>`;

content = content.replace(oldSidebarBtn, newSidebarBtn);

// 5. Remove the duplicate badge from top header
const oldHeaderQuotation = `              {activeTab === 'quotation' && (
                <>
                  <span className="truncate">Web Quotation &amp; Incoming Leads</span>
                  {leads.length > 0 ? (
                    <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>{leads.length} Incoming Leads</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs shrink-0">
                      Official PDF Desk
                    </span>
                  )}
                </>
              )}`;

const newHeaderQuotation = `              {activeTab === 'quotation' && (
                <span className="truncate">Web Quotation &amp; Incoming Leads</span>
              )}`;

content = content.replace(oldHeaderQuotation, newHeaderQuotation);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated src/app/page.jsx with dynamic leads count and removed header badge!');

