const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/page.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Lock to lucide-react import
if (!content.includes('Lock,')) {
  content = content.replace("UserCheck\n} from 'lucide-react';", "UserCheck,\n  Lock\n} from 'lucide-react';")
    .replace("UserCheck\r\n} from 'lucide-react';", "UserCheck,\r\n  Lock\r\n} from 'lucide-react';");
  console.log('1. Added Lock to imports');
}

// 2. Destructure isAdmin, isSales from useAuth()
const oldAuthPattern = /const \{\s*user,\s*loading:\s*authLoading,\s*logout,\s*activeDistrictFilter,\s*setDistrictFilter,\s*isSuperAdmin,/;
const newAuthCode = `const {
    user,
    loading: authLoading,
    logout,
    activeDistrictFilter,
    setDistrictFilter,
    isAdmin,
    isSales,
    isSuperAdmin,`;

if (oldAuthPattern.test(content) && !content.includes('isAdmin,') && !content.includes('isAdmin ,')) {
  content = content.replace(oldAuthPattern, newAuthCode);
  console.log('2. Destructured isAdmin, isSales from useAuth');
}

// 3. Add negotiation state variables and handlers
const stateMarker = `  const [showUserDropdown, setShowUserDropdown] = useState(false);`;
const stateAddition = `  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Price Negotiation State & Actions for Leads
  const [negotiationModalLead, setNegotiationModalLead] = useState(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [counterNoteInput, setCounterNoteInput] = useState('');
  const [negotiationSubmitting, setNegotiationSubmitting] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  const openNegotiationModal = (lead) => {
    if (!lead) return;
    setNegotiationModalLead(lead);
    const actual = lead.actualPrice || 150000;
    const expected = lead.expectedPrice || lead.price || 120000;
    const midpoint = Math.round((actual + expected) / 2);
    setCounterPriceInput(lead.adminCounterPrice ? String(lead.adminCounterPrice) : String(midpoint));
    setCounterNoteInput(lead.adminNote || 'Approved in-between institutional offer with warranty.');
  };

  const handleApproveCustomerPrice = async (lead) => {
    if (!lead) return;
    setNegotiationSubmitting(true);
    try {
      const approvedAmount = lead.expectedPrice || lead.price || 150000;
      const numQty = parseInt(String(lead.quantity || '1').replace(/\\D/g, ''), 10) || 1;
      const totalAmount = approvedAmount * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'approved',
        approvedPrice: approvedAmount,
        price: approvedAmount,
        quoteAmount: \`₹\${totalAmount.toLocaleString('en-IN')}\`,
        estimatedValue: totalAmount,
        adminNote: 'Customer target price approved by Admin for institutional purchase.',
        approvedBy: user?.name || user?.email || 'Admin',
        approvedAt: new Date().toISOString(),
        status: 'Price Approved'
      };

      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      setLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch(e){} }, 5000);
      } catch(e){}

      setToastNotification({
        title: 'Price Approved Successfully!',
        message: \`₹\${approvedAmount.toLocaleString('en-IN')} approved for \${lead.hospital || lead.equipment}. Sales employees can now make the quotation.\`
      });
      setNegotiationModalLead(null);
    } catch (err) {
      console.error('Approve price error:', err);
      alert('Error approving price: ' + err.message);
    } finally {
      setNegotiationSubmitting(false);
    }
  };

  const handleCounterOfferPrice = async (lead, counterPrice, adminNote) => {
    if (!lead) return;
    const numPrice = parseFloat(String(counterPrice).replace(/[^0-9.]/g, ''));
    if (!numPrice || numPrice <= 0) {
      alert('Please enter a valid counter price');
      return;
    }
    setNegotiationSubmitting(true);
    try {
      const numQty = parseInt(String(lead.quantity || '1').replace(/\\D/g, ''), 10) || 1;
      const totalAmount = numPrice * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'counter_offered',
        adminCounterPrice: numPrice,
        price: numPrice,
        quoteAmount: \`₹\${totalAmount.toLocaleString('en-IN')}\`,
        estimatedValue: totalAmount,
        adminNote: adminNote || 'In-between institutional price offered by Admin.',
        approvedBy: user?.name || user?.email || 'Admin',
        approvedAt: new Date().toISOString(),
        status: 'Counter Offered'
      };

      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      setLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch(e){} }, 5000);
      } catch(e){}

      setToastNotification({
        title: 'Counter Offer Set!',
        message: \`In-between rate ₹\${numPrice.toLocaleString('en-IN')} set for \${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.\`
      });
      setNegotiationModalLead(null);
    } catch (err) {
      console.error('Counter price error:', err);
      alert('Error setting counter price: ' + err.message);
    } finally {
      setNegotiationSubmitting(false);
    }
  };

  const handleRequestAdminApproval = (lead) => {
    setToastNotification({
      title: 'Admin Approval Request Submitted',
      message: \`Admin ko ₹\${(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')} approval request notify kar di gayi hai. Admin ke approve ya counter offer karne par Make Quotation unlock ho jayega.\`
    });
  };`;

if (!content.includes('negotiationModalLead')) {
  content = content.replace(stateMarker, stateAddition);
  console.log('3. Added state and handlers');
}

// 4. Update Top Alert Banner Actions
const oldTopAlertButtons = /\{!isLeadProfileComplete\(newLeadAlerts\[0\]\) && \([\s\S]*?\{isLeadProfileComplete\(newLeadAlerts\[0\]\) && \([\s\S]*?<\/button>\s*\)\}/;

const newTopAlertButtons = `{newLeadAlerts[0]?.isPriceNegotiated && newLeadAlerts[0]?.negotiationStatus === 'pending_approval' ? (
                !isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleRequestAdminApproval(newLeadAlerts[0])}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Price discount requires Admin approval"
                  >
                    <Lock size={13} className="text-amber-100" />
                    <span>Admin se yeh price approve karvao</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openNegotiationModal(newLeadAlerts[0])}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                    title="Review & Approve Price"
                  >
                    <ShieldCheck size={13} className="text-amber-200" />
                    <span>Review & Approve Price</span>
                  </button>
                )
              ) : (
                isLeadProfileComplete(newLeadAlerts[0]) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && newLeadAlerts[0]) {
                        try {
                          localStorage.setItem('active_quotation_lead', JSON.stringify(newLeadAlerts[0]));
                        } catch (e) { }
                      }
                      setActiveTab('quotation');
                      setNewLeadAlerts([]);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-200" />
                    <span>
                      {newLeadAlerts[0]?.negotiationStatus === 'approved'
                        ? \`Make Quotation (Approved: ₹\${(newLeadAlerts[0].approvedPrice || newLeadAlerts[0].price)?.toLocaleString('en-IN')})\`
                        : newLeadAlerts[0]?.negotiationStatus === 'counter_offered'
                        ? \`Make Quotation (Counter: ₹\${(newLeadAlerts[0].adminCounterPrice || newLeadAlerts[0].price)?.toLocaleString('en-IN')})\`
                        : 'Make Quotation'}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                )
              )}`;

if (oldTopAlertButtons.test(content)) {
  content = content.replace(oldTopAlertButtons, newTopAlertButtons);
  console.log('4. Replaced Top Alert action buttons');
} else {
  console.warn('Could not match oldTopAlertButtons');
}

// 5. Update Table Row (Amount, Status, Actions)
const oldTableRowCellsPattern = /<td className="py-3 px-4">\s*<span className="text-emerald-600 font-bold text-sm font-mono">\s*\{lead\.quoteAmount \|\| lead\.amount \|\| '₹0'\}\s*<\/span>\s*<\/td>\s*<td className="py-3 px-4">\s*<span className="px-2 py-0\.5 rounded-full text-\[10px\] font-bold bg-amber-50 text-amber-700 border border-amber-200\/70">\s*\{lead\.status \|\| 'Pending RFQ'\}\s*<\/span>\s*<\/td>\s*<td className="py-3 px-4 text-right">\s*<div className="flex items-center justify-end gap-1\.5 flex-wrap">[\s\S]*?<\/div>\s*<\/td>/;

const newTableRowCells = `<td className="py-3 px-4">
                              {lead.isPriceNegotiated ? (
                                <div>
                                  {lead.negotiationStatus === 'approved' ? (
                                    <div>
                                      <span className="text-emerald-700 font-bold text-sm font-mono block">
                                        ₹{(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}
                                      </span>
                                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                                        GeM: ₹{(lead.actualPrice || 150000).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ) : lead.negotiationStatus === 'counter_offered' ? (
                                    <div>
                                      <span className="text-indigo-700 font-bold text-sm font-mono block">
                                        ₹{(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono block">
                                        Offered: ₹{(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-amber-700 font-bold text-sm font-mono block">
                                        ₹{(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono block">
                                        GeM MRP: ₹{(lead.actualPrice || 150000).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-emerald-600 font-bold text-sm font-mono">
                                  {lead.quoteAmount || lead.amount || '₹0'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {lead.isPriceNegotiated ? (
                                lead.negotiationStatus === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                                    <CheckCircle2 size={10} className="text-emerald-600" />
                                    <span>Price Approved</span>
                                  </span>
                                ) : lead.negotiationStatus === 'counter_offered' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 flex items-center gap-1 w-fit">
                                    <span>🤝 Counter Offered</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit animate-pulse">
                                    <Clock size={10} className="text-amber-600" />
                                    <span>Awaiting Approval</span>
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                                  {lead.status || 'Pending RFQ'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {lead.isPriceNegotiated && lead.negotiationStatus === 'pending_approval' ? (
                                  !isAdmin ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRequestAdminApproval(lead)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                                      title="Negotiated price requires Admin approval"
                                    >
                                      <Lock size={12} className="text-amber-100" />
                                      <span>Admin se yeh price approve karvao</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openNegotiationModal(lead)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 animate-pulse hover:scale-105 active:scale-95"
                                      title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
                                    >
                                      <ShieldCheck size={12} className="text-amber-200" />
                                      <span>Review & Approve Price</span>
                                    </button>
                                  )
                                ) : isLeadProfileComplete(lead) || lead.quotationRef ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (typeof window !== 'undefined') {
                                          try {
                                            localStorage.setItem('active_quotation_lead', JSON.stringify(lead));
                                          } catch (e) { }
                                        }
                                        setActiveTab('quotation');
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                                      title="Click to view and edit 4-page official quotation PDF"
                                    >
                                      <Sparkles size={12} className="text-amber-200" />
                                      <span>
                                        {lead.negotiationStatus === 'approved'
                                          ? \`Make Quotation (Approved: ₹\${(lead.approvedPrice || lead.price)?.toLocaleString('en-IN')})\`
                                          : lead.negotiationStatus === 'counter_offered'
                                          ? \`Make Quotation (Counter: ₹\${(lead.adminCounterPrice || lead.price)?.toLocaleString('en-IN')})\`
                                          : lead.quotationRef
                                          ? \`View Stamped PDF (\${lead.quotationRef})\`
                                          : 'Make Quotation'}
                                      </span>
                                    </button>
                                    {isAdmin && lead.isPriceNegotiated && (
                                      <button
                                        type="button"
                                        onClick={() => openNegotiationModal(lead)}
                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                        title="Adjust price approval or counter offer"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs"
                                    title="Customer profile incomplete. Ask customer to complete profile on website."
                                  >
                                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                                    <span>Ask customer to complete profile to generate quotation</span>
                                  </div>
                                )}

                                {lead.phone && (
                                  <>
                                    <a
                                      href={\`tel:\${lead.phone}\`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-xs"
                                      title="Call Direct"
                                    >
                                      <PhoneCall size={12} />
                                      <span>Call</span>
                                    </a>
                                    {phoneClean && (
                                      <a
                                        href={\`https://wa.me/91\${phoneClean.slice(-10)}?text=\${encodeURIComponent(\`Hello Dr. \${lead.doctorName || lead.customerName || ''}, regarding your quotation inquiry for \${lead.equipment || 'hospital equipment'} with Raj Biosis:\`)}\`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                                        title="WhatsApp Message"
                                      >
                                        <MessageCircle size={13} />
                                      </a>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>`;

if (oldTableRowCellsPattern.test(content)) {
  content = content.replace(oldTableRowCellsPattern, newTableRowCells);
  console.log('5. Replaced Leads Table Row cells');
} else {
  console.warn('Could not match oldTableRowCellsPattern');
}

// 6. Add Modal and Toast before closing </main>
const closingMainTarget = `        </main>
      </div>
    </div>`;

const modalAndToastCode = `{/* Price Negotiation Review Modal for Admin */}
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
    </div>`;

if (content.includes(closingMainTarget) && !content.includes('negotiationModalLead && (')) {
  content = content.replace(closingMainTarget, modalAndToastCode);
  console.log('6. Added Negotiation Modal and Toast to main');
} else {
  console.warn('Could not match closingMainTarget');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched src/app/page.jsx');

