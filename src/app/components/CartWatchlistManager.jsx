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
  AlertCircle,
  Users,
  User,
  Globe,
  Radio,
  Copy,
  Edit3
} from 'lucide-react';
import { PRODUCTS } from '../../data/products';

export default function CartWatchlistManager({ onNavigateTab = () => {} }) {
  const [customerCarts, setCustomerCarts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [storewideOffer, setStorewideOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [targetAudience, setTargetAudience] = useState('single'); // 'single' | 'all'
  const [productScope, setProductScope] = useState('cart_watchlist'); // 'cart_watchlist' | 'all_catalog' | 'specific_catalog_product'
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState(PRODUCTS[0]?.id || 'prod-vent-x9');
  const [offerSelectedProductIds, setOfferSelectedProductIds] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  const [offerForm, setOfferForm] = useState({
    title: 'Institutional Subsidy Discount',
    type: 'percentage', // 'percentage' | 'flat' | 'perk'
    value: 10,
    perkText: 'Free 2-Year Comprehensive OEM Warranty & Hospital Commissioning',
    note: 'Special rate approved by Admin for immediate hospital purchase order',
    validTill: '2026-11-20',
    sendWhatsApp: true,
    sendEmail: true,
    sendPortal: true
  });
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  // WhatsApp Broadcast Assistant Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [lastDispatchedOffer, setLastDispatchedOffer] = useState(null);
  const [copiedBroadcastText, setCopiedBroadcastText] = useState(false);

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
        setStorewideOffer(data.storewideOffer || null);
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
    const interval = setInterval(() => { fetchCarts(); }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filtered customer list for search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customerCarts;
    const q = searchQuery.toLowerCase();
    return customerCarts.filter(c =>
      (c.customerName || '').toLowerCase().includes(q) ||
      (c.hospitalName || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.district || '').toLowerCase().includes(q)
    );
  }, [customerCarts, searchQuery]);

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

  const activeOffer = currentCustomer?.activeOffer || currentCustomer?.offer || storewideOffer || null;
  const isStorewideActive = Boolean(storewideOffer && storewideOffer.active);

  // Total cart calculation
  const totalCartValue = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
  }, [cartItems]);

  const totalWatchlistValue = useMemo(() => {
    return watchlistItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
  }, [watchlistItems]);

  // Catalog products filtered by search
  const filteredCatalogProducts = useMemo(() => {
    if (!catalogSearch.trim()) return PRODUCTS;
    const q = catalogSearch.toLowerCase();
    return PRODUCTS.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q)
    );
  }, [catalogSearch]);

  // Selected catalog product object
  const currentCatalogProduct = useMemo(() => {
    return PRODUCTS.find(p => p.id === selectedCatalogProductId) || PRODUCTS[0];
  }, [selectedCatalogProductId]);

  // Selected products calculation inside Offer Modal based on scope
  const selectedOfferProducts = useMemo(() => {
    if (productScope === 'all_catalog') {
      return PRODUCTS.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        brand: p.brand,
        image: p.image,
        origin: 'catalog',
        quantity: 1
      }));
    } else if (productScope === 'specific_catalog_product') {
      if (!currentCatalogProduct) return [];
      return [{
        productId: currentCatalogProduct.id,
        name: currentCatalogProduct.name,
        price: currentCatalogProduct.price,
        category: currentCatalogProduct.category,
        brand: currentCatalogProduct.brand,
        image: currentCatalogProduct.image,
        origin: 'catalog',
        quantity: 1
      }];
    } else {
      // cart_watchlist
      return allCustomerProducts.filter(p => offerSelectedProductIds.includes(p.productId));
    }
  }, [productScope, allCustomerProducts, offerSelectedProductIds, currentCatalogProduct]);

  // Regular total calculation based on scope
  const selectedOfferRegularTotal = useMemo(() => {
    if (productScope === 'all_catalog') {
      // Sum of current customer's cart or avg catalog value
      const cartSum = totalCartValue + totalWatchlistValue;
      return cartSum > 0 ? cartSum : 500000;
    } else if (productScope === 'specific_catalog_product') {
      return Number(currentCatalogProduct?.price || 150000);
    } else {
      return selectedOfferProducts.reduce((acc, item) => {
        const qty = item.origin === 'cart' ? (item.quantity || 1) : 1;
        return acc + (Number(item.price || 0) * qty);
      }, 0);
    }
  }, [productScope, selectedOfferProducts, totalCartValue, totalWatchlistValue, currentCatalogProduct]);

  // Live offer discount calculation
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

  // Open Offer Modal
  const handleOpenOfferModal = (options = {}) => {
    const {
      audience = 'single',
      scope = 'cart_watchlist',
      singleProduct = null,
      specificCatalogId = null
    } = options;

    setTargetAudience(audience);
    setProductScope(scope);

    if (specificCatalogId) {
      setSelectedCatalogProductId(specificCatalogId);
    }

    if (singleProduct) {
      setOfferSelectedProductIds([singleProduct.productId]);
    } else {
      setOfferSelectedProductIds(allCustomerProducts.map(p => p.productId));
    }

    setOfferForm({
      title: audience === 'all' ? 'All-Customer B2B Institutional Offer' : 'Institutional Subsidy Discount',
      type: 'percentage',
      value: 10,
      perkText: 'Free 2-Year Comprehensive OEM Warranty & Hospital Commissioning',
      note: 'Special rate approved by Admin for immediate hospital purchase order',
      validTill: '2026-11-20',
      sendWhatsApp: true,
      sendEmail: true,
      sendPortal: true
    });

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

  // Generate WhatsApp Message text for a specific customer
  const buildWhatsAppMessage = (customer, offerPayload) => {
    const doctorName = customer?.customerName || 'Doctor';
    const hospital = customer?.hospitalName || 'Hospital';

    let msg = `🏥 *RAJ BIOSIS HEALTHCARE - SPECIAL PROCUREMENT OFFER*\n\n`;
    msg += `Dear *Dr. ${doctorName}* (${hospital}),\n\n`;
    msg += `Management has approved an exclusive special offer for your medical institution on rajbiosis.com:\n\n`;

    if (offerPayload.productScope === 'all_catalog') {
      msg += `🌟 *SCOPE: ALL MEDICAL EQUIPMENT & ICU SYSTEMS (STOREWIDE)*\n`;
      msg += `Valid across all ventilators, monitors, defibrillators, X-ray & surgical systems.\n`;
    } else if (offerPayload.productScope === 'specific_catalog_product') {
      msg += `📦 *FEATURED PRODUCT:* ${offerPayload.specificProductName || 'Biomedical Equipment'}\n`;
    } else {
      msg += `📦 *SELECTED EQUIPMENT IN YOUR INQUIRY:*\n`;
      (offerPayload.selectedProductNames || []).slice(0, 5).forEach((name, idx) => {
        msg += `${idx + 1}. *${name}*\n`;
      });
    }

    if (offerPayload.type === 'percentage') {
      msg += `\n🏷️ *Approved Special Discount:* ${offerPayload.value}% OFF\n`;
    } else if (offerPayload.type === 'flat') {
      msg += `\n🏷️ *Approved Flat Concession:* -₹${Number(offerPayload.value).toLocaleString('en-IN')}\n`;
    }

    if (offerPayload.regularAmount && offerPayload.regularAmount > 0) {
      msg += `💰 *Regular Catalog Total:* ₹${offerPayload.regularAmount.toLocaleString('en-IN')}\n`;
      msg += `✨ *FINAL SPECIAL OFFER PRICE:* ₹${offerPayload.offerAmount.toLocaleString('en-IN')}\n`;
    }

    if (offerPayload.perk) {
      msg += `🎁 *Complimentary Privilege:* ${offerPayload.perk}\n`;
    }

    if (offerPayload.validTill) {
      msg += `⏳ *Offer Validity:* Valid till ${offerPayload.validTill}\n`;
    }

    if (offerPayload.note) {
      msg += `\n_Note: ${offerPayload.note}_\n`;
    }

    msg += `\nPlease reply to confirm and generate your official 4-page formal quotation. Thank you!\n- Raj Biosis Sales & Engineering Desk\nOfficial Portal: https://rajbiosis.com`;
    return msg;
  };

  // Dispatch WhatsApp Offer Message to a specific customer
  const sendWhatsAppOfferMessage = (customer, offerPayload) => {
    if (!customer || !customer.phone) return;
    const phone = customer.phone.replace(/\D/g, '').slice(-10);
    const msg = buildWhatsAppMessage(customer, offerPayload);
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Action: Create and Send Offer (Single Customer or All Customers)
  const handleCreateAndSendOffer = async (e) => {
    e?.preventDefault();

    if (targetAudience === 'single' && !currentCustomer) {
      alert('Please select a customer.');
      return;
    }

    if (productScope === 'cart_watchlist' && offerSelectedProductIds.length === 0) {
      alert('Please select at least 1 product for this offer.');
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
      validTill: offerForm.validTill || '2026-11-20',
      targetAudience: targetAudience,
      productScope: productScope,
      specificProductId: productScope === 'specific_catalog_product' ? currentCatalogProduct?.id : null,
      specificProductName: productScope === 'specific_catalog_product' ? currentCatalogProduct?.name : null,
      selectedProductIds: productScope === 'cart_watchlist' ? offerSelectedProductIds : (productScope === 'specific_catalog_product' ? [currentCatalogProduct?.id] : []),
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

    setLastDispatchedOffer(offerPayload);

    try {
      const res = await fetch('/api/cart-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_and_send_offer',
          targetAudience: targetAudience,
          customerId: targetAudience === 'all' ? 'all' : currentCustomer.customerId,
          phone: targetAudience === 'single' ? currentCustomer.phone : null,
          offer: offerPayload,
          sendEmail: offerForm.sendEmail,
          sentBy: 'Rajesh (HQ Admin)'
        })
      });
      const data = await res.json();

      if (data.success) {
        if (targetAudience === 'all') {
          setStorewideOffer(offerPayload);
          setCustomerCarts(prev => prev.map(c => ({
            ...c,
            activeOffer: offerPayload,
            offer: offerPayload
          })));
          showToast('Storewide Offer Broadcasted! 📢', `Offer "${offerPayload.title}" has been activated for all ${customerCarts.length} customers.`);

          if (offerForm.sendWhatsApp) {
            setShowBroadcastModal(true);
          }
        } else {
          setCustomerCarts(prev => prev.map(c => {
            if (c.customerId !== currentCustomer.customerId) return c;
            return {
              ...c,
              activeOffer: offerPayload,
              offer: offerPayload,
              offersHistory: [offerPayload, ...(c.offersHistory || [])]
            };
          }));
          showToast('Offer Sent Successfully! 🚀', `Offer "${offerPayload.title}" sent to ${currentCustomer.customerName}.`);

          if (offerForm.sendWhatsApp && currentCustomer.phone) {
            sendWhatsAppOfferMessage(currentCustomer, offerPayload);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to dispatch offer:', err);
      showToast('Error', 'Failed to dispatch offer. Please check connection.', 'error');
    } finally {
      setIsSendingOffer(false);
      setIsOfferModalOpen(false);
    }
  };

  // Action: Revoke Offer (Single or Storewide)
  const handleRevokeOffer = async (isStorewide = false) => {
    const confirmMsg = isStorewide
      ? 'Are you sure you want to revoke the active storewide broadcast offer from ALL customers?'
      : `Are you sure you want to revoke the active offer for ${currentCustomer?.customerName}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await fetch('/api/cart-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_offer',
          targetAudience: isStorewide ? 'all' : 'single',
          customerId: isStorewide ? 'all' : currentCustomer.customerId,
          phone: !isStorewide ? currentCustomer.phone : null
        })
      });

      if (isStorewide) {
        setStorewideOffer(null);
        setCustomerCarts(prev => prev.map(c => ({ ...c, activeOffer: null, offer: null })));
        showToast('Storewide Offer Revoked', 'Storewide offer has been deactivated.');
      } else {
        setCustomerCarts(prev => prev.map(c => {
          if (c.customerId !== currentCustomer.customerId) return c;
          return { ...c, activeOffer: null, offer: null };
        }));
        showToast('Offer Revoked', `Offer for ${currentCustomer.customerName} has been revoked.`);
      }
    } catch (e) {
      console.warn('Error revoking offer:', e);
    }
  };

  // Action: 1-Click Generate Quotation from Cart & Applied Offer
  const handleGenerateQuotation = () => {
    if (!currentCustomer) return;
    if (cartItems.length === 0 && watchlistItems.length === 0) {
      alert('This customer has no products in cart or watchlist.');
      return;
    }

    const quoteItems = cartItems.length > 0 ? cartItems : selectedOfferProducts;
    const subtotal = quoteItems.reduce((acc, i) => acc + (Number(i.price || 0) * (i.quantity || 1)), 0);
    const discountAmt = activeOffer ? (activeOffer.discountAmount || 0) : 0;
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

    showToast('Opening Web Quotation', `Quotation draft ready with applied offer. Redirecting...`);
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
          STOREWIDE BROADCAST BANNER (When Active)
          ========================================================================= */}
      {isStorewideActive && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  📢 Active Storewide Offer: {storewideOffer.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-black uppercase">
                  {storewideOffer.type === 'percentage' ? `${storewideOffer.value}% OFF` : `-₹${Number(storewideOffer.value).toLocaleString('en-IN')}`}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Active for all customers on rajbiosis.com • Valid till {storewideOffer.validTill || 'Limited Period'} • {storewideOffer.productScope === 'all_catalog' ? 'Entire Catalog' : 'Selected Products'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setLastDispatchedOffer(storewideOffer);
                setShowBroadcastModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Share2 size={13} />
              <span>Broadcast WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => handleRevokeOffer(true)}
              className="px-3.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <X size={13} />
              <span>Revoke</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOP CUSTOMER & OFFER BAR (Clean, Spacious, Zero-Clutter Design)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">

        {/* Bar Row 1: Customer Selector + Broadcast Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
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

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Broadcast Offer to ALL Customers Button */}
            <button
              type="button"
              onClick={() => handleOpenOfferModal({ audience: 'all', scope: 'all_catalog' })}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Broadcast special discount to ALL customers across catalog or selected products"
            >
              <Users size={14} />
              <span>📢 Offer to All Customers</span>
            </button>

            {/* Offer on Entire Catalog for THIS Customer */}
            {currentCustomer && (
              <button
                type="button"
                onClick={() => handleOpenOfferModal({ audience: 'single', scope: 'all_catalog' })}
                className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Apply discount on ALL catalog products for this customer"
              >
                <Globe size={13} />
                <span>All Products for {currentCustomer.customerName.split(' ')[0]}</span>
              </button>
            )}

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
                {currentCustomer.activeOffer && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Tag size={11} className="text-emerald-600" />
                    <span>Special Offer Active</span>
                  </span>
                )}
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

                {/* Location */}
                <div className="text-slate-500 font-medium">
                  <span>📍 {currentCustomer.district || 'Rajasthan'}</span>
                </div>
              </div>
            </div>

            {/* Right: Offer Status & Action Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              
              {/* Offer & Pricing Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 min-w-[280px]">
                {activeOffer ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md truncate max-w-[200px]" title={activeOffer.title}>
                        <Tag size={12} />
                        <span className="truncate">{activeOffer.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenOfferModal({ audience: activeOffer.targetAudience || 'single', scope: activeOffer.productScope || 'cart_watchlist' })}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                          title="Modify Offer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeOffer(activeOffer.targetAudience === 'all')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Revoke Offer"
                        >
                          <X size={13} />
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
                        Valid till {activeOffer.validTill || '2026-11-20'}
                      </span>
                      <button
                        type="button"
                        onClick={() => sendWhatsAppOfferMessage(currentCustomer, activeOffer)}
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
                      onClick={() => handleOpenOfferModal({ audience: 'single', scope: 'cart_watchlist' })}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
                      title="Create and send special offer to this customer"
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
                title="Generate quotation directly with applied offer"
              >
                <Sparkles size={14} className="text-amber-200" />
                <span>Make Quotation</span>
                <ArrowRight size={14} />
              </button>

            </div>

          </div>
        ) : (
          <div className="py-4 text-center text-slate-400 text-xs">
            No dynamic customer carts available.
          </div>
        )}

      </div>

      {/* =========================================================================
          TWO-COLUMN PRODUCT SECTION (Customer's Live Dynamic Selections)
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
                      onClick={() => handleOpenOfferModal({ audience: 'single', scope: 'cart_watchlist', singleProduct: item })}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200/80 transition cursor-pointer flex items-center gap-1"
                      title="Send special offer on this item"
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
                      onClick={() => handleOpenOfferModal({ audience: 'single', scope: 'cart_watchlist', singleProduct: item })}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold border border-indigo-200/80 transition cursor-pointer flex items-center gap-1"
                      title="Send special offer on this item"
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
          CREATE & DISPATCH SPECIAL OFFER MODAL (Comprehensive B2B Offer Desk)
          ========================================================================= */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
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
                  <p className="text-[11px] text-slate-500">
                    {targetAudience === 'all'
                      ? `Broadcast to ALL ${customerCarts.length} Active Customers`
                      : `Recipient: ${currentCustomer?.customerName} • ${currentCustomer?.hospitalName} (${currentCustomer?.phone})`}
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

              {/* 1. Target Audience Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  1. Target Audience (Who should receive this offer?):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('single')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      targetAudience === 'single'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <User size={16} className={targetAudience === 'single' ? 'text-amber-600' : 'text-slate-400'} />
                    <div className="min-w-0">
                      <div className="font-bold truncate">{currentCustomer?.customerName || 'Single Customer'}</div>
                      <div className="text-[10px] text-slate-500 truncate">{currentCustomer?.hospitalName}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetAudience('all');
                      if (productScope === 'cart_watchlist') setProductScope('all_catalog');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      targetAudience === 'all'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Users size={16} className={targetAudience === 'all' ? 'text-amber-600' : 'text-slate-400'} />
                    <div>
                      <div className="font-bold">All Customers (Broadcast)</div>
                      <div className="text-[10px] text-slate-500">All {customerCarts.length} active hospital buyers</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Product Scope Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  2. Product Scope (Which products should the offer apply to?):
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    disabled={targetAudience === 'all'}
                    onClick={() => setProductScope('cart_watchlist')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-[11px] ${
                      targetAudience === 'all'
                        ? 'opacity-40 cursor-not-allowed border-slate-200'
                        : productScope === 'cart_watchlist'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>Cart &amp; Watchlist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductScope('all_catalog')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-[11px] ${
                      productScope === 'all_catalog'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>🌐 All Catalog Products</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductScope('specific_catalog_product')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-[11px] ${
                      productScope === 'specific_catalog_product'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>📦 Specific Product</span>
                  </button>
                </div>

                {/* Sub-view: Cart & Watchlist Items Selection */}
                {productScope === 'cart_watchlist' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[11px] font-bold text-slate-600">
                        Select customer items ({offerSelectedProductIds.length}/{allCustomerProducts.length}):
                      </span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={handleSelectAllInOffer}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          All
                        </button>
                        {cartItems.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSelectCartOnlyInOffer}
                            className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
                          >
                            Cart Only
                          </button>
                        )}
                        {watchlistItems.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSelectWatchlistOnlyInOffer}
                            className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold cursor-pointer"
                          >
                            Watchlist Only
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl max-h-32 overflow-y-auto divide-y divide-slate-100 bg-slate-50/40">
                      {allCustomerProducts.map((p) => {
                        const isSelected = offerSelectedProductIds.includes(p.productId);
                        const qty = p.origin === 'cart' ? (p.quantity || 1) : 1;
                        return (
                          <div
                            key={p.productId}
                            onClick={() => handleToggleProductInOffer(p.productId)}
                            className={`p-2 flex items-center justify-between gap-3 cursor-pointer transition ${
                              isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-100/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded text-amber-600 cursor-pointer"
                              />
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                                p.origin === 'cart' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                              }`}>
                                {p.origin === 'cart' ? 'Cart' : 'Watchlist'}
                              </span>
                              <span className="font-bold text-slate-800 truncate" title={p.name}>
                                {p.name}
                              </span>
                            </div>
                            <div className="font-mono font-bold text-slate-700 shrink-0 text-right">
                              ₹{(Number(p.price || 0) * qty).toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-view: Specific Catalog Product Selection */}
                {productScope === 'specific_catalog_product' && (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Choose Catalog Product:</span>
                      <input
                        type="text"
                        placeholder="Search product..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none w-44"
                      />
                    </div>
                    <select
                      value={selectedCatalogProductId}
                      onChange={(e) => setSelectedCatalogProductId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                    >
                      {filteredCatalogProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{Number(p.price || 0).toLocaleString('en-IN')} ({p.category})
                        </option>
                      ))}
                    </select>
                    {currentCatalogProduct && (
                      <div className="flex items-center gap-3 pt-1">
                        <img
                          src={currentCatalogProduct.image}
                          alt={currentCatalogProduct.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{currentCatalogProduct.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Catalog MRP: ₹{Number(currentCatalogProduct.price || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: All Catalog Notice */}
                {productScope === 'all_catalog' && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-950 text-xs flex items-center gap-2">
                    <Globe size={16} className="text-sky-600 shrink-0" />
                    <span>
                      <strong>Entire Storefront Offer:</strong> This offer will apply as a management concession across all {PRODUCTS.length} medical products in the catalog for {targetAudience === 'all' ? 'all customers' : currentCustomer?.customerName}.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Offer Type & Value */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  3. Choose Discount &amp; Pricing Type:
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

              {/* Offer Headline & Values */}
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
                  {[5, 10, 15, 20, 25].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setOfferForm(f => ({
                        ...f,
                        title: `${pct}% Institutional Discount`,
                        type: 'percentage',
                        value: pct
                      }))}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                        offerForm.type === 'percentage' && offerForm.value === pct
                          ? 'bg-amber-500 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pct}% Off
                    </button>
                  ))}
                  {[50000, 100000, 200000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setOfferForm(f => ({
                        ...f,
                        title: `Special Concession Flat ₹${(amt / 1000).toLocaleString('en-IN')}k Off`,
                        type: 'flat',
                        value: amt
                      }))}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                        offerForm.type === 'flat' && offerForm.value === amt
                          ? 'bg-amber-500 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Flat ₹{(amt / 100000)} Lakh Off
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Perk & Validity */}
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

              {/* 4. Live Price Calculation Summary Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block font-sans">
                    Offer Financial Summary ({targetAudience === 'all' ? 'Storewide' : (currentCustomer?.customerName || 'Customer')}):
                  </span>
                  <span className="text-xs text-slate-500 line-through">
                    Catalog Base: ₹{selectedOfferRegularTotal.toLocaleString('en-IN')}
                  </span>
                  {calculatedOfferDiscount > 0 && (
                    <span className="text-xs text-emerald-700 font-bold ml-2">
                      (Concession: -₹{calculatedOfferDiscount.toLocaleString('en-IN')})
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

              {/* 5. Dispatch Channels */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Delivery Channels (How should the offer be sent?):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerForm.sendWhatsApp}
                      onChange={(e) => setOfferForm(f => ({ ...f, sendWhatsApp: e.target.checked }))}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    <span>💬 Direct WhatsApp</span>
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
                    <span>🌐 Live Storefront Portal</span>
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
                  disabled={isSendingOffer}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold cursor-pointer shadow-xs disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>
                    {isSendingOffer
                      ? 'Dispatching Offer...'
                      : targetAudience === 'all'
                        ? `Broadcast Offer to All ${customerCarts.length} Customers 📢`
                        : `Send Offer to ${currentCustomer?.customerName} 🚀`}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP BROADCAST ASSISTANT MODAL (For All Customers Broadcast)
          ========================================================================= */}
      {showBroadcastModal && lastDispatchedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    WhatsApp Broadcast Assistant
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click each customer below to send personalized WhatsApp message
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of Customers */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <strong>Offer:</strong> {lastDispatchedOffer.title} ({lastDispatchedOffer.type === 'percentage' ? `${lastDispatchedOffer.value}% OFF` : `-₹${Number(lastDispatchedOffer.value).toLocaleString('en-IN')}`}) • Valid till {lastDispatchedOffer.validTill}
              </div>

              <div className="space-y-2">
                {customerCarts.map((customer, idx) => (
                  <div
                    key={customer.customerId || idx}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-white transition flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900">{customer.customerName}</div>
                      <div className="text-[11px] text-slate-500">{customer.hospitalName} ({customer.phone})</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => sendWhatsAppOfferMessage(customer, lastDispatchedOffer)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <Share2 size={12} />
                      <span>Send WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  const sampleMsg = buildWhatsAppMessage(customerCarts[0] || {}, lastDispatchedOffer);
                  navigator.clipboard.writeText(sampleMsg);
                  setCopiedBroadcastText(true);
                  setTimeout(() => setCopiedBroadcastText(false), 3000);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy size={12} />
                <span>{copiedBroadcastText ? 'Copied to Clipboard!' : 'Copy Template Message'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
