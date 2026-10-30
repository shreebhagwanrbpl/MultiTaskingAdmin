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
  Dices,
  Bell,
  Volume2,
  VolumeX,
  MessageCircle,
  LogOut,
  MapPin,
  UserCheck,
  Lock
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCatalogManager from './components/ProductCatalogManager';
import WebsiteHomepageManager from './components/WebsiteHomepageManager';
import WebQuotationManager from './components/WebQuotationManager';
import CustomerProfilesManager from './components/CustomerProfilesManager';
import UserRoleManager from './components/UserRoleManager';
import AuthScreen from './components/AuthScreen';
import { useAuth } from '../lib/AuthContext';
import { ALL_INDIAN_STATES, POPULAR_DISTRICT_HUBS } from '../data/indianDistricts';

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

export default function AdminDashboardPage({ searchParams }) {
  // Determine initial tab safely across SSR and Client Hydration
  const resolveInitialTab = () => {
    // 1. Check server-provided searchParams
    if (searchParams?.tab && ['leads', 'customers', 'website', 'products', 'quotation', 'marketing', 'users'].includes(searchParams.tab)) {
      return searchParams.tab;
    }
    // 2. Check window location or localStorage on client
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        const storedTab = window.localStorage.getItem('admin_active_tab');
        const chosen = urlTab || storedTab;
        if (chosen && ['leads', 'customers', 'website', 'products', 'quotation', 'marketing', 'users'].includes(chosen)) {
          return chosen;
        }
      } catch (e) { }
    }
    return 'leads';
  };

  const [activeTab, setActiveTabRaw] = useState(resolveInitialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leadFilterDomain, setLeadFilterDomain] = useState('all');
  const {
    user,
    loading: authLoading,
    logout,
    activeDistrictFilter,
    setDistrictFilter,
    isAdmin,
    isSales,
    isSuperAdmin,
    isDistrictManager,
    isSalesExecutive,
    isHospitalRep,
    canAccessTab
  } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Price Negotiation State & Actions for Leads
  const [negotiationModalLead, setNegotiationModalLead] = useState(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [counterNoteInput, setCounterNoteInput] = useState('');
  const [negotiationSubmitting, setNegotiationSubmitting] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 2500);
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

      setLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }

      setToastNotification({
        title: 'Price Approved Successfully!',
        message: `₹${approvedAmount.toLocaleString('en-IN')} approved for ${lead.hospital || lead.equipment}. Sales employees can now make the quotation.`
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
      const numQty = parseInt(String(lead.quantity || '1').replace(/\D/g, ''), 10) || 1;
      const totalAmount = numPrice * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'counter_offered',
        adminCounterPrice: numPrice,
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

      setLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEAD_PRICE_UPDATED', lead: { ...lead, ...updateData } });
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }

      setToastNotification({
        title: 'Counter Offer Set!',
        message: `In-between rate ₹${numPrice.toLocaleString('en-IN')} set for ${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.`
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
      message: `Price approval request sent to Admin for ₹${(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}. The Make Quotation button will unlock upon authorization.`
    });
  };

  const setActiveTab = (tab) => {
    setActiveTabRaw(tab);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('admin_active_tab', tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
      } catch (e) { }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        const storedTab = window.localStorage.getItem('admin_active_tab');
        const chosen = urlTab || (searchParams?.tab) || storedTab;
        if (chosen && ['leads', 'customers', 'website', 'products', 'quotation', 'marketing', 'users'].includes(chosen)) {
          setActiveTabRaw(chosen);
          // Sync URL if tab parameter was missing so hard refresh always stays here
          const url = new URL(window.location.href);
          if (url.searchParams.get('tab') !== chosen) {
            url.searchParams.set('tab', chosen);
            window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
          }
        }
      } catch (e) { }
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        if (urlTab && ['leads', 'customers', 'website', 'products', 'quotation', 'marketing', 'users'].includes(urlTab)) {
          setActiveTabRaw(urlTab);
        }
      } catch (e) { }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


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
  const [customerProfilesCount, setCustomerProfilesCount] = useState(0);

  // New Lead Alert System with 4-second Auto-Dismiss Timer
  const [newLeadAlerts, setNewLeadAlerts] = useState([]);
  const [alertCountdown, setAlertCountdown] = useState(4);
  const alertTimerRef = React.useRef(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const knownLeadIdsRef = React.useRef(new Set());
  const isInitialLeadFetchRef = React.useRef(true);

  // 4-second countdown auto-dismiss effect for top lead alert banner
  useEffect(() => {
    if (newLeadAlerts.length === 0) {
      if (alertTimerRef.current) clearInterval(alertTimerRef.current);
      return;
    }

    setAlertCountdown(4);
    if (alertTimerRef.current) clearInterval(alertTimerRef.current);

    alertTimerRef.current = setInterval(() => {
      setAlertCountdown(prev => {
        if (prev <= 1) {
          clearInterval(alertTimerRef.current);
          setNewLeadAlerts([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (alertTimerRef.current) clearInterval(alertTimerRef.current);
    };
  }, [newLeadAlerts.length]);

  // Synthesized Web Audio API Chime for New Incoming Leads
  const playLeadAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Primary tone (E5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Harmonic confirmation tone (A5 -> D6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.32);
      gain2.gain.setValueAtTime(0.3, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.log('Audio chime notice:', e);
    }
  };

  // Load live data from MongoDB on mount + 5-second polling interval
  useEffect(() => {
    checkDbStatus();
    loadSitesFromDb();
    loadLeadsFromDb();
    loadCampaignsFromDb();
    loadCustomerProfilesCount();
    loadQuotations();

    // Periodic 2-second polling to capture incoming leads and customer profile edits
    const pollTimer = setInterval(() => {
      loadLeadsFromDb();
      loadCustomerProfilesCount();
    }, 2000);

    return () => clearInterval(pollTimer);
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
        // Guarantee newest leads are ALWAYS sorted at the very top
        const sorted = [...data.leads].sort((a, b) => {
          const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });

        if (isInitialLeadFetchRef.current) {
          sorted.forEach(l => {
            if (l.id) knownLeadIdsRef.current.add(l.id);
          });
          isInitialLeadFetchRef.current = false;
        } else {
          // Detect newly arrived leads
          const incoming = [];
          sorted.forEach(l => {
            if (l.id && !knownLeadIdsRef.current.has(l.id)) {
              knownLeadIdsRef.current.add(l.id);
              incoming.push(l);
            }
          });

          if (incoming.length > 0) {
            // Prepend new leads to persistent notification alerts (NO AUTO-HIDE!)
            setNewLeadAlerts(prev => [...incoming, ...prev]);
            playLeadAlertSound();
          }
        }

        setLeads(sorted);
      }
    } catch (e) {
      console.warn('MongoDB leads fallback:', e);
    }
  };

  const [quotationsList, setQuotationsList] = useState(() => {
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

  const loadQuotations = async () => {
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (data.success && Array.isArray(data.quotations)) {
        setQuotationsList(data.quotations);
        try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(data.quotations)); } catch (e) {}
      }
    } catch (e) {}
  };

  const [customersList, setCustomersList] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rbpl_cached_customers');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { }
    }
    return [];
  });

  const loadCustomerProfilesCount = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomersList(data.customers);
        setCustomerProfilesCount(data.customers.length);
        try { localStorage.setItem('rbpl_cached_customers', JSON.stringify(data.customers)); } catch (e) { }
      }
    } catch (err) {
      console.warn('Customer profiles count err:', err);
    }
  };

  // Check if a lead's customer profile is complete (ALL 8 fields must be non-empty)
  const isLeadProfileComplete = (lead) => {
    if (!lead) return false;

    const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || lead.rawLeadData?.phone || '').replace(/\D/g, '').slice(-10);
    const emailClean = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').trim().toLowerCase();

    // Check matched customer from registered customer directory
    const matched = customersList.find(c => {
      const cPhone = (c.phone || '').replace(/\D/g, '').slice(-10);
      const cEmail = (c.email || '').trim().toLowerCase();
      return (phoneClean && cPhone && phoneClean === cPhone) || (emailClean && cEmail && emailClean === cEmail);
    });

    const raw = lead.rawLeadData || {};

    const fullName = (matched?.fullName || lead.doctorName || raw.customerName || lead.customerName || '').trim();
    const phone = (matched?.phone || lead.phone || lead.customerPhone || raw.customerPhone || raw.phone || '').replace(/\D/g, '');
    const email = (matched?.email || lead.email || lead.customerEmail || raw.customerEmail || '').trim();
    const hospital = (matched?.hospitalName || lead.hospital || raw.hospitalName || lead.hospitalName || '').trim();
    const state = (matched?.state || lead.state || raw.state || '').trim();
    const district = (matched?.district || lead.city || raw.district || lead.district || '').trim();
    const address = (matched?.address || lead.address || raw.address || lead.deliveryAddress || '').trim();
    const pincode = (matched?.pincode || lead.pincode || raw.pincode || '').toString().trim();

    const isGenericHosp = !hospital || [
      'clinic / hospital',
      'healthcare facility',
      'general hospital',
      'hospital',
      'healthcare institution',
      'customer hospital / lab',
      'customer hospital / diagnostic lab'
    ].some(g => hospital.toLowerCase() === g || hospital.toLowerCase().includes('healthcare institution'));

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

  const handleDeleteLead = async (leadId) => {
    if (!confirm(`Are you sure you want to remove inquiry ${leadId}?`)) return;
    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(leadId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        knownLeadIdsRef.current.delete(leadId);
        setNewLeadAlerts(prev => prev.filter(a => a.id !== leadId));
      }
    } catch (e) {
      console.error('Delete lead err:', e);
    }
  };

  const isRecentLead = (lead) => {
    if (!lead) return false;
    if (newLeadAlerts.some(a => a.id === lead.id)) return true;
    if (lead.createdAt) {
      const diff = Date.now() - new Date(lead.createdAt).getTime();
      return diff >= 0 && diff < 3 * 3600 * 1000; // Received within last 3 hours
    }
    return false;
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

  const rawFilteredLeads = [...leads]
    .filter(l => {
      if (leadFilterDomain !== 'all' && l.siteDomain !== leadFilterDomain) {
        return false;
      }
      if (activeDistrictFilter && activeDistrictFilter !== 'all' && activeDistrictFilter !== 'All Districts / Pan-India HQ' && activeDistrictFilter !== 'All India (National HQ)' && activeDistrictFilter !== 'All India (HQ)') {
        const target = activeDistrictFilter.toLowerCase().trim();
        const lState = (l.state || l.rawLeadData?.state || '').toLowerCase().trim();
        const lDist = (l.district || l.rawLeadData?.district || '').toLowerCase().trim();
        const lCity = (l.city || l.rawLeadData?.city || '').toLowerCase().trim();
        const locCombined = `${l.district || ''} ${l.city || ''} ${l.hospital || ''} ${l.address || ''} ${l.state || ''} ${l.rawLeadData?.state || ''} ${l.rawLeadData?.district || ''} ${l.rawLeadData?.hospitalName || ''}`.toLowerCase();

        // 1. Direct state match
        if (lState && (lState === target || lState.includes(target) || target.includes(lState))) {
          return true;
        }

        // 2. Combined location match
        if (locCombined.includes(target)) {
          return true;
        }

        // 3. Known Rajasthan districts / cities
        if (target === 'rajasthan') {
          const rajCities = ['jaipur', 'jodhpur', 'udaipur', 'kota', 'bikaner', 'ajmer', 'alwar', 'bhilwara', 'sikar', 'bharatpur', 'pali', 'ganganagar', 'barmer', 'banswara'];
          if (rajCities.includes(lCity) || rajCities.includes(lDist)) {
            return true;
          }
        }

        // 4. Known Maharashtra districts
        if (target === 'maharashtra') {
          const mhCities = ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'thane'];
          if (mhCities.includes(lCity) || mhCities.includes(lDist)) {
            return true;
          }
        }

        // 5. Known Karnataka districts
        if (target === 'karnataka') {
          const kaCities = ['bengaluru', 'bangalore', 'mysuru', 'mysore', 'hubballi', 'mangalore'];
          if (kaCities.includes(lCity) || kaCities.includes(lDist)) {
            return true;
          }
        }

        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

  // Strict Deduplication: Same customer phone + equipment only displays ONCE (latest entry)
  const seenTableCustEquip = new Set();
  const seenTableIds = new Set();
  const filteredLeads = [];
  for (const l of rawFilteredLeads) {
    const id = l.id || l._id;
    if (!id || seenTableIds.has(id)) continue;
    const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
    const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
    const key = p && eq ? `${p}::${eq}` : id;
    if (seenTableCustEquip.has(key)) continue;
    seenTableIds.add(id);
    seenTableCustEquip.add(key);
    filteredLeads.push(l);
  }

  const totalPipelineVal = filteredLeads.reduce((acc, l) => {
    const num = parseInt((l.amount || l.quoteAmount || '0').replace(/[^0-9]/g, '')) || 0;
    return acc + num;
  }, 0);
  const formattedPipeline = totalPipelineVal > 0
    ? `₹${(totalPipelineVal >= 10000000 ? (totalPipelineVal / 10000000).toFixed(2) + ' Cr' : (totalPipelineVal / 100000).toFixed(2) + ' L')}`
    : '₹0.00';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold tracking-wide text-slate-600">Authenticating Raj Biosis Portal...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen initialMode="login" redirectTo="/" />;
  }

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

            {/* Registered Customer Profiles (Stored Separately with Edit Tracking) */}
            <button
              onClick={() => setActiveTab('customers')}
              title={`Registered Customer Profiles (${customerProfilesCount})`}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'customers'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Users size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Registered Profiles</span>}
              </span>
              {isSidebarCollapsed ? (
                customerProfilesCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-white"></span>
                )
              ) : (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full">
                  {customerProfilesCount}
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
          </nav>
        </div>

        {/* Active User Session Docked at Bottom of Sidebar */}
        {user && (
          <div className={`p-3 border-t border-slate-100 mt-auto bg-slate-50/70 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-2' : 'justify-between gap-2'} w-full`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-sm shadow-2xs shrink-0">
                  {user.avatar || '👑'}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-sky-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                      <span>{user.roleBadge || user.role}</span>
                      <span>•</span>
                      <span className="text-slate-500 flex items-center gap-0.5"><MapPin size={9} />{user.state || user.district || "Rajasthan"}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out of Portal"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0"
              >
                <LogOut size={isSidebarCollapsed ? 15 : 13} />
              </button>
            </div>
          </div>
        )}
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
              {activeTab === 'users' && (
                <>
                  <span>Biomedical Team & Sales Territory Roles</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    Active Directory
                  </span>
                </>
              )}
              {activeTab === 'leads' && (
                <>
                  <span className="truncate">Quotation Desk</span>
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs shrink-0">
                    {filteredLeads.length} Inquiries
                  </span>
                </>
              )}


              {activeTab === 'customers' && (
                <>
                  <span>Registered Customer Profiles</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {customerProfilesCount} Accounts
                  </span>
                </>
              )}
              {activeTab === 'marketing' && 'Multi-Brand Email Marketing Hub (Raj Biosis, Human & Global Bio)'}
              {activeTab === 'website' && 'Website & Home Page CMS Builder'}
              {activeTab === 'products' && (
                <>
                  <span>Catalog Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-sky-50 text-sky-700 border border-sky-200">
                    Live Synced
                  </span>
                </>
              )}
              {activeTab === 'quotation' && (
                <>
                  <span>Web Quotation</span>

                </>
              )}
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

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? "Lead Chime Sound: ON (Click to Mute)" : "Lead Chime Sound: MUTED (Click to Enable)"}
              className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${isSoundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
            >
              {isSoundEnabled ? <Volume2 size={15} className="text-emerald-600 shrink-0" /> : <VolumeX size={15} className="text-slate-400 shrink-0" />}
              <span className="text-[11px] font-bold">{isSoundEnabled ? 'Alert Chime ON' : 'Alert Chime OFF'}</span>
            </button>


            {/* Global District & Territory Filter Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-xl shadow-2xs">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500">State:</span>
              <select
                value={activeDistrictFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All India (National HQ)</option>
                {user?.state && user.state !== 'All India (HQ)' && user.state !== 'All India (Pan-India HQ)' && (
                  <option value={user.state}>⭐ My State ({user.state})</option>
                )}
                <option disabled>──────────</option>
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition cursor-pointer shadow-2xs"
              >
                <span className="text-base w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {user?.avatar || '👑'}
                </span>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold leading-none truncate">
                    {user?.roleBadge || user?.role || 'Staff'}
                  </div>
                </div>
                <ChevronRight size={12} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-90' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                    <span className="text-2xl p-1 bg-slate-100 rounded-2xl">{user?.avatar || '👑'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        <ShieldCheck size={11} /> {user?.roleBadge || user?.role}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Assigned State:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin size={11} className="text-rose-500" /> {user?.state || user?.district || "Rajasthan"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="font-semibold text-slate-700">+91 {user?.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Organization:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{user?.organization}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('users');
                      }}
                      className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                    >
                      Manage Team Roles
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              Host: <span className="text-slate-700 font-semibold">rajbiosis.com</span>
            </div>
          </div>
        </header>

        {/* Persistent New Lead Notification Alert (DOES NOT AUTO-HIDE AS REQUESTED) */}
        {newLeadAlerts.length > 0 && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 shadow-md shadow-rose-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black tracking-wide bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                    🚨 New Lead Received ({newLeadAlerts.length})
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {newLeadAlerts[0].doctorName || newLeadAlerts[0].customerName || 'Hospital Purchase Lead'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {newLeadAlerts[0].hospital || newLeadAlerts[0].hospitalName || 'Healthcare Facility'}
                  </span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-rose-200 text-rose-800 font-bold">
                    {newLeadAlerts[0].equipment || newLeadAlerts[0].productName || 'Biomedical Equipment'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {newLeadAlerts[0].quoteAmount || newLeadAlerts[0].amount || '₹0'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                  <span>Phone: <strong className="font-mono text-slate-900">{newLeadAlerts[0].phone || '-'}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="font-mono text-sky-700">{newLeadAlerts[0].siteDomain || 'rajbiosis.com'}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold inline-flex items-center gap-1 font-mono">
                    ⏱️ Closing in {alertCountdown}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
              {newLeadAlerts[0]?.isPriceNegotiated && newLeadAlerts[0]?.negotiationStatus === 'pending_approval' ? (
                !isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleRequestAdminApproval(newLeadAlerts[0])}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Price discount requires Admin approval"
                  >
                    <Lock size={13} className="text-amber-100" />
                    <span>Request Admin Approval</span>
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
                        ? `Make Quotation (Approved: ₹${(newLeadAlerts[0].approvedPrice || newLeadAlerts[0].price)?.toLocaleString('en-IN')})`
                        : newLeadAlerts[0]?.negotiationStatus === 'counter_offered'
                          ? `Make Quotation (Counter: ₹${(newLeadAlerts[0].adminCounterPrice || newLeadAlerts[0].price)?.toLocaleString('en-IN')})`
                          : 'Make Quotation'}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('leads');
                  setNewLeadAlerts([]);
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Leads</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => setNewLeadAlerts([])}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition cursor-pointer border border-slate-200/60"
                title="Dismiss this notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

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
            </div>) : activeTab === 'leads' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Hospital RFQs & Leads</span>
                    <span className="text-2xl font-bold text-slate-800">{filteredLeads.length} <span className="text-xs font-semibold text-emerald-600">{filteredLeads.length > 0 ? 'Live Inquiries' : 'No Inquiries Yet'}</span></span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Direct MongoDB RFQ Inquiries</span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Inbox size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-sm transition flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Quotation Pipeline</span>
                    <span className="text-2xl font-bold text-slate-800">{formattedPipeline}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{filteredLeads.length} Active Quotes In Pipeline</span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <FileText size={22} />
                  </div>
                </div>
              </div>
            ) : null}

          {/* =========================================================================
              TAB 2: CENTRAL LEADS & RFQ INQUIRIES DESK
              ========================================================================= */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden space-y-4">
              {/* Filter & Subtab Bar */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Desk Mode Switcher */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-slate-800 shadow-xs"
                    >
                      📋 Hospital RFQs & Leads ({filteredLeads.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('customers')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>👥 Registered Profiles ({customerProfilesCount})</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-400">Website:</label>
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
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadLeadsFromDb()}
                    className="text-xs py-1.5 px-3 bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    title="Refresh leads list"
                  >
                    <RefreshCw size={13} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," +
                        ["Ref,Date,Website,Hospital,Doctor,Phone,Equipment,Amount,Status"]
                          .concat(filteredLeads.map(l => `"${l.id}","${l.date || ''}","${l.siteDomain || ''}","${(l.hospital || '').replace(/"/g, '""')}","${(l.doctorName || l.contact || '').replace(/"/g, '""')}","${l.phone || ''}","${(l.equipment || '').replace(/"/g, '""')}","${(l.quoteAmount || l.amount || '').replace(/"/g, '""')}","${l.status || ''}"`))
                          .join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `Hospital_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs py-1.5 px-3 bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Leads Table - Always Sorted Newest First */}
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
                      filteredLeads.map((lead) => {
                        const isRecent = isRecentLead(lead);
                        const phoneClean = (lead.phone || '').replace(/\D/g, '');
                        return (
                          <tr key={lead.id} className={`transition ${isRecent ? 'bg-amber-50/50 hover:bg-amber-50/80' : 'hover:bg-sky-50/30'}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800 block">{lead.id}</span>
                                {isRecent && (
                                  <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (lead.date || 'Recent'))}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 font-mono text-[11px] font-medium">
                                {lead.siteDomain || 'rajbiosis.com'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                                <span>{lead.hospital || lead.hospitalName || 'Healthcare Facility'}</span>
                                {isLeadProfileComplete(lead) ? (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                                    Profile Complete
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                    Profile Incomplete
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600 font-medium block">
                                {lead.doctorName || lead.customerName || lead.contact || 'Medical Representative'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{lead.phone || lead.mobile || '-'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-800 font-medium">
                                {lead.equipment || lead.productName || 'Biomedical Equipment'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
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
                                      <span>Request Admin Approval</span>
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
                                          ? `Make Quotation (Approved: ₹${(lead.approvedPrice || lead.price)?.toLocaleString('en-IN')})`
                                          : lead.negotiationStatus === 'counter_offered'
                                            ? `Make Quotation (Counter: ₹${(lead.adminCounterPrice || lead.price)?.toLocaleString('en-IN')})`
                                            : lead.quotationRef
                                              ? `View Stamped PDF (${lead.quotationRef})`
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
                                      href={`tel:${lead.phone}`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-xs"
                                      title="Call Direct"
                                    >
                                      <PhoneCall size={12} />
                                      <span>Call</span>
                                    </a>
                                    {phoneClean && (
                                      <a
                                        href={`https://wa.me/91${phoneClean.slice(-10)}?text=${encodeURIComponent(`Hello Dr. ${lead.doctorName || lead.customerName || ''}, regarding your quotation inquiry for ${lead.equipment || 'hospital equipment'} with Raj Biosis:`)}`}
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
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: REGISTERED CUSTOMER PROFILES & HOSPITAL DIRECTORY
              ========================================================================= */}
          {/* =========================================================================
              TAB: TEAM & SALES TERRITORY ROLES (RBAC)
              ========================================================================= */}
          {activeTab === 'users' && (
            <UserRoleManager />
          )}

          {activeTab === 'customers' && (
            <CustomerProfilesManager initialCustomers={customersList} onRefreshNeeded={loadCustomerProfilesCount} />
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
            <WebQuotationManager products={PRODUCTS} initialLeads={leads} initialQuotations={quotationsList} initialCustomers={customersList} />
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
          {/* Price Negotiation Review Modal for Admin */}
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
                              Authorize customer target price for institutional sale. The updated price will reflect on the quotation and customer view.
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
                              <span>🤝 Option B: Propose Authorized In-Between Rate</span>
                            </h4>
                            <p className="text-[11px] text-indigo-800 mt-0.5">
                              If customer expected price is below viable margin, propose an authorized in-between rate for sales quotation generation.
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
            <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 max-w-sm flex items-start gap-3">
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
    </div>
  );
}