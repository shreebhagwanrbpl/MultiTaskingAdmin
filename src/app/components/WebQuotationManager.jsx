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
  AlertCircle
} from 'lucide-react';
import { numberToWordsIndian } from '../../lib/numberToWords';

export default function WebQuotationManager({ products = [] }) {
  // View Layout Modes: 'split' | 'editor' | 'preview'
  const [activeLayout, setActiveLayout] = useState('split');

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

  // Tax & Commercials Controls
  const [taxMode, setTaxMode] = useState('inclusive'); // 'inclusive' | 'none' | '5' | '12' | '18' | '28'
  const [discountPercent, setDiscountPercent] = useState(0);

  // Preview Page Switcher: 'all' | '1' | '2' | '3' | '4'
  const [previewPage, setPreviewPage] = useState('all');

  // Catalog Products (Loaded from MongoDB Atlas API with fallback to initial props)
  const [catalogProducts, setCatalogProducts] = useState(products || []);

  // UI States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState(Date.now());

  // Web Leads State (Live from MongoDB Atlas & Website Storefronts)
  const [webLeads, setWebLeads] = useState([]);
  const [selectedLeadIdx, setSelectedLeadIdx] = useState(0);
  const [isProcessingLeadQuote, setIsProcessingLeadQuote] = useState(false);
  const [processedLeadIds, setProcessedLeadIds] = useState([]);
  const [hasNewLeadAlert, setHasNewLeadAlert] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [incomingQuotationAlert, setIncomingQuotationAlert] = useState(null);


  // Filter for leads that need a quotation (status 'Pending RFQ' or 'new', and not processed this session)
  const pendingWebLeads = useMemo(() => {
    return webLeads.filter(lead => {
      const id = lead.id || lead._id;
      if (processedLeadIds.includes(id)) return false;
      const st = (lead.status || '').toLowerCase();
      return st.includes('pending') || st.includes('new') || st.includes('rfq');
    });
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

  // Registered customer accounts (for cross-checking profile completeness)
  const [customersList, setCustomersList] = useState([]);

  const fetchCustomerProfiles = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomersList(data.customers);
      }
    } catch (e) {}
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

  // Check if a lead's customer profile is complete (Real hospital name, contact, address/city)
  const isProfileComplete = (lead) => {
    if (!lead) return false;

    // 1. Check matched customer profile from registered customers collection (Live & Always fresh)
    const matched = getMatchedCustomer(lead);
    if (matched) {
      const hosp = (matched.hospitalName || '').trim();
      const addr = (matched.address || '').trim();
      const dist = (matched.district || '').trim();
      const name = (matched.fullName || '').trim();
      const isGeneric = !hosp || [
        'clinic / hospital', 'healthcare facility', 'general hospital', 'hospital',
        'customer hospital / lab', 'customer hospital / diagnostic lab'
      ].some(g => hosp.toLowerCase() === g || hosp.toLowerCase().includes('healthcare institution'));

      if (!isGeneric && hosp.length >= 3 && name.length >= 2 && (addr.length >= 3 || dist.length >= 3)) {
        return true;
      }
    }

    // 2. Explicit boolean flag if verified by backend / sync
    if (lead.isProfileComplete === true || lead.rawLeadData?.isProfileComplete === true) {
      return true;
    }

    // 3. Direct check on lead fields (e.g. if quotation had full address and hospital name)
    const raw = lead.rawLeadData || {};
    const hospital = (lead.hospital || raw.hospitalName || lead.hospitalName || '').trim();
    const name = (lead.doctorName || raw.customerName || lead.customerName || '').trim();
    const address = (lead.address || raw.address || lead.deliveryAddress || '').trim();
    const city = (lead.city || raw.district || lead.district || '').trim();

    const isGenericHosp = !hospital || [
      'clinic / hospital',
      'healthcare facility',
      'general hospital',
      'healthcare institution',
      'customer hospital / lab',
      'customer hospital / diagnostic lab'
    ].some(ph => hospital.toLowerCase() === ph || hospital.toLowerCase().includes('healthcare institution'));

    const hasRealHospital = !isGenericHosp && hospital.length >= 3;
    const hasRealName = name && name.length >= 2 && name.toLowerCase() !== 'medical client';
    const hasRealPhone = (lead.phone || lead.customerPhone || raw.customerPhone || '').replace(/\D/g, '').length >= 10;
    const hasLocation = (address && address.length >= 3) || (city && city.length >= 3 && city !== 'India');

    return Boolean(hasRealHospital && hasRealName && hasRealPhone && hasLocation);
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
    } catch (e) {}
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
        setWebLeads(prev => {
          const prevIds = new Set(prev.map(l => l.id || l._id));
          const hasNew = data.leads.some(l => !prevIds.has(l.id || l._id));
          if (hasNew && !silent) {
            setHasNewLeadAlert(true);
            playLeadNotificationSound();
          }
          // Merge preserving any fresh leads currently in memory
          const serverIds = new Set(data.leads.map(l => l.id || l._id));
          const uncommitted = prev.filter(l => !serverIds.has(l.id || l._id));
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
    } catch (e) {}

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
    } catch (e) {}

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
        } catch (err) {}
      }
      if (e.key === 'latest_web_lead' && e.newValue) {
        try {
          const lead = JSON.parse(e.newValue);
          if (lead) insertIncomingLead(lead);
        } catch (err) {}
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      clearInterval(interval);
      if (channel) {
        try { channel.close(); } catch(e){}
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

    // 1. Customer & Hospital Information
    const hospitalName = (
      matchedCustomer?.hospitalName ||
      lead.hospital ||
      lead.doctorName ||
      'Customer Hospital / Diagnostic Lab'
    ).trim();
    setCustomerName(hospitalName);

    const docName = matchedCustomer?.fullName || lead.doctorName;
    const doctorPart = docName ? `Attn: ${docName}` : 'Attn: Procurement Officer';
    const phoneVal = matchedCustomer?.phone || lead.phone;
    const phonePart = phoneVal ? `Mob: ${phoneVal}` : '';
    setCustomerAddress1([doctorPart, phonePart].filter(Boolean).join(', '));

    const cityPart = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'India';
    const emailVal = matchedCustomer?.email || lead.email;
    const emailPart = emailVal ? `Email: ${emailVal}` : '';
    setCustomerAddress2([cityPart, emailPart].filter(Boolean).join(' • '));

    // 2. Reference & Date
    const freshRef = generateRefNo();
    setRefNo(freshRef);
    setDate(getTodayFormatted());

    // 3. Product Parsing & Line Items Matching
    let rawQty = 1;
    let rawTitle = (lead.productName || lead.equipment || 'Biomedical Diagnostic System').trim();
    const qtyMatch = rawTitle.match(/\(x(\d+)\)/i);
    if (qtyMatch) {
      rawQty = parseInt(qtyMatch[1], 10) || 1;
      rawTitle = rawTitle.replace(/\(x\d+\)/i, '').trim();
    } else if (lead.quantity) {
      const parsed = parseInt(String(lead.quantity).replace(/[^0-9]/g, ''), 10);
      if (parsed > 0) rawQty = parsed;
    }

    // Match against catalog products
    const matched = catalogProducts.find(cp => {
      if (lead.productId && cp.id === lead.productId) return true;
      if (lead.productSku && cp.sku?.toLowerCase() === lead.productSku.toLowerCase()) return true;
      const cpName = (cp.name || cp.title || '').toLowerCase();
      const target = rawTitle.toLowerCase();
      return cpName.includes(target) || target.includes(cpName);
    });

    let itemTitle = rawTitle;
    let itemCode = lead.productSku || (matched?.sku || 'MED-2026');
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
      } else if (lead.price) {
        unitPrice = parseFloat(lead.price) || 150000;
      }

      if (lead.specs && typeof lead.specs === 'object') {
        bulletsList = Object.entries(lead.specs).slice(0, 5).map(([k, v]) => `${k}: ${v}`);
      } else if (lead.features && Array.isArray(lead.features)) {
        bulletsList = lead.features.slice(0, 5);
      }
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

    // 5. Commercials
    setTaxMode('inclusive');
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
      }).catch(() => {});
    } catch (e) {}

    // Instant Feedback
    setSuccessToast(`⚡ Quotation Ready for ${hospitalName} in 0.4s! 4-Page PDF generated.`);
    setLastActionTimestamp(Date.now());
    setIsProcessingLeadQuote(false);
    setHasNewLeadAlert(false);
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
    } catch (e) {}
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
    } catch (e) {}
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
    if (q.taxMode) setTaxMode(q.taxMode);
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
    setSuccessToast(`Loaded quotation for "${q.customerName}"`);
  };

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
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Website Quotation Requests</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      {pendingWebLeads.length} Pending
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click &quot;Make Quotation&quot; on any customer below to generate complete quotation within 1 second.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllWebLeads}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer border border-rose-200 shadow-2xs flex items-center gap-1.5"
                  title="Clear all leads and start completely fresh"
                >
                  <Trash2 size={13} className="text-rose-600" />
                  <span>Clear All</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateWebLead}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1"
                  title="Simulate another test lead"
                >
                  <Plus size={13} className="text-amber-600" />
                  <span>+ Test Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeadsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Cards List (Exact layout matching Image 2 wireframe) */}
            <div className="p-6 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
              {pendingWebLeads.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Pending Web Leads</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All website leads have been converted into official quotations.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateWebLead}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
                  >
                    + Generate Sample Web RFQ Lead
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
                      className="bg-white rounded-2xl p-5 border-2 border-slate-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      {/* Left Column: Customer Name, Contact, Location (Matching Image 2 wireframe) */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* Customer Name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {displayHospital}
                          </span>
                          {complete && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>Profile Complete</span>
                            </span>
                          )}
                          {lead.siteDomain && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md border border-slate-200">
                              🌐 {lead.siteDomain}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lead.date || 'Just now'}
                          </span>
                        </div>

                        {/* Contact */}
                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap font-medium">
                          <span className="text-slate-800 font-bold">Contact:</span>
                          <span>{displayContact}</span>
                          {displayPhone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-700">{displayPhone}</span>
                            </>
                          )}
                          {displayEmail && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{displayEmail}</span>
                            </>
                          )}
                        </div>

                        {/* Location */}
                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span className="text-slate-800 font-bold">Location:</span>
                          <span>{displayLocation}</span>
                        </div>

                        {/* Requested Hardware Info */}
                        <div className="pt-1 flex items-center gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold flex items-center gap-1.5">
                            <span>📦</span>
                            <span>{lead.equipment || lead.productName || 'Requested Hardware'}</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            {lead.quoteAmount || (lead.price ? `₹${lead.price.toLocaleString('en-IN')}` : '₹1,50,000')}
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Make Quotation Button */}
                      <div className="shrink-0 flex flex-col md:flex-row items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            handleMakeQuotationFromLead(lead);
                            setIsLeadsModalOpen(false);
                          }}
                          className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/40"
                          title="Click to generate official quotation within 1 second"
                        >
                          <Sparkles size={14} className="text-amber-100" />
                          <span>Make Quotation</span>
                          <ArrowRight size={14} />
                        </button>

                        {!complete && lead.phone && (
                          <a
                            href={`https://wa.me/91${(lead.phone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello Dr. ${lead.doctorName || lead.customerName || ''}, regarding your quotation request for ${lead.equipment || 'medical equipment'} with Raj Biosis:`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition border border-amber-200"
                            title="Request additional profile info on WhatsApp"
                          >
                            <span>WhatsApp</span>
                            <ArrowRight size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                ⚡ 1-Click Automation: Clicking &quot;Make Quotation&quot; populates customer, line items &amp; updates PDF in 1 second.
              </span>
              <button
                type="button"
                onClick={() => setIsLeadsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REAL-TIME INCOMING WEBSITE QUOTATION BANNER */}
      {incomingQuotationAlert && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white p-4 rounded-3xl shadow-lg border border-emerald-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/25 px-2 py-0.5 rounded-full">
                  ⚡ Live Website Quotation
                </span>
                <span className="text-[11px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">
                  Ref: {incomingQuotationAlert.refNo}
                </span>
                <span className="text-xs opacity-90">Just received from website</span>
              </div>
              <h3 className="text-sm md:text-base font-extrabold mt-0.5 flex items-center gap-2">
                <span>{incomingQuotationAlert.customerName}</span>
                <span className="font-mono font-bold text-amber-200 bg-black/20 px-2 py-0.5 rounded-lg text-xs md:text-sm">
                  ₹{formatCurrency(incomingQuotationAlert.grandTotal || incomingQuotationAlert.subtotal)}
                </span>
              </h3>
              <p className="text-xs text-emerald-100 truncate max-w-xl">
                {incomingQuotationAlert.items?.map(i => i.title).join(', ') || incomingQuotationAlert.subjectQuotation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                handleLoadSavedQuotation(incomingQuotationAlert);
                setIncomingQuotationAlert(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Load in 4-Page PDF</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setIncomingQuotationAlert(null)}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition cursor-pointer"
              title="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Web Quotation
              </h2>
            </div>
          </div>
        </div>

        {/* Dynamic New Lead Trigger Button ("yha to new web lead he dikhe bs") */}
        {pendingWebLeads.length > 0 ? (
          <div className="flex-1 max-w-xs mx-2 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsLeadsModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-400/40"
              title="Click to view all website leads and make quotation"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <Sparkles size={14} className="text-amber-100" />
              <span>⚡ New Web Lead ({pendingWebLeads.length})</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 max-w-xs mx-2 hidden xl:flex items-center justify-center">
            <button
              type="button"
              onClick={handleSimulateWebLead}
              className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/50 text-slate-500 hover:text-amber-800 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Click to simulate a website customer RFQ request"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Web RFQ Listening</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">+ Test Lead</span>
            </button>
          </div>
        )}


        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Quick Preset Buttons */}
          <button
            type="button"
            onClick={handleStartBlankQuotation}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            title="Start a new blank quotation ready for input"
          >
            <Plus size={13} className="text-sky-600" />
            <span>Blank Form</span>
          </button>

          {/* <button
            type="button"
            onClick={handleLoadDemoHindustanZinc}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            title="Load Hindustan Zinc Limited Demo from your uploaded PDF"
          >
            <Copy size={13} className="text-slate-500" />
            <span>Load Demo (HZL)</span>
          </button> */}

          {/* <button
            type="button"
            onClick={handleLoadDemoICUPackage}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            title="Load Multi-Item Hospital Package"
          >
            <Package size={13} className="text-indigo-600" />
            <span>Load ICU Package</span>
          </button> */}

          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            <Layers size={13} className="text-slate-600" />
            <span>History ({savedQuotations.length})</span>
          </button>

          <button
            type="button"
            disabled={isSavingDb}
            onClick={handleSaveToMongoDB}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-emerald-200"
          >
            {isSavingDb ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Save</span>
          </button>

          {/* Primary Action: Download PDF named after customer! */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm shadow-sky-500/25"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Exporting 4 Pages...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download PDF ({customerName || 'Customer'})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Print or Save via Browser"
          >
            <Printer size={16} />
          </button>

        </div>
      </div>

      {/* VIEWPORT LAYOUT SWITCHER */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">Workspace View:</span>

          <button
            type="button"
            onClick={() => setActiveLayout('split')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${activeLayout === 'split'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <SplitSquareVertical size={13} />
            <span>Split View (Editor + Live PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayout('editor')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${activeLayout === 'editor'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <FileText size={13} />
            <span>Quotation Form Editor Only</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayout('preview')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${activeLayout === 'preview'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            <Eye size={13} />
            <span>Live 4-Page PDF Document Only</span>
          </button>
        </div>

        {/* Live Calculation Indicator */}
        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-500 text-[11px]">
            Items: <strong className="text-slate-800">{items.length}</strong>
          </span>
          <span className="text-slate-500 text-[11px]">
            Grand Total: <strong className="text-emerald-600 font-bold text-sm">₹{formatCurrency(grandTotal)}</strong>
          </span>
          <span className="text-[11px] text-slate-500 font-sans hidden xl:inline max-w-xs truncate" title={amountInWords}>
            ({amountInWords})
          </span>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className={`grid gap-6 items-start ${activeLayout === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
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
              } space-y-5 custom-scrollbar`}
          >

            {/* STEP 1: CUSTOMER & REFERENCE DATA */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={15} className="text-sky-600" />
                  <span>1.  Quotation Reference</span>
                </span>
                <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                  Ref: {refNo}
                </span>
              </div>

              {/* Customer Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-800 font-bold block">
                    Customer / Hospital / Company Name *
                  </label>
                  <span className="text-[10px] text-sky-600 font-medium">
                    (Updates Page 1, Page 2 &amp; PDF Download Filename)
                  </span>
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Apollo Hospitals / AIIMS / Hindustan Zinc Limited"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
                />

                {/* Quick Autofill Suggestions */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-400">
                  <span className="font-medium">⚡ Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomer('Apollo Hospitals Enterprise Ltd.', 'Sarita Vihar, Delhi Mathura Road', 'New Delhi - 110076')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                  >
                    Apollo Hospital
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomer('AIIMS New Delhi', 'Ansari Nagar, Sri Aurobindo Marg', 'New Delhi - 110029')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                  >
                    AIIMS Delhi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomer('Hindustan Zinc Limited', 'Zinc Park, Yashad Bhawan', 'Udaipur-RAJASTHAN')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                  >
                    Hindustan Zinc (HZL)
                  </button>
                </div>
              </div>

              {/* Address Lines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Customer Address Line 1</label>
                  <input
                    type="text"
                    value={customerAddress1}
                    onChange={(e) => setCustomerAddress1(e.target.value)}
                    placeholder="e.g. Zinc Park, Yashad Bhawan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">City, State &amp; PIN (Line 2)</label>
                  <input
                    type="text"
                    value={customerAddress2}
                    onChange={(e) => setCustomerAddress2(e.target.value)}
                    placeholder="e.g. Udaipur-RAJASTHAN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-medium"
                  />
                </div>
              </div>

              {/* Ref No & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold block">Quotation Reference Number</label>
                    <button
                      type="button"
                      onClick={() => setRefNo(generateRefNo())}
                      className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} />
                      <span>New Ref</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="e.g. RBPL/Q00130MAY15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:bg-white focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Quotation Date (DD.MM.YYYY)</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. 24.10.2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:bg-white focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold">Subject on Page 1 &amp; Page 2</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomSubject}
                      onChange={(e) => setIsCustomSubject(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-sky-600"
                    />
                    <span>Manual Subject Edit</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={subjectQuotation}
                    disabled={!isCustomSubject}
                    onChange={(e) => setSubjectQuotation(e.target.value)}
                    placeholder="Subject line for Quotation..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 disabled:opacity-60 font-medium"
                  />
                </div>
              </div>

            </div>

            {/* STEP 2: ADD NEW PRODUCT TO QUOTATION (DEDICATED QUICK-ADDER) */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/40 to-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4 text-xs">

              <div className="flex items-center justify-between pb-2 border-b border-indigo-100/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Add Product
                    </h3>

                  </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center bg-white rounded-xl p-1 border border-indigo-200/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setNewItemMode('catalog')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${newItemMode === 'catalog'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Store Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemMode('custom')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${newItemMode === 'custom'
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
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Select items:
                    </label>
                    <select
                      value={selectedCatalogId}
                      onChange={(e) => handleCatalogSelection(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-800 font-semibold text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs cursor-pointer"
                    >
                      <option value="">-- Choose a product from catalog --</option>
                      {catalogProducts.map(p => (
                        <option key={p.id || p.sku} value={p.id || p.sku}>
                          {p.title || p.name} — ₹{Number(p.price || 0).toLocaleString('en-IN')} {p.sku ? `(${p.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Inputs for Name, Code, Specs, Qty, Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">
                    Product / Equipment Name *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Fully Automated Biochemistry Analyzer"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Model / Item Code
                  </label>
                  <input
                    type="text"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    placeholder="e.g. CLINI-QUANT"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bullets / Specs */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Specifications
                </label>
                <textarea
                  rows={2}
                  value={newBullets}
                  onChange={(e) => setNewBullets(e.target.value)}
                  placeholder="• 7 assay modes&#10;• 100 open test protocols&#10;• 2 Years warranty..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-[11px] leading-relaxed font-sans outline-none focus:border-indigo-500"
                />
              </div>

              {/* Commercials: Quantity, Unit, Price, and Live Calculated Total */}
              <div className="p-3 bg-white rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Quantity</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNewQty(Math.max(1, (parseInt(newQty, 10) || 1) - 1))}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={newQty}
                        onChange={(e) => setNewQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setNewQty((parseInt(newQty, 10) || 1) + 1)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                      <select
                        value={newUnitLabel}
                        onChange={(e) => setNewUnitLabel(e.target.value)}
                        className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1 font-semibold text-slate-700"
                      >
                        <option value="No">No</option>
                        <option value="Nos">Nos</option>
                        <option value="Sets">Sets</option>
                        <option value="Units">Units</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </div>
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
                    className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-xs"
                  />
                </div>

                {/* Calculated Row Total */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Row Total (₹)</label>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-800 text-xs">
                    ₹{formatCurrency((parseInt(newQty, 10) || 1) * (parseFloat(newUnitPrice) || 0))}
                  </div>
                </div>

                {/* Big Add Button */}
                <div className="sm:pt-4">
                  <button
                    type="button"
                    onClick={handleAddNewItemToQuotation}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-indigo-500/25"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

              </div>

            </div>

            {/* STEP 3: CURRENT QUOTATION ITEMS LIST (REAL-TIME EDITABLE TABLE) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Package size={15} className="text-indigo-600" />
                    <span>3. Quotation ({items.length} Products)</span>
                  </span>
                </div>

                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-bold">
                  Subtotal: ₹{formatCurrency(subtotal)}
                </span>
              </div>

              {/* Items Card / Row List */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 relative group transition hover:border-sky-300">

                    {/* Item Top Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                          placeholder="Product Name"
                          className="font-bold text-slate-800 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-sky-500 outline-none px-1 py-0.5 w-64 sm:w-80"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(idx)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                          title="Duplicate this item"
                        >
                          <Copy size={13} />
                        </button>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Delete this row"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Model & Bullets */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Item Code / Model</label>
                        <input
                          type="text"
                          value={item.itemCode || ''}
                          onChange={(e) => handleUpdateItem(idx, 'itemCode', e.target.value)}
                          placeholder="e.g. CQ-2026"
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs outline-none focus:border-sky-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Specifications Bullets (One per line)</label>
                        <textarea
                          rows={2}
                          value={item.bullets || ''}
                          onChange={(e) => handleUpdateItem(idx, 'bullets', e.target.value)}
                          placeholder="• Bullet 1&#10;• Bullet 2..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] leading-snug outline-none focus:border-sky-400 font-sans"
                        />
                      </div>
                    </div>

                    {/* Interactive Quantity, Unit Price, and Auto-Computed Total */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 items-center">

                      {/* Quantity */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Quantity</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustItemQty(idx, -1)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(idx, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-14 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-center text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleAdjustItemQty(idx, 1)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                          <select
                            value={item.unitLabel || 'No'}
                            onChange={(e) => handleUpdateItem(idx, 'unitLabel', e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-1 font-semibold text-slate-700"
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Unit Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-xs"
                        />
                      </div>

                      {/* Row Total (Dynamically Computed) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Row Total (₹)</label>
                        <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-800 text-xs">
                          ₹{formatCurrency(getItemTotal(item))}
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>

              {/* COMMERCIALS & TAX BREAKDOWN PANEL */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-300">Commercial Summary &amp; Taxes</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400">GST Mode:</label>
                    <select
                      value={taxMode}
                      onChange={(e) => setTaxMode(e.target.value)}
                      className="text-[11px] bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-0.5 font-semibold"
                    >
                      <option value="inclusive">GST Inclusive (100% Final Price)</option>
                      <option value="none">No Tax (0% Exempt)</option>
                      <option value="5">+5% GST Extra</option>
                      <option value="12">+12% GST Extra</option>
                      <option value="18">+18% GST Extra (Medical Devices)</option>
                      <option value="28">+28% GST Extra</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Items Subtotal ({items.length} items):</span>
                    <span className="font-mono">₹{formatCurrency(subtotal)}</span>
                  </div>

                  {taxAmount > 0 && (
                    <div className="flex items-center justify-between text-indigo-300 font-mono">
                      <span>GST (+{taxMode}% Extra):</span>
                      <span>+₹{formatCurrency(taxAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span className="text-emerald-400">Final Quotation Amount:</span>
                    <span className="text-emerald-400 font-mono text-base font-extrabold">
                      ₹{formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {/* Dynamic English Words Conversion Display */}
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 leading-snug">
                    <span className="text-slate-400">Amount in Words (English): </span>
                    <strong className="text-emerald-300 italic">Rs. {amountInWords} only</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* STEP 4: OFFICIAL SIGNATORY CUSTOMIZER */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                4. Authorized Official Signatory
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Name</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Designation</label>
                  <input
                    type="text"
                    value={signatoryRole}
                    onChange={(e) => setSignatoryRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Company</label>
                  <input
                    type="text"
                    value={signatoryCompany}
                    onChange={(e) => setSignatoryCompany(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Phone</label>
                  <input
                    type="text"
                    value={signatoryPhone}
                    onChange={(e) => setSignatoryPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
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
              } space-y-4 custom-scrollbar`}
          >

            {/* Page Tab Selector Toolbar (Sticky at Top of PDF Panel) */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Display:</span>
                {[
                  { id: 'all', label: 'All 4 Pages' },
                  { id: '1', label: 'Page 1 (Letter)' },
                  { id: '2', label: 'Page 2 (Quotation Table)' },
                  { id: '3', label: 'Page 3 (Terms 1)' },
                  { id: '4', label: 'Page 4 (Terms 2)' },
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
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${previewPage === p.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                ✓ 100% Dynamic PDF
              </span>
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
                              GST (+{taxMode}% Extra):
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
                        All goods sold are subject to Jaipur Jurisdiction.
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
                      GST (+{taxMode}% Extra):
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
              <p className="pl-3">All goods sold are subject to Jaipur Jurisdiction.</p>
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
                <FileText size={18} className="text-sky-600" />
                <h3 className="font-bold text-sm text-slate-800">Saved Quotations in MongoDB</h3>
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
