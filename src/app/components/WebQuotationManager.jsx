'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  Save,
  Check,
  Building2,
  Calendar,
  Hash,
  RefreshCw,
  Copy,
  Eye,
  Package,
  Layers,
  History,
  Sparkles,
  X,
  Minus,
  Calculator,
  ArrowRight,
  Maximize2,
  FileCheck,
  CheckCircle2,
  SplitSquareVertical,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
  Info,
  Edit3,
  ExternalLink,
  AlertCircle,
  MessageCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  Lock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { numberToWordsIndian } from '../../lib/numberToWords';
import { useAuth } from '../../lib/AuthContext';

export default function WebQuotationManager({
  products = [],
  initialLeads = [],
  initialQuotations = [],
  initialCustomers = []
}) {
  const authContext = useAuth();
  const user = authContext?.user || null;
  const isAdmin = authContext?.isAdmin || user?.role === 'admin' || user?.role === 'super_admin';

  // Primary Tabs: 'leads' (Incoming Web Leads / New Queries) | 'completed' (All Completed Quotations) | 'quotation' (Active Quotation Workspace)
  const [activeMainTab, setActiveMainTab] = useState('leads');

  // Negotiable Price Approval States
  const [negotiationModalLead, setNegotiationModalLead] = useState(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [counterNoteInput, setCounterNoteInput] = useState('');
  const [negotiationSubmitting, setNegotiationSubmitting] = useState(false);
  const [approvalNoticeModalLead, setApprovalNoticeModalLead] = useState(null);

  // Helper: check if a lead has negotiable price pending admin approval
  const isLeadNegotiablePending = (lead) => {
    if (!lead) return false;
    if (lead.negotiationStatus === 'approved' || lead.negotiationStatus === 'counter_offered') {
      return false; // Approved or countered - employee can make quotation!
    }
    if (lead.negotiationStatus === 'pending_approval') {
      return true;
    }
    if (lead.isPriceNegotiated && !lead.approvedPrice) {
      return true;
    }
    const exp = parseFloat(lead.expectedPrice || 0);
    const act = parseFloat(lead.actualPrice || lead.price || 0);
    if (exp > 0 && act > 0 && exp < act && !lead.approvedPrice && lead.negotiationStatus !== 'approved') {
      return true;
    }
    return false;
  };

  const openNegotiationModal = (lead) => {
    if (!lead) return;
    setNegotiationModalLead(lead);
    const actual = parseFloat(lead.actualPrice || lead.price || 150000);
    const expected = parseFloat(lead.expectedPrice || lead.price || 120000);
    const midpoint = Math.round((actual + expected) / 2);
    setCounterPriceInput(lead.adminCounterPrice ? String(lead.adminCounterPrice) : String(midpoint));
    setCounterNoteInput(lead.adminNote || 'Approved in-between institutional offer with 2-year warranty.');
  };

  const handleApproveCustomerPrice = async (lead) => {
    if (!lead) return;
    setNegotiationSubmitting(true);
    try {
      const approvedAmount = parseFloat(lead.expectedPrice || lead.price || 150000);
      const numQty = parseInt(String(lead.quantity || '1').replace(/\D/g, ''), 10) || 1;
      const totalAmount = approvedAmount * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'approved',
        approvedPrice: approvedAmount,
        price: approvedAmount,
        quoteAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
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

      setWebLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch(e){} }, 5000);
      } catch(e){}

      setSuccessToast(`✅ Price Approved! ₹${approvedAmount.toLocaleString('en-IN')} approved for ${lead.hospital || lead.equipment}. Sales employees can now make the quotation.`);
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
      const numQty = parseInt(String(lead.quantity || '1').replace(/\D/g, ''), 10) || 1;
      const totalAmount = numPrice * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'counter_offered',
        adminCounterPrice: numPrice,
        approvedPrice: numPrice,
        price: numPrice,
        quoteAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
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

      setWebLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch(e){} }, 5000);
      } catch(e){}

      setSuccessToast(`🤝 Counter Offer Set! In-between rate ₹${numPrice.toLocaleString('en-IN')} set for ${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.`);
      setNegotiationModalLead(null);
    } catch (err) {
      console.error('Counter price error:', err);
      alert('Error setting counter price: ' + err.message);
    } finally {
      setNegotiationSubmitting(false);
    }
  };

  const handleRequestAdminApproval = (lead) => {
    setApprovalNoticeModalLead(lead);
    setSuccessToast(`⏳ Admin Price Approval Requested for ₹${(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}. Make Quotation will unlock upon authorization.`);
  };
  const [quotationSearch, setQuotationSearch] = useState('');

  // View Layout Modes: 'split' | 'editor' | 'preview'
  const [activeLayout, setActiveLayout] = useState('preview');
  const [isTransitioningToSplit, setIsTransitioningToSplit] = useState(false);
  const [isLeadsListExpanded, setIsLeadsListExpanded] = useState(true);

  // Transition smoothly from Full-Page Quotation to Split View with drop-down animation
  const handleOpenEditMode = () => {
    setIsTransitioningToSplit(true);
    setActiveLayout('split');
    setTimeout(() => {
      setIsTransitioningToSplit(false);
    }, 700);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Transition smoothly to Full-Page 4-Page Quotation Preview
  const handleOpenFullQuotation = () => {
    setActiveLayout('preview');
    setPreviewPage('all');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Format today as DD.MM.YYYY
  const getTodayFormatted = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const generateRefNo = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mon = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const yr = String(today.getFullYear()).slice(2);
    const rand = Math.floor(100 + Math.random() * 900);
    return `RBPL/Q${rand}${dd}${mon}${yr}`;
  };

  // Quotation Customer & Reference Metadata (Dynamic State)
  const [customerName, setCustomerName] = useState('');
  const [customerAddress1, setCustomerAddress1] = useState('');
  const [customerAddress2, setCustomerAddress2] = useState('');
  const [date, setDate] = useState(getTodayFormatted());
  const [refNo, setRefNo] = useState(generateRefNo());

  // Subjects (Auto-generated or custom overridden)
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [subjectLetter, setSubjectLetter] = useState('Quotation purchase of Laboratory & Medical Equipments');
  const [subjectQuotation, setSubjectQuotation] = useState('Purchase of Medical / Laboratory Equipments');

  // Signatory details (Official Raj Biosis Signatory)
  const [signatoryName, setSignatoryName] = useState('Bhupender Raj');
  const [signatoryRole, setSignatoryRole] = useState('Sales & Mkt. Head');
  const [signatoryCompany, setSignatoryCompany] = useState('Raj Biosis Pvt Ltd.');
  const [signatoryAddress1, setSignatoryAddress1] = useState('B-7, Aman Plaza, Plot No. 26,');
  const [signatoryAddress2, setSignatoryAddress2] = useState('Heera Nagar-A, Chitrakoot');
  const [signatoryCity, setSignatoryCity] = useState('Jaipur-302021 Rajasthan');
  const [signatoryPhone, setSignatoryPhone] = useState('Mob: +91-998-3333-469');

  // Terms & Conditions - Jurisdiction clause (Configurable)
  const [jurisdictionText, setJurisdictionText] = useState('All goods sold are subject to Jaipur Jurisdiction.');

  // Quotation Line Items (100% Dynamic)
  const [items, setItems] = useState([]);

  // New Item Quick Adder Form State
  const [newItemMode, setNewItemMode] = useState('catalog'); // 'catalog' | 'custom'
  const [newTitle, setNewTitle] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newBullets, setNewBullets] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newUnitLabel, setNewUnitLabel] = useState('No');
  const [newUnitPrice, setNewUnitPrice] = useState(50000);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  // Tax & Commercials Controls (Default to 12% GST Extra for Medical Equipment)
  const [taxMode, setTaxMode] = useState('12'); // '12' | '18' | '5' | '28' | 'inclusive' | 'none'
  const [discountPercent, setDiscountPercent] = useState(0);

  // Preview Page Switcher: 'all' | '1' | '2' | '3' | '4'
  const [previewPage, setPreviewPage] = useState('all');

  // Catalog Products (Loaded from MongoDB Atlas API with fallback to initial props)
  const [catalogProducts, setCatalogProducts] = useState(products || []);

  // UI States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [savedQuotations, setSavedQuotations] = useState(() => {
    if (initialQuotations && initialQuotations.length > 0) return initialQuotations;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rbpl_cached_quotations');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState(Date.now());

  // Web Leads State (Instant zero-latency from initialLeads & cache)
  const [webLeads, setWebLeads] = useState(() => {
    if (initialLeads && initialLeads.length > 0) return initialLeads;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rbpl_cached_leads');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isLeadsLoading, setIsLeadsLoading] = useState(() => webLeads.length === 0);
  const [selectedLeadIdx, setSelectedLeadIdx] = useState(0);
  const [isProcessingLeadQuote, setIsProcessingLeadQuote] = useState(false);
  const [processedLeadIds, setProcessedLeadIds] = useState([]);
  const [hasNewLeadAlert, setHasNewLeadAlert] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [incomingQuotationAlert, setIncomingQuotationAlert] = useState(null);
  const [activeNegotiationNotice, setActiveNegotiationNotice] = useState(null);


  // Filter for leads that need a quotation (status 'Pending RFQ' or 'new', and not processed this session)
  const pendingWebLeads = useMemo(() => {
    const seenCustEquip = new Set();
    const seenIds = new Set();
    const result = [];

    // Sort so profile-complete or newer leads are preferred
    const sortedLeads = [...webLeads].sort((a, b) => {
      if (a.isProfileComplete && !b.isProfileComplete) return -1;
      if (!a.isProfileComplete && b.isProfileComplete) return 1;
      return new Date(b.createdAt || b.dateTime || 0) - new Date(a.createdAt || a.dateTime || 0);
    });

    for (const lead of sortedLeads) {
      const id = lead.id || lead._id;
      if (!id || seenIds.has(id) || processedLeadIds.includes(id)) continue;

      // If already processed in this session, skip
      if (processedLeadIds.includes(id)) continue;

      // Completed quotations that were fully dispatched should not show in pending RFQs
      const st = (lead.status || '').toLowerCase();
      if (st.includes('quotation dispatched') || st.includes('completed quote')) continue;

      // Keep: 'pending', 'new', 'rfq', 'approved', 'counter', 'quote generated', or any inquiry
      const isEligible =
        st.includes('pending') ||
        st.includes('new') ||
        st.includes('rfq') ||
        st.includes('approved') ||
        st.includes('counter') ||
        st.includes('quote generated') ||
        st.includes('quotation sent') ||
        lead.negotiationStatus === 'approved' ||
        lead.negotiationStatus === 'counter_offered' ||
        lead.negotiationStatus === 'pending_approval' ||
        Boolean(lead.approvedPrice) ||
        Boolean(lead.isPriceNegotiated);

      if (!isEligible) continue;

      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const equipClean = (lead.equipment || lead.productName || lead.rawLeadData?.productName || '').trim().toLowerCase();
      const dedupKey = phoneClean && equipClean ? `${phoneClean}::${equipClean}` : id;

      if (seenCustEquip.has(dedupKey)) {
        continue; // Skip duplicate inquiry for same hospital customer and same equipment!
      }

      seenIds.add(id);
      seenCustEquip.add(dedupKey);
      result.push(lead);
    }
    return result;
  }, [webLeads, processedLeadIds]);

  const currentPendingLead = pendingWebLeads[selectedLeadIdx] || pendingWebLeads[0] || null;


  // References to document pages for PDF export
  const exportPage1Ref = useRef(null);
  const exportPage2Ref = useRef(null);
  const exportPage3Ref = useRef(null);
  const exportPage4Ref = useRef(null);

  // References to left form panel and right PDF panel for synchronized scroll lock
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Synchronized scroll chaining: when the left form reaches the bottom, scroll the right-side PDF smoothly!
  useEffect(() => {
    const leftEl = leftPanelRef.current;
    const rightEl = rightPanelRef.current;
    if (!leftEl || !rightEl) return;

    const onLeftWheel = (e) => {
      if (activeLayout !== 'split') return;
      // Check if the left form has reached its bottom (where 4. Authorized Signatory ends)
      const isAtBottom = leftEl.scrollHeight - leftEl.scrollTop <= leftEl.clientHeight + 4;
      if (e.deltaY > 0 && isAtBottom) {
        e.preventDefault();
        rightEl.scrollTop += e.deltaY;
      }
    };

    const onRightWheel = (e) => {
      if (activeLayout !== 'split') return;
      // If user is at the top of the right PDF panel and scrolls up, scroll the left form back up
      if (e.deltaY < 0 && rightEl.scrollTop <= 0 && leftEl.scrollTop > 0) {
        e.preventDefault();
        leftEl.scrollTop += e.deltaY;
      }
    };

    leftEl.addEventListener('wheel', onLeftWheel, { passive: false });
    rightEl.addEventListener('wheel', onRightWheel, { passive: false });

    return () => {
      leftEl.removeEventListener('wheel', onLeftWheel);
      rightEl.removeEventListener('wheel', onRightWheel);
    };
  }, [activeLayout]);

  // Sync initialLeads, initialQuotations, initialCustomers from parent
  useEffect(() => {
    if (initialLeads && initialLeads.length > 0) {
      setWebLeads(initialLeads);
      setIsLeadsLoading(false);
      try { localStorage.setItem('rbpl_cached_leads', JSON.stringify(initialLeads)); } catch (e) {}
    }
  }, [initialLeads]);

  useEffect(() => {
    if (initialQuotations && initialQuotations.length > 0) {
      setSavedQuotations(initialQuotations);
      try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(initialQuotations)); } catch (e) {}
    }
  }, [initialQuotations]);

  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0) {
      setCustomersList(initialCustomers);
      try { localStorage.setItem('rbpl_cached_customers', JSON.stringify(initialCustomers)); } catch (e) {}
    }
  }, [initialCustomers]);

  // Fetch live products from MongoDB Atlas
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setCatalogProducts(data.products);
        }
      })
      .catch(err => console.warn('Catalog fetch error:', err));
  }, []);

  // Fetch saved quotations
  const fetchQuotations = async (silent = false) => {
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (data.success && Array.isArray(data.quotations)) {
        try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(data.quotations)); } catch (e) {}
        setSavedQuotations(prev => {
          const prevIds = new Set(prev.map(q => q.id || q._id || q.refNo));
          const fresh = data.quotations.filter(q => !prevIds.has(q.id || q._id || q.refNo));
          if (fresh.length > 0 && !silent && prev.length > 0) {
            setIncomingQuotationAlert(fresh[0]);
            playLeadNotificationSound();
          }
          return data.quotations;
        });
      }
    } catch (err) {
      console.warn('Quotations fetch failed:', err);
    }
  };

  // Registered customer accounts (Instant zero-latency directory)
  const [customersList, setCustomersList] = useState(() => {
    if (initialCustomers && initialCustomers.length > 0) return initialCustomers;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rbpl_cached_customers');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const fetchCustomerProfiles = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomersList(data.customers);
      }
    } catch (e) { }
  };

  useEffect(() => {
    fetchQuotations();
    fetchCustomerProfiles();
  }, []);

  // Helper to find matched customer profile from registered customer directory (Live & Always fresh)
  const getMatchedCustomer = (lead) => {
    if (!lead || !Array.isArray(customersList) || customersList.length === 0) return null;
    const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || lead.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
    const emailClean = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').trim().toLowerCase();

    return customersList.find(c => {
      const cPhone = (c.phone || '').replace(/\D/g, '').slice(-10);
      const cEmail = (c.email || '').trim().toLowerCase();
      return (phoneClean && cPhone && phoneClean === cPhone) || (emailClean && cEmail && emailClean === cEmail);
    }) || null;
  };

  // Check if a lead's customer profile is complete (ALL 8 fields must be non-empty)
  const isProfileComplete = (lead) => {
    if (!lead) return false;

    // Check matched registered customer account first, or fallback to lead's own fields
    const matched = getMatchedCustomer(lead);
    const raw = lead.rawLeadData || {};

    const fullName = (matched?.fullName || lead.doctorName || raw.customerName || lead.customerName || '').trim();
    const phone = (matched?.phone || lead.phone || lead.customerPhone || raw.customerPhone || raw.phone || '').replace(/\D/g, '');
    const email = (matched?.email || lead.email || lead.customerEmail || raw.customerEmail || '').trim();
    const hospital = (matched?.hospitalName || lead.hospital || raw.hospitalName || lead.hospitalName || '').trim();
    const state = (matched?.state || lead.state || raw.state || '').trim();
    const district = (matched?.district || lead.city || raw.district || lead.district || '').trim();
    const address = (matched?.address || lead.address || raw.address || lead.deliveryAddress || '').trim();
    const pincode = (matched?.pincode || lead.pincode || raw.pincode || '').toString().trim();

    // Generic hospital names are considered incomplete
    const isGenericHosp = !hospital || [
      'clinic / hospital',
      'healthcare facility',
      'general hospital',
      'hospital',
      'healthcare institution',
      'customer hospital / lab',
      'customer hospital / diagnostic lab'
    ].some(g => hospital.toLowerCase() === g || hospital.toLowerCase().includes('healthcare institution'));

    // Strict validation: Every single input must be filled (NONE can be empty)
    const hasName = fullName.length >= 2 && fullName.toLowerCase() !== 'medical client';
    const hasPhone = phone.length >= 10;
    const hasEmail = email.length >= 5 && email.includes('@') && email.includes('.');
    const hasHospital = !isGenericHosp && hospital.length >= 3;
    const hasState = state.length >= 2;
    const hasDistrict = district.length >= 2 && district.toLowerCase() !== 'india';
    const hasAddress = address.length >= 3;
    const hasPincode = pincode.length >= 4;

    return Boolean(
      hasName &&
      hasPhone &&
      hasEmail &&
      hasHospital &&
      hasState &&
      hasDistrict &&
      hasAddress &&
      hasPincode
    );
  };

  // Audio chime helper using Web Audio API (smooth 2-tone clinical chime)
  const playLeadNotificationSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) { }
  };

  // Helper to insert incoming web quotation immediately (0ms latency)
  const insertIncomingQuotation = (quotation) => {
    if (!quotation) return;
    const qId = quotation.id || quotation._id;
    setSavedQuotations(prev => {
      const exists = prev.some(q => (q.id || q._id) === qId || (q.refNo && quotation.refNo && q.refNo === quotation.refNo));
      if (exists) {
        return prev.map(q => (q.id || q._id) === qId || (q.refNo && quotation.refNo && q.refNo === quotation.refNo) ? { ...q, ...quotation } : q);
      }
      return [quotation, ...prev];
    });
    setIncomingQuotationAlert(quotation);
    playLeadNotificationSound();
    const customer = quotation.customerName || 'Website Customer';
    setSuccessToast(`⚡ Stamped Quotation received for ${customer}! (Ref: ${quotation.refNo || 'Generated'})`);
  };

  // Helper to insert incoming web lead immediately (0ms latency)
  const insertIncomingLead = (freshLead) => {
    if (!freshLead) return;
    const freshId = freshLead.id || freshLead._id;
    setWebLeads(prev => {
      const exists = prev.some(l => (l.id || l._id) === freshId);
      if (exists) {
        return prev.map(l => (l.id || l._id) === freshId ? { ...l, ...freshLead } : l);
      }
      return [freshLead, ...prev];
    });
    // Ensure this new lead is not blocked by processed list
    setProcessedLeadIds(prev => prev.filter(id => id !== freshId));
    setSelectedLeadIdx(0);
    setHasNewLeadAlert(true);
    playLeadNotificationSound();
    const hospitalName = freshLead.hospital || freshLead.doctorName || 'Website Customer';
    setSuccessToast(`🔔 New Website RFQ from ${hospitalName}! Click "⚡ New Web Lead" to generate.`);
  };

  // Fetch leads from MongoDB /api/leads
  const fetchWebLeads = async (silent = false) => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setIsLeadsLoading(false);
        try { localStorage.setItem('rbpl_cached_leads', JSON.stringify(data.leads)); } catch (e) {}
        setWebLeads(prev => {
          const prevIds = new Set(prev.map(l => l.id || l._id));
          const hasNew = data.leads.some(l => !prevIds.has(l.id || l._id));
          if (hasNew && !silent) {
            setHasNewLeadAlert(true);
            playLeadNotificationSound();
          }
          // Merge with strict server authority and deduplication by customer+equipment
          const serverIds = new Set(data.leads.map(l => l.id || l._id));
          const serverCustEquip = new Set();
          data.leads.forEach(l => {
            const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
            const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
            if (p && eq) serverCustEquip.add(`${p}::${eq}`);
          });

          const uncommitted = prev.filter(l => {
            if (serverIds.has(l.id || l._id)) return false;
            const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
            const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
            if (p && eq && serverCustEquip.has(`${p}::${eq}`)) return false;
            return true;
          });

          return [...uncommitted, ...data.leads];
        });
      }
    } catch (err) {
      console.warn('Failed to fetch web leads:', err);
    }
  };

  useEffect(() => {
    fetchWebLeads(true);
    fetchQuotations(true);

    // Fast polling every 1200ms so any web submission arrives in ~1 second even without local events
    const interval = setInterval(() => {
      fetchWebLeads(false);
      fetchCustomerProfiles();
      fetchQuotations(false);
    }, 1200);

    // Check for lead or quotation passed from dashboard or local storage
    try {
      if (typeof window !== 'undefined') {
        const activeLeadStr = localStorage.getItem('active_quotation_lead');
        if (activeLeadStr) {
          const parsedLead = JSON.parse(activeLeadStr);
          if (parsedLead) {
            handleMakeQuotationFromLead(parsedLead);
            localStorage.removeItem('active_quotation_lead');
          }
        }
        const activeQuotStr = localStorage.getItem('active_quotation');
        if (activeQuotStr) {
          const parsedQuot = JSON.parse(activeQuotStr);
          if (parsedQuot) {
            handleLoadSavedQuotation(parsedQuot);
            localStorage.removeItem('active_quotation');
          }
        }

        // 1. Initial check on mount from localStorage (only if fresh within last 15 seconds)
        const storedLead = localStorage.getItem('latest_web_lead');
        if (storedLead) {
          const lead = JSON.parse(storedLead);
          const leadTs = lead?.ts || 0;
          if (Date.now() - leadTs < 15 * 1000) {
            insertIncomingLead(lead);
          } else {
            localStorage.removeItem('latest_web_lead');
          }
        }

        const storedQuot = localStorage.getItem('latest_web_quotation');
        if (storedQuot) {
          const quot = JSON.parse(storedQuot);
          const quotTs = quot?.ts || 0;
          if (Date.now() - quotTs < 15 * 1000) {
            insertIncomingQuotation(quot);
          } else {
            localStorage.removeItem('latest_web_quotation');
          }
        }
      }
    } catch (e) { }

    // 2. BroadcastChannel across browser tabs (Same Origin)
    let channel;
    try {
      if (typeof window !== 'undefined') {
        channel = new BroadcastChannel('biomedical_leads_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_WEB_QUOTATION' && event.data.quotation) {
            insertIncomingQuotation(event.data.quotation);
          }
          if (event.data?.type === 'NEW_WEB_LEAD' && event.data.lead) {
            insertIncomingLead(event.data.lead);
          }
        };
      }
    } catch (e) { }

    // 3. Window postMessage listener (for iframes, child windows, and popups)
    const handleWindowMessage = (event) => {
      if (event.data?.type === 'NEW_WEB_QUOTATION' && event.data.quotation) {
        insertIncomingQuotation(event.data.quotation);
      }
      if (event.data?.type === 'NEW_WEB_LEAD' && event.data.lead) {
        insertIncomingLead(event.data.lead);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleWindowMessage);
    }

    // 4. Same-window custom event listener
    const handleCustomLead = (event) => {
      if (event.detail) {
        insertIncomingLead(event.detail);
      }
    };
    const handleCustomQuotation = (event) => {
      if (event.detail) {
        insertIncomingQuotation(event.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('new_web_lead', handleCustomLead);
      window.addEventListener('new_web_quotation', handleCustomQuotation);
    }

    // 5. LocalStorage storage event listener (cross-window fallback)
    const handleStorage = (e) => {
      if (e.key === 'latest_web_quotation' && e.newValue) {
        try {
          const quot = JSON.parse(e.newValue);
          if (quot) insertIncomingQuotation(quot);
        } catch (err) { }
      }
      if (e.key === 'latest_web_lead' && e.newValue) {
        try {
          const lead = JSON.parse(e.newValue);
          if (lead) insertIncomingLead(lead);
        } catch (err) { }
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      clearInterval(interval);
      if (channel) {
        try { channel.close(); } catch (e) { }
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleWindowMessage);
        window.removeEventListener('new_web_lead', handleCustomLead);
        window.removeEventListener('new_web_quotation', handleCustomQuotation);
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  // 1-SECOND INSTANT QUOTATION GENERATOR FROM WEB LEAD
  const handleMakeQuotationFromLead = (lead) => {
    if (!lead) return;
    setIsProcessingLeadQuote(true);

    const matchedCustomer = getMatchedCustomer(lead);
    const raw = lead.rawLeadData || {};

    // 1. Customer & Hospital Information
    const hospitalName = (
      matchedCustomer?.hospitalName ||
      lead.hospital ||
      raw.hospitalName ||
      lead.hospitalName ||
      lead.doctorName ||
      raw.customerName ||
      'Customer Hospital / Diagnostic Lab'
    ).trim();
    setCustomerName(hospitalName);

    const docName = matchedCustomer?.fullName || lead.doctorName || raw.customerName || '';
    const doctorPart = docName ? `Attn: ${docName}` : 'Attn: Procurement Officer';
    const phoneVal = matchedCustomer?.phone || lead.phone || raw.customerPhone || raw.phone;
    const phonePart = phoneVal ? `Mob: ${phoneVal}` : '';
    setCustomerAddress1([doctorPart, phonePart].filter(Boolean).join(', '));

    const cityPart = matchedCustomer?.district || matchedCustomer?.address || lead.city || raw.district || raw.city || lead.address || raw.address || 'Jaipur, Rajasthan';
    const emailVal = matchedCustomer?.email || lead.email || raw.customerEmail;
    const emailPart = emailVal ? `Email: ${emailVal}` : '';
    setCustomerAddress2([cityPart, emailPart].filter(Boolean).join(' • '));

    // 2. Reference & Date
    const freshRef = generateRefNo();
    setRefNo(freshRef);
    setDate(getTodayFormatted());

    // 3. Product Parsing & Line Items Matching
    let rawQty = 1;
    let rawTitle = (lead.productName || lead.equipment || raw.productName || 'Biomedical Diagnostic System').trim();
    const qtyMatch = rawTitle.match(/\(x(\d+)\)/i);
    if (qtyMatch) {
      rawQty = parseInt(qtyMatch[1], 10) || 1;
      rawTitle = rawTitle.replace(/\(x\d+\)/i, '').trim();
    } else if (lead.quantity) {
      const parsed = parseInt(String(lead.quantity).replace(/[^0-9]/g, ''), 10);
      if (parsed > 0) rawQty = parsed;
    } else if (raw.qty || raw.quantity) {
      const parsed = parseInt(String(raw.qty || raw.quantity).replace(/[^0-9]/g, ''), 10);
      if (parsed > 0) rawQty = parsed;
    }

    // Match against catalog products
    const matched = catalogProducts.find(cp => {
      if (lead.productId && cp.id === lead.productId) return true;
      if (raw.productId && cp.id === raw.productId) return true;
      if (lead.productSku && cp.sku?.toLowerCase() === lead.productSku.toLowerCase()) return true;
      if (raw.productSku && cp.sku?.toLowerCase() === raw.productSku.toLowerCase()) return true;
      const cpName = (cp.name || cp.title || '').toLowerCase();
      const target = rawTitle.toLowerCase();
      return cpName.includes(target) || target.includes(cpName);
    });

    let itemTitle = rawTitle;
    let itemCode = lead.productSku || raw.productSku || (matched?.sku || 'MED-2026');
    let unitPrice = 150000;
    let bulletsList = [];

    if (matched) {
      itemTitle = matched.name || matched.title || rawTitle;
      itemCode = matched.sku || matched.model || itemCode;
      unitPrice = parseFloat(matched.price) || 150000;

      if (matched.specs && typeof matched.specs === 'object') {
        bulletsList = Object.entries(matched.specs).slice(0, 5).map(([k, v]) => `${k}: ${v}`);
      } else if (matched.features && Array.isArray(matched.features)) {
        bulletsList = matched.features.slice(0, 5);
      }
      if (bulletsList.length === 0 && matched.shortDesc) {
        bulletsList.push(matched.shortDesc);
      }
    } else {
      const parsedAmount = parseFloat((lead.quoteAmount || '').replace(/[^0-9.]/g, '')) || 0;
      if (parsedAmount > 0) {
        unitPrice = Math.round(parsedAmount / rawQty);
      } else if (lead.price || raw.unitPrice) {
        unitPrice = parseFloat(lead.price || raw.unitPrice) || 150000;
      }

      if (lead.specs && typeof lead.specs === 'object') {
        bulletsList = Object.entries(lead.specs).slice(0, 5).map(([k, v]) => `${k}: ${v}`);
      } else if (lead.features && Array.isArray(lead.features)) {
        bulletsList = lead.features.slice(0, 5);
      }
    }

    // OVERRIDE WITH ADMIN APPROVED OR COUNTER-OFFERED NEGOTIATION PRICE
    if (lead.negotiationStatus === 'approved' && lead.approvedPrice) {
      unitPrice = parseFloat(lead.approvedPrice);
      setActiveNegotiationNotice({
        type: 'approved',
        price: unitPrice,
        message: `Admin Approved Negotiated Price Applied: ₹${unitPrice.toLocaleString('en-IN')} (Target Price Approved by Admin)`
      });
    } else if (lead.negotiationStatus === 'counter_offered' && lead.adminCounterPrice) {
      unitPrice = parseFloat(lead.adminCounterPrice);
      setActiveNegotiationNotice({
        type: 'counter_offered',
        price: unitPrice,
        message: `Admin Counter-Offer Rate Applied: ₹${unitPrice.toLocaleString('en-IN')}${lead.adminNote ? ` — Note: "${lead.adminNote}"` : ''}`
      });
    } else if (lead.expectedPrice && !lead.isPriceNegotiated) {
      unitPrice = parseFloat(lead.expectedPrice);
      setActiveNegotiationNotice(null);
    } else if (lead.approvedPrice) {
      unitPrice = parseFloat(lead.approvedPrice);
      setActiveNegotiationNotice(null);
    } else {
      setActiveNegotiationNotice(null);
    }

    if (bulletsList.length === 0) {
      bulletsList = [
        'CDSCO Medical Device Rules 2017 & ISO 13485:2016 Certified Direct OEM Unit',
        'Complete unboxing, hospital electrical grounding & on-site clinical commissioning',
        'Includes 2-Year Comprehensive OEM Warranty & 24/7 on-call engineering breakdown response'
      ];
    }

    const leadQuotationItem = {
      id: `lead-item-${Date.now()}`,
      sr: 1,
      itemCode,
      title: itemTitle,
      bullets: bulletsList.join('\n'),
      qty: rawQty,
      unitLabel: 'No',
      unitPrice
    };

    setItems([leadQuotationItem]);

    // 4. Quotation Subjects
    setSubjectLetter(`Quotation purchase of ${itemTitle}`);
    setSubjectQuotation(`Purchase of ${itemTitle}${itemCode ? `, Model: ${itemCode}` : ''}`);
    setIsCustomSubject(false);

    // 5. Commercials & Taxes (Include GST % as requested)
    const extractedGst = String(
      lead.gstRate ||
      lead.rawLeadData?.gstRate ||
      (matched?.category === 'radiology-imaging' ? '18' : '12')
    ).replace(/[^0-9]/g, '');
    setTaxMode(extractedGst || '12');
    setDiscountPercent(0);

    // 6. Mark Lead as Processed
    const leadId = lead.id || lead._id;
    if (leadId) {
      setProcessedLeadIds(prev => [...prev, leadId]);
    }

    try {
      fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, _id: lead._id, status: 'Quote Generated' })
      }).catch(() => { });
    } catch (e) { }

    // Automatically switch to FULL PAGE 4-Page Quotation view on Quotation tab!
    setActiveMainTab('quotation');
    setActiveLayout('preview');
    setPreviewPage('all');
    setSuccessToast(`⚡ 4-Page Quotation Ready for ${hospitalName}! Full Page View active. Click " Edit Quotation" to modify details.`);
    setLastActionTimestamp(Date.now());
    setIsProcessingLeadQuote(false);
    setHasNewLeadAlert(false);

    // Smooth scroll to top so toolbar and quotation are cleanly visible
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Simulate a test web lead trigger (for testing without needing a second browser window)
  const handleSimulateWebLead = async () => {
    const sampleLeads = [
      {
        doctorName: 'Dr. Vikram Rathore, MD',
        hospital: 'AIIMS New Delhi (Central ICU)',
        city: 'New Delhi',
        email: 'procurement@aiims.edu',
        phone: '+91 98100 11223',
        equipment: 'RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator',
        productName: 'RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator',
        productSku: 'RAJ-ICU-8801',
        price: 485000,
        quantity: '2 Units',
        quoteAmount: '₹9,70,000',
        siteDomain: 'rajbiosis.com',
        brandName: 'Raj Biosis OEM',
        status: 'Pending RFQ'
      },
      {
        doctorName: 'Dr. Priya Nair, Nephrology Head',
        hospital: 'Manipal Hospital Bengaluru',
        city: 'Bengaluru',
        email: 'priya.nair@manipalhospitals.com',
        phone: '+91 98440 22331',
        equipment: 'CardioPulse Multi-Para Patient Monitor 12.1"',
        productName: 'CardioPulse Multi-Para Patient Monitor 12.1"',
        productSku: 'RAJ-ICU-604',
        price: 68500,
        quantity: '4 Units',
        quoteAmount: '₹2,74,000',
        siteDomain: 'cardiopulse.in',
        brandName: 'CardioPulse Medical',
        status: 'Pending RFQ'
      },
      {
        doctorName: 'Dr. Anita Sen, MS',
        hospital: 'Tata Memorial Hospital',
        city: 'Mumbai',
        email: 'anita.sen@tmc.gov.in',
        phone: '+91 98450 77881',
        equipment: 'Semi-Automated Clinical Chemistry Quantification Analyzer',
        productName: 'Semi-Automated Clinical Chemistry Quantification Analyzer',
        productSku: 'CQ-2026',
        price: 150000,
        quantity: '1 Unit',
        quoteAmount: '₹1,50,000',
        siteDomain: 'surgitech.in',
        brandName: 'SurgiTech Systems',
        status: 'Pending RFQ'
      }
    ];

    const randomSample = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    const simLead = {
      id: `sim-${Date.now()}`,
      ...randomSample,
      createdAt: new Date().toISOString(),
      date: 'Just now'
    };

    setWebLeads(prev => [simLead, ...prev]);
    setSelectedLeadIdx(0);
    setHasNewLeadAlert(true);
    playLeadNotificationSound();
    setSuccessToast(`🔔 New RFQ from ${simLead.hospital}! Click "Make Quotation" to generate.`);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simLead)
      });
    } catch (e) { }
  };

  // Clear all leads and start completely fresh
  const handleClearAllWebLeads = async () => {
    setWebLeads([]);
    setProcessedLeadIds([]);
    setSelectedLeadIdx(0);
    setHasNewLeadAlert(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('latest_web_lead');
      }
      await fetch('/api/leads', { method: 'DELETE' });
    } catch (e) { }
    setSuccessToast('🧹 All leads cleared! Starting completely fresh.');
  };


  // Toast Auto-Clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Auto-update subjects when items change (unless user manually entered custom subject)
  useEffect(() => {
    if (items.length > 0 && !isCustomSubject) {
      const firstTitle = items[0].title || 'Lab Equipment';
      if (items.length === 1) {
        setSubjectQuotation(`Purchase of ${firstTitle}${items[0].itemCode ? `, Model: ${items[0].itemCode}` : ''}`);
        setSubjectLetter(`Quotation purchase of ${firstTitle}`);
      } else {
        setSubjectQuotation(`Purchase of ${firstTitle} and ${items.length - 1} other item(s)`);
        setSubjectLetter(`Quotation purchase of Medical / Laboratory Equipments`);
      }
    }
  }, [items, isCustomSubject]);

  // =========================================================================
  // ROCK-SOLID REAL-TIME TOTAL CALCULATIONS
  // =========================================================================
  // Row total calculation helper (always computed dynamically)
  const getItemTotal = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return Math.round(qty * price);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    const disc = parseFloat(discountPercent) || 0;
    if (disc <= 0) return 0;
    return Math.round((subtotal * disc) / 100);
  }, [subtotal, discountPercent]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const taxAmount = useMemo(() => {
    if (taxMode === 'inclusive' || taxMode === 'none') return 0;
    const rate = parseFloat(taxMode) || 0;
    return Math.round((taxableAmount * rate) / 100);
  }, [taxableAmount, taxMode]);

  const grandTotal = useMemo(() => {
    if (taxMode === 'inclusive' || taxMode === 'none') {
      return taxableAmount;
    }
    return taxableAmount + taxAmount;
  }, [taxableAmount, taxAmount, taxMode]);

  const amountInWords = useMemo(() => {
    return numberToWordsIndian(grandTotal);
  }, [grandTotal]);

  // Indian Rupee Currency Formatter
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // =========================================================================
  // DYNAMIC ITEMS CRUD HANDLERS
  // =========================================================================

  // Update existing item in the table
  const handleUpdateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
    setLastActionTimestamp(Date.now());
  };

  // Adjust item quantity with +/- buttons
  const handleAdjustItemQty = (idx, delta) => {
    const current = items[idx];
    const currentQty = parseInt(current.qty, 10) || 1;
    const newQty = Math.max(1, currentQty + delta);
    handleUpdateItem(idx, 'qty', newQty);
  };

  // Remove an item
  const handleRemoveItem = (idx) => {
    if (items.length <= 1) {
      alert('At least one item is required in the quotation.');
      return;
    }
    const updated = items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, sr: i + 1 }));
    setItems(updated);
    setLastActionTimestamp(Date.now());
  };

  // Duplicate an item
  const handleDuplicateItem = (idx) => {
    const source = items[idx];
    const newItem = {
      ...source,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sr: items.length + 1,
      title: `${source.title} (Copy)`
    };
    setItems([...items, newItem]);
    setSuccessToast(`Duplicated "${source.title}"`);
  };

  // Add a new product row into the quotation from the Quick Adder form
  const handleAddNewItemToQuotation = (e) => {
    if (e) e.preventDefault();

    if (!newTitle.trim()) {
      alert('Please enter a Product Name or select from the Catalog!');
      return;
    }

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sr: items.length + 1,
      itemCode: newItemCode.trim(),
      title: newTitle.trim(),
      bullets: newBullets.trim(),
      qty: Math.max(1, parseInt(newQty, 10) || 1),
      unitLabel: newUnitLabel || 'No',
      unitPrice: Math.max(0, parseFloat(newUnitPrice) || 0)
    };

    setItems([...items, newItem]);
    setSuccessToast(`Added "${newItem.title}" to quotation table! Total updated.`);
    setLastActionTimestamp(Date.now());

    // Reset quick adder inputs
    setNewTitle('');
    setNewItemCode('');
    setNewBullets('');
    setNewQty(1);
    setNewUnitPrice(50000);
    setSelectedCatalogId('');
  };

  // Quick Catalog selection handler for the Quick Adder
  const handleCatalogSelection = (productId) => {
    setSelectedCatalogId(productId);
    const prod = catalogProducts.find(p => p.id === productId || p.sku === productId || p.model === productId);
    if (!prod) return;

    const bulletsList = [];
    if (prod.capacity) bulletsList.push(`Capacity: ${prod.capacity}`);
    if (prod.throughput) bulletsList.push(`Throughput: ${prod.throughput}`);
    if (prod.instrument) bulletsList.push(`Compatible Instrument: ${prod.instrument}`);
    if (prod.parameters) bulletsList.push(`Parameters: ${prod.parameters}`);
    if (prod.automation) bulletsList.push(`Automation: ${prod.automation}`);
    if (prod.warranty) bulletsList.push(`Warranty: ${prod.warranty}`);
    if (prod.features && Array.isArray(prod.features)) {
      prod.features.slice(0, 4).forEach(f => bulletsList.push(f));
    }

    setNewTitle(prod.title || prod.name || '');
    setNewItemCode(prod.sku || prod.model || '');
    setNewUnitPrice(parseFloat(prod.price) || 50000);
    setNewBullets(bulletsList.length > 0 ? bulletsList.join('\n') : (prod.desc || 'Hospital Grade Medical Device'));
  };

  // =========================================================================
  // PRESET TEMPLATES
  // =========================================================================

  // Preset 1: Blank / Fresh Quotation
  const handleStartBlankQuotation = () => {
    setCustomerName('');
    setCustomerAddress1('');
    setCustomerAddress2('');
    setRefNo(generateRefNo());
    setDate(getTodayFormatted());
    setSubjectLetter('Quotation purchase of Hospital Equipment');
    setSubjectQuotation('Purchase of Medical Equipment');
    setIsCustomSubject(false);
    setDiscountPercent(0);
    setTaxMode('inclusive');
    setItems([
      {
        id: `item-${Date.now()}`,
        sr: 1,
        itemCode: '',
        title: '',
        bullets: '',
        qty: 1,
        unitLabel: 'No',
        unitPrice: 0
      }
    ]);
    setActiveMainTab('quotation');
    setActiveLayout('split');
    setSuccessToast('Started fresh blank quotation. Ready for your input!');
  };

  // Preset 2: Hindustan Zinc Ltd (Exact Sample from your uploaded PDF)
  const handleLoadDemoHindustanZinc = () => {
    setCustomerName('Hindustan Zinc Limited');
    setCustomerAddress1('Zinc Park, Yashad Bhawan');
    setCustomerAddress2('Udaipur-RAJASTHAN');
    setRefNo('RBPL/Q00130MAY15');
    setDate('30.05.2015');
    setSubjectLetter('Quotation purchase of Lab Equipments');
    setSubjectQuotation('Purchase of Semi-Automated clinical chemistry quantification analyzer, Model: CliniQuant');
    setIsCustomSubject(true);
    setTaxMode('inclusive');
    setDiscountPercent(0);
    setItems([
      {
        id: 'item-demo-1',
        sr: 1,
        itemCode: '',
        title: 'Semi-Automated clinical chemistry quantification analyzer',
        bullets: [
          '7 assay modes',
          'Preloaded test protocols',
          '100 open test programs',
          '32μl quartz flow cell, minimum aspiration of 200μl',
          '200 patient memory',
          'RS 232 interfacing port',
          'Real time graph display',
          'Designed for various assays',
          '  - Clinical chemistry',
          '  - Special proteins',
          '  - Drugs of abuse',
          '  - Theraputic drugs',
          '  - Electrolytes'
        ].join('\n'),
        qty: 1,
        unitLabel: 'No',
        unitPrice: 150000
      }
    ]);
    setSuccessToast('Loaded exact official Hindustan Zinc Limited template from PDF!');
  };

  // Preset 3: Multi-Item Hospital Package
  const handleLoadDemoICUPackage = () => {
    setCustomerName('Max Super Speciality Hospital');
    setCustomerAddress1('1, 2, Press Enclave Road, Saket');
    setCustomerAddress2('New Delhi - 110017');
    setRefNo(`RBPL/Q-MAX-${new Date().getFullYear()}`);
    setDate(getTodayFormatted());
    setSubjectLetter('Quotation for Critical Care ICU Ventilators and Patient Monitors');
    setSubjectQuotation('Purchase of ICU Ventilator Pro-X9 and CardioPulse Multi-Para Monitors');
    setIsCustomSubject(true);
    setTaxMode('inclusive');
    setDiscountPercent(5);
    setItems([
      {
        id: 'item-icu-1',
        sr: 1,
        itemCode: 'RAJ-ICU-8801',
        title: 'RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator',
        bullets: [
          'Turbine-driven ICU life support ventilator (Adult, Pediatric, Neonatal)',
          'Tidal volume range 20ml to 2000ml with High Flow O2 Therapy',
          '15.6 inch Touchscreen with integrated 4.5h battery backup',
          'Modes: VCV, PCV, SIMV, CPAP/PSV, PRVC, APRV, HFNC',
          'Includes mobile cart, breathing circuit, and humidifier'
        ].join('\n'),
        qty: 2,
        unitLabel: 'Nos',
        unitPrice: 485000
      },
      {
        id: 'item-icu-2',
        sr: 2,
        itemCode: 'RAJ-ICU-604',
        title: 'CardioPulse 12.1" Modular Multi-Para Patient Monitor',
        bullets: [
          '6-Parameter ICU Vital Signs Monitor (ECG, SpO2, NIBP, Dual Temp, Resp)',
          'Anti-glare color TFT touchscreen display with Arrhythmia analysis',
          'Central hospital HIS & telemetry network interfacing',
          '2 Years comprehensive replacement warranty'
        ].join('\n'),
        qty: 4,
        unitLabel: 'Nos',
        unitPrice: 68500
      }
    ]);
    setSuccessToast('Loaded multi-item Hospital ICU package template!');
  };

  // Quick Customer Autofill
  const handleQuickCustomer = (name, addr1, addr2) => {
    setCustomerName(name);
    setCustomerAddress1(addr1);
    setCustomerAddress2(addr2);
    setSuccessToast(`Filled customer: "${name}"`);
  };

  // Save to MongoDB
  const handleSaveToMongoDB = async () => {
    if (!customerName.trim()) {
      alert('Please enter Customer / Organization Name!');
      return;
    }

    setIsSavingDb(true);
    try {
      const payload = {
        refNo,
        date,
        customerName,
        customerAddress1,
        customerAddress2,
        subjectLetter,
        subjectQuotation,
        signatory: {
          name: signatoryName,
          role: signatoryRole,
          company: signatoryCompany,
          address1: signatoryAddress1,
          address2: signatoryAddress2,
          city: signatoryCity,
          phone: signatoryPhone
        },
        items: items.map(item => ({
          ...item,
          totalPrice: getItemTotal(item)
        })),
        taxMode,
        discountPercent,
        subtotal,
        taxAmount,
        grandTotal,
        amountInWords
      };

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(data.message || `Quotation saved successfully for "${customerName}"!`);
        fetchQuotations();
      } else {
        alert('Failed to save quotation: ' + data.error);
      }
    } catch (err) {
      alert('Error saving quotation: ' + err.message);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Load a saved quotation from MongoDB
  const handleLoadSavedQuotation = (q) => {
    setCustomerName(q.customerName || '');
    setCustomerAddress1(q.customerAddress1 || '');
    setCustomerAddress2(q.customerAddress2 || '');
    setRefNo(q.refNo || '');
    setDate(q.date || getTodayFormatted());
    setSubjectLetter(q.subjectLetter || 'Quotation purchase of Lab Equipments');
    setSubjectQuotation(q.subjectQuotation || '');
    setIsCustomSubject(true);
    if (q.taxMode && q.taxMode !== 'inclusive' && q.taxMode !== 'none') {
      setTaxMode(q.taxMode);
    } else if (q.gstRate) {
      setTaxMode(String(q.gstRate).replace(/[^0-9]/g, '') || '12');
    } else if (q.grandTotal && q.items?.[0]?.unitPrice) {
      const unitP = Number(q.items[0].unitPrice);
      const diff = Number(q.grandTotal) - unitP;
      if (diff > 0) {
        const inferredRate = Math.round((diff / unitP) * 100);
        setTaxMode(String(inferredRate || '12'));
      } else {
        setTaxMode('12');
      }
    } else {
      setTaxMode('12');
    }
    if (q.discountPercent !== undefined) setDiscountPercent(q.discountPercent);

    if (q.signatory) {
      setSignatoryName(q.signatory.name || 'Bhupender Raj');
      setSignatoryRole(q.signatory.role || 'Sales & Mkt. Head');
      setSignatoryCompany(q.signatory.company || 'Raj Biosis Pvt Ltd.');
      setSignatoryAddress1(q.signatory.address1 || '');
      setSignatoryAddress2(q.signatory.address2 || '');
      setSignatoryCity(q.signatory.city || '');
      setSignatoryPhone(q.signatory.phone || '');
    }
    if (Array.isArray(q.items) && q.items.length > 0) {
      setItems(q.items);
    }
    setIsHistoryDrawerOpen(false);
    setActiveMainTab('quotation');
    setActiveLayout('preview');
    setPreviewPage('all');
    setSuccessToast(`Loaded quotation for "${q.customerName || 'customer'}" in Full Page view!`);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Delete a saved quotation from MongoDB
  const handleDeleteSavedQuotation = async (q, e) => {
    if (e) e.stopPropagation();
    const id = q.id || q._id;
    if (!id) return;
    if (!confirm(`Delete quotation ${q.refNo || ''} for ${q.customerName || 'customer'}?`)) return;

    try {
      setSavedQuotations(prev => prev.filter(item => (item.id || item._id) !== id));
      await fetch(`/api/quotations?id=${id}&refNo=${encodeURIComponent(q.refNo || '')}`, {
        method: 'DELETE'
      });
      setSuccessToast(`Deleted quotation ${q.refNo || ''}`);
    } catch (err) {
      console.warn('Failed to delete quotation:', err);
    }
  };

  // Filter saved quotations by search query
  const filteredSavedQuotations = useMemo(() => {
    if (!quotationSearch.trim()) return savedQuotations;
    const term = quotationSearch.toLowerCase().trim();
    return savedQuotations.filter(q => {
      const matchCustomer = (q.customerName || '').toLowerCase().includes(term);
      const matchRef = (q.refNo || '').toLowerCase().includes(term);
      const matchDate = (q.date || '').toLowerCase().includes(term);
      const matchItem = (q.items || []).some(i => (i.title || '').toLowerCase().includes(term));
      return matchCustomer || matchRef || matchDate || matchItem;
    });
  }, [savedQuotations, quotationSearch]);

  // =========================================================================
  // DOWNLOAD PDF (NAMED AFTER THE CUSTOMER NAME - EXACT REQUIREMENT)
  // =========================================================================
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    // Build the filename dynamically from the Customer Name!
    const cleanCustomer = (customerName || 'Customer')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    const cleanRef = (refNo || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFilename = `${cleanCustomer}_Quotation_${cleanRef}.pdf`;

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Capture all 4 pages from the dedicated export container
      const pages = [
        exportPage1Ref.current,
        exportPage2Ref.current,
        exportPage3Ref.current,
        exportPage4Ref.current
      ];

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        if (!pageEl) continue;

        const canvas = await html2canvas(pageEl, {
          scale: 2, // High resolution
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(297, imgHeight));
      }

      // Download file strictly named after customer!
      pdf.save(pdfFilename);
      setSuccessToast(`Quotation downloaded successfully as "${pdfFilename}"!`);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: Native browser print
      const prevTitle = document.title;
      document.title = pdfFilename.replace('.pdf', '');
      window.print();
      document.title = prevTitle;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    const cleanCustomer = (customerName || 'Customer').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const prevTitle = document.title;
    document.title = `${cleanCustomer}_Quotation`;
    window.print();
    document.title = prevTitle;
  };

  // =========================================================================
  // REUSABLE LETTERHEAD HEADER COMPONENT (EXACT AS USER PDF)
  // =========================================================================
  const DocumentHeader = () => (
    <div className="flex items-start justify-between pb-3 border-b border-transparent">
      {/* Top Left: Logo */}
      <div className="flex items-center gap-2">
        <img
          src="/rajbiosis-logo.png"
          alt="Raj Biosis Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Top Right: Tagline */}
      <div className="text-right pt-2">
        <h2 className="text-lg font-serif font-bold text-[#8B2323] tracking-wide">
          RAJ BIOSIS PVT LTD
        </h2>
        <p className="text-xs italic font-serif text-[#8B2323] mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
          we make healthy world
        </p>
      </div>
    </div>
  );

  // =========================================================================
  // REUSABLE LETTERHEAD FOOTER COMPONENT (EXACT AS USER PDF)
  // =========================================================================
  const DocumentFooter = ({ pageNum }) => (
    <div className="mt-auto pt-6">
      {/* Maroon divider bar */}
      <div className="w-full h-[3px] bg-[#8B2323] mb-2 rounded-full"></div>

      {/* Legal Entity */}
      <div className="text-center font-serif text-[#8B2323] font-bold text-xs uppercase tracking-wider">
        RAJ BIOSIS PRIVATE LIMITED
      </div>

      {/* Address */}
      <div className="text-center font-serif italic text-[10px] text-slate-600 leading-tight mt-0.5">
        B-7, Aman Plaza, Plot No.-26, Heera Nagar-A, Chitrakoot, Jaipur-302021. Rajasthan (India)
      </div>
      <div className="flex items-center justify-between font-serif italic text-[10px] text-slate-600 mt-0.5 px-2">
        <span>Tel.: +91-141-6052-000, +91-998-3333-469; E-mail: info@rajbiosis.com</span>
        <span className="font-semibold text-slate-800 not-italic">Page {pageNum} of 4</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* INCOMING WEB LEADS MODAL (EXACT WIREFRAME DESIGN FROM IMAGE 2) */}
      {isLeadsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[88vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span>Website Quotation Requests</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      {pendingWebLeads.length} Pending
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click &quot;Make Quotation&quot; on any customer below to generate complete quotation within 1 second.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllWebLeads}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200 shadow-2xs flex items-center gap-1.5"
                  title="Clear all leads and start completely fresh"
                >
                  <Trash2 size={13} className="text-rose-600" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateWebLead}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1.5"
                  title="Simulate another test lead"
                >
                  <Plus size={13} className="text-amber-600" />
                  <span>+ Test Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeadsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold ml-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Spacious Cards List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60 custom-scrollbar">
              {pendingWebLeads.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Pending Web Leads</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All website leads have been converted into official quotations.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeadDrawerOpen(false);
                      setActiveMainTab('quotation');
                      handleStartBlankQuotation();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} className="text-sky-600" />
                    <span>Create New Quotation</span>
                  </button>
                </div>
              ) : (
                pendingWebLeads.map((lead, idx) => {
                  const matchedCustomer = getMatchedCustomer(lead);
                  const complete = isProfileComplete(lead);
                  const displayHospital = matchedCustomer?.hospitalName || lead.hospital || lead.doctorName || 'Customer Hospital / Lab';
                  const displayContact = matchedCustomer?.fullName || lead.doctorName || 'Procurement Officer';
                  const displayPhone = matchedCustomer?.phone || lead.phone;
                  const displayEmail = matchedCustomer?.email || lead.email;
                  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'India';

                  return (
                    <div
                      key={lead.id || lead._id || idx}
                      className={`rounded-2xl transition-all duration-200 bg-white border ${complete
                        ? 'border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300'
                        : 'border-amber-200/90 shadow-sm hover:shadow-md hover:border-amber-300'
                        } relative overflow-hidden group`}
                    >
                      {/* Left Status Strip */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${complete ? 'bg-emerald-500' : 'bg-gradient-to-b from-amber-400 to-orange-500'
                          }`}
                      />

                      <div className="p-5 sm:p-6 space-y-4 pl-6 sm:pl-7">
                        {/* Header Row: Hospital Name & Status Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                              {displayHospital}
                            </h4>

                            {lead.siteDomain && (
                              <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold">
                                <span>🌐</span>
                                <span>{lead.siteDomain}</span>
                              </span>
                            )}

                            <span className="text-xs text-slate-500 font-mono font-medium flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                              <Clock size={12} className="text-slate-400" />
                              <span>
                                {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (lead.date || 'Just now'))}
                              </span>
                            </span>
                          </div>

                          <div>
                            {complete ? (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300/80 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Profile Complete</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-300/80 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Profile Incomplete</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info 4-Card Grid (Spacious, Never Overlapping) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Contact Person */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                              <User size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</div>
                              <div className="text-xs font-bold text-slate-900 truncate" title={displayContact}>
                                {displayContact}
                              </div>
                            </div>
                          </div>

                          {/* 2. Mobile Phone */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Phone size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone</div>
                              <div className="text-xs font-mono font-bold text-slate-800 truncate">
                                {displayPhone || <span className="text-slate-400 font-sans italic">Not provided</span>}
                              </div>
                            </div>
                          </div>

                          {/* 3. Official Email */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Mail size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</div>
                              <div className="text-xs font-medium text-slate-700 truncate" title={displayEmail || 'Not provided'}>
                                {displayEmail || <span className="text-slate-400 italic">Not provided</span>}
                              </div>
                            </div>
                          </div>

                          {/* 4. Location */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</div>
                              <div className="text-xs font-semibold text-slate-800 truncate" title={displayLocation}>
                                {displayLocation}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Hardware Requested & Actions */}
                        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-t border-slate-100">
                          {/* Hardware & Price */}
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="px-3.5 py-2 rounded-xl bg-indigo-50/90 text-indigo-950 border border-indigo-100 text-xs font-bold flex items-center gap-2 shadow-2xs">
                              <span className="text-sm">📦</span>
                              <span>{lead.equipment || lead.productName || 'Requested Hardware'}</span>
                            </div>
                            {lead.isPriceNegotiated || lead.expectedPrice ? (
                              lead.negotiationStatus === 'approved' ? (
                                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              ) : lead.negotiationStatus === 'counter_offered' ? (
                                <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs">
                                  <span>🤝</span>
                                  <span>In-Between: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              ) : (
                                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                                  <Tag size={13} className="text-amber-600" />
                                  <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              )
                            ) : (
                              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 font-mono font-black text-xs flex items-center gap-1 shadow-2xs">
                                <span>₹</span>
                                <span>{lead.quoteAmount ? String(lead.quoteAmount).replace(/^₹\s*/, '') : (lead.price ? Number(lead.price).toLocaleString('en-IN') : '1,50,000')}</span>
                              </div>
                            )}
                          </div>

                          {/* Right Action Area */}
                          <div className="shrink-0 flex items-center justify-end gap-2.5">
                            {isLeadNegotiablePending(lead) ? (
                              !isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleRequestAdminApproval(lead)}
                                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ring-2 ring-amber-400/30 tracking-wider uppercase"
                                  title="Customer submitted target discount request. Admin price authorization required."
                                >
                                  <Lock size={15} className="text-amber-100" />
                                  <span>Request Admin Approval</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openNegotiationModal(lead)}
                                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer animate-pulse hover:scale-[1.02] active:scale-[0.98] ring-2 ring-rose-400/30 tracking-wider uppercase"
                                  title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
                                >
                                  <ShieldCheck size={15} className="text-amber-100" />
                                  <span>Review & Approve Price</span>
                                </button>
                              )
                            ) : complete ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleMakeQuotationFromLead(lead);
                                    setIsLeadsModalOpen(false);
                                  }}
                                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ring-2 ring-amber-400/30 tracking-wider uppercase"
                                  title="Click to generate official quotation within 1 second"
                                >
                                  <Sparkles size={16} className="text-amber-100" />
                                  <span>Make Quotation</span>
                                  <ArrowRight size={15} />
                                </button>
                                {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
                                  <button
                                    type="button"
                                    onClick={() => openNegotiationModal(lead)}
                                    className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition cursor-pointer border border-slate-200"
                                    title="Adjust approved price or counter offer"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                                <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-300 text-amber-950 flex items-center gap-2.5 shadow-2xs">
                                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                                    <AlertCircle size={15} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">
                                    Ask customer to complete profile to generate quotation
                                  </span>
                                </div>

                                {lead.phone && (
                                  <a
                                    href={`https://wa.me/91${(lead.phone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello Dr. ${lead.doctorName || lead.customerName || ''}, please complete your profile details (Hospital Name & Delivery Address) on ${lead.siteDomain || 'rajbiosis.com'} so we can generate and issue your official stamped quotation for ${lead.equipment || 'medical equipment'}.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                                    title="Send WhatsApp message asking customer to complete profile"
                                  >
                                    <MessageCircle size={16} className="text-emerald-600" />
                                    <span>WhatsApp Customer</span>
                                    <ExternalLink size={12} className="opacity-70" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px] hidden sm:inline">
                ⚡ 1-Click Automation: Clicking &quot;Make Quotation&quot; populates customer, line items &amp; updates PDF in 1 second.
              </span>
              <button
                type="button"
                onClick={() => setIsLeadsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}


      {/* TOP COMMAND BAR (100% PRESERVED ORIGINAL HEADER) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">

        {/* Upper Row: Title, New Lead Pill & Global Toolbar Actions (Never Collapsing) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

          {/* Left: Title, Badges & Subtitle */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0 mt-0.5 sm:mt-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                  Web Quotation
                </h2>

                {/* Direct Button to Incoming Leads / New Queries page */}
                <button
                  type="button"
                  onClick={() => setActiveMainTab(activeMainTab === 'leads' ? 'quotation' : 'leads')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-extrabold text-xs transition cursor-pointer hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap ${activeMainTab === 'leads'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white ring-2 ring-amber-400/40 shadow-amber-500/25'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  title="Click to view incoming leads and make quotation"
                >
                  <Sparkles size={13} className={activeMainTab === 'leads' ? 'text-amber-100' : 'text-amber-600'} />
                  <span>⚡ Incoming Leads</span>
                  {pendingWebLeads.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeMainTab === 'leads' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                      }`}>
                      {pendingWebLeads.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Global Toolbar Actions (Always on ONE Single Line) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={handleStartBlankQuotation}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200/80 shadow-2xs whitespace-nowrap"
              title="Start a new blank quotation ready for input"
            >
              <Plus size={14} className="text-sky-600" />
              <span>Blank Form</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab(activeMainTab === 'completed' ? 'quotation' : 'completed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-2xs whitespace-nowrap ${activeMainTab === 'completed'
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                }`}
              title="View completed quotations"
            >
              <History size={14} className={activeMainTab === 'completed' ? 'text-indigo-600' : 'text-slate-500'} />
              <span>History</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${activeMainTab === 'completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                {savedQuotations.length}
              </span>
            </button>

            <button
              type="button"
              disabled={isSavingDb}
              onClick={handleSaveToMongoDB}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-emerald-200 shadow-2xs whitespace-nowrap"
            >
              {isSavingDb ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm shadow-sky-500/25 hover:shadow-md whitespace-nowrap"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer shrink-0"
              title="Print or Save via Browser"
            >
              <Printer size={16} />
            </button>
          </div>

        </div>

        {/* Lower Row: Workspace View Selector + Live Metrics Pill Bar (ALWAYS VISIBLE AS BEFORE) */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[11px] whitespace-nowrap">
              Workspace View:
            </span>
            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('quotation');
                  handleOpenEditMode();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-xs ${activeMainTab === 'quotation' && activeLayout === 'split'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <SplitSquareVertical size={13} className={activeMainTab === 'quotation' && activeLayout === 'split' ? 'text-sky-600' : 'text-slate-500'} />
                <span>Split View</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('quotation');
                  setActiveLayout('editor');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-xs ${activeMainTab === 'quotation' && activeLayout === 'editor'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <FileText size={13} className={activeMainTab === 'quotation' && activeLayout === 'editor' ? 'text-indigo-600' : 'text-slate-500'} />
                <span>Form Editor Only</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('quotation');
                  setActiveLayout('preview');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-xs ${activeMainTab === 'quotation' && activeLayout === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <Eye size={13} className={activeMainTab === 'quotation' && activeLayout === 'preview' ? 'text-emerald-600' : 'text-slate-500'} />
                <span>Live 4-Page PDF</span>
              </button>
            </div>
          </div>

          {/* Live Financial Metrics Pill */}
          <div className="flex items-center gap-3 bg-slate-50/90 px-4 py-2 rounded-2xl border border-slate-200/80 font-mono text-xs shrink-0 self-start md:self-auto">
            <span className="text-slate-600 whitespace-nowrap">
              Items: <strong className="text-slate-900">{items.length}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 whitespace-nowrap">
              Grand Total: <strong className="text-emerald-700 font-bold text-sm">₹{formatCurrency(grandTotal)}</strong>
            </span>
            {amountInWords && (
              <span className="text-[11px] text-slate-500 font-sans hidden 2xl:inline max-w-xs truncate" title={amountInWords}>
                ({amountInWords})
              </span>
            )}
          </div>
        </div>

      </div>


      {/* =========================================================================
          TAB 1: INCOMING WEB LEADS QUEUE (SHOWN ONLY ON LEADS TAB - NO FORM BELOW)
          ========================================================================= */}
      {activeMainTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 animate-in fade-in">
          {/* Lead Cards List */}
          <div className="p-4 sm:p-5 bg-slate-50/50 space-y-3.5 max-h-[650px] overflow-y-auto custom-scrollbar">
            {isLeadsLoading && pendingWebLeads.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-xs">
                <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <h4 className="text-sm font-bold text-slate-800">Loading Web Leads & Pricing Requests...</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Syncing live customer hospital inquiries directly from MongoDB...
                </p>
              </div>
            ) : pendingWebLeads.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles size={28} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Pending Web Leads</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All website leads have been converted into quotations. New incoming website leads will appear here automatically.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('quotation');
                    handleStartBlankQuotation();
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} className="text-sky-600" />
                  <span>Create New Quotation</span>
                </button>
              </div>
            ) : (
              pendingWebLeads.map((lead, idx) => {
                const matchedCustomer = getMatchedCustomer(lead);
                const displayHospital = matchedCustomer?.hospitalName || lead.hospital || lead.doctorName || 'Customer Hospital / Lab';
                const displayContact = matchedCustomer?.fullName || lead.doctorName || 'Procurement Officer';
                const displayPhone = matchedCustomer?.phone || lead.phone;
                const displayEmail = matchedCustomer?.email || lead.email;
                const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'India';
                const displayEquipment = lead.equipment || lead.productName || 'Medical Equipment';
                const displayAmount = lead.quoteAmount ? String(lead.quoteAmount).replace(/^₹\s*/, '') : (lead.price ? Number(lead.price).toLocaleString('en-IN') : '1,50,000');

                return (
                  <div
                    key={lead.id || lead._id || idx}
                    className="rounded-2xl transition-all duration-200 bg-white border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-md p-4 sm:p-5 relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500" />

                    <div className="pl-3 sm:pl-4 space-y-3">
                      {/* Top Row: Hospital, Domain & Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition tracking-tight">
                            {displayHospital}
                          </h4>
                          {lead.siteDomain && (
                            <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold">
                              <span>🌐</span>
                              <span>{lead.siteDomain}</span>
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/70">
                            <Clock size={11} className="text-slate-400" />
                            <span>
                              {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (lead.date || 'Just now'))}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>New RFQ</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle: 4 Contact / Location details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <User size={14} className="text-sky-600 shrink-0" />
                          <span className="text-slate-700 font-medium truncate" title={displayContact}>{displayContact}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <Phone size={14} className="text-emerald-600 shrink-0" />
                          <span className="text-slate-800 font-mono font-bold truncate">{displayPhone || 'No phone'}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <Mail size={14} className="text-indigo-600 shrink-0" />
                          <span className="text-slate-600 truncate" title={displayEmail}>{displayEmail || 'No email'}</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 flex items-center gap-2">
                          <MapPin size={14} className="text-amber-600 shrink-0" />
                          <span className="text-slate-700 truncate" title={displayLocation}>{displayLocation}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Hardware Requested & Price Negotiation / MAKE QUOTATION BUTTON */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-bold flex items-center gap-1.5">
                            <Package size={13} className="text-indigo-600" />
                            <span>{displayEquipment}</span>
                          </div>

                          {/* Pricing Display with Real-Time Negotiation Badges */}
                          {lead.isPriceNegotiated || lead.expectedPrice ? (
                            lead.negotiationStatus === 'approved' ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : lead.negotiationStatus === 'counter_offered' ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                                  <span>🤝</span>
                                  <span>In-Between: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                                  <Tag size={13} className="text-amber-600" />
                                  <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                                {lead.actualPrice && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    MRP: ₹{Number(lead.actualPrice).toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Approval Pending
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1">
                              <span>₹{displayAmount}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {displayPhone && (
                            <a
                              href={`https://wa.me/91${(displayPhone || '').replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* ACTION BUTTON: APPROVAL OR MAKE QUOTATION */}
                          {isLeadNegotiablePending(lead) ? (
                            !isAdmin ? (
                              <button
                                type="button"
                                onClick={() => handleRequestAdminApproval(lead)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/30 uppercase tracking-wide"
                                title="Customer submitted target discount request. Admin price authorization required."
                              >
                                <Lock size={14} className="text-amber-100" />
                                <span>Request Admin Approval</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openNegotiationModal(lead)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse hover:scale-105 active:scale-95 ring-2 ring-rose-400/30 uppercase tracking-wide"
                                title="Review Customer Expected Price vs Actual MRP and Approve or Counter"
                              >
                                <ShieldCheck size={14} className="text-amber-100" />
                                <span>Review & Approve Price</span>
                              </button>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleMakeQuotationFromLead(lead)}
                                className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wide ${
                                  lead.negotiationStatus === 'approved'
                                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white ring-2 ring-emerald-400/30'
                                    : lead.negotiationStatus === 'counter_offered'
                                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white ring-2 ring-indigo-400/30'
                                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white ring-2 ring-amber-400/30'
                                }`}
                              >
                                <Sparkles size={14} className="text-white" />
                                <span>
                                  {lead.negotiationStatus === 'approved'
                                    ? `Make Quotation (Approved: ₹${Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')})`
                                    : lead.negotiationStatus === 'counter_offered'
                                    ? `Make Quotation (Counter: ₹${Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')})`
                                    : 'Make Quotation'}
                                </span>
                                <ArrowRight size={13} />
                              </button>
                              {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
                                <button
                                  type="button"
                                  onClick={() => openNegotiationModal(lead)}
                                  className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-slate-200"
                                  title="Adjust approved price or counter offer"
                                >
                                  <Edit3 size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COMPLETED & ISSUED QUOTATIONS (ALL COMPLETED QUOTATIONS SAVED IN DB)
          ========================================================================= */}
      {activeMainTab === 'completed' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Summary & Search Header */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Completed &amp; Issued Quotations
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                    {savedQuotations.length} Issued
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  All generated 4-page official quotations saved in database. Click any quotation to view, edit, or download.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={quotationSearch}
                  onChange={(e) => setQuotationSearch(e.target.value)}
                  placeholder="Search quotations..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                {quotationSearch && (
                  <button
                    type="button"
                    onClick={() => setQuotationSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartBlankQuotation}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer shrink-0"
              >
                <Plus size={14} className="text-sky-600" />
                <span>New Quotation</span>
              </button>
            </div>
          </div>

          {/* Quotations Cards Grid */}
          {filteredSavedQuotations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={26} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {quotationSearch ? 'No matching quotations found' : 'No Completed Quotations Yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {quotationSearch
                  ? `No quotations matched "${quotationSearch}". Try a different keyword.`
                  : 'Generate a quotation from incoming web leads or create a blank quotation to see it saved here.'}
              </p>
              {quotationSearch && (
                <button
                  type="button"
                  onClick={() => setQuotationSearch('')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSavedQuotations.map((q) => {
                const qId = q.id || q._id;
                const totalVal = q.grandTotal || q.totalAmount || q.subtotal || 0;
                const itemsList = q.items || [];
                const firstTitle = itemsList[0]?.title || q.subjectQuotation || 'Medical Equipment';

                return (
                  <div
                    key={qId}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

                    <div className="space-y-3 pt-1">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                            {q.refNo || 'REF-PENDING'}
                          </span>
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

                      {/* Amount Pill */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500 font-medium">Quoted Total:</span>
                        <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          ₹{formatCurrency(totalVal)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSavedQuotation(q)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold text-xs shadow-2xs hover:shadow-xs transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                      >
                        <Eye size={13} className="text-emerald-600" />
                        <span>View  Quotation</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedQuotation(q, e)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition cursor-pointer shrink-0"
                        title="Delete this quotation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACTIVE QUOTATION WORKSPACE (RENDERED ONLY WHEN QUOTATION TAB IS ACTIVE)
          ========================================================================= */}
      {activeMainTab === 'quotation' && (
        <div className={`grid gap-6 items-start transition-all duration-500 ${activeLayout === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
          }`}>

          {/* =========================================================================
            SECTION 1: INTERACTIVE DYNAMIC QUOTATION EDITOR FORM
            ========================================================================= */}
          {(activeLayout === 'split' || activeLayout === 'editor') && (
            <div
              ref={leftPanelRef}
              className={`${activeLayout === 'split'
                ? 'xl:col-span-6 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-2 xl:sticky xl:top-20'
                : 'w-full max-w-4xl mx-auto'
                } space-y-5 custom-scrollbar transition-all duration-500 ${isTransitioningToSplit ? 'animate-form-slide-down' : ''}`}
            >

              {/* STEP 1: CUSTOMER & REFERENCE DATA */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 text-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm tracking-wide flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Building2 size={16} />
                    </div>
                    <span>1. Quotation Reference</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
                    Ref: {refNo}
                  </span>
                </div>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">
                    Customer / Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter Customer or Hospital name..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
                  />

                  {/* Quick Autofill Suggestions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-400">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Zap size={11} className="text-amber-500 fill-amber-500" /> Quick Fill:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickCustomer('Apollo Hospitals Enterprise Ltd.', 'Sarita Vihar, Delhi Mathura Road', 'New Delhi - 110076')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-slate-700 font-semibold cursor-pointer transition border border-slate-200/80 shadow-2xs"
                    >
                      Apollo Hospital
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCustomer('AIIMS New Delhi', 'Ansari Nagar, Sri Aurobindo Marg', 'New Delhi - 110029')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-slate-700 font-semibold cursor-pointer transition border border-slate-200/80 shadow-2xs"
                    >
                      AIIMS Delhi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCustomer('Hindustan Zinc Limited', 'Zinc Park, Yashad Bhawan', 'Udaipur-RAJASTHAN')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-slate-700 font-semibold cursor-pointer transition border border-slate-200/80 shadow-2xs"
                    >
                      Hindustan Zinc (HZL)
                    </button>
                  </div>
                </div>

                {/* Address Lines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Customer Address</label>
                    <input
                      type="text"
                      value={customerAddress1}
                      onChange={(e) => setCustomerAddress1(e.target.value)}
                      placeholder="Street, Area, Building"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-500 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">City, State &amp; PIN</label>
                    <input
                      type="text"
                      value={customerAddress2}
                      onChange={(e) => setCustomerAddress2(e.target.value)}
                      placeholder="City, State - PIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-500 font-medium transition"
                    />
                  </div>
                </div>

                {/* Ref No & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-bold block">Quotation Ref Number</label>
                      <button
                        type="button"
                        onClick={() => setRefNo(generateRefNo())}
                        className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RefreshCw size={11} />
                        <span>New Ref</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="e.g. RBPL/Q00130MAY15"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Quotation Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="DD.MM.YYYY"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Quotation Subject</label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCustomSubject}
                        onChange={(e) => setIsCustomSubject(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-sky-600 cursor-pointer"
                      />
                      <span className="font-semibold">Edit Subject</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={subjectQuotation}
                      disabled={!isCustomSubject}
                      onChange={(e) => setSubjectQuotation(e.target.value)}
                      placeholder="Subject line for Quotation..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-500 disabled:opacity-60 font-medium transition"
                    />
                  </div>
                </div>

              </div>

              {/* STEP 2: ADD NEW PRODUCT TO QUOTATION (DEDICATED QUICK-ADDER) */}
              <div className="bg-gradient-to-br from-indigo-50/50 via-sky-50/30 to-white rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm space-y-5 text-xs">

                <div className="flex items-center justify-between pb-3.5 border-b border-indigo-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
                      <Plus size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        2. Add Product
                      </h3>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center bg-white rounded-xl p-1 border border-indigo-200/60 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setNewItemMode('catalog')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${newItemMode === 'catalog'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Store Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemMode('custom')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${newItemMode === 'custom'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Custom Product
                    </button>
                  </div>
                </div>

                {/* Mode A: Store Catalog Picker */}
                {newItemMode === 'catalog' && (
                  <div className="space-y-2">
                    <label className="text-slate-700 font-bold block">
                      Select Product from Catalog:
                    </label>
                    <select
                      value={selectedCatalogId}
                      onChange={(e) => handleCatalogSelection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-800 font-semibold text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs cursor-pointer"
                    >
                      <option value="">-- Choose a product from catalog --</option>
                      {catalogProducts.map(p => (
                        <option key={p.id || p.sku} value={p.id || p.sku}>
                          {p.title || p.name} — ₹{Number(p.price || 0).toLocaleString('en-IN')} {p.sku ? `(${p.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Inputs for Name, Code, Specs, Qty, Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-slate-700 font-bold block mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Fully Automated Biochemistry Analyzer"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1.5">
                      Model / Item Code
                    </label>
                    <input
                      type="text"
                      value={newItemCode}
                      onChange={(e) => setNewItemCode(e.target.value)}
                      placeholder="e.g. CLINI-QUANT"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Bullets / Specs */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1.5">
                    Specifications (Bullets)
                  </label>
                  <textarea
                    rows={2}
                    value={newBullets}
                    onChange={(e) => setNewBullets(e.target.value)}
                    placeholder="• 7 assay modes&#10;• 100 open test protocols&#10;• 2 Years warranty..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed font-sans outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Commercials: Quantity, Unit, Price, and Live Calculated Total */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-indigo-100 shadow-2xs flex flex-wrap items-end justify-between gap-4">

                  {/* Quantity */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Quantity</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewQty(Math.max(1, (parseInt(newQty, 10) || 1) - 1))}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={newQty}
                        onChange={(e) => setNewQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-center text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setNewQty((parseInt(newQty, 10) || 1) + 1)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                      <select
                        value={newUnitLabel}
                        onChange={(e) => setNewUnitLabel(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-700"
                      >
                        <option value="No">No</option>
                        <option value="Nos">Nos</option>
                        <option value="Sets">Sets</option>
                        <option value="Units">Units</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newUnitPrice}
                      onChange={(e) => setNewUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-32 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-xs"
                    />
                  </div>

                  {/* Calculated Row Total */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Row Total</label>
                    <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-800 text-xs">
                      ₹{formatCurrency((parseInt(newQty, 10) || 1) * (parseFloat(newUnitPrice) || 0))}
                    </div>
                  </div>

                  {/* Big Add Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleAddNewItemToQuotation}
                      className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Plus size={15} />
                      <span>Add Item</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* STEP 3: CURRENT QUOTATION ITEMS LIST (REAL-TIME EDITABLE TABLE) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 text-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm tracking-wide flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Package size={16} />
                      </div>
                      <span>3. Quotation Items ({items.length})</span>
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    Subtotal: ₹{formatCurrency(subtotal)}
                  </span>
                </div>

                {activeNegotiationNotice && (
                  <div className={`p-3.5 mb-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs ${
                    activeNegotiationNotice.type === 'approved'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{activeNegotiationNotice.type === 'approved' ? '✅' : '🤝'}</span>
                      <span>{activeNegotiationNotice.message}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-current shrink-0">
                      Rate: ₹{activeNegotiationNotice.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {/* Items Card / Row List */}
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3.5 relative group transition hover:border-sky-300 shadow-2xs">

                      {/* Item Top Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                            placeholder="Product Name"
                            className="font-bold text-slate-900 text-xs sm:text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-sky-500 outline-none px-1.5 py-1 w-full max-w-sm sm:max-w-md"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                            title="Duplicate this item"
                          >
                            <Copy size={14} />
                          </button>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Delete this row"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Model & Bullets */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Model / Code</label>
                          <input
                            type="text"
                            value={item.itemCode || ''}
                            onChange={(e) => handleUpdateItem(idx, 'itemCode', e.target.value)}
                            placeholder="e.g. CQ-2026"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:border-sky-400"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Specifications</label>
                          <textarea
                            rows={2}
                            value={item.bullets || ''}
                            onChange={(e) => handleUpdateItem(idx, 'bullets', e.target.value)}
                            placeholder="• Bullet 1&#10;• Bullet 2..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed outline-none focus:border-sky-400 font-sans"
                          />
                        </div>
                      </div>

                      {/* Interactive Quantity, Unit Price, and Auto-Computed Total */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200/80 items-center">

                        {/* Quantity */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Quantity</label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustItemQty(idx, -1)}
                              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateItem(idx, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-center text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdjustItemQty(idx, 1)}
                              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                            <select
                              value={item.unitLabel || 'No'}
                              onChange={(e) => handleUpdateItem(idx, 'unitLabel', e.target.value)}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                            >
                              <option value="No">No</option>
                              <option value="Nos">Nos</option>
                              <option value="Sets">Sets</option>
                              <option value="Units">Units</option>
                              <option value="Pcs">Pcs</option>
                            </select>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(idx, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-xs"
                          />
                        </div>

                        {/* Row Total (Dynamically Computed) */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Row Total (₹)</label>
                          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-800 text-xs">
                            ₹{formatCurrency(getItemTotal(item))}
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>

                {/* COMMERCIALS & TAX BREAKDOWN PANEL */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl space-y-4 shadow-sm border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Commercial Summary &amp; Taxes</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 font-medium">GST Mode:</label>
                      <select
                        value={taxMode}
                        onChange={(e) => setTaxMode(e.target.value)}
                        className="text-xs bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 font-semibold outline-none"
                      >
                        <option value="12">+12% GST Extra (Standard Medical Equipment)</option>
                        <option value="18">+18% GST Extra (Radiology & Diagnostic Devices)</option>
                        <option value="5">+5% GST Extra</option>
                        <option value="28">+28% GST Extra</option>
                        <option value="inclusive">GST Inclusive (100% Final Price)</option>
                        <option value="none">No Tax (0% Exempt)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Items Subtotal ({items.length} items):</span>
                      <span className="font-mono font-bold text-sm">₹{formatCurrency(subtotal)}</span>
                    </div>

                    {taxAmount > 0 && (
                      <div className="flex items-center justify-between text-indigo-300 font-mono">
                        <span>GST (+{taxMode}% Extra):</span>
                        <span className="font-bold">+₹{formatCurrency(taxAmount)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm font-bold text-white pt-2.5 border-t border-slate-800">
                      <span className="text-emerald-400 text-sm font-extrabold">Final Quotation Amount:</span>
                      <span className="text-emerald-400 font-mono text-lg font-black">
                        ₹{formatCurrency(grandTotal)}
                      </span>
                    </div>

                    {/* Dynamic English Words Conversion Display */}
                    <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-300 leading-snug">
                      <span className="text-slate-400">Amount in Words (English): </span>
                      <strong className="text-emerald-300 italic">Rs. {amountInWords} only</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* STEP 4: OFFICIAL SIGNATORY CUSTOMIZER */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4 text-xs">
                <span className="font-extrabold text-slate-900 text-sm tracking-wide block">
                  4. Authorized Signatory
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Name</label>
                    <input
                      type="text"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Designation</label>
                    <input
                      type="text"
                      value={signatoryRole}
                      onChange={(e) => setSignatoryRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Company</label>
                    <input
                      type="text"
                      value={signatoryCompany}
                      onChange={(e) => setSignatoryCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={signatoryPhone}
                      onChange={(e) => setSignatoryPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                {/* Jurisdiction Clause Customizer */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    6. Legal Jurisdiction Clause
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={jurisdictionText}
                      onChange={(e) => setJurisdictionText(e.target.value)}
                      placeholder="All goods sold are subject to Jaipur Jurisdiction."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:bg-white focus:border-sky-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setJurisdictionText('All goods sold are subject to Jaipur Jurisdiction.')}
                      className="px-3 py-2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition"
                      title="Reset to default Jaipur Jurisdiction"
                    >
                      Reset
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    This clause appears on Page 4 (Section 6: Jurisdiction) of the official 4-Page Quotation PDF.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
            SECTION 2: LIVE 4-PAGE OFFICIAL RAJ BIOSIS PDF DOCUMENT PREVIEW
            ========================================================================= */}
          {(activeLayout === 'split' || activeLayout === 'preview') && (
            <div
              ref={rightPanelRef}
              className={`${activeLayout === 'split'
                ? 'xl:col-span-6 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pl-1 xl:pr-2 xl:sticky xl:top-20'
                : 'w-full'
                } space-y-4 custom-scrollbar transition-all duration-500 ${isTransitioningToSplit ? 'animate-quotation-slide-side' : ''}`}
            >

              {/* Page Tab Selector Toolbar (Sticky at Top of PDF Panel) */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="grid grid-cols-5 gap-1.5 w-full sm:w-auto bg-slate-100/90 p-1.5 rounded-xl">
                  {[
                    { id: 'all', label: 'All Pages' },
                    { id: '1', label: 'Page 1' },
                    { id: '2', label: 'Page 2' },
                    { id: '3', label: 'Page 3' },
                    { id: '4', label: 'Page 4' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPreviewPage(p.id);
                        if (rightPanelRef.current) {
                          rightPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`py-2 px-3 text-center rounded-lg font-bold text-xs transition cursor-pointer truncate ${previewPage === p.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Action Buttons in PDF Toolbar */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {activeLayout === 'preview' ? (
                    <button
                      type="button"
                      onClick={handleOpenEditMode}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/30 whitespace-nowrap"
                      title="Click to edit quotation details in split view with smooth animation"
                    >
                      <Edit3 size={14} className="text-amber-100" />
                      <span> Edit Quotation</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenFullQuotation}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-200/80 shadow-2xs whitespace-nowrap"
                      title="Maximize to 4-Page Full Page View"
                    >
                      <Maximize2 size={13} className="text-slate-600" />
                      <span>Full Page</span>
                    </button>
                  )}
                </div>
              </div>

              {/* LIVE DOCUMENT CANVAS STACK */}
              <div className="space-y-6 flex flex-col items-center">

                {/* ===================================================================
                  PAGE 1: OFFICIAL TRANSMITTAL COVER LETTER (COMPULSORY)
                  =================================================================== */}
                {(previewPage === 'all' || previewPage === '1') && (
                  <div
                    className="quotation-page w-full max-w-[760px] bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 relative flex flex-col min-h-[1020px] text-[#222222] font-serif leading-relaxed"
                    style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
                  >
                    {/* Subtle Background Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                      <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                        Rajbiosis
                      </span>
                    </div>

                    <DocumentHeader />

                    {/* Ref & Date */}
                    <div className="flex items-center justify-between text-xs pt-4 font-sans font-medium text-slate-800">
                      <span>Ref: <strong className="font-mono">{refNo}</strong></span>
                      <span>Dated: <strong className="font-mono">{date}</strong></span>
                    </div>

                    {/* Dynamic Addressee */}
                    <div className="pt-4 text-xs space-y-0.5">
                      <div className="italic">To,</div>
                      <div className="font-bold text-slate-900 not-italic text-sm">
                        {customerName || <span className="text-amber-600 italic bg-amber-50 px-1 py-0.5 rounded border border-dashed border-amber-300">[Enter Customer Name in Form]</span>}
                      </div>
                      <div className="italic text-slate-700">
                        {customerAddress1 || (customerName ? '' : '[Customer Address Line 1]')}
                      </div>
                      <div className="italic text-slate-700">
                        {customerAddress2 || (customerName ? '' : '[City, State, PIN]')}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="pt-4 text-xs font-bold text-slate-900">
                      <u>Sub: {subjectLetter}</u>
                    </div>

                    {/* Letter Body (Verbatim official text from PDF) */}
                    <div className="pt-4 text-xs space-y-3.5 text-slate-800 text-justify leading-relaxed">
                      <div>Dear Sir,</div>

                      <p>
                        At the outset, we wish to thank you for giving us an opportunity to explore a business opportunity with your esteemed organization. Its great pleasure to introduce to you our Instrument should allow you to significantly increase the productivity and performance in your laboratory.
                      </p>

                      <p>
                        We at RAJ BIOSIS PVT LTD. believe these instruments will be very helpful in serving customers. We are more than willing to assist you in explaining about the features and advantages and our representatives will make themselves available for any further information.
                      </p>

                      <p>
                        In view of the same, please find attached herewith our quotations along with other enclosures for your kind perusal.
                      </p>

                      <p>
                        For any queries please feel free to revert.
                      </p>

                      <p>
                        We want to see you succeed and when you succeed, we succeed.
                      </p>

                      <div className="pt-2">Yours faithfully,</div>

                      {/* Signatory block */}
                      <div className="pt-4 space-y-0.5 italic text-slate-800 text-xs">
                        <div className="font-bold not-italic text-slate-900">{signatoryName}</div>
                        <div>{signatoryRole}</div>
                        <div className="not-italic font-medium">{signatoryCompany}</div>
                        <div>{signatoryAddress1}</div>
                        <div>{signatoryAddress2}</div>
                        <div>{signatoryCity}</div>
                        <div className="not-italic font-mono font-medium">{signatoryPhone}</div>
                      </div>
                    </div>

                    <DocumentFooter pageNum="1" />
                  </div>
                )}

                {/* ===================================================================
                  PAGE 2: OFFICIAL QUOTATION TABLE WITH DYNAMIC ITEMS & TOTAL
                  =================================================================== */}
                {(previewPage === 'all' || previewPage === '2') && (
                  <div
                    className="quotation-page w-full max-w-[760px] bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 relative flex flex-col min-h-[1020px] text-[#222222] font-serif leading-relaxed"
                    style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
                  >
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                      <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                        Rajbiosis
                      </span>
                    </div>

                    <DocumentHeader />

                    {/* Underlined QUOTATION Title */}
                    <div className="text-center pt-2 pb-1">
                      <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
                        QUOTATION
                      </h3>
                    </div>

                    {/* Ref & Date */}
                    <div className="flex items-center justify-between text-xs font-sans font-medium text-slate-800">
                      <span>Ref: <strong className="font-mono">{refNo}</strong></span>
                      <span>Dated: <strong className="font-mono">{date}</strong></span>
                    </div>

                    {/* To Customer */}
                    <div className="pt-3 text-xs space-y-0.5">
                      <div className="italic">To,</div>
                      <div className="font-bold text-slate-900 not-italic text-sm">
                        {customerName || <span className="text-amber-600 italic bg-amber-50 px-1 py-0.5 rounded border border-dashed border-amber-300">[Enter Customer Name in Form]</span>}
                      </div>
                      <div className="italic text-slate-700">
                        {customerAddress1 || (customerName ? '' : '[Customer Address Line 1]')}
                      </div>
                      <div className="italic text-slate-700">
                        {customerAddress2 || (customerName ? '' : '[City, State, PIN]')}
                      </div>
                    </div>

                    {/* Dynamic Subject */}
                    <div className="pt-3 text-xs font-bold text-slate-900">
                      Sub: {subjectQuotation}
                    </div>

                    {/* Greeting */}
                    <div className="pt-2 text-xs text-slate-800">
                      <div>Dear Sir,</div>
                      <div className="mt-1">
                        With reference to your request, please find the final Non-negotiable Quotation for your perusal.
                      </div>
                    </div>

                    {/* DYNAMIC ITEMS TABLE (EXACT BLACK BORDERS AS IN PDF) */}
                    <div className="pt-3 w-full">
                      <table className="w-full border-collapse border border-black text-xs font-sans">
                        <thead>
                          <tr className="border-b border-black text-slate-900 font-bold bg-white text-center">
                            <th className="border-r border-black p-2 w-[8%] text-center">Sr<br />No.</th>
                            <th className="border-r border-black p-2 w-[14%] text-center">Item<br />Code</th>
                            <th className="border-r border-black p-2 w-[46%] text-left">Description</th>
                            <th className="border-r border-black p-2 w-[8%] text-center">Qty.</th>
                            <th className="border-r border-black p-2 w-[12%] text-right">Unit Price</th>
                            <th className="border-r border-black p-2 w-[12%] text-right">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-black align-top">
                              <td className="border-r border-black p-2 text-center font-bold">
                                {idx + 1}
                              </td>
                              <td className="border-r border-black p-2 font-mono text-center text-[11px]">
                                {item.itemCode || '-'}
                              </td>
                              <td className="border-r border-black p-2.5 text-xs">
                                <div className="font-bold italic text-slate-900 mb-1">
                                  {item.title || <span className="text-slate-400 italic">[Item Title]</span>}
                                </div>
                                {item.bullets && (
                                  <ul className="text-[11px] text-slate-700 space-y-0.5 pl-2 list-none font-sans">
                                    {item.bullets.split('\n').filter(Boolean).map((bullet, bIdx) => (
                                      <li key={bIdx} className="leading-snug">
                                        {bullet.trim().startsWith('•') || bullet.trim().startsWith('-') ? bullet : `• ${bullet}`}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                              <td className="border-r border-black p-2 text-center font-bold font-mono">
                                {item.qty}{item.unitLabel || 'No'}
                              </td>
                              <td className="border-r border-black p-2 text-right font-mono font-medium">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="p-2 text-right font-mono font-bold">
                                {formatCurrency(getItemTotal(item))}
                              </td>
                            </tr>
                          ))}

                          {/* TAX / GST ROW (IF APPLIED) */}
                          {taxAmount > 0 && (
                            <tr className="border-b border-black font-semibold text-slate-800 text-[11px]">
                              <td colSpan={4} className="border-r border-black p-2 text-right bg-white">
                                Add: GST @ {taxMode}%:
                              </td>
                              <td colSpan={2} className="p-2 text-right font-mono font-bold bg-white">
                                +{formatCurrency(taxAmount)}
                              </td>
                            </tr>
                          )}

                          {/* TOTAL SUMMARY ROW WITH DYNAMIC ENGLISH WORDS */}
                          <tr className="font-bold text-slate-900">
                            <td colSpan={4} className="border-r border-black p-2.5 text-left text-xs bg-white">
                              <span>(In Words: </span>
                              <span className="font-bold not-italic">Rs. {amountInWords} only</span>
                              <span>)</span>
                            </td>
                            <td colSpan={2} className="p-2.5 text-right text-xs font-mono font-extrabold bg-white">
                              <span>Total (Rs.): </span>
                              <span>{formatCurrency(grandTotal)}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Sign-off & Disclaimers */}
                    <div className="pt-4 text-xs space-y-1">
                      <div className="font-bold text-slate-900">
                        For RAJ BIOSIS PVT. LTD..
                      </div>

                      {/* Authorized Signature Box */}
                      <div className="h-10"></div>

                      <div className="font-bold text-slate-800">
                        Marketing/Technical Dept.
                      </div>

                      <div className="text-[11px] font-sans font-bold text-slate-700 pt-1 space-y-0.5">
                        <div>&#10148; SEE OVERLEAF FOR TERMS &amp; CONDITIONS</div>
                        <div>&#10148; QUOTATION VALID FOR A PERIOD OF 30 DAYS</div>
                      </div>
                    </div>

                    <DocumentFooter pageNum="2" />
                  </div>
                )}

                {/* ===================================================================
                  PAGE 3: OFFICIAL TERMS AND CONDITIONS - PART 1 (COMPULSORY)
                  =================================================================== */}
                {(previewPage === 'all' || previewPage === '3') && (
                  <div
                    className="quotation-page w-full max-w-[760px] bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 relative flex flex-col min-h-[1020px] text-[#222222] font-serif leading-relaxed"
                    style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
                  >
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                      <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                        Rajbiosis
                      </span>
                    </div>

                    <DocumentHeader />

                    {/* Title */}
                    <div className="text-center pt-3 pb-3">
                      <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
                        TERMS AND CONDITIONS
                      </h3>
                    </div>

                    {/* Terms Sections (Exact text from PDF) */}
                    <div className="text-xs space-y-4 text-slate-800 text-justify leading-relaxed">

                      {/* 1. Title and Payment */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">1. TITLE AND PAYMENT</div>
                        <ul className="space-y-1.5 pl-3 list-none">
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>All payments shall be made in favor of &lsquo;RAJ BIOSIS PVT LTD&rsquo; only by Cheque/ Demand Draft or Pay Order payable at Jaipur.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Cash payment shall not be entertained nor any receipt be issued to that effect. RAJ BIOSIS Pvt. Ltd. (RBPL) shall not be responsible for any cash transaction</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>RAJ BIOSIS Pvt. Ltd shall issue stamped receipt after the realization of the instrument and such receipt shall be issued only from the Head Office</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Any delay beyond the stipulated/agreed credit period shall attract interest at the rate of 24% p.a.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Till all payments are received, RBPL shall be the owner of the instrument and shall be at liberty to repossess the instrument from the client&rsquo;s premises without assigning any notice or reason thereof.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Where any cheque is issued by any third party other than the invoiced party, that third party shall be deemed to be a co-borrower / co-purchaser for all legal purposes on the ground that such cheques are issued on the above terms.</span>
                          </li>
                        </ul>
                      </div>

                      {/* 2. Warranty */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">2. WARRANTY</div>
                        <ul className="space-y-1.5 pl-3 list-none">
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>The warranty of the instrument stands for a period of 12 months</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>In the event of instrument being attended to by any unauthorized person/agency, the warranty stands void and cancelled.</span>
                          </li>
                        </ul>
                      </div>

                      {/* 3. Delivery & Risks */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">3. DELIVERY &amp; RISKS</div>
                        <ul className="space-y-1.5 pl-3 list-none">
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>In case of any delay in delivery, the party shall immediately intimate in writing, the Customer Service Department(CSD) at the Head Office of RBPL to that effect by means of a Registered A.D. Letter</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Once the goods are delivered, the onus of safe guarding the instrument/ reagents shall be on the buyer</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>RBPL insures the instrument/ reagents during transit only and upon delivery, the responsibility shall be on the buyer</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>RBPL may arrange for Calibration Certificate at the request and cost of the Customer</span>
                          </li>
                        </ul>
                      </div>

                      {/* 4. Cancellation / Return */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">4. CANCELLATION / RETURN</div>
                        <ul className="space-y-1.5 pl-3 list-none">
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Instrument order once placed cannot be cancelled under normal circumstances. In case the cancellation request is accepted, a minimum cancellation charge of 10% of the order value and such other charges incurred by RBPL towards taxes, cess, levy, shipping bill, etc. will be deducted from the advance received and where the recovery of charges are in excess of the advance received, the buyer shall pay the difference to RBPL</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                            <span>Reagents once sold will not be taken back</span>
                          </li>
                        </ul>
                      </div>

                    </div>

                    <DocumentFooter pageNum="3" />
                  </div>
                )}

                {/* ===================================================================
                  PAGE 4: OFFICIAL TERMS AND CONDITIONS - PART 2 (COMPULSORY)
                  =================================================================== */}
                {(previewPage === 'all' || previewPage === '4') && (
                  <div
                    className="quotation-page w-full max-w-[760px] bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 relative flex flex-col min-h-[1020px] text-[#222222] font-serif leading-relaxed"
                    style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
                  >
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                      <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                        Rajbiosis
                      </span>
                    </div>

                    <DocumentHeader />

                    {/* Content of Page 4 (Exact text from PDF) */}
                    <div className="text-xs space-y-5 text-slate-800 text-justify leading-relaxed pt-6">

                      {/* 5. Taxes */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">5. TAXES</div>
                        <p className="pl-3">
                          All types of taxes, charges and levies shall be to the buyer&rsquo;s account and the buyer shall submit the necessary documents for the clearance.
                        </p>
                      </div>

                      {/* 6. Jurisdiction */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">6. JURISDICTION</div>
                        <p className="pl-3">
                          {jurisdictionText || 'All goods sold are subject to Jaipur Jurisdiction.'}
                        </p>
                      </div>

                      {/* 7. Force Majeure */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">7. FORCE MAJEURE</div>
                        <p className="pl-3">
                          RBPL shall not be held responsible for non-fulfillment of the delivery of goods due to any of the force majeure events like war, floods, earthquakes, strikes, epidemics or riots.
                        </p>
                      </div>

                      {/* 8. Payment */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">8. PAYMENT</div>
                        <p className="pl-3 font-semibold text-slate-900">
                          100% Advance
                        </p>
                      </div>

                      {/* 9. Octroi */}
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">9. Octroi / Entry Tax Extra</div>
                      </div>

                    </div>

                    <DocumentFooter pageNum="4" />
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          HIDDEN OFF-SCREEN CONTAINER FOR 100% RELIABLE MULTI-PAGE PDF GENERATION
          ========================================================================= */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">

        {/* Export Page 1 */}
        <div
          ref={exportPage1Ref}
          className="w-[760px] bg-white p-12 flex flex-col min-h-[1080px] text-[#222222] font-serif leading-relaxed relative"
          style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
            <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
              Rajbiosis
            </span>
          </div>
          <DocumentHeader />
          <div className="flex items-center justify-between text-xs pt-4 font-sans font-medium text-slate-800">
            <span>Ref: <strong className="font-mono">{refNo}</strong></span>
            <span>Dated: <strong className="font-mono">{date}</strong></span>
          </div>
          <div className="pt-4 text-xs space-y-0.5">
            <div className="italic">To,</div>
            <div className="font-bold text-slate-900 not-italic text-sm">{customerName || '[Customer Name]'}</div>
            <div className="italic text-slate-700">{customerAddress1}</div>
            <div className="italic text-slate-700">{customerAddress2}</div>
          </div>
          <div className="pt-4 text-xs font-bold text-slate-900">
            <u>Sub: {subjectLetter}</u>
          </div>
          <div className="pt-4 text-xs space-y-3.5 text-slate-800 text-justify leading-relaxed">
            <div>Dear Sir,</div>
            <p>
              At the outset, we wish to thank you for giving us an opportunity to explore a business opportunity with your esteemed organization. Its great pleasure to introduce to you our Instrument should allow you to significantly increase the productivity and performance in your laboratory.
            </p>
            <p>
              We at RAJ BIOSIS PVT LTD. believe these instruments will be very helpful in serving customers. We are more than willing to assist you in explaining about the features and advantages and our representatives will make themselves available for any further information.
            </p>
            <p>
              In view of the same, please find attached herewith our quotations along with other enclosures for your kind perusal.
            </p>
            <p>For any queries please feel free to revert.</p>
            <p>We want to see you succeed and when you succeed, we succeed.</p>
            <div className="pt-2">Yours faithfully,</div>
            <div className="pt-4 space-y-0.5 italic text-slate-800 text-xs">
              <div className="font-bold not-italic text-slate-900">{signatoryName}</div>
              <div>{signatoryRole}</div>
              <div className="not-italic font-medium">{signatoryCompany}</div>
              <div>{signatoryAddress1}</div>
              <div>{signatoryAddress2}</div>
              <div>{signatoryCity}</div>
              <div className="not-italic font-mono font-medium">{signatoryPhone}</div>
            </div>
          </div>
          <DocumentFooter pageNum="1" />
        </div>

        {/* Export Page 2 */}
        <div
          ref={exportPage2Ref}
          className="w-[760px] bg-white p-12 flex flex-col min-h-[1080px] text-[#222222] font-serif leading-relaxed relative"
          style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
            <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
              Rajbiosis
            </span>
          </div>
          <DocumentHeader />
          <div className="text-center pt-2 pb-1">
            <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
              QUOTATION
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs font-sans font-medium text-slate-800">
            <span>Ref: <strong className="font-mono">{refNo}</strong></span>
            <span>Dated: <strong className="font-mono">{date}</strong></span>
          </div>
          <div className="pt-3 text-xs space-y-0.5">
            <div className="italic">To,</div>
            <div className="font-bold text-slate-900 not-italic text-sm">{customerName || '[Customer Name]'}</div>
            <div className="italic text-slate-700">{customerAddress1}</div>
            <div className="italic text-slate-700">{customerAddress2}</div>
          </div>
          <div className="pt-3 text-xs font-bold text-slate-900">
            Sub: {subjectQuotation}
          </div>
          <div className="pt-2 text-xs text-slate-800">
            <div>Dear Sir,</div>
            <div className="mt-1">
              With reference to your request, please find the final Non-negotiable Quotation for your perusal.
            </div>
          </div>
          <div className="pt-3 w-full">
            <table className="w-full border-collapse border border-black text-xs font-sans">
              <thead>
                <tr className="border-b border-black text-slate-900 font-bold bg-white text-center">
                  <th className="border-r border-black p-2 w-[8%] text-center">Sr<br />No.</th>
                  <th className="border-r border-black p-2 w-[14%] text-center">Item<br />Code</th>
                  <th className="border-r border-black p-2 w-[46%] text-left">Description</th>
                  <th className="border-r border-black p-2 w-[8%] text-center">Qty.</th>
                  <th className="border-r border-black p-2 w-[12%] text-right">Unit Price</th>
                  <th className="border-r border-black p-2 w-[12%] text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black align-top">
                    <td className="border-r border-black p-2 text-center font-bold">
                      {idx + 1}
                    </td>
                    <td className="border-r border-black p-2 font-mono text-center text-[11px]">
                      {item.itemCode || '-'}
                    </td>
                    <td className="border-r border-black p-2.5 text-xs">
                      <div className="font-bold italic text-slate-900 mb-1">
                        {item.title || '[Item Title]'}
                      </div>
                      {item.bullets && (
                        <ul className="text-[11px] text-slate-700 space-y-0.5 pl-2 list-none font-sans">
                          {item.bullets.split('\n').filter(Boolean).map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-snug">
                              {bullet.trim().startsWith('•') || bullet.trim().startsWith('-') ? bullet : `• ${bullet}`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border-r border-black p-2 text-center font-bold font-mono">
                      {item.qty}{item.unitLabel || 'No'}
                    </td>
                    <td className="border-r border-black p-2 text-right font-mono font-medium">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {formatCurrency(getItemTotal(item))}
                    </td>
                  </tr>
                ))}

                {taxAmount > 0 && (
                  <tr className="border-b border-black font-semibold text-slate-800 text-[11px]">
                    <td colSpan={4} className="border-r border-black p-2 text-right bg-white">
                      Add: GST @ {taxMode}%:
                    </td>
                    <td colSpan={2} className="p-2 text-right font-mono font-bold bg-white">
                      +{formatCurrency(taxAmount)}
                    </td>
                  </tr>
                )}

                <tr className="font-bold text-slate-900">
                  <td colSpan={4} className="border-r border-black p-2.5 text-left text-xs bg-white">
                    <span>(In Words: </span>
                    <span className="font-bold not-italic">Rs. {amountInWords} only</span>
                    <span>)</span>
                  </td>
                  <td colSpan={2} className="p-2.5 text-right text-xs font-mono font-extrabold bg-white">
                    <span>Total (Rs.): </span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pt-4 text-xs space-y-1">
            <div className="font-bold text-slate-900">For RAJ BIOSIS PVT. LTD..</div>
            <div className="h-10"></div>
            <div className="font-bold text-slate-800">Marketing/Technical Dept.</div>
            <div className="text-[11px] font-sans font-bold text-slate-700 pt-1 space-y-0.5">
              <div>&#10148; SEE OVERLEAF FOR TERMS &amp; CONDITIONS</div>
              <div>&#10148; QUOTATION VALID FOR A PERIOD OF 30 DAYS</div>
            </div>
          </div>
          <DocumentFooter pageNum="2" />
        </div>

        {/* Export Page 3 */}
        <div
          ref={exportPage3Ref}
          className="w-[760px] bg-white p-12 flex flex-col min-h-[1080px] text-[#222222] font-serif leading-relaxed relative"
          style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
            <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
              Rajbiosis
            </span>
          </div>
          <DocumentHeader />
          <div className="text-center pt-3 pb-3">
            <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
              TERMS AND CONDITIONS
            </h3>
          </div>
          <div className="text-xs space-y-4 text-slate-800 text-justify leading-relaxed">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">1. TITLE AND PAYMENT</div>
              <ul className="space-y-1.5 pl-3 list-none">
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>All payments shall be made in favor of &lsquo;RAJ BIOSIS PVT LTD&rsquo; only by Cheque/ Demand Draft or Pay Order payable at Jaipur.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Cash payment shall not be entertained nor any receipt be issued to that effect. RAJ BIOSIS Pvt. Ltd. (RBPL) shall not be responsible for any cash transaction</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>RAJ BIOSIS Pvt. Ltd shall issue stamped receipt after the realization of the instrument and such receipt shall be issued only from the Head Office</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Any delay beyond the stipulated/agreed credit period shall attract interest at the rate of 24% p.a.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Till all payments are received, RBPL shall be the owner of the instrument and shall be at liberty to repossess the instrument from the client&rsquo;s premises without assigning any notice or reason thereof.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Where any cheque is issued by any third party other than the invoiced party, that third party shall be deemed to be a co-borrower / co-purchaser for all legal purposes on the ground that such cheques are issued on the above terms.</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">2. WARRANTY</div>
              <ul className="space-y-1.5 pl-3 list-none">
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>The warranty of the instrument stands for a period of 12 months</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>In the event of instrument being attended to by any unauthorized person/agency, the warranty stands void and cancelled.</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">3. DELIVERY &amp; RISKS</div>
              <ul className="space-y-1.5 pl-3 list-none">
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>In case of any delay in delivery, the party shall immediately intimate in writing, the Customer Service Department(CSD) at the Head Office of RBPL to that effect by means of a Registered A.D. Letter</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Once the goods are delivered, the onus of safe guarding the instrument/ reagents shall be on the buyer</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>RBPL insures the instrument/ reagents during transit only and upon delivery, the responsibility shall be on the buyer</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>RBPL may arrange for Calibration Certificate at the request and cost of the Customer</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">4. CANCELLATION / RETURN</div>
              <ul className="space-y-1.5 pl-3 list-none">
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Instrument order once placed cannot be cancelled under normal circumstances. In case the cancellation request is accepted, a minimum cancellation charge of 10% of the order value and such other charges incurred by RBPL towards taxes, cess, levy, shipping bill, etc. will be deducted from the advance received and where the recovery of charges are in excess of the advance received, the buyer shall pay the difference to RBPL</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[9px] mt-1 shrink-0">&#9670;</span>
                  <span>Reagents once sold will not be taken back</span>
                </li>
              </ul>
            </div>
          </div>
          <DocumentFooter pageNum="3" />
        </div>

        {/* Export Page 4 */}
        <div
          ref={exportPage4Ref}
          className="w-[760px] bg-white p-12 flex flex-col min-h-[1080px] text-[#222222] font-serif leading-relaxed relative"
          style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
            <span className="text-[130px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
              Rajbiosis
            </span>
          </div>
          <DocumentHeader />
          <div className="text-xs space-y-5 text-slate-800 text-justify leading-relaxed pt-6">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">5. TAXES</div>
              <p className="pl-3">
                All types of taxes, charges and levies shall be to the buyer&rsquo;s account and the buyer shall submit the necessary documents for the clearance.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">6. JURISDICTION</div>
              <p className="pl-3">{jurisdictionText || 'All goods sold are subject to Jaipur Jurisdiction.'}</p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">7. FORCE MAJEURE</div>
              <p className="pl-3">
                RBPL shall not be held responsible for non-fulfillment of the delivery of goods due to any of the force majeure events like war, floods, earthquakes, strikes, epidemics or riots.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">8. PAYMENT</div>
              <p className="pl-3 font-semibold text-slate-900">100% Advance</p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">9. Octroi / Entry Tax Extra</div>
            </div>
          </div>
          <DocumentFooter pageNum="4" />
        </div>

      </div>

      {/* SAVED QUOTATIONS HISTORY DRAWER */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md h-[90vh] p-6 flex flex-col shadow-2xl space-y-4">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">History</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {savedQuotations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No quotations saved in database yet.
                </div>
              ) : (
                savedQuotations.map(q => (
                  <div
                    key={q.id || q._id}
                    className="p-3.5 bg-slate-50 hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 transition space-y-1.5 cursor-pointer"
                    onClick={() => handleLoadSavedQuotation(q)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{q.customerName}</span>
                      <span className="font-mono text-[11px] font-bold text-emerald-600">₹{formatCurrency(q.grandTotal || q.totalAmount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Ref: {q.refNo}</span>
                      <span>Date: {q.date}</span>
                    </div>
                    {q.items && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {q.items.map(i => i.title).join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      
      {/* =========================================================================
          PRICE NEGOTIATION APPROVAL DESK MODAL (FOR ADMIN)
          ========================================================================= */}
      {negotiationModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 text-slate-800 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-xl shadow-2xs">
                  ⚖️
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Biomedical Equipment Price Approval Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official review of customer target purchase bid vs Catalog MRP
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
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Hospital / Institution:</span>
                <strong className="text-slate-900 font-bold">{negotiationModalLead.hospital || negotiationModalLead.hospitalName || 'Apex Hospital'}</strong>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Procurement Contact:</span>
                <span className="text-slate-800 font-semibold">{negotiationModalLead.doctorName || negotiationModalLead.customerName || 'Customer'} ({negotiationModalLead.phone || '-'})</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Equipment Requested:</span>
                <strong className="text-slate-900 font-bold">{negotiationModalLead.equipment || negotiationModalLead.productName || 'Biomedical System'}</strong>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Delivery Location:</span>
                <span className="text-slate-700">{negotiationModalLead.city || negotiationModalLead.district || 'Rajasthan'}</span>
              </div>
            </div>

            {/* Side-by-Side Price Comparison */}
            {(() => {
              const actualPrice = parseFloat(negotiationModalLead.actualPrice || negotiationModalLead.price || 150000);
              const expectedPrice = parseFloat(negotiationModalLead.expectedPrice || negotiationModalLead.price || 120000);
              const diff = actualPrice - expectedPrice;
              const discountPct = Math.round((diff / actualPrice) * 100);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Actual Catalog / GeM Price */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        1. Product Actual Price (MRP)
                      </span>
                      <div className="text-2xl font-black font-mono text-slate-900">
                        ₹{actualPrice.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Official registered catalog MRP per unit
                      </span>
                    </div>

                    {/* Customer Expected Price */}
                    <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                          2. Customer Expected Price
                        </span>
                        {diff > 0 && (
                          <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-mono">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black font-mono text-amber-900">
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
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>✅ Option A: Authorize Customer Expected Price</span>
                        </h4>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Authorize customer target price for institutional sale. The updated price will reflect on the quotation and customer view.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={negotiationSubmitting}
                        onClick={() => handleApproveCustomerPrice(negotiationModalLead)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        <CheckCircle2 size={15} />
                        <span>Authorize Customer Price (₹{expectedPrice.toLocaleString('en-IN')})</span>
                      </button>
                    </div>

                    {/* Choice 2: Propose In-Between Counter Offer */}
                    <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>🤝 Option B: Propose Authorized In-Between Rate</span>
                        </h4>
                        <p className="text-[11px] text-indigo-800 mt-0.5">
                          If customer expected price is below viable margin, propose an authorized in-between rate for sales quotation generation.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            Authorized In-Between Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={counterPriceInput}
                            onChange={(e) => setCounterPriceInput(e.target.value)}
                            placeholder="e.g. 480000"
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-xl focus:border-indigo-600 outline-none text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            Executive Authorization Note
                          </label>
                          <input
                            type="text"
                            value={counterNoteInput}
                            onChange={(e) => setCounterNoteInput(e.target.value)}
                            placeholder="e.g. Special Rate with 2-Yr Warranty"
                            className="w-full px-3 py-2 text-xs bg-white border border-indigo-300 rounded-xl focus:border-indigo-600 outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={negotiationSubmitting}
                        onClick={() => handleCounterOfferPrice(negotiationModalLead, counterPriceInput, counterNoteInput)}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        <span>Authorize In-Between Rate (₹{Number(counterPriceInput || 0).toLocaleString('en-IN')})</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN APPROVAL REQUEST NOTICE (FOR SALES EMPLOYEES)
          ========================================================================= */}
      {approvalNoticeModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xl">
                ⏳
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Admin Price Approval Sent
                </h3>
                <p className="text-xs text-slate-500">
                  Negotiable rate pending head office authorization
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-amber-900 font-medium">Equipment:</span>
                <strong className="text-slate-900 font-bold">{approvalNoticeModalLead.equipment || approvalNoticeModalLead.productName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-900 font-medium">Catalog MRP:</span>
                <span className="font-mono text-slate-700">₹{Number(approvalNoticeModalLead.actualPrice || approvalNoticeModalLead.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-900 font-medium">Customer Expected Bid:</span>
                <span className="font-mono font-black text-amber-900 text-sm">₹{Number(approvalNoticeModalLead.expectedPrice || approvalNoticeModalLead.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-950 font-medium leading-relaxed">
                An authorization request has been dispatched to Admin. Once authorized with expected or counter price, the &quot;Make Quotation&quot; button will unlock automatically with the approved price.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://wa.me/919983333469?text=${encodeURIComponent(`URGENT ADMIN APPROVAL NEEDED: Customer ${approvalNoticeModalLead.hospital || 'Hospital'} requested ₹${(approvalNoticeModalLead.expectedPrice || 0).toLocaleString('en-IN')} for ${approvalNoticeModalLead.equipment || 'Equipment'} (Catalog MRP: ₹${(approvalNoticeModalLead.actualPrice || 0).toLocaleString('en-IN')}). Please authorize or provide counter rate in Admin Panel.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle size={14} className="text-emerald-600" />
                <span>WhatsApp Admin (Urgent Authorization)</span>
              </a>
              <button
                type="button"
                onClick={() => setApprovalNoticeModalLead(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLESHEET FOR SCROLLBARS & PRINT */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, aside, nav, button, .bg-slate-900, select, input, textarea {
            display: none !important;
          }
          .quotation-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 297mm !important;
            padding: 20mm 15mm !important;
            margin: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .quotation-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

    </div>
  );
}
