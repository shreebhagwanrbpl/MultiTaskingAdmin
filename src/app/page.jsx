'use client';

import React, { useState, useEffect } from 'react';
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
  FileText,
  Send,
  Users,
  Building2,
  Target,
  Clock,
  CheckCheck,
  Paperclip,
  Smartphone,
  Tablet,
  Laptop,
  Check,
  History,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Key,
  Copy,
  Zap,
  Dices
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCatalogManager from './components/ProductCatalogManager';
import WebsiteHomepageManager from './components/WebsiteHomepageManager';
import WebQuotationManager from './components/WebQuotationManager';

// ============================================================================
// 3 SENDER BIOMEDICAL COMPANIES (Raj Biosis, Human Biomedicals, Global Biomedical)
// ============================================================================
const SENDER_COMPANIES = [
  {
    id: 'rajbiosis',
    name: 'Raj Biosis Private Limited',
    shortName: 'Raj Biosis',
    tagline: 'Biomedical & Hospital Equipment Manufacturer',
    email: 'institutional@rajbiosis.com',
    phone: '1800-419-BIOSIS',
    specialty: 'ICU Critical Care & Advanced Modular OT Systems',
    logo: '/rajbiosis-logo.png',
    address: 'Plot No. 42, Electronic City Phase 1, Bengaluru, Karnataka - 560100',
    isoCert: 'ISO 13485:2016 & CDSCO Certified Medical Device Manufacturer',
    accentColor: '#0ea5e9',
    badge: 'Flagship OEM Division'
  },
  {
    id: 'human_bio',
    name: 'Human Biomedicals',
    shortName: 'Human Biomedicals',
    tagline: 'Patient Monitoring & Life Support Technologies',
    email: 'sales@humanbiomedicals.in',
    phone: '1800-200-HUMAN',
    specialty: 'Multi-Para Monitors, Dialysis & Emergency Defibrillators',
    logo: null,
    address: 'Tower B, Biomedical Innovation Hub, Andheri East, Mumbai, Maharashtra - 400069',
    isoCert: 'ISO 9001:2015 & CE European Standard Medical Systems',
    accentColor: '#10b981',
    badge: 'Patient Monitoring'
  },
  {
    id: 'global_bio',
    name: 'Global Biomedical',
    shortName: 'Global Biomedical',
    tagline: 'Precision Radiology & Diagnostic Imaging',
    email: 'corporate@globalbiomedical.com',
    phone: '1800-888-GLOBAL',
    specialty: 'High-Frequency Digital X-Ray, 4D Ultrasound & C-Arm',
    logo: null,
    address: 'DLF Cyber City, Sector 24, Gurugram, National Capital Region - 122002',
    isoCert: 'AERB Approved & US-FDA Compliance Diagnostic Division',
    accentColor: '#6366f1',
    badge: 'Imaging & Diagnostics'
  }
];

// Pre-built Hospital Email Templates
const EMAIL_TEMPLATES = [
  {
    id: 'followup',
    name: '⚡ Hot RFQ Quote Follow-Up',
    description: 'Nudge doctors and procurement heads who recently requested equipment pricing',
    subject: 'Official Quotation Follow-up & Priority Hospital Allocation - {Company_Name}',
    preheader: 'Special institutional rate and immediate dispatch slot reserved for {Hospital_Name}.',
    body: `Respected {Doctor_Name},
Procurement Committee, {Hospital_Name},

We hope this email finds you well.

This is a gentle follow-up regarding your recent institutional equipment inquiry for {Equipment_Name} with an estimated budget allocation of {Quotation_Amount}.

Our biomedical engineering team is ready to provide:
1. Turnkey onsite equipment installation & hands-on staff training.
2. Full 2-Year Comprehensive OEM Warranty + 5-Year CMC Support.
3. Priority batch dispatch directly from our central warehouse hub.

Would your biomedical team prefer a 15-minute live technical demonstration or an updated institutional price breakdown?`,
    ctaText: 'Review Official OEM Quotation (PDF)',
    ctaUrl: 'https://rajbiosis.com/rfq/view'
  },
  {
    id: 'new_launch',
    name: '🚀 New Specialized Website & Portal Launch',
    description: 'Announce newly launched specialist portals from our 70-site network to hospitals',
    subject: 'Announcing Direct OEM Procurement Portals: {Company_Name} Digital Expansion',
    preheader: 'Access dedicated ICU, Surgical, and Diagnostic portals with zero middleman costs.',
    body: `Dear Healthcare Partner / Biomedical Procurement Head,

We are thrilled to announce the rollout of our specialized digital procurement network across 70 dedicated biomedical websites.

Each specialized portal offers your hospital:
• Direct GeM-Compliant Institutional Pricing schedules.
• High-resolution technical spec-sheets, user manuals, and calibration certificates.
• Instant 1-click quotation generation for hospital board approval.

Visit our newly launched portals today to register your hospital for prioritized OEM dispatch.`,
    ctaText: 'Explore New Equipment Network Portals',
    ctaUrl: 'https://rajbiosis.com/portals'
  },
  {
    id: 'amc_service',
    name: '🔧 AMC & Preventative Maintenance Check',
    description: 'Remind hospital engineering teams to renew service contracts & calibration',
    subject: 'Annual Maintenance (AMC) & Biomedical Calibration Notice - {Hospital_Name}',
    preheader: 'Ensure regulatory NABH compliance and 100% equipment uptime with certified engineers.',
    body: `Attention: Chief Biomedical Engineer & Administration, {Hospital_Name},

Patient safety and clinical regulatory standards mandate routine biomedical calibration of all critical life-support systems.

Our factory-certified service engineers are currently conducting regional maintenance audits for:
• ICU Mechanical Ventilators & Anesthesia Workstations
• Multi-Parameter Monitors & Defibrillator Discharge Calibration
• Digital X-Ray Calibration & Radiation Leakage Safety Inspection

Click below to request an on-demand engineer site visit or renew your comprehensive maintenance contract.`,
    ctaText: 'Schedule Biomedical Calibration Visit',
    ctaUrl: 'https://rajbiosis.com/amc-service'
  },
  {
    id: 'bulk_subsidy',
    name: '🏥 Institutional Bulk Procurement Subsidy',
    description: 'Offer direct manufacturer subsidies for hospital department setups & expansions',
    subject: 'Institutional Subsidy Scheme: Up to 18% Concession on Hospital Setup Upgrades',
    preheader: 'Direct manufacturer price advantage for NABH-accredited hospitals and nursing homes.',
    body: `Dear Medical Director / Hospital Purchase Committee,

To assist new hospital wing expansions across India, our biomedical manufacturing group is pleased to introduce our Institutional Subsidy Program.

Program Privileges for Registered Hospitals:
• Flexible zero-interest installment options for hospital ICU and OT suites.
• Free central telemetry console with every order of 4+ patient monitors.
• Immediate stock allocation for Critical Care Ventilators and 4K Laparoscopy Towers.

Review our certified equipment catalog or contact our institutional desk directly at {Support_Phone}.`,
    ctaText: 'Download Complete Institutional Catalog',
    ctaUrl: 'https://rajbiosis.com/catalog'
  },
  {
    id: 'blank',
    name: '✍️ Custom Blank Campaign',
    description: 'Start with a clean slate to craft any specialized communication or notice',
    subject: '',
    preheader: '',
    body: '',
    ctaText: 'Learn More',
    ctaUrl: 'https://rajbiosis.com'
  }
];

// Target Customers Database for Email Marketing
const MARKETING_CUSTOMERS = [
  { id: 'cust-1', name: 'Dr. S. K. Mehta', role: 'Chief of ICU', hospital: 'Apollo Super Speciality Hospital', email: 'dr.mehta@apollohospitals.com', phone: '+91 98210 55443', equipment: 'ICU Ventilator Pro-X9', quoteAmount: '₹9,70,000', status: 'Pending RFQ' },
  { id: 'cust-2', name: 'Er. Rajesh K. Varma', role: 'Biomedical Lead', hospital: 'Fortis Escorts Heart Institute', email: 'rajesh.varma@fortishealthcare.com', phone: '+91 98112 44321', equipment: 'CardioPulse Multi-Para Monitor', quoteAmount: '₹2,74,000', status: 'Quote Sent' },
  { id: 'cust-3', name: 'Dr. Anita Sen', role: 'Head of Surgery', hospital: 'Tata Memorial Hospital, Mumbai', email: 'anita.sen@tmc.gov.in', phone: '+91 98450 77881', equipment: 'AuraSurg 4K UHD Tower', quoteAmount: '₹14,50,000', status: 'In Review' },
  { id: 'cust-4', name: 'Dr. K. Srinivas', role: 'Chief Radiologist', hospital: 'Care Diagnostic Centre, Hyderabad', email: 'srinivas.k@carediagnostics.in', phone: '+91 99881 22334', equipment: 'RayMaster 500mA Fixed X-Ray', quoteAmount: '₹18,50,000', status: 'Quote Sent' },
  { id: 'cust-5', name: 'Dr. Rajiv Anand', role: 'Emergency Director', hospital: 'Max Super Speciality, Saket', email: 'rajiv.anand@maxhealthcare.com', phone: '+91 98101 99002', equipment: 'DefiQuick Biphasic Defibrillator', quoteAmount: '₹5,85,000', status: 'Order Pipeline' },
  { id: 'cust-6', name: 'Dr. Vikram Rathore', role: 'Purchase Director', hospital: 'AIIMS New Delhi', email: 'procurement@aiims.edu', phone: '+91 98100 11223', equipment: 'Centralized MGPS & ICU Beds', quoteAmount: '₹34,00,000', status: 'Tender Notice' },
  { id: 'cust-7', name: 'Dr. Priya Nair', role: 'Nephrology Head', hospital: 'Manipal Hospital Bengaluru', email: 'priya.nair@manipalhospitals.com', phone: '+91 98440 22331', equipment: 'HemoPure Dialysis Machine', quoteAmount: '₹11,20,000', status: 'Demo Requested' }
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'products', 'vps'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leadFilterDomain, setLeadFilterDomain] = useState('all');

  // Live MongoDB Database State
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    checking: true,
    latency: '',
    database: 'biomedical_network',
    counts: { sites: 7, leads: 5, campaigns: 4 },
    uri: '',
    error: null
  });
  const [mongoUriInput, setMongoUriInput] = useState('mongodb+srv://admin:pass@vps-cluster.mongodb.net/biomedical_network');
  const [isTestingMongo, setIsTestingMongo] = useState(false);
  const [mongoTestResult, setMongoTestResult] = useState(null);
  const [isSavingMongo, setIsSavingMongo] = useState(false);
  const [isSeedingMongo, setIsSeedingMongo] = useState(false);

  // Email Marketing Hub State
  const [selectedCompanyId, setSelectedCompanyId] = useState('rajbiosis');
  const [targetAudience, setTargetAudience] = useState('followup'); // 'followup', 'all', 'specific', 'new_sites', 'manual'
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(['cust-1', 'cust-2']);
  const [selectedTemplateId, setSelectedTemplateId] = useState('followup');
  const [campaignSubject, setCampaignSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [campaignPreheader, setCampaignPreheader] = useState(EMAIL_TEMPLATES[0].preheader);
  const [campaignBody, setCampaignBody] = useState(EMAIL_TEMPLATES[0].body);
  const [ctaText, setCtaText] = useState(EMAIL_TEMPLATES[0].ctaText);
  const [ctaUrl, setCtaUrl] = useState(EMAIL_TEMPLATES[0].ctaUrl);
  const [attachedDocs, setAttachedDocs] = useState(['spec_sheet', 'iso_cert']);
  const [manualEmails, setManualEmails] = useState('procurement@apollohospitals.com, dr.kapoor@fortis.in');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [marketingSubTab, setMarketingSubTab] = useState('compose'); // 'compose' | 'history'
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState(null);

  const [campaignHistory, setCampaignHistory] = useState([]);

  const currentCompany = SENDER_COMPANIES.find(c => c.id === selectedCompanyId) || SENDER_COMPANIES[0];

  const getRecipientCount = () => {
    if (targetAudience === 'all') return '2,840 Hospitals & Clinics';
    if (targetAudience === 'followup') return '42 Hot Quotation Leads';
    if (targetAudience === 'new_sites') return '1,420 Network Procurement Heads';
    if (targetAudience === 'specific') return `${selectedCustomerIds.length} Selected Hospitals`;
    if (targetAudience === 'manual') {
      const count = manualEmails.split(',').filter(e => e.trim().length > 0).length;
      return `${count} Manual Email${count === 1 ? '' : 's'}`;
    }
    return '0 Recipients';
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tpl = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setCampaignSubject(tpl.subject);
      setCampaignPreheader(tpl.preheader);
      setCampaignBody(tpl.body);
      setCtaText(tpl.ctaText);
      setCtaUrl(tpl.ctaUrl);
    }
  };

  const handleToggleCustomer = (customerId) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomerIds.length === MARKETING_CUSTOMERS.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(MARKETING_CUSTOMERS.map(c => c.id));
    }
  };

  const handleToggleDoc = (docKey) => {
    setAttachedDocs(prev =>
      prev.includes(docKey)
        ? prev.filter(k => k !== docKey)
        : [...prev, docKey]
    );
  };

  const handleInsertTag = (tag) => {
    setCampaignBody(prev => prev + ' ' + tag);
  };

  const getPreviewBody = () => {
    let text = campaignBody;
    text = text.replaceAll('{Doctor_Name}', 'Dr. S. K. Mehta');
    text = text.replaceAll('{Hospital_Name}', 'Apollo Super Speciality Hospital');
    text = text.replaceAll('{Equipment_Name}', 'RajBiosis-Vent Pro-X9 Ventilator');
    text = text.replaceAll('{Quotation_Amount}', '₹9,70,000');
    text = text.replaceAll('{Company_Name}', currentCompany.name);
    text = text.replaceAll('{Support_Phone}', currentCompany.phone);
    return text;
  };

  const getPreviewSubject = () => {
    let subj = campaignSubject;
    subj = subj.replaceAll('{Doctor_Name}', 'Dr. S. K. Mehta');
    subj = subj.replaceAll('{Hospital_Name}', 'Apollo Super Speciality');
    subj = subj.replaceAll('{Equipment_Name}', 'ICU Ventilator Pro-X9');
    subj = subj.replaceAll('{Company_Name}', currentCompany.name);
    return subj;
  };

  const handleSendCampaign = (e) => {
    e?.preventDefault();
    if (!campaignSubject.trim()) {
      alert("Please enter a subject line for your email campaign!");
      return;
    }
    if (!campaignBody.trim()) {
      alert("Please write the email content before sending!");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog = {
        id: `CAMP-${Math.floor(100000 + Math.random() * 900000)}`,
        company: currentCompany.name,
        companyId: currentCompany.id,
        subject: getPreviewSubject(),
        audience: getRecipientCount(),
        sentAt: 'Just now',
        openRate: '0.0%',
        status: 'Delivered',
        recipients: targetAudience === 'specific' ? selectedCustomerIds.length : (targetAudience === 'followup' ? 42 : (targetAudience === 'all' ? 2840 : 1420))
      };
      setCampaignHistory(prev => [newLog, ...prev]);
      setSendSuccessMsg(`Campaign successfully broadcast to ${getRecipientCount()} from ${currentCompany.name}!`);
      setTimeout(() => setSendSuccessMsg(null), 6000);

      // Persist to MongoDB
      try {
        fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLog)
        });
      } catch (err) {
        console.warn('MongoDB campaign sync:', err);
      }
    }, 1200);
  };

  const handleSendTestEmail = () => {
    alert(`Test email sent to admin@rajbiosis.com as preview from '${currentCompany.name}'. Check your inbox!`);
  };

  // Websites Registry State (Loaded in background for lead company and domain matching)
  const [sites, setSites] = useState([]);
  const [isSitesLoading, setIsSitesLoading] = useState(true);


  // Centralized Inquiries / Leads (cross-domain) - Loaded live from MongoDB Atlas
  const [leads, setLeads] = useState([]);

  // Load live data from MongoDB on mount
  useEffect(() => {
    checkDbStatus();
    loadSitesFromDb();
    loadLeadsFromDb();
    loadCampaignsFromDb();
  }, []);

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatus({
        connected: !!data.connected,
        checking: false,
        latency: data.latency || '',
        database: data.database || 'biomedical_network',
        counts: data.counts || { sites: 7, leads: 5, campaigns: 4 },
        uri: data.uri || '',
        error: data.error
      });
      if (data.uri) {
        setMongoUriInput(data.uri);
      }
    } catch (e) {
      setDbStatus(prev => ({ ...prev, checking: false, connected: false, error: e.message }));
    }
  };

  const loadSitesFromDb = async () => {
    setIsSitesLoading(true);
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      if (data.success && Array.isArray(data.sites)) {
        setSites(data.sites);
      }
    } catch (e) {
      console.warn('MongoDB sites fallback:', e);
    } finally {
      setIsSitesLoading(false);
    }
  };

  const loadLeadsFromDb = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.warn('MongoDB leads fallback:', e);
    }
  };

  const loadCampaignsFromDb = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaignHistory(data.campaigns);
      }
    } catch (e) {
      console.warn('MongoDB campaigns fallback:', e);
    }
  };

  const handleTestMongoUri = async () => {
    setIsTestingMongo(true);
    setMongoTestResult(null);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', uri: mongoUriInput })
      });
      const data = await res.json();
      setMongoTestResult(data);
    } catch (e) {
      setMongoTestResult({ success: false, connected: false, error: e.message });
    } finally {
      setIsTestingMongo(false);
    }
  };

  const handleSaveMongoUri = async () => {
    setIsSavingMongo(true);
    setMongoTestResult(null);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', uri: mongoUriInput })
      });
      const data = await res.json();
      setMongoTestResult(data);
      if (data.success) {
        await checkDbStatus();
        await loadSitesFromDb();
        await loadLeadsFromDb();
        await loadCampaignsFromDb();
      }
    } catch (e) {
      setMongoTestResult({ success: false, error: e.message });
    } finally {
      setIsSavingMongo(false);
    }
  };

  const handleReseedMongo = async () => {
    setIsSeedingMongo(true);
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await checkDbStatus();
        await loadSitesFromDb();
        await loadLeadsFromDb();
        await loadCampaignsFromDb();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeedingMongo(false);
    }
  };

  const availableLeadDomains = Array.from(
    new Set([...leads.map(l => l.siteDomain), ...sites.map(s => s.domain)].filter(Boolean))
  );

  const filteredLeads = leads.filter(l => {
    if (leadFilterDomain !== 'all') {
      return l.siteDomain === leadFilterDomain;
    }
    return true;
  });

  const totalPipelineVal = filteredLeads.reduce((acc, l) => {
    const num = parseInt((l.amount || l.quoteAmount || '0').replace(/[^0-9]/g, '')) || 0;
    return acc + num;
  }, 0);
  const formattedPipeline = totalPipelineVal > 0
    ? `₹${(totalPipelineVal >= 10000000 ? (totalPipelineVal / 10000000).toFixed(2) + ' Cr' : (totalPipelineVal / 100000).toFixed(2) + ' L')}`
    : '₹0.00';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/60 text-slate-700 font-sans">

      {/* Left Sidebar (Sticky & Fixed, Collapsible) */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 hidden md:flex shadow-xs h-screen sticky top-0 overflow-y-auto transition-all duration-300 ease-in-out`}>
        <div>
          {/* Admin Header with Multi-Brand Overview */}
          {!isSidebarCollapsed ? (
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden hover:border-sky-300 transition">
                  <img src="/rajbiosis-logo.png" alt="Raj Biosis Private Limited" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold tracking-tight text-slate-800 truncate flex items-center gap-1">
                    <span className="truncate">Multi-Brand Hub</span>
                    <span className="text-[9px] bg-sky-50 text-sky-700 font-mono px-1.5 py-0.2 rounded border border-sky-200/80 font-bold shrink-0">B2B</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Raj Biosis • Human • Global</div>
                </div>
              </div>

              {/* Collapse Button (Sidebar Header) */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0 ml-1"
                title="Collapse Sidebar (Icon Only)"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          ) : (
            <div className="p-3 border-b border-slate-100 flex flex-col items-center gap-2 bg-white">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden hover:border-sky-300 transition" title="Raj Biosis Multi-Brand Hub">
                <img src="/rajbiosis-logo.png" alt="Raj Biosis" className="w-full h-full object-contain" />
              </div>

              {/* Expand Button (Sidebar Header) */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Expand Sidebar (Full Width)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-2 space-y-1 text-xs font-semibold">

            <button
              onClick={() => setActiveTab('leads')}
              title={`Central Leads & RFQ (${leads.length} Inquiries)`}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'leads'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Inbox size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Central Leads & RFQ</span>}
              </span>
              {isSidebarCollapsed ? (
                leads.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border border-white"></span>
                )
              ) : (
                <span className="text-[10px] bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {leads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('website')}
              title="Website & Home Page (CMS Builder)"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'website'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Globe size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Website & Home Page</span>}
              </span>
              {isSidebarCollapsed ? (
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              ) : (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  CMS
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              title="Products & Catalog (MongoDB Atlas Synced)"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-2.5 px-3.5 py-2.5'} rounded-xl transition cursor-pointer ${activeTab === 'products'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <Package size={isSidebarCollapsed ? 19 : 16} />
              {!isSidebarCollapsed && <span>Products & Catalog</span>}
            </button>

            <button
              onClick={() => setActiveTab('quotation')}
              title="Web Quotation (4-Page Official PDF Generator)"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'quotation'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <FileText size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Web Quotation</span>}
              </span>
              {isSidebarCollapsed ? (
                <span className="absolute top-2 right-2 w-2 h-2 bg-sky-600 rounded-full border border-white"></span>
              ) : (
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                  PDF
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vps')}
              title="VPS Deployment & MongoDB Pipeline"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-2.5 px-3.5 py-2.5'} rounded-xl transition cursor-pointer ${activeTab === 'vps'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <Server size={isSidebarCollapsed ? 19 : 16} />
              {!isSidebarCollapsed && <span>VPS & MongoDB Config</span>}
            </button>
          </nav>
        </div>

        {/* Bottom User / Return */}
        <div className={`p-3 border-t border-slate-100 ${isSidebarCollapsed ? 'flex flex-col items-center space-y-2' : 'space-y-3'}`}>
          <Link
            href="/"
            target="_blank"
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition border border-slate-200/80 shadow-xs`}
            title="View Public Storefront"
          >
            {!isSidebarCollapsed && <span>View Public Storefront</span>}
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('vps')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between text-[11px] p-2'} rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition cursor-pointer text-left shadow-2xs relative`}
            title={dbStatus.connected ? `MongoDB Connected (${dbStatus.latency || 'Live'})` : 'MongoDB Standby Mode'}
          >
            <span className="font-mono text-slate-500 flex items-center gap-1.5">
              <Database size={isSidebarCollapsed ? 16 : 12} className={dbStatus.connected ? "text-emerald-500" : "text-amber-500"} />
              {!isSidebarCollapsed && <span>MongoDB</span>}
            </span>
            {isSidebarCollapsed ? (
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}></span>
            ) : (
              dbStatus.connected ? (
                <span className="text-emerald-600 flex items-center gap-1.5 font-semibold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected ({dbStatus.latency || 'Live'})
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1.5 font-medium text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Standby Mode
                </span>
              )
            )}
          </button>
        </div>
      </aside>

      {/* Main Workspace Area (Scrollable with Sticky Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar Collapse Button (Top Navbar) */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200/80 shadow-2xs mr-1 shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar (Wider Menu)" : "Collapse Sidebar (Full Width Workspace)"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {activeTab === 'leads' && (
                <>
                  <span>Central Hospital Inquiries & Quotation Desk</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-sky-50 text-sky-700 border border-sky-200">
                    {filteredLeads.length} Inquiries
                  </span>
                </>
              )}
              {activeTab === 'marketing' && 'Multi-Brand Email Marketing Hub (Raj Biosis, Human & Global Bio)'}
              {activeTab === 'products' && (
                <>
                  <span>Multi-Company Products & Catalog Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-sky-50 text-sky-700 border border-sky-200">
                    Atlas Live Synced
                  </span>
                </>
              )}
              {activeTab === 'quotation' && (
                <>
                  <span>Web Quotation</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-sky-50 text-sky-700 border border-sky-200">
                    Official Letterhead
                  </span>
                </>
              )}
              {activeTab === 'vps' && 'VPS Deployment & MongoDB Pipeline'}
            </h1>
          </div>

          <div className="flex items-center gap-3">

            {activeTab === 'marketing' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMarketingSubTab('compose')}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${marketingSubTab === 'compose'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                >
                  ✍️ Compose Campaign
                </button>
                <button
                  onClick={() => setMarketingSubTab('history')}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer ${marketingSubTab === 'history'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                >
                  <History size={13} />
                  <span>Delivery Logs ({campaignHistory.length})</span>
                </button>
              </div>
            )}

            {/* Live MongoDB Status Pill in Header */}
            <button
              type="button"
              onClick={() => setActiveTab('vps')}
              className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition flex items-center gap-2 cursor-pointer shadow-2xs ${dbStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="font-semibold">{dbStatus.connected ? `MongoDB: Live (${dbStatus.latency || 'OK'})` : 'MongoDB: Standby'}</span>
            </button>

            <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              Host: <span className="text-slate-700 font-semibold">rajbiosis.com</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="p-6 space-y-6">

          {/* Quick Metrics Bar (Dynamic for Marketing or Sites) */}
          {activeTab === 'marketing' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Sender Brands</span>
                  <span className="text-2xl font-bold text-slate-800">3 OEM Divisions</span>
                  <span className="text-[11px] text-sky-600 font-medium block mt-0.5">Raj Biosis, Human & Global</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Hospital Reach</span>
                  <span className="text-2xl font-bold text-slate-800">2,840 <span className="text-xs font-semibold text-emerald-600">Verified</span></span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Doctors & Procurement Heads</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">RFQ Follow-Ups</span>
                  <span className="text-2xl font-bold text-slate-800">42 <span className="text-xs font-semibold text-amber-600">Hot Deals</span></span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Quotes Pending Approval</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <Target size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Avg. Open Rate</span>
                  <span className="text-2xl font-bold text-slate-800">68.4%</span>
                  <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">+14% vs B2B Healthcare</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold">
                  <CheckCheck size={20} />
                </div>
              </div>
            </div>
          ) : activeTab === 'leads' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Hospital RFQs & Leads</span>
                  <span className="text-2xl font-bold text-slate-800">{filteredLeads.length} <span className="text-xs font-semibold text-emerald-600">{filteredLeads.length > 0 ? 'Live Inquiries' : 'No Inquiries Yet'}</span></span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Direct MongoDB RFQ Inquiries</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                  <Inbox size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Quotation Pipeline</span>
                  <span className="text-2xl font-bold text-slate-800">{formattedPipeline}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{filteredLeads.length} Active Quotes In Pipeline</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Certified Hardware</span>
                  <span className="text-2xl font-bold text-slate-800">{PRODUCTS.length} Models</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Biomedical Global Catalog</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold">
                  <Package size={20} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Database & Cluster</span>
                  <span className="text-2xl font-bold text-slate-800">{dbStatus.connected ? 'Cluster Live' : 'Standby'}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">{dbStatus.database}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
              </div>
            </div>
          ) : null}

          {/* =========================================================================
              TAB 2: CENTRAL LEADS & RFQ INQUIRIES DESK
              ========================================================================= */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden space-y-4">
              {/* Filter Bar */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-500">Filter by Website:</label>
                  <select
                    value={leadFilterDomain}
                    onChange={(e) => setLeadFilterDomain(e.target.value)}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono outline-none focus:bg-white focus:border-sky-400"
                  >
                    <option value="all">All Source Websites ({leads.length})</option>
                    {availableLeadDomains.map(d => {
                      const siteObj = sites.find(s => s.domain === d);
                      return (
                        <option key={d} value={d}>
                          {siteObj?.brandName ? `${siteObj.brandName} (${d})` : d}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => alert("Exporting all hospital leads to CSV / Excel...")}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-1.5 transition shadow-xs"
                >
                  <Download size={13} />
                  <span>Export to Excel / CSV</span>
                </button>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50">
                      <th className="py-3 px-4">Ref & Date</th>
                      <th className="py-3 px-4">Source Website</th>
                      <th className="py-3 px-4">Hospital & Doctor</th>
                      <th className="py-3 px-4">Requested Hardware</th>
                      <th className="py-3 px-4">Quotation Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70 font-medium text-slate-600">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                            <Inbox size={22} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-700">No Hospital Quotation Inquiries Yet</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            When doctors, hospital purchase officers, or clinic heads request quotes on any connected website, inquiries will be registered here directly in MongoDB.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-sky-50/30 transition">
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-slate-700 block">{lead.id}</span>
                            <span className="text-[10px] text-slate-400">{lead.date}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 font-mono text-[11px] font-medium">
                              {lead.siteDomain}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 text-xs">{lead.hospital}</div>
                            <span className="text-[11px] text-slate-500 block">{lead.contact}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{lead.phone}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 font-medium">{lead.equipment}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-600 font-bold text-sm font-mono">{lead.amount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-xs"
                            >
                              <PhoneCall size={12} />
                              <span>Call</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: WEBSITE CMS & DYNAMIC HOMEPAGE BUILDER
              ========================================================================= */}
          {activeTab === 'website' && (
            <WebsiteHomepageManager />
          )}

          {/* =========================================================================
              TAB 3: GLOBAL MULTI-COMPANY CATALOG MANAGER (MongoDB Atlas Synced)
              ========================================================================= */}
          {activeTab === 'products' && (
            <ProductCatalogManager initialSites={sites} />
          )}

          {/* =========================================================================
              TAB: WEB QUOTATION DESK & 4-PAGE OFFICIAL RAJ BIOSIS PDF GENERATOR
              ========================================================================= */}
          {activeTab === 'quotation' && (
            <WebQuotationManager products={PRODUCTS} />
          )}

          {/* =========================================================================
              TAB 4: LIVE MONGODB CONNECTION STUDIO & MULTI-DOMAIN PIPELINE
              ========================================================================= */}
          {activeTab === 'vps' && (
            <div className="space-y-6">

              {/* Top MongoDB Cluster Status Banner */}
              <div className={`p-6 rounded-3xl border shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${dbStatus.connected
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                }`}>
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                    <Database size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {dbStatus.connected ? 'MongoDB Cluster Connected & Active' : 'MongoDB Standby Mode (In-Memory Fallback Active)'}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${dbStatus.connected ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                        {dbStatus.connected ? 'LIVE POOL' : 'STANDBY CACHE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dbStatus.connected
                        ? `All 70 websites, hospital quotations, and marketing campaigns are continuously synchronizing with '${dbStatus.database}'. Latency: ${dbStatus.latency}.`
                        : 'Currently serving and saving data in memory with zero downtime. Connect your MongoDB Atlas cluster or local MongoDB instance below to activate persistent storage.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={checkDbStatus}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} className={dbStatus.checking ? "animate-spin" : ""} />
                    <span>Check Connection</span>
                  </button>
                </div>
              </div>

              {/* MongoDB Cluster Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Database Name</span>
                  <span className="text-lg font-bold font-mono text-slate-800 truncate block mt-0.5">{dbStatus.database || 'biomedical_network'}</span>
                  <span className="text-[11px] text-emerald-600 font-medium block mt-1">Multi-Tenant Namespace</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Sites Collection</span>
                  <span className="text-2xl font-bold text-slate-800">{sites.length} <span className="text-xs font-semibold text-sky-600">Websites</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Config & Domain Registry</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Leads Collection</span>
                  <span className="text-2xl font-bold text-slate-800">{leads.length} <span className="text-xs font-semibold text-emerald-600">Inquiries</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Hospital Quotes & RFQs</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Campaigns Collection</span>
                  <span className="text-2xl font-bold text-slate-800">{campaignHistory.length} <span className="text-xs font-semibold text-indigo-600">Broadcasts</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Delivery & Telemetry Logs</span>
                </div>
              </div>

              {/* Interactive MongoDB Connection Configuration Studio */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Key size={16} className="text-sky-500" />
                      <span>MongoDB Connection URI & Credentials</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connect your production MongoDB Atlas cluster or VPS MongoDB instance. Enter your URI and test the connection in real time.
                    </p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setMongoUriInput('mongodb+srv://admin:pass@vps-cluster.mongodb.net/biomedical_network')}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100/80 text-sky-700 text-[11px] font-semibold transition cursor-pointer border border-sky-200/60"
                    >
                      ☁️ Atlas Cloud
                    </button>
                    <button
                      type="button"
                      onClick={() => setMongoUriInput('mongodb://127.0.0.1:27017/biomedical_network')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      💻 Localhost
                    </button>
                    <button
                      type="button"
                      onClick={() => setMongoUriInput('mongodb://127.0.0.1:27017/biomedical_network')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-[11px] font-semibold transition cursor-pointer border border-emerald-200/60"
                    >
                      🖥️ VPS Port 27017
                    </button>
                  </div>
                </div>

                {/* URI Input & Buttons */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      MongoDB Connection URI (mongodb:// or mongodb+srv://)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mongoUriInput}
                        onChange={(e) => setMongoUriInput(e.target.value)}
                        placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/biomedical_network"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-sky-400 transition"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      💡 Tip for Atlas: Ensure your IP address is whitelisted in MongoDB Atlas Network Access (or set to 0.0.0.0/0 for anywhere).
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isTestingMongo}
                        onClick={handleTestMongoUri}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        {isTestingMongo ? (
                          <>
                            <RefreshCw size={13} className="animate-spin text-sky-500" />
                            <span>Testing Ping...</span>
                          </>
                        ) : (
                          <>
                            <Wifi size={13} className="text-sky-500" />
                            <span>Test Live Connection</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isSavingMongo}
                        onClick={handleSaveMongoUri}
                        className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sky-500/25"
                      >
                        {isSavingMongo ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Saving to .env.local...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Save to .env.local & Connect</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isSeedingMongo}
                      onClick={handleReseedMongo}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer border border-slate-200/80 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RefreshCw size={12} className={isSeedingMongo ? "animate-spin text-sky-500" : ""} />
                      <span>Re-Sync All Collections</span>
                    </button>
                  </div>

                  {/* Real-Time Test Feedback Banner */}
                  {mongoTestResult && (
                    <div className={`p-4 rounded-2xl border text-xs shadow-xs transition ${mongoTestResult.connected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}>
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {mongoTestResult.connected ? (
                          <>
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span>MongoDB Connection Test Passed!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} className="text-rose-600" />
                            <span>MongoDB Connection Failed</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] font-mono leading-relaxed pl-6">
                        {mongoTestResult.connected ? (
                          <>
                            <div>Status: Ping OK | Latency: <strong>{mongoTestResult.latency}</strong> | Database: <strong>{mongoTestResult.database}</strong></div>
                            <div>Collections Found: {mongoTestResult.collections?.join(', ') || 'sites, leads, campaigns'}</div>
                          </>
                        ) : (
                          <>
                            <div>Error: {mongoTestResult.error}</div>
                            <div className="text-rose-700/80 mt-1 font-sans">
                              Check that: 1) MongoDB server is running, 2) IP whitelist is open in Atlas, 3) Username & Password are correct.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Database Collections & Data Architecture Explorer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      db.collection('sites')
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800">{sites.length} Docs</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Stores the multi-tenant registry for all 70 biomedical websites. Each document defines domain routing, theme colors, typography fonts, header styles, and company ownership.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">domain</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">brandName</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">primaryColor</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">font</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">headerStyle</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">leadsCount</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      db.collection('leads')
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800">{leads.length} Docs</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Captures all incoming hospital quotations, doctor inquiries, and equipment RFQ orders routed from the 70 public storefronts directly to central sales administration.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">doctorName</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">hospital</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">equipment</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">quoteAmount</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">siteDomain</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">status</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      db.collection('campaigns')
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800">{campaignHistory.length} Docs</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Stores multi-brand email marketing broadcasts across Raj Biosis, Human Biomedicals, and Global Biomedical, including recipient lists, open rates, and dispatch timestamps.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">id</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">company</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">subject</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">audience</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">openRate</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">status</span>
                  </div>
                </div>
              </div>

              {/* Nginx Wildcard Multi-Domain Reverse Proxy Guide */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-sky-500" />
                    <h4 className="text-sm font-bold text-slate-800">VPS Nginx Wildcard Reverse Proxy Configuration</h4>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">/etc/nginx/sites-available/biomedical</span>
                </div>
                <p className="text-xs text-slate-400">
                  Deploy this configuration on your Ubuntu/Linux VPS to route all 70 domains to Next.js automatically without redeploying code.
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl font-mono text-xs text-slate-700 border border-slate-200/80 overflow-x-auto space-y-1">
                  <p className="text-slate-400"># Route all 70 domains & wildcard subdomains to Next.js port 3000/3001</p>
                  <p className="text-sky-700 font-semibold">server &#123;</p>
                  <p className="pl-4">listen 80;</p>
                  <p className="pl-4">server_name *.rajbiosis.com pulmocare.in surgitech.in cardiopulse.in nephrolife.in orthodrive.in laparovision.com;</p>
                  <p className="pl-4 text-emerald-700">location / &#123;</p>
                  <p className="pl-8">proxy_pass http://127.0.0.1:3000;</p>
                  <p className="pl-8">proxy_set_header Host $host;</p>
                  <p className="pl-8">proxy_set_header X-Real-IP $remote_addr;</p>
                  <p className="pl-8">proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</p>
                  <p className="pl-4 text-emerald-700">&#125;</p>
                  <p className="text-sky-700 font-semibold">&#125;</p>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 5: MULTI-BRAND EMAIL MARKETING HUB (RAJ BIOSIS, HUMAN & GLOBAL)
              ========================================================================= */}
          {activeTab === 'marketing' && (
            <div className="space-y-6">

              {/* Notification Banner */}
              {sendSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-sm transition">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{sendSuccessMsg}</span>
                  </div>
                  <button onClick={() => setSendSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* SUBTAB 1: COMPOSE & BROADCAST CAMPAIGN (CLEAN & SIMPLE 3-STEP LAYOUT) */}
              {marketingSubTab === 'compose' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                  {/* LEFT COLUMN: 3 EASY STEPS (7 Cols) */}
                  <div className="xl:col-span-7 space-y-5">

                    {/* Quick Guidance Header */}
                    <div className="bg-sky-50/70 border border-sky-200/70 rounded-2xl p-4 flex items-center justify-between text-xs text-sky-900 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          ✉️
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">Email Marketing & Hospital Follow-Up Desk</div>
                          <div className="text-[11px] text-sky-700">Easily broadcast hospital quotations, follow-ups, and network announcements in 3 simple steps.</div>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block px-3 py-1 bg-white text-sky-700 font-semibold rounded-xl border border-sky-200 text-[11px] shadow-xs">
                        Total Reach: {getRecipientCount()}
                      </span>
                    </div>

                    {/* STEP 1: SENDER BRAND SELECTION */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                          <h3 className="text-sm font-bold text-slate-800">Step 1: Select Sender Brand (From Which Company to Send)</h3>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">3 Registered Brands</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SENDER_COMPANIES.map((company) => {
                          const isSelected = selectedCompanyId === company.id;
                          return (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => setSelectedCompanyId(company.id)}
                              className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${isSelected
                                  ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/25 shadow-xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                                }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  {company.logo ? (
                                    <div className="w-12 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center">
                                      <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
                                      style={{ backgroundColor: company.accentColor }}
                                    >
                                      {company.shortName.charAt(0)}
                                    </div>
                                  )}
                                  {isSelected && (
                                    <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Check size={11} strokeWidth={3} /> Selected
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-slate-800">{company.shortName}</div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{company.specialty}</p>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] font-mono text-sky-700 truncate font-medium">
                                {company.email}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 2: AUDIENCE SELECTION */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                          <h3 className="text-sm font-bold text-slate-800">Step 2: Select Target Audience & Recipients</h3>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {getRecipientCount()}
                        </span>
                      </div>

                      {/* 4 Clean Audience Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTargetAudience('followup')}
                          className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${targetAudience === 'followup'
                              ? 'bg-amber-50/80 border-amber-400 font-semibold ring-2 ring-amber-300/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs text-amber-800">
                            <Target size={15} className="text-amber-500 shrink-0" />
                            <span>Pending Quotes</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1">42 Hot Leads</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetAudience('all')}
                          className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${targetAudience === 'all'
                              ? 'bg-sky-50/80 border-sky-400 font-semibold ring-2 ring-sky-300/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs text-sky-800">
                            <Users size={15} className="text-sky-500 shrink-0" />
                            <span>All Hospitals</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1">2,840 Database</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetAudience('specific')}
                          className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${targetAudience === 'specific'
                              ? 'bg-indigo-50/80 border-indigo-400 font-semibold ring-2 ring-indigo-300/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs text-indigo-800">
                            <Building2 size={15} className="text-indigo-500 shrink-0" />
                            <span>Specific Doctors</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1">{selectedCustomerIds.length} Selected</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetAudience('new_sites')}
                          className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${targetAudience === 'new_sites'
                              ? 'bg-emerald-50/80 border-emerald-400 font-semibold ring-2 ring-emerald-300/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                            <Globe size={15} className="text-emerald-500 shrink-0" />
                            <span>70 Portals Launch</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1">1,420 Contacts</span>
                        </button>
                      </div>

                      {/* If Specific Doctors Selected: Show Simple Checklist */}
                      {targetAudience === 'specific' && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Select Target Doctors & Hospitals:</span>
                            <button
                              type="button"
                              onClick={handleSelectAllCustomers}
                              className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] cursor-pointer"
                            >
                              {selectedCustomerIds.length === MARKETING_CUSTOMERS.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {MARKETING_CUSTOMERS.map((cust) => (
                              <label
                                key={cust.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 text-xs cursor-pointer hover:border-sky-300 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedCustomerIds.includes(cust.id)}
                                    onChange={() => handleToggleCustomer(cust.id)}
                                    className="rounded text-sky-500 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-semibold text-slate-800">{cust.name}</span>
                                    <span className="text-slate-400 text-[11px] ml-1.5">({cust.hospital})</span>
                                  </div>
                                </div>
                                <span className="font-mono text-emerald-600 font-semibold text-[11px]">{cust.quoteAmount}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* STEP 3: MESSAGE & TEMPLATE */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">3</span>
                          <h3 className="text-sm font-bold text-slate-800">Step 3: Compose Email & Select Sales Template</h3>
                        </div>
                      </div>

                      {/* 1-Click Templates Pills */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">1-Click Pre-Built Sales Templates:</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {EMAIL_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleSelectTemplate(tpl.id)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${selectedTemplateId === tpl.id
                                  ? 'bg-sky-500 text-white border-sky-500 shadow-xs font-semibold'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                            >
                              {tpl.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Subject Line */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 block">Subject Line *</label>
                        <input
                          type="text"
                          value={campaignSubject}
                          onChange={(e) => setCampaignSubject(e.target.value)}
                          placeholder="e.g. Official Quotation & Priority Hospital Allocation - Raj Biosis"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-medium transition"
                        />
                      </div>

                      {/* Tag Shortcut Helper Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 block">Message Body *</label>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400">Quick Tags:</span>
                            <button
                              type="button"
                              onClick={() => handleInsertTag('{Doctor_Name}')}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-sky-100 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                            >
                              + Doctor Name
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertTag('{Hospital_Name}')}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-sky-100 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                            >
                              + Hospital Name
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertTag('{Equipment_Name}')}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-sky-100 text-slate-700 rounded text-[10px] font-mono cursor-pointer"
                            >
                              + Equipment
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={7}
                          value={campaignBody}
                          onChange={(e) => setCampaignBody(e.target.value)}
                          placeholder="Write your email body here or customize any pre-built template above..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-sans leading-relaxed transition"
                        />
                      </div>

                      {/* Simple CTA & Attachment in 1 row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Call-To-Action (CTA) Button Text</label>
                          <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="Review Official OEM Quotation (PDF)"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-sky-400 mb-1.5"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Attach Technical Documents</label>
                          <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-[11px] text-slate-700">
                            <input
                              type="checkbox"
                              checked={attachedDocs.includes('spec_sheet')}
                              onChange={() => handleToggleDoc('spec_sheet')}
                              className="rounded text-sky-500 cursor-pointer"
                            />
                            <Paperclip size={13} className="text-slate-400 shrink-0" />
                            <span>Attach Product Spec-Sheet & ISO-13485 PDF</span>
                          </label>
                        </div>
                      </div>

                      {/* Big, Clear Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          Sender: <strong className="text-slate-800">{currentCompany.name}</strong> • Reach: <strong className="text-sky-600">{getRecipientCount()}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSendTestEmail}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                          >
                            ✉️ Send Test Email
                          </button>

                          <button
                            type="button"
                            disabled={isSending}
                            onClick={handleSendCampaign}
                            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm shadow-sky-500/25 flex items-center gap-2 cursor-pointer"
                          >
                            {isSending ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Send size={14} />
                                <span>Send Campaign Now ({getRecipientCount()})</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: LIVE REALISTIC EMAIL PREVIEW (5 Cols - Sticky) */}
                  <div className="xl:col-span-5 space-y-3 xl:sticky xl:top-20 self-start">
                    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Eye size={15} className="text-sky-500" />
                        <span>Live Email Preview (Hospital Inbox)</span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className={`px-2 py-0.5 rounded transition text-[11px] font-medium flex items-center gap-1 cursor-pointer ${previewDevice === 'desktop' ? 'bg-white text-sky-700 shadow-xs font-semibold' : 'text-slate-500'
                            }`}
                        >
                          <Laptop size={12} />
                          <span>Desktop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className={`px-2 py-0.5 rounded transition text-[11px] font-medium flex items-center gap-1 cursor-pointer ${previewDevice === 'mobile' ? 'bg-white text-sky-700 shadow-xs font-semibold' : 'text-slate-500'
                            }`}
                        >
                          <Smartphone size={12} />
                          <span>Mobile</span>
                        </button>
                      </div>
                    </div>

                    {/* Realistic Email Box */}
                    <div
                      className={`mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 max-h-[calc(100vh-9.5rem)] flex flex-col ${previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
                        }`}
                    >
                      {/* Email Header Chrome */}
                      <div className="bg-slate-50 border-b border-slate-200/80 p-3 space-y-1.5 text-xs shrink-0">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                          {getPreviewSubject() || 'Official Hospital Procurement Communication'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>From: <strong className="text-slate-700">{currentCompany.name}</strong> &lt;{currentCompany.email}&gt;</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          To: Dr. S. K. Mehta &lt;dr.mehta@apollohospitals.com&gt;
                        </div>
                      </div>

                      {/* Email Content Body */}
                      <div className="p-5 space-y-3.5 bg-white text-xs text-slate-700 overflow-y-auto flex-1">

                        {/* Brand Banner */}
                        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                          {selectedCompanyId === 'rajbiosis' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
                                <img src="/rajbiosis-logo.png" alt="Raj Biosis Private Limited" className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">Raj Biosis Private Limited</div>
                                <div className="text-[10px] text-slate-400">ICU & Critical Care Biomedical OEM</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
                                style={{ backgroundColor: currentCompany.accentColor }}
                              >
                                {currentCompany.shortName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{currentCompany.name}</div>
                                <div className="text-[10px] text-slate-400">{currentCompany.tagline}</div>
                              </div>
                            </div>
                          )}
                          <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono">
                            Verified OEM
                          </span>
                        </div>

                        {/* Body Text */}
                        <div className="whitespace-pre-line text-xs sm:text-[12px] leading-relaxed text-slate-700">
                          {getPreviewBody() || 'Please compose your email message in the editor on the left.'}
                        </div>

                        {/* Attached Specs Highlight Box */}
                        {attachedDocs.includes('spec_sheet') && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={14} className="text-rose-500 shrink-0" />
                              <span className="truncate font-medium text-slate-800">RajBiosis-Vent-Pro-X9-TechSpec.pdf</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">2.4 MB • PDF</span>
                          </div>
                        )}

                        {/* CTA Button Preview */}
                        <div className="pt-2 text-center">
                          <a
                            href={ctaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:shadow-md transition"
                            style={{ backgroundColor: currentCompany.accentColor }}
                          >
                            <span>{ctaText || 'Review Official Quotation'}</span>
                            <ArrowRight size={13} />
                          </a>
                        </div>

                        {/* Simple Footer */}
                        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
                          <p className="font-semibold text-slate-600">{currentCompany.name} • {currentCompany.isoCert}</p>
                          <p>Toll-Free: <strong className="text-slate-600 font-mono">{currentCompany.phone}</strong> | Email: <strong className="text-slate-600 font-mono">{currentCompany.email}</strong></p>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SUBTAB 2: DELIVERY LOGS & CAMPAIGN HISTORY */}
              {marketingSubTab === 'history' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden space-y-4">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Sent Campaigns & Performance Delivery Logs</h3>
                      <p className="text-xs text-slate-400">Tracking open rates, recipient reach, and inbox deliveries across all 3 biomedical companies.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMarketingSubTab('compose')}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>New Campaign</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50">
                          <th className="py-3 px-4">Ref ID & Date</th>
                          <th className="py-3 px-4">Sender Division</th>
                          <th className="py-3 px-4">Subject & Campaign Name</th>
                          <th className="py-3 px-4">Target Audience</th>
                          <th className="py-3 px-4">Open Rate</th>
                          <th className="py-3 px-4">Delivery Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/70 font-medium text-slate-600">
                        {campaignHistory.map((camp) => (
                          <tr key={camp.id} className="hover:bg-sky-50/30 transition">
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-slate-700 block">{camp.id}</span>
                              <span className="text-[10px] text-slate-400">{camp.sentAt}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 font-semibold text-xs whitespace-nowrap inline-block">
                                {camp.company}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 text-xs block">{camp.subject}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 font-medium">{camp.audience}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{camp.recipients} Recipients</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-emerald-600 text-xs">{camp.openRate}</span>
                                <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: camp.openRate }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                <CheckCircle2 size={11} className="text-emerald-500" />
                                <span>{camp.status}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignSubject(camp.subject);
                                  setMarketingSubTab('compose');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                              >
                                Re-send
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
