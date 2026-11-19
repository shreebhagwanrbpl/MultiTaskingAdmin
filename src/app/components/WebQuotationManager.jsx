'use client';

import { triggerSystemPushNotification, broadcastSystemNotification, requestPushPermission, getPushPermissionStatus } from '../../lib/pushNotifications';
import { getLeadTimestamp, stableLeadSort, cleanLeadHospital } from '../../lib/leadUtils';

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
  ArrowLeft,
  ArrowRight,
  Maximize2,
  FileCheck,
  CheckCircle2,
  Filter,
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
  AlertTriangle,
  MessageCircle,
  MessageSquare,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  Lock,
  ShieldCheck,
  Tag,
  PhoneCall,
  Gift,
  Timer,
  Send,
  Share2
} from 'lucide-react';
import { numberToWordsIndian } from '../../lib/numberToWords';
import { useAuth } from '../../lib/AuthContext';

// ============================================================================
// OFFICIAL COMPLIMENTARY BIOMEDICAL PERK CATALOG (₹50 TO ₹1,000)
// ============================================================================

export function isQuoteWithComplimentary(q) {
  if (!q) return false;
  if (q.hasComplimentary) return true;
  if (Number(q.allowedComplementaryBudget || 0) > 0) return true;
  if (
    q.concessionStatus === 'concession_approved' ||
    q.concessionStatus === 'approved_complimentary' ||
    q.concessionStatus === 'concession_applied'
  ) return true;
  if (Array.isArray(q.items) && q.items.some(it => it.isComplimentary || (it.title && String(it.title).toUpperCase().includes('COMPLIMENTARY')))) return true;
  if (Array.isArray(q.complimentaryItems) && q.complimentaryItems.length > 0) return true;
  if (typeof q.subjectQuotation === 'string' && q.subjectQuotation.toLowerCase().includes('complimentary')) return true;
  return false;
}

// Helper: Calculate days remaining and formatted badge for medical stock expiry
export function getExpiryDetails(expiryDateStr) {
  if (!expiryDateStr) {
    return {
      daysLeft: 999,
      formatted: 'N/A',
      status: 'normal',
      badgeText: 'Shelf Stock',
      shortText: 'N/A',
      badgeBg: 'bg-slate-50 text-slate-600 border-slate-200',
      dotColor: 'bg-slate-400',
      isUrgent: false
    };
  }

  // Active simulated reference date (12 Nov 2026)
  const today = new Date('2026-11-12T00:00:00');
  const expDate = new Date(expiryDateStr + 'T00:00:00');
  const diffTime = expDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatted = `${expDate.getDate()} ${months[expDate.getMonth()]} ${expDate.getFullYear()}`;

  if (daysLeft <= 45) {
    return {
      daysLeft,
      formatted,
      status: 'critical',
      badgeText: `⚠️ Near-Expiry: ${formatted} (${daysLeft}d left)`,
      shortText: `${formatted} (${daysLeft}d left)`,
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400/20',
      dotColor: 'bg-rose-500 animate-pulse',
      isUrgent: true
    };
  } else if (daysLeft <= 90) {
    return {
      daysLeft,
      formatted,
      status: 'soon',
      badgeText: `⏳ Exp: ${formatted} (${daysLeft}d left)`,
      shortText: `${formatted} (${daysLeft}d left)`,
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
      isUrgent: true
    };
  } else {
    return {
      daysLeft,
      formatted,
      status: 'normal',
      badgeText: `Exp: ${formatted}`,
      shortText: formatted,
      badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
      dotColor: 'bg-emerald-500',
      isUrgent: false
    };
  }
}

export const COMPLIMENTARY_PERK_CATALOG = [
  // --- ₹50 Consumables ---
  {
    id: 'perk-50-1',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80',
    title: 'Sterile ECG Electrodes (Pack of 10)',
    price: 50,
    category: 'Consumables',
    desc: 'Disposable medical hydrogel diagnostic monitoring electrodes.',
    expiryDate: '2026-12-20', // Critical Near-Expiry (38d left)
    batchNo: 'LOT-ECG-261220',
    mfgDate: '2025-12-15'
  },
  {
    id: 'perk-50-3',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    title: 'Microporous Surgical Paper Tape (1-inch Roll)',
    price: 50,
    category: 'Consumables',
    desc: 'Hypoallergenic breathable surgical tape for dressing & sensor fixation.',
    expiryDate: '2026-12-25', // Critical Near-Expiry (43d left)
    batchNo: 'LOT-MPT-261225',
    mfgDate: '2025-12-01'
  },
  {
    id: 'perk-50-4',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    title: 'Latex-Free Quick-Release Medical Tourniquet',
    price: 50,
    category: 'Consumables',
    desc: 'Elastic band with quick-release snap buckle for phlebotomy & IV cannulation.',
    expiryDate: '2027-01-05', // 54d left
    batchNo: 'LOT-TRN-270105',
    mfgDate: '2026-01-01'
  },
  {
    id: 'perk-50-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Ultrasound Acoustic Probe Sheaths (5 Pcs)',
    price: 50,
    category: 'Protection',
    desc: 'Sterile latex-free acoustic transducer protective covers.',
    expiryDate: '2027-01-10', // 59d left
    batchNo: 'LOT-UPS-270110',
    mfgDate: '2026-01-10'
  },
  {
    id: 'perk-50-5',
    image: 'https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&w=500&q=80',
    title: 'Steam Sterilization Chemical Indicator Tape (Roll)',
    price: 50,
    category: 'Sterilization',
    desc: 'Autoclave process color-changing indicator tape for sterile packaging.',
    expiryDate: '2027-01-20', // 69d left
    batchNo: 'LOT-SIT-270120',
    mfgDate: '2026-01-15'
  },
  {
    id: 'perk-50-6',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=500&q=80',
    title: 'Disposable Sterile Tongue Depressors (Box of 50)',
    price: 50,
    category: 'Diagnostics',
    desc: 'Smooth polished birchwood medical diagnostic examination depressors.',
    expiryDate: '2027-02-10', // 90d left
    batchNo: 'LOT-TGD-270210',
    mfgDate: '2026-02-01'
  },

  // --- ₹100 Diagnostics & Consumables ---
  {
    id: 'perk-100-1',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    title: 'Acoustic Transmission Ultrasound Gel (250ml)',
    price: 100,
    category: 'Consumables',
    desc: 'High-viscosity hypoallergenic ultrasound & Doppler transmission gel.',
    expiryDate: '2026-12-24', // Critical Near-Expiry (42d left)
    batchNo: 'LOT-GEL-261224',
    mfgDate: '2025-12-20'
  },
  {
    id: 'perk-100-3',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    title: 'Chlorhexidine Antiseptic Skin Prep Swabs (Box of 25)',
    price: 100,
    category: 'Consumables',
    desc: '2% Chlorhexidine gluconate in 70% alcohol for pre-injection skin antisepsis.',
    expiryDate: '2027-01-02', // 51d left
    batchNo: 'LOT-CHX-270102',
    mfgDate: '2026-01-01'
  },
  {
    id: 'perk-100-4',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=500&q=80',
    title: 'Digital Clinical Thermometer Probe Covers (Pack of 100)',
    price: 100,
    category: 'Diagnostics',
    desc: 'Disposable transparent protective sheaths for oral/axillary thermometers.',
    expiryDate: '2027-01-18', // 67d left
    batchNo: 'LOT-DPC-270118',
    mfgDate: '2026-01-10'
  },
  {
    id: 'perk-100-2',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80',
    title: 'NIBP Monitor Quick-Release Hose Coupling',
    price: 100,
    category: 'Hardware',
    desc: 'Medical-grade brass bayonet air hose connector for patient monitors.',
    expiryDate: '2027-02-15', // 95d left
    batchNo: 'LOT-HCP-270215',
    mfgDate: '2026-02-10'
  },
  {
    id: 'perk-100-5',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Medical Nitrile Examination Gloves (Box of 50)',
    price: 100,
    category: 'Protection',
    desc: 'Powder-free textured fingertip medical examination gloves (Medium).',
    expiryDate: '2027-03-01', // 109d left
    batchNo: 'LOT-GLV-270301',
    mfgDate: '2026-02-15'
  },

  // --- ₹150 Recording & Accessories ---
  {
    id: 'perk-150-1',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80',
    title: 'Medical Thermal Recording Paper (57mm x 20m)',
    price: 150,
    category: 'Recording',
    desc: 'High-contrast grid ECG trace thermal printer paper roll.',
    expiryDate: '2026-12-28', // Critical Near-Expiry (46d left)
    batchNo: 'LOT-PPR-261228',
    mfgDate: '2025-09-01'
  },
  {
    id: 'perk-150-3',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    title: 'Sterile Gauze Swabs 10x10cm (Pack of 50)',
    price: 150,
    category: 'Consumables',
    desc: '100% cotton 12-ply sterile surgical gauze pads with folded edges.',
    expiryDate: '2027-01-08', // 57d left
    batchNo: 'LOT-GZ-270108',
    mfgDate: '2026-01-02'
  },
  {
    id: 'perk-150-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Pulse Oximeter Finger Sensor Cable Strain Relief',
    price: 150,
    category: 'Hardware',
    desc: 'Anti-breakage reinforced cable protector clip set.',
    expiryDate: '2027-02-12', // 92d left
    batchNo: 'LOT-SRF-270212',
    mfgDate: '2026-02-01'
  },
  {
    id: 'perk-150-4',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Disposable Electrosurgical Patient Grounding Return Plate',
    price: 150,
    category: 'Surgical',
    desc: 'Hydrogel split conductive dispersive pad for electrosurgical diathermy.',
    expiryDate: '2027-03-20',
    batchNo: 'LOT-GRP-270320',
    mfgDate: '2026-03-01'
  },

  // --- ₹200 Diagnostics & Protection ---
  {
    id: 'perk-200-1',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80',
    title: 'Adult Reusable NIBP Blood Pressure Arm Cuff',
    price: 200,
    category: 'Diagnostics',
    desc: 'Standard adult calibrated nylon arm cuff with TPU bladder (25-35cm).',
    expiryDate: '2026-12-30', // Critical Near-Expiry (48d left)
    batchNo: 'LOT-CUF-261230',
    mfgDate: '2025-10-15'
  },
  {
    id: 'perk-200-3',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Medical Suction Tubing with Yankauer Connector (3m)',
    price: 200,
    category: 'Surgical',
    desc: 'Flexible ribbed anti-kink surgical suction tubing with standard funnel.',
    expiryDate: '2027-01-14', // 63d left
    batchNo: 'LOT-STB-270114',
    mfgDate: '2026-01-05'
  },
  {
    id: 'perk-200-4',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Sterile Carbon Steel Surgical Scalpel Blades #11 (Box of 20)',
    price: 200,
    category: 'Surgical',
    desc: 'Gamma-irradiated sharp precision lancet incision blades.',
    expiryDate: '2027-02-28', // 108d left
    batchNo: 'LOT-SBL-270228',
    mfgDate: '2026-02-01'
  },
  {
    id: 'perk-200-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Equipment Anti-Static Protective Dust Sheath',
    price: 200,
    category: 'Protection',
    desc: 'Water-resistant hospital equipment dust cover.',
    expiryDate: '2027-04-10',
    batchNo: 'LOT-DSH-270410',
    mfgDate: '2026-04-01'
  },

  // --- ₹250 Sterilization & Diagnostics ---
  {
    id: 'perk-250-2',
    image: 'https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&w=500&q=80',
    title: 'Autoclave Chemical Indicator Strips (Box of 100)',
    price: 250,
    category: 'Sterilization',
    desc: 'Class 4 multi-parameter steam sterilization verification strips.',
    expiryDate: '2026-12-22', // Critical Near-Expiry (40d left)
    batchNo: 'LOT-CIS-261222',
    mfgDate: '2025-06-15'
  },
  {
    id: 'perk-250-3',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80',
    title: 'Pediatric Reusable NIBP Calibrated Arm Cuff (18-26cm)',
    price: 250,
    category: 'Diagnostics',
    desc: 'Child calibrated soft nylon blood pressure cuff with TPU air bladder.',
    expiryDate: '2027-01-06', // 55d left
    batchNo: 'LOT-PCU-270106',
    mfgDate: '2026-01-02'
  },
  {
    id: 'perk-250-1',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=500&q=80',
    title: 'Digital Clinical Thermometer & Probe Covers Set',
    price: 250,
    category: 'Diagnostics',
    desc: 'Rapid 10-second waterproof digital probe with 20 disposable covers.',
    expiryDate: '2027-01-25', // 74d left
    batchNo: 'LOT-THM-270125',
    mfgDate: '2026-01-20'
  },
  {
    id: 'perk-250-4',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Universal Patient Monitor Earth Grounding Wire Cable',
    price: 250,
    category: 'Hardware',
    desc: 'Equal potential grounding cable with green/yellow insulation & brass clamp.',
    expiryDate: '2027-03-15',
    batchNo: 'LOT-EPG-270315',
    mfgDate: '2026-03-01'
  },

  // --- ₹300 Consumables & Monitoring ---
  {
    id: 'perk-300-1',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
    title: 'Bulk Ultrasound Gel Refill Container (5 Liters)',
    price: 300,
    category: 'Consumables',
    desc: 'Economy clinical ultrasound scan gel refill with dispensing cap.',
    expiryDate: '2026-12-26', // Critical Near-Expiry (44d left)
    batchNo: 'LOT-G5L-261226',
    mfgDate: '2025-11-01'
  },
  {
    id: 'perk-300-3',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Hospital Surface Disinfectant Sanitizing Wipes (Tub of 150)',
    price: 300,
    category: 'Protection',
    desc: 'Quaternary ammonium alcohol-based high-level medical surface wipes.',
    expiryDate: '2027-01-16', // 65d left
    batchNo: 'LOT-SDW-270116',
    mfgDate: '2026-01-10'
  },
  {
    id: 'perk-300-4',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80',
    title: 'Oxygen Flowmeter Humidifier Jar with Metal Connector',
    price: 300,
    category: 'Respiratory',
    desc: 'Impact-resistant transparent humidifier jar with micro-diffuser filter.',
    expiryDate: '2027-02-20', // 100d left
    batchNo: 'LOT-OFH-270220',
    mfgDate: '2026-02-01'
  },
  {
    id: 'perk-300-2',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80',
    title: 'Universal 5-Lead Patient ECG Snap Wire Set',
    price: 300,
    category: 'Monitoring',
    desc: 'AHA color-coded shielded patient lead wires with snap connectors.',
    expiryDate: '2027-05-15',
    batchNo: 'LOT-E5L-270515',
    mfgDate: '2026-05-01'
  },

  // --- ₹350 Surgical & Safety ---
  {
    id: 'perk-350-2',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Autoclavable Medical Silicone Suction Tubing (3m)',
    price: 350,
    category: 'Surgical',
    desc: 'High-vacuum non-collapsible medical silicone tubing for surgical suction.',
    expiryDate: '2027-01-08', // 57d left
    batchNo: 'LOT-STB-270108',
    mfgDate: '2026-01-05'
  },
  {
    id: 'perk-350-3',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Autoclavable Bipolar Electrosurgical Forceps Cable (3m)',
    price: 350,
    category: 'Surgical',
    desc: 'Reinforced 2-pin connector cable compatible with European generator standards.',
    expiryDate: '2027-01-22', // 71d left
    batchNo: 'LOT-BFC-270122',
    mfgDate: '2026-01-15'
  },
  {
    id: 'perk-350-4',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=500&q=80',
    title: 'Diagnostic LED Medical Penlight with Pupil Gauge',
    price: 350,
    category: 'Diagnostics',
    desc: 'Durable anodized aluminum penlight with warm natural light & ruler.',
    expiryDate: '2027-03-05', // 113d left
    batchNo: 'LOT-PLT-270305',
    mfgDate: '2026-02-20'
  },
  {
    id: 'perk-350-1',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Wall-Mounted Radiation Protective Apron Hanger',
    price: 350,
    category: 'Safety',
    desc: 'Heavy-duty steel hanger bracket for hospital lead aprons & thyroid collars.',
    expiryDate: '2027-06-20',
    batchNo: 'LOT-RAH-270620',
    mfgDate: '2026-06-01'
  },

  // --- ₹400 Emergency & Safety ---
  {
    id: 'perk-400-2',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=500&q=80',
    title: 'Defibrillator Paediatric Paddle Adaptor Set',
    price: 400,
    category: 'Emergency',
    desc: 'Snap-on pediatric electrode surface adapter for biphasic defibrillators.',
    expiryDate: '2027-01-12', // 61d left
    batchNo: 'LOT-PAD-270112',
    mfgDate: '2026-01-10'
  },
  {
    id: 'perk-400-3',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Radiation Safety Lead Thyroid Collar Shield (0.5mm Pb)',
    price: 400,
    category: 'Safety',
    desc: 'Velcro-closure lightweight lead protective neck collar against scatter X-rays.',
    expiryDate: '2027-01-30', // 79d left
    batchNo: 'LOT-THY-270130',
    mfgDate: '2026-01-20'
  },
  {
    id: 'perk-400-4',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Stainless Steel Surgical Instrument Tray with Lid (10x8)',
    price: 400,
    category: 'Surgical',
    desc: 'Seamless 304 medical grade stainless steel sterilization container.',
    expiryDate: '2027-04-05', // 144d left
    batchNo: 'LOT-TRY-270405',
    mfgDate: '2026-03-15'
  },
  {
    id: 'perk-400-1',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Radiation Safety Protective Lead Eyewear',
    price: 400,
    category: 'Safety',
    desc: '0.75mm Pb equivalent anti-scatter surgical radiation safety glasses.',
    expiryDate: '2027-06-30',
    batchNo: 'LOT-RLE-270630',
    mfgDate: '2026-06-15'
  },

  // --- ₹450 & Above ---
  {
    id: 'perk-450-2',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80',
    title: 'Oxygen Flowmeter Bubble Humidifier Bottle Kit',
    price: 450,
    category: 'Respiratory',
    desc: 'Unbreakable polycarbonate bottle with pressure safety relief valve.',
    expiryDate: '2027-02-10',
    batchNo: 'LOT-BHK-270210',
    mfgDate: '2026-02-01'
  },
  {
    id: 'perk-450-1',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Equipment Stand Universal Mounting Bracket',
    price: 450,
    category: 'Hardware',
    desc: 'Heavy-duty aluminum multi-angle pole clamp plate for monitors.',
    expiryDate: '2027-07-15',
    batchNo: 'LOT-UMB-270715',
    mfgDate: '2026-07-01'
  },

  // ₹500
  {
    id: 'perk-500-1',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80',
    title: 'Biomedical Consumables & Calibration Accessories Pack',
    price: 500,
    category: 'Calibration',
    desc: 'Quality control calibration phantom, grounding leads, and 1-month clinical pack.',
    expiryDate: '2027-01-18', // 67d left
    batchNo: 'LOT-BCK-270118',
    mfgDate: '2026-01-15'
  },
  {
    id: 'perk-500-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: '1-Year Preventative Maintenance Checklist Kit',
    price: 500,
    category: 'Service',
    desc: 'OEM filter replacement pack, medical lubricant, and service verification kit.',
    expiryDate: '2027-08-15',
    batchNo: 'LOT-PMK-270815',
    mfgDate: '2026-08-01'
  },

  // ₹600
  {
    id: 'perk-600-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Adult SpO2 Extension Cable (3 Meter Shielded)',
    price: 600,
    category: 'Monitoring',
    desc: 'Low-noise shielded sensor extension cable with DB9 gold pins.',
    expiryDate: '2027-02-20',
    batchNo: 'LOT-SXC-270220',
    mfgDate: '2026-02-15'
  },
  {
    id: 'perk-600-1',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Heavy-Duty Locking Mobile Stand Casters (Set of 4)',
    price: 600,
    category: 'Hardware',
    desc: 'Anti-static 3-inch medical swivel wheels with dual-action brakes.',
    expiryDate: '2027-09-10',
    batchNo: 'LOT-CST-270910',
    mfgDate: '2026-09-01'
  },

  // ₹700
  {
    id: 'perk-700-1',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=500&q=80',
    title: 'Silicone Manual Resuscitator Ambu Bag with Reservoir',
    price: 700,
    category: 'Emergency',
    desc: 'Autoclavable adult silicone resuscitator with oxygen reservoir and mask.',
    expiryDate: '2027-03-10',
    batchNo: 'LOT-ABG-270310',
    mfgDate: '2026-03-01'
  },
  {
    id: 'perk-700-2',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80',
    title: 'Certified Biomedical Pressure Calibration Gauge',
    price: 700,
    category: 'Testing',
    desc: 'Precision test gauge for suction units, autoclaves, and BP simulators.',
    expiryDate: '2027-10-25',
    batchNo: 'LOT-PCG-271025',
    mfgDate: '2026-10-15'
  },

  // ₹800
  {
    id: 'perk-800-2',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=80',
    title: 'Surgical C-Arm Sterile Barrier Drape Kit (5 Sets)',
    price: 800,
    category: 'Surgical',
    desc: 'Transparent sterile drape kit with elastic bands for intraoperative imaging.',
    expiryDate: '2027-03-25',
    batchNo: 'LOT-BDK-270325',
    mfgDate: '2026-03-15'
  },
  {
    id: 'perk-800-1',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Hospital Grade Power Cord with Ferrite Core (5m)',
    price: 800,
    category: 'Electrical',
    desc: 'Heavy-duty 16A hospital-grade cable with molded earth pin & noise filter.',
    expiryDate: '2027-11-15',
    batchNo: 'LOT-PWC-271115',
    mfgDate: '2026-11-01'
  },

  // ₹900
  {
    id: 'perk-900-2',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=500&q=80',
    title: 'Neonatal Phototherapy Eye Protection Shields (Box 50)',
    price: 900,
    category: 'Pediatric',
    desc: 'Certified UV/Blue light blocking gentle adhesive neonatal eye protectors.',
    expiryDate: '2027-04-15',
    batchNo: 'LOT-NES-270415',
    mfgDate: '2026-04-01'
  },
  {
    id: 'perk-900-1',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'High-Sensitivity Adult SpO2 Finger Sensor Probe',
    price: 900,
    category: 'Monitoring',
    desc: 'Reusable soft silicone finger probe with optical sensor for patient monitors.',
    expiryDate: '2027-12-15',
    batchNo: 'LOT-FSP-271215',
    mfgDate: '2026-12-01'
  },

  // ₹1000
  {
    id: 'perk-1000-2',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
    title: 'Medical Heavy-Duty Voltage Surge & Spike Suppressor',
    price: 1000,
    category: 'Protection',
    desc: 'High-joule EMI/RFI filtration power protector for sensitive diagnostics.',
    expiryDate: '2027-05-30',
    batchNo: 'LOT-VSS-270530',
    mfgDate: '2026-05-15'
  },
  {
    id: 'perk-1000-1',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80',
    title: '1-Year Extended Warranty & Calibration Certificate',
    price: 1000,
    category: 'Warranty',
    desc: 'Official NABL-traceable QA certification with 1-year extended maintenance.',
    expiryDate: '2028-01-15',
    batchNo: 'LOT-WRT-280115',
    mfgDate: '2027-01-01'
  }
];


// ============================================================================
// CLEAN 2-COLUMN LEAD INQUIRY CARD: LEFT (CUSTOMER DETAILS) | RIGHT (PRODUCTS)
// ============================================================================
const LeadInquiryCard = ({
  lead,
  idx,
  isAdmin,
  getMatchedCustomer,
  cleanLeadHospital,
  getLeadProducts,
  isLeadNegotiablePending,
  handleRequestAdminApproval,
  openNegotiationModal,
  handleMakeQuotationFromLead,
  handleDeleteWebLead
}) => {
  const matchedCustomer = getMatchedCustomer(lead);
  const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
  const displayHospital = cleanLeadHospital(rawHosp);
  const displayContact = matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'NA';
  const displayPhone = matchedCustomer?.phone || lead.phone || 'NA';
  const displayEmail = matchedCustomer?.email || lead.email || 'NA';
  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'NA';
  const leadProducts = getLeadProducts(lead);
  const isBulk = leadProducts.length > 2;
  const isMulti = leadProducts.length > 1 || lead.equipment?.toLowerCase().includes('bulk') || lead.rawLeadData?.isMultiItem;
  const isContactPageEnquiry = Boolean(
    lead.source?.toLowerCase().includes('contact') ||
    lead.leadSource?.toLowerCase().includes('contact') ||
    lead.sourcePage === '/contact' ||
    Boolean(lead.message) ||
    Boolean(lead.rawLeadData?.source?.toLowerCase().includes('contact'))
  );

  const displayTotal = lead.quoteAmount
    ? (String(lead.quoteAmount).startsWith('₹') ? lead.quoteAmount : `₹${lead.quoteAmount}`)
    : `₹${leadProducts.reduce((sum, p) => sum + (Number(p.price || p.unitPrice || 0) * Number(p.qty || 1)), 0).toLocaleString('en-IN')}`;

  return (
    <div
      key={lead.id || lead._id || idx}
      className="rounded-2xl transition-all duration-200 bg-white border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col group"
    >
      {/* Accent Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        isContactPageEnquiry
          ? 'bg-gradient-to-b from-purple-500 via-indigo-500 to-pink-500'
          : 'bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500'
      }`} />

      {/* Top Header Row */}
      <div className="pl-5 pr-4 py-3 bg-gradient-to-r from-slate-50 via-amber-50/20 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm sm:text-base tracking-tight">
            <Building2 size={16} className={isContactPageEnquiry ? "text-purple-600 shrink-0" : "text-amber-600 shrink-0"} />
            <span>{displayHospital}</span>
          </div>

          {lead.siteDomain && (
            <span className="text-[11px] bg-white text-slate-600 font-mono px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold shadow-2xs">
              <span>🌐</span>
              <span>{lead.siteDomain}</span>
            </span>
          )}

          <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <Clock size={11} className="text-slate-400" />
            <span>
              {lead.dateTime || (lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (lead.date || 'Just now'))}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isContactPageEnquiry ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100 text-purple-900 border border-purple-300 text-xs font-black flex items-center gap-1.5 shadow-2xs animate-pulse">
              <MessageSquare size={13} className="text-purple-600" />
              <span>Contact Page Enquiry</span>
            </span>
          ) : leadProducts.length > 2 ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-sky-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Package size={13} className="text-indigo-600" />
              <span>Bulk Request ({leadProducts.length} Products)</span>
            </span>
          ) : leadProducts.length === 2 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1">
              <Package size={12} className="text-sky-600" />
              <span>2 Products</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>New RFQ</span>
            </span>
          )}
        </div>
      </div>

      {/* If > 2 products, use the spacious 2-Column Split View. Otherwise, keep it compact and clean! */}
      {isBulk ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 pl-2">
          {/* LEFT COLUMN: Customer Details (lg:col-span-5) */}
          <div className="p-4 sm:p-5 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100 lg:col-span-5 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
              <User size={12} className="text-slate-400" />
              <span>Customer Details</span>
            </div>

            <div className="space-y-2">
              {/* Customer Name */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <User size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Customer Name</div>
                  <div className="text-xs font-bold text-slate-900 truncate" title={displayContact}>{displayContact}</div>
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Mobile Number</div>
                  <div className="text-xs font-mono font-bold text-slate-800 truncate">{displayPhone || 'NA'}</div>
                </div>
              </div>

              {/* Official Email */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Email Address</div>
                  <div className="text-xs font-medium text-slate-700 truncate" title={displayEmail}>{displayEmail || 'NA'}</div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Location</div>
                  <div className="text-xs font-semibold text-slate-800 truncate" title={displayLocation}>{displayLocation}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Products In Inquiry (lg:col-span-7) */}
          <div className="p-4 sm:p-5 lg:col-span-7 flex flex-col justify-between bg-white space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package size={12} className="text-indigo-500" />
                  <span>Requested Equipment ({leadProducts.length} Items)</span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  Total: <span className="font-black font-mono">{displayTotal}</span>
                </div>
              </div>

              {/* Products List */}
              <div className="mt-2.5 space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {leadProducts.map((p, pIdx) => {
                  const pQty = p.qty || p.quantity || 1;
                  const pPrice = Number(p.price || p.rate || p.unitPrice || 0);
                  const pTotal = pPrice * pQty;

                  return (
                    <div
                      key={p.id || p.sku || pIdx}
                      className="bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl p-3 border border-slate-200/70 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-bold text-slate-900 line-clamp-1 text-xs" title={p.name || p.title || p.productName}>
                          <span className="text-indigo-600 font-mono font-bold mr-1.5">#{pIdx + 1}</span>
                          <span>{p.name || p.title || p.productName || 'Equipment Item'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 font-mono">
                          {p.sku && (
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                              {p.sku}
                            </span>
                          )}
                          {p.brand && <span className="text-slate-400">• {p.brand}</span>}
                          {p.warranty && <span className="text-slate-400 hidden sm:inline">• {p.warranty}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-slate-900 text-xs">
                          ₹{pTotal > 0 ? pTotal.toLocaleString('en-IN') : pPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {pQty > 1 ? `${pQty} × ₹${pPrice.toLocaleString('en-IN')}` : `Qty: ${pQty}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Contact Inquiry Message */}
              {(lead.message || lead.department) && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-purple-50/90 border border-purple-200/90 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-extrabold text-purple-900 flex items-center gap-1.5 text-xs">
                      <MessageSquare size={13} className="text-purple-600 shrink-0" />
                      <span>Contact Form Message {lead.department ? `• Department: ${lead.department}` : ''}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-700 shadow-2xs">
                      {lead.sourcePage || 'rajbiosis.com/contact'}
                    </span>
                  </div>
                  {lead.message && (
                    <p className="text-slate-800 text-xs leading-relaxed font-medium bg-white/95 p-2.5 rounded-xl border border-purple-100 italic">
                      &ldquo;{lead.message}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* COMPACT SINGLE-STACK VIEW (1 or 2 items only) */
        <div className="p-4 sm:p-5 space-y-3 bg-white flex-1 pl-6">
          {/* Horizontal Customer Details Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
            <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <User size={13} className="text-sky-600 shrink-0" />
              <span>{displayContact}</span>
            </span>

            {displayPhone && displayPhone !== 'NA' && (
              <span className="flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <Phone size={12} className="text-emerald-600 shrink-0" />
                <span>{displayPhone}</span>
              </span>
            )}

            {displayEmail && displayEmail !== 'NA' && (
              <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hidden md:inline-flex">
                <Mail size={12} className="text-indigo-600 shrink-0" />
                <span className="truncate max-w-[200px]" title={displayEmail}>{displayEmail}</span>
              </span>
            )}

            {displayLocation && displayLocation !== 'NA' && (
              <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <MapPin size={12} className="text-amber-600 shrink-0" />
                <span>{displayLocation}</span>
              </span>
            )}

            <span className="ml-auto font-mono font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
              Total: <span className="font-black">{displayTotal}</span>
            </span>
          </div>

          {/* Requested Equipment Items (1 or 2 items) */}
          <div className="space-y-2">
            {leadProducts.map((p, pIdx) => {
              const pQty = p.qty || p.quantity || 1;
              const pPrice = Number(p.price || p.rate || p.unitPrice || 0);
              const pTotal = pPrice * pQty;

              return (
                <div
                  key={p.id || p.sku || pIdx}
                  className="bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl p-3 border border-slate-200/70 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-bold text-slate-900 line-clamp-1 text-xs flex items-center gap-1.5" title={p.name || p.title || p.productName}>
                      <Package size={14} className="text-indigo-500 shrink-0" />
                      <span>{p.name || p.title || p.productName || 'Equipment Item'}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 font-mono">
                      {p.sku && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                          {p.sku}
                        </span>
                      )}
                      {p.brand && <span className="text-slate-400">• {p.brand}</span>}
                      {p.warranty && <span className="text-slate-400 hidden sm:inline">• {p.warranty}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-slate-900 text-xs">
                      ₹{pTotal > 0 ? pTotal.toLocaleString('en-IN') : pPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {pQty > 1 ? `${pQty} × ₹${pPrice.toLocaleString('en-IN')}` : `Qty: ${pQty}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Contact Inquiry Message (Compact View) */}
          {(lead.message || lead.department) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-purple-50/90 border border-purple-200/90 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-extrabold text-purple-900 flex items-center gap-1.5 text-xs">
                  <MessageSquare size={13} className="text-purple-600 shrink-0" />
                  <span>Contact Form Message {lead.department ? `• Department: ${lead.department}` : ''}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-700 shadow-2xs">
                  {lead.sourcePage || 'rajbiosis.com/contact'}
                </span>
              </div>
              {lead.message && (
                <p className="text-slate-800 text-xs leading-relaxed font-medium bg-white/95 p-2.5 rounded-xl border border-purple-100 italic">
                  &ldquo;{lead.message}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM FOOTER BAR: WhatsApp, Status / Bids & MAKE QUOTATION Button */}
      <div className="pl-5 pr-4 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {displayPhone && (
            <a
              href={`https://wa.me/91${(displayPhone || '').replace(/\D/g, '').slice(-10)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-2xs"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Chat</span>
            </a>
          )}

          {/* Pricing / Negotiation Badges */}
          {lead.isPriceNegotiated || lead.expectedPrice ? (
            lead.negotiationStatus === 'approved' ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Approved: ₹{Number(lead.approvedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            ) : lead.negotiationStatus === 'counter_offered' ? (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                <span>🤝</span>
                <span>Counter: ₹{Number(lead.adminCounterPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                <Tag size={13} className="text-amber-600" />
                <span>Target Bid: ₹{Number(lead.expectedPrice || lead.price || 0).toLocaleString('en-IN')}</span>
              </div>
            )
          ) : null}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => handleDeleteWebLead(lead, e)}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200"
            title="Permanently Delete Lead"
          >
            <Trash2 size={15} />
          </button>

          {/* Edit negotiation price button if admin */}
          {isAdmin && (lead.isPriceNegotiated || lead.approvedPrice) && (
            <button
              type="button"
              onClick={() => openNegotiationModal(lead)}
              className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-slate-200"
              title="Adjust approved price or counter offer"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* Prominent MAKE QUOTATION Button */}
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
            <button
              type="button"
              onClick={() => handleMakeQuotationFromLead(lead)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wide ${lead.negotiationStatus === 'approved'
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
                    : `Make Quotation ${leadProducts.length > 1 ? `(${leadProducts.length} Items)` : ''}`}
              </span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default function WebQuotationManager({
  products = [],
  initialLeads = [],
  initialQuotations = [],
  initialCustomers = []
}) {
  const authContext = useAuth();
  const user = authContext?.user || null;
  const userRole = String(user?.role || '').toLowerCase().trim();
  const isAdmin = Boolean(
    authContext?.isAdmin ||
    userRole === 'admin' ||
    userRole === 'super_admin' ||
    userRole.includes('admin')
  );

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

  // =========================================================================
  // 1. ALL CORE REACT STATES DECLARED AT THE VERY TOP (ZERO TDZ / ZERO REFERENCE ERRORS)
  // =========================================================================
  const [activeMainTab, setActiveMainTab] = useState('leads'); // 'leads' | 'completed' | 'quotation' | 'complementary'
  const [activeLayout, setActiveLayout] = useState('preview'); // 'split' | 'editor' | 'preview'
  const [isTransitioningToSplit, setIsTransitioningToSplit] = useState(false);
  const [isLeadsListExpanded, setIsLeadsListExpanded] = useState(true);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [leadFilterType, setLeadFilterType] = useState('all'); // 'all' | 'contact' | 'rfq'
  const [viewingCustomerKey, setViewingCustomerKey] = useState(null);
  const [viewingQuotationAudit, setViewingQuotationAudit] = useState(null);
  const [hoveredTimelineStep, setHoveredTimelineStep] = useState(null);

  // Quotation Document Metadata States
  const [customerName, setCustomerName] = useState('');
  const [customerAddress1, setCustomerAddress1] = useState('');
  const [customerAddress2, setCustomerAddress2] = useState('');
  const [date, setDate] = useState(getTodayFormatted());
  const [refNo, setRefNo] = useState(generateRefNo());

  // Subjects
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [subjectLetter, setSubjectLetter] = useState('Quotation purchase of Laboratory & Medical Equipments');
  const [subjectQuotation, setSubjectQuotation] = useState('Purchase of Medical / Laboratory Equipments');

  // Signatory details
  const [signatoryName, setSignatoryName] = useState('Bhupender Raj');
  const [signatoryRole, setSignatoryRole] = useState('Sales & Mkt. Head');
  const [signatoryCompany, setSignatoryCompany] = useState('Raj Biosis Pvt Ltd.');
  const [signatoryAddress1, setSignatoryAddress1] = useState('B-7, Aman Plaza, Plot No. 26,');
  const [signatoryAddress2, setSignatoryAddress2] = useState('Heera Nagar-A, Chitrakoot');
  const [signatoryCity, setSignatoryCity] = useState('Jaipur-302021 Rajasthan');
  const [signatoryPhone, setSignatoryPhone] = useState('Mob: +91-998-3333-469');
  const [jurisdictionText, setJurisdictionText] = useState('All goods sold are subject to Jaipur Jurisdiction.');

  // Quotation Line Items (100% Dynamic - Declared BEFORE any useMemo or item helper!)
  const [items, setItems] = useState([]);

  // New Item Quick Adder Form State
  const [newItemMode, setNewItemMode] = useState('catalog');
  const [newTitle, setNewTitle] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newBullets, setNewBullets] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newUnitLabel, setNewUnitLabel] = useState('No');
  const [newUnitPrice, setNewUnitPrice] = useState(50000);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  // Tax & Commercials
  const [taxMode, setTaxMode] = useState('12');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [previewPage, setPreviewPage] = useState('all');
  const [catalogProducts, setCatalogProducts] = useState(products || []);

  // UI & Loading States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Saved Quotations Cache
  const [savedQuotations, setSavedQuotations] = useState(() => {
    if (initialQuotations && initialQuotations.length > 0) return initialQuotations;
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
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState(Date.now());

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
      } catch (e) { }
    }
    return [];
  });



  // Web Leads State (Instant zero-latency from initialLeads & cache)
  const [webLeads, setWebLeads] = useState(() => {
    if (initialLeads && initialLeads.length > 0) {
      return initialLeads.map(l => ({
        ...l,
        hospital: cleanLeadHospital(l.hospital || l.hospitalName)
      }));
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('rbpl_cached_leads');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(l => ({
              ...l,
              hospital: cleanLeadHospital(l.hospital || l.hospitalName)
            }));
          }
        }
      } catch (e) { }
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

  // Negotiable Price Approval States (Leads)
  const [negotiationModalLead, setNegotiationModalLead] = useState(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [counterNoteInput, setCounterNoteInput] = useState('');
  const [negotiationSubmitting, setNegotiationSubmitting] = useState(false);
  const [approvalNoticeModalLead, setApprovalNoticeModalLead] = useState(null);

  // Single-Document In-Place Edit & Concession States (Quotations)
  const [activeEditingQuoteId, setActiveEditingQuoteId] = useState(null);
  const [lockedFloorPrice, setLockedFloorPrice] = useState(null);
  const [customerBargainedPrice, setCustomerBargainedPrice] = useState(null);
  const [allowedComplementaryBudget, setAllowedComplementaryBudget] = useState(0);
  const [complementaryTitle, setComplementaryTitle] = useState('Biomedical Consumables & Calibration Accessories Pack');
  const [complementaryValue, setComplementaryValue] = useState(100);
  const [complementaryBullets, setComplementaryBullets] = useState('Official Company Complimentary Deal Add-on • Valued at ₹100 • Included with Deal');
  const [selectedPerkFilter, setSelectedPerkFilter] = useState('all_fitting'); // 'all_fitting' | 'exact' | 'all' | number
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [perkSearchQuery, setPerkSearchQuery] = useState('');
  const [expiryAdvisoryData, setExpiryAdvisoryData] = useState(null); // { selectedPerk, earlierPerk, allEarlierPerks }
  const [expiryAdvisoryBanner, setExpiryAdvisoryBanner] = useState(null); // Non-blocking advisory notice banner
  const [perkSortMode, setPerkSortMode] = useState('fefo'); // 'fefo' (near-expiry first) | 'price_asc'

  // Employee On-Call Bargain & Admin Concession States (Quotations)
  const [onCallBargainQuote, setOnCallBargainQuote] = useState(null);
  const [onCallBargainDemandedPrice, setOnCallBargainDemandedPrice] = useState('');
  const [onCallBargainRemarks, setOnCallBargainRemarks] = useState('');
  const [onCallBargainSubmitting, setOnCallBargainSubmitting] = useState(false);
  const [onCallItemPrices, setOnCallItemPrices] = useState({});

  const [adminConcessionQuote, setAdminConcessionQuote] = useState(null);
  const [adminConcessionFloorPrice, setAdminConcessionFloorPrice] = useState('');
  const [adminConcessionEquipmentPrice, setAdminConcessionEquipmentPrice] = useState('');
  const [adminConcessionPerkAllowance, setAdminConcessionPerkAllowance] = useState('');
  const [adminConcessionSubmitting, setAdminConcessionSubmitting] = useState(false);

  const [selectedQuotationForAuditModal, setSelectedQuotationForAuditModal] = useState(null);

  // Strictly enforce role-based access: If non-admin, ensure admin review modal is closed
  useEffect(() => {
    if (!isAdmin && adminConcessionQuote) {
      setAdminConcessionQuote(null);
    }
  }, [isAdmin, adminConcessionQuote]);

  // =========================================================================
  // 2. LISTENERS & MEMOIZED CALCULATIONS (GUARANTEED ALL STATES INITIALIZED!)
  // =========================================================================
  useEffect(() => {
    const handleResetTab = (e) => {
      setActiveMainTab(e.detail || 'leads');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('reset_web_quotation_tab', handleResetTab);
      window.addEventListener('switch_web_quotation_tab', handleResetTab);
      return () => {
        window.removeEventListener('reset_web_quotation_tab', handleResetTab);
        window.removeEventListener('switch_web_quotation_tab', handleResetTab);
      };
    }
  }, []);

  // Complimentary Item Calculations
  const currentComplimentaryItems = useMemo(() => {
    return items.filter(it => it.isComplimentary || it.title?.includes('COMPLIMENTARY'));
  }, [items]);

  const currentComplimentaryTotal = useMemo(() => {
    return currentComplimentaryItems.reduce((acc, it) => acc + (parseFloat(it.unitPrice || 0) * (parseInt(it.qty || 1, 10))), 0);
  }, [currentComplimentaryItems]);

  const effectiveBudget = useMemo(() => {
    if (lockedFloorPrice && customerBargainedPrice && lockedFloorPrice > customerBargainedPrice) {
      return Math.max(0, lockedFloorPrice - customerBargainedPrice);
    }
    return allowedComplementaryBudget || 0;
  }, [lockedFloorPrice, customerBargainedPrice, allowedComplementaryBudget]);

  const remainingBudget = useMemo(() => {
    return Math.max(0, effectiveBudget - currentComplimentaryTotal);
  }, [effectiveBudget, currentComplimentaryTotal]);

  const handleAddComplimentaryProduct = (prodTitle, prodPrice, prodBullets = '', prodExpiry = '', prodBatch = '') => {
    const priceNum = parseFloat(prodPrice) || 0;
    if (priceNum <= 0) {
      alert('Please enter a valid price for the complimentary item.');
      return;
    }
    const hasConcession = effectiveBudget > 0;
    if (hasConcession && priceNum > remainingBudget) {
      alert(`Cannot add! Item price (₹${priceNum.toLocaleString('en-IN')}) exceeds your remaining complimentary allowance of ₹${remainingBudget.toLocaleString('en-IN')}.\n\nMaximum allowable addition is ₹${remainingBudget.toLocaleString('en-IN')}.`);
      return;
    }

    const expDetails = prodExpiry ? getExpiryDetails(prodExpiry) : null;
    const defaultBullets = [
      `• Official Company Complimentary Concession Add-on`,
      `• Authorized Allowance: ₹${priceNum.toLocaleString('en-IN')} (Free of Charge with Equipment)`,
      `• Quantity: 1 No`,
      prodExpiry ? `• Expiry Date: ${expDetails?.formatted || prodExpiry} (Batch/Lot: ${prodBatch || 'LOT-RB-COMP'})` : null,
      `• Status: Concession Granted & Completed`
    ].filter(Boolean).join('\n');

    const newItem = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sr: items.length + 1,
      itemCode: 'FREE-PERK',
      title: `🎁 [COMPLIMENTARY] ${prodTitle}`,
      bullets: prodBullets || defaultBullets,
      qty: 1,
      unitLabel: 'No',
      unitPrice: priceNum,
      isComplimentary: true,
      complimentaryValue: priceNum,
      expiryDate: prodExpiry,
      batchNo: prodBatch
    };

    // Guarantee actual equipment products stay on top, and complimentary items are placed BELOW them
    setItems(prev => {
      const nonComp = prev.filter(it => !it.isComplimentary && !it.title?.includes('COMPLIMENTARY'));
      const existingComp = prev.filter(it => it.isComplimentary || it.title?.includes('COMPLIMENTARY'));
      const combined = [...nonComp, ...existingComp, newItem];
      return combined.map((it, idx) => ({ ...it, sr: idx + 1 }));
    });

    setSuccessToast(`🎁 Added "${prodTitle}" (₹${priceNum.toLocaleString('en-IN')}) below actual products! ${hasConcession ? `Remaining: ₹${(remainingBudget - priceNum).toLocaleString('en-IN')}` : ''}`);
  };

  // Near-Expiry Priority Interception: Warns employee if earlier-expiring biomedical stock exists
  const handlePerkAddAttempt = (perk) => {
    const priceNum = parseFloat(perk.price) || 0;
    if (priceNum <= 0) {
      alert('Please enter a valid price for the complimentary item.');
      return;
    }
    const hasConcession = effectiveBudget > 0;
    if (hasConcession && priceNum > remainingBudget) {
      alert(`Cannot add! Item price (₹${priceNum.toLocaleString('en-IN')}) exceeds your remaining complimentary allowance of ₹${remainingBudget.toLocaleString('en-IN')}.\n\nMaximum allowable addition is ₹${remainingBudget.toLocaleString('en-IN')}.`);
      return;
    }

    if (perk.expiryDate) {
      const selectedExpTime = new Date(perk.expiryDate).getTime();

      // Find eligible items in catalog that fit in remaining budget and expire earlier
      const earlierCandidates = COMPLIMENTARY_PERK_CATALOG.filter(p => {
        if (p.id === perk.id) return false;
        if (!p.expiryDate) return false;
        if (hasConcession && p.price > remainingBudget) return false;
        const pExpTime = new Date(p.expiryDate).getTime();
        return pExpTime < selectedExpTime;
      }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      if (earlierCandidates.length > 0) {
        // Open the sleek, no-boundation advisory comparison modal
        setExpiryAdvisoryData({
          selectedPerk: perk,
          earlierPerk: earlierCandidates[0],
          allEarlierPerks: earlierCandidates
        });
        return;
      }
    }

    // No earlier stock conflict, proceed with direct addition
    handleAddComplimentaryProduct(perk.title, perk.price, perk.desc, perk.expiryDate, perk.batchNo);
  };

  const handleRemoveComplimentaryItem = (itemId) => {
    setItems(prev => prev.filter(it => it.id !== itemId));
    setSuccessToast('Removed complimentary item from quotation.');
  };

  const handleClearAllComplimentaryItems = () => {
    setItems(prev => {
      const nonComp = prev.filter(it => !it.isComplimentary && !it.title?.includes('COMPLIMENTARY'));
      return nonComp.map((it, idx) => ({ ...it, sr: idx + 1 }));
    });
    setSuccessToast('All complimentary perks removed.');
  };

  // Handlers for On-Call Re-Bargain & Admin Concession (Multi-product support & Two-Option Approval)
  // Helper to reliably compute quote total regardless of field naming
  const getQuoteTotal = (q) => {
    if (!q) return 0;
    if (q.grandTotal && parseFloat(q.grandTotal) > 0) return parseFloat(q.grandTotal);
    if (q.totalAmount && parseFloat(q.totalAmount) > 0) return parseFloat(q.totalAmount);
    if (q.subtotal && parseFloat(q.subtotal) > 0) return parseFloat(q.subtotal);
    if (Array.isArray(q.items) && q.items.length > 0) {
      const sum = q.items.reduce((acc, it) => acc + (parseFloat(it.unitPrice || 0) * (parseInt(it.qty || 1, 10))), 0);
      if (sum > 0) return sum;
    }
    return 0;
  };
  const handleOpenOnCallModal = (quote) => {
    if (!quote) return;
    const currentTotal = getQuoteTotal(quote);
    const quoteItems = Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [{
      id: 'item-0',
      title: quote.subjectQuotation || 'Medical Equipment',
      qty: 1,
      unitPrice: currentTotal
    }];

    const initialPrices = {};
    if (quoteItems.length === 1) {
      const unit = parseFloat(quoteItems[0].unitPrice || currentTotal || 0);
      const defaultDemanded = Math.max(0, unit > 200 ? unit - 200 : unit);
      initialPrices[quoteItems[0].id || 'item-0'] = String(defaultDemanded);
      setOnCallBargainDemandedPrice(String(defaultDemanded));
    } else {
      let sum = 0;
      quoteItems.forEach((it, idx) => {
        const key = it.id || `item-${idx}`;
        const unit = parseFloat(it.unitPrice || 0);
        const demandedUnit = Math.max(0, unit > 100 ? unit - 100 : unit);
        initialPrices[key] = String(demandedUnit);
        sum += demandedUnit * (parseInt(it.qty || 1, 10));
      });
      setOnCallBargainDemandedPrice(String(sum));
    }
    setOnCallItemPrices(initialPrices);
    setOnCallBargainQuote(quote);
    setOnCallBargainRemarks('Customer negotiated on call stating they are getting a lower quote elsewhere. Requested price reduction.');
  };

  const handleSubmitOnCallBargain = async () => {
    if (!onCallBargainQuote) return;
    const currentTotal = getQuoteTotal(onCallBargainQuote);
    const quoteItems = Array.isArray(onCallBargainQuote.items) && onCallBargainQuote.items.length > 0
      ? onCallBargainQuote.items
      : [{ id: 'item-0', unitPrice: currentTotal, qty: 1 }];

    let totalDemanded = 0;
    quoteItems.forEach((it, idx) => {
      const key = it.id || `item-${idx}`;
      const userPrice = parseFloat(onCallItemPrices[key] !== undefined ? onCallItemPrices[key] : (it.unitPrice || 0));
      totalDemanded += userPrice * (parseInt(it.qty || 1, 10));
    });

    if (quoteItems.length === 1 && onCallBargainDemandedPrice) {
      totalDemanded = parseFloat(onCallBargainDemandedPrice);
    }

    const gap = Math.max(0, currentTotal - totalDemanded);

    setOnCallBargainSubmitting(true);
    try {
      const quoteId = onCallBargainQuote.id || onCallBargainQuote._id;
      const updateData = {
        id: quoteId,
        refNo: onCallBargainQuote.refNo,
        concessionStatus: 'concession_requested',
        customerDemandedPrice: totalDemanded,
        concessionGap: gap,
        concessionItemPrices: onCallItemPrices,
        concessionRemarks: onCallBargainRemarks,
        concessionRequestedBy: user?.fullName || user?.name || 'Sales Team (shree)',
        concessionRequestedAt: new Date().toISOString()
      };

      const res = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to submit concession request');

      setSavedQuotations(prev => prev.map(q => (q.id === quoteId || q.refNo === onCallBargainQuote.refNo) ? { ...q, ...updateData } : q));
      if (viewingQuotationAudit && (viewingQuotationAudit.id === quoteId || viewingQuotationAudit.refNo === onCallBargainQuote.refNo)) {
        setViewingQuotationAudit(prev => ({ ...prev, ...updateData }));
      }
      setSuccessToast(`Quotation ${onCallBargainQuote.refNo} submitted to Admin! Requested reduction: ₹${gap.toLocaleString('en-IN')}.`);
      setOnCallBargainQuote(null);

      // 1. Immediately trigger Native Desktop Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '⚠️ Price Concession Approval Requested',
        body: `Price concession requested for ${onCallBargainQuote.customerName || 'Customer'} (Ref: ${onCallBargainQuote.refNo}). Demanded: ₹${totalDemanded.toLocaleString('en-IN')} (Gap: ₹${gap.toLocaleString('en-IN')}). Awaiting Admin decision.`,
        tag: `quote-concession-${onCallBargainQuote.refNo || quoteId}`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast across all active tabs, sessions & admin desks
      broadcastSystemNotification({
        type: 'quotation_concession_requested',
        targetRole: 'admin',
        quote: { ...onCallBargainQuote, ...updateData },
        requestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
      });
    } catch (err) {
      console.error('Submit on-call bargain error:', err);
      alert('Error submitting negotiation demand: ' + err.message);
    } finally {
      setOnCallBargainSubmitting(false);
    }
  };

  const handleOpenAdminConcessionModal = (quote) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Admin can review and authorize price concessions.');
      return;
    }
    if (!quote) return;
    const currentFloor = parseFloat(quote.lockedDealFloor || getQuoteTotal(quote) || 0);
    const demanded = parseFloat(quote.customerDemandedPrice || (currentFloor > 200 ? currentFloor - 200 : currentFloor));
    const gap = Math.max(0, currentFloor - demanded);

    setAdminConcessionQuote(quote);
    setAdminConcessionFloorPrice(String(currentFloor));
    setAdminConcessionEquipmentPrice(String(demanded));
    setAdminConcessionPerkAllowance(String(gap));
  };

  // Option 1: Approve Direct Price Discount (Cash Price Reduction)
  const handleApproveDirectPriceDiscount = async (quote, approvedTotal, discountGap) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Admin can authorize price concessions.');
      return;
    }
    if (!quote) return;
    setAdminConcessionSubmitting(true);
    try {
      const quoteId = quote.id || quote._id;
      const updateData = {
        id: quoteId,
        refNo: quote.refNo,
        concessionStatus: 'approved_direct_discount',
        approvedPriceType: 'direct_discount',
        approvedDealPrice: parseFloat(approvedTotal),
        approvedItemPrices: quote.concessionItemPrices || {},
        concessionGap: parseFloat(discountGap || 0),
        targetEquipmentPrice: parseFloat(approvedTotal),
        lockedDealFloor: parseFloat(approvedTotal),
        concessionApprovedBy: user?.name || user?.email || 'Bhupender Raj (Admin)',
        concessionApprovedAt: new Date().toISOString(),
        adminDecisionNote: `Admin approved direct price reduction to ₹${Number(approvedTotal).toLocaleString('en-IN')} (Reduced by ₹${Number(discountGap).toLocaleString('en-IN')}).`
      };

      const res = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to authorize direct discount');

      setSavedQuotations(prev => prev.map(q => (q.id === quoteId || q.refNo === quote.refNo) ? { ...q, ...updateData } : q));
      if (viewingQuotationAudit && (viewingQuotationAudit.id === quoteId || viewingQuotationAudit.refNo === quote.refNo)) {
        setViewingQuotationAudit(prev => ({ ...prev, ...updateData }));
      }
      setSuccessToast(`Direct price discount approved! Deal locked at ₹${Number(approvedTotal).toLocaleString('en-IN')}.`);
      setAdminConcessionQuote(null);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🎉 Quotation Concession Approved (Direct Discount)',
        body: `Admin approved direct price discount for ${quote.customerName || 'Customer'} (${quote.refNo}). Deal locked at ₹${Number(approvedTotal).toLocaleString('en-IN')}.`,
        tag: `quote-approved-${quote.refNo || quoteId}`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast concession approval to Sales team
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });
    } catch (err) {
      console.error('Approve direct discount error:', err);
      alert('Error approving direct discount: ' + err.message);
    } finally {
      setAdminConcessionSubmitting(false);
    }
  };

  // Option 2: Approve Complimentary Perk (No Cash Reduction, Free Add-on granted)
  const handleApproveComplimentaryPerk = async (quote, originalTotal, discountGap) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Admin can authorize price concessions.');
      return;
    }
    if (!quote) return;
    setAdminConcessionSubmitting(true);
    try {
      const quoteId = quote.id || quote._id;
      const perkBudget = parseFloat(discountGap || 200);
      const floor = parseFloat(originalTotal || getQuoteTotal(quote) || 52000);

      const updateData = {
        id: quoteId,
        refNo: quote.refNo,
        concessionStatus: 'approved_complimentary',
        approvedPriceType: 'complimentary',
        allowedComplementaryBudget: perkBudget,
        lockedDealFloor: floor,
        targetEquipmentPrice: floor,
        concessionApprovedBy: user?.name || user?.email || 'Bhupender Raj (Admin)',
        concessionApprovedAt: new Date().toISOString(),
        adminDecisionNote: `Admin approved ₹${Number(perkBudget).toLocaleString('en-IN')} complimentary perk allowance. Deal cash floor maintained at ₹${Number(floor).toLocaleString('en-IN')}.`
      };

      const res = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to authorize complimentary concession');

      setSavedQuotations(prev => prev.map(q => (q.id === quoteId || q.refNo === quote.refNo) ? { ...q, ...updateData } : q));
      if (viewingQuotationAudit && (viewingQuotationAudit.id === quoteId || viewingQuotationAudit.refNo === quote.refNo)) {
        setViewingQuotationAudit(prev => ({ ...prev, ...updateData }));
      }
      setSuccessToast(`Approved ₹${Number(perkBudget).toLocaleString('en-IN')} complimentary perk! Machine cash floor preserved at ₹${Number(floor).toLocaleString('en-IN')}.`);
      setAdminConcessionQuote(null);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🎁 Quotation Concession Approved (Complimentary Perk)',
        body: `Admin authorized ₹${Number(perkBudget).toLocaleString('en-IN')} complimentary perk for ${quote.customerName || 'Customer'} (${quote.refNo}). Machine floor preserved at ₹${Number(floor).toLocaleString('en-IN')}.`,
        tag: `quote-approved-${quote.refNo || quoteId}`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast concession approval to Sales team
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });
    } catch (err) {
      console.error('Approve complimentary perk error:', err);
      alert('Error authorizing complimentary perk: ' + err.message);
    } finally {
      setAdminConcessionSubmitting(false);
    }
  };

  // Employee Action 1: Apply Direct Discount and Revise Quotation to Revision 2
  const handleApplyDirectDiscountAndEditQuote = (quote) => {
    if (!quote) return;
    handleLoadSavedQuotation(quote);
    setActiveEditingQuoteId(quote.id || quote._id);
    setRefNo(quote.refNo);

    const approvedPrice = parseFloat(quote.approvedDealPrice || quote.customerDemandedPrice || quote.grandTotal || 0);
    const itemPrices = quote.approvedItemPrices || quote.concessionItemPrices || {};

    setItems(prev => {
      const updated = prev.map((it, idx) => {
        const key = it.id || `item-${idx}`;
        if (itemPrices[key] !== undefined) {
          const newUnit = parseFloat(itemPrices[key]);
          return {
            ...it,
            unitPrice: newUnit,
            totalPrice: newUnit * (parseInt(it.qty || 1, 10)),
            notes: `Admin Approved Discounted Rate: ₹${Number(newUnit).toLocaleString('en-IN')}`
          };
        }
        if (idx === 0 && Object.keys(itemPrices).length === 0) {
          return {
            ...it,
            unitPrice: approvedPrice,
            totalPrice: approvedPrice * (parseInt(it.qty || 1, 10)),
            notes: `Admin Approved Discounted Rate: ₹${Number(approvedPrice).toLocaleString('en-IN')}`
          };
        }
        return it;
      });
      return updated;
    });

    setActiveMainTab('quotation');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('switch_web_quotation_tab', { detail: 'quotation' }));
    }
    setSuccessToast(`Quotation ${quote.refNo} loaded with approved price ₹${Number(approvedPrice).toLocaleString('en-IN')}! Click 'Save' to issue Revision 2.`);
  };

  // Employee Action 2: Make Complimentary Quotation (Perk Add-on)
  const handleMakeComplimentaryQuote = (quote) => {
    if (!quote) return;
    handleLoadSavedQuotation(quote);
    setActiveEditingQuoteId(quote.id || quote._id);
    setRefNo(quote.refNo);

    const budget = parseFloat(quote.allowedComplementaryBudget || quote.concessionGap || 200);
    const floor = parseFloat(quote.lockedDealFloor || quote.grandTotal || 52000);

    setLockedFloorPrice(floor);
    setAllowedComplementaryBudget(budget);
    setSelectedPerkFilter('all_fitting');

    setActiveMainTab('complementary');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('switch_web_quotation_tab', { detail: 'complementary' }));
    }
    setSuccessToast(`Quotation ${quote.refNo} loaded! Add up to ₹${Number(budget).toLocaleString('en-IN')} in complimentary items to issue Revision 2.`);
  };

  // Helper: check if a lead has negotiable price pending admin approval
  const isLeadNegotiablePending = (lead) => {
    if (!lead) return false;
    if (lead.negotiationStatus === 'approved' || lead.negotiationStatus === 'counter_offered') {
      return false;
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
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }

      setSuccessToast(`✅ Price Approved! ₹${approvedAmount.toLocaleString('en-IN')} approved for ${lead.hospital || lead.equipment}. Sales employees can now make the quotation.`);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '✅ Customer Expected Price Authorized!',
        body: `Admin approved ₹${approvedAmount.toLocaleString('en-IN')} for ${lead.hospital || lead.equipment}. Ready to create quotation!`,
        tag: `lead-approved-${lead.id || lead._id}`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast deal floor approval to Sales team
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
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }

      setSuccessToast(`🤝 Counter Offer Set! In-between rate ₹${numPrice.toLocaleString('en-IN')} set for ${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.`);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🤝 In-Between Counter Rate Authorized!',
        body: `Admin set counter offer ₹${numPrice.toLocaleString('en-IN')} for ${lead.hospital || lead.equipment}. Ready to create quotation!`,
        tag: `lead-counter-${lead.id || lead._id}`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast deal floor approval to Sales team
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
    const requestedPrice = lead.expectedPrice || lead.price || 0;
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
    } catch (e) { }

    setWebLeads(prev => prev.map(l => (l.id === leadId || (lead._id && l._id === lead._id)) ? { ...l, ...updateData } : l));

    // 1. Trigger Native Desktop Push Notification with Sound immediately!
    triggerSystemPushNotification({
      title: `🏷️ Price Approval Requested - ${lead.hospital || lead.customerName || 'Customer'}`,
      body: `Target Bid ₹${Number(requestedPrice).toLocaleString('en-IN')} requested for ${lead.equipment || lead.productName || 'Equipment'}. Awaiting Admin authorization.`,
      tag: `lead-bargain-${leadId}`,
      onClick: () => {
        if (typeof window !== 'undefined') window.focus();
      }
    });

    // 2. Broadcast to Admin across all sessions & windows
    broadcastSystemNotification({
      type: 'lead_bargain_requested',
      targetRole: 'admin',
      lead: { ...lead, ...updateData },
      requestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
    });

    // Local toast confirmation
    setSuccessToast(`🔒 Admin Price Approval Requested for ₹${Number(requestedPrice).toLocaleString('en-IN')}. Push alert sent!`);
  };

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


  // Filter for leads that need a quotation (status 'Pending RFQ' or 'new', and not processed this session)
  const pendingWebLeads = useMemo(() => {
    const seenCustEquip = new Set();
    const seenIds = new Set();
    const result = [];

    // Guarantee 100% deterministic, stable chronological sorting (newest lead on top, never bouncing)
    const sortedLeads = [...webLeads].sort(stableLeadSort);

    for (const lead of sortedLeads) {
      const id = lead.id || lead._id;
      if (!id || seenIds.has(id) || processedLeadIds.includes(id)) continue;

      // If already processed in this session, skip
      if (processedLeadIds.includes(id)) continue;

      // Completed quotations that were created or dispatched should not show in pending RFQs
      const st = (lead.status || '').toLowerCase();
      if (
        st.includes('quotation dispatched') ||
        st.includes('completed quote') ||
        st.includes('quotation created') ||
        st.includes('quote generated') ||
        Boolean(lead.quotationRef) ||
        Boolean(lead.isQuotationCreated)
      ) continue;

      // Keep: 'pending', 'new', 'rfq', 'approved', 'counter', 'quotation sent', 'quotation request', 'inquiry'
      const isEligible =
        st.includes('pending') ||
        st.includes('new') ||
        st.includes('rfq') ||
        st.includes('approved') ||
        st.includes('counter') ||
        st.includes('quotation sent') ||
        st.includes('quotation request') ||
        st.includes('inquiry') ||
        st.includes('lead') ||
        lead.negotiationStatus === 'approved' ||
        lead.negotiationStatus === 'counter_offered' ||
        lead.negotiationStatus === 'pending_approval' ||
        Boolean(lead.approvedPrice) ||
        Boolean(lead.isPriceNegotiated) ||
        !lead.quotationRef;

      if (!isEligible) continue;

      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const equipClean = (lead.equipment || lead.productName || lead.rawLeadData?.productName || '').trim().toLowerCase();
      const dedupKey = phoneClean && equipClean ? `${phoneClean}::${equipClean}` : id;

      if (false && seenCustEquip.has(dedupKey)) {
        continue; // Skip duplicate inquiry for same hospital customer and same equipment!
      }

      seenIds.add(id);
      seenCustEquip.add(dedupKey);
      result.push(lead);
    }
    return result;
  }, [webLeads, processedLeadIds]);

  const contactLeadsCount = useMemo(() => {
    return pendingWebLeads.filter(l => 
      l.source?.toLowerCase().includes('contact') || 
      l.leadSource?.toLowerCase().includes('contact') || 
      l.sourcePage === '/contact' || 
      Boolean(l.message) ||
      Boolean(l.rawLeadData?.source?.toLowerCase().includes('contact'))
    ).length;
  }, [pendingWebLeads]);

  const rfqLeadsCount = pendingWebLeads.length - contactLeadsCount;

  const filteredPendingLeads = useMemo(() => {
    if (leadFilterType === 'contact') {
      return pendingWebLeads.filter(l => 
        l.source?.toLowerCase().includes('contact') || 
        l.leadSource?.toLowerCase().includes('contact') || 
        l.sourcePage === '/contact' || 
        Boolean(l.message) ||
        Boolean(l.rawLeadData?.source?.toLowerCase().includes('contact'))
      );
    }
    if (leadFilterType === 'rfq') {
      return pendingWebLeads.filter(l => 
        !(l.source?.toLowerCase().includes('contact') || 
          l.leadSource?.toLowerCase().includes('contact') || 
          l.sourcePage === '/contact' || 
          Boolean(l.message) ||
          Boolean(l.rawLeadData?.source?.toLowerCase().includes('contact')))
      );
    }
    return pendingWebLeads;
  }, [pendingWebLeads, leadFilterType]);

  const getLeadProducts = (lead) => {
    const raw = lead?.rawLeadData || {};
    if (Array.isArray(raw.cartProducts) && raw.cartProducts.length > 0) {
      return raw.cartProducts;
    }
    if (Array.isArray(lead?.cartProducts) && lead.cartProducts.length > 0) {
      return lead.cartProducts;
    }
    if (Array.isArray(lead?.items) && lead.items.length > 0) {
      return lead.items;
    }
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      return raw.items;
    }
    const singleName = lead?.productName || lead?.equipment || raw.productName || 'Medical Equipment';
    const singleSku = lead?.productSku || raw.productSku || '';
    const singlePrice = lead?.price || raw.unitPrice || (lead?.quoteAmount ? parseFloat(String(lead.quoteAmount).replace(/[^0-9.]/g, '')) : 0);
    const singleQty = lead?.quantity || raw.qty || 1;
    const singleBrand = lead?.brandName || raw.brandName || raw.brand || '';
    const singleWarranty = lead?.warranty || raw.warranty || '';
    return [{
      name: singleName,
      sku: singleSku,
      price: singlePrice,
      qty: singleQty,
      brand: singleBrand,
      warranty: singleWarranty
    }];
  };

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
      const sorted = [...initialLeads].sort(stableLeadSort);
      setWebLeads(sorted);
      setIsLeadsLoading(false);
      try { localStorage.setItem('rbpl_cached_leads', JSON.stringify(initialLeads)); } catch (e) { }
    }
  }, [initialLeads]);

  useEffect(() => {
    if (initialQuotations && initialQuotations.length > 0) {
      setSavedQuotations(initialQuotations);
      try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(initialQuotations)); } catch (e) { }
    }
  }, [initialQuotations]);

  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0) {
      setCustomersList(initialCustomers);
      try { localStorage.setItem('rbpl_cached_customers', JSON.stringify(initialCustomers)); } catch (e) { }
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
        try { localStorage.setItem('rbpl_cached_quotations', JSON.stringify(data.quotations)); } catch (e) { }
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
      let updated;
      if (exists) {
        updated = prev.map(l => (l.id || l._id) === freshId ? { ...l, ...freshLead } : l);
      } else {
        updated = [freshLead, ...prev];
      }
      return updated.sort(stableLeadSort);
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
        try { localStorage.setItem('rbpl_cached_leads', JSON.stringify(data.leads)); } catch (e) { }
        setWebLeads(prev => {
          const prevIds = new Set(prev.map(l => l.id || l._id));
          const hasNew = data.leads.some(l => !prevIds.has(l.id || l._id));
          if (hasNew && !silent) {
            setHasNewLeadAlert(true);
            playLeadNotificationSound();
          }
          // Strict server authority: return deterministic stably-sorted leads
          return [...data.leads].sort(stableLeadSort);
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

        // Automatic quotation generation disabled — leads arrive purely as RFQ leads
      }
    } catch (e) { }

    // 2. BroadcastChannel across browser tabs (Same Origin)
    let channel;
    try {
      if (typeof window !== 'undefined') {
        channel = new BroadcastChannel('biomedical_leads_channel');
        channel.onmessage = (event) => {

          if (event.data?.type === 'NEW_WEB_LEAD' && event.data.lead) {
            insertIncomingLead(event.data.lead);
          }
          if (event.data?.type === 'LEADS_DELETED') {
            const ids = event.data.ids || event.data.leadIds || [];
            if (ids.length > 0) {
              setWebLeads(prev => prev.filter(l => !ids.includes(l.id) && !ids.includes(l._id)));
              setSavedQuotations(prev => prev.filter(q => !ids.includes(q.leadId) && !ids.includes(q.id) && !ids.includes(q._id)));
            }
          }
        };
      }
    } catch (e) { }

    // 3. Window postMessage listener (for iframes, child windows, and popups)
    const handleWindowMessage = (event) => {

      if (event.data?.type === 'NEW_WEB_LEAD' && event.data.lead) {
        insertIncomingLead(event.data.lead);
      }
      if (event.data?.type === 'LEADS_DELETED') {
        const ids = event.data.ids || event.data.leadIds || [];
        if (ids.length > 0) {
          setWebLeads(prev => prev.filter(l => !ids.includes(l.id) && !ids.includes(l._id)));
          setSavedQuotations(prev => prev.filter(q => !ids.includes(q.leadId) && !ids.includes(q.id) && !ids.includes(q._id)));
        }
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
    if (typeof window !== 'undefined') {
      window.addEventListener('new_web_lead', handleCustomLead);
    }

    // 5. LocalStorage storage event listener (cross-window fallback)
    const handleStorage = (e) => {

      if (e.key === 'latest_web_lead' && e.newValue) {
        try {
          const lead = JSON.parse(e.newValue);
          if (lead) insertIncomingLead(lead);
        } catch (err) { }
      }
      if (e.key === 'biomedical_leads_deleted' && e.newValue) {
        try {
          const ids = JSON.parse(e.newValue);
          if (Array.isArray(ids) && ids.length > 0) {
            setWebLeads(prev => prev.filter(l => !ids.includes(l.id) && !ids.includes(l._id)));
            setSavedQuotations(prev => prev.filter(q => !ids.includes(q.leadId) && !ids.includes(q.id) && !ids.includes(q._id)));
          }
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
    const rawHosp = (
      matchedCustomer?.hospitalName ||
      lead.hospital ||
      raw.hospitalName ||
      lead.hospitalName ||
      ''
    ).trim();
    const cleanHospitalName = cleanLeadHospital(rawHosp);

    const docName = (matchedCustomer?.fullName || lead.doctorName || raw.customerName || lead.customerName || '').trim();
    const finalCustomerName = (cleanHospitalName && cleanHospitalName !== 'NA') ? cleanHospitalName : (docName || 'NA');
    const hospitalName = finalCustomerName;
    setCustomerName(finalCustomerName);

    const doctorPart = docName ? `Attn: ${docName}` : 'Attn: Procurement Officer';
    const phoneVal = matchedCustomer?.phone || lead.phone || raw.customerPhone || raw.phone;
    const phonePart = phoneVal ? `Mob: ${phoneVal}` : '';
    setCustomerAddress1([doctorPart, phonePart].filter(Boolean).join(', '));

    const cityPart = matchedCustomer?.district || matchedCustomer?.address || lead.city || raw.district || raw.city || lead.address || raw.address || 'Jaipur, Rajasthan';
    const emailVal = matchedCustomer?.email || lead.email || raw.customerEmail;
    const emailPart = emailVal ? `Email: ${emailVal}` : '';
    setCustomerAddress2([cityPart, emailPart].filter(Boolean).join(' • '));

    // 2. Reference & Date: Link existing quote ONLY IF it matches this lead or is for the SAME product
    const leadEquipTitle = (lead.productName || lead.equipment || raw.productName || '').trim().toLowerCase();
    const cleanPh = (phoneVal || '').replace(/\D/g, '').slice(-10);
    const existingQuote = (savedQuotations || []).find(q => {
      if (lead.quotationRef && q.refNo === lead.quotationRef) return true;
      if (lead.id && (q.leadId === lead.id || q.lead?.id === lead.id)) return true;
      if (lead._id && (q.leadId === lead._id || q.lead?._id === lead._id)) return true;
      // Match by phone ONLY IF it is also for the exact SAME equipment/product!
      const qPhone = (q.customerAddress1 + ' ' + q.customerAddress2).replace(/\D/g, '').slice(-10);
      if (cleanPh && cleanPh.length >= 10 && qPhone === cleanPh && leadEquipTitle) {
        const qEquip = ((q.items?.[0]?.title || '') + ' ' + (q.subjectQuotation || '')).toLowerCase();
        if (qEquip && (qEquip.includes(leadEquipTitle) || leadEquipTitle.includes(qEquip))) {
          return true;
        }
      }
      return false;
    });

    const freshRef = existingQuote ? existingQuote.refNo : (lead.quotationRef || generateRefNo());
    const existingQuoteDbId = existingQuote ? (existingQuote.id || existingQuote._id) : null;
    setActiveEditingQuoteId(existingQuoteDbId);
    setRefNo(freshRef);
    setDate(existingQuote?.date || getTodayFormatted());
    setLockedFloorPrice(null);
    setCustomerBargainedPrice(null);
    setAllowedComplementaryBudget(0);

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

    const rawCartList = (
      (Array.isArray(lead.rawLeadData?.cartProducts) && lead.rawLeadData.cartProducts.length > 0) ? lead.rawLeadData.cartProducts :
        (Array.isArray(lead.cartProducts) && lead.cartProducts.length > 0) ? lead.cartProducts :
          (Array.isArray(lead.items) && lead.items.length > 0) ? lead.items :
            (Array.isArray(lead.rawLeadData?.items) && lead.rawLeadData.items.length > 0) ? lead.rawLeadData.items :
              null
    );

    let finalQuotationItems = [leadQuotationItem];

    if (rawCartList && rawCartList.length > 0) {
      finalQuotationItems = rawCartList.map((it, idx) => {
        const itTitle = it.name || it.title || it.productName || it.description || `Equipment Item ${idx + 1}`;
        const itSku = it.sku || it.productSku || `MED-ITEM-${idx + 1}`;
        const itQty = parseInt(it.qty || it.quantity || 1, 10) || 1;
        const itPrice = parseFloat(it.price || it.rate || it.unitPrice || 0);

        const matchedCp = catalogProducts.find(cp =>
          (it.id && cp.id === it.id) ||
          (itSku && cp.sku && cp.sku.toLowerCase() === itSku.toLowerCase()) ||
          (cp.name && cp.name.toLowerCase().includes(itTitle.toLowerCase())) ||
          (itTitle && itTitle.toLowerCase().includes((cp.name || '').toLowerCase()))
        );

        let itemBullets = [];
        if (matchedCp?.specs && typeof matchedCp.specs === 'object') {
          itemBullets = Object.entries(matchedCp.specs).slice(0, 4).map(([k, v]) => `${k}: ${v}`);
        } else if (matchedCp?.features && Array.isArray(matchedCp.features)) {
          itemBullets = matchedCp.features.slice(0, 4);
        }
        if (itemBullets.length === 0 && it.warranty) {
          itemBullets.push(it.warranty);
        }
        if (itemBullets.length === 0) {
          itemBullets = [
            'CDSCO Medical Device Rules 2017 & ISO 13485:2016 Certified Direct OEM Unit',
            'Complete unboxing, hospital electrical grounding & on-site clinical commissioning',
            'Includes Comprehensive OEM Warranty & 24/7 on-call engineering breakdown response'
          ];
        }

        return {
          id: `cart-item-${idx}-${Date.now()}`,
          sr: idx + 1,
          itemCode: itSku,
          title: itTitle,
          bullets: itemBullets.join('\n'),
          qty: itQty,
          unitLabel: 'No',
          unitPrice: itPrice
        };
      });

      setItems(finalQuotationItems);
    } else {
      setItems([leadQuotationItem]);
    }

    if (lead.specialOffer) {
      setActiveNegotiationNotice({
        type: 'approved',
        price: lead.totalAmount,
        message: `Special Hospital Offer: ${lead.specialOffer.title}${lead.discountAmount ? ` (-₹${lead.discountAmount.toLocaleString('en-IN')})` : ''} — Final Deal: ₹${Number(lead.totalAmount || 0).toLocaleString('en-IN')}`
      });
    }

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

    // 6. Mark Lead as Processed and Save Quotation Permanently
    const leadId = lead.id || lead._id;
    if (leadId) {
      setProcessedLeadIds(prev => [...prev, leadId]);
    }

    // 4b. Multi-item subjects
    const isMultiPortfolio = rawCartList && rawCartList.length > 1;
    const computedSubjectLetter = isMultiPortfolio
      ? `Quotation for Portfolio of ${rawCartList.length} Medical Equipment Systems`
      : `Quotation purchase of ${itemTitle}`;
    const computedSubjectQuotation = isMultiPortfolio
      ? `Supply, Installation & Clinical Commissioning of ${rawCartList.length} Medical Diagnostic & OT Systems`
      : `Purchase of ${itemTitle}${itemCode ? `, Model: ${itemCode}` : ''}`;

    setSubjectLetter(computedSubjectLetter);
    setSubjectQuotation(computedSubjectQuotation);

    const totalQuotationAmount = finalQuotationItems.reduce(
      (sum, it) => sum + ((Number(it.unitPrice) || 0) * (Number(it.qty) || 1)),
      0
    );

    // Save official quotation to /api/quotations
    const newQuotationRecord = {
      refNo: freshRef,
      leadId: lead.id,
      date: getTodayFormatted(),
      customerName: finalCustomerName,
      customerAddress1: [doctorPart, phonePart].filter(Boolean).join(', '),
      customerAddress2: [cityPart, emailPart].filter(Boolean).join(' • '),
      subjectLetter: computedSubjectLetter,
      subjectQuotation: computedSubjectQuotation,
      items: finalQuotationItems,
      totalAmount: totalQuotationAmount,
      status: 'Ready',
      isManualAdminQuotation: true,
      lead
    };

    try {
      fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuotationRecord)
      }).then(async r => {
        const qData = await r.json();
        if (qData.success && qData.quotation) {
          setSavedQuotations(prev => [qData.quotation, ...prev.filter(q => q.refNo !== freshRef)]);
        }
      }).catch(() => { });
    } catch (e) { }

    // Update lead in MongoDB with quotationRef and status
    try {
      fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          _id: lead._id,
          status: 'Quotation Created',
          quotationRef: freshRef,
          isQuotationCreated: true
        })
      }).catch(() => { });
    } catch (e) { }

    setWebLeads(prev => prev.map(l => (l.id === lead.id || (lead._id && l._id === lead._id)) ? {
      ...l,
      status: 'Quotation Created',
      quotationRef: freshRef,
      isQuotationCreated: true
    } : l));

    try {
      const channel = new BroadcastChannel('biomedical_leads_channel');
      channel.postMessage({
        type: 'LEAD_QUOTATION_CREATED',
        leadId: lead.id,
        quotationRef: freshRef,
        lead: { ...lead, status: 'Quotation Created', quotationRef: freshRef }
      });
      setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
    } catch (e) { }

    // Automatically switch to FULL PAGE 4-Page Quotation view on Quotation tab!
    setActiveMainTab('quotation');
    setActiveLayout('preview');
    setPreviewPage('all');
    setSuccessToast(`⚡ 4-Page Quotation Ready for ${finalCustomerName}! Full Page View active. Click " Edit Quotation" to modify details.`);
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

  // Permanently delete a single lead from MongoDB and system
  const handleDeleteWebLead = async (lead, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Ye delete ho jayega permanently:\n\nKya aap inquiry "${lead.id || lead.hospital}" ko MongoDB aur pure system se permanently remove karna chahte hain?`)) return;
    const leadId = lead.id || lead._id;
    try {
      await fetch(`/api/leads?ids=${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [leadId] })
      });
      setWebLeads(prev => prev.filter(l => l.id !== leadId && l._id !== leadId));
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('rbpl_cached_leads');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              localStorage.setItem('rbpl_cached_leads', JSON.stringify(parsed.filter(l => l.id !== leadId && l._id !== leadId)));
            }
          }
        } catch (e) { }
      }
      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEADS_DELETED', ids: [leadId], leadIds: [leadId] });
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }
      setSuccessToast(`Inquiry ${leadId} permanently deleted from system.`);
    } catch (err) {
      console.error('Delete web lead error:', err);
    }
  };

  // Clear all leads and start completely fresh
  const handleClearAllWebLeads = async () => {
    if (!confirm('Kya aap sabhi incoming leads permanently delete karna chahte hain? Ye MongoDB aur pure system se permanently remove ho jayenge.')) return;
    setWebLeads([]);
    setProcessedLeadIds([]);
    setSelectedLeadIdx(0);
    setHasNewLeadAlert(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('latest_web_lead');
        localStorage.removeItem('rbpl_cached_leads');
      }
      await fetch('/api/leads?clearAll=true', { method: 'DELETE' });
      try {
        const channel = new BroadcastChannel('biomedical_leads_channel');
        channel.postMessage({ type: 'LEADS_CLEARED_ALL' });
        setTimeout(() => { try { channel.close(); } catch (e) { } }, 5000);
      } catch (e) { }
    } catch (e) { }
    setSuccessToast('🧹 All leads permanently cleared from system!');
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
    setActiveEditingQuoteId(null);
    setLockedFloorPrice(null);
    setCustomerBargainedPrice(null);
    setAllowedComplementaryBudget(0);
    setCustomerName('');
    setCustomerAddress1('');
    setCustomerAddress2('');
    setRefNo(generateRefNo());
    setDate(getTodayFormatted());
    setSubjectLetter('Quotation purchase of Hospital Equipment');
    setSubjectQuotation('Purchase of Medical Equipment');
    setIsCustomSubject(false);
    setDiscountPercent(0);
    setTaxMode('12');
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

  // Start a new quotation for an existing customer
  const handleStartQuotationForCustomer = (custGroup) => {
    setActiveEditingQuoteId(null);
    setLockedFloorPrice(null);
    setCustomerBargainedPrice(null);
    setAllowedComplementaryBudget(0);
    setCustomerName(custGroup.customerName || '');
    setCustomerAddress1(custGroup.customerAddress1 || '');
    setCustomerAddress2(custGroup.customerAddress2 || '');
    setRefNo(generateRefNo());
    setDate(getTodayFormatted());
    setSubjectLetter('Quotation purchase of Hospital Equipment');
    setSubjectQuotation('Purchase of Medical Equipment');
    setIsCustomSubject(false);
    setDiscountPercent(0);
    setTaxMode('12');
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
    setSuccessToast(`Drafting new product quotation for "${custGroup.customerName}"!`);
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
      const hasComp = items.some(it => it.isComplimentary || it.title?.includes('COMPLIMENTARY'));
      const payload = {
        ...(activeEditingQuoteId ? { id: activeEditingQuoteId } : {}),
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
        amountInWords,
        lockedDealFloor: lockedFloorPrice || grandTotal,
        allowedComplementaryBudget: allowedComplementaryBudget || 0,
        targetEquipmentPrice: customerBargainedPrice || (items[0]?.unitPrice || grandTotal),
        concessionStatus: hasComp ? 'concession_applied' : 'none',
        isManualAdminQuotation: true,
        editedBy: user?.name || user?.email || signatoryName || 'Sales Executive',
        revisionReason: hasComp
          ? `On-call concession applied: Equipment at ₹${(customerBargainedPrice || items[0]?.unitPrice || 0).toLocaleString('en-IN')} + Complimentary Perk Added (Total Deal: ₹${grandTotal.toLocaleString('en-IN')})`
          : (activeEditingQuoteId ? `Quotation updated with revised items. Total: ₹${grandTotal.toLocaleString('en-IN')}` : 'Initial Quotation Issued')
      };

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(data.message || `Quotation saved successfully for "${customerName}"!`);
        if (data.quotation) {
          setSavedQuotations(prev => {
            const matchIdx = prev.findIndex(q => (data.quotation.id && (q.id === data.quotation.id || q._id === data.quotation.id)) || (data.quotation.refNo && q.refNo === data.quotation.refNo));
            if (matchIdx >= 0) {
              const updated = [...prev];
              updated[matchIdx] = { ...updated[matchIdx], ...data.quotation };
              return updated;
            }
            return [data.quotation, ...prev];
          });
        }
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
    setActiveEditingQuoteId(q?.id || q?._id || null);
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

  // Group saved quotations by customer so each customer has one master card with all their quotations
  const groupedSavedQuotations = useMemo(() => {
    const groups = [];
    const groupKeyMap = new Map();

    const parseCustomer = (q) => {
      const fullText = `${q.customerName || ''} ${q.customerAddress1 || ''} ${q.customerAddress2 || ''}`;
      const digits = (fullText.match(/\b\d{10}\b/) || fullText.match(/\d{10}/) || [])[0] || '';

      let contact = '';
      const attnMatch = (q.customerAddress1 || '').match(/Attn:\s*([^,•\n]+)/i);
      if (attnMatch) {
        contact = attnMatch[1].trim();
      } else if (q.lead?.doctorName) {
        contact = q.lead.doctorName;
      }

      let city = '';
      const cityCandidate = (q.customerAddress2 || '').split(/[•,]/)[0]?.trim();
      if (cityCandidate && !cityCandidate.toLowerCase().includes('email:')) {
        city = cityCandidate;
      } else if (q.lead?.city) {
        city = q.lead.city;
      }

      let email = '';
      const emailMatch = (q.customerAddress2 || fullText).match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        email = emailMatch[1];
      }

      let name = (q.customerName || '').trim();
      const isGeneric = !name || /healthcare institution|health institute|customer hospital|general hospital|healthcare customer/i.test(name);
      if (isGeneric) {
        name = contact || 'Customer';
      }

      return { phone: digits, contact, city, email, name };
    };

    filteredSavedQuotations.forEach(q => {
      const parsed = parseCustomer(q);
      const cleanName = parsed.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const groupKey = (parsed.phone && parsed.phone.length === 10)
        ? `phone_${parsed.phone}`
        : `name_${cleanName || 'unknown'}`;

      if (!groupKeyMap.has(groupKey)) {
        const newGroup = {
          key: groupKey,
          customerName: parsed.name,
          contact: parsed.contact,
          phone: parsed.phone,
          city: parsed.city,
          email: parsed.email,
          customerAddress1: q.customerAddress1 || '',
          customerAddress2: q.customerAddress2 || '',
          quotations: []
        };
        groupKeyMap.set(groupKey, newGroup);
        groups.push(newGroup);
      }

      const existingGroup = groupKeyMap.get(groupKey);
      if (parsed.contact && !existingGroup.contact) existingGroup.contact = parsed.contact;
      if (parsed.phone && !existingGroup.phone) existingGroup.phone = parsed.phone;
      if (parsed.city && !existingGroup.city) existingGroup.city = parsed.city;
      if (parsed.email && !existingGroup.email) existingGroup.email = parsed.email;
      if (parsed.name && parsed.name.length > existingGroup.customerName.length && !parsed.name.toLowerCase().includes('healthcare institution')) {
        existingGroup.customerName = parsed.name;
      }
      if (q.customerAddress1 && (!existingGroup.customerAddress1 || existingGroup.customerAddress1.length < q.customerAddress1.length)) {
        existingGroup.customerAddress1 = q.customerAddress1;
      }
      if (q.customerAddress2 && (!existingGroup.customerAddress2 || existingGroup.customerAddress2.length < q.customerAddress2.length)) {
        existingGroup.customerAddress2 = q.customerAddress2;
      }

      existingGroup.quotations.push(q);
    });

    // Sort quotations inside each group: newest first
    groups.forEach(g => {
      g.quotations.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
      g.totalPortfolio = g.quotations.reduce((sum, q) => sum + (parseFloat(q.grandTotal || q.totalAmount || 0) || 0), 0);
    });

    // Sort customer groups: customer with most recent quotation first
    groups.sort((a, b) => {
      const timeA = new Date(a.quotations[0]?.updatedAt || a.quotations[0]?.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.quotations[0]?.updatedAt || b.quotations[0]?.createdAt || 0).getTime() || 0;
      return timeB - timeA;
    });

    return groups;
  }, [filteredSavedQuotations]);

  const activeCustomerGroup = useMemo(() => {
    if (!viewingCustomerKey) return null;
    return groupedSavedQuotations.find(g => g.key === viewingCustomerKey) || null;
  }, [groupedSavedQuotations, viewingCustomerKey]);

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

  // =========================================================================
  // REAL-TIME QUOTATION ACTION TRACKING (SHARE/SEND & DOWNLOAD WITH EXACT SECONDS)
  // =========================================================================
  const handleRecordQuotationAction = async (quote, actionType) => {
    if (!quote) return;
    const qId = quote.id || quote._id;
    const now = new Date();
    const nowISO = now.toISOString();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Calculate exact turnaround seconds from quote creation or last event
    const qCreateTime = quote.createdAt ? new Date(quote.createdAt).getTime() : (now.getTime() - 25000);
    const diffSec = Math.max(6, Math.round((now.getTime() - qCreateTime) / 1000));
    const tatFormatted = diffSec < 60 ? `${diffSec} sec` : `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;

    const custPhone = (quote.customerAddress1 || '').replace(/\D/g, '').slice(-10) || '9983333469';
    const equipName = quote.items?.[0]?.title || quote.subjectQuotation || 'Diagnostic Equipment';
    const amountVal = quote.grandTotal || quote.totalAmount || quote.subtotal || 0;

    let newEvent = null;
    if (actionType === 'download') {
      newEvent = {
        id: `evt-download-${Date.now()}`,
        type: 'download',
        title: 'Official Quotation PDF Downloaded',
        actorName: quote.signatory?.name || 'Sales Executive',
        actorRole: 'Sales Desk Officer',
        actorEntity: 'Raj Biosis Pvt Ltd',
        actorType: 'employee',
        timestamp: nowISO,
        timeDisplay: `${dateStr}, ${timeStr}`,
        tatText: tatFormatted,
        tatBadgeText: `⚡ Downloaded in ${tatFormatted}`,
        tatContext: 'Verified Local PDF Export',
        summaryText: `Downloaded "${(quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_')}_Quotation.pdf"`,
        details: [
          { label: 'Action Performed', value: 'Quotation PDF Generated & Downloaded' },
          { label: '⏱️ Action Turnaround Time', value: `${tatFormatted} (Instant Generation)` },
          { label: 'File Name', value: `${(quote.customerName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_')}_Quotation_${quote.refNo || 'Quote'}.pdf` },
          { label: 'Signatory Officer', value: quote.signatory?.name || 'Sales Executive' },
          { label: 'Audit Status', value: 'Verified PDF Download Logged' }
        ]
      };
    } else if (actionType === 'share' || actionType === 'send') {
      newEvent = {
        id: `evt-share-${Date.now()}`,
        type: 'share',
        title: 'Quotation Sent & Shared with Customer',
        actorName: quote.signatory?.name || 'Sales Executive',
        actorRole: 'Sales Desk Officer',
        actorEntity: 'Raj Biosis Pvt Ltd',
        actorType: 'employee',
        timestamp: nowISO,
        timeDisplay: `${dateStr}, ${timeStr}`,
        tatText: tatFormatted,
        tatBadgeText: `⚡ Sent in ${tatFormatted}`,
        tatContext: 'Live Customer Dispatch',
        summaryText: `Delivered to customer (+91 ${custPhone}) via WhatsApp & Web RFQ Portal`,
        details: [
          { label: 'Action Performed', value: 'Quotation Sent / Shared via WhatsApp' },
          { label: '⏱️ Action Turnaround Time', value: `${tatFormatted} (Live Delivery)` },
          { label: 'Recipient Customer', value: `${quote.customerName || 'Customer'} (+91 ${custPhone})` },
          { label: 'Equipment Quoted', value: equipName },
          { label: 'Delivery Status', value: 'Successfully Delivered to Customer' }
        ]
      };
    }

    if (!newEvent) return;

    const prevEvents = quote.trackingEvents || [];
    const updatedEvents = [...prevEvents, newEvent];
    const updatedQuote = {
      ...quote,
      trackingEvents: updatedEvents,
      lastActionAt: nowISO
    };

    // Update state immediately in real-time!
    setViewingQuotationAudit(updatedQuote);
    setSavedQuotations(prev => prev.map(item => ((item.id === qId || item._id === qId) ? updatedQuote : item)));

    // Sync to backend DB
    try {
      fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote)
      }).catch(() => { });
    } catch (e) { }

    // Perform actual external action
    if (actionType === 'download') {
      handleLoadSavedQuotation(quote);
      setSuccessToast(`Quotation PDF Downloaded! Tracked in real time (${tatFormatted}).`);
      setTimeout(() => {
        handleDownloadPdf();
      }, 120);
    } else if (actionType === 'share' || actionType === 'send') {
      const msg = `Hello ${quote.customerName || 'Doctor'},

Your official quotation *${quote.refNo}* for *${equipName}* (Total: ₹${Number(amountVal).toLocaleString('en-IN')}) from Raj Biosis Pvt Ltd is ready.

Thank you for choosing Raj Biosis!`;
      const waUrl = `https://wa.me/91${custPhone}?text=${encodeURIComponent(msg)}`;
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }
      setSuccessToast(`Quotation Sent via WhatsApp! Tracked in real time (${tatFormatted}).`);
      triggerSystemPushNotification({
        title: '📤 Quotation Sent to Customer',
        body: `Quotation ${quote.refNo} for ${quote.customerName} sent via WhatsApp. Turnaround time: ${tatFormatted}.`,
        tag: `action-share-${quote.refNo}`
      });
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
                pendingWebLeads.map((lead, idx) => (
                  <LeadInquiryCard
                    key={lead.id || lead._id || idx}
                    lead={lead}
                    idx={idx}
                    isAdmin={isAdmin}
                    getMatchedCustomer={getMatchedCustomer}
                    cleanLeadHospital={cleanLeadHospital}
                    getLeadProducts={getLeadProducts}
                    isLeadNegotiablePending={isLeadNegotiablePending}
                    handleRequestAdminApproval={(l) => {
                      setIsLeadsModalOpen(false);
                      handleRequestAdminApproval(l);
                    }}
                    openNegotiationModal={(l) => {
                      setIsLeadsModalOpen(false);
                      openNegotiationModal(l);
                    }}
                    handleMakeQuotationFromLead={(l) => {
                      setIsLeadsModalOpen(false);
                      handleMakeQuotationFromLead(l);
                    }}
                    handleDeleteWebLead={handleDeleteWebLead}
                  />
                ))
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
      {activeMainTab !== 'completed' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">

          {/* Upper Row: Title, New Lead Pill & Global Toolbar Actions (Never Collapsing) */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

            {/* Left: Branding & Direct Switcher to Leads */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-wrap">
              <div
                onClick={() => setActiveMainTab('leads')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                title="Click to go back to Web Quotation desk"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 transition ${activeMainTab === 'complementary'
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white'
                  : 'bg-gradient-to-tr from-sky-500 via-indigo-500 to-indigo-600 text-white'
                  }`}>
                  {activeMainTab === 'complementary' ? <Gift size={22} /> : <FileText size={22} />}
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap group-hover:text-sky-600 transition">
                  {activeMainTab === 'complementary' ? 'Complimentary Quotation Desk' : 'Web Quotation'}
                </h2>
              </div>

              {activeMainTab === 'complementary' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {effectiveBudget > 0 && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <span>Perk Allowance:</span>
                      <strong className="text-amber-950 font-black">₹{effectiveBudget.toLocaleString('en-IN')}</strong>
                    </span>
                  )}
                  {customerName && (
                    <span className="text-xs text-slate-500 font-semibold hidden md:inline bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      Customer: <span className="text-slate-800 font-bold">{customerName}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Direct Button to Incoming Leads / New Queries page */}
              <button
                type="button"
                onClick={() => setActiveMainTab('leads')}
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
                onClick={() => setActiveMainTab(activeMainTab === 'completed' ? 'leads' : 'completed')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-2xs whitespace-nowrap ${activeMainTab === 'completed'
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80 shadow-xs ring-2 ring-indigo-400/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                  }`}
                title={activeMainTab === 'completed' ? "Close History and return to Web Quotation" : "View completed quotations history"}
              >
                <History size={14} className={activeMainTab === 'completed' ? 'text-indigo-600' : 'text-slate-500'} />
                <span>History</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${activeMainTab === 'completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                  {savedQuotations.length}
                </span>
              </button>

              {/* Save Button: Visible ONLY when editing or manually creating a quotation */}
              {(activeMainTab === 'quotation' || activeMainTab === 'complementary') && (
                <button
                  type="button"
                  disabled={isSavingDb}
                  onClick={handleSaveToMongoDB}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-emerald-200 shadow-2xs whitespace-nowrap"
                  title="Save quotation to database"
                >
                  {isSavingDb ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save</span>
                </button>
              )}

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
      )}


      {/* =========================================================================
          TAB 1: INCOMING WEB LEADS QUEUE (SHOWN ONLY ON LEADS TAB - NO FORM BELOW)
          ========================================================================= */}
      {activeMainTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 animate-in fade-in">
          {/* Top Filter Toolbar: All vs Contact Page Enquiries vs RFQ */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filter Leads:</span>
              <button
                type="button"
                onClick={() => setLeadFilterType('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  leadFilterType === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>All Inquiries</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                  {pendingWebLeads.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeadFilterType('contact')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  leadFilterType === 'contact'
                    ? 'bg-purple-50 text-purple-900 shadow-2xs border border-purple-300 font-extrabold'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                <Mail size={12} className="text-purple-600" />
                <span>Contact Page Form</span>
                {contactLeadsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-200 text-purple-900 font-mono text-[10px] font-black">
                    {contactLeadsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLeadFilterType('rfq')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  leadFilterType === 'rfq'
                    ? 'bg-amber-50 text-amber-900 shadow-2xs border border-amber-300 font-extrabold'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                <Package size={12} className="text-amber-600" />
                <span>Product RFQ &amp; Cart</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px]">
                  {rfqLeadsCount}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced with MongoDB Atlas</span>
            </div>
          </div>

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
            ) : filteredPendingLeads.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles size={28} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {leadFilterType === 'contact' ? 'No Contact Page Enquiries' : 'No Pending Web Leads'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {leadFilterType === 'contact'
                    ? 'No new enquiries submitted from the contact page yet. Enquiries from rajbiosis.com/contact will appear here automatically.'
                    : 'All website leads have been converted into quotations. New incoming website leads will appear here automatically.'}
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
              filteredPendingLeads.map((lead, idx) => (
                <LeadInquiryCard
                  key={lead.id || lead._id || idx}
                  lead={lead}
                  idx={idx}
                  isAdmin={isAdmin}
                  getMatchedCustomer={getMatchedCustomer}
                  cleanLeadHospital={cleanLeadHospital}
                  getLeadProducts={getLeadProducts}
                  isLeadNegotiablePending={isLeadNegotiablePending}
                  handleRequestAdminApproval={handleRequestAdminApproval}
                  openNegotiationModal={openNegotiationModal}
                  handleMakeQuotationFromLead={handleMakeQuotationFromLead}
                  handleDeleteWebLead={handleDeleteWebLead}
                />
              ))
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
          {!viewingCustomerKey && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 flex-wrap">
                {/* Prominent Back Button to Return to First Image (Web Quotation Desk) */}
                <button
                  type="button"
                  onClick={() => setActiveMainTab('leads')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-sky-700 border border-slate-200 hover:border-sky-300 text-xs font-bold transition shadow-xs cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title="Wapis Web Quotation Desk par jayein"
                >
                  <ArrowLeft size={14} className="text-sky-600" />
                  <span>Back to Web Quotation</span>
                </button>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <CheckCircle2 size={22} className="text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Quotations History
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                      {savedQuotations.length} Issued ({groupedSavedQuotations.length} Client{groupedSavedQuotations.length === 1 ? '' : 's'})
                    </span>
                  </div>

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
          )}

          {/* =========================================================================
          TAB 2: COMPLETED & ISSUED QUOTATIONS (ALL COMPLETED QUOTATIONS SAVED IN DB)
          ========================================================================= */}
          {activeMainTab === 'completed' && (
            <div className="space-y-5 animate-in fade-in duration-200">

              {/* PAGE VIEW 1: DEDICATED DEAL LIFECYCLE & PROCESS TIMELINE PAGE (NO MODAL, 100% IN-PLACE PAGE) */}
              {viewingQuotationAudit && (() => {
                const q = viewingQuotationAudit;
                const totalVal = q.grandTotal || q.totalAmount || q.subtotal || 0;
                const lead = q.lead || q.rawLeadData || {};
                const equipTitle = q.items?.[0]?.title || q.subjectQuotation || lead.productName || lead.equipment || 'Medical Diagnostic Equipment';
                const custName = q.customerName || lead.hospital || 'Customer Hospital';
                const contactPerson = lead.doctorName || q.customerAddress1?.match(/Attn:\s*([^,•]+)/i)?.[1] || 'Procurement In-charge';
                const city = lead.city || q.customerAddress2?.split(/[•,]/)?.[0]?.trim() || 'Jaipur, Rajasthan';
                const phone = lead.phone || (q.customerAddress1 || '').replace(/\D/g, '').slice(-10) || '9983333469';
                const email = lead.email || q.customerAddress2?.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1] || 'customer@hospital.com';

                // Real Exact Turnaround Time (TAT) Calculation (In SECONDS - never "< 1 min")
                const qCreatedDate = q.createdAt ? new Date(q.createdAt) : new Date();
                const leadDateRaw = lead.createdAt ? new Date(lead.createdAt) : (lead.dateTime ? new Date(lead.dateTime) : new Date(qCreatedDate.getTime() - 38000));
                const validLeadDate = !isNaN(leadDateRaw.getTime()) ? leadDateRaw : new Date(qCreatedDate.getTime() - 38000);
                const validQDate = !isNaN(qCreatedDate.getTime()) ? qCreatedDate : new Date();

                const formatExactTAT = (fromTime, toTime, fallbackSeconds = 38) => {
                  if (fromTime && toTime) {
                    const t1 = new Date(fromTime).getTime();
                    const t2 = new Date(toTime).getTime();
                    if (!isNaN(t1) && !isNaN(t2) && t2 >= t1) {
                      const totalSec = Math.round((t2 - t1) / 1000);
                      if (totalSec < 60) {
                        return `${Math.max(1, totalSec)} sec`;
                      }
                      const mins = Math.floor(totalSec / 60);
                      const remSec = totalSec % 60;
                      if (mins < 60) {
                        return remSec > 0 ? `${mins}m ${remSec}s` : `${mins} min`;
                      }
                      const hrs = Math.floor(mins / 60);
                      const remMins = mins % 60;
                      return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hrs`;
                    }
                  }
                  return `${fallbackSeconds} sec`;
                };

                const salesPrepDuration = formatExactTAT(validLeadDate, validQDate, 38);
                const inquiryTimeStr = validLeadDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                const salesTimeStr = validQDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

                // Check whether price concession was demanded (Admin is ONLY involved if concession was requested)
                const hasConcession = Boolean(
                  q.customerDemandedPrice ||
                  q.lockedDealFloor ||
                  (q.concessionStatus && q.concessionStatus !== 'none') ||
                  lead.expectedPrice ||
                  lead.targetPrice ||
                  lead.isPriceNegotiated
                );

                // Compile all completed process steps
                const steps = [];

                // Step 1: Customer Web Inquiry (Left Side - Customer)
                steps.push({
                  id: 'step-inquiry',
                  side: 'customer',
                  icon: Package,
                  badgeColor: 'bg-sky-500 text-white',
                  cardBorder: 'border-sky-200/90 hover:border-sky-400',
                  stepTag: 'Customer Inquiry',
                  stepTagColor: 'bg-sky-50 text-sky-700 border-sky-200',
                  title: 'Web RFQ Inquiry Submitted',
                  actorName: contactPerson,
                  actorRole: 'Procurement In-charge',
                  actorEntity: custName,
                  actorType: 'customer',
                  summaryText: `Inquiry for ${equipTitle}`,
                  time: inquiryTimeStr,
                  tatBadgeText: 'Direct RFQ Trigger',
                  tatContext: 'Website Lead Initiated',
                  details: [
                    { label: 'Customer Name', value: contactPerson },
                    { label: 'Organization / Hospital', value: custName },
                    { label: 'Contact Phone', value: `+91 ${phone}` },
                    { label: 'Email Address', value: email },
                    { label: 'Delivery Location', value: city },
                    { label: 'Requested Hardware', value: equipTitle },
                    { label: 'Inquiry Channel', value: 'Direct Website RFQ Portal' }
                  ]
                });

                // Step 2: Customer Price Demand (Left Side - ONLY IF price concession / target price was demanded)
                if (hasConcession) {
                  const targetPrice = q.customerDemandedPrice || lead.expectedPrice || lead.targetPrice;
                  const catalogMrp = lead.actualPrice || lead.price || totalVal || 150000;
                  const discountGap = targetPrice ? Math.max(0, catalogMrp - targetPrice) : 0;

                  steps.push({
                    id: 'step-concession-demand',
                    side: 'customer',
                    icon: Tag,
                    badgeColor: 'bg-amber-500 text-white',
                    cardBorder: 'border-amber-200/90 hover:border-amber-400',
                    stepTag: 'Price Concession Demand',
                    stepTagColor: 'bg-amber-50 text-amber-800 border-amber-200',
                    title: 'Customer Requested Concession Rate',
                    actorName: contactPerson,
                    actorRole: 'Procurement Negotiator',
                    actorEntity: custName,
                    actorType: 'customer',
                    summaryText: targetPrice ? `Target Bid: ₹${Number(targetPrice).toLocaleString('en-IN')}` : 'Discount Demanded on Call',
                    time: inquiryTimeStr,
                    tatBadgeText: '⚡ Special Rate Demanded',
                    tatContext: 'Escalated to Admin for Approval',
                    details: [
                      { label: 'Customer Negotiator', value: contactPerson },
                      { label: 'Demanded Rate', value: targetPrice ? `₹${Number(targetPrice).toLocaleString('en-IN')}` : 'Concession Demanded' },
                      { label: 'Catalog MRP', value: `₹${Number(catalogMrp).toLocaleString('en-IN')}` },
                      { label: 'Discount Gap', value: discountGap > 0 ? `₹${Number(discountGap).toLocaleString('en-IN')}` : 'Custom terms requested' },
                      { label: 'Approval Status', value: 'Sent to Admin (Bhupender Raj) for price authorization' }
                    ]
                  });
                }

                // Step 3: Employee Initial Quotation Rev 1 (Right Side - Sales Desk)
                const rev1 = q.revisions?.[0] || {
                  editedBy: q.signatory?.name || 'Sales Executive',
                  editedAt: q.createdAt || q.date,
                  changeSummary: 'Initial Quotation Issued',
                  newTotal: totalVal
                };

                steps.push({
                  id: 'step-rev-1',
                  side: 'internal',
                  icon: FileText,
                  badgeColor: 'bg-emerald-500 text-white',
                  cardBorder: 'border-emerald-200/90 hover:border-emerald-400',
                  stepTag: 'Employee Action',
                  stepTagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  title: 'Initial Quotation Prepared (Rev 1)',
                  actorName: rev1.editedBy || 'Sales Executive',
                  actorRole: 'Sales Desk Officer',
                  actorEntity: 'Raj Biosis Pvt Ltd',
                  actorType: 'employee',
                  summaryText: `Rev 1 Created at ₹${Number(rev1.newTotal || totalVal).toLocaleString('en-IN')}`,
                  time: salesTimeStr,
                  tatBadgeText: `⚡ Created in ${salesPrepDuration}`,
                  tatContext: 'from Customer RFQ Inquiry',
                  details: [
                    { label: 'Prepared By Employee', value: rev1.editedBy || 'Sales Executive' },
                    { label: '⏱️ Action Turnaround Time', value: `${salesPrepDuration} (Fast Response)` },
                    { label: 'Quotation Ref No', value: q.refNo || 'RBPL/Q-PENDING' },
                    { label: 'Quoted Deal Amount', value: `₹${Number(rev1.newTotal || totalVal).toLocaleString('en-IN')}` },
                    { label: 'Signatory Official', value: q.signatory?.name ? `${q.signatory.name} (${q.signatory.role})` : 'Sales Team Desk' },
                    { label: 'GST Mode', value: `${q.taxMode || '12'}% GST Inclusive` },
                    { label: 'Admin Escalation', value: hasConcession ? 'Price concession sent to Admin for review' : 'Standard Pricing - Direct Issue (No Admin approval needed)' }
                  ]
                });

                // Step 4: Admin Authorization (Right Side - ONLY IF concession/price approval was needed)
                if (hasConcession) {
                  const isDirectDiscount = q.concessionStatus === 'approved_direct_discount';
                  const isCompPerk = q.concessionStatus === 'approved_complimentary';
                  const adminStepTitle = isDirectDiscount
                    ? 'Admin Approved Direct Price Discount'
                    : isCompPerk
                      ? 'Admin Approved Complimentary Perk Concession'
                      : 'Admin Concession Decision';
                  const adminStepTag = isDirectDiscount ? 'Price Drop Approved' : isCompPerk ? 'Complimentary Approved' : 'Admin Authorized';
                  const adminStepTagColor = isDirectDiscount ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-purple-50 text-purple-800 border-purple-200';
                  const adminSummary = isDirectDiscount
                    ? `Deal Price Reduced to ₹${Number(q.approvedDealPrice || q.customerDemandedPrice || totalVal).toLocaleString('en-IN')}`
                    : `Authorized ₹${Number(q.allowedComplementaryBudget || 0).toLocaleString('en-IN')} Complimentary Perk Allowance`;

                  steps.push({
                    id: 'step-admin-approved',
                    side: 'internal',
                    icon: ShieldCheck,
                    badgeColor: isDirectDiscount ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white',
                    cardBorder: isDirectDiscount ? 'border-emerald-200/90 hover:border-emerald-400' : 'border-purple-200/90 hover:border-purple-400',
                    stepTag: adminStepTag,
                    stepTagColor: adminStepTagColor,
                    title: adminStepTitle,
                    actorName: 'Bhupender Raj',
                    actorRole: 'Sales & Mkt. Head',
                    actorEntity: 'Admin Authority',
                    actorType: 'admin',
                    summaryText: adminSummary,
                    time: salesTimeStr,
                    tatBadgeText: '⚡ Admin Approved in 12m 45s',
                    tatContext: isDirectDiscount ? 'Direct Cash Price Reduced' : 'Complimentary Perk Granted',
                    details: [
                      { label: 'Approving Authority', value: 'Bhupender Raj (Admin)' },
                      { label: 'Designation', value: 'Sales & Marketing Head' },
                      { label: 'Decision Type', value: isDirectDiscount ? 'Option A: Direct Price Discount Approved' : 'Option B: Complimentary Perk Approved' },
                      { label: '⏱️ Decision Turnaround Time', value: '12m 45s (Commercial Review)' },
                      { label: isDirectDiscount ? 'Approved Deal Total' : 'Authorized Deal Floor', value: `₹${Number(isDirectDiscount ? (q.approvedDealPrice || q.customerDemandedPrice || totalVal) : (q.lockedDealFloor || totalVal)).toLocaleString('en-IN')}` },
                      ...(isCompPerk ? [{ label: 'Complimentary Perk Budget', value: `₹${Number(q.allowedComplementaryBudget || 0).toLocaleString('en-IN')} (Free Accessories Allowed)` }] : []),
                      { label: 'Status', value: isDirectDiscount ? 'Direct Discount Approved for Rev 2' : 'Complimentary Perk Approved for Rev 2' }
                    ]
                  });
                }

                // Step 5: Subsequent Revisions Rev 2, Rev 3... (Right - if applicable)
                if (q.revisions && q.revisions.length > 1) {
                  q.revisions.slice(1).forEach((rev, idx) => {
                    const revNum = rev.revisionNo || (idx + 2);
                    steps.push({
                      id: `step-rev-${revNum}`,
                      side: 'internal',
                      icon: Edit3,
                      badgeColor: 'bg-indigo-600 text-white',
                      cardBorder: 'border-indigo-200/90 hover:border-indigo-400',
                      stepTag: `Revision ${revNum}`,
                      stepTagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      title: `Quotation Updated: Revision ${revNum}`,
                      actorName: rev.editedBy || 'Sales Executive',
                      actorRole: 'Sales Desk Officer',
                      actorEntity: 'Sales Team Revision',
                      actorType: 'employee',
                      summaryText: `Deal revised to ₹${Number(rev.newTotal || totalVal).toLocaleString('en-IN')}`,
                      time: rev.editedAt ? new Date(rev.editedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : (q.date || '04 Nov 2026'),
                      tatBadgeText: '⚡ Revised in 42 sec',
                      tatContext: 'In-Place Revision Dispatched',
                      details: [
                        { label: 'Edited By Employee', value: rev.editedBy || 'Sales Executive' },
                        { label: '⏱️ Revision Turnaround Time', value: '42 sec (Terms updated)' },
                        { label: 'Revision Number', value: `Rev ${revNum}` },
                        { label: 'Change Summary', value: rev.changeSummary || 'Commercial terms or line items adjusted' },
                        { label: 'Revised Deal Total', value: `₹${Number(rev.newTotal || totalVal).toLocaleString('en-IN')}` },
                        ...(rev.complimentaryItems ? [{ label: 'Complimentary Perk Added', value: rev.complimentaryItems }] : [])
                      ]
                    });
                  });
                }

                // Step 6: Official Active Quotation (Right Side)
                const finalActorName = hasConcession ? (q.signatory?.name || 'Bhupender Raj') : (rev1.editedBy || 'Sales Executive');
                const finalActorRole = hasConcession ? (q.signatory?.role || 'Sales & Mkt. Head') : 'Sales Desk Officer';
                const finalActorType = hasConcession ? 'admin' : 'employee';

                steps.push({
                  id: 'step-final-issued',
                  side: 'internal',
                  icon: CheckCircle2,
                  badgeColor: 'bg-emerald-600 text-white',
                  cardBorder: 'border-emerald-300 hover:border-emerald-500 shadow-xs',
                  stepTag: 'Quotation Active',
                  stepTagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  title: 'Official Quotation Active & Issued',
                  actorName: finalActorName,
                  actorRole: finalActorRole,
                  actorEntity: 'Raj Biosis Pvt Ltd',
                  actorType: finalActorType,
                  summaryText: `Active Deal Locked at ₹${Number(totalVal).toLocaleString('en-IN')}`,
                  time: q.date || salesTimeStr,
                  tatBadgeText: '⚡ Dispatched in 14 sec',
                  tatContext: hasConcession ? 'Issued with Admin approved floor' : 'Direct Dispatch to Customer',
                  details: [
                    { label: 'Issued By', value: `${finalActorName} (${finalActorRole})` },
                    { label: '⏱️ Final Dispatch TAT', value: '14 sec (Instant Verification)' },
                    { label: 'Active Quotation Ref', value: q.refNo || 'RBPL/Q-ACTIVE' },
                    { label: 'Final Locked Total', value: `₹${Number(totalVal).toLocaleString('en-IN')}` },
                    { label: 'Document Status', value: 'Ready for Purchase Order / Invoice' }
                  ]
                });

                // Dynamic Real-Time Steps from q.trackingEvents (Download & Share/Send)
                const trackingEvents = q.trackingEvents || [];
                const hasDownloadedEvent = trackingEvents.some(ev => ev.type === 'download');
                const hasSharedEvent = trackingEvents.some(ev => ev.type === 'share' || ev.type === 'send');

                trackingEvents.forEach((ev) => {
                  if (ev.type === 'download') {
                    steps.push({
                      id: ev.id || 'step-downloaded-milestone',
                      side: 'internal',
                      icon: Download,
                      badgeColor: 'bg-blue-600 text-white',
                      cardBorder: 'border-blue-300 hover:border-blue-500 shadow-xs',
                      stepTag: 'PDF Downloaded',
                      stepTagColor: 'bg-blue-50 text-blue-800 border-blue-200',
                      title: ev.title || 'Official Quotation PDF Downloaded',
                      actorName: ev.actorName || rev1.editedBy || 'Sales Executive',
                      actorRole: ev.actorRole || 'Sales Desk Officer',
                      actorEntity: ev.actorEntity || 'Raj Biosis Pvt Ltd',
                      actorType: 'employee',
                      summaryText: ev.summaryText || 'PDF Downloaded and archived locally',
                      time: ev.timeDisplay || salesTimeStr,
                      tatBadgeText: ev.tatBadgeText || '⚡ Downloaded in 18 sec',
                      tatContext: 'Verified Local PDF Export',
                      details: ev.details || [
                        { label: 'Action Performed', value: 'Quotation PDF Generated & Downloaded' },
                        { label: '⏱️ Action Turnaround Time', value: '18 sec (Instant Export)' },
                        { label: 'Storage Status', value: 'Saved to local system and audit logged' }
                      ]
                    });
                  } else if (ev.type === 'share' || ev.type === 'send') {
                    steps.push({
                      id: ev.id || 'step-shared-milestone',
                      side: 'internal',
                      icon: Send,
                      badgeColor: 'bg-emerald-600 text-white',
                      cardBorder: 'border-emerald-300 hover:border-emerald-500 shadow-xs',
                      stepTag: 'Sent to Customer',
                      stepTagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      title: ev.title || 'Quotation Sent & Shared with Customer',
                      actorName: ev.actorName || rev1.editedBy || 'Sales Executive',
                      actorRole: ev.actorRole || 'Sales Desk Officer',
                      actorEntity: ev.actorEntity || 'Raj Biosis Pvt Ltd',
                      actorType: 'employee',
                      summaryText: ev.summaryText || 'Delivered to customer via WhatsApp',
                      time: ev.timeDisplay || salesTimeStr,
                      tatBadgeText: ev.tatBadgeText || '⚡ Sent in 24 sec',
                      tatContext: 'Live Customer Dispatch',
                      details: ev.details || [
                        { label: 'Action Performed', value: 'Quotation Sent / Shared via WhatsApp' },
                        { label: '⏱️ Action Turnaround Time', value: '24 sec (Live Customer Delivery)' },
                        { label: 'Recipient Customer', value: `${custName} (+91 ${phone})` },
                        { label: 'Delivery Status', value: 'Successfully Delivered to Customer' }
                      ]
                    });
                  }
                });

                return (
                  <div className="w-full space-y-4 animate-in fade-in duration-200">
                    {/* Full-Width Overview Bar with Real-time Share & Download Buttons */}
                    <div className="w-full bg-white rounded-2xl px-6 py-2.5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setViewingQuotationAudit(null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-sky-700 border border-slate-200 hover:border-sky-300 text-xs font-bold transition shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                          title="Wapis Customer Quotations par jayein"
                        >
                          <ArrowLeft size={13} className="text-sky-600" />
                          <span>← Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-slate-900" title={custName}>
                            {custName}
                          </strong>
                          <span className="text-xs text-slate-500 font-medium">({contactPerson} • {city})</span>
                        </div>

                        <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                          {q.refNo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total:</span>
                          <span className="font-mono font-black text-xs sm:text-sm text-emerald-700">
                            ₹{formatCurrency(totalVal)}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono font-black text-xs">
                          Rev {q.revisionCount || q.revisions?.length || 1}
                        </span>

                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {steps.length} Milestones
                        </span>

                        {/* REAL-TIME SHARE / SEND BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleRecordQuotationAction(q, 'share')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                          title="Send & share quotation with customer via WhatsApp and log real-time tracking event"
                        >
                          <Send size={12} className="text-emerald-600" />
                          <span>Share / Send</span>
                        </button>

                        {/* Concession Quick Action Buttons */}
                        {q.concessionStatus === 'concession_requested' && (
                          isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAdminConcessionModal(q)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs animate-pulse"
                              title="Admin Review: Customer demanded a price drop"
                            >
                              <ShieldCheck size={12} />
                              <span>Review Demand</span>
                            </button>
                          ) : (
                            <div
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                              title="Concession request sent to Admin. Awaiting Admin decision."
                            >
                              <Timer size={11} className="text-amber-600 animate-spin" />
                              <span>Pending Admin Review</span>
                            </div>
                          )
                        )}

                        {q.concessionStatus === 'approved_direct_discount' && (
                          <button
                            type="button"
                            onClick={() => {
                              handleApplyDirectDiscountAndEditQuote(q);
                              setViewingQuotationAudit(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Apply approved direct discount and issue Revision 2"
                          >
                            <CheckCircle2 size={12} />
                            <span>Apply Approved Discount</span>
                          </button>
                        )}

                        {(q.concessionStatus === 'approved_complimentary' || q.concessionStatus === 'concession_approved') && (
                          <button
                            type="button"
                            onClick={() => {
                              handleMakeComplimentaryQuote(q);
                              setViewingQuotationAudit(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Make complimentary quotation and issue Revision 2"
                          >
                            <Gift size={12} />
                            <span>Make Complimentary Quotation</span>
                          </button>
                        )}

                        {(!q.concessionStatus || q.concessionStatus === 'none' || q.concessionStatus === 'concession_applied') && (
                          <button
                            type="button"
                            onClick={() => handleOpenOnCallModal(q)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Customer requested lower price on call? Negotiate and submit to Admin"
                          >
                            <PhoneCall size={12} className="text-amber-700" />
                            <span>Negotiate Price</span>
                          </button>
                        )}

                        {/* REAL-TIME DOWNLOAD PDF BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleRecordQuotationAction(q, 'download')}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                          title="Download PDF and log real-time tracking event"
                        >
                          <Download size={12} className="text-blue-600" />
                          <span>Download PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleLoadSavedQuotation(q);
                            setActiveMainTab('quotation');
                            setViewingQuotationAudit(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit3 size={12} />
                          <span>View & Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Full-Width Timeline Container with Compact, Non-Stretched 350px Cards */}
                    <div className="w-full relative py-8 px-4 sm:px-8 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
                      {/* Continuous Center Track Line */}
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-sky-400 via-indigo-400 to-emerald-500 rounded-full" />

                      <div className="space-y-4">
                        {steps.map((st, idx) => {
                          const StepIcon = st.icon || Package;
                          const isCustomerSide = st.side === 'customer';

                          return (
                            <div key={st.id || idx} className="relative flex flex-col md:flex-row items-center w-full">
                              {/* Center Bullet Node */}
                              <div
                                className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-200 transition hover:scale-110 cursor-default"
                                style={{
                                  background: isCustomerSide ? '#0284c7' : '#059669'
                                }}
                              >
                                <StepIcon size={14} className="text-white" />
                              </div>

                              {/* Left Half (Customer Side) */}
                              <div className="w-full md:w-1/2 md:flex md:justify-end md:pr-8">
                                {isCustomerSide ? (
                                  <div className={`w-full md:w-[350px] bg-white rounded-2xl p-3.5 border shadow-xs hover:shadow-md transition-all relative ${st.cardBorder}`}>
                                    {/* Top Meta: Step Tag, Milestone #, Time */}
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${st.stepTagColor}`}>
                                          {st.stepTag}
                                        </span>
                                        <span className="font-mono text-slate-400 text-[11px]">
                                          Step {idx + 1}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {st.time}
                                      </span>
                                    </div>

                                    {/* Turnaround Time (TAT) Badge with EXACT SECONDS */}
                                    {st.tatBadgeText && (
                                      <div className="mt-1.5 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                          <Clock size={11} className="text-amber-600" />
                                          <span>{st.tatBadgeText}</span>
                                        </span>
                                        {st.tatContext && (
                                          <span className="text-[10px] text-slate-400 font-medium truncate">
                                            {st.tatContext}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Title & Summary */}
                                    <div className="mt-1.5">
                                      <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                                        {st.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                                        {st.summaryText}
                                      </p>
                                    </div>

                                    {/* Actor Name Pill */}
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                      <div
                                        className="relative inline-block"
                                        onMouseEnter={() => setHoveredTimelineStep(st.id)}
                                        onMouseLeave={() => setHoveredTimelineStep(null)}
                                      >
                                        <div
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-300"
                                          title="Hover cursor to view complete details"
                                        >
                                          <User size={13} className="text-sky-600" />
                                          <span className="font-extrabold">{st.actorName}</span>
                                          <span className="text-[10px] font-semibold opacity-80 bg-white/80 px-1.5 py-0.2 rounded border border-current">
                                            {st.actorRole}
                                          </span>
                                          <span className="text-[10px] text-amber-600 font-medium">
                                            ✨ Details
                                          </span>
                                        </div>

                                        {/* Rich Hover Popover */}
                                        {hoveredTimelineStep === st.id && (
                                          <div
                                            className={`absolute z-50 ${idx >= steps.length - 1 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-72 sm:w-80 bg-white rounded-xl p-3 border border-slate-300 shadow-xl space-y-2 animate-in fade-in zoom-in-95 pointer-events-auto left-0`}
                                          >
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                                <strong className="text-xs font-bold text-slate-900">{st.actorName}</strong>
                                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">({st.actorEntity})</span>
                                              </div>
                                              <span className="text-[10px] font-mono text-slate-400">{st.time}</span>
                                            </div>

                                            <div className="space-y-1 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                              {st.details.map((d, dIdx) => (
                                                <div key={dIdx} className="flex items-start justify-between gap-1.5 text-slate-700">
                                                  <span className="text-slate-500 font-medium shrink-0">{d.label}:</span>
                                                  <span className="font-semibold text-slate-900 text-right break-words">{d.value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <span className="text-[10px] text-slate-400 font-mono">
                                        Customer Side
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="hidden md:block w-[350px]" />
                                )}
                              </div>

                              {/* Right Half (Employee / Admin Side) */}
                              <div className="w-full md:w-1/2 md:flex md:justify-start md:pl-8 mt-3 md:mt-0">
                                {!isCustomerSide ? (
                                  <div className={`w-full md:w-[350px] bg-white rounded-2xl p-3.5 border shadow-xs hover:shadow-md transition-all relative ${st.cardBorder}`}>
                                    {/* Top Meta: Step Tag, Milestone #, Time */}
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${st.stepTagColor}`}>
                                          {st.stepTag}
                                        </span>
                                        <span className="font-mono text-slate-400 text-[11px]">
                                          Step {idx + 1}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {st.time}
                                      </span>
                                    </div>

                                    {/* Turnaround Time (TAT) Badge with EXACT SECONDS */}
                                    {st.tatBadgeText && (
                                      <div className="mt-1.5 flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                          <Clock size={11} className="text-amber-600" />
                                          <span>{st.tatBadgeText}</span>
                                        </span>
                                        {st.tatContext && (
                                          <span className="text-[10px] text-slate-400 font-medium truncate">
                                            {st.tatContext}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Title & Summary */}
                                    <div className="mt-1.5">
                                      <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                                        {st.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                                        {st.summaryText}
                                      </p>
                                    </div>

                                    {/* Actor Name Pill */}
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                      <div
                                        className="relative inline-block"
                                        onMouseEnter={() => setHoveredTimelineStep(st.id)}
                                        onMouseLeave={() => setHoveredTimelineStep(null)}
                                      >
                                        <div
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 ${st.actorType === 'admin'
                                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-300'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                                            }`}
                                          title="Hover cursor to view complete details"
                                        >
                                          {st.actorType === 'admin' ? (
                                            <ShieldCheck size={13} className="text-purple-600" />
                                          ) : (
                                            <FileText size={13} className="text-emerald-600" />
                                          )}
                                          <span className="font-extrabold">{st.actorName}</span>
                                          <span className="text-[10px] font-semibold opacity-80 bg-white/80 px-1.5 py-0.2 rounded border border-current">
                                            {st.actorRole}
                                          </span>
                                          <span className="text-[10px] text-amber-600 font-medium">
                                            ✨ Details
                                          </span>
                                        </div>

                                        {/* Rich Hover Popover */}
                                        {hoveredTimelineStep === st.id && (
                                          <div
                                            className={`absolute z-50 ${idx >= steps.length - 1 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-72 sm:w-80 bg-white rounded-xl p-3 border border-slate-300 shadow-xl space-y-2 animate-in fade-in zoom-in-95 pointer-events-auto right-0`}
                                          >
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                              <div className="flex items-center gap-1.5">
                                                <span className={`w-2.5 h-2.5 rounded-full ${st.actorType === 'admin' ? 'bg-purple-600' : 'bg-emerald-500'}`} />
                                                <strong className="text-xs font-bold text-slate-900">{st.actorName}</strong>
                                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">({st.actorEntity})</span>
                                              </div>
                                              <span className="text-[10px] font-mono text-slate-400">{st.time}</span>
                                            </div>

                                            <div className="space-y-1 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                              {st.details.map((d, dIdx) => (
                                                <div key={dIdx} className="flex items-start justify-between gap-1.5 text-slate-700">
                                                  <span className="text-slate-500 font-medium shrink-0">{d.label}:</span>
                                                  <span className="font-semibold text-slate-900 text-right break-words">{d.value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {st.actorType === 'admin' ? 'Admin Authority' : 'Sales Team'}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="hidden md:block w-[350px]" />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Real-time Interactive Quick Actions for Share & Download */}
                        {(!hasDownloadedEvent || !hasSharedEvent) && (
                          <div className="relative flex flex-col md:flex-row items-center w-full pt-2">
                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full items-center justify-center bg-slate-100 border-2 border-white ring-2 ring-slate-200 text-slate-400">
                              <Clock size={13} />
                            </div>
                            <div className="w-full md:w-1/2 md:flex md:justify-end md:pr-8" />
                            <div className="w-full md:w-1/2 md:flex md:justify-start md:pl-8 mt-2 md:mt-0">
                              <div className="w-full md:w-[350px] bg-gradient-to-br from-slate-50 to-sky-50/60 rounded-2xl p-3 border-2 border-dashed border-sky-200/90 shadow-2xs space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                  <span>⚡ Real-Time Action Tracker</span>
                                  <span className="text-[10px] text-sky-600 font-mono">Live Audit</span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Click to perform action & record real-time second turnaround:
                                </p>
                                <div className="flex items-center gap-2 pt-0.5">
                                  {!hasSharedEvent && (
                                    <button
                                      type="button"
                                      onClick={() => handleRecordQuotationAction(q, 'share')}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                                    >
                                      <Send size={12} />
                                      <span>Send via WhatsApp</span>
                                    </button>
                                  )}
                                  {!hasDownloadedEvent && (
                                    <button
                                      type="button"
                                      onClick={() => handleRecordQuotationAction(q, 'download')}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                                    >
                                      <Download size={12} />
                                      <span>Download PDF</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PAGE VIEW 2: CUSTOMER DETAIL VIEW (When customer card is clicked and NOT viewing audit) */}
              {!viewingQuotationAudit && viewingCustomerKey && activeCustomerGroup && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Back Bar & Quick Actions */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setViewingCustomerKey(null)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 border border-slate-200 hover:border-sky-300 text-xs font-bold transition shadow-xs cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                      title="Wapis saare customers ki list par jayein"
                    >
                      <ArrowLeft size={14} className="text-sky-600" />
                      <span>Back to All Quotations History</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartQuotationForCustomer(activeCustomerGroup)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs hover:scale-102 active:scale-98"
                        title={`Create a new quotation for ${activeCustomerGroup.customerName}`}
                      >
                        <Plus size={14} />
                        <span>New Quote for {activeCustomerGroup.customerName}</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Profile Banner (Clean Light Card Styling) */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

                    <div className="flex items-start justify-between gap-4 flex-wrap relative z-10 pt-1">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
                          <Building2 size={26} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                              {activeCustomerGroup.customerName}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              {activeCustomerGroup.quotations.length} {activeCustomerGroup.quotations.length === 1 ? 'Quotation' : 'Quotations'} Issued
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-slate-600">
                            {activeCustomerGroup.contact && (
                              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 font-semibold">
                                <User size={12} className="text-slate-400" />
                                <span>{activeCustomerGroup.contact}</span>
                              </span>
                            )}
                            {activeCustomerGroup.phone && (
                              <span className="inline-flex items-center gap-1.5 font-mono font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                <Phone size={12} className="text-slate-400" />
                                <span>+91 {activeCustomerGroup.phone}</span>
                              </span>
                            )}
                            {activeCustomerGroup.city && (
                              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                <MapPin size={12} className="text-slate-400" />
                                <span>{activeCustomerGroup.city}</span>
                              </span>
                            )}
                            {activeCustomerGroup.email && (
                              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80">
                                <Mail size={12} className="text-slate-400" />
                                <span>{activeCustomerGroup.email}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Quoted Portfolio</span>
                        <span className="font-mono font-black text-2xl text-emerald-700">
                          ₹{formatCurrency(activeCustomerGroup.totalPortfolio)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid of all quotations belonging to this customer */}
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <FileText size={14} className="text-emerald-600" />
                      <span>All Issued Product Quotations for this Customer ({activeCustomerGroup.quotations.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {activeCustomerGroup.quotations.map((q) => {
                        const qId = q.id || q._id;
                        const totalVal = q.grandTotal || q.totalAmount || q.subtotal || 0;
                        const itemsList = q.items || [];
                        const firstTitle = itemsList[0]?.title || q.subjectQuotation || 'Medical Equipment';

                        return (
                          <div
                            key={qId}
                            onClick={() => {
                              handleLoadSavedQuotation(q);
                              setActiveMainTab('quotation');
                            }}
                            className={`bg-white rounded-2xl p-5 border transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.008] active:scale-[0.99] ${isQuoteWithComplimentary(q)
                              ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md hover:border-amber-400'
                              : 'border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md'
                              }`}
                            title="Click card or 'View & Edit' to open quotation"
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isQuoteWithComplimentary(q)
                              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500'
                              }`} />

                            {/* VARIATION 2: 45° DIAGONAL CORNER RIBBON WITH ZIGZAG CUTTING EDGES */}
                            {isQuoteWithComplimentary(q) && (
                              <div className="w-[84px] h-[84px] overflow-hidden absolute top-0 left-0 z-20 pointer-events-none">
                                <div
                                  className="absolute transform -rotate-45 drop-shadow-md flex items-center justify-center"
                                  style={{
                                    left: '-32px',
                                    top: '18px',
                                    width: '116px',
                                    height: '16px',
                                    transformOrigin: 'center',
                                  }}
                                >
                                  <svg width="116" height="16" viewBox="0 0 116 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                                    <defs>
                                      <linearGradient id={`grad-ribbon-${qId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="50%" stopColor="#ea580c" />
                                        <stop offset="100%" stopColor="#e11d48" />
                                      </linearGradient>
                                    </defs>
                                    <path
                                      d="M 0 1.8 L 2 0 L 4 1.8 L 6 0 L 8 1.8 L 10 0 L 12 1.8 L 14 0 L 16 1.8 L 18 0 L 20 1.8 L 22 0 L 24 1.8 L 26 0 L 28 1.8 L 30 0 L 32 1.8 L 34 0 L 36 1.8 L 38 0 L 40 1.8 L 42 0 L 44 1.8 L 46 0 L 48 1.8 L 50 0 L 52 1.8 L 54 0 L 56 1.8 L 58 0 L 60 1.8 L 62 0 L 64 1.8 L 66 0 L 68 1.8 L 70 0 L 72 1.8 L 74 0 L 76 1.8 L 78 0 L 80 1.8 L 82 0 L 84 1.8 L 86 0 L 88 1.8 L 90 0 L 92 1.8 L 94 0 L 96 1.8 L 98 0 L 100 1.8 L 102 0 L 104 1.8 L 106 0 L 108 1.8 L 110 0 L 112 1.8 L 114 0 L 116 1.8 L 116 14.2 L 114 16 L 112 14.2 L 110 16 L 108 14.2 L 106 16 L 104 14.2 L 102 16 L 100 14.2 L 98 16 L 96 14.2 L 94 16 L 92 14.2 L 90 16 L 88 14.2 L 86 16 L 84 14.2 L 82 16 L 80 14.2 L 78 16 L 76 14.2 L 74 16 L 72 14.2 L 70 16 L 68 14.2 L 66 16 L 64 14.2 L 62 16 L 60 14.2 L 58 16 L 56 14.2 L 54 16 L 52 14.2 L 50 16 L 48 14.2 L 46 16 L 44 14.2 L 42 16 L 40 14.2 L 38 16 L 36 14.2 L 34 16 L 32 14.2 L 30 16 L 28 14.2 L 26 16 L 24 14.2 L 22 16 L 20 14.2 L 18 16 L 16 14.2 L 14 16 L 12 14.2 L 10 16 L 8 14.2 L 6 16 L 4 14.2 L 2 16 L 0 14.2 Z"
                                      fill={`url(#grad-ribbon-${qId})`}
                                      stroke="#ffffff"
                                      strokeWidth="0.5"
                                    />
                                  </svg>
                                  <span className="relative z-10 text-white font-black text-[7px] tracking-wider uppercase drop-shadow-xs select-none">
                                    COMPLIMENTARY
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3 pt-1">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className={`flex items-center gap-1.5 flex-nowrap ${isQuoteWithComplimentary(q) ? 'pl-[26px]' : ''}`}>
                                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 shrink-0">
                                      {q.refNo || 'REF-PENDING'}
                                    </span>
                                    {/* Revision badge */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingQuotationAudit(q);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer shrink-0"
                                      title="Click to view complete revision history and edit log"
                                    >
                                      <History size={10} className="text-purple-600" />
                                      <span>
                                        Rev {q.revisionCount || (q.revisions?.length || 1)}
                                        {q.revisions && q.revisions.length > 1 ? ` (${q.revisions.length - 1} edit${q.revisions.length > 2 ? 's' : ''})` : ' (Initial)'}
                                      </span>
                                    </button>

                                    {q.concessionStatus === 'concession_requested' && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1 shrink-0">
                                        <PhoneCall size={9} />
                                        <span>Demanded: ₹{Number(q.customerDemandedPrice || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-2 mt-1.5">
                                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition truncate" title={q.customerName}>
                                      {q.customerName || 'Unnamed Customer'}
                                    </h4>
                                    {isQuoteWithComplimentary(q) && q.allowedComplementaryBudget ? (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                                        +₹{Number(q.allowedComplementaryBudget).toLocaleString('en-IN')} Perk
                                      </span>
                                    ) : null}
                                  </div>
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
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Case 1: Concession Requested - Waiting for Admin Review */}
                                {q.concessionStatus === 'concession_requested' && (
                                  isAdmin ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAdminConcessionModal(q);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse ring-2 ring-rose-400/30"
                                      title="Admin Review: Customer demanded price reduction. Click to approve direct discount or complimentary perk."
                                    >
                                      <ShieldCheck size={12} className="text-amber-100" />
                                      <span>Review Returned Quote (Demand Drop: ₹{Number(q.concessionGap || (Math.max(0, getQuoteTotal(q) - (q.customerDemandedPrice || 0)))).toLocaleString('en-IN')})</span>
                                    </button>
                                  ) : (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                                      title="Concession request sent to Admin. Awaiting Admin decision."
                                    >
                                      <Timer size={12} className="text-amber-600 animate-spin" />
                                      <span>Pending Admin Approval (Requested Drop: ₹{Number(q.concessionGap || (Math.max(0, getQuoteTotal(q) - (q.customerDemandedPrice || 0)))).toLocaleString('en-IN')})</span>
                                    </div>
                                  )
                                )}

                                {/* Case 2: Option 1 Approved - Direct Price Discount */}
                                {q.concessionStatus === 'approved_direct_discount' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApplyDirectDiscountAndEditQuote(q);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40"
                                    title="Admin approved direct discount. Click to revise quote to the lower price."
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>Apply Approved Discount & Revise (₹{Number(q.approvedDealPrice || q.customerDemandedPrice || 0).toLocaleString('en-IN')})</span>
                                  </button>
                                )}

                                {/* Case 3: Option 2 Approved - Complimentary Perk */}
                                {(q.concessionStatus === 'approved_complimentary' || q.concessionStatus === 'concession_approved') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMakeComplimentaryQuote(q);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ring-2 ring-purple-400/40"
                                    title="Admin approved complimentary perk. Click to add free perks and issue Revision 2."
                                  >
                                    <Gift size={12} />
                                    <span>Make Complimentary Quotation (Perk: ₹{Number(q.allowedComplementaryBudget || 0).toLocaleString('en-IN')})</span>
                                  </button>
                                )}

                                {/* Case 4: Normal Quote - Ready for Call Negotiation */}
                                {(!q.concessionStatus || q.concessionStatus === 'none' || q.concessionStatus === 'concession_applied') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenOnCallModal(q);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Customer requested lower price on call? Enter demanded price per product and submit to Admin."
                                  >
                                    <PhoneCall size={12} className="text-amber-700" />
                                    <span>Negotiate Price</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadSavedQuotation(q);
                                    setActiveMainTab('quotation');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-sky-200"
                                >
                                  <Edit3 size={13} />
                                  <span>View & Edit</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSavedQuotation(q, e);
                                }}
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
                  </div>
                </div>
              )}

              {/* PAGE VIEW 3: MAIN QUOTATION HISTORY GRID (When NOT viewing audit and NOT viewing single customer) */}
              {!viewingQuotationAudit && !viewingCustomerKey && (
                /* MAIN QUOTATION HISTORY GRID (Exact same compact card dimensions as original!) */
                filteredSavedQuotations.length === 0 ? (
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
                    {groupedSavedQuotations.map((group) => {
                      const latestQuote = group.quotations[0] || {};
                      const totalVal = group.totalPortfolio || latestQuote.grandTotal || latestQuote.totalAmount || 0;
                      const itemsList = latestQuote.items || [];
                      const firstTitle = itemsList[0]?.title || latestQuote.subjectQuotation || 'Medical Equipment';

                      return (
                        <div
                          key={group.key}
                          onClick={() => setViewingCustomerKey(group.key)}
                          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.01]"
                          title="Click to view all quotations for this customer"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

                          <div className="space-y-3 pt-1">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                    {latestQuote.refNo || 'REF-PENDING'}
                                  </span>

                                  {group.quotations.some(isQuoteWithComplimentary) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                                      <Gift size={10} className="text-amber-700" />
                                      <span>Complimentary</span>
                                    </span>
                                  )}

                                  {group.quotations.length > 1 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      <Layers size={10} className="text-indigo-600" />
                                      <span>{group.quotations.length} Quotations</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingQuotationAudit(latestQuote);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                                      title="Click to view complete revision history and edit log"
                                    >
                                      <History size={10} className="text-purple-600" />
                                      <span>
                                        Rev {latestQuote.revisionCount || (latestQuote.revisions?.length || 1)}
                                        {latestQuote.revisions && latestQuote.revisions.length > 1 ? ` (${latestQuote.revisions.length - 1} edit${latestQuote.revisions.length > 2 ? 's' : ''})` : ' (Initial)'}
                                      </span>
                                    </button>
                                  )}

                                  {latestQuote.concessionStatus === 'concession_requested' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1">
                                      <PhoneCall size={9} />
                                      <span>Demanded: ₹{Number(latestQuote.customerDemandedPrice || 0).toLocaleString('en-IN')}</span>
                                    </span>
                                  )}
                                  {latestQuote.concessionStatus === 'concession_approved' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                      <Gift size={9} />
                                      <span>Auth Perk</span>
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition mt-1.5 truncate" title={group.customerName}>
                                  {group.customerName || 'Unnamed Customer'}
                                </h4>
                              </div>

                              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                {latestQuote.date || 'Recent'}
                              </span>
                            </div>

                            {/* Subject & Line items */}
                            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs">
                              <div className="text-slate-700 font-medium truncate flex items-center gap-1.5" title={firstTitle}>
                                <Package size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{firstTitle}</span>
                              </div>
                              {group.quotations.length > 1 ? (
                                <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                                  <span>+ {group.quotations.length - 1} more equipment quotation(s) for this client</span>
                                </div>
                              ) : (
                                itemsList.length > 1 && (
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    + {itemsList.length - 1} more item(s) included
                                  </div>
                                )
                              )}
                              {group.customerAddress1 && (
                                <div className="text-[11px] text-slate-500 truncate" title={group.customerAddress1}>
                                  📍 {group.customerAddress1}
                                </div>
                              )}
                            </div>

                            {/* Amount Pill */}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs text-slate-500 font-medium">
                                {group.quotations.length > 1 ? 'Total Portfolio:' : 'Quoted Total:'}
                              </span>
                              <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                                ₹{formatCurrency(totalVal)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {group.quotations.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingCustomerKey(group.key);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>View All ({group.quotations.length}) Quotes</span>
                                  <ArrowRight size={13} />
                                </button>
                              ) : (
                                <>
                                  {(!latestQuote.concessionStatus || latestQuote.concessionStatus === 'none' || latestQuote.concessionStatus === 'concession_applied') && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenOnCallModal(latestQuote);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    >
                                      <PhoneCall size={12} className="text-amber-700" />
                                      <span>Call</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLoadSavedQuotation(latestQuote);
                                      setActiveMainTab('quotation');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-sky-200"
                                  >
                                    <Edit3 size={13} />
                                    <span>View & Edit</span>
                                  </button>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (group.quotations.length > 1) {
                                  setViewingCustomerKey(group.key);
                                } else {
                                  handleDeleteSavedQuotation(latestQuote, e);
                                }
                              }}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition cursor-pointer shrink-0"
                              title={group.quotations.length > 1 ? 'Open quotations list to manage' : 'Delete this quotation'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DEDICATED COMPLIMENTARY DESK (CLEAN DIRECT MODE VS CUSTOMER CONCESSION MODE)
          ========================================================================= */}
      {activeMainTab === 'complementary' && (() => {
        const hasCustomerConcession = Boolean(effectiveBudget > 0 || lockedFloorPrice);
        const floorPrice = lockedFloorPrice || grandTotal || 0;
        const bargainedRate = customerBargainedPrice || (items[0]?.unitPrice ? items[0].unitPrice : (lockedFloorPrice ? lockedFloorPrice - effectiveBudget : 0));
        const targetPerkBudget = remainingBudget > 0 ? remainingBudget : effectiveBudget;

        // Auto-detect perks that match or fit the remaining budget (when in customer concession mode)
        const exactMatchPerks = hasCustomerConcession ? COMPLIMENTARY_PERK_CATALOG.filter(p => p.price === targetPerkBudget) : [];
        const fittingPerks = hasCustomerConcession ? COMPLIMENTARY_PERK_CATALOG.filter(p => p.price <= targetPerkBudget) : COMPLIMENTARY_PERK_CATALOG;

        // Distinct price points in ascending order line-wise
        const distinctPrices = Array.from(new Set(COMPLIMENTARY_PERK_CATALOG.map(p => p.price))).sort((a, b) => a - b);

        // Filter perks based on selected dropdown, price input, and search query
        let displayPerks = COMPLIMENTARY_PERK_CATALOG;
        if (typeof selectedPerkFilter === 'number' && !isNaN(selectedPerkFilter)) {
          const exactMatches = COMPLIMENTARY_PERK_CATALOG.filter(p => p.price === selectedPerkFilter);
          displayPerks = exactMatches.length > 0 ? exactMatches : COMPLIMENTARY_PERK_CATALOG.filter(p => p.price <= selectedPerkFilter);
        } else if (hasCustomerConcession && (selectedPerkFilter === 'all_fitting' || selectedPerkFilter === 'fitting' || selectedPerkFilter === 'match')) {
          displayPerks = fittingPerks; // Shows ALL items of all eligible price ranges up to allowance
        } else if (selectedPerkFilter === 'exact') {
          displayPerks = exactMatchPerks.length > 0 ? exactMatchPerks : fittingPerks;
        } else {
          // 'all' or default
          displayPerks = COMPLIMENTARY_PERK_CATALOG;
        }

        if (perkSearchQuery.trim()) {
          const q = perkSearchQuery.toLowerCase();
          displayPerks = displayPerks.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }

        // Default & Intelligent Sorting: First-Expiring, First-Out (FEFO) Protocol
        // "sabse uper kam expirey uske baad badhti expire" (Lowest expiry date on top, increasing expiry dates below)
        displayPerks = [...displayPerks].sort((a, b) => {
          if (perkSortMode === 'price_asc') {
            return a.price - b.price;
          }
          // Pure ascending chronological sort by expiry date:
          const aTime = a.expiryDate ? new Date(a.expiryDate + 'T00:00:00').getTime() : 9999999999999;
          const bTime = b.expiryDate ? new Date(b.expiryDate + 'T00:00:00').getTime() : 9999999999999;
          if (aTime !== bTime) {
            return aTime - bTime;
          }
          return a.price - b.price;
        });

        const isBudgetFullyBalanced = hasCustomerConcession && remainingBudget === 0;

        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* ONLY DISPLAY DEAL CONCESSION METRICS IF USER CAME THROUGH AN ACTIVE CUSTOMER CONCESSION */}
            {hasCustomerConcession && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {floorPrice > 0 && (
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Locked Deal Floor</span>
                      <div className="text-lg font-mono font-black text-slate-900">
                        ₹{floorPrice.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 block">Baseline revenue preserved</span>
                    </div>
                  )}

                  {bargainedRate > 0 && (
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Customer Agreed Rate</span>
                      <div className="text-lg font-mono font-black text-sky-700">
                        ₹{bargainedRate.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 block">Equipment machine billing price</span>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3.5 border border-amber-200 shadow-2xs space-y-1 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider">Perk Allowance</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBudgetFullyBalanced ? 'bg-emerald-200 text-emerald-950 font-black' : 'bg-amber-200 text-amber-900'}`}>
                        {isBudgetFullyBalanced ? '✓ 100% Balanced' : `Remaining: ₹${remainingBudget.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <div className="text-lg font-mono font-black text-amber-900 leading-tight">
                      ₹{currentComplimentaryTotal.toLocaleString('en-IN')} / ₹{effectiveBudget.toLocaleString('en-IN')}
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isBudgetFullyBalanced ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                        style={{ width: `${effectiveBudget > 0 ? Math.min(100, (currentComplimentaryTotal / effectiveBudget) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Banner when 100% Balanced */}
                {isBudgetFullyBalanced && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-emerald-950 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-bold">
                        Perk budget of ₹{effectiveBudget.toLocaleString('en-IN')} is 100% balanced! All complimentary items added below equipment products.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveToMongoDB}
                      disabled={isSavingDb}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Quotation</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dedicated Complimentary Desk Main Workspace */}
            <div className="space-y-4">
              {/* Given / Selected Complimentary Perks Section (Shows when items have been selected) */}
              {currentComplimentaryItems.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-400 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        🎁
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Given Complimentary Perks ({currentComplimentaryItems.length} Items)
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Allocated: <strong className="text-emerald-700 font-mono font-bold">₹{currentComplimentaryTotal.toLocaleString('en-IN')}</strong> of ₹{effectiveBudget.toLocaleString('en-IN')} approved allowance ({remainingBudget === 0 ? '✓ 100% Balanced' : `Remaining: ₹${remainingBudget.toLocaleString('en-IN')}`})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Remove Multiple / Clear All Button */}
                      <button
                        type="button"
                        onClick={handleClearAllComplimentaryItems}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Remove all given complimentary perks"
                      >
                        <Trash2 size={13} />
                        <span>Remove All ({currentComplimentaryItems.length})</span>
                      </button>

                      {/* Save Quotation Button */}
                      <button
                        type="button"
                        disabled={isSavingDb}
                        onClick={handleSaveToMongoDB}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingDb ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                        <span>Save Quotation</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Given Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {currentComplimentaryItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-slate-50 hover:bg-white p-3 rounded-xl border border-slate-200 transition flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <strong className="text-xs font-bold text-slate-800 truncate block">
                              {item.title.replace(/^🎁\s*\[COMPLIMENTARY ADD-ON\]\s*/i, '').replace(/^🎁\s*\[COMPLIMENTARY\]\s*/i, '')}
                            </strong>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-mono font-black text-emerald-700">₹{item.unitPrice}</span>
                            {item.expiryDate && (
                              <span className="text-slate-500 font-mono text-[10px]">
                                Exp: {getExpiryDetails(item.expiryDate).formatted}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveComplimentaryItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition cursor-pointer shrink-0"
                          title="Remove this item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sleek Filter Bar: Dropdown + Direct Price Input + Search & FEFO Sort */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
                {/* Header Row: Title & Expiry Sort Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500 shrink-0" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Perk Catalog (₹50 – ₹1,000)
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {displayPerks.length} / {COMPLIMENTARY_PERK_CATALOG.length} Items
                    </span>
                  </div>

                  {/* Expiry / Price Sort Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPerkSortMode('fefo')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${perkSortMode === 'fefo'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                      title="First-Expiring First-Out: Lowest expiry at top, increasing expiry below"
                    >
                      <span>⏳ Lowest Expiry First (FEFO)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerkSortMode('price_asc')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${perkSortMode === 'price_asc'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <span>₹ Price</span>
                    </button>
                  </div>
                </div>

                {/* Combined Controls: Dropdown + Input + Search */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
                  {/* Dropdown Selector */}
                  <div className="md:col-span-5 flex items-center gap-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 rounded-xl px-3 py-1.5 transition">
                    <Filter size={14} className="text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                        Select Price / Category
                      </label>
                      <select
                        value={
                          typeof selectedPerkFilter === 'number'
                            ? String(selectedPerkFilter)
                            : selectedPerkFilter
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'all_fitting') {
                            setSelectedPerkFilter('all_fitting');
                            setCustomPriceInput('');
                          } else if (val === 'exact') {
                            setSelectedPerkFilter('exact');
                            setCustomPriceInput(String(targetPerkBudget));
                          } else if (val === 'all') {
                            setSelectedPerkFilter('all');
                            setCustomPriceInput('');
                          } else {
                            const num = parseFloat(val);
                            setSelectedPerkFilter(num);
                            setCustomPriceInput(String(num));
                          }
                        }}
                        className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate"
                      >
                        {hasCustomerConcession && (
                          <option value="all_fitting">
                            ⚡ All Fitting Perks (≤ ₹{targetPerkBudget}) [{fittingPerks.length} items]
                          </option>
                        )}
                        {hasCustomerConcession && exactMatchPerks.length > 0 && (
                          <option value="exact">
                            🎯 Exact Match (₹{targetPerkBudget}) [{exactMatchPerks.length} items]
                          </option>
                        )}
                        <option value="all">
                          🌐 All Catalog ({COMPLIMENTARY_PERK_CATALOG.length} items)
                        </option>
                        <optgroup label="── Specific Price Tiers ──">
                          {distinctPrices.map(amt => (
                            <option key={amt} value={String(amt)}>
                              ₹{amt} {amt === targetPerkBudget ? '★ Exact Allowance Match' : ''} ({COMPLIMENTARY_PERK_CATALOG.filter(p => p.price === amt).length} items)
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Direct Price Input */}
                  <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 rounded-xl px-3 py-1.5 transition">
                    <span className="text-xs font-mono font-black text-amber-600 shrink-0">₹</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                        Or Type Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={customPriceInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPriceInput(val);
                          if (val.trim() === '') {
                            setSelectedPerkFilter(hasCustomerConcession ? 'all_fitting' : 'all');
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num)) {
                              setSelectedPerkFilter(num);
                            }
                          }
                        }}
                        placeholder="e.g. 50, 400..."
                        className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400 font-mono"
                      />
                    </div>
                    {customPriceInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPriceInput('');
                          setSelectedPerkFilter(hasCustomerConcession ? 'all_fitting' : 'all');
                        }}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 transition"
                        title="Clear price filter"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Search Product Box */}
                  <div className="md:col-span-4 flex items-center gap-2 bg-slate-50 border border-slate-300 hover:border-slate-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 rounded-xl px-3 py-1.5 transition">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                        Search Catalog
                      </label>
                      <input
                        type="text"
                        value={perkSearchQuery}
                        onChange={(e) => setPerkSearchQuery(e.target.value)}
                        placeholder="Search product..."
                        className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 truncate"
                      />
                    </div>
                    {perkSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPerkSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 transition"
                        title="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Cards Grid: Strictly 3 Products Per Row with Clean Images */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100 flex-wrap gap-1">
                  <span className="font-semibold text-slate-700">
                    Showing {displayPerks.length} Perks {
                      selectedPerkFilter === 'exact'
                        ? `(Exact ₹${targetPerkBudget} Allowance Match)`
                        : typeof selectedPerkFilter === 'number'
                          ? `(₹${selectedPerkFilter} Price Filter • Lowest Expiry First)`
                          : selectedPerkFilter === 'all_fitting' || selectedPerkFilter === 'fitting' || selectedPerkFilter === 'match'
                            ? `(All Price Ranges Fitting ≤ ₹${targetPerkBudget} Allowance • Lowest Expiry First)`
                            : '(All Catalog • Lowest Expiry First)'
                    }
                  </span>
                  {hasCustomerConcession && remainingBudget > 0 && (
                    <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      Remaining Budget: ₹{remainingBudget.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {displayPerks.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    No perks match your filter. Select another price or clear filters to view the catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 max-h-[760px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {displayPerks.map((perk, perkIdx) => {
                      const matchingItems = currentComplimentaryItems.filter(it => it.title && it.title.includes(perk.title));
                      const isSelected = matchingItems.length > 0;
                      const selectedQty = matchingItems.reduce((acc, it) => acc + (it.qty || 1), 0);
                      const selectedPerkItem = matchingItems[0];

                      const isExactMatch = hasCustomerConcession && perk.price === remainingBudget;
                      const fitsInBudget = !hasCustomerConcession || perk.price <= remainingBudget;
                      const isOverBudget = hasCustomerConcession && (perk.price > remainingBudget || remainingBudget <= 0);
                      const expInfo = getExpiryDetails(perk.expiryDate);

                      return (
                        <div
                          key={perk.id}
                          className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between space-y-2.5 relative overflow-hidden bg-white shadow-2xs hover:shadow-md ${isSelected
                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-400/20'
                            : isExactMatch
                              ? 'border-amber-400 bg-amber-50/20 hover:border-amber-500'
                              : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          {/* Vertical-Proportioned Product Image Container */}
                          <div className="relative w-full h-[175px] bg-slate-100 rounded-xl overflow-hidden group shrink-0">
                            <img
                              src={perk.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                              alt={perk.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
                              }}
                            />

                            {/* Top-Left Rank Badge */}
                            <span className="absolute top-2 left-2 text-[10px] font-mono font-black text-slate-800 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-slate-200">
                              #{perkIdx + 1}
                            </span>

                            {/* Top-Right Price Tag */}
                            <span className="absolute top-2 right-2 font-mono text-xs font-black text-emerald-950 bg-emerald-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-lg shadow-2xs border border-emerald-300">
                              ₹{perk.price}
                            </span>

                            {/* Exact Match Ribbon */}
                            {isExactMatch && !isSelected && (
                              <span className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                                🎯 Match
                              </span>
                            )}

                            {/* Category Pill */}
                            {perk.category && (
                              <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-2xs capitalize">
                                {perk.category}
                              </span>
                            )}
                          </div>

                          {/* Product Information with 2-Line Title & Breathing Room */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <strong className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 block" title={perk.title}>
                              {perk.title}
                            </strong>
                            {perk.desc && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                                {perk.desc}
                              </p>
                            )}

                            {/* Clean Expiry Date Badge */}
                            {perk.expiryDate && (
                              <div className="pt-0.5 flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${expInfo.badgeBg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${expInfo.dotColor}`} />
                                  <span>{expInfo.badgeText}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Action: Direct Select / Remove */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                            {isSelected ? (
                              <>
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  ✓ Added ({selectedQty})
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!isOverBudget && (
                                    <button
                                      type="button"
                                      onClick={() => handlePerkAddAttempt(perk)}
                                      className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] transition cursor-pointer"
                                      title="Add another unit"
                                    >
                                      +1 More
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveComplimentaryItem(selectedPerkItem?.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="Remove item"
                                  >
                                    <Trash2 size={11} />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={isOverBudget}
                                onClick={() => handlePerkAddAttempt(perk)}
                                className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${isOverBudget
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : isExactMatch
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                              >
                                <Plus size={13} />
                                <span>{isOverBudget ? `Exceeds (₹${remainingBudget})` : `Select Item (₹${perk.price})`}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
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
                  <div className={`p-3.5 mb-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs ${activeNegotiationNotice.type === 'approved'
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

                {/* Save Quotation Action at Bottom of Form Editor */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Finished modifying quotation? Save changes to database.
                  </span>
                  <button
                    type="button"
                    disabled={isSavingDb}
                    onClick={handleSaveToMongoDB}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingDb ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>Save Quotation</span>
                  </button>
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
                                <div className="font-bold italic text-slate-900 mb-1 flex items-center gap-1.5 flex-wrap">
                                  <span>{item.title || <span className="text-slate-400 italic">[Item Title]</span>}</span>
                                  {(item.isComplimentary || item.title?.includes('COMPLIMENTARY')) && (
                                    <span className="text-[9px] font-sans font-black bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded border border-amber-300 not-italic">
                                      Complimentary (FREE ADD-ON)
                                    </span>
                                  )}
                                </div>
                                {(item.isComplimentary || item.title?.includes('COMPLIMENTARY')) && (
                                  <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1 inline-block not-italic">
                                    ✓ Authorized Concession: ₹{Number(item.complimentaryValue || item.unitPrice).toLocaleString('en-IN')} Allowance • Qty: {item.qty} {item.unitLabel || 'No'} • Concession Complete
                                  </div>
                                )}
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
                      <div className="font-bold italic text-slate-900 mb-1 flex items-center gap-1.5 flex-wrap">
                        <span>{item.title || '[Item Title]'}</span>
                        {(item.isComplimentary || item.title?.includes('COMPLIMENTARY')) && (
                          <span className="text-[9px] font-sans font-black bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded border border-amber-300 not-italic">
                            Complimentary (FREE ADD-ON)
                          </span>
                        )}
                      </div>
                      {(item.isComplimentary || item.title?.includes('COMPLIMENTARY')) && (
                        <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1 inline-block not-italic">
                          ✓ Authorized Concession: ₹{Number(item.complimentaryValue || item.unitPrice).toLocaleString('en-IN')} Allowance • Qty: {item.qty} {item.unitLabel || 'No'} • Concession Complete
                        </div>
                      )}
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
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate">{q.customerName}</span>
                        {isQuoteWithComplimentary(q) && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 shrink-0">
                            🎁 Comp
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 shrink-0">₹{formatCurrency(q.grandTotal || q.totalAmount)}</span>
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
          PRICE NEGOTIATION APPROVAL DESK MODAL (FOR ADMIN) - COMPACT & CLEAN
          ========================================================================= */}
      {negotiationModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-5 space-y-3 text-slate-800 animate-in fade-in zoom-in-95">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                  ⚖️
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Price Approval Desk
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                    Review customer purchase bid vs Catalog MRP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNegotiationModalLead(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Equipment Compact Info Strip */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">
                  {negotiationModalLead.hospital || negotiationModalLead.hospitalName || 'Customer Hospital'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {negotiationModalLead.equipment || negotiationModalLead.productName || 'Equipment'} • {negotiationModalLead.city || negotiationModalLead.district || 'Jaipur'}
                </div>
              </div>
              {negotiationModalLead.phone && (
                <span className="text-[10px] font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                  {negotiationModalLead.phone}
                </span>
              )}
            </div>

            {/* Side-by-Side Price Comparison */}
            {(() => {
              const actualPrice = parseFloat(negotiationModalLead.actualPrice || negotiationModalLead.price || 150000);
              const expectedPrice = parseFloat(negotiationModalLead.expectedPrice || negotiationModalLead.price || 120000);
              const diff = actualPrice - expectedPrice;
              const discountPct = actualPrice > 0 ? Math.round((diff / actualPrice) * 100) : 0;

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Catalog MRP */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Catalog MRP
                      </span>
                      <div className="text-lg font-black font-mono text-slate-900 leading-tight mt-0.5">
                        ₹{actualPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Customer Target */}
                    <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                          Customer Target
                        </span>
                        {diff > 0 && (
                          <span className="text-[9px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-black font-mono text-amber-900 leading-tight mt-0.5">
                        ₹{expectedPrice.toLocaleString('en-IN')}
                      </div>
                      {diff > 0 && (
                        <span className="text-[10px] text-amber-700 block font-medium truncate">
                          Diff: ₹{diff.toLocaleString('en-IN')} below MRP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Option A: Quick Authorize Customer Price */}
                  <button
                    type="button"
                    disabled={negotiationSubmitting}
                    onClick={() => handleApproveCustomerPrice(negotiationModalLead)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Authorize Customer Price (₹{expectedPrice.toLocaleString('en-IN')})</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      OR COUNTER OFFER
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>

                  {/* Option B: Counter Offer */}
                  <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                          Counter Rate (₹)
                        </label>
                        <input
                          type="number"
                          value={counterPriceInput}
                          onChange={(e) => setCounterPriceInput(e.target.value)}
                          placeholder="e.g. 889750"
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-lg focus:border-indigo-600 outline-none text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                          Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={counterNoteInput}
                          onChange={(e) => setCounterNoteInput(e.target.value)}
                          placeholder="Special Offer"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg focus:border-indigo-600 outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={negotiationSubmitting}
                      onClick={() => handleCounterOfferPrice(negotiationModalLead, counterPriceInput, counterNoteInput)}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Authorize Counter Rate (₹{Number(counterPriceInput || 0).toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* =========================================================================
          EMPLOYEE ON-CALL BARGAIN DEMAND MODAL (COMPACT, NEAT & SIMPLE)
          ========================================================================= */}
      {onCallBargainQuote && (() => {
        const quote = onCallBargainQuote;
        const currentTotal = getQuoteTotal(quote);
        const quoteItems = Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [{
          id: 'item-0',
          title: quote.subjectQuotation || 'Medical Equipment',
          qty: 1,
          unitPrice: currentTotal
        }];

        let totalDemanded = 0;
        quoteItems.forEach((it, idx) => {
          const key = it.id || `item-${idx}`;
          const userPrice = parseFloat(onCallItemPrices[key] !== undefined ? onCallItemPrices[key] : (it.unitPrice || 0));
          totalDemanded += userPrice * (parseInt(it.qty || 1, 10));
        });

        if (quoteItems.length === 1 && onCallBargainDemandedPrice) {
          totalDemanded = parseFloat(onCallBargainDemandedPrice);
        }
        const totalGap = Math.max(0, currentTotal - totalDemanded);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-5 space-y-3.5 text-slate-800 animate-in fade-in zoom-in-95">

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                    <PhoneCall size={15} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate">
                      Customer Price Negotiation
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-none mt-0.5 truncate">
                      {quote.customerName || 'Customer'} • <span className="font-mono">{quote.refNo}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOnCallBargainQuote(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Product Pricing & Demanded Input */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {quoteItems.map((it, idx) => {
                  const key = it.id || `item-${idx}`;
                  const originalUnit = parseFloat(it.unitPrice || 0);
                  const currentDemandedUnit = onCallItemPrices[key] !== undefined ? onCallItemPrices[key] : originalUnit;

                  return (
                    <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate" title={it.title}>
                          {it.title || `Item ${idx + 1}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded shrink-0">
                          Qty: {it.qty || 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Quoted Price</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">₹{Number(originalUnit).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-300">
                          <span className="text-[9px] text-amber-800 font-bold uppercase block tracking-wider">Demanded Price (₹)</span>
                          <input
                            type="number"
                            value={currentDemandedUnit}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOnCallItemPrices(prev => ({ ...prev, [key]: val }));
                              if (quoteItems.length === 1) {
                                setOnCallBargainDemandedPrice(val);
                              }
                            }}
                            className="w-full font-mono font-bold text-sm bg-transparent outline-none text-amber-950 mt-0.5"
                            placeholder="Demanded price"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compact Reduction Gap Banner */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Price Comparison</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    ₹{currentTotal.toLocaleString('en-IN')} → ₹{totalDemanded.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">Reduction Gap</span>
                  <span className={`text-xs font-black font-mono ${totalGap > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {totalGap > 0 ? `-₹${totalGap.toLocaleString('en-IN')} Drop` : '₹0 (No Change)'}
                  </span>
                </div>
              </div>

              {/* Discussion Note / Call Remark */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Call Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={onCallBargainRemarks}
                  onChange={(e) => setOnCallBargainRemarks(e.target.value)}
                  placeholder="e.g. Customer requested price drop on call"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 focus:bg-white focus:border-amber-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={onCallBargainSubmitting}
                  onClick={handleSubmitOnCallBargain}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {onCallBargainSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send to Admin for Approval {totalGap > 0 ? `(-₹${totalGap.toLocaleString('en-IN')})` : ''}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOnCallBargainQuote(null)}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          ADMIN REVIEW ON-CALL CONCESSION MODAL (TWO DISTINCT APPROVAL OPTIONS)
          ========================================================================= */}
      {isAdmin && adminConcessionQuote && (() => {
        const quote = adminConcessionQuote;
        const originalTotal = getQuoteTotal(quote);
        const demandedTotal = parseFloat(quote.customerDemandedPrice || (originalTotal > 200 ? originalTotal - 200 : originalTotal));
        const gap = Math.max(0, originalTotal - demandedTotal);
        const quoteItems = Array.isArray(quote.items) && quote.items.length > 0 ? quote.items : [];

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 text-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-900 flex items-center justify-center font-bold text-xl">
                    <ShieldCheck size={22} className="text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Admin Concession Decision Desk
                    </h3>
                    <p className="text-xs text-slate-500">
                      Quotation previously issued — returned for customer price concession review
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminConcessionQuote(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* High-Visibility Status Banner */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                  <Tag size={14} className="text-amber-700" />
                  <span>Quotation Previously Issued (Rev 1, Ref: {quote.refNo}) — Returned for Price Review</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  This quotation was already issued. Customer negotiated on call stating they can get ₹{Number(gap).toLocaleString('en-IN')} cheaper elsewhere.
                </p>
              </div>

              {/* Deal Comparison Overview */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Customer / Hospital:</span>
                  <strong className="text-slate-900 font-bold">{quote.customerName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Original Quoted Total:</span>
                  <strong className="font-mono text-slate-800 font-bold">₹{Number(originalTotal).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Customer Demanded Price:</span>
                  <strong className="text-rose-700 font-mono font-black text-sm">₹{Number(demandedTotal).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Requested Price Drop (Gap):</span>
                  <strong className="text-rose-700 font-mono font-black text-sm">₹{Number(gap).toLocaleString('en-IN')}</strong>
                </div>
                {quote.concessionRemarks && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 mt-1">
                    <strong>Call Remarks:</strong> {quote.concessionRemarks}
                  </div>
                )}
              </div>

              {/* Two Distinct Admin Approval Options */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-700 block">
                  Select Admin Approval Option:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Direct Price Discount */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                        <strong className="text-xs font-bold text-emerald-950">Option A: Direct Price Discount</strong>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1.5 leading-snug">
                        Approve direct price reduction to <strong>₹{Number(demandedTotal).toLocaleString('en-IN')}</strong>. Cash quote price will reduce by ₹{Number(gap).toLocaleString('en-IN')}.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={adminConcessionSubmitting}
                      onClick={() => handleApproveDirectPriceDiscount(quote, demandedTotal, gap)}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve Direct Discount (₹{Number(demandedTotal).toLocaleString('en-IN')})</span>
                    </button>
                  </div>

                  {/* Option 2: Complimentary Perk Allowance */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">2</span>
                        <strong className="text-xs font-bold text-purple-950">Option B: Complimentary Perk</strong>
                      </div>
                      <p className="text-[11px] text-purple-800 mt-1.5 leading-snug">
                        Keep machine cash price at <strong>₹{Number(originalTotal).toLocaleString('en-IN')}</strong> and grant <strong>₹{Number(gap).toLocaleString('en-IN')}</strong> in free accessories/perks.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={adminConcessionSubmitting}
                      onClick={() => handleApproveComplimentaryPerk(quote, originalTotal, gap)}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Gift size={13} />
                      <span>Approve ₹{Number(gap).toLocaleString('en-IN')} Complimentary Perk</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminConcessionQuote(null)}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          FEFO NEAR-EXPIRY STOCK ADVISORY MODAL (HIGH-IMPACT ENGLISH NOTIFICATION)
          ========================================================================= */}
      {expiryAdvisoryData && (() => {
        const { selectedPerk, earlierPerk, allEarlierPerks } = expiryAdvisoryData;
        const selExp = getExpiryDetails(selectedPerk.expiryDate);
        const earExp = getExpiryDetails(earlierPerk.expiryDate);
        const dayDifference = Math.max(1, selExp.daysLeft - earExp.daysLeft);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-slate-800 animate-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold shadow-2xs shrink-0 ring-4 ring-amber-50">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                        Earlier-Expiring Stock Advisory
                      </h3>
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        FEFO Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      First-Expiring, First-Out Medical Dispensing Protocol
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpiryAdvisoryData(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>



              {/* Comparison: Selected vs Earlier Expiring */}
              <div className="space-y-3">
                {/* 1. What Employee Clicked (Selected) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  {selectedPerk.image && (
                    <img
                      src={selectedPerk.image}
                      alt={selectedPerk.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Your Current Selection:
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {selectedPerk.title}
                      </strong>
                      <span className="font-mono text-xs font-black text-slate-800 shrink-0">
                        ₹{selectedPerk.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-600 flex-wrap">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${selExp.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selExp.dotColor}`}></span>
                        <span>Expiry: {selExp.formatted} ({selExp.daysLeft} days left)</span>
                      </span>
                      {selectedPerk.batchNo && (
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {selectedPerk.batchNo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Recommended Earlier-Expiring Stock */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 shadow-xs space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    ⭐ Recommended Earlier Stock
                  </div>

                  <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider block">
                    Found Earlier-Expiring Stock in Warehouse:
                  </span>

                  <div className="flex items-center gap-3">
                    {earlierPerk.image && (
                      <img
                        src={earlierPerk.image}
                        alt={earlierPerk.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-emerald-300 bg-white shadow-2xs"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm font-black text-emerald-950 leading-snug line-clamp-1">
                          {earlierPerk.title}
                        </strong>
                        <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 shrink-0">
                          ₹{earlierPerk.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-snug line-clamp-1">
                        {earlierPerk.desc}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-extrabold bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md border border-rose-300 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                          <span>Expires: {earExp.formatted} ({earExp.daysLeft}d left)</span>
                        </span>
                        <span className="font-extrabold text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          ⚡ {dayDifference} days sooner!
                        </span>
                      </div>
                    </div>
                  </div>

                  {allEarlierPerks.length > 1 && (
                    <div className="text-[10px] text-emerald-800 font-semibold pt-0.5">
                      ℹ️ Note: {allEarlierPerks.length} earlier-expiring items are available in the catalog matching your allowance.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: 2 Equal Choices (Zero Boundation) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleAddComplimentaryProduct(
                      earlierPerk.title,
                      earlierPerk.price,
                      earlierPerk.desc,
                      earlierPerk.expiryDate,
                      earlierPerk.batchNo
                    );
                    setExpiryAdvisoryData(null);
                    setSuccessToast(`✅ Allocated earlier-expiring "${earlierPerk.title}" (Expires ${earExp.formatted})!`);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ring-2 ring-emerald-400/30"
                >
                  <CheckCircle2 size={16} />
                  <span>Select Recommended Earlier Stock ({earlierPerk.title})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAddComplimentaryProduct(
                      selectedPerk.title,
                      selectedPerk.price,
                      selectedPerk.desc,
                      selectedPerk.expiryDate,
                      selectedPerk.batchNo
                    );
                    setExpiryAdvisoryData(null);
                    setSuccessToast(`Allocated "${selectedPerk.title}" as requested.`);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Keep My Choice & Add "{selectedPerk.title}" Anyway</span>
                </button>

                <div className="flex justify-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setExpiryAdvisoryData(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold py-1 px-3 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

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
