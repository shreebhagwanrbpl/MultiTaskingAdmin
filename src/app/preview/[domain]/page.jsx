'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ShieldCheck, Phone, Mail, MapPin, Search, ArrowRight,
  FileText, CheckCircle2, Star, Clock, Download, ChevronRight, ChevronLeft,
  Sparkles, Layers, Activity, HeartPulse, Stethoscope, Building2,
  ExternalLink, ArrowLeft, Send, Check, MessageSquare, Zap,
  Award, HelpCircle, ChevronDown, ChevronUp, ShoppingBag, ShoppingCart,
  User, Filter, SlidersHorizontal, RefreshCw, Cpu, CheckCircle,
  AlertCircle, Menu, X, Home, Grid, Code, Image as ImageIcon, Type
} from 'lucide-react';
import { PRODUCTS } from '../../../data/products';
import { CATEGORIES } from '../../../data/categories';
import { DEFAULT_HOMEPAGE_CONFIG } from '../../../data/defaultHomepage';
import { numberToWordsIndian } from '../../../lib/numberToWords';

const FALLBACK_SITES = [
  {
    id: 'site-01',
    domain: 'rajbiosis.com',
    brandName: 'Raj Biosis',
    tagline: 'Biomedical Life Systems & Hospital Equipment',
    primaryColor: '#0ea5e9',
    font: 'Plus Jakarta Sans',
    headerStyle: 'Telemetry Bar',
    homepageLayout: 'Banner Carousel',
    categoryFocus: 'All Clinical Departments',
    cardStyle: 'Bordered Minimal',
    phone: '1800-419-BIOSIS',
    email: 'contact@rajbiosis.com',
    city: 'Bengaluru, Karnataka'
  },
  {
    id: 'site-02',
    domain: 'pulmocare.in',
    brandName: 'PulmoCare Devices',
    tagline: 'Advanced Respiratory & Critical Ventilation',
    primaryColor: '#0284c7',
    font: 'Manrope',
    headerStyle: 'Minimalist Single Row',
    homepageLayout: 'Split Sidebar B2B',
    categoryFocus: 'ICU & Critical Care',
    cardStyle: 'Floating Shadow',
    phone: '+91 98210 55443',
    email: 'sales@pulmocare.in',
    city: 'Mumbai, Maharashtra'
  },
  {
    id: 'site-03',
    domain: 'surgitech.in',
    brandName: 'SurgiTech Systems',
    tagline: 'Precision Laparoscopy & Modular OT Suites',
    primaryColor: '#059669',
    font: 'Outfit',
    headerStyle: 'Sticky Floating Pill',
    homepageLayout: 'Turnkey Solution Suites',
    categoryFocus: 'Surgical & OT Equipment',
    cardStyle: 'Glassmorphic Modern',
    phone: '+91 98450 77881',
    email: 'procure@surgitech.in',
    city: 'Hyderabad, Telangana'
  }
];

const DEFAULT_TOP_BRANDS = [
  { name: 'Philips Healthcare', discount: 'Up to 30% OFF', category: 'Patient Monitoring & Defibrillators' },
  { name: 'Omron Healthcare', discount: 'Up to 35% OFF', category: 'Digital BP & Nebulizers' },
  { name: 'BPL Medical Technologies', discount: 'Up to 25% OFF', category: 'ECG & Critical Care' },
  { name: 'Nipro Corporation', discount: 'Up to 40% OFF', category: 'Dialysis & Syringes' },
  { name: 'BD (Becton Dickinson)', discount: 'Bulk GeM Rate', category: 'IV Cannula & Infusion' },
  { name: '3M Healthcare', discount: 'Up to 20% OFF', category: 'Sterilization & Dressings' },
  { name: 'Romsons Medical', discount: 'Direct OEM Pricing', category: 'Urology & Respiratory Tubes' },
  { name: 'Dr Trust USA', discount: 'Up to 45% OFF', category: 'Oximeters & Diagnostics' },
  { name: 'Mindray Biomedical', discount: 'Up to 28% OFF', category: 'Ultrasound & Hematology' },
  { name: 'Polymed', discount: 'Up to 35% OFF', category: 'Safety Cannula & Blood Bags' }
];

const DEFAULT_DEALS = [
  {
    id: 'deal-1',
    name: '3-Ply Surgical Face Masks with Meltblown Filter (Box of 100)',
    brand: 'SurgiShield',
    mrp: 499,
    price: 299,
    discount: '40% OFF',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=300&q=80',
    stock: 'Ready Stock'
  },
  {
    id: 'deal-2',
    name: 'Fully Automatic Digital Upper Arm Blood Pressure Monitor',
    brand: 'Omron',
    mrp: 2490,
    price: 1599,
    discount: '36% OFF',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80',
    stock: 'High Demand'
  },
  {
    id: 'deal-3',
    name: 'OLED Dual Color Fingertip Pulse Oximeter with Plethysmogram',
    brand: 'Dr Trust',
    mrp: 1899,
    price: 799,
    discount: '58% OFF',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80',
    stock: 'Flash Deal'
  },
  {
    id: 'deal-4',
    name: 'Medical Grade Powder-Free Nitrile Examination Gloves (Box of 100)',
    brand: 'MediGrip',
    mrp: 750,
    price: 399,
    discount: '47% OFF',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
    stock: 'Bulk Pack'
  }
];

const DEFAULT_CONSUMABLES = [
  { id: 'con-1', name: 'IV Infusion Sets with Air Vent & 15 Micron Filter (Box of 25)', price: 550, mrp: 850, badge: 'High Volume' },
  { id: 'con-2', name: 'Sterile IV Cannula 20G/22G/24G with Injection Port (Box of 50)', price: 950, mrp: 1400, badge: 'CDSCO Approved' },
  { id: 'con-3', name: 'Single-Use Disposable Syringes 5ml with 23G Needle (Box of 100)', price: 480, mrp: 720, badge: 'CE Marked' },
  { id: 'con-4', name: 'Sterile Absorbent Gauze Bandages 10cm x 3m (Pack of 12 Rolls)', price: 340, mrp: 500, badge: 'Hospital Grade' },
  { id: 'con-5', name: 'Disposable Suction Catheter with Thumb Control (Box of 50)', price: 620, mrp: 950, badge: 'EO Sterilized' }
];

const DEFAULT_DIAGNOSTICS = [
  { id: 'diag-1', name: '3-Part Automated Hematology Analyzer (21 Parameters)', brand: 'Mindray', price: 185000, mrp: 260000, tag: 'Pathology Lab' },
  { id: 'diag-2', name: 'Semi-Automated Clinical Biochemistry Analyzer', brand: 'Transasia', price: 95000, mrp: 140000, tag: 'Clinical Chemistry' },
  { id: 'diag-3', name: 'High Speed Brushless Medical Centrifuge 15,000 RPM', brand: 'Remi', price: 38000, mrp: 52000, tag: 'Lab Essential' },
  { id: 'diag-4', name: 'Trinocular Medical Pathology Microscope with LED Illumination', brand: 'Olympus', price: 28500, mrp: 42000, tag: 'Diagnostics' }
];

const DEFAULT_CRITICAL_CARE = [
  { id: 'crit-1', name: '12.1" Multi-Parameter Patient Monitor (ECG, SpO2, NIBP, Respiration, Temp)', brand: 'BPL', price: 42000, mrp: 65000, tag: 'ICU Standard' },
  { id: 'crit-2', name: 'Dual Channel Micro Syringe Infusion Pump with Drug Library', brand: 'Fresenius', price: 32000, mrp: 48000, tag: 'Critical Infusion' },
  { id: 'crit-3', name: 'Biphasic Defibrillator Monitor with Manual & AED Modes', brand: 'Philips', price: 145000, mrp: 210000, tag: 'Emergency Trauma' },
  { id: 'crit-4', name: 'ICU Invasive & Non-Invasive Turbine Driven Ventilator', brand: 'Mindray', price: 290000, mrp: 420000, tag: 'High-Acuity ICU' }
];

const DEFAULT_REFURBISHED = [
  {
    id: 'ref-1',
    name: 'GE Optima CT540 16-Slice CT Scanner (Refurbished & Factory Calibrated)',
    tag: 'AERB Approved',
    price: 3450000,
    specs: '16 Slices/Rot, 0.5s Gantry, Volumetric Reconstruction, Complete AEC & ASiR'
  },
  {
    id: 'ref-2',
    name: 'Siemens Magnetom Essenza 1.5T MRI System (Turnkey Commissioned)',
    tag: 'Zero Helium Boil-off',
    price: 8500000,
    specs: '1.5 Tesla Superconducting Magnet, Tim+Dot Engine, Ultra-compact 145cm gantry'
  },
  {
    id: 'ref-3',
    name: 'High Frequency 9" Image Intensifier Mobile C-Arm Surgical System',
    tag: 'OT Fluoroscopy',
    price: 780000,
    specs: '3.5kW High Frequency Monoblock Generator, Dual 19" Medical Monitors, DSA'
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 'test-1',
    doctor: 'Dr. R. K. Sharma',
    role: 'Medical Director & Chief of Surgery',
    hospital: 'Apex Super Speciality Hospital, New Delhi',
    quote: 'Procuring our modular OT laparoscopic sets and ICU monitors was seamless. Transparent GeM compliance, batch calibration reports, and same-week installation by senior biomedical engineers.',
    rating: 5
  },
  {
    id: 'test-2',
    doctor: 'Dr. Priya Nair',
    role: 'Head of Critical Care & Anaesthesia',
    hospital: 'Fortis Memorial Healthcare, Gurugram',
    quote: 'The turbine ventilators and syringe infusion pumps perform exceptionally under 24/7 high-acuity patient loads. Comprehensive 2-year on-site CMC gives our clinical team total peace of mind.',
    rating: 5
  },
  {
    id: 'test-3',
    doctor: 'Rajesh Mehta',
    role: 'Senior Vice President — Hospital Procurement',
    hospital: 'Metro Diagnostic Chains (42 Centres)',
    quote: 'Saved over 26% on high-volume laboratory consumables, vacutainers, and automated biochemistry analyzers. Official stamped GST quotations delivered within 30 minutes every single time.',
    rating: 5
  }
];

const DEFAULT_FAQS = [
  {
    q: 'How do hospital committees request an official institutional quotation or GeM tender batch?',
    a: 'You can click "Request RFQ" anywhere on the platform or submit your required product list. Our biomedical engineering desk issues stamped institutional quotations with GST breakdown, GeM catalogue IDs, and batch validation within 30 minutes.'
  },
  {
    q: 'What is the delivery turnaround time for emergency supplies versus heavy capital equipment?',
    a: 'High-volume consumables (syringes, gloves, IV sets, PPE) dispatch within 24 hours from regional distribution hubs (Delhi, Mumbai, Bengaluru). Capital machinery (CT, MRI, ICU Ventilators) is transported and mechanically commissioned within 3 to 7 business days.'
  },
  {
    q: 'Are all biomedical devices certified under CDSCO Medical Device Rules and ISO 13485:2016?',
    a: 'Yes, 100% of products supplied carry active CDSCO import/manufacturing licenses, CE European or US-FDA clearance, and factory calibration certificates fully compliant with NABH and NABL hospital accreditation audits.'
  },
  {
    q: 'How does on-site installation, staff training, and the 2-Year OEM Warranty work?',
    a: 'Every high-acuity delivery includes complimentary unboxing, electrical grounding verification, mechanical setup, and hands-on doctor/nurse training by certified biomedical engineers. Warranty covers 24/7 on-call breakdown support with 4-hour emergency response.'
  }
];

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80',
    title: 'Advanced Biomedical Hospital Equipment & ICU Critical Care',
    subtitle: 'CDSCO & ISO 13485:2016 Certified Medical Devices for Tertiary Care Hospitals',
    badge: 'Direct OEM Procurement'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop&q=80',
    title: 'Modular Operation Theatre & Surgical Suite Systems',
    subtitle: 'High-Acuity OT Tables, C-Arm Fluoroscopy, and Anesthesia Workstations',
    badge: 'NABH Compliant Setup'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&auto=format&fit=crop&q=80',
    title: 'Diagnostic Radiology & High-Resolution Imaging Equipment',
    subtitle: 'Multi-slice CT Scanners, 1.5T MRI Systems, and Digital X-Ray Solutions',
    badge: 'AERB Approved Calibration'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1600&auto=format&fit=crop&q=80',
    title: 'Automated Pathology Laboratory & Life-Support Systems',
    subtitle: 'Fully Automated Biochemistry Analyzers and Regional Distribution Stock',
    badge: '24-Hour Regional Dispatch'
  }
];

export default function WebsiteDomainPreviewPage(props) {
  const routerParams = useParams();
  const searchParams = useSearchParams();
  const isSandboxMode = searchParams?.get('sandbox') === 'true' || searchParams?.get('admin') === 'true';
  const initialPageParam = searchParams?.get('page') || 'home';

  const rawDomain = (props?.params?.domain || routerParams?.domain) 
    ? decodeURIComponent(props?.params?.domain || routerParams?.domain) 
    : 'rajbiosis.com';

  const initialSite = React.useMemo(() => {
    return FALLBACK_SITES.find(s => s.domain?.toLowerCase() === rawDomain.toLowerCase()) || {
      id: 'site-custom',
      domain: rawDomain,
      brandName: rawDomain.split('.')[0].toUpperCase() + ' Biomedical',
      tagline: 'Advanced Biomedical Hospital Equipment & Critical Care',
      primaryColor: '#0ea5e9',
      font: 'Plus Jakarta Sans',
      headerStyle: 'Telemetry Bar',
      homepageLayout: 'Banner Carousel',
      categoryFocus: 'All Clinical Departments',
      cardStyle: 'Bordered Minimal',
      phone: '1800-419-BIOSIS',
      email: `contact@${rawDomain}`,
      city: 'New Delhi, India'
    };
  }, [rawDomain]);

  const [site, setSite] = useState(initialSite);
  const [loading, setLoading] = useState(false);
  const [homepageConfig, setHomepageConfig] = useState(DEFAULT_HOMEPAGE_CONFIG);
  const [activePage, setActivePage] = useState(initialPageParam);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);
  
  // Hero Carousel Slide Index & Auto-Play
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const heroBlock = site?.layoutBlocks?.find(b => b.type === 'hero');
    const slides = (heroBlock?.data?.slides && heroBlock.data.slides.length > 0)
      ? heroBlock.data.slides
      : DEFAULT_HERO_SLIDES;

    if (!slides || slides.length <= 1) return;

    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [site?.layoutBlocks]);

  // Interactive RFQ Modal State
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProduct, setRfqProduct] = useState(null);
  const [rfqDoctorName, setRfqDoctorName] = useState('');
  const [rfqHospital, setRfqHospital] = useState('');
  const [rfqPhone, setRfqPhone] = useState('');
  const [rfqEmail, setRfqEmail] = useState('');
  const [rfqCity, setRfqCity] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('1 Unit');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);

  useEffect(() => {
    async function fetchSiteData() {
      try {
        const res = await fetch('/api/sites');
        const data = await res.json();
        if (data.success && data.sites?.length > 0) {
          const found = data.sites.find(s => s.domain?.toLowerCase() === rawDomain.toLowerCase());
          if (found) {
            setSite(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API site fetch fallback:', err);
      }

      const fallback = FALLBACK_SITES.find(s => s.domain?.toLowerCase() === rawDomain.toLowerCase()) || {
        id: 'site-custom',
        domain: rawDomain,
        brandName: rawDomain.split('.')[0].toUpperCase() + ' Biomedical',
        tagline: 'Advanced Biomedical Hospital Equipment & Critical Care',
        primaryColor: '#0ea5e9',
        font: 'Plus Jakarta Sans',
        headerStyle: 'Telemetry Bar',
        homepageLayout: 'Banner Carousel',
        categoryFocus: 'All Clinical Departments',
        cardStyle: 'Bordered Minimal',
        phone: '1800-419-BIOSIS',
        email: `contact@${rawDomain}`,
        city: 'New Delhi, India'
      };
      setSite(fallback);
      setLoading(false);
    }

    fetchSiteData();

    async function fetchHomepage() {
      try {
        const res = await fetch(`/api/website/homepage?domain=${encodeURIComponent(rawDomain)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setHomepageConfig(json.data);
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic homepage config:', e);
      }
    }
    fetchHomepage();

    try {
      const overrideStr = localStorage.getItem(`preview_override_${rawDomain}`);
      if (overrideStr) {
        const override = JSON.parse(overrideStr);
        setSite(prev => ({ ...prev, ...override }));
      }
    } catch (e) {}
  }, [rawDomain]);

  // Real-time live update listener & page navigation listener from Visual Page Builder
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'BUILDER_LIVE_UPDATE' && e.data?.payload) {
        setSite(prev => ({
          ...prev,
          ...e.data.payload
        }));
      }
      if (e.data?.type === 'SET_ACTIVE_PAGE' && e.data?.page) {
        setActivePage(e.data.page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load Google Font Dynamically
  useEffect(() => {
    if (!site?.font) return;
    const fontName = site.font.replace(/\s+/g, '+');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {}
    };
  }, [site?.font]);

  const handleNavigatePage = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isSandboxMode && window.parent) {
      window.parent.postMessage({ type: 'PAGE_CHANGED', page: pageId }, '*');
    }
  };

  const getBlock = (type) => {
    if (!site?.layoutBlocks || !Array.isArray(site.layoutBlocks)) return null;
    return site.layoutBlocks.find(b => b.type === type) || null;
  };

  const isBlockEnabled = (type) => {
    const block = getBlock(type);
    if (!block) return true;
    return block.enabled !== false;
  };

  const announcementBlock = getBlock('announcement');
  const headerBlock = getBlock('header');
  const quickNavBlock = getBlock('quickNav');
  const footerBlock = getBlock('footer');

  // Filter Products
  const siteFilteredProducts = React.useMemo(() => {
    if (!site) return [];
    
    const prodBlock = getBlock('products');
    const customList = prodBlock?.data?.customProducts || site.customProducts;
    let list = (customList && Array.isArray(customList) && customList.length > 0)
      ? [...customList, ...PRODUCTS]
      : PRODUCTS;

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory || p.id === selectedCategory || (p.name && p.name.toLowerCase().includes(selectedCategory.toLowerCase())));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.shortDesc && p.shortDesc.toLowerCase().includes(q)));
    }

    return list;
  }, [site, selectedCategory, searchQuery]);

  const openRfqModal = (prod) => {
    setRfqProduct(prod);
    setRfqSuccess(false);
    setRfqModalOpen(true);
  };

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    setRfqSubmitting(true);

    const leadPrice = rfqProduct?.price || 150000;
    const numQty = parseInt(String(rfqQuantity || '1').replace(/\D/g, ''), 10) || 1;
    const itemTotal = leadPrice * numQty;

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const mon = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const yr = String(yyyy).slice(2);
    const rand = Math.floor(100 + Math.random() * 900);
    const refNo = `RBPL/Q${rand}${dd}${mon}${yr}`;
    const quotationId = `quot-${Date.now()}`;
    const leadId = `lead-${Date.now()}`;

    // Extract product specs / bullets for 4-page quotation PDF
    let bulletsList = [];
    if (rfqProduct?.specs && typeof rfqProduct.specs === 'object') {
      bulletsList = Object.entries(rfqProduct.specs).slice(0, 5).map(([k, v]) => `${k}: ${v}`);
    } else if (rfqProduct?.features && Array.isArray(rfqProduct.features)) {
      bulletsList = rfqProduct.features.slice(0, 5);
    }
    if (bulletsList.length === 0) {
      bulletsList = [
        'CDSCO Medical Device Rules 2017 & ISO 13485:2016 Certified Direct OEM Unit',
        'Complete unboxing, hospital electrical grounding & on-site clinical commissioning',
        'Includes 2-Year Comprehensive OEM Warranty & 24/7 on-call engineering breakdown response'
      ];
    }

    const docName = (rfqDoctorName || '').trim() || 'Dr. Procurement Lead';
    const hospName = (rfqHospital || '').trim() || 'Apollo Super Speciality Hospital';
    const cityName = (rfqCity || site?.city || '').trim() || 'Jaipur, Rajasthan';
    const prodTitle = rfqProduct?.name || 'Institutional Medical Devices & Equipment Batch';
    const prodSku = rfqProduct?.sku || 'BATCH-INSTITUTIONAL';

    // 1. Official Quotation Object
    const quotationPayload = {
      id: quotationId,
      refNo,
      date: `${dd}.${mm}.${yyyy}`,
      customerName: hospName,
      customerAddress1: [
        `Attn: ${docName}`,
        rfqPhone ? `Mob: ${rfqPhone}` : ''
      ].filter(Boolean).join(', '),
      customerAddress2: [
        cityName,
        rfqEmail ? `Email: ${rfqEmail}` : ''
      ].filter(Boolean).join(' • '),
      hospitalName: hospName,
      doctorName: docName,
      phone: rfqPhone || '',
      email: rfqEmail || '',
      city: cityName,
      address: cityName,
      subjectLetter: `Quotation purchase of ${prodTitle}`,
      subjectQuotation: `Purchase of ${prodTitle}${prodSku ? `, Model: ${prodSku}` : ''}`,
      signatory: {
        name: 'Bhupender Raj',
        role: 'Sales & Mkt. Head',
        company: site?.brandName ? `${site.brandName} (Raj Biosis Pvt Ltd.)` : 'Raj Biosis Pvt Ltd.',
        address1: 'B-7, Aman Plaza, Plot No. 26,',
        address2: 'Heera Nagar-A, Chitrakoot',
        city: 'Jaipur-302021 Rajasthan',
        phone: '+91-998-3333-469'
      },
      items: [
        {
          id: `item-1`,
          sr: 1,
          itemCode: prodSku,
          title: prodTitle,
          bullets: bulletsList.join('\n'),
          qty: numQty,
          unitLabel: 'No',
          unitPrice: leadPrice,
          totalPrice: itemTotal
        }
      ],
      subtotal: itemTotal,
      taxMode: 'inclusive',
      taxAmount: 0,
      grandTotal: itemTotal,
      amountInWords: numberToWordsIndian(itemTotal),
      source: 'website_rfq',
      sourceDomain: site.domain,
      brandName: site.brandName,
      leadId: leadId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 2. Central Lead Object
    const leadPayload = {
      id: leadId,
      doctorName: docName,
      hospital: hospName,
      city: cityName,
      address: cityName,
      email: rfqEmail || 'doctor@hospital.org',
      phone: rfqPhone || '+91 98000 00000',
      equipment: prodTitle,
      productName: prodTitle,
      productSku: prodSku,
      productId: rfqProduct?.id || null,
      productImage: rfqProduct?.image || null,
      specs: rfqProduct?.specs || null,
      features: rfqProduct?.features || null,
      price: leadPrice,
      quoteAmount: `₹${itemTotal.toLocaleString('en-IN')}`,
      estimatedValue: itemTotal,
      sourceDomain: site.domain,
      siteDomain: site.domain,
      brandName: site.brandName,
      status: 'Quote Generated',
      quotationId: quotationId,
      quotationRef: refNo,
      isProfileComplete: true,
      quantity: `${numQty} Unit${numQty > 1 ? 's' : ''}`,
      createdAt: new Date().toISOString(),
      date: 'Just now'
    };

    // 3. Customer Profile Payload
    const customerPayload = {
      fullName: docName,
      hospitalName: hospName,
      phone: rfqPhone || '',
      email: rfqEmail || '',
      district: cityName,
      address: cityName,
      state: 'Rajasthan',
      siteDomain: site.domain,
      brandName: site.brandName
    };

    // 4. INSTANT ZERO-LATENCY BROADCAST TO ADMIN DESK (Fired immediately in 0ms)
    try {
      if (typeof window !== 'undefined') {
        // BroadcastChannel across tabs
        try {
          const channel = new BroadcastChannel('biomedical_leads_channel');
          channel.postMessage({ type: 'NEW_WEB_QUOTATION', quotation: quotationPayload, lead: leadPayload });
          channel.postMessage({ type: 'NEW_WEB_LEAD', lead: leadPayload, quotation: quotationPayload });
          setTimeout(() => { try { channel.close(); } catch(e){} }, 15000);
        } catch(bcErr) {}

        // LocalStorage for cross-window and hard reload sync
        try {
          localStorage.setItem('latest_web_quotation', JSON.stringify({ ...quotationPayload, ts: Date.now() }));
          localStorage.setItem('latest_web_lead', JSON.stringify({ ...leadPayload, ts: Date.now() }));
        } catch(lsErr) {}

        // Iframe parent communication
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'NEW_WEB_QUOTATION', quotation: quotationPayload, lead: leadPayload }, '*');
            window.parent.postMessage({ type: 'NEW_WEB_LEAD', lead: leadPayload, quotation: quotationPayload }, '*');
          }
        } catch(ipErr) {}

        // Window opener communication (if opened in separate tab)
        try {
          if (window.opener) {
            window.opener.postMessage({ type: 'NEW_WEB_QUOTATION', quotation: quotationPayload, lead: leadPayload }, '*');
            window.opener.postMessage({ type: 'NEW_WEB_LEAD', lead: leadPayload, quotation: quotationPayload }, '*');
          }
        } catch(opErr) {}

        // Same-window CustomEvent dispatch
        try {
          window.dispatchEvent(new CustomEvent('new_web_quotation', { detail: quotationPayload }));
          window.dispatchEvent(new CustomEvent('new_web_lead', { detail: leadPayload }));
        } catch(ceErr) {}
      }
    } catch (instantErr) {
      console.warn('Instant quotation broadcast error:', instantErr);
    }

    // 5. Persist to API endpoints in background (Quotations + Leads + Customers)
    try {
      await Promise.allSettled([
        fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quotationPayload)
        }),
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload)
        }),
        fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerPayload)
        })
      ]);
      setRfqSuccess(true);
    } catch (err) {
      setRfqSuccess(true);
    } finally {
      setRfqSubmitting(false);
    }
  };

  const notifySelectBlock = (blockType) => {
    if (isSandboxMode && window.parent) {
      window.parent.postMessage({ type: 'SECTION_SELECT', blockType }, '*');
    }
  };

  const primary = site?.primaryColor || '#0ea5e9';

  // Dynamic Card Style Class Resolver
  const getCardClasses = (extra = '') => {
    const rawStyle = (site?.cardStyle || '').toLowerCase();
    const borderAccent = rawStyle.includes('row') || rawStyle.includes('table') || rawStyle.includes('gradient');

    if (rawStyle.includes('floating') || rawStyle.includes('shadow')) {
      return `bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ${extra}`;
    }
    if (rawStyle.includes('glass') || rawStyle.includes('modern')) {
      return `bg-white/85 backdrop-blur-md rounded-3xl border border-white/90 shadow-md hover:shadow-xl hover:bg-white transition-all duration-300 ${extra}`;
    }
    if (borderAccent) {
      return `bg-white rounded-2xl border border-slate-200/90 shadow-xs border-t-4 hover:shadow-md transition-all duration-200 ${extra}`;
    }
    // Default: Bordered Minimal
    return `bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 ${extra}`;
  };

  const getCardStyle = () => {
    const rawStyle = (site?.cardStyle || '').toLowerCase();
    if (rawStyle.includes('row') || rawStyle.includes('table') || rawStyle.includes('gradient')) {
      return { borderTopColor: primary };
    }
    return {};
  };

  // RENDER DYNAMIC BLOCK COMPONENT BY TYPE
  const renderDynamicBlock = (block) => {
    if (!block || block.enabled === false) return null;

    // Helper wrapper for interactive inspector in sandbox mode + Universal Background, Text & Motion Styler
    const wrapBlock = (content, title = block.name) => {
      const isMarquee = block.data?.motionType === 'marquee' && block.data?.isMotionActive !== false;
      const isPulse = block.data?.motionType === 'pulse' && block.data?.isMotionActive !== false;
      const isGlow = block.data?.motionType === 'glow' && block.data?.isMotionActive !== false;

      const motionClass = isPulse 
        ? 'animate-pulse' 
        : isGlow 
        ? 'ring-4 ring-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.35)]' 
        : '';

      const speedDuration = block.data?.motionSpeed === 'fast' ? '12s' : block.data?.motionSpeed === 'slow' ? '36s' : '22s';

      return (
        <div
          key={block.id}
          id={`section-block-${block.id}`}
          onClick={() => notifySelectBlock(block.type)}
          style={{
            backgroundColor: block.data?.bgColor || undefined,
            color: block.data?.textColor || undefined
          }}
          className={`relative transition-all ${motionClass} ${
            isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 hover:ring-offset-2 rounded-2xl group' : ''
          }`}
          title={isSandboxMode ? `Click to edit ${title}` : ''}
        >
          {isSandboxMode && (
            <div className="absolute top-2 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none z-30 flex items-center gap-1.5">
              <span>✏️ Click to Edit {title}</span>
              {block.data?.btnColor && <span className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: block.data.btnColor }} />}
              {isMarquee && <span className="bg-amber-400 text-slate-950 px-1 rounded text-[9px]">RUNNING</span>}
            </div>
          )}

          {isMarquee ? (
            <div className="overflow-hidden w-full select-none py-1">
              <div 
                className="marquee-track-left gap-8"
                style={{ animationDuration: speedDuration }}
              >
                <div className="shrink-0">{content}</div>
                <div className="shrink-0">{content}</div>
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      );
    };

    // 1. HERO BANNER (SUPPORTS PURE IMAGE CAROUSEL, CENTERED IMPACT & SPLIT B2B)
    if (block.type === 'hero') {
      const heroVariant = (block.data?.heroLayout || site.homepageLayout || site.heroStyle || '').toLowerCase();
      const blockBtnBg = block.data?.btnColor || primary;
      const blockBtnText = block.data?.btnTextColor || '#ffffff';
      const isCarousel = heroVariant.includes('carousel') || block.data?.isPureCarousel || block.data?.hideText || site.homepageLayout === 'Banner Carousel';

      // ARCHETYPE: IMAGE CAROUSEL / SLIDER (SUPPORTS PURE BANNERS WITH NO TEXT)
      if (isCarousel) {
        const slides = (homepageConfig?.carousel && homepageConfig.carousel.length > 0)
          ? homepageConfig.carousel.filter(s => s.active !== false)
          : (block.data?.slides && block.data.slides.length > 0)
          ? block.data.slides
          : (block.data?.bannerImage || site.bannerImage)
          ? [{ id: 1, image: block.data?.bannerImage || site.bannerImage, title: site.heroTitle, subtitle: site.tagline }, ...DEFAULT_HERO_SLIDES.slice(1)]
          : DEFAULT_HERO_SLIDES;

        const activeIndex = heroSlide % slides.length;
        const currentSlide = slides[activeIndex] || slides[0];
        const hideText = block.data?.hideText === true || heroVariant.includes('pure');

        return wrapBlock(
          <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 select-none">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 group h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px]">
              {/* Banner Slide Images */}
              {slides.map((slide, sIdx) => (
                <div
                  key={slide.id || sIdx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    sIdx === activeIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title || `Hero banner slide ${sIdx + 1}`}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_HERO_SLIDES[sIdx % DEFAULT_HERO_SLIDES.length].image;
                    }}
                  />
                  {/* Subtle dark gradient overlay if text is enabled */}
                  {!hideText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                  )}
                </div>
              ))}

              {/* Text Overlay (Only if hideText is FALSE) */}
              {!hideText && (
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12 max-w-3xl space-y-3.5 text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white w-fit shadow-xs">
                    <Sparkles size={13} style={{ color: blockBtnBg }} />
                    <span>{block.data?.badgeText || currentSlide.badge || 'Direct OEM Procurement • CDSCO & GeM'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                    {block.data?.title || currentSlide.title || site.heroTitle || `${site.brandName} Biomedical Life Systems`}
                  </h1>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 max-w-2xl drop-shadow">
                    {block.data?.subtitle || currentSlide.subtitle || site.tagline || 'Specialized clinical hospital equipment delivered directly from manufacturer.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNavigatePage('shop'); }}
                      className="px-6 py-3 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:shadow-lg hover:scale-105"
                      style={{ backgroundColor: blockBtnBg, color: blockBtnText }}
                    >
                      <span>{block.data?.primaryBtnText || 'Explore Clinical Catalog'}</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                      className="px-6 py-3 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs backdrop-blur-sm transition flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileText size={14} style={{ color: blockBtnBg }} />
                      <span>{block.data?.secondaryBtnText || 'Request Institutional RFQ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Prev / Next Navigation Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroSlide(prev => (prev - 1 + slides.length) % slides.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroSlide(prev => (prev + 1) % slides.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight size={18} />
              </button>

              {/* Slide Counter Badge (e.g. 1/5) */}
              <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 text-xs font-mono font-bold">
                {activeIndex + 1} / {slides.length}
              </div>

              {/* Bottom Pagination Dots / Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroSlide(dotIdx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      dotIdx === activeIndex ? 'w-7 bg-white shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>,
          'Hero Banner Carousel'
        );
      }
      
      // ARCHETYPE A: CENTERED GRAND IMPACT (APPLE / NORDIC MEDTECH)
      if (heroVariant.includes('turnkey') || heroVariant.includes('center') || heroVariant.includes('impact')) {
        return wrapBlock(
          <section className="max-w-7xl mx-auto px-6 pt-10 pb-6 text-center">
            <div className="rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-sm border border-slate-200/80 bg-gradient-to-b from-sky-50/50 via-white to-slate-50 flex flex-col items-center justify-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800">
                <Sparkles size={14} style={{ color: blockBtnBg }} className="animate-pulse" />
                <span>{block.data?.badgeText || 'Next-Gen Biomedical Infrastructure • Direct OEM Batches'}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl text-slate-900">
                {block.data?.title || site.heroTitle || `${site.brandName} Biomedical Life Systems`}
              </h1>
              <p className="text-slate-600 text-sm md:text-lg max-w-2xl leading-relaxed">
                {block.data?.subtitle || site.tagline || 'Specialized clinical equipment engineered for high-acuity ICUs, Modular Operation Theatres, and Emergency Trauma Units across India.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigatePage('shop'); }}
                  className="px-8 py-3.5 rounded-full text-white text-xs font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: blockBtnBg, color: blockBtnText }}
                >
                  <span>{block.data?.primaryBtnText || 'Explore Clinical Catalog'}</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                  className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <span>{block.data?.secondaryBtnText || 'Download Product Spec Sheet'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 w-full max-w-3xl border-t border-slate-200/60">
                <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-2xl font-black text-slate-900">2,840+</div>
                  <div className="text-xs text-slate-500 font-medium">Hospitals Commissioned</div>
                </div>
                <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-2xl font-black text-slate-900">100% CDSCO</div>
                  <div className="text-xs text-slate-500 font-medium">Medical Device Compliant</div>
                </div>
                <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-2xl font-black text-slate-900">24/7 CMC</div>
                  <div className="text-xs text-slate-500 font-medium">Onsite Service Warranty</div>
                </div>
              </div>
            </div>
          </section>,
          'Hero (Centered Impact)'
        );
      }

      // ARCHETYPE B: SPLIT 2-COLUMN B2B SHOWCASE
      if (heroVariant.includes('split') || heroVariant.includes('sidebar')) {
        return wrapBlock(
          <section className="max-w-7xl mx-auto px-6 pt-6 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 rounded-3xl p-8 md:p-10 border border-slate-200/90 bg-white shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                    <ShieldCheck size={14} style={{ color: blockBtnBg }} />
                    <span>{block.data?.badgeText || 'Institutional B2B Procurement Desk'}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                    {block.data?.title || site.heroTitle || `${site.brandName} Biomedical Life Systems`}
                  </h1>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {block.data?.subtitle || site.tagline || 'Direct manufacturer distribution with genuine OEM warranty and institutional discounts for verified hospital desks.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNavigatePage('shop'); }}
                    className="px-6 py-3 rounded-xl text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: blockBtnBg, color: blockBtnText }}
                  >
                    <span>{block.data?.primaryBtnText || 'View Ready Stock Catalog'}</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    <span>{block.data?.secondaryBtnText || 'Instant Quotation Call'}</span>
                  </button>
                </div>
              </div>

              {/* Right Rapid Spec Box */}
              <div className="lg:col-span-5 rounded-3xl p-7 text-white flex flex-col justify-between shadow-lg relative overflow-hidden" style={{ backgroundColor: '#182A54' }}>
                <div className="space-y-4 relative z-10">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-white/10 inline-block">
                    Direct Hospital Supply
                  </span>
                  <h3 className="text-xl font-bold leading-snug">Emergency ICU & Surgery Equipment Hotline</h3>
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Ready Stock in Delhi, Mumbai, Bengaluru</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Complimentary Biomedical Staff Training</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Official Commercial GST 18% Invoicing</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                  className="mt-6 w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={14} style={{ color: blockBtnBg }} />
                  <span>Request Custom BOQ Quote</span>
                </button>
              </div>
            </div>
          </section>,
          'Hero (Split B2B)'
        );
      }

      // ARCHETYPE C: BANNER SHOWCASE (STANDARD)
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/20 to-slate-50 space-y-6">
            {(block.data?.bannerImage || site.bannerImage) && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white relative max-h-[380px] flex items-center justify-center">
                <img
                  src={block.data?.bannerImage || site.bannerImage}
                  alt={site.brandName}
                  className="w-full h-auto max-h-[380px] object-cover object-center"
                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800">
                <Sparkles size={14} style={{ color: blockBtnBg }} />
                <span>{block.data?.badgeText || 'Direct OEM Procurement • GeM & NABH Certified'}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                {block.data?.title || site.heroTitle || `${site.brandName} Biomedical Life Systems`}
              </h1>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {block.data?.subtitle || site.tagline || 'Specialized clinical equipment delivered directly from manufacturer to tertiary hospitals, medical colleges, and specialty clinics. Fully compliant with CDSCO & ISO 13485.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigatePage('shop'); }}
                  className="px-6 py-3 rounded-xl text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer hover:shadow-lg"
                  style={{ backgroundColor: blockBtnBg, color: blockBtnText }}
                >
                  <span>{block.data?.primaryBtnText || 'Explore Clinical Catalog'}</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <FileText size={15} style={{ color: blockBtnBg }} />
                  <span>{block.data?.secondaryBtnText || 'Request Institutional RFQ'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>,
        'Hero Banner'
      );
    }

    // 2. TRUST BADGES
    if (block.type === 'trustBadges') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong className="text-xs text-slate-800 block font-bold">{block.data?.badge1Title || 'ISO 13485:2016'}</strong>
                <span className="text-[10px] text-slate-500">{block.data?.badge1Desc || 'Certified Medical Facility'}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <strong className="text-xs text-slate-800 block font-bold">{block.data?.badge2Title || 'CDSCO Approved'}</strong>
                <span className="text-[10px] text-slate-500">{block.data?.badge2Desc || 'Direct Regulatory Batch'}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Activity size={20} />
              </div>
              <div>
                <strong className="text-xs text-slate-800 block font-bold">{block.data?.badge3Title || '2-Year OEM Warranty'}</strong>
                <span className="text-[10px] text-slate-500">{block.data?.badge3Desc || 'Comprehensive Onsite CMC'}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HeartPulse size={20} />
              </div>
              <div>
                <strong className="text-xs text-slate-800 block font-bold">{block.data?.badge4Title || 'Turnkey Training'}</strong>
                <span className="text-[10px] text-slate-500">{block.data?.badge4Desc || 'Biomedical Engineers'}</span>
              </div>
            </div>
          </div>
        </section>,
        'Trust Badges'
      );
    }

    // 3. CLINICAL CATEGORIES
    if (block.type === 'categories') {
      const items = (homepageConfig?.categories && homepageConfig.categories.length > 0)
        ? homepageConfig.categories.filter(c => c.active !== false)
        : (block.data?.items || site.categories || []);

      return wrapBlock(
        <section id="categories" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">Departments & Verticals</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">{homepageConfig?.categoriesConfig?.heading || block.data?.heading || 'Biomedical Equipment Categories'}</h2>
            </div>
            <button onClick={() => handleNavigatePage('shop')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer">
              <span>View All Categories &gt;</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {items.map((cat, idx) => (
              <div
                key={cat.id || idx}
                onClick={(e) => { e.stopPropagation(); handleNavigatePage('shop'); }}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all text-center flex flex-col items-center justify-between gap-2 cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="w-full h-24 rounded-xl bg-slate-50 p-1 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-sky-200 transition relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-2xl">{cat.icon || '🏥'}</span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-2xs">
                    {cat.badge || `${cat.itemCount || 10} Items`}
                  </span>
                </div>
                <div className="w-full">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-sky-600 transition block">{cat.name}</span>
                  {(cat.desc || cat.description) && <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">{cat.desc || cat.description}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Clinical Categories'
      );
    }

    // 4. TOP HEALTHCARE BRANDS
    if (block.type === 'topBrands') {
      const brandList = (homepageConfig?.brands && homepageConfig.brands.length > 0)
        ? homepageConfig.brands.filter(b => b.active !== false)
        : (block.data?.brands || DEFAULT_TOP_BRANDS);

      return wrapBlock(
        <section id="brands" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{homepageConfig?.brandsConfig?.heading || block.data?.heading || 'Brands We Deal In & Support'}</h3>
              <p className="text-xs text-slate-500">{homepageConfig?.brandsConfig?.subheading || block.data?.subheading || 'Authorised distributors & global OEM partners for critical ICU, surgery and diagnostic imaging equipment.'}</p>
            </div>
            <button onClick={() => handleNavigatePage('shop')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer">
              <span>View All Brands</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {brandList.map((brand, idx) => (
              <div key={idx} onClick={() => handleNavigatePage('shop')} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition flex flex-col justify-between items-center text-center cursor-pointer group">
                <div className="w-full flex justify-end">
                  <span className="text-[8px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded-full border border-sky-100">
                    {brand.tier || 'OEM Partner'}
                  </span>
                </div>
                <div className="w-full h-12 my-1.5 p-1 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-white transition">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition" />
                  ) : (
                    <span className="font-bold text-xs text-slate-900">{brand.name}</span>
                  )}
                </div>
                <div className="w-full mt-1">
                  <div className="font-bold text-xs text-slate-900 group-hover:text-sky-600 transition truncate">{brand.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{brand.tagline || brand.category}</div>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Top Brands'
      );
    }

    // 5. LIGHTNING DEALS & SPOTLIGHT
    if (block.type === 'dealSpotlight') {
      return wrapBlock(
        <section id="deals" className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 rounded-3xl p-7 text-white flex flex-col justify-between shadow-lg relative overflow-hidden" style={{ backgroundColor: '#182A54' }}>
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                  <Zap size={14} className="animate-bounce" />
                  <span>{block.data?.badge || 'FLASH SPOTLIGHT'}</span>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight leading-tight">{block.data?.title || 'Lightning Deals on Critical Hospital Supplies'}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{block.data?.subtitle || 'Direct wholesale batch rate with up to 45% discount for verified hospital procurement desks.'}</p>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
                  <Clock size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-300">Offer Expiration</div>
                    <div className="text-sm font-mono font-bold text-amber-300">{block.data?.timerText || 'Ends in 05h 24m 18s'}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => handleNavigatePage('shop')} className="mt-6 w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md flex items-center justify-center gap-2">
                <span>{block.data?.ctaText || 'Explore All Flash Deals'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEFAULT_DEALS.map((deal) => (
                <div key={deal.id} className={getCardClasses("p-4 flex flex-col justify-between gap-3 group")} style={getCardStyle()}>
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 p-1">
                      <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{deal.brand}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition">{deal.name}</h4>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600">{deal.discount}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-mono font-bold text-slate-900">₹{deal.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{deal.mrp.toLocaleString('en-IN')}</span>
                    </div>
                    <button onClick={() => openRfqModal(deal)} className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition shadow-2xs hover:shadow-sm" style={{ backgroundColor: primary }}>
                      Enquire / RFQ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>,
        'Lightning Deals'
      );
    }

    // 6. TRENDING CONSUMABLES
    if (block.type === 'trendingConsumables') {
      return wrapBlock(
        <section id="consumables" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{block.data?.heading || 'Trending Hospital Consumables'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || 'High-frequency clinical supplies in bulk packaging with immediate dispatch.'}</p>
            </div>
            <button onClick={() => handleNavigatePage('shop')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All Consumables</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DEFAULT_CONSUMABLES.map((item) => (
              <div key={item.id} className={getCardClasses("p-4 flex flex-col justify-between gap-3")} style={getCardStyle()}>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 inline-block mb-1.5">{item.badge}</span>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{item.name}</h4>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-xs text-slate-900">₹{item.price} <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span></div>
                  <button onClick={() => openRfqModal(item)} className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition">
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Trending Consumables'
      );
    }

    // 7. DIAGNOSTIC MACHINERY
    if (block.type === 'diagnosticMachinery') {
      return wrapBlock(
        <section id="diagnostics" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{block.data?.heading || 'Diagnostic & Laboratory Systems'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || 'Automated clinical pathology equipment with factory calibration.'}</p>
            </div>
            <button onClick={() => handleNavigatePage('equipment')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All Lab Equipment</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {DEFAULT_DIAGNOSTICS.map((diag) => (
              <div key={diag.id} className={getCardClasses("p-4 flex flex-col justify-between gap-3")} style={getCardStyle()}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{diag.brand}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">{diag.tag}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{diag.name}</h4>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-slate-900">₹{diag.price.toLocaleString('en-IN')}</div>
                  <button onClick={() => openRfqModal(diag)} className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition shadow-2xs" style={{ backgroundColor: primary }}>
                    Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Diagnostic Machinery'
      );
    }

    // 8. CRITICAL CARE
    if (block.type === 'criticalCare') {
      return wrapBlock(
        <section id="critical" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{block.data?.heading || 'Critical Care & Patient Monitoring'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || 'High-precision telemetry and resuscitation stations for emergency wards & ICUs.'}</p>
            </div>
            <button onClick={() => handleNavigatePage('equipment')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All ICU Units</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {DEFAULT_CRITICAL_CARE.map((crit) => (
              <div key={crit.id} className={getCardClasses("p-4 flex flex-col justify-between gap-3")} style={getCardStyle()}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{crit.brand}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{crit.tag}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{crit.name}</h4>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-slate-900">₹{crit.price.toLocaleString('en-IN')}</div>
                  <button onClick={() => openRfqModal(crit)} className="px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition shadow-2xs" style={{ backgroundColor: primary }}>
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Critical Care'
      );
    }

    // 9. REFURBISHED EQUIPMENT
    if (block.type === 'refurbishedEquipment') {
      return wrapBlock(
        <section id="refurbished" className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{block.data?.heading || 'Certified Refurbished Radiology & Capital Equipment'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || 'Factory recalibrated CT, MRI & C-Arm systems with 1-Year Comprehensive Warranty & AERB support.'}</p>
            </div>
            <button onClick={() => handleNavigatePage('equipment')} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View All Refurbished</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEFAULT_REFURBISHED.map((ref) => (
              <div key={ref.id} className={getCardClasses("p-5 flex flex-col justify-between gap-4")} style={getCardStyle()}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 inline-block">{ref.tag}</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{ref.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-mono">{ref.specs}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Turnkey Installed</span>
                    <span className="font-mono font-bold text-base text-slate-900">₹{(ref.price / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <button onClick={() => openRfqModal(ref)} className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-2xs" style={{ backgroundColor: primary }}>
                    Inspect System
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Refurbished Equipment'
      );
    }

    // 10. PRODUCTS CATALOG (CONFIGURABLE COUNT, FILTER & COLUMNS)
    if (block.type === 'products') {
      const itemsLimit = block.data?.itemsToShow !== undefined && block.data?.itemsToShow !== '' ? Number(block.data?.itemsToShow) : 9;
      const colSetting = Number(block.data?.columns) || 3;
      const colClass = colSetting === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : colSetting === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

      let displayProducts = [...siteFilteredProducts];
      if (block.data?.filterCategory && block.data.filterCategory !== 'all' && selectedCategory === 'all') {
        const cat = block.data.filterCategory.toLowerCase();
        displayProducts = displayProducts.filter(p => 
          (p.category && p.category.toLowerCase().includes(cat)) || 
          (p.name && p.name.toLowerCase().includes(cat)) ||
          (p.id && p.id.toLowerCase().includes(cat))
        );
      }

      if (itemsLimit > 0) {
        displayProducts = displayProducts.slice(0, itemsLimit);
      }

      const showCategoryTabs = block.data?.showCategoryTabs !== false;

      return wrapBlock(
        <section id="catalog" className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{block.data?.heading || 'Certified Biomedical Hardware Catalog'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || 'Hospital-grade critical care equipment available for immediate batch procurement.'}</p>
            </div>
            {showCategoryTabs && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all' ? 'text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={selectedCategory === 'all' ? { backgroundColor: primary } : {}}
                >
                  All Devices ({siteFilteredProducts.length})
                </button>
                {CATEGORIES.filter(c => c.id !== 'all').slice(0, 5).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id ? 'text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: primary } : {}}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`grid ${colClass} gap-6`}>
            {displayProducts.map((prod) => (
              <div key={prod.id} className={getCardClasses("overflow-hidden flex flex-col justify-between")} style={getCardStyle()}>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">SKU: {prod.sku}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{prod.badge || 'Verified OEM'}</span>
                  </div>
                  <div className="h-44 rounded-xl bg-slate-50 overflow-hidden relative group">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{prod.brand}</span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{prod.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.shortDesc}</p>
                  </div>
                </div>
                <div className="p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Institutional Rate</span>
                    <span className="font-mono font-bold text-slate-900 text-base">₹{prod.price.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => openRfqModal(prod)} className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-2xs" style={{ backgroundColor: primary }}>
                    Request RFQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Hardware Products Catalog'
      );
    }

    // 11. CUSTOM RICH TEXT CONTENT BLOCK
    if (block.type === 'customContent') {
      const alignClass = block.data?.align === 'center' ? 'text-center items-center' : block.data?.align === 'right' ? 'text-right items-end' : 'text-left items-start';
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div 
            className={`p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xs flex flex-col ${alignClass} space-y-4`}
            style={{ backgroundColor: block.data?.bgColor || '#ffffff', color: block.data?.textColor || '#0f172a' }}
          >
            {block.data?.heading && (
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {block.data.heading}
              </h2>
            )}
            {block.data?.subheading && (
              <h3 className="text-sm md:text-base font-semibold opacity-80 max-w-2xl">
                {block.data.subheading}
              </h3>
            )}
            {block.data?.bodyText && (
              <p className="text-xs md:text-sm leading-relaxed opacity-90 max-w-3xl">
                {block.data.bodyText}
              </p>
            )}
            {block.data?.btnText && (
              <button
                onClick={() => openRfqModal(null)}
                className="mt-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition"
                style={{ backgroundColor: primary }}
              >
                {block.data.btnText}
              </button>
            )}
          </div>
        </section>,
        'Custom Rich Text'
      );
    }

    // 12. CUSTOM FEATURE CARDS GRID
    if (block.type === 'customGrid') {
      const cols = block.data?.columns === '2' ? 'grid-cols-1 md:grid-cols-2' : block.data?.columns === '4' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';
      const items = block.data?.items || [];
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{block.data?.heading || 'Key Advantages'}</h2>
            {block.data?.subheading && <p className="text-xs text-slate-500">{block.data.subheading}</p>}
          </div>
          <div className={`grid ${cols} gap-6`}>
            {items.map((item, idx) => (
              <div key={item.id || idx} className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition space-y-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs" style={{ backgroundColor: primary }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>,
        'Custom Feature Cards'
      );
    }

    // 13. CUSTOM PROMOTIONAL BANNER
    if (block.type === 'customBanner') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[280px] flex items-center p-8 md:p-12">
            {block.data?.bannerImage && (
              <img src={block.data.bannerImage} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
            <div className="relative z-10 max-w-xl text-white space-y-3">
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">{block.data?.heading || 'Specialized Medical Infrastructure'}</h2>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">{block.data?.subheading || 'Engineered for reliability, zero breakdown downtime, and regulatory compliance.'}</p>
              {block.data?.btnText && (
                <button onClick={() => openRfqModal(null)} className="mt-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition">
                  {block.data.btnText}
                </button>
              )}
            </div>
          </div>
        </section>,
        'Custom Promotional Banner'
      );
    }

    // 14. CUSTOM CODE / HTML / WIDGET
    if (block.type === 'customEmbed') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-4">
          <div dangerouslySetInnerHTML={{ __html: block.data?.htmlCode || '' }} />
        </section>,
        'Custom Code / HTML Widget'
      );
    }

    // 15. CUSTOM CALL-TO-ACTION (CTA)
    if (block.type === 'customCta') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-3xl p-8 md:p-12 text-white text-center space-y-4 shadow-xl" style={{ backgroundColor: primary }}>
            {block.data?.badge && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider">
                {block.data.badge}
              </span>
            )}
            <h2 className="text-2xl md:text-4xl font-extrabold max-w-2xl mx-auto leading-tight">
              {block.data?.heading || 'Ready to Upgrade Your Hospital Equipment?'}
            </h2>
            <p className="text-xs md:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
              {block.data?.subheading || 'Contact our engineering advisory desk for instant institutional BOQs and GeM tender assistance.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onClick={() => openRfqModal(null)} className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-50 transition">
                {block.data?.primaryBtnText || 'Get Official Stamped Quotation'}
              </button>
              {block.data?.secondaryBtnText && (
                <button onClick={() => handleNavigatePage('contact')} className="px-6 py-3 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition border border-white/30">
                  {block.data.secondaryBtnText}
                </button>
              )}
            </div>
          </div>
        </section>,
        'High-Converting CTA'
      );
    }

    // 16. TURNKEY HOSPITAL PACKAGES
    if (block.type === 'turnkeySolutions') {
      return wrapBlock(
        <section id="turnkey" className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg">
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white inline-block">Turnkey Hospital Projects</span>
              <h3 className="text-2xl md:text-3xl font-extrabold">{block.data?.heading || 'Turnkey Modular ICU & Surgical Suites'}</h3>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{block.data?.subheading || 'Complete architectural layout, electrical commissioning & equipment integration by senior biomedical engineers.'}</p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button onClick={() => openRfqModal(null)} className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition">
                  Request Turnkey Proposal
                </button>
              </div>
            </div>
          </div>
        </section>,
        'Turnkey Solutions'
      );
    }

    // 17. TESTIMONIALS
    if (block.type === 'testimonials') {
      const testimonialsList = block.data?.items || site.customTestimonials || DEFAULT_TESTIMONIALS;
      return wrapBlock(
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">Clinical Trust & Reliability</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{block.data?.heading || 'What Our Customers Say About Us'}</h3>
            <p className="text-xs text-slate-500">{block.data?.subheading || 'Trusted by over 2,800+ hospitals, medical colleges, and diagnostic chains across India.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsList.map((t, idx) => (
              <div key={t.id || idx} className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={15} className="fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {(t.doctor || 'Dr.').charAt(4) || 'D'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{t.doctor}</div>
                    <div className="text-[10px] text-slate-500">{t.role}</div>
                    <div className="text-[10px] font-semibold text-sky-700">{t.hospital}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>,
        'Customer Testimonials'
      );
    }

    // 18. FAQS
    if (block.type === 'faqs') {
      const faqsList = block.data?.items || site.customFaqs || DEFAULT_FAQS;
      return wrapBlock(
        <section id="faqs" className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-6 space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900">{block.data?.heading || 'Frequently Asked Questions'}</h3>
            <p className="text-xs text-slate-500">{block.data?.subheading || 'Everything you need to know about ordering biomedical hardware and hospital supplies.'}</p>
          </div>
          <div className="space-y-3">
            {faqsList.map((faq, idx) => (
              <div key={faq.id || idx} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-800 hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  {expandedFaq === idx ? <ChevronUp size={16} className="text-sky-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>,
        'FAQs'
      );
    }

    // 19. RFQ BANNER
    if (block.type === 'rfqBanner') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md" style={{ backgroundColor: primary }}>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-extrabold">{block.data?.heading || 'Planning Hospital Wing Expansion or New ICU Ward?'}</h3>
              <p className="text-white/80 text-xs max-w-xl">{block.data?.subheading || 'Our biomedical engineers calculate customized BOQs (Bill of Quantities) within 30 minutes.'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => openRfqModal(null)} className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-50 transition cursor-pointer">
                {block.data?.btnText || 'Talk to Clinical Specialist'}
              </button>
            </div>
          </div>
        </section>,
        'RFQ Callout'
      );
    }

    // 20. CONTACT DESK
    if (block.type === 'contactDesk') {
      return wrapBlock(
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{block.data?.heading || 'Central Biomedical Dispatch & Engineering Desks'}</h3>
              <p className="text-xs text-slate-500">{block.data?.subheading || `Regional hub operating with 4-hour emergency response in ${site.city}.`}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">📞 Hotline Support</span>
                <span className="text-xs font-mono text-slate-600">{site.phone}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">✉️ Institutional Email</span>
                <span className="text-xs font-mono text-slate-600">{site.email}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">📍 Regional Depot</span>
                <span className="text-xs text-slate-600">{site.city}</span>
              </div>
            </div>
          </div>
        </section>,
        'Helpdesk Hubs'
      );
    }

    return null;
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white"
      style={{ fontFamily: site.font ? `'${site.font}', sans-serif` : 'sans-serif' }}
    >
      {/* DIRECT DEVELOPER CUSTOM CSS INJECTION */}
      {site.customCss && (
        <style dangerouslySetInnerHTML={{ __html: site.customCss }} />
      )}

      {/* CONTINUOUS MOVING TICKER / MARQUEE ANIMATION STYLE */}
      <style>{`
        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .marquee-track-left {
          display: inline-flex;
          white-space: nowrap;
          animation: marqueeScrollLeft 22s linear infinite;
        }
        .marquee-track-right {
          display: inline-flex;
          white-space: nowrap;
          animation: marqueeScrollRight 22s linear infinite;
        }
        .marquee-track-left:hover, .marquee-track-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* TOP SANDBOX TELEMETRY PILL */}
      {isSandboxMode && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
            >
              <ArrowLeft size={13} />
              <span>Back to Super-Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Live Engine Sandbox:</span>
              <strong className="text-sky-400 font-mono bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded text-[11px]">{site.domain}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hidden sm:inline">Theme: <strong className="text-white font-mono">{primary}</strong></span>
            <span className="hidden md:inline">Page: <strong className="text-sky-300 uppercase">{activePage}</strong></span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-2.5 py-0.5 rounded font-mono font-medium">
              MongoDB Atlas Live
            </span>
          </div>
        </div>
      )}

      {/* CUSTOM ANNOUNCEMENT RIBBON (SUPPORTS MOVING TICKER / MARQUEE OR STATIC) */}
      {isBlockEnabled('announcement') && (announcementBlock?.data?.text || site.announcement) && (
        <div 
          onClick={() => notifySelectBlock('announcement')}
          className={`text-white text-xs py-2 px-4 font-semibold tracking-wide sticky top-0 z-40 shadow-xs overflow-hidden ${
            isSandboxMode ? 'cursor-pointer hover:ring-4 hover:ring-sky-400 hover:ring-inset transition-all relative group' : ''
          }`}
          style={{ backgroundColor: announcementBlock?.data?.bgColor || primary }}
          title={isSandboxMode ? "Click to edit Top Notice Bar" : ""}
        >
          {isSandboxMode && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none z-50">
              ✏️ Click to Edit Notice Bar {announcementBlock?.data?.isMarquee ? '(Moving Ticker Active)' : ''}
            </span>
          )}

          {announcementBlock?.data?.isMarquee ? (
            <div className="flex items-center overflow-hidden w-full select-none">
              <div 
                className={`${announcementBlock?.data?.marqueeDirection === 'right' ? 'marquee-track-right' : 'marquee-track-left'} gap-10`}
                style={{
                  animationDuration: announcementBlock?.data?.marqueeSpeed === 'fast' ? '12s' : announcementBlock?.data?.marqueeSpeed === 'slow' ? '36s' : '22s'
                }}
              >
                {[1, 2, 3, 4].map(idx => (
                  <span key={idx} className="inline-flex items-center gap-3 text-xs">
                    <Sparkles size={13} className="animate-pulse shrink-0" />
                    <span>{announcementBlock?.data?.text || site.announcement}</span>
                    {announcementBlock?.data?.badge && (
                      <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {announcementBlock.data.badge}
                      </span>
                    )}
                    <span className="text-white/40">✦</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-center">
              <Sparkles size={13} className="animate-pulse" />
              <span>{announcementBlock?.data?.text || site.announcement}</span>
              {announcementBlock?.data?.badge && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {announcementBlock.data.badge}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC TOP OFFERS BAR (MATCHING USER SCREENSHOT) */}
      {(homepageConfig?.offers?.filter(o => o.active).length > 0) && (
        <div className="bg-slate-950 text-white text-xs py-2 px-4 md:px-6 sticky top-0 z-40 shadow-xs border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {homepageConfig.offers.filter(o => o.active).map((offer) => {
                const isRose = offer.color === 'rose';
                const isAmber = offer.color === 'amber';
                const isEmerald = offer.color === 'emerald';
                const isSky = offer.color === 'sky';
                const isRedOutline = offer.color === 'red-outline';
                const pillClass = isRose
                  ? 'bg-rose-600 text-white'
                  : isAmber
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : isEmerald
                  ? 'bg-emerald-600 text-white'
                  : isSky
                  ? 'bg-sky-500 text-white'
                  : isRedOutline
                  ? 'bg-white text-rose-600 border border-rose-400'
                  : 'bg-indigo-600 text-white';

                return (
                  <a
                    key={offer.id}
                    href={offer.link || '#'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition hover:scale-105 ${pillClass}`}
                  >
                    <span className="font-bold">{offer.tag}:</span>
                    <span>{offer.title}</span>
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto">
              <a
                href={`tel:${homepageConfig.offersConfig?.hotline || site.phone}`}
                className="text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-1"
              >
                <Phone size={12} className="text-sky-400" />
                <span>{homepageConfig.offersConfig?.hotline || site.phone || '+91 9999-BIOSIS'}</span>
              </a>
              <button
                onClick={() => openRfqModal(null)}
                className="px-3.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {homepageConfig.offersConfig?.quoteBtnText || 'Request A Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL HEADER WITH 4 DISTINCT ARCHETYPES */}
      {(() => {
        const rawStyle = (headerBlock?.data?.headerStyle || site.headerStyle || '').toLowerCase();
        
        // ARCHETYPE 1: STICKY FLOATING CAPSULE / PILL (MODERN APPLE/SAAS CLINICAL)
        if (rawStyle.includes('pill') || rawStyle.includes('floating')) {
          return (
            <header 
              onClick={() => notifySelectBlock('header')}
              className={`sticky top-3 z-40 max-w-6xl mx-auto px-4 my-2 transition-all ${
                isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 rounded-full group' : ''
              }`}
              title={isSandboxMode ? "Click to edit Floating Pill Header" : ""}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-slate-200/90 px-6 py-2.5 flex items-center justify-between gap-4">
                <div onClick={(e) => { e.stopPropagation(); handleNavigatePage('home'); }} className="flex items-center gap-2.5 cursor-pointer shrink-0">
                  {(headerBlock?.data?.logoUrl || site.logo) ? (
                    <img src={headerBlock?.data?.logoUrl || site.logo} alt={site.brandName} className="h-8 max-w-[140px] object-contain rounded" />
                  ) : (
                    <div className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs" style={{ backgroundColor: primary }}>
                      {site.brandName.charAt(0)}
                    </div>
                  )}
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden sm:inline">{site.brandName}</span>
                </div>

                <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
                  {[
                    { id: 'home', label: 'Home' },
                    { id: 'shop', label: 'Catalog' },
                    { id: 'equipment', label: 'Machinery' },
                    { id: 'rfq', label: 'RFQ Portal' },
                    { id: 'about', label: 'About' },
                    { id: 'contact', label: 'Helpdesk' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => { e.stopPropagation(); handleNavigatePage(p.id); }}
                      className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                        activePage === p.id ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-2.5 shrink-0">
                  <a href={`tel:${site.phone}`} className="hidden lg:flex items-center gap-1 text-xs font-mono font-semibold text-slate-700 hover:text-sky-600">
                    <Phone size={12} style={{ color: primary }} />
                    <span>{site.phone}</span>
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                    className="px-4 py-2 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
                    style={{ backgroundColor: primary }}
                  >
                    <span>Instant Quote</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </header>
          );
        }

        // ARCHETYPE 2: MINIMALIST SINGLE ROW (CLEAN NORDIC)
        if (rawStyle.includes('minimal') || rawStyle.includes('single')) {
          return (
            <header 
              onClick={() => notifySelectBlock('header')}
              className={`bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs ${
                isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 relative group' : ''
              }`}
              title={isSandboxMode ? "Click to edit Minimalist Header" : ""}
            >
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
                <div onClick={(e) => { e.stopPropagation(); handleNavigatePage('home'); }} className="flex items-center gap-3 cursor-pointer shrink-0">
                  {(headerBlock?.data?.logoUrl || site.logo) ? (
                    <img src={headerBlock?.data?.logoUrl || site.logo} alt={site.brandName} className="h-9 max-w-[160px] object-contain rounded" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs" style={{ backgroundColor: primary }}>
                      {site.brandName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-extrabold text-base text-slate-900 block leading-tight">{site.brandName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{site.domain}</span>
                  </div>
                </div>

                <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
                  {[
                    { id: 'home', label: 'Storefront' },
                    { id: 'shop', label: 'Catalog' },
                    { id: 'equipment', label: 'Machinery' },
                    { id: 'rfq', label: 'Tenders & BOQ' },
                    { id: 'about', label: 'Compliance' },
                    { id: 'contact', label: 'Contact' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => { e.stopPropagation(); handleNavigatePage(p.id); }}
                      className={`transition cursor-pointer ${
                        activePage === p.id ? 'font-bold' : 'hover:text-slate-900'
                      }`}
                      style={activePage === p.id ? { color: primary } : {}}
                    >
                      {p.label}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-3 shrink-0">
                  <a href={`tel:${site.phone}`} className="hidden sm:flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700">
                    <Phone size={13} style={{ color: primary }} />
                    <span>{site.phone}</span>
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                    style={{ backgroundColor: primary }}
                  >
                    Get Pricing
                  </button>
                </div>
              </div>
            </header>
          );
        }

        // ARCHETYPE 3: CENTERED SEARCH (E-COMMERCE & FAST CATALOG)
        if (rawStyle.includes('search') || rawStyle.includes('centered') || rawStyle.includes('catalog')) {
          return (
            <header 
              onClick={() => notifySelectBlock('header')}
              className={`bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs ${
                isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 relative group' : ''
              }`}
            >
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
                <div onClick={(e) => { e.stopPropagation(); handleNavigatePage('home'); }} className="flex items-center gap-2.5 cursor-pointer shrink-0">
                  {(headerBlock?.data?.logoUrl || site.logo) ? (
                    <img src={headerBlock?.data?.logoUrl || site.logo} alt={site.brandName} className="h-9 max-w-[160px] object-contain" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm" style={{ backgroundColor: primary }}>
                      {site.brandName.charAt(0)}
                    </div>
                  )}
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">{site.brandName}</span>
                </div>

                <div className="flex-1 max-w-xl mx-4 hidden sm:block">
                  <div className="relative flex items-center bg-slate-100 rounded-2xl border border-slate-300 focus-within:border-sky-500 focus-within:bg-white transition px-3 py-1.5 shadow-inner">
                    <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search verified medical devices, brand, model or SKU..."
                      className="w-full text-xs text-slate-800 bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: primary }}
                  >
                    <ShoppingCart size={14} />
                    <span>RFQ Cart</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-1.5 overflow-x-auto">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
                  {[
                    { id: 'home', label: '🏠 All Departments' },
                    { id: 'shop', label: '⚡ Fast Shipping' },
                    { id: 'equipment', label: '🏥 Heavy Machinery' },
                    { id: 'rfq', label: '📋 Institutional BOQ' },
                    { id: 'about', label: '🛡️ GeM / NABH Compliance' },
                    { id: 'contact', label: '📞 24/7 Service' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => { e.stopPropagation(); handleNavigatePage(p.id); }}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                        activePage === p.id ? 'bg-white shadow-xs font-bold text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>
          );
        }

        // ARCHETYPE 4: ENTERPRISE TELEMETRY BAR (TWO-TIER B2B - DEFAULT)
        return (
          <header 
            onClick={() => notifySelectBlock('header')}
            className={`bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs ${
              isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 hover:ring-offset-2 transition-all relative group' : ''
            }`}
            title={isSandboxMode ? "Click to edit Header & Logo" : ""}
          >
            {isSandboxMode && (
              <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none z-30">
                ✏️ Click to Edit Header & Logo
              </div>
            )}

            <div className="bg-slate-50 border-b border-slate-200/80 text-slate-600 text-[11px] px-6 py-1.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <MapPin size={12} style={{ color: primary }} />
                  <span>{headerBlock?.data?.locationText || 'Delivering to: Delhi, 110001 (Pan-India Dispatch)'}</span>
                </span>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="hidden md:flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>CDSCO & ISO 13485:2016 Certified Direct B2B Hub</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a href={`tel:${site.phone}`} className="flex items-center gap-1 font-mono font-bold text-slate-800 hover:text-sky-600">
                  <Phone size={12} style={{ color: primary }} />
                  <span>{site.phone}</span>
                </a>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{site.city || 'Bengaluru, India'}</span>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
              <div 
                onClick={(e) => { e.stopPropagation(); handleNavigatePage('home'); }} 
                className="flex items-center gap-3 cursor-pointer shrink-0"
              >
                {(headerBlock?.data?.logoUrl || site.logo) ? (
                  <img
                    src={headerBlock?.data?.logoUrl || site.logo}
                    alt={site.brandName}
                    className="h-10 max-w-[190px] object-contain rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    {site.brandName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-base font-extrabold text-slate-900 block leading-tight">{site.brandName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{site.domain}</span>
                </div>
              </div>

              <div className="flex-1 max-w-xl hidden md:block">
                <div className="relative flex items-center bg-slate-100 border border-slate-300 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:bg-white transition shadow-2xs">
                  <Search size={16} className="ml-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 60,000+ medical supplies, hospital equipment, ICU monitors..."
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-transparent outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigatePage('rfq'); }}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <FileText size={14} style={{ color: primary }} />
                  <span>Bulk Order / BOQ</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); openRfqModal(null); }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: primary }}
                >
                  <span>Instant RFQ</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Multi-Page Navigation Bar */}
            <div className="bg-white border-t border-slate-100 px-6 py-2 overflow-x-auto">
              <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs font-semibold">
                {[
                  { id: 'home', label: '🏠 Storefront Home' },
                  { id: 'shop', label: '🛍️ Shop / Clinical Catalog' },
                  { id: 'equipment', label: '🏥 Medical Equipment & Machinery' },
                  { id: 'rfq', label: '📋 B2B Bulk Order & RFQ Portal' },
                  { id: 'about', label: 'ℹ️ About Us & Compliance' },
                  { id: 'contact', label: '📞 Helpdesk & Service Desks' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); handleNavigatePage(p.id); }}
                    className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                      activePage === p.id
                        ? 'text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    style={activePage === p.id ? { backgroundColor: primary } : {}}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>
        );
      })()}

      {/* FLOATING LEFT QUICK-ACCESS SIDEBAR */}
      {isBlockEnabled('quickNav') && (
        <aside
          onClick={() => notifySelectBlock('quickNav')}
          className={`fixed left-3 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl p-2 gap-2 transition-all ${
            isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500' : ''
          }`}
          title={isSandboxMode ? "Click to edit Quick-Access Sidebar" : ""}
        >
          <button onClick={() => handleNavigatePage('home')} className={`p-2.5 rounded-xl transition ${activePage === 'home' ? 'bg-sky-50 text-sky-600 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`} title="Storefront Home"><Home size={18} /></button>
          <button onClick={() => handleNavigatePage('shop')} className={`p-2.5 rounded-xl transition ${activePage === 'shop' ? 'bg-sky-50 text-sky-600 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`} title="Clinical Catalog"><Building2 size={18} /></button>
          <button onClick={() => { if (activePage !== 'home') handleNavigatePage('home'); setTimeout(() => document.getElementById('brands')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition" title="Top Medical Brands"><Award size={18} /></button>
          <button onClick={() => { if (activePage !== 'home') handleNavigatePage('home'); setTimeout(() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition" title="Lightning Deals"><Zap size={18} /></button>
          <button onClick={() => handleNavigatePage('equipment')} className={`p-2.5 rounded-xl transition ${activePage === 'equipment' ? 'bg-sky-50 text-sky-600 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`} title="Medical Machinery"><Cpu size={18} /></button>
          <button onClick={() => handleNavigatePage('rfq')} className={`p-2.5 rounded-xl transition ${activePage === 'rfq' ? 'bg-sky-50 text-sky-600 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`} title="Bulk RFQ & Tender"><FileText size={18} /></button>
          <button onClick={() => handleNavigatePage('contact')} className={`p-2.5 rounded-xl transition ${activePage === 'contact' ? 'bg-sky-50 text-sky-600 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`} title="Helpdesk"><Phone size={18} /></button>
        </aside>
      )}

      {/* =========================================================================
          PAGE 1: STOREFRONT HOMEPAGE (DYNAMIC MODULAR BLOCKS RENDERED IN ARRAY ORDER)
          ========================================================================= */}
      {activePage === 'home' && (
        <main className="space-y-4">
          {(site.layoutBlocks && Array.isArray(site.layoutBlocks) ? site.layoutBlocks : []).map((block) => {
            // Header, announcement, quickNav and footer are handled separately in layout
            if (['announcement', 'header', 'quickNav', 'footer'].includes(block.type)) return null;
            return renderDynamicBlock(block);
          })}
        </main>
      )}

      {/* =========================================================================
          PAGE 2: DEDICATED SHOP & CLINICAL CATALOG PAGE (/shop)
          ========================================================================= */}
      {activePage === 'shop' && (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => handleNavigatePage('home')} className="hover:text-slate-800">Home</button>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-800">Shop / Clinical Catalog</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6 sticky top-28">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Clinical Departments</span>
                  <Filter size={14} className="text-slate-400" />
                </h4>
                <div className="space-y-1.5 text-xs">
                  {['all', 'icu-critical-care', 'surgical-ot', 'radiology-imaging', 'cardiology-hub', 'hospital-furniture', 'diagnostic-lab'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                        selectedCategory === cat ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{cat.replace('-', ' ')}</span>
                      {selectedCategory === cat && <Check size={13} className="text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Compliance Badges</span>
                <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" defaultChecked className="rounded text-sky-600" /> CDSCO Class A/B/C/D</label>
                <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" defaultChecked className="rounded text-sky-600" /> ISO 13485:2016 Certified</label>
                <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" defaultChecked className="rounded text-sky-600" /> GeM Direct Contract Ready</label>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
                <span className="font-bold text-slate-700">Showing {siteFilteredProducts.length} certified medical products</span>
                <span className="text-slate-500 font-mono">PAN-India Delivery Ready</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {siteFilteredProducts.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
                    <div className="p-4 space-y-3">
                      <div className="h-40 rounded-xl bg-slate-50 overflow-hidden relative">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-slate-800 shadow-2xs">{prod.badge || 'OEM'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{prod.brand}</span>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">{prod.name}</h4>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <div className="font-mono font-bold text-sm text-slate-900">₹{prod.price.toLocaleString('en-IN')}</div>
                      <button onClick={() => openRfqModal(prod)} className="px-3 py-1.5 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: primary }}>
                        Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 3: MEDICAL EQUIPMENT & MACHINERY (/equipment)
          ========================================================================= */}
      {activePage === 'equipment' && (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 md:p-12 rounded-3xl space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 inline-block">Capital Equipment & Imaging</span>
            <h2 className="text-3xl md:text-4xl font-extrabold">Medical Machinery & Refurbished Systems</h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Comprehensive turnkey equipment procurement including 16/64 Slice CT Scanners, 1.5T Superconducting MRI Systems, High-Frequency C-Arm units, and ICU Ventilators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEFAULT_REFURBISHED.map((ref) => (
              <div key={ref.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{ref.tag}</span>
                  <h3 className="text-base font-bold text-slate-900">{ref.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-mono">{ref.specs}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-slate-900">₹{(ref.price / 100000).toFixed(2)} Lakhs</span>
                  <button onClick={() => openRfqModal(ref)} className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-2xs" style={{ backgroundColor: primary }}>
                    Technical BOQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 4: B2B BULK ORDER & RFQ PORTAL (/rfq)
          ========================================================================= */}
      {activePage === 'rfq' && (
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Official Hospital Procurement Requisition</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Institutional B2B RFQ & Tender Desk</h2>
              <p className="text-xs text-slate-500 mt-1">Submit your BOQ or medical device requirements for direct factory-gate pricing with CDSCO compliance.</p>
            </div>

            <form onSubmit={handleRfqSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor / Procurement Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. R. K. Sharma"
                    value={rfqDoctorName}
                    onChange={(e) => setRfqDoctorName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hospital / Medical College Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospital"
                    value={rfqHospital}
                    onChange={(e) => setRfqHospital(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={rfqPhone}
                    onChange={(e) => setRfqPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@hospital.org"
                    value={rfqEmail}
                    onChange={(e) => setRfqEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={rfqCity}
                    onChange={(e) => setRfqCity(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Equipment / Consumables BOQ Description</label>
                <textarea
                  rows={4}
                  placeholder="Specify model numbers, bed capacity (e.g. 50-Bed ICU Wing Setup), or upload BOQ requirements..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={rfqSubmitting}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition"
                style={{ backgroundColor: primary }}
              >
                {rfqSubmitting ? 'Calculating Institutional BOQ...' : 'Generate Official Stamped Quotation'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 5: ABOUT US & COMPLIANCE (/about)
          ========================================================================= */}
      {activePage === 'about' && (
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Enterprise Biomedical Network</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{site.brandName} — Engineering Life Systems</h2>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Operating pan-India under CDSCO Medical Device Rules and ISO 13485:2016 international standards. We supply direct factory batches of critical care ventilation, telemetry monitors, and turnkey surgical operation suites to leading government and private medical institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono block">2,840+</span>
                <strong className="text-xs text-slate-800 block">Hospitals Commissioned</strong>
                <p className="text-[11px] text-slate-500">Tertiary clinics, trauma centres, and multi-speciality ICUs.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono block">4 Hours</span>
                <strong className="text-xs text-slate-800 block">Emergency Breakdown SLA</strong>
                <p className="text-[11px] text-slate-500">Biomedical field engineers stationed in key tier-1 hubs.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono block">100%</span>
                <strong className="text-xs text-slate-800 block">GeM & NABH Compliant</strong>
                <p className="text-[11px] text-slate-500">Direct government procurement contracts with full audit trails.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          PAGE 6: CONTACT & REGIONAL HELPDESKS (/contact)
          ========================================================================= */}
      {activePage === 'contact' && (
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Pan-India Support & Warehouse Depots</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Biomedical Engineering Helpdesk</h2>
              <p className="text-xs text-slate-500 mt-1">24/7 hotline support and emergency spare parts dispatch across India.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <strong className="text-xs text-slate-800 block">📞 Emergency 24/7 Hotline</strong>
                <span className="text-sm font-mono font-bold text-slate-900 block">{site.phone}</span>
                <p className="text-[11px] text-slate-500">Immediate telephone assistance by qualified biomedical engineers.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <strong className="text-xs text-slate-800 block">✉️ Institutional Quotations</strong>
                <span className="text-sm font-mono font-bold text-slate-900 block">{site.email}</span>
                <p className="text-[11px] text-slate-500">Formal stamped quotations delivered within 30 minutes.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <strong className="text-xs text-slate-800 block">📍 Central Distribution Hub</strong>
                <span className="text-sm font-bold text-slate-900 block">{site.city}</span>
                <p className="text-[11px] text-slate-500">Bonded medical warehouse with temperature-controlled storage.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* COMPREHENSIVE B2B FOOTER */}
      {isBlockEnabled('footer') && (
        <footer 
          id="contact" 
          onClick={() => notifySelectBlock('footer')}
          className={`bg-slate-900 text-slate-300 pt-12 pb-8 px-6 border-t border-slate-800 mt-12 ${
            isSandboxMode ? 'cursor-pointer hover:ring-2 hover:ring-sky-500 hover:ring-offset-2 transition-all relative group' : ''
          }`}
          title={isSandboxMode ? "Click to edit Footer" : ""}
        >
          {isSandboxMode && (
            <div className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none z-30">
              ✏️ Click to Edit Footer
            </div>
          )}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                {(headerBlock?.data?.logoUrl || site.logo) ? (
                  <img
                    src={headerBlock?.data?.logoUrl || site.logo}
                    alt={site.brandName}
                    className="h-8 max-w-[150px] object-contain rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    {site.brandName.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-white text-base">{site.brandName}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {site.tagline}. High-acuity biomedical hardware, telemetry monitors, and turnkey clinical installations.
              </p>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Navigation</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <button onClick={() => handleNavigatePage('home')} className="block hover:text-white transition">🏠 Storefront Home</button>
                <button onClick={() => handleNavigatePage('shop')} className="block hover:text-white transition">🛍️ Clinical Catalog & Shop</button>
                <button onClick={() => handleNavigatePage('equipment')} className="block hover:text-white transition">🏥 Medical Machinery & CT/MRI</button>
                <button onClick={() => handleNavigatePage('rfq')} className="block hover:text-white transition">📋 Bulk Order RFQ Portal</button>
                <button onClick={() => handleNavigatePage('about')} className="block hover:text-white transition">ℹ️ About Us & Certifications</button>
                <button onClick={() => handleNavigatePage('contact')} className="block hover:text-white transition">📞 24/7 Service Helplines</button>
              </div>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Compliance & Quality</h4>
              <div className="space-y-1.5 text-xs text-slate-400">
                <p>• ISO 13485:2016 Certified Hub</p>
                <p>• US-FDA & CE Certified Equipment</p>
                <p>• Centralized Hospital RFQ Pipeline</p>
                <p>• GeM Direct Procurement Ready</p>
                <p>• CDSCO Medical Device Rules 2017</p>
              </div>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Official Helpdesk</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone size={13} style={{ color: primary }} />
                  <span className="font-mono text-white font-semibold">{site.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} style={{ color: primary }} />
                  <span className="text-white">{site.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} style={{ color: primary }} />
                  <span>{site.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© {new Date().getFullYear()} {site.brandName} • All rights reserved.</p>
            <p className="font-mono text-[11px]">Domain: {site.domain} | Powered by Biomedical Multi-Site Engine</p>
          </div>
        </footer>
      )}

      {/* INTERACTIVE RFQ QUOTATION MODAL */}
      {rfqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Official Hospital Quotation</h3>
                <p className="text-xs text-slate-400">
                  Inquiring via <strong className="text-slate-700">{site.domain}</strong> ({site.brandName})
                </p>
              </div>
              <button
                onClick={() => setRfqModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {rfqSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Quotation Request Registered!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our biomedical engineering desk has logged your inquiry directly into <strong>MongoDB Atlas</strong>. A stamped institutional BOQ has been queued.
                </p>
                <button
                  onClick={() => setRfqModalOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleRfqSubmit} className="space-y-3 text-xs">
                {rfqProduct && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img src={rfqProduct.image} alt={rfqProduct.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div>
                      <span className="font-bold text-slate-900 block">{rfqProduct.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">GeM Rate: ₹{rfqProduct.price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor / Procurement Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar, MS"
                    value={rfqDoctorName}
                    onChange={(e) => setRfqDoctorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      required
                      placeholder="Apollo Specialty"
                      value={rfqHospital}
                      onChange={(e) => setRfqHospital(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={rfqCity}
                      onChange={(e) => setRfqCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98000 00000"
                      value={rfqPhone}
                      onChange={(e) => setRfqPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@hospital.org"
                      value={rfqEmail}
                      onChange={(e) => setRfqEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={rfqSubmitting}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition"
                    style={{ backgroundColor: primary }}
                  >
                    {rfqSubmitting ? 'Submitting to Lead Pipeline...' : 'Generate Official Stamped Quotation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
