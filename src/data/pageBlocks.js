// Standard WordPress / Elementor-style Modular Blocks for Biomedical Websites

export const SITE_PAGES = [
  { id: 'home', name: '🏠 Homepage', slug: '/', description: 'Full Storefront & Impact Sections' },
  { id: 'shop', name: '🛍️ Shop / Clinical Catalog', slug: '/shop', description: 'Complete Product Catalog & Filters' },
  { id: 'equipment', name: '🏥 Medical Equipment & Machinery', slug: '/equipment', description: 'Diagnostic, ICU & Refurbished' },
  { id: 'rfq', name: '📋 B2B Bulk Order & RFQ', slug: '/rfq', description: 'Institutional Procurement & BOQ' },
  { id: 'about', name: 'ℹ️ About Us & Compliance', slug: '/about', description: 'Certifications & Factory Infrastructure' },
  { id: 'contact', name: '📞 Contact & Helplines', slug: '/contact', description: 'Warehouses & 24/7 Service Desks' }
];

export const AVAILABLE_BLOCK_TYPES = [
  {
    type: 'announcement',
    name: 'Top Notice Bar',
    icon: 'AlertCircle',
    description: 'Urgent notification bar at the very top (compliance, discount, notice)',
    defaultData: {
      enabled: true,
      text: 'CDSCO & ISO 13485:2016 Certified Equipment | Direct Factory Dispatch',
      badge: 'URGENT BATCH',
      bgColor: '#0ea5e9',
      textColor: '#ffffff',
      linkText: 'Check Ready Stock',
      linkUrl: '#products'
    }
  },
  {
    type: 'header',
    name: 'Header & Navigation',
    icon: 'Layers',
    description: 'Logo, search bar, contact desk, emergency telephone and quote button',
    defaultData: {
      enabled: true,
      showSearch: true,
      showContact: true,
      showQuoteBtn: true,
      badgeText: '24/7 Biomedical Support',
      locationText: 'Delivering to: Delhi, 110001'
    }
  },
  {
    type: 'quickNav',
    name: 'Floating Quick-Access Sidebar',
    icon: 'Menu',
    description: 'Left vertical mini-dock for fast switching between categories, brands, deals, and pages',
    defaultData: {
      enabled: true,
      showHome: true,
      showCategories: true,
      showBrands: true,
      showDeals: true,
      showEquipment: true,
      showSupport: true
    }
  },
  {
    type: 'hero',
    name: 'Hero Showcase Banner',
    icon: 'Sparkles',
    description: 'Main impact banner with headlines, badges, background gradient, and RFQ buttons',
    defaultData: {
      enabled: true,
      title: 'Precision Biomedical & Critical Care Equipment',
      subtitle: 'Engineered for high-acuity ICUs, Modular Operation Theatres, and Emergency Trauma Units across India.',
      badgeText: 'Institutional B2B Procurement',
      primaryBtnText: 'Request Institutional RFQ',
      secondaryBtnText: 'Download Product Spec Sheet',
      statsNumber: '2,840+',
      statsLabel: 'Hospitals Commissioned'
    }
  },
  {
    type: 'trustBadges',
    name: 'Trust & Compliance Badges',
    icon: 'ShieldCheck',
    description: '4 credibility badges (ISO 13485, CE European, CDSCO, 24/7 CMC Warranty)',
    defaultData: {
      enabled: true,
      badge1Title: 'ISO 13485:2016',
      badge1Desc: 'Certified Medical Device Facility',
      badge2Title: 'CDSCO Approved',
      badge2Desc: 'Direct Regulatory Compliant Batch',
      badge3Title: '2-Year OEM Warranty',
      badge3Desc: 'Comprehensive Onsite CMC Support',
      badge4Title: 'Turnkey Clinical Training',
      badge4Desc: 'Biomedical Engineers at Hospital'
    }
  },
  {
    type: 'categories',
    name: 'Clinical Specialty Grid',
    icon: 'Building2',
    description: 'Departmental selector: ICU, OT, Dialysis, Cardiology, Laparoscopy',
    defaultData: {
      enabled: true,
      heading: 'Clinical Departments & Medical Specializations',
      subheading: 'Select specialty to filter high-acuity equipment engineered for hospitals & surgical centers.'
    }
  },
  {
    type: 'topBrands',
    name: 'Top Healthcare Brands',
    icon: 'Award',
    description: 'Brand showcase with certified OEM logos: Omron, Philips, Nipro, BPL, BD, 3M, Romsons',
    defaultData: {
      enabled: true,
      heading: 'Top Healthcare & Biomedical Brands',
      subheading: 'Direct manufacturer distribution with genuine OEM warranty and institutional discounts'
    }
  },
  {
    type: 'dealSpotlight',
    name: 'Lightning Deals & Spotlight',
    icon: 'Zap',
    description: 'Dark navy spotlight card with countdown timer and steep B2B discounts',
    defaultData: {
      enabled: true,
      title: 'Lightning Deals',
      badge: 'LIMITED PERIOD',
      subtitle: 'Up to 40% OFF on critical care disposables & equipment',
      timerText: 'Ends in 05h 24m 18s',
      ctaText: 'Explore All Deals'
    }
  },
  {
    type: 'trendingConsumables',
    name: 'Hospital Consumables Shelf',
    icon: 'Package',
    description: 'Fast-moving consumables: Nitrile Gloves, Syringes, IV Infusion Sets, Cannula',
    defaultData: {
      enabled: true,
      heading: 'Trending Hospital Consumables',
      subheading: 'High-frequency clinical supplies in bulk carton packaging with immediate dispatch.'
    }
  },
  {
    type: 'diagnosticMachinery',
    name: 'Diagnostic & Lab Machinery',
    icon: 'Activity',
    description: 'Hematology analyzers, Biochemistry consoles, Urine analyzers, Centrifuges',
    defaultData: {
      enabled: true,
      heading: 'Diagnostic & Laboratory Systems',
      subheading: 'Automated clinical pathology equipment with factory calibration and reagent support.'
    }
  },
  {
    type: 'criticalCare',
    name: 'ICU & Monitoring Systems',
    icon: 'HeartPulse',
    description: 'Multi-parameter patient monitors, Syringe infusion pumps, Defibrillators, ICU Ventilators',
    defaultData: {
      enabled: true,
      heading: 'Critical Care & Patient Monitoring',
      subheading: 'High-precision telemetry and resuscitation stations for emergency wards & ICUs.'
    }
  },
  {
    type: 'refurbishedEquipment',
    name: 'Refurbished High-End Machinery',
    icon: 'Cpu',
    description: 'Certified Refurbished CT Scanners, 1.5T MRI, High Frequency C-Arm Systems',
    defaultData: {
      enabled: true,
      heading: 'Certified Refurbished Imaging & Radiology',
      subheading: 'OEM recalibrated CT, MRI & C-Arm systems with 1-Year Comprehensive Warranty & AERB support.'
    }
  },
  {
    type: 'products',
    name: 'Hardware Equipment Catalog',
    icon: 'Layers',
    description: 'Interactive cards with models, specifications, CDSCO badges, and instant RFQ buttons',
    defaultData: {
      enabled: true,
      heading: 'Certified Biomedical Hardware Catalog',
      subheading: 'Hospital-grade critical care equipment available for immediate batch procurement.',
      filterCategory: 'all',
      itemsToShow: 12
    }
  },
  {
    type: 'customContent',
    name: 'Custom Rich Text & Headline',
    icon: 'FileText',
    description: 'Write any custom headline, paragraphs, styling, alignment, and custom button',
    defaultData: {
      enabled: true,
      heading: 'Precision Biomedical Engineering Infrastructure',
      subheading: 'Custom clinical overview engineered for NABH compliance.',
      bodyText: 'We engineer precision life support devices and supply NABH accredited clinical batches across India. Fully customizable content block that you can modify, style, or position anywhere.',
      align: 'left',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      btnText: 'Learn More & Inquire',
      btnLink: '#contact'
    }
  },
  {
    type: 'customGrid',
    name: 'Custom Feature Cards Grid',
    icon: 'LayoutGrid',
    description: '2, 3, or 4 column feature cards with customizable titles and descriptions',
    defaultData: {
      enabled: true,
      heading: 'Key Hospital Advantages & Capabilities',
      subheading: 'Engineered for reliability, zero breakdown downtime, and regulatory compliance.',
      columns: '3',
      items: [
        { id: 'item-1', title: 'Factory Calibrated', desc: 'Pre-calibrated in sterile ISO Class 7 cleanrooms prior to dispatch.' },
        { id: 'item-2', title: 'Same-Day Dispatch', desc: 'High-frequency consumables stocked in regional warehouse depots.' },
        { id: 'item-3', title: 'Onsite Engineering', desc: 'Biomedical technicians verify electrical grounding and clinical staff training.' }
      ]
    }
  },
  {
    type: 'customBanner',
    name: 'Custom Promotional Banner',
    icon: 'Image',
    description: 'Wide promotional banner with custom background image, headline, and link',
    defaultData: {
      enabled: true,
      heading: 'Specialized Modular Hospital Infrastructure',
      subheading: 'Direct factory rates for tertiary healthcare facilities and government tenders.',
      bannerImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      btnText: 'Request Institutional BOQ'
    }
  },
  {
    type: 'customEmbed',
    name: 'Custom Code / HTML / Widget',
    icon: 'Code',
    description: 'Direct code editor for custom HTML, Tailwind styles, Google Maps, YouTube video, or forms',
    defaultData: {
      enabled: true,
      title: 'Custom HTML / Widget Area',
      htmlCode: `<div class="p-8 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-3xl text-white text-center shadow-xl my-4">
  <span class="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Developer Freedom</span>
  <h3 class="text-2xl font-extrabold mb-2">Custom Code & Developer Component Block</h3>
  <p class="text-sm text-sky-100 max-w-xl mx-auto mb-4 leading-relaxed">Aap yahan koi bhi custom HTML, CSS, Tailwind classes, video embed ya map iframe daal sakte hain jaise code se banate hain!</p>
  <button class="px-6 py-2.5 bg-white text-sky-800 font-bold text-xs rounded-xl shadow-md hover:bg-slate-50 transition">Instant Interactive Button</button>
</div>`
    }
  },
  {
    type: 'customCta',
    name: 'High-Converting Call-To-Action',
    icon: 'Sparkles',
    description: 'Eye-catching CTA block with dual buttons and glowing accent',
    defaultData: {
      enabled: true,
      badge: 'DIRECT OEM COLLABORATION',
      heading: 'Ready to Upgrade Your Hospital ICU or Surgical Ward?',
      subheading: 'Our senior biomedical engineering committee provides custom equipment drawings & BOQs in 30 minutes.',
      primaryBtnText: 'Get Official Stamped Quotation',
      secondaryBtnText: 'Download Product Spec Sheet'
    }
  },
  {
    type: 'turnkeySolutions',
    name: 'Turnkey OT & ICU Suites',
    icon: 'Layers',
    description: 'Showcase modular operation theatre setups, ceiling pendants, and piped gas systems',
    defaultData: {
      enabled: true,
      heading: 'Turnkey Modular ICU & Surgical Suites',
      subheading: 'Complete architectural layout, electrical commissioning & equipment integration by senior biomedical engineers.'
    }
  },
  {
    type: 'testimonials',
    name: 'Doctor & Hospital Testimonials',
    icon: 'MessageSquare',
    description: 'Customer feedback from leading hospital directors and procurement officers',
    defaultData: {
      enabled: true,
      heading: 'What Our Customers Say About Us',
      subheading: 'Trusted by over 2,800+ hospitals, medical colleges, and diagnostic chains across India.'
    }
  },
  {
    type: 'faqs',
    name: 'Frequently Asked Questions (FAQ)',
    icon: 'HelpCircle',
    description: 'Accordion answering GeM procurement, GST invoices, warranty claims, and shipping',
    defaultData: {
      enabled: true,
      heading: 'Frequently Asked Questions',
      subheading: 'Everything you need to know about ordering biomedical hardware and hospital supplies.'
    }
  },
  {
    type: 'rfqBanner',
    name: 'Instant RFQ / Quotation Callout',
    icon: 'PhoneCall',
    description: 'High-converting callout banner encouraging hospital committees to request pricing',
    defaultData: {
      enabled: true,
      heading: 'Planning Hospital Wing Expansion or New ICU Ward?',
      subheading: 'Our biomedical engineers calculate customized BOQs (Bill of Quantities) within 30 minutes.',
      btnText: 'Talk to Clinical Specialist',
      phoneText: 'Direct Desk'
    }
  },
  {
    type: 'contactDesk',
    name: 'Biomedical Helpdesk & Warehouses',
    icon: 'MapPin',
    description: 'Regional dispatch centers, warehouse hubs, emergency support desks',
    defaultData: {
      enabled: true,
      heading: 'Central Biomedical Dispatch & Engineering Desks',
      subheading: 'Strategic regional hubs ensuring rapid equipment dispatch & 4-hour breakdown response.'
    }
  },
  {
    type: 'footer',
    name: 'Corporate Compliance Footer',
    icon: 'FileText',
    description: 'Regulatory disclaimers, company legal details, quick links, and copyright',
    defaultData: {
      enabled: true,
      copyrightText: 'All Rights Reserved. CDSCO Medical Device Rules & ISO Certified Manufacturing Hub.'
    }
  }
];

export function getDefaultBlocksForSite(site) {
  return AVAILABLE_BLOCK_TYPES.map(bt => ({
    id: `block-${bt.type}-${Math.random().toString(36).substr(2, 6)}`,
    type: bt.type,
    name: bt.name,
    enabled: true,
    data: {
      ...bt.defaultData,
      ...(bt.type === 'hero' && site?.heroTitle ? { title: site.heroTitle } : {}),
      ...(bt.type === 'announcement' && site?.announcement ? { text: site.announcement } : {}),
      ...(bt.type === 'contactDesk' && site?.city ? { subheading: `Operating from ${site.city} with pan-India hospital coverage.` } : {})
    }
  }));
}
