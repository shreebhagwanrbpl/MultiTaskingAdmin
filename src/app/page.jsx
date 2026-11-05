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
  AlertTriangle,
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
  Lock,
  Archive,
  RotateCcw,
  ShoppingCart,
  Gift
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCatalogManager from './components/ProductCatalogManager';
import WebsiteHomepageManager from './components/WebsiteHomepageManager';
import WebQuotationManager from './components/WebQuotationManager';
import CustomerProfilesManager from './components/CustomerProfilesManager';
import UserRoleManager from './components/UserRoleManager';
import ExecutiveOverviewDashboard from './components/ExecutiveOverviewDashboard';
import DeletedRecordsManager from './components/DeletedRecordsManager';
import CartWatchlistManager from './components/CartWatchlistManager';
import AuthScreen from './components/AuthScreen';
import { useAuth } from '../lib/AuthContext';
import { ALL_INDIAN_STATES, POPULAR_DISTRICT_HUBS } from '../data/indianDistricts';
import {
  isPushNotificationSupported,
  getPushPermissionStatus,
  requestPushPermission,
  triggerSystemPushNotification,
  playPushNotificationSound
} from '../lib/pushNotifications';
import { getLeadTimestamp, stableLeadSort } from '../lib/leadUtils';

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
    if (searchParams?.tab === 'leads') return 'quotation';
    if (searchParams?.tab && ['overview', 'customers', 'website', 'products', 'quotation', 'cart_watchlist', 'marketing', 'users', 'deleted'].includes(searchParams.tab)) {
      return searchParams.tab;
    }
    // 2. Check window location or localStorage on client
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        const storedTab = window.localStorage.getItem('admin_active_tab');
        const chosen = urlTab || storedTab;
        if (chosen === 'leads') return 'quotation';
        if (chosen && ['overview', 'customers', 'website', 'products', 'quotation', 'cart_watchlist', 'marketing', 'users', 'deleted'].includes(chosen)) {
          return chosen;
        }
      } catch (e) { }
    }
    return 'overview';
  };

  const [activeTab, setActiveTabRaw] = useState(resolveInitialTab);
  const [activeQuotationDeskTab, setActiveQuotationDeskTab] = useState('leads');
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
  const [adminFloorInput, setAdminFloorInput] = useState('');
  const [adminCustomerBidInput, setAdminCustomerBidInput] = useState('');
  const [toastNotification, setToastNotification] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 2500);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Sync sidebar active state with quotation desk tabs
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e?.detail) setActiveQuotationDeskTab(e.detail);
    };
    window.addEventListener('switch_web_quotation_tab', handleSwitch);
    window.addEventListener('reset_web_quotation_tab', handleSwitch);
    return () => {
      window.removeEventListener('switch_web_quotation_tab', handleSwitch);
      window.removeEventListener('reset_web_quotation_tab', handleSwitch);
    };
  }, []);



  const openNegotiationModal = (lead) => {
    if (!lead) return;
    setNegotiationModalLead(lead);
    const actual = lead.actualPrice || 150000;
    const expected = lead.customerRevisedBid || lead.expectedPrice || lead.price || 120000;
    const approved = lead.lockedApprovedPrice || lead.approvedPrice || actual;
    const midpoint = Math.round((actual + expected) / 2);
    setCounterPriceInput(lead.adminCounterPrice ? String(lead.adminCounterPrice) : String(midpoint));
    setCounterNoteInput(lead.adminNote || 'Approved in-between institutional offer with warranty.');
    setAdminFloorInput(String(lead.lockedApprovedPrice || lead.approvedPrice || actual));
    setAdminCustomerBidInput(String(lead.customerRevisedBid || (lead.expectedPrice && approved > lead.expectedPrice ? lead.expectedPrice : Math.max(0, approved - 500))));
  };

  const handleLockFloorWithComplimentary = async (lead, floorVal, bargainedVal, noteVal) => {
    if (!lead) return;
    const floor = parseFloat(floorVal || 0);
    const bargained = parseFloat(bargainedVal || 0);
    const compGap = Math.max(0, floor - bargained);

    if (!floor || !bargained || compGap <= 0) {
      alert('Deal floor price must be greater than customer demanded base equipment price to allocate complimentary budget.');
      return;
    }

    setNegotiationSubmitting(true);
    try {
      const numQty = parseInt(String(lead.quantity || '1').replace(/\D/g, ''), 10) || 1;
      const totalAmount = floor * numQty;

      const updateData = {
        id: lead.id,
        _id: lead._id,
        isPriceNegotiated: true,
        negotiationStatus: 'approved',
        lockedApprovedPrice: floor,
        customerRevisedBid: bargained,
        approvedPrice: bargained,
        price: bargained,
        allowedComplementaryBudget: compGap,
        quoteAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
        estimatedValue: totalAmount,
        adminNote: noteVal || `Deal floor locked at ₹${floor.toLocaleString('en-IN')} with ₹${compGap.toLocaleString('en-IN')} complimentary perk.`,
        approvedBy: user?.name || user?.email || 'Admin',
        approvedAt: new Date().toISOString(),
        status: `Floor Locked ₹${floor.toLocaleString('en-IN')} (+₹${compGap.toLocaleString('en-IN')} Comp)`
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
        title: 'Deal Floor Locked with Complimentary Perk!',
        message: `Deal locked at ₹${floor.toLocaleString('en-IN')} with ₹${compGap.toLocaleString('en-IN')} complimentary budget for ${lead.hospital || lead.equipment}.`
      });

      if (typeof window !== 'undefined') {
        try {
          const channel = new BroadcastChannel('rbpl_system_notifications');
          channel.postMessage({
            type: 'lead_deal_floor_approved',
            lead: { ...lead, ...updateData },
            timestamp: Date.now()
          });
          channel.close();
        } catch (e) {}
      }
      setNegotiationModalLead(null);
    } catch (err) {
      console.error('Lock floor error:', err);
      alert('Error locking floor price: ' + err.message);
    } finally {
      setNegotiationSubmitting(false);
    }
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

      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'customer_expected_price',
        approvedAmount: approvedAmount,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
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

      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'in_between_rate',
        approvedAmount: numPrice,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
      });
      setNegotiationModalLead(null);
    } catch (err) {
      console.error('Counter price error:', err);
      alert('Error setting counter price: ' + err.message);
    } finally {
      setNegotiationSubmitting(false);
    }
  };

  const handleRequestAdminApproval = async (lead) => {
    if (!lead) return;
    const leadId = lead.id || lead._id;
    const updateData = {
      id: leadId,
      _id: lead._id,
      isPriceNegotiated: true,
      negotiationStatus: 'pending_approval',
      approvalRequestedAt: new Date().toISOString(),
      approvalRequestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
    };
    try {
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    } catch (e) {}
    setLeads(prev => prev.map(l => (l.id === leadId || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

    // Trigger Native Push Notification with Sound
    triggerSystemPushNotification({
      title: `🏷️ Price Approval Requested - ${lead.hospital || lead.customerName || 'Customer'}`,
      body: `Target Bid ₹${Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')} requested for ${lead.equipment || 'Equipment'}. Awaiting Admin authorization.`,
      tag: `lead-bargain-${leadId}`,
      onClick: () => {
        if (typeof window !== 'undefined') window.focus();
      }
    });

    broadcastSystemNotification({
      type: 'lead_bargain_requested',
      targetRole: 'admin',
      lead: { ...lead, ...updateData },
      requestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
    });
    setToastNotification({
      title: 'Admin Approval Request Submitted',
      message: `Price approval request sent to Admin for ₹${(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}.`
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
        let chosen = urlTab || (searchParams?.tab) || storedTab;
        if (chosen === 'leads') chosen = 'quotation';
        if (chosen && ['overview', 'customers', 'website', 'products', 'quotation', 'cart_watchlist', 'marketing', 'users', 'deleted'].includes(chosen)) {
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
        let urlTab = urlParams.get('tab');
        if (urlTab === 'leads') urlTab = 'quotation';
        if (urlTab && ['overview', 'customers', 'website', 'products', 'quotation', 'cart_watchlist', 'marketing', 'users', 'deleted'].includes(urlTab)) {
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

  // Inquiries Checkbox Selection & Permanent Deletion States
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [deleteModalData, setDeleteModalData] = useState({ isOpen: false, leadIds: [], leadsInfo: [] });
  const [isDeletingLeads, setIsDeletingLeads] = useState(false);

  // New Lead Alert System with 4-second Auto-Dismiss Timer
  const [newLeadAlerts, setNewLeadAlerts] = useState([]);
  const [alertCountdown, setAlertCountdown] = useState(4);
  const alertTimerRef = React.useRef(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const knownLeadIdsRef = React.useRef(new Set());
  const knownLeadNegotiationStatusRef = React.useRef(new Map());
  const isInitialLeadFetchRef = React.useRef(true);

  // Real-Time Quotation Concession Alerts (Admin & Sales)
  const [quotationAlerts, setQuotationAlerts] = useState([]);
  const [quotationApprovedAlerts, setQuotationApprovedAlerts] = useState([]);
  const knownQuoteConcessionsRef = React.useRef(new Map());
  const isInitialQuoteFetchRef = React.useRef(true);
  const [pushPermission, setPushPermission] = useState('default');

  // Push Notification Permission check on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = getPushPermissionStatus();
      setPushPermission(status);
      if (status === 'default') {
        requestPushPermission().then(res => setPushPermission(res));
      }
    }
  }, []);

  const handleTogglePushNotifications = async () => {
    const status = await requestPushPermission();
    setPushPermission(status);
    if (status === 'granted') {
      triggerSystemPushNotification({
        title: '🔔 Desktop Push Alerts Active',
        body: 'You will now receive native desktop notifications even when working on other applications or tabs.',
        soundVariant: 'success'
      });
      setToastNotification({
        type: 'success',
        title: 'Push Notifications Enabled',
        message: 'Real-time OS desktop alerts are now active!'
      });
    } else if (status === 'denied') {
      alert('Desktop notifications are currently blocked in your browser. Please click the site settings / padlock icon in your address bar to allow notifications.');
    }
  };

  const handleNavigateToConcessionReview = (quote) => {
    if (!quote) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('active_concession_quote', JSON.stringify({ ...quote, openReviewModal: true }));
        window.dispatchEvent(new CustomEvent('open_concession_review', { detail: { quote, openReviewModal: true } }));
      } catch (e) {}
    }
    setActiveTab('quotation');
    setQuotationAlerts(prev => prev.filter(x => (x.refNo || x.id) !== (quote.refNo || quote.id)));
  };

  const handleNavigateToConcessionRevision = (quote) => {
    if (!quote) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('active_concession_quote', JSON.stringify({ ...quote, openRevision: true }));
        window.dispatchEvent(new CustomEvent('open_concession_review', { detail: { quote, openRevision: true } }));
      } catch (e) {}
    }
    setActiveTab('quotation');
    setQuotationApprovedAlerts(prev => prev.filter(x => (x.refNo || x.id) !== (quote.refNo || quote.id)));
  };

  // Cross-Tab & Cross-Process System Notifications Broadcast Listener (Continuous Bidirectional Connection)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const processedEvents = new Set();

    const handleIncomingNotification = (data) => {
      if (!data || !data.type) return;
      const eventKey = `${data.type}-${data.id || data.timestamp || ''}-${data.lead?.id || data.quote?.refNo || ''}`;
      if (processedEvents.has(eventKey)) return;
      processedEvents.add(eventKey);
      setTimeout(() => processedEvents.delete(eventKey), 5000);

      // 1. Sales -> Admin: Quotation Concession Requested
      if (data.type === 'quotation_concession_requested') {
        const q = data.quote;
        triggerSystemPushNotification({
          title: '⚠️ Price Concession Approval Required',
          body: `Sales rep ${data.requestedBy || q?.concessionRequestedBy || 'Sales'} requested price drop for ${q?.customerName || 'Customer'} (Ref: ${q?.refNo}). Demanded: ₹${Number(q?.customerDemandedPrice || 0).toLocaleString('en-IN')} (Gap: ₹${Number(q?.concessionGap || 0).toLocaleString('en-IN')}). Click to review & decide.`,
          tag: `quote-concession-${q?.refNo || q?.id}`,
          onClick: () => handleNavigateToConcessionReview(q)
        });
      }
      // 2. Admin -> Sales: Quotation Concession Authorized (Direct Discount or Complimentary Perk)
      else if (data.type === 'quotation_concession_approved') {
        const q = data.quote;
        const isDirect = q?.concessionStatus === 'approved_direct_discount';
        triggerSystemPushNotification({
          title: isDirect ? '🎉 Quotation Concession Approved (Direct Discount)' : '🎁 Quotation Concession Approved (Complimentary Perk)',
          body: `Admin approved concession for ${q?.customerName || 'Customer'} (${q?.refNo}). ${isDirect ? `Deal price reduced to ₹${Number(q?.approvedDealPrice || 0).toLocaleString('en-IN')}.` : `₹${Number(q?.allowedComplementaryBudget || 0).toLocaleString('en-IN')} complimentary perk authorized.`} Click to issue Revision 2.`,
          tag: `quote-approved-${q?.refNo || q?.id}`,
          onClick: () => handleNavigateToConcessionRevision(q)
        });
      }
      // 3. Sales -> Admin: Lead Price Bargain Requested (From REQUEST ADMIN APPROVAL button)
      else if (data.type === 'lead_bargain_requested') {
        const l = data.lead;
        setNewLeadAlerts(prev => [l, ...prev.filter(x => x.id !== l?.id)]);
        triggerSystemPushNotification({
          title: '🏷️ Lead Price Approval Requested!',
          body: `Sales rep ${data.requestedBy || 'Sales'} requested price approval for ${l?.hospital || l?.doctorName || l?.customerName || 'Customer'} (${l?.equipment || l?.productName || 'Equipment'}). Target Bid: ₹${Number(l?.expectedPrice || l?.price || 0).toLocaleString('en-IN')}. Click to review & decide.`,
          tag: `lead-bargain-${l?.id}`,
          onClick: () => openNegotiationModal(l)
        });
      }
      // 4. Admin -> Sales: Lead Deal Floor Approved (From Biomedical Equipment Price Approval Desk)
      else if (data.type === 'lead_deal_floor_approved') {
        const l = data.lead;
        const isExpected = data.approvalType === 'customer_expected_price' || l?.negotiationStatus === 'approved';
        const approvedVal = data.approvedAmount || l?.approvedPrice || l?.expectedPrice || l?.price || 0;
        triggerSystemPushNotification({
          title: isExpected ? '✅ Customer Expected Price Authorized!' : '🤝 In-Between Counter Rate Authorized!',
          body: `Admin approved ₹${Number(approvedVal).toLocaleString('en-IN')} for ${l?.hospital || l?.doctorName || l?.customerName || 'Customer'} (${l?.equipment || l?.productName || 'Equipment'}). Ready to create quotation!`,
          tag: `lead-approved-${l?.id}`,
          onClick: () => {
            if (typeof window !== 'undefined' && l) {
              try {
                localStorage.setItem('active_quotation_lead', JSON.stringify(l));
              } catch (err) {}
            }
            setActiveTab('quotation');
          }
        });
      }
    };

    let channel = null;
    try {
      channel = new BroadcastChannel('rbpl_system_notifications');
      channel.onmessage = (e) => handleIncomingNotification(e.data);
    } catch (err) {}

    const storageHandler = (e) => {
      if (e.key === 'rbpl_push_event_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleIncomingNotification(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      if (channel) try { channel.close(); } catch (e) {}
      window.removeEventListener('storage', storageHandler);
    };
  }, [isAdmin]);

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
    loadDeletedRecordsCount();
    loadCartWatchlistCount();

    // Periodic 2-second polling to capture incoming leads, quotations, and concessions
    const pollTimer = setInterval(() => {
      loadLeadsFromDb();
      loadQuotations();
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
        // Guarantee newest leads are ALWAYS sorted at the very top (100% deterministic & stable)
        const sorted = [...data.leads].sort(stableLeadSort);

        if (isInitialLeadFetchRef.current) {
          sorted.forEach(l => {
            if (l.id) {
              knownLeadIdsRef.current.add(l.id);
              knownLeadNegotiationStatusRef.current.set(l.id, l.negotiationStatus || 'none');
            }
          });
          isInitialLeadFetchRef.current = false;
        } else {
          // 1. Detect newly arrived leads
          const incoming = [];
          sorted.forEach(l => {
            if (l.id && !knownLeadIdsRef.current.has(l.id)) {
              knownLeadIdsRef.current.add(l.id);
              knownLeadNegotiationStatusRef.current.set(l.id, l.negotiationStatus || 'none');
              incoming.push(l);
            }
          });

          if (incoming.length > 0) {
            setNewLeadAlerts(prev => [...incoming, ...prev]);
            const first = incoming[0];
            triggerSystemPushNotification({
              title: `🔔 New Web RFQ Lead Received! (${incoming.length})`,
              body: `${first.doctorName || first.customerName || 'Hospital Purchase Officer'} from ${first.hospital || first.city || 'Healthcare Facility'} inquired for ${first.equipment || first.productName || 'Biomedical Equipment'}. Click to create quotation.`,
              tag: `lead-${first.id}`,
              onClick: () => {
                if (typeof window !== 'undefined' && first) {
                  try {
                    localStorage.setItem('active_quotation_lead', JSON.stringify(first));
                  } catch (e) {}
                }
                setActiveTab('quotation');
                setNewLeadAlerts([]);
              }
            });
          }

          // 2. Detect lead price negotiation status changes (Sales requested Admin approval!)
          sorted.forEach(l => {
            if (!l.id) return;
            const prevStatus = knownLeadNegotiationStatusRef.current.get(l.id) || 'none';
            const curStatus = l.negotiationStatus || 'none';

            if (prevStatus !== curStatus) {
              knownLeadNegotiationStatusRef.current.set(l.id, curStatus);

              // Concession / Price approval requested by Sales -> Alert Admin with Push & Sound!
              if (curStatus === 'pending_approval' && prevStatus !== 'pending_approval') {
                setNewLeadAlerts(prev => [l, ...prev.filter(x => x.id !== l.id)]);
                triggerSystemPushNotification({
                  title: '🏷️ Lead Price Approval Requested!',
                  body: `Sales rep requested price approval for ${l.hospital || l.doctorName || 'Customer'} (${l.equipment || 'Equipment'}). Target Bid: ₹${Number(l.expectedPrice || l.price || 0).toLocaleString('en-IN')}. Click to review & decide.`,
                  tag: `lead-bargain-${l.id}`,
                  onClick: () => openNegotiationModal(l)
                });
              }
              // Admin authorized price -> Alert Sales!
              else if ((curStatus === 'approved' || curStatus === 'counter_offered') &&
                       prevStatus !== 'approved' && prevStatus !== 'counter_offered') {
                const isExpected = curStatus === 'approved';
                const approvedAmt = l.approvedPrice || l.adminCounterPrice || l.expectedPrice || l.price || 0;
                triggerSystemPushNotification({
                  title: isExpected ? '✅ Customer Expected Price Authorized!' : '🤝 In-Between Counter Offer Authorized!',
                  body: `Admin approved ₹${Number(approvedAmt).toLocaleString('en-IN')} for ${l.hospital || l.doctorName || 'Customer'} (${l.equipment || 'Equipment'}). Ready to create quotation!`,
                  tag: `lead-approved-${l.id}`,
                  onClick: () => {
                    try {
                      localStorage.setItem('active_quotation_lead', JSON.stringify(l));
                    } catch (e) {}
                    setActiveTab('quotation');
                  }
                });
              }
            }
          });
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
      } catch (e) { }
    }
    return [];
  });

  const [deletedRecordsCount, setDeletedRecordsCount] = useState(0);
  const [cartTotalBadge, setCartTotalBadge] = useState(0);

  const loadCartWatchlistCount = async () => {
    try {
      const res = await fetch('/api/cart-watchlist');
      const data = await res.json();
      if (data.success && Array.isArray(data.carts)) {
        let count = 0;
        data.carts.forEach(c => {
          count += (c.cart || []).length;
        });
        setCartTotalBadge(count || data.carts.length);
      }
    } catch (e) {}
  };

  const loadDeletedRecordsCount = async () => {
    try {
      const res = await fetch('/api/deleted-records');
      const data = await res.json();
      if (data.success && typeof data.count === 'number') {
        setDeletedRecordsCount(data.count);
      }
    } catch (e) { }
  };

  const loadQuotations = async () => {
    try {
      const res = await fetch('/api/quotations');
      const data = await res.json();
      if (data.success && Array.isArray(data.quotations)) {
        const quotes = data.quotations;
        setQuotationsList(quotes);
        try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(quotes)); } catch (e) { }

        if (isInitialQuoteFetchRef.current) {
          isInitialQuoteFetchRef.current = false;
          quotes.forEach(q => {
            const key = q.refNo || q.id || q._id;
            knownQuoteConcessionsRef.current.set(key, q.concessionStatus || 'none');
          });
        } else {
          // Compare previous status vs newly fetched status to trigger real-time notifications
          quotes.forEach(q => {
            const key = q.refNo || q.id || q._id;
            const prevStatus = knownQuoteConcessionsRef.current.get(key) || 'none';
            const newStatus = q.concessionStatus || 'none';

            if (prevStatus !== newStatus) {
              knownQuoteConcessionsRef.current.set(key, newStatus);

              // Concession Requested -> Alert Admin!
              if (newStatus === 'concession_requested' && prevStatus !== 'concession_requested') {
                setQuotationAlerts(prev => [q, ...prev.filter(x => (x.refNo || x.id) !== key)]);
                triggerSystemPushNotification({
                  title: '⚠️ Price Concession Approval Required',
                  body: `Quotation ${q.refNo} for ${q.customerName || 'Customer'} returned on call. Demanded: ₹${Number(q.customerDemandedPrice || 0).toLocaleString('en-IN')}. Click to review & decide.`,
                  tag: `quote-concession-${key}`,
                  soundVariant: 'concession',
                  onClick: () => handleNavigateToConcessionReview(q)
                });
              }

              // Concession Approved -> Alert Sales Team!
              if ((newStatus === 'approved_direct_discount' || newStatus === 'approved_complimentary') &&
                  prevStatus !== 'approved_direct_discount' && prevStatus !== 'approved_complimentary') {
                setQuotationApprovedAlerts(prev => [q, ...prev.filter(x => (x.refNo || x.id) !== key)]);
                const isDirect = newStatus === 'approved_direct_discount';
                triggerSystemPushNotification({
                  title: '🎉 Quotation Concession Approved!',
                  body: `Admin approved ${isDirect ? 'Direct Price Discount' : 'Complimentary Perk'} for ${q.customerName || 'Customer'} (${q.refNo}). Click to issue Revision 2.`,
                  tag: `quote-approved-${key}`,
                  soundVariant: 'success',
                  onClick: () => handleNavigateToConcessionRevision(q)
                });
              }
            }
          });
        }
      }
    } catch (e) { }
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

  const handleSelectAllToggle = () => {
    if (filteredLeads.length === 0) return;
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleRowSelectToggle = (leadId) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const openDeleteModalForSingle = (lead) => {
    if (!lead) return;
    setDeleteModalData({
      isOpen: true,
      leadIds: [lead.id],
      leadsInfo: [lead]
    });
  };

  const openDeleteModalForSelected = () => {
    if (selectedLeadIds.length === 0) return;
    const selectedObjects = leads.filter(l => selectedLeadIds.includes(l.id));
    setDeleteModalData({
      isOpen: true,
      leadIds: selectedLeadIds,
      leadsInfo: selectedObjects.length > 0 ? selectedObjects : selectedLeadIds.map(id => ({ id }))
    });
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deleteModalData.leadIds || deleteModalData.leadIds.length === 0) return;
    setIsDeletingLeads(true);

    const idsToDelete = [...deleteModalData.leadIds];
    try {
      const res = await fetch(`/api/leads?ids=${encodeURIComponent(idsToDelete.join(','))}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: idsToDelete,
          deletedBy: {
            name: user?.fullName || user?.name || 'Rajesh Sharma',
            role: user?.roleBadge || user?.role || 'HQ Admin',
            email: user?.email || 'rajesh@rajbiosis.com'
          }
        })
      });
      const data = await res.json();

      if (data.success || res.ok) {
        // 1. Remove from local leads state (which immediately updates filteredLeads and both top cards)
        setLeads(prev => prev.filter(l => !idsToDelete.includes(l.id) && (!l._id || !idsToDelete.includes(String(l._id)))));

        // 2. Clear from selection
        setSelectedLeadIds(prev => prev.filter(id => !idsToDelete.includes(id)));

        // 3. Remove from known leads and alerts
        idsToDelete.forEach(id => {
          if (knownLeadIdsRef.current) knownLeadIdsRef.current.delete(id);
        });
        setNewLeadAlerts(prev => prev.filter(a => !idsToDelete.includes(a.id)));

        // Clean up cached leads in localStorage so WebQuotationManager never restores them
        if (typeof window !== 'undefined') {
          try {
            const cached = window.localStorage.getItem('rbpl_cached_leads');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                const cleaned = parsed.filter(l => !idsToDelete.includes(l.id) && (!l._id || !idsToDelete.includes(String(l._id))));
                window.localStorage.setItem('rbpl_cached_leads', JSON.stringify(cleaned));
              }
            }
          } catch (e) { }
        }

        // 4. Broadcast channel to inform WebQuotationManager and other tabs
        try {
          const channel = new BroadcastChannel('biomedical_leads_channel');
          channel.postMessage({ type: 'LEADS_DELETED', ids: idsToDelete, leadIds: idsToDelete });
          setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('biomedical_leads_deleted', JSON.stringify(idsToDelete));
          }
        } catch (e) { }

        // 5. Close modal
        loadDeletedRecordsCount(); // after delete
        setDeleteModalData({ isOpen: false, leadIds: [], leadsInfo: [] });

        // 6. Show success toast notification
        setToastNotification({
          title: 'Permanently Deleted!',
          message: `${idsToDelete.length} inquiry(s) aur related records system aur database se permanently remove kar diye gaye hain.`
        });
      } else {
        alert(data.error || 'Failed to delete inquiries. Please try again.');
      }
    } catch (err) {
      console.error('Delete lead error:', err);
      alert('Error during deletion: ' + err.message);
    } finally {
      setIsDeletingLeads(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    openDeleteModalForSingle(lead || { id: leadId });
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
    .sort(stableLeadSort);

  // Deduplicate by Lead ID (preserving all distinct enquiries)
  const seenTableIds = new Set();
  const filteredLeads = [];
  for (const l of rawFilteredLeads) {
    const id = l.id || l._id;
    if (!id || seenTableIds.has(id)) continue;
    seenTableIds.add(id);
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

            {/* Overview & Performance Intelligence Dashboard */}
            <button
              onClick={() => setActiveTab('overview')}
              title="Overview & Performance Intelligence"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'overview'
                ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <LayoutDashboard size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Overview</span>}
              </span>
              {isSidebarCollapsed ? (
                <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border border-white"></span>
              ) : (
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                  BI
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
              onClick={() => {
                setActiveTab('quotation');
                setActiveQuotationDeskTab('leads');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('reset_web_quotation_tab', { detail: 'leads' }));
                }
              }}
              title={`Web Quotation & Incoming Leads (${leads.length} Pending)`}
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
                leads.length > 0 ? (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sky-600 rounded-full border border-white"></span>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  {leads.length > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5 animate-pulse" title={`${leads.length} New Incoming Web Leads`}>
                      <span>⚡</span>
                      <span>{leads.length}</span>
                    </span>
                  )}
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                    PDF
                  </span>
                </div>
              )}
            </button>

            {/* Dedicated Complimentary Concessions Desk Tab */}
            <button
              onClick={() => {
                setActiveTab('quotation');
                setActiveQuotationDeskTab('complementary');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('switch_web_quotation_tab', { detail: 'complementary' }));
                }
              }}
              title="Complimentary Concessions & Deal Floor Lock Desk"
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'quotation' && activeQuotationDeskTab === 'complementary'
                ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-300 shadow-xs ring-1 ring-amber-400/40'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Gift size={isSidebarCollapsed ? 19 : 16} className={activeTab === 'quotation' && activeQuotationDeskTab === 'complementary' ? 'text-amber-700' : 'text-amber-600'} />
                {!isSidebarCollapsed && <span>Complimentary Desk</span>}
              </span>
              {!isSidebarCollapsed && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                  🎁 Perk
                </span>
              )}
            </button>

            {/* Add to Cart / Watchlist Products Tab */}
            <button
              onClick={() => setActiveTab('cart_watchlist')}
              title={`Add to Cart / Watchlist Products (${cartTotalBadge})`}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'cart_watchlist'
                ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <ShoppingCart size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Add to Cart / Watchlist</span>}
              </span>
              {isSidebarCollapsed ? (
                cartTotalBadge > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>
                )
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                  {cartTotalBadge}
                </span>
              )}
            </button>

            {/* Deleted Records & Audit Trail Tab */}
            <button
              onClick={() => setActiveTab('deleted')}
              title={`Deleted Records (${deletedRecordsCount})`}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group ${activeTab === 'deleted'
                ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Archive size={isSidebarCollapsed ? 19 : 16} />
                {!isSidebarCollapsed && <span>Deleted Records</span>}
              </span>
              {isSidebarCollapsed ? (
                deletedRecordsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                )
              ) : (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                  {deletedRecordsCount}
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
              {activeTab === 'overview' && (
                <>
                  <span className="truncate">Performance Intelligence</span>
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs shrink-0">
                    Executive Overview
                  </span>
                </>
              )}
              {activeTab === 'users' && (
                <>
                  <span>Biomedical Team & Sales Territory Roles</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    Active Directory
                  </span>
                </>
              )}
              {activeTab === 'quotation' && (
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
              )}
              {activeTab === 'cart_watchlist' && (
                <>
                  <span className="truncate">Add to Cart &amp; Watchlist Products</span>
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs shrink-0">
                    Hospital Buyers
                  </span>
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
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quotation');
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reset_web_quotation_tab', { detail: 'leads' }));
                  }
                  setNewLeadAlerts([]);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open in Web Quotation</span>
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

          {/* TAB 0: EXECUTIVE PERFORMANCE & SYSTEM INTELLIGENCE OVERVIEW */}
          {activeTab === 'overview' && (
            <ExecutiveOverviewDashboard
              leads={leads}
              quotations={quotationsList}
              customers={customersList}
              sites={sites}
              products={PRODUCTS}
              user={user}
              onNavigateTab={setActiveTab}
            />
          )}

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
            </div>) : null}



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
              TAB: CUSTOMER ADD TO CART & WATCHLIST PRODUCTS DESK
              ========================================================================= */}
          {activeTab === 'cart_watchlist' && (
            <CartWatchlistManager onNavigateTab={setActiveTab} />
          )}

          {/* TAB: DELETED RECORDS & AUDIT TRAIL VAULT */}
          {activeTab === 'deleted' && (
            <DeletedRecordsManager
              user={user}
              onRecordRestored={() => {
                loadLeadsFromDb();
                loadQuotations();
                loadDeletedRecordsCount();
              }}
            />
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

                        {/* Choice 3: Option C - Lock Deal Floor & Authorize Complimentary Concession */}
                        <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/70 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase">
                              <Gift size={15} className="text-amber-600 animate-bounce" />
                              <span>Option C: Lock Floor & Authorize Complimentary Perk</span>
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-mono">
                              Deal Preserved
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 font-medium">
                            Lock quotation revenue at floor rate (e.g. ₹5,38,000) while setting base machine rate to customer demand (e.g. ₹5,37,500), unlocking the difference as complimentary perk.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                                Floor to Lock (₹)
                              </label>
                              <input
                                type="number"
                                value={adminFloorInput}
                                onChange={(e) => setAdminFloorInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                                Base Machine (₹)
                              </label>
                              <input
                                type="number"
                                value={adminCustomerBidInput}
                                onChange={(e) => setAdminCustomerBidInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg outline-none"
                              />
                            </div>
                            <div className="p-2 rounded-lg bg-amber-100/90 border border-amber-300 flex flex-col justify-center">
                              <span className="text-[9px] font-bold text-amber-900 uppercase">Perk Budget</span>
                              <div className="text-sm font-black font-mono text-emerald-700">
                                ₹{Math.max(0, (parseFloat(adminFloorInput || 0) - parseFloat(adminCustomerBidInput || 0))).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={negotiationSubmitting || (parseFloat(adminFloorInput || 0) <= parseFloat(adminCustomerBidInput || 0))}
                            onClick={() => handleLockFloorWithComplimentary(
                              negotiationModalLead,
                              parseFloat(adminFloorInput),
                              parseFloat(adminCustomerBidInput),
                              `Deal floor locked at ₹${Number(adminFloorInput).toLocaleString('en-IN')} with ₹${(Number(adminFloorInput) - Number(adminCustomerBidInput)).toLocaleString('en-IN')} complimentary allowance.`
                            )}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                          >
                            <Lock size={14} />
                            <span>
                              Lock Floor at ₹{Number(adminFloorInput || 0).toLocaleString('en-IN')} + Authorize ₹{Math.max(0, (parseFloat(adminFloorInput || 0) - parseFloat(adminCustomerBidInput || 0))).toLocaleString('en-IN')} Complimentary
                            </span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          {/* Permanent Delete Confirmation Modal */}
          {deleteModalData.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">

                {/* Header with Danger Icon */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Trash2 size={24} className="animate-bounce" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 mb-1">
                      Permanent Action
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Ye delete ho jayega permanently
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Kya aap sach me ise delete karna chahte hain? Ye inquiry, iski official quotation, PDF history aur saare records MongoDB aur pure system se permanently remove ho jayenge.
                    </p>
                  </div>
                </div>

                {/* Selected Items Summary / Preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 max-h-48 overflow-y-auto space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    Items to be deleted ({deleteModalData.leadIds.length}):
                  </div>
                  {deleteModalData.leadsInfo.map((l, idx) => (
                    <div key={l.id || idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-mono font-bold text-slate-800 block text-[11px]">{l.id}</span>
                        <span className="text-slate-600 font-semibold truncate block text-[11px]">
                          {l.hospital || l.hospitalName || 'Healthcare Facility'} — {l.doctorName || l.contact || 'Doctor'}
                        </span>
                        <span className="text-slate-400 text-[10px] block truncate">
                          {l.equipment || l.productName || 'Equipment'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-700 text-xs block">
                          {l.quoteAmount || l.amount || '₹0'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          {l.siteDomain || 'rajbiosis.com'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDeleteModalData({ isOpen: false, leadIds: [], leadsInfo: [] })}
                    disabled={isDeletingLeads}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPermanentDelete}
                    disabled={isDeletingLeads}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingLeads ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Haan, Permanently Delete Karein</span>
                      </>
                    )}
                  </button>
                </div>

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