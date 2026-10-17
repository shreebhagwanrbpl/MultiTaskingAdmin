'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Globe, 
  Inbox, 
  Package, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  PhoneCall, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Database, 
  Server, 
  ShieldCheck, 
  Eye, 
  ArrowRight,
  X,
  Layers,
  Sparkles,
  Palette,
  FileText
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

// ============================================================================
// PRESET CONFIGURATIONS (Users can choose presets OR freely type custom values)
// ============================================================================
const PRESET_FONTS = [
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern Medical)' },
  { value: 'Outfit', label: 'Outfit (High-Tech Geometric)' },
  { value: 'Manrope', label: 'Manrope (Swiss Precision)' },
  { value: 'Inter', label: 'Inter (Clean Neutral)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Biomedical Tech)' },
  { value: 'Poppins', label: 'Poppins (Friendly & Clean)' },
  { value: 'Roboto', label: 'Roboto (Standard Clinical)' },
  { value: 'Montserrat', label: 'Montserrat (Corporate Authority)' }
];

const PRESET_HOMEPAGE_LAYOUTS = [
  { value: 'Banner Carousel', label: 'Style 1: Banner Carousel (E-Commerce)' },
  { value: 'Split Sidebar B2B', label: 'Style 2: Split Sidebar B2B Catalog' },
  { value: 'Turnkey Solution Suites', label: 'Style 3: Turnkey Clinical Suites First' },
  { value: 'Catalog First', label: 'Style 4: Catalog First (Dense Grid)' },
  { value: 'Minimalist Hero', label: 'Style 5: Minimalist Hero Banner' }
];

const PRESET_CARD_STYLES = [
  { value: 'Bordered Minimal', label: 'Style 1: Bordered Minimal with Specs' },
  { value: 'Floating Shadow', label: 'Style 2: Floating Shadow with Full RFQ' },
  { value: 'B2B Row Table', label: 'Style 3: B2B Row Table (IndiaMART style)' },
  { value: 'Glassmorphic Modern', label: 'Style 4: Glassmorphic Modern Card' }
];

const PRESET_HEADER_STYLES = [
  { value: 'Telemetry Bar', label: 'Style 1: Top Telemetry Bar + Brand' },
  { value: 'Minimalist Single Row', label: 'Style 2: Minimalist Single Row' },
  { value: 'Centered Search', label: 'Style 3: Prominent Centered Search' },
  { value: 'Sticky Floating Pill', label: 'Style 4: Sticky Floating Pill Navbar' }
];

const PRESET_CATEGORIES = [
  { value: 'All Clinical Departments', label: 'All Clinical Departments (Complete Catalog)' },
  { value: 'ICU & Critical Care', label: 'ICU & Critical Care Focus' },
  { value: 'Surgical & OT Equipment', label: 'Surgical & OT Equipment Focus' },
  { value: 'Radiology & Imaging', label: 'Radiology & Diagnostic Imaging Focus' },
  { value: 'Diagnostic & Pathology Lab', label: 'Diagnostic & Pathology Lab Focus' },
  { value: 'Hospital Infrastructure', label: 'Hospital Infrastructure Focus' },
  { value: 'Cardiology & Resuscitation', label: 'Cardiology & Resuscitation' },
  { value: 'Dialysis & Nephrology', label: 'Dialysis & Nephrology Units' },
  { value: 'Ophthalmic Surgery', label: 'Ophthalmic & Eye Surgery' },
  { value: 'Dental & Maxillofacial', label: 'Dental & Maxillofacial Chairs' }
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('sites'); // 'overview', 'sites', 'leads', 'products', 'vps'
  const [siteSearch, setSiteSearch] = useState('');
  const [leadFilterDomain, setLeadFilterDomain] = useState('all');
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);

  // 70 Websites Initial Registry State (Multi-tenant)
  const [sites, setSites] = useState([
    {
      id: 'site-01',
      domain: 'rajbiosis.com',
      brandName: 'Raj Biosis',
      tagline: 'Biomedical Life Systems',
      primaryColor: '#dc2626', // Crimson Red
      font: 'Plus Jakarta Sans',
      headerStyle: 'Telemetry Bar',
      homepageLayout: 'Banner Carousel',
      cardStyle: 'Bordered Minimal',
      categoryFocus: 'All Clinical Units',
      phone: '1800-419-BIOSIS',
      email: 'institutional@rajbiosis.com',
      city: 'Bengaluru, Karnataka',
      status: 'Live',
      leadsCount: 42
    },
    {
      id: 'site-02',
      domain: 'pulmocare.in',
      brandName: 'PulmoCare Systems',
      tagline: 'Advanced Respiratory & Critical ICU',
      primaryColor: '#0284c7', // Cyan Blue
      font: 'Outfit',
      headerStyle: 'Minimalist Single Row',
      homepageLayout: 'Split Sidebar B2B',
      cardStyle: 'Floating Shadow',
      categoryFocus: 'ICU & Critical Care',
      phone: '1800-200-PULMO',
      email: 'sales@pulmocare.in',
      city: 'Mumbai, Maharashtra',
      status: 'Live',
      leadsCount: 28
    },
    {
      id: 'site-03',
      domain: 'surgitech.in',
      brandName: 'SurgiTech OT Solutions',
      tagline: '4K Laparoscopy & Modular Operating Theatre',
      primaryColor: '#d97706', // Amber Gold
      font: 'Manrope',
      headerStyle: 'Centered Search',
      homepageLayout: 'Turnkey Solution Suites',
      cardStyle: 'B2B Row Table',
      categoryFocus: 'Surgical & OT Equipment',
      phone: '1800-500-SURGI',
      email: 'ot-quotes@surgitech.in',
      city: 'New Delhi, NCR',
      status: 'Live',
      leadsCount: 35
    },
    {
      id: 'site-04',
      domain: 'radioscan.in',
      brandName: 'RadioScan Healthcare',
      tagline: 'Digital X-Ray & 4D Ultrasound Diagnostics',
      primaryColor: '#059669', // Emerald Green
      font: 'Inter',
      headerStyle: 'Telemetry Bar',
      homepageLayout: 'Catalog First',
      cardStyle: 'Bordered Minimal',
      categoryFocus: 'Radiology & Imaging',
      phone: '1800-400-SCAN',
      email: 'procurement@radioscan.in',
      city: 'Hyderabad, Telangana',
      status: 'Live',
      leadsCount: 19
    },
    {
      id: 'site-05',
      domain: 'critilife.com',
      brandName: 'CritiLife Resuscitation',
      tagline: 'Emergency Defibrillators & Crash Systems',
      primaryColor: '#7c3aed', // Purple Violet
      font: 'Space Grotesk',
      headerStyle: 'Minimalist Single Row',
      homepageLayout: 'Banner Carousel',
      cardStyle: 'Floating Shadow',
      categoryFocus: 'ICU & Critical Care',
      phone: '1800-911-CRITI',
      email: 'emergency@critilife.com',
      city: 'Chennai, Tamil Nadu',
      status: 'Live',
      leadsCount: 24
    },
    {
      id: 'site-06',
      domain: 'pathochem.in',
      brandName: 'PathoChem Clinical Labs',
      tagline: 'Automated Hematology & Biochemistry',
      primaryColor: '#2563eb', // Royal Blue
      font: 'Outfit',
      headerStyle: 'Centered Search',
      homepageLayout: 'Split Sidebar B2B',
      cardStyle: 'B2B Row Table',
      categoryFocus: 'Diagnostic & Lab',
      phone: '1800-333-LABS',
      email: 'info@pathochem.in',
      city: 'Ahmedabad, Gujarat',
      status: 'Live',
      leadsCount: 16
    },
    {
      id: 'site-07',
      domain: 'hospinfraworld.com',
      brandName: 'HospInfra World',
      tagline: 'ICU Motorized Beds & Cleanroom Autoclaves',
      primaryColor: '#0f766e', // Teal
      font: 'Manrope',
      headerStyle: 'Telemetry Bar',
      homepageLayout: 'Catalog First',
      cardStyle: 'Bordered Minimal',
      categoryFocus: 'Hospital Infrastructure',
      phone: '1800-700-INFRA',
      email: 'sales@hospinfraworld.com',
      city: 'Pune, Maharashtra',
      status: 'Live',
      leadsCount: 20
    }
  ]);

  // Centralized Inquiries / Leads (cross-domain)
  const [leads, setLeads] = useState([
    {
      id: 'RB-RFQ-982144',
      siteDomain: 'rajbiosis.com',
      hospital: 'Apollo Super Speciality Hospital',
      contact: 'Dr. S. K. Mehta (Chief of ICU)',
      phone: '+91 98210 55443',
      equipment: 'RajBiosis-Vent Pro-X9 Ventilator (x2)',
      amount: '₹9,70,000',
      date: 'Today, 10:45 AM',
      status: 'New Lead'
    },
    {
      id: 'RB-RFQ-982138',
      siteDomain: 'pulmocare.in',
      hospital: 'Fortis Escorts Heart Institute',
      contact: 'Er. Rajesh K. Varma (Biomedical Lead)',
      phone: '+91 98112 44321',
      equipment: 'CardioPulse Multi-Para Monitor 12.1" (x4)',
      amount: '₹2,74,000',
      date: 'Today, 09:15 AM',
      status: 'Quotation Sent'
    },
    {
      id: 'RB-RFQ-982120',
      siteDomain: 'surgitech.in',
      hospital: 'Tata Memorial Hospital, Mumbai',
      contact: 'Dr. Anita Sen (Head of Surgery)',
      phone: '+91 98450 77881',
      equipment: 'RajBiosis AuraSurg 4K UHD Tower (x1)',
      amount: '₹14,50,000',
      date: 'Yesterday, 04:30 PM',
      status: 'Contacted'
    },
    {
      id: 'RB-RFQ-982098',
      siteDomain: 'radioscan.in',
      hospital: 'Care Diagnostic Centre, Hyderabad',
      contact: 'Dr. K. Srinivas (Radiologist)',
      phone: '+91 99881 22334',
      equipment: 'RayMaster 500mA Fixed Digital X-Ray (x1)',
      amount: '₹18,50,000',
      date: 'Yesterday, 02:10 PM',
      status: 'Quotation Sent'
    },
    {
      id: 'RB-RFQ-982055',
      siteDomain: 'critilife.com',
      hospital: 'Max Super Speciality Hospital, Saket',
      contact: 'Dr. Rajiv Anand (Emergency Dir)',
      phone: '+91 98101 99002',
      equipment: 'DefiQuick Biphasic Defibrillator (x3)',
      amount: '₹5,85,000',
      date: '15 Oct 2026',
      status: 'Closed Won'
    }
  ]);

  // Selected / Editing Site ID (null = creating new site)
  const [editingSiteId, setEditingSiteId] = useState(null);

  // Form State for creating / editing site
  const [newDomain, setNewDomain] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newColor, setNewColor] = useState('#dc2626');
  const [newFont, setNewFont] = useState('Plus Jakarta Sans');
  const [newHeaderStyle, setNewHeaderStyle] = useState('Telemetry Bar');
  const [newHomepageLayout, setNewHomepageLayout] = useState('Banner Carousel');
  const [newCardStyle, setNewCardStyle] = useState('Bordered Minimal');
  const [newPhone, setNewPhone] = useState('1800-419-BIOSIS');
  const [newEmail, setNewEmail] = useState('sales@biomedical.in');
  const [newCity, setNewCity] = useState('New Delhi, India');
  const [newCategoryFocus, setNewCategoryFocus] = useState('All Clinical Departments');

  // Custom Input Toggles (allow user to freely type anything or pick preset)
  const [customFontMode, setCustomFontMode] = useState(false);
  const [customLayoutMode, setCustomLayoutMode] = useState(false);
  const [customCardMode, setCustomCardMode] = useState(false);
  const [customHeaderMode, setCustomHeaderMode] = useState(false);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);

  const resetForm = () => {
    setEditingSiteId(null);
    setNewDomain('');
    setNewBrandName('');
    setNewTagline('');
    setNewColor('#dc2626');
    setNewFont('Plus Jakarta Sans');
    setNewHeaderStyle('Telemetry Bar');
    setNewHomepageLayout('Banner Carousel');
    setNewCardStyle('Bordered Minimal');
    setNewPhone('1800-419-BIOSIS');
    setNewEmail('sales@biomedical.in');
    setNewCity('New Delhi, India');
    setNewCategoryFocus('All Clinical Departments');
    setCustomFontMode(false);
    setCustomLayoutMode(false);
    setCustomCardMode(false);
    setCustomHeaderMode(false);
    setCustomCategoryMode(false);
  };

  const openCreateSite = () => {
    resetForm();
    setIsAddSiteOpen(true);
  };

  const openEditSite = (site) => {
    setEditingSiteId(site.id);
    setNewDomain(site.domain);
    setNewBrandName(site.brandName);
    setNewTagline(site.tagline || '');
    setNewColor(site.primaryColor || '#dc2626');
    setNewFont(site.font || 'Plus Jakarta Sans');
    setNewHeaderStyle(site.headerStyle || 'Telemetry Bar');
    setNewHomepageLayout(site.homepageLayout || 'Banner Carousel');
    setNewCardStyle(site.cardStyle || 'Bordered Minimal');
    setNewCategoryFocus(site.categoryFocus || 'All Clinical Departments');
    setNewPhone(site.phone || '1800-XXX-XXXX');
    setNewEmail(site.email || `sales@${site.domain}`);
    setNewCity(site.city || 'New Delhi, India');

    // Auto-detect if current values are custom or presets
    setCustomFontMode(!PRESET_FONTS.some(f => f.value === site.font));
    setCustomLayoutMode(!PRESET_HOMEPAGE_LAYOUTS.some(l => l.value === site.homepageLayout));
    setCustomCardMode(!PRESET_CARD_STYLES.some(c => c.value === site.cardStyle));
    setCustomHeaderMode(!PRESET_HEADER_STYLES.some(h => h.value === site.headerStyle));
    setCustomCategoryMode(!PRESET_CATEGORIES.some(c => c.value === site.categoryFocus));

    setIsAddSiteOpen(true);
  };

  const handleDeleteSite = (siteId, domain) => {
    if (confirm(`Are you sure you want to remove website '${domain}' from your network?`)) {
      setSites(prev => prev.filter(s => s.id !== siteId));
    }
  };

  const handleSaveSite = (e) => {
    e.preventDefault();
    if (!newDomain || !newBrandName) {
      alert("Please enter Domain Name and Brand Name!");
      return;
    }

    if (editingSiteId) {
      // Update existing site
      setSites(prev => prev.map(s => s.id === editingSiteId ? {
        ...s,
        domain: newDomain.toLowerCase().trim(),
        brandName: newBrandName.trim(),
        tagline: newTagline.trim() || 'Biomedical & Hospital Equipment Systems',
        primaryColor: newColor,
        font: newFont || 'Plus Jakarta Sans',
        headerStyle: newHeaderStyle || 'Telemetry Bar',
        homepageLayout: newHomepageLayout || 'Banner Carousel',
        cardStyle: newCardStyle || 'Bordered Minimal',
        categoryFocus: newCategoryFocus || 'All Clinical Departments',
        phone: newPhone || '1800-XXX-XXXX',
        email: newEmail || `sales@${newDomain.toLowerCase().trim()}`,
        city: newCity || 'New Delhi, India'
      } : s));
      alert(`Success! Configuration for '${newDomain}' updated in MongoDB.`);
    } else {
      // Create new site
      const newSiteObj = {
        id: `site-${String(sites.length + 1).padStart(2, '0')}`,
        domain: newDomain.toLowerCase().trim(),
        brandName: newBrandName.trim(),
        tagline: newTagline.trim() || 'Biomedical & Hospital Equipment Systems',
        primaryColor: newColor,
        font: newFont || 'Plus Jakarta Sans',
        headerStyle: newHeaderStyle || 'Telemetry Bar',
        homepageLayout: newHomepageLayout || 'Banner Carousel',
        cardStyle: newCardStyle || 'Bordered Minimal',
        categoryFocus: newCategoryFocus || 'All Clinical Departments',
        phone: newPhone || '1800-XXX-XXXX',
        email: newEmail || `sales@${newDomain.toLowerCase().trim()}`,
        city: newCity || 'New Delhi, India',
        status: 'Live',
        leadsCount: 0
      };
      setSites([newSiteObj, ...sites]);
      alert(`Success! Website '${newDomain}' configured and saved to MongoDB.`);
    }

    setIsAddSiteOpen(false);
    resetForm();
  };

  const filteredSites = sites.filter(s => 
    s.domain.toLowerCase().includes(siteSearch.toLowerCase()) || 
    s.brandName.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const filteredLeads = leadFilterDomain === 'all'
    ? leads
    : leads.filter(l => l.siteDomain === leadFilterDomain);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-sm shadow-red-600/20">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>Multi-Site Hub</span>
                <span className="text-[9px] bg-red-50 text-red-600 font-mono px-1.5 py-0.5 rounded border border-red-200">70X</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">VPS & MongoDB Master</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('sites')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'sites' 
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-600/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe size={16} />
                <span>70 Websites Manager</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                activeTab === 'sites' ? 'bg-red-700/50 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {sites.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'leads' 
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-600/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox size={16} />
                <span>Central Leads & RFQ</span>
              </span>
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'products' 
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-600/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package size={16} />
              <span>Global Catalog ({PRODUCTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('vps')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'vps' 
                  ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-600/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Server size={16} />
              <span>VPS & MongoDB Config</span>
            </button>
          </nav>
        </div>

        {/* Bottom User / Return */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200"
          >
            <span>View Public Storefront</span>
            <ExternalLink size={13} />
          </Link>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Node / Next.js 14</span>
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> MongoDB Active
            </span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900">
              {activeTab === 'sites' && '70 Websites Network Registry'}
              {activeTab === 'leads' && 'Central Hospital Inquiries & Quotation Desk'}
              {activeTab === 'products' && 'Global Biomedical Inventory & Distribution'}
              {activeTab === 'vps' && 'VPS Deployment & MongoDB Pipeline'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'sites' && (
              <button
                onClick={openCreateSite}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs shadow-red-600/20 cursor-pointer"
              >
                <Plus size={15} />
                <span>Launch New Website</span>
              </button>
            )}

            <div className="text-xs text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Host: <span className="text-slate-900 font-bold">rajbiosis.com</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="p-6 space-y-6">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Active Domains</span>
                <span className="text-2xl font-black text-slate-900">{sites.length} <span className="text-xs font-normal text-slate-400">/ 70 Cap</span></span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Hospital Leads</span>
                <span className="text-2xl font-black text-slate-900">184 <span className="text-xs font-bold text-emerald-600">+12 Today</span></span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Inbox size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Quotation Pipeline</span>
                <span className="text-2xl font-black text-slate-900">₹6.45 Cr</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Certified Hardware</span>
                <span className="text-2xl font-black text-slate-900">{PRODUCTS.length} Models</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Package size={20} />
              </div>
            </div>
          </div>

          {/* =========================================================================
              TAB 1: 70 WEBSITES MANAGER TABLE
              ========================================================================= */}
          {activeTab === 'sites' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Search & Actions Bar */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={siteSearch}
                    onChange={(e) => setSiteSearch(e.target.value)}
                    placeholder="Search by domain, brand or layout..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-red-500 transition"
                  />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="text-slate-900 font-bold">{filteredSites.length}</span> configured biomedical platforms
                </div>
              </div>

              {/* Websites Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/80">
                      <th className="py-3 px-4">Domain & Brand</th>
                      <th className="py-3 px-4">Color & Font Theme</th>
                      <th className="py-3 px-4">Homepage Layout Style</th>
                      <th className="py-3 px-4">Card Style</th>
                      <th className="py-3 px-4">Contact Desk</th>
                      <th className="py-3 px-4">Leads</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredSites.map((site) => (
                      <tr key={site.id} className="hover:bg-slate-50/70 transition">
                        {/* Domain & Brand */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{site.brandName}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">({site.domain})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block max-w-[180px]">
                            {site.tagline}
                          </span>
                        </td>

                        {/* Theme & Color Swatch */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-xs"
                              style={{ backgroundColor: site.primaryColor }}
                              title={site.primaryColor}
                            />
                            <div>
                              <span className="text-xs font-mono font-bold text-slate-800 block">{site.primaryColor}</span>
                              <span className="text-[10px] text-slate-500">{site.font}</span>
                            </div>
                          </div>
                        </td>

                        {/* Layout */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold">
                            {site.homepageLayout}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{site.headerStyle}</span>
                        </td>

                        {/* Card Style */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-700 font-mono">{site.cardStyle}</span>
                          <span className="text-[10px] text-slate-500 block">{site.categoryFocus}</span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-800 font-mono font-bold">{site.phone}</div>
                          <span className="text-[10px] text-slate-500 truncate block">{site.city}</span>
                        </td>

                        {/* Leads Generated */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs font-mono">
                            {site.leadsCount} RFQs
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditSite(site)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                              title="Edit Website Config (Dual Mode Custom)"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSite(site.id, site.domain)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                              title="Delete Website"
                            >
                              <Trash2 size={14} />
                            </button>
                            <Link
                              href="/"
                              target="_blank"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                              title="Preview Live Site"
                            >
                              <Eye size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: CENTRAL LEADS & RFQ INQUIRIES DESK
              ========================================================================= */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
              {/* Filter Bar */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600">Filter by Website:</label>
                  <select
                    value={leadFilterDomain}
                    onChange={(e) => setLeadFilterDomain(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:border-red-500"
                  >
                    <option value="all">All 70 Websites ({leads.length})</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.domain}>{s.brandName} ({s.domain})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => alert("Exporting all hospital leads to CSV / Excel...")}
                  className="text-xs py-1.5 px-3 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Download size={13} />
                  <span>Export to Excel / CSV</span>
                </button>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/80">
                      <th className="py-3 px-4">Ref & Date</th>
                      <th className="py-3 px-4">Source Website</th>
                      <th className="py-3 px-4">Hospital & Doctor</th>
                      <th className="py-3 px-4">Requested Hardware</th>
                      <th className="py-3 px-4">Quotation Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{lead.id}</span>
                          <span className="text-[10px] text-slate-500">{lead.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-bold">
                            {lead.siteDomain}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{lead.hospital}</div>
                          <span className="text-[11px] text-slate-600 block">{lead.contact}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{lead.phone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold">{lead.equipment}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-600 font-black text-sm font-mono">{lead.amount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            <PhoneCall size={12} />
                            <span>Call</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: GLOBAL CATALOG MANAGER
              ========================================================================= */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Central Medical Inventory Pool</h3>
                  <p className="text-xs text-slate-500">All 18 certified devices available for distribution across all 70 websites.</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-xs font-mono text-emerald-700 font-bold border border-emerald-200">
                  {PRODUCTS.length} Devices Synced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCTS.map(p => (
                  <div key={p.id} className="bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-14 h-14 object-contain rounded-xl bg-white p-1.5 border border-slate-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</div>
                      <div className="text-xs font-black text-red-600 mt-1">₹{(p.price).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: VPS & MONGODB PIPELINE GUIDE
              ========================================================================= */}
          {activeTab === 'vps' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">VPS Server & MongoDB Connection Status</h3>
                <p className="text-xs text-slate-500 mt-1">Production deployment environment for your 70 domain multi-tenant network.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <Database size={16} />
                    <span>MongoDB Database Configuration</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto shadow-inner border border-slate-800">
                    mongodb+srv://admin:pass@vps-cluster.mongodb.net/biomedical_network
                  </div>
                  <p className="text-[11px] text-slate-500">Stores all 70 site configurations, products inventory, and quotation inquiries.</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <Server size={16} />
                    <span>Nginx Wildcard Multi-Domain Reverse Proxy</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-sky-300 overflow-x-auto shadow-inner border border-slate-800">
                    server_name *.rajbiosis.com pulmocare.in surgitech.in; proxy_pass http://127.0.0.1:3000;
                  </div>
                  <p className="text-[11px] text-slate-500">Routes all 70 incoming domain requests to Next.js without needing code redeployment.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          CREATE NEW WEBSITE MODAL (Form for adding Site #2, #3 ... #70)
          ========================================================================= */}
      {isAddSiteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-sm shadow-red-600/20">
                  {editingSiteId ? <Edit3 size={17} /> : <Plus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingSiteId ? `Edit Website: ${newDomain || 'Site Config'}` : 'Launch New Biomedical Website'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingSiteId 
                      ? 'Update domain identity, custom fonts, layouts, and colors in MongoDB.'
                      : 'Configure domain, custom font, layout architecture, and colors in MongoDB.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAddSiteOpen(false); resetForm(); }} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Domain Name */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Domain Name *</label>
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. aerorespi.in / medsurge.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 font-mono transition"
                  />
                </div>

                {/* Brand Name */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="e.g. AeroRespi Medical Systems"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 transition"
                  />
                </div>

                {/* Tagline / Subtitle */}
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Brand Tagline / Mission</label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    placeholder="e.g. Precision ICU Ventilators & Critical Life Support Systems"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 transition"
                  />
                </div>

                {/* Primary Theme Color */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Primary Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-red-500 outline-none"
                      placeholder="#dc2626"
                    />
                  </div>
                </div>

                {/* 1. Typography Font Family (Dual Mode: Preset Dropdown OR Custom Type) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Typography Font Family</label>
                    <button
                      type="button"
                      onClick={() => setCustomFontMode(!customFontMode)}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {customFontMode ? '📋 Select Preset' : '✍️ Type Custom Font'}
                    </button>
                  </div>
                  {customFontMode ? (
                    <div>
                      <input
                        type="text"
                        value={newFont}
                        onChange={(e) => setNewFont(e.target.value)}
                        placeholder="Type any font: e.g. Poppins, Outfit, Google Sans..."
                        className="w-full px-3.5 py-2.5 bg-white border border-red-500 rounded-xl text-slate-900 outline-none focus:border-red-600 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Custom font mode active: Type any Google font or CSS font family.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={PRESET_FONTS.some(f => f.value === newFont) ? newFont : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomFontMode(true);
                        } else {
                          setNewFont(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500"
                    >
                      {PRESET_FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                      <option value="__custom__">✍️ + Type Custom Font Name...</option>
                    </select>
                  )}
                </div>

                {/* 2. Homepage Layout Style (Dual Mode: Preset Dropdown OR Custom Type) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Homepage Layout Style *</label>
                    <button
                      type="button"
                      onClick={() => setCustomLayoutMode(!customLayoutMode)}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {customLayoutMode ? '📋 Select Preset' : '✍️ Type Custom Layout'}
                    </button>
                  </div>
                  {customLayoutMode ? (
                    <div>
                      <input
                        type="text"
                        value={newHomepageLayout}
                        onChange={(e) => setNewHomepageLayout(e.target.value)}
                        placeholder="e.g. Minimalist Hero Banner, Split Showcase, 3D Grid..."
                        className="w-full px-3.5 py-2.5 bg-white border border-red-500 rounded-xl text-slate-900 outline-none focus:border-red-600 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Custom layout mode active: Type custom layout name or structure.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={PRESET_HOMEPAGE_LAYOUTS.some(l => l.value === newHomepageLayout) ? newHomepageLayout : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomLayoutMode(true);
                        } else {
                          setNewHomepageLayout(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500"
                    >
                      {PRESET_HOMEPAGE_LAYOUTS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                      <option value="__custom__">✍️ + Type Custom Layout Style...</option>
                    </select>
                  )}
                </div>

                {/* 3. Product Card Design (Dual Mode: Preset Dropdown OR Custom Type) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Product Card Design *</label>
                    <button
                      type="button"
                      onClick={() => setCustomCardMode(!customCardMode)}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {customCardMode ? '📋 Select Preset' : '✍️ Type Custom Design'}
                    </button>
                  </div>
                  {customCardMode ? (
                    <div>
                      <input
                        type="text"
                        value={newCardStyle}
                        onChange={(e) => setNewCardStyle(e.target.value)}
                        placeholder="e.g. Glassmorphic Modern, Compact Spec Row, High Contrast..."
                        className="w-full px-3.5 py-2.5 bg-white border border-red-500 rounded-xl text-slate-900 outline-none focus:border-red-600 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Custom card mode active: Type custom card style.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={PRESET_CARD_STYLES.some(c => c.value === newCardStyle) ? newCardStyle : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomCardMode(true);
                        } else {
                          setNewCardStyle(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500"
                    >
                      {PRESET_CARD_STYLES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      <option value="__custom__">✍️ + Type Custom Card Design...</option>
                    </select>
                  )}
                </div>

                {/* 4. Header Style (Dual Mode: Preset Dropdown OR Custom Type) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Header Style</label>
                    <button
                      type="button"
                      onClick={() => setCustomHeaderMode(!customHeaderMode)}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {customHeaderMode ? '📋 Select Preset' : '✍️ Type Custom Header'}
                    </button>
                  </div>
                  {customHeaderMode ? (
                    <div>
                      <input
                        type="text"
                        value={newHeaderStyle}
                        onChange={(e) => setNewHeaderStyle(e.target.value)}
                        placeholder="e.g. Sticky Floating Pill, Mega Navbar, Split Logo Bar..."
                        className="w-full px-3.5 py-2.5 bg-white border border-red-500 rounded-xl text-slate-900 outline-none focus:border-red-600 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Custom header mode active: Type custom navbar style.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={PRESET_HEADER_STYLES.some(h => h.value === newHeaderStyle) ? newHeaderStyle : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomHeaderMode(true);
                        } else {
                          setNewHeaderStyle(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500"
                    >
                      {PRESET_HEADER_STYLES.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                      <option value="__custom__">✍️ + Type Custom Header Style...</option>
                    </select>
                  )}
                </div>

                {/* 5. Primary Category Focus (Dual Mode: Preset Dropdown OR Custom Type) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Primary Category Focus</label>
                    <button
                      type="button"
                      onClick={() => setCustomCategoryMode(!customCategoryMode)}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 transition flex items-center gap-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded-md border border-red-200"
                    >
                      {customCategoryMode ? '📋 Select Preset' : '✍️ Type Custom Category'}
                    </button>
                  </div>
                  {customCategoryMode ? (
                    <div>
                      <input
                        type="text"
                        value={newCategoryFocus}
                        onChange={(e) => setNewCategoryFocus(e.target.value)}
                        placeholder="e.g. Dialysis & Nephrology Units, Dental Lasers, Pediatric ICU..."
                        className="w-full px-3.5 py-2.5 bg-white border border-red-500 rounded-xl text-slate-900 outline-none focus:border-red-600 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        💡 Custom category mode active: Type any medical speciality or department.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={PRESET_CATEGORIES.some(c => c.value === newCategoryFocus) ? newCategoryFocus : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomCategoryMode(true);
                        } else {
                          setNewCategoryFocus(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500"
                    >
                      {PRESET_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      <option value="__custom__">✍️ + Type Custom Category / Speciality...</option>
                    </select>
                  )}
                </div>

                {/* Toll-Free Phone */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Toll-Free Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="1800-419-BIOSIS"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 font-mono transition"
                  />
                </div>

                {/* Official Support Email */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="procurement@hospital.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 font-mono transition"
                  />
                </div>

                {/* Warehouse / City */}
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Warehouse / City Hub</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Mumbai / New Delhi / Bangalore / Hyderabad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-red-500 transition"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddSiteOpen(false); resetForm(); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {editingSiteId ? <Edit3 size={15} /> : <Plus size={15} />}
                  <span>{editingSiteId ? 'Save Changes to MongoDB' : 'Save & Launch to MongoDB'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
