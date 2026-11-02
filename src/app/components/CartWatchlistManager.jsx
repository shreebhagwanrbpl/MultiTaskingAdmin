'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Bookmark,
  Plus,
  ArrowRight,
  PhoneCall,
  Building2,
  Mail,
  Search,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  Share2,
  Tag,
  Percent,
  Gift,
  Send,
  Eye,
  History,
  FileText,
  Calendar,
  Check,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PRODUCTS } from '../../data/products';

export default function CartWatchlistManager({ onNavigateTab = () => {} }) {
  const [customerCarts, setCustomerCarts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerSelectedProductIds, setOfferSelectedProductIds] = useState([]);
  const [offerForm, setOfferForm] = useState({
    title: 'Institutional Subsidy Discount',
    type: 'percentage', // 'percentage' | 'flat' | 'perk'
    value: 10,
    perkText: 'Free 2-Year Comprehensive OEM Warranty & Hospital Commissioning',
    note: 'Special rate approved by Admin for immediate hospital purchase order',
    validTill: '2026-11-15',
    sendWhatsApp: true,
    sendEmail: true,
    sendPortal: true
  });
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  // Offer History View State
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const showToast = (title, message, type = 'success') => {
    setToastMsg({ title, message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch all carts & watchlists from API
  const fetchCarts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart-watchlist');
      const data = await res.json();
      if (data.success && Array.isArray(data.carts)) {
        setCustomerCarts(data.carts);
        if (data.carts.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data.carts[0].customerId);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart/watchlist:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Currently selected customer object
  const currentCustomer = useMemo(() => {
    if (!customerCarts.length) return null;
    return customerCarts.find(c => c.customerId === selectedCustomerId) || customerCarts[0];
  }, [customerCarts, selectedCustomerId]);

  const cartItems = currentCustomer?.cart || [];
  const watchlistItems = currentCustomer?.watchlist || [];
  const allCustomerProducts = useMemo(() => {
    const list = [];
    cartItems.forEach(i => list.push({ ...i, origin: 'cart' }));
    watchlistItems.forEach(i => list.push({ ...i, origin: 'watchlist' }));
    return list;
  }, [cartItems, watchlistItems]);

  const activeOffer = currentCustomer?.activeOffer || currentCustomer?.offer || null;
  const offersHistory = currentCustomer?.offersHistory || [];

  // Total cart calculation
  const totalCartValue = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
  }, [cartItems]);

  const totalWatchlistValue = useMemo(() => {
    return watchlistItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
  }, [watchlistItems]);

  // Selected products calculation inside Offer Modal
  const selectedOfferProducts = useMemo(() => {
    return allCustomerProducts.filter(p => offerSelectedProductIds.includes(p.productId));
  }, [allCustomerProducts, offerSelectedProductIds]);

  const selectedOfferRegularTotal = useMemo(() => {
    return selectedOfferProducts.reduce((acc, item) => {
      const qty = item.origin === 'cart' ? (item.quantity || 1) : 1;
      return acc + (Number(item.price || 0) * qty);
    }, 0);
  }, [selectedOfferProducts]);

  // Live offer calculation
  const calculatedOfferDiscount = useMemo(() => {
    const total = selectedOfferRegularTotal;
    if (offerForm.type === 'percentage') {
      return Math.round((total * Number(offerForm.value || 0)) / 100);
    } else if (offerForm.type === 'flat') {
      return Math.min(total, Number(offerForm.value || 0));
    }
    return 0;
  }, [selectedOfferRegularTotal, offerForm.type, offerForm.value]);

  const calculatedOfferNetPrice = useMemo(() => {
    return Math.max(0, selectedOfferRegularTotal - calculatedOfferDiscount);
  }, [selectedOfferRegularTotal, calculatedOfferDiscount]);

  // Open Offer Modal (Default selects all customer items or specific item)
  const handleOpenOfferModal = (singleProduct = null) => {
    if (!currentCustomer) return;

    if (singleProduct) {
      setOfferSelectedProductIds([singleProduct.productId]);
    } else {
      // Select all products
      setOfferSelectedProductIds(allCustomerProducts.map(p => p.productId));
    }

    if (activeOffer && !singleProduct) {
      setOfferForm({
        title: activeOffer.title || 'Institutional Subsidy Discount',
        type: activeOffer.type || 'percentage',
        value: activeOffer.value || 10,
        perkText: activeOffer.perk || 'Free 2-Year Comprehensive OEM Warranty & Hospital Commissioning',
        note: activeOffer.note || 'Special rate approved by Admin for immediate hospital purchase order',
        validTill: activeOffer.validTill || '2026-11-15',
        sendWhatsApp: true,
        sendEmail: true,
        sendPortal: true
      });
    } else {
      setOfferForm({
        title: 'Institutional Subsidy Discount',
        type: 'percentage',
        value: 10,
        perkText: 'Free 2-Year Comprehensive OEM Warranty & Hospital Commissioning',
        note: 'Special rate approved by Admin for immediate hospital purchase order',
        validTill: '2026-11-15',
        sendWhatsApp: true,
        sendEmail: true,
        sendPortal: true
      });
    }

    setIsOfferModalOpen(true);
  };

  // Toggle product selection in Offer Modal
  const handleToggleProductInOffer = (productId) => {
    setOfferSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllInOffer = () => {
    setOfferSelectedProductIds(allCustomerProducts.map(p => p.productId));
  };

  const handleSelectCartOnlyInOffer = () => {
    setOfferSelectedProductIds(cartItems.map(p => p.productId));
  };

  const handleSelectWatchlistOnlyInOffer = () => {
    setOfferSelectedProductIds(watchlistItems.map(p => p.productId));
  };

  // Dispatch WhatsApp Offer Message
  const sendWhatsAppOfferMessage = (offerPayload) => {
    if (!currentCustomer || !currentCustomer.phone) return;

    const doctorName = currentCustomer.customerName || 'Doctor';
    const hospital = currentCustomer.hospitalName || 'Hospital';
    const phone = currentCustomer.phone.replace(/\D/g, '');

    let msg = `🏥 *RAJ BIOSIS HEALTHCARE - SPECIAL PROCUREMENT OFFER*\n\n`;
    msg += `Dear *${doctorName}* (${hospital}),\n\n`;
    msg += `Aapke dwara rajbiosis.com par select kiye gaye biomedical equipment par management ne special offer approve kiya hai:\n\n`;

    selectedOfferProducts.forEach((item, idx) => {
      const qty = item.origin === 'cart' ? (item.quantity || 1) : 1;
      msg += `${idx + 1}. *${item.name}* (Qty: ${qty}) - ₹${(Number(item.price || 0) * qty).toLocaleString('en-IN')}\n`;
    });

    msg += `\n💰 *Regular Catalog Total:* ₹${offerPayload.regularAmount.toLocaleString('en-IN')}\n`;

    if (offerPayload.type === 'percentage') {
      msg += `🏷️ *Approved Special Discount:* ${offerPayload.value}% OFF (-₹${offerPayload.discountAmount.toLocaleString('en-IN')})\n`;
    } else if (offerPayload.type === 'flat') {
      msg += `🏷️ *Approved Flat Concession:* -₹${offerPayload.discountAmount.toLocaleString('en-IN')}\n`;
    }

    msg += `✨ *FINAL SPECIAL OFFER PRICE:* ₹${offerPayload.offerAmount.toLocaleString('en-IN')}\n`;

    if (offerPayload.perk) {
      msg += `🎁 *Complimentary Privilege:* ${offerPayload.perk}\n`;
    }

    if (offerPayload.validTill) {
      msg += `⏳ *Offer Validity:* Valid till ${offerPayload.validTill}\n`;
    }

    if (offerPayload.note) {
      msg += `\n_Note: ${offerPayload.note}_\n`;
    }

    msg += `\nKripya confirm karein jisse aapka official 4-page formal quotation dispatch kiya ja sake. Dhanyawad!\n- Raj Biosis Sales & Engineering HQ`;

    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Action: Create and Send Offer
  const handleCreateAndSendOffer = async (e) => {
    e?.preventDefault();
    if (!currentCustomer) return;

    if (offerSelectedProductIds.length === 0) {
      alert('Kripya offer me shamil karne ke liye kam se kam 1 product select karein.');
      return;
    }

    setIsSendingOffer(true);

    const offerPayload = {
      offerId: `OFFER-${Date.now().toString().slice(-6)}`,
      active: true,
      title: offerForm.title.trim() || 'Exclusive Institutional Privilege Offer',
      type: offerForm.type,
      value: offerForm.type === 'perk' ? 0 : Number(offerForm.value || 0),
      perk: offerForm.perkText.trim(),
      note: offerForm.note.trim(),
      validTill: offerForm.validTill || '2026-11-15',
      selectedProductIds: offerSelectedProductIds,
      selectedProductNames: selectedOfferProducts.map(p => p.name),
      regularAmount: selectedOfferRegularTotal,
      discountAmount: calculatedOfferDiscount,
      offerAmount: calculatedOfferNetPrice,
      sentVia: [
        offerForm.sendWhatsApp ? 'WhatsApp' : null,
        offerForm.sendEmail ? 'Email' : null,
        offerForm.sendPortal ? 'Live Portal' : null
      ].filter(Boolean),
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentBy: 'Rajesh (HQ Admin)'
    };

    // Optimistic UI update
    setCustomerCarts(prev => prev.map(c => {
      if (c.customerId !== currentCustomer.customerId) return c;
      const history = c.offersHistory || [];
      return {
        ...c,
        activeOffer: offerPayload,
        offer: offerPayload,
        offersHistory: [offerPayload, ...history]
      };
    }));

    // Trigger WhatsApp if selected
    if (offerForm.sendWhatsApp && currentCustomer.phone) {
      sendWhatsAppOfferMessage(offerPayload);
    }

    // Call API to persist offer & email campaign log
    try {
      await fetch('/api/cart-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_and_send_offer',
          customerId: currentCustomer.customerId,
          offer: offerPayload,
          sendEmail: offerForm.sendEmail,
          sentBy: 'Rajesh (HQ Admin)'
        })
      });
    } catch (err) {
      console.warn('Failed to dispatch offer via API:', err);
    } finally {
      setIsSendingOffer(false);
      setIsOfferModalOpen(false);
      showToast('Offer Sent Successfully! 🚀', `Offer "${offerPayload.title}" customer ${currentCustomer.customerName} ko dispatch kar diya gaya hai.`);
    }
  };

  // Action: Revoke Offer
  const handleRevokeOffer = async () => {
    if (!currentCustomer) return;
    if (!window.confirm('Kya aap is customer ka active offer cancel / revoke karna chahte hain?')) return;

    setCustomerCarts(prev => prev.map(c => {
      if (c.customerId !== currentCustomer.customerId) return c;
      return { ...c, activeOffer: null, offer: null };
    }));

    showToast('Offer Revoked', 'Customer ka special offer cancel kar diya gaya.');

    try {
      await fetch('/api/cart-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_offer',
          customerId: currentCustomer.customerId
        })
      });
    } catch (e) {}
  };

  // Action: 1-Click Generate Quotation from Cart & Applied Offer
  const handleGenerateQuotation = () => {
    if (!currentCustomer) return;
    if (cartItems.length === 0 && watchlistItems.length === 0) {
      alert('Is customer ke cart ya watchlist me koi product nahi hai.');
      return;
    }

    // Use products in cart, or offer products if set
    const quoteItems = cartItems.length > 0 ? cartItems : selectedOfferProducts;
    const subtotal = quoteItems.reduce((acc, i) => acc + (Number(i.price || 0) * (i.quantity || 1)), 0);
    const discountAmt = activeOffer ? activeOffer.discountAmount : 0;
    const finalTotal = Math.max(0, subtotal - discountAmt);

    const quotationDraft = {
      customerName: currentCustomer.customerName || 'Valued Healthcare Partner',
      customerAddress1: currentCustomer.hospitalName || 'Hospital / Institution',
      customerAddress2: currentCustomer.phone || '',
      district: currentCustomer.district || 'Jaipur',
      subjectQuotation: `Supply of ${quoteItems.map(i => i.name).join(', ')}${activeOffer ? ` (Special ${activeOffer.title} Applied)` : ''}`,
      items: quoteItems.map((item, idx) => ({
        srNo: idx + 1,
        description: item.name,
        quantity: item.quantity || 1,
        rate: item.price || 0,
        amount: (item.price || 0) * (item.quantity || 1),
        specs: item.specs || ''
      })),
      totalAmount: finalTotal,
      subtotalAmount: subtotal,
      discountAmount: discountAmt,
      specialOffer: activeOffer ? {
        title: activeOffer.title,
        type: activeOffer.type,
        value: activeOffer.value,
        discountAmount: discountAmt,
        note: activeOffer.note
      } : null
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('active_quotation_lead', JSON.stringify(quotationDraft));
      } catch (e) {}
    }

    showToast('Opening Web Quotation', `Quotation draft tayar ho gaya hai. Redirecting...`);
    setTimeout(() => {
      onNavigateTab('quotation');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reset_web_quotation_tab', { detail: 'blank' }));
      }
    }, 400);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 text-slate-800">

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-semibold transition-all ${
          toastMsg.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 size={16} className={toastMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'} />
          <div>{toastMsg.message}</div>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          TOP CUSTOMER & OFFER BAR (Clean, Spacious, Zero-Clutter Design)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">

        {/* Bar Row 1: Customer Selector Dropdown + Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">
              Customer:
            </span>
            <div className="relative min-w-[260px] sm:min-w-[340px]">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none cursor-pointer transition focus:border-amber-500"
              >
                {customerCarts.map(c => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName} — {c.hospitalName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCarts}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

        </div>

        {/* Bar Row 2: Customer Identity + Custom Offer System */}
        {currentCustomer ? (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            
            {/* Left: Customer Info (Name, Number with Call/WhatsApp, Hospital) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentCustomer.customerName || 'Customer Name'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                  Verified Buyer
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600">
                {/* Number with Call & WhatsApp */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 font-mono font-bold text-slate-800">
                  <span>Number:</span>
                  <span>{currentCustomer.phone ? `+91 ${currentCustomer.phone}` : 'N/A'}</span>
                  {currentCustomer.phone && (
                    <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-1.5">
                      <a
                        href={`tel:${currentCustomer.phone}`}
                        className="text-emerald-600 hover:text-emerald-700 p-0.5"
                        title="Direct Call"
                      >
                        <PhoneCall size={12} />
                      </a>
                      <a
                        href={`https://wa.me/91${currentCustomer.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(currentCustomer.customerName)},%20regarding%20your%20biomedical%20equipment%20selection`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-0.5"
                        title="WhatsApp Chat"
                      >
                        <Share2 size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Hospital */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 font-semibold text-slate-700">
                  <Building2 size={13} className="text-sky-600" />
                  <span>{currentCustomer.hospitalName || 'Institution'}</span>
                </div>
              </div>
            </div>

            {/* Right: Offer Status & Action Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              
              {/* Offer & Pricing Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 min-w-[260px]">
                {activeOffer ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                        <Tag size={12} />
                        <span>{activeOffer.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenOfferModal()}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                          title="Modify Offer"
                        >
                          <Edit3Icon size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={handleRevokeOffer}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Revoke Offer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Number(activeOffer.regularAmount || totalCartValue).toLocaleString('en-IN')}
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        ₹{Number(activeOffer.offerAmount || totalCartValue).toLocaleString('en-IN')}
                      </span>
                      {activeOffer.discountAmount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          (-₹{Number(activeOffer.discountAmount).toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        Sent via {Array.isArray(activeOffer.sentVia) ? activeOffer.sentVia.join(', ') : 'WhatsApp & Email'}
                      </span>
                      <button
                        type="button"
                        onClick={() => sendWhatsAppOfferMessage(activeOffer)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        title="Resend on WhatsApp"
                      >
                        <Share2 size={11} />
                        <span>Send WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Cart &amp; Watchlist Pipeline:
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        ₹{(totalCartValue + totalWatchlistValue).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Prominent Create Offer Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenOfferModal()}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
                      title="Is customer ke selected products par special offer banayein aur bhein"
                    >
                      <Gift size={13} />
                      <span>🚀 Create &amp; Send Offer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 1-Click Quotation Generator Button */}
              <button
                type="button"
                onClick={handleGenerateQuotation}
                disabled={cartItems.length === 0 && watchlistItems.length === 0}
                className="h-full px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs hover:shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                title="Quotation generate karein"
              >
                <Sparkles size={14} className="text-amber-200" />
                <span>Make Quotation</span>
                <ArrowRight size={14} />
              </button>

            </div>

          </div>
        ) : (
          <div className="py-4 text-center text-slate-400 text-xs">
            No customer selected.
          </div>
        )}

      </div>

      {/* =========================================================================
          TWO-COLUMN PRODUCT SECTION (Customer's Live Selections)
          Note: Admin/Employee cannot move items between Cart & Watchlist!
          Instead, Admin can create & send offers directly on them.
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* -----------------------------------------------------------------------
            LEFT COLUMN: ADD TO CART PRODUCTS (Customer Intent)
            ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShoppingCart size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Add to Cart Products
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900">
                    {cartItems.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Customer&apos;s Active Cart on Storefront</p>
              </div>
            </div>

            <div className="font-mono font-bold text-xs text-slate-700">
              ₹{totalCartValue.toLocaleString('en-IN')}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {cartItems.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-400">
                Customer has no products in shopping cart currently.
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={item.productId || idx}
                  className="p-3 rounded-xl bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold font-mono text-[10px]">
                          Qty: {item.quantity || 1}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-700 font-bold">
                          ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Send Offer Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenOfferModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200/80 transition cursor-pointer flex items-center gap-1"
                      title="Is product par customer ko special offer dein"
                    >
                      <Gift size={11} className="text-amber-600" />
                      <span>Send Offer</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* -----------------------------------------------------------------------
            RIGHT COLUMN: WATCHLIST PRODUCTS (Customer Shortlist)
            ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Bookmark size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Watchlist Products
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-900">
                    {watchlistItems.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Customer&apos;s Saved / Shortlisted Items</p>
              </div>
            </div>

            <div className="font-mono font-bold text-xs text-slate-700">
              ₹{totalWatchlistValue.toLocaleString('en-IN')}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {watchlistItems.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-400">
                Customer has no products in watchlist currently.
              </div>
            ) : (
              watchlistItems.map((item, idx) => (
                <div
                  key={item.productId || idx}
                  className="p-3 rounded-xl bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          In Stock
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-700 font-bold">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Send Offer Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenOfferModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold border border-indigo-200/80 transition cursor-pointer flex items-center gap-1"
                      title="Is watchlist product par customer ko special offer dein"
                    >
                      <Gift size={11} className="text-indigo-600" />
                      <span>Send Offer</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* =========================================================================
          CREATE & SEND SPECIAL OFFER MODAL ("or chla jaye")
          ========================================================================= */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Create &amp; Dispatch Special Offer</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                      Live Delivery
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Recipient: <strong className="text-slate-700">{currentCustomer?.customerName}</strong> • {currentCustomer?.hospitalName} ({currentCustomer?.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateAndSendOffer} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">

              {/* 1. Product Selection */}
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <label className="font-bold text-slate-800">
                    1. Select Products for this Offer ({offerSelectedProductIds.length}/{allCustomerProducts.length}):
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={handleSelectAllInOffer}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      All ({allCustomerProducts.length})
                    </button>
                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectCartOnlyInOffer}
                        className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
                      >
                        Cart Only ({cartItems.length})
                      </button>
                    )}
                    {watchlistItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectWatchlistOnlyInOffer}
                        className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold cursor-pointer"
                      >
                        Watchlist Only ({watchlistItems.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50/40">
                  {allCustomerProducts.map((p) => {
                    const isSelected = offerSelectedProductIds.includes(p.productId);
                    const qty = p.origin === 'cart' ? (p.quantity || 1) : 1;
                    return (
                      <div
                        key={p.productId}
                        onClick={() => handleToggleProductInOffer(p.productId)}
                        className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-amber-600 cursor-pointer"
                          />
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                            p.origin === 'cart' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                          }`}>
                            {p.origin === 'cart' ? '🛒 Cart' : '⭐ Watchlist'}
                          </span>
                          <span className="font-bold text-slate-800 truncate" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-700 shrink-0 text-right">
                          ₹{(Number(p.price || 0) * qty).toLocaleString('en-IN')}
                          {qty > 1 && <span className="text-[10px] text-slate-400 block font-sans">Qty: {qty}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Offer Type & Value */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  2. Choose Discount &amp; Pricing Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({ ...f, type: 'percentage', value: 10 }))}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      offerForm.type === 'percentage'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Percent size={14} className="mx-auto mb-1 text-amber-600" />
                    <span>Percentage (%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({ ...f, type: 'flat', value: 50000 }))}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      offerForm.type === 'flat'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Tag size={14} className="mx-auto mb-1 text-amber-600" />
                    <span>Flat Cash (₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({ ...f, type: 'perk', value: 0 }))}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      offerForm.type === 'perk'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Gift size={14} className="mx-auto mb-1 text-amber-600" />
                    <span>Free Perk / Scheme</span>
                  </button>
                </div>
              </div>

              {/* Offer Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Offer Title / Scheme Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.title}
                    onChange={(e) => setOfferForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Institutional Privilege Discount"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                {offerForm.type === 'percentage' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Discount Percentage (%):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={offerForm.value}
                        onChange={(e) => setOfferForm(f => ({ ...f, value: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                )}

                {offerForm.type === 'flat' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Flat Cash Concession (₹):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1000"
                        required
                        value={offerForm.value}
                        onChange={(e) => setOfferForm(f => ({ ...f, value: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {offerForm.type === 'perk' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Special Privilege:
                    </label>
                    <input
                      type="text"
                      value={offerForm.perkText}
                      onChange={(e) => setOfferForm(f => ({ ...f, perkText: e.target.value }))}
                      placeholder="e.g. Free 2-Yr Extended Warranty + 4 Preventive Services"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Quick Preset Pills */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Presets:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({
                      ...f,
                      title: '10% Institutional Discount',
                      type: 'percentage',
                      value: 10
                    }))}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    10% Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({
                      ...f,
                      title: '15% Bulk Hospital Discount',
                      type: 'percentage',
                      value: 15
                    }))}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    15% Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({
                      ...f,
                      title: 'Special Concession Flat ₹1,00,000 Off',
                      type: 'flat',
                      value: 100000
                    }))}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    Flat ₹1 Lakh Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferForm(f => ({
                      ...f,
                      title: 'Free 2-Yr Comprehensive AMC',
                      type: 'perk',
                      value: 0,
                      perkText: 'Complimentary 2-Year Annual Maintenance Contract & Free On-Site Calibration'
                    }))}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                  >
                    Free 2-Yr AMC
                  </button>
                </div>
              </div>

              {/* Extra Perk & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Free Extra Perk (Optional):
                  </label>
                  <input
                    type="text"
                    value={offerForm.perkText}
                    onChange={(e) => setOfferForm(f => ({ ...f, perkText: e.target.value }))}
                    placeholder="e.g. Free 2-Year AMC &amp; On-Site Training"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Offer Valid Till:
                  </label>
                  <input
                    type="date"
                    value={offerForm.validTill}
                    onChange={(e) => setOfferForm(f => ({ ...f, validTill: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* 3. Live Price Calculation Summary Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block font-sans">
                    Offer Financial Breakdown:
                  </span>
                  <span className="text-xs text-slate-500 line-through">
                    Regular: ₹{selectedOfferRegularTotal.toLocaleString('en-IN')}
                  </span>
                  {calculatedOfferDiscount > 0 && (
                    <span className="text-xs text-emerald-700 font-bold ml-2">
                      (Discount: -₹{calculatedOfferDiscount.toLocaleString('en-IN')})
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block font-sans">
                    Final Approved Offer Price:
                  </span>
                  <div className="text-lg font-black text-emerald-800">
                    ₹{calculatedOfferNetPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* 4. Dispatch Channels ("or chla jaye") */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Send Channels (How should the offer be delivered?):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerForm.sendWhatsApp}
                      onChange={(e) => setOfferForm(f => ({ ...f, sendWhatsApp: e.target.checked }))}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    <span>💬 Send WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerForm.sendEmail}
                      onChange={(e) => setOfferForm(f => ({ ...f, sendEmail: e.target.checked }))}
                      className="rounded text-sky-600 cursor-pointer"
                    />
                    <span>📧 Send Email</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerForm.sendPortal}
                      onChange={(e) => setOfferForm(f => ({ ...f, sendPortal: e.target.checked }))}
                      className="rounded text-amber-600 cursor-pointer"
                    />
                    <span>🌐 Live Customer Portal</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingOffer || offerSelectedProductIds.length === 0}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{isSendingOffer ? 'Dispatching Offer...' : 'Send Offer to Customer Now 🚀'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

function Edit3Icon(props) {
  return <Edit3 size={props.size || 14} className={props.className} />;
}
