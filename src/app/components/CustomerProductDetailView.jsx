'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Package,
  Eye,
  Download,
  Printer,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  FileText,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  History,
  Layers,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { numberToWordsIndian } from '../../lib/numberToWords';

export default function CustomerProductDetailView({
  customer,
  onBack,
  allQuotations = [],
  allLeads = [],
  onOpenAudit,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);
  const [activePageTab, setActivePageTab] = useState('all'); // 'all' | '1' | '2' | '3' | '4'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadingProductId, setDownloadingProductId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Hidden off-screen export refs for high-res PDF generation
  const exportPage1Ref = useRef(null);
  const exportPage2Ref = useRef(null);
  const exportPage3Ref = useRef(null);
  const exportPage4Ref = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Format currency
  const formatCurrency = (amt) => {
    const num = Number(amt) || 0;
    return num.toLocaleString('en-IN');
  };

  // Aggregate all products belonging to this customer from quotations & leads
  const customerProducts = useMemo(() => {
    if (!customer) return [];

    const custPhone = (customer.phone || '').replace(/\D/g, '').slice(-10);
    const custEmail = (customer.email || '').toLowerCase().trim();
    const custHosp = (customer.hospitalName || '').toLowerCase().trim();
    const custDoc = (customer.fullName || '').toLowerCase().trim();

    const productMap = new Map();

    // 1. Process from quotations list
    (allQuotations || []).forEach((q) => {
      const qPhone = (q.customerAddress2 || q.phone || '').replace(/\D/g, '').slice(-10);
      const qName = (q.customerName || '').toLowerCase().trim();

      const phoneMatch = custPhone && qPhone && (qPhone.includes(custPhone) || custPhone.includes(qPhone));
      const emailMatch = false; // quotations usually don't have separate email
      const hospMatch = custHosp && qName && (qName.includes(custHosp) || custHosp.includes(qName));
      const docMatch = custDoc && qName && (qName.includes(custDoc) || custDoc.includes(qName));

      if (phoneMatch || hospMatch || docMatch) {
        (q.items || []).forEach((item, itemIdx) => {
          const title = (item.title || 'Biomedical Equipment').trim();
          const refNo = q.refNo || q.id || 'RB-QT-2026';
          const key = `${title.toLowerCase()}__${refNo}`;

          if (!productMap.has(key)) {
            // Find match in catalog for rich specifications and photo
            const catMatch = PRODUCTS.find((p) =>
              p.name.toLowerCase() === title.toLowerCase() ||
              title.toLowerCase().includes(p.name.toLowerCase()) ||
              p.name.toLowerCase().includes(title.toLowerCase())
            );

            productMap.set(key, {
              id: `${q.id || 'quote'}-${itemIdx}`,
              refNo: refNo,
              quoteId: q.id,
              productName: title,
              itemCode: item.itemCode || catMatch?.sku || '',
              category: catMatch?.category || 'Biomedical & ICU Equipment',
              brand: catMatch?.brand || 'Raj Biosis OEM',
              image: catMatch?.image || '/biomedical-placeholder.png',
              shortDesc: catMatch?.shortDesc || 'Advanced healthcare equipment manufactured to ISO 13485 standards.',
              warranty: catMatch?.warranty || '2 Years Comprehensive Warranty + 3 Years Support',
              qty: item.qty || 1,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || ((item.unitPrice || 0) * (item.qty || 1)),
              grandTotal: q.grandTotal || item.totalPrice || item.unitPrice || 0,
              gstRate: '12%',
              gstAmount: Math.round(((item.totalPrice || item.unitPrice || 0) * 0.12)),
              date: q.date || (q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
              bullets: item.bullets || catMatch?.features?.join('\n') || '',
              quotationData: q,
              source: 'quotation',
              status: 'Quotation Generated'
            });
          }
        });
      }
    });

    // 2. Process from central leads list
    (allLeads || []).forEach((lead) => {
      const lPhone = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\D/g, '').slice(-10);
      const lEmail = (lead.email || lead.customerEmail || lead.rawLeadData?.customerEmail || '').toLowerCase().trim();
      const lHosp = (lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').toLowerCase().trim();
      const lDoc = (lead.doctorName || lead.customerName || lead.rawLeadData?.customerName || '').toLowerCase().trim();

      const phoneMatch = custPhone && lPhone && (lPhone.includes(custPhone) || custPhone.includes(lPhone));
      const emailMatch = custEmail && lEmail && (lEmail === custEmail);
      const hospMatch = custHosp && lHosp && (lHosp.includes(custHosp) || custHosp.includes(lHosp));
      const docMatch = custDoc && lDoc && (lDoc.includes(custDoc) || custDoc.includes(lDoc));

      if (phoneMatch || emailMatch || hospMatch || docMatch) {
        const raw = lead.rawLeadData || {};
        const title = (lead.equipment || lead.productName || raw.productName || 'Biomedical Equipment').trim();
        const refNo = raw.quoteNumber || lead.id || 'RB-QT-2026';
        const key = `${title.toLowerCase()}__${refNo}`;

        if (!productMap.has(key)) {
          const catMatch = PRODUCTS.find((p) =>
            p.name.toLowerCase() === title.toLowerCase() ||
            title.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(title.toLowerCase())
          );

          const unitPrice = raw.unitPrice || parseInt(String(lead.quoteAmount || '0').replace(/[^0-9]/g, '')) || catMatch?.price || 150000;
          const qty = raw.quantity || raw.qty || 1;
          const grandTotal = raw.grandTotal || (unitPrice * 1.12);

          // Construct a full quotation structure for this lead
          const syntheticQuotation = {
            id: lead.id,
            refNo: refNo,
            date: lead.date || (lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'Recent'),
            customerName: customer.hospitalName || lead.hospital || 'Healthcare Institution',
            customerAddress1: `${customer.district || lead.city || 'Jaipur'}, ${customer.state || 'Rajasthan'}`,
            customerAddress2: `Contact: +91 ${custPhone || lead.phone || ''}`,
            subjectLetter: `Quotation purchase of ${title}`,
            subjectQuotation: `Purchase of ${title}`,
            items: [
              {
                id: 'item-1',
                sr: 1,
                itemCode: raw.productSku || catMatch?.sku || '',
                title: title,
                bullets: catMatch?.features?.join('\n') || 'NABH Standard compliant critical care medical device\n1 Year Comprehensive Warranty included',
                qty: qty,
                unitPrice: unitPrice,
                totalPrice: Math.round(grandTotal)
              }
            ],
            subtotal: unitPrice * qty,
            grandTotal: Math.round(grandTotal),
            signatory: {
              name: 'Bhupender Raj',
              role: 'Sales & Mkt. Head',
              company: 'Raj Biosis Pvt Ltd.',
              address1: 'B-7, Aman Plaza, Plot No. 26,',
              address2: 'Heera Nagar-A, Chitrakoot',
              city: 'Jaipur-302021 Rajasthan',
              phone: '+91-998-3333-469'
            }
          };

          productMap.set(key, {
            id: lead.id,
            refNo: refNo,
            quoteId: lead.id,
            productName: title,
            itemCode: raw.productSku || catMatch?.sku || '',
            category: raw.productCategory || catMatch?.category || 'Biomedical & ICU Equipment',
            brand: raw.productBrand || catMatch?.brand || 'Raj Biosis OEM',
            image: raw.productImage || catMatch?.image || '/biomedical-placeholder.png',
            shortDesc: catMatch?.shortDesc || 'NABH Standard compliant critical care medical device.',
            warranty: raw.warranty || catMatch?.warranty || '2 Years Comprehensive Warranty',
            qty: qty,
            unitPrice: unitPrice,
            totalPrice: unitPrice * qty,
            grandTotal: Math.round(grandTotal),
            gstRate: '12%',
            gstAmount: Math.round(unitPrice * qty * 0.12),
            date: lead.date || (lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
            bullets: catMatch?.features?.join('\n') || '',
            quotationData: syntheticQuotation,
            source: 'lead',
            status: lead.status || 'Inquiry Verified'
          });
        }
      }
    });

    return Array.from(productMap.values());
  }, [customer, allQuotations, allLeads]);

  // Filtered by user's search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return customerProducts;
    const q = searchQuery.toLowerCase().trim();
    return customerProducts.filter((p) =>
      p.productName.toLowerCase().includes(q) ||
      p.refNo.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [customerProducts, searchQuery]);

  // Total portfolio value
  const totalCustomerPipeline = useMemo(() => {
    return customerProducts.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);
  }, [customerProducts]);

  // =========================================================================
  // DOWNLOAD PROFORMA INVOICE (PI) PDF FOR A SPECIFIC PRODUCT
  // =========================================================================
  const handleDownloadPiPdf = async (product) => {
    if (!product) return;
    setDownloadingProductId(product.id);
    setIsGeneratingPdf(true);

    const cleanCust = (customer.hospitalName || customer.fullName || 'Customer')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    const cleanRef = (product.refNo || 'PI').replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFilename = `${cleanCust}_PI_${cleanRef}.pdf`;

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

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
          scale: 2,
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

      pdf.save(pdfFilename);
      showToast(`⚡ Proforma Invoice downloaded successfully: "${pdfFilename}"`);
    } catch (err) {
      console.error('PI PDF export error:', err);
      // Fallback: window.print()
      const prevTitle = document.title;
      document.title = pdfFilename.replace('.pdf', '');
      window.print();
      document.title = prevTitle;
    } finally {
      setIsGeneratingPdf(false);
      setDownloadingProductId(null);
    }
  };

  // Reusable Letterhead Header
  const DocumentHeader = () => (
    <div className="flex items-start justify-between pb-3 border-b border-transparent">
      <div className="flex items-center gap-2">
        <img
          src="/rajbiosis-logo.png"
          alt="Raj Biosis Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
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

  // Reusable Letterhead Footer
  const DocumentFooter = ({ pageNum }) => (
    <div className="mt-auto pt-6">
      <div className="w-full h-[3px] bg-[#8B2323] mb-2 rounded-full"></div>
      <div className="text-center font-serif text-[#8B2323] font-bold text-xs uppercase tracking-wider">
        RAJ BIOSIS PRIVATE LIMITED
      </div>
      <div className="text-center font-serif italic text-[10px] text-slate-600 leading-tight mt-0.5">
        B-7, Aman Plaza, Plot No.-26, Heera Nagar-A, Chitrakoot, Jaipur-302021. Rajasthan (India)
      </div>
      <div className="flex items-center justify-between font-serif italic text-[10px] text-slate-600 mt-0.5 px-2">
        <span>Tel.: +91-141-6052-000, +91-998-3333-469; E-mail: info@rajbiosis.com</span>
        <span className="font-semibold text-slate-800 not-italic">Page {pageNum} of 4</span>
      </div>
    </div>
  );

  // Active quotation data being viewed or exported
  const activeQuote = selectedProductForQuote?.quotationData || (customerProducts[0]?.quotationData);
  const activeProduct = selectedProductForQuote || customerProducts[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs group cursor-pointer"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition" />
            <span>Back to Registered Profiles</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>/</span>
            <span>Customer Directory</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">{customer.fullName || 'Customer Profile'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAudit && (
            <button
              type="button"
              onClick={() => onOpenAudit(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-100"
            >
              <History size={13} />
              <span>Audit History</span>
            </button>
          )}

          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-2xs"
            >
              <PhoneCall size={13} />
              <span>Call Doctor</span>
            </a>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 transition"
            title="Refresh customer data"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* CUSTOMER PROFILE OVERVIEW HEADER CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Customer Left Bio */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {(customer.fullName || customer.hospitalName || 'C').charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-normal">
                  {customer.fullName || 'Medical Client'}
                </h2>
                <span className="text-[11px] font-mono font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {customer.id}
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>Verified Medical Buyer</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
                <span className="flex items-center gap-1 text-slate-800">
                  <Building2 size={14} className="text-sky-600" />
                  <strong>{customer.hospitalName || 'Clinic / Hospital'}</strong>
                </span>
                {customer.designation && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{customer.designation}</span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-sky-700">
                  <MapPin size={12} />
                  <span>{customer.district || 'Jaipur'}, {customer.state || 'Rajasthan'}</span>
                </span>
              </div>

              {/* Contact Pills */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap text-xs">
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-sky-600 font-mono font-semibold bg-slate-50 hover:bg-sky-50 px-2.5 py-0.5 rounded-lg border border-slate-200 transition text-[11px]"
                  >
                    <PhoneCall size={11} className="text-emerald-600" />
                    <span>+91 {customer.phone}</span>
                  </a>
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 px-2.5 py-0.5 rounded-lg border border-slate-200 transition text-[11px]"
                  >
                    <Mail size={11} className="text-sky-600" />
                    <span>{customer.email}</span>
                  </a>
                )}
                {customer.address && (
                  <span className="text-slate-500 text-[11px] bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200 truncate max-w-xs">
                    📍 {customer.address} {customer.pincode ? `(${customer.pincode})` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer Financial / Order Summary Metrics */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Products Inquired
              </span>
              <span className="text-lg font-extrabold text-slate-900 block font-mono">
                {customerProducts.length} <span className="text-xs font-sans font-medium text-slate-500">Items</span>
              </span>
            </div>

            <div className="bg-emerald-50/60 rounded-2xl px-4 py-2.5 border border-emerald-200/80 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                Total PI Value
              </span>
              <span className="text-lg font-extrabold text-emerald-700 block font-mono">
                ₹{formatCurrency(totalCustomerPipeline)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS & PROFORMA INVOICES (PI) SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Section Header & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
              <Package size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Requested Equipment & Quotations (PI)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  {filteredProducts.length} Products
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click <strong className="text-slate-600">Eye</strong> to view official quotation or <strong className="text-slate-600">Download</strong> to save PI PDF.
              </p>
            </div>
          </div>

          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, ref no..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:bg-white focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Products Table - 100% Responsive, NO Horizontal Scroll */}
        <div className="w-full">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/70">
                <th className="py-3 px-4 w-[42%]">Equipment / Product Details</th>
                <th className="py-3 px-3 w-[20%]">Quotation Ref & Date</th>
                <th className="py-3 px-3 w-[20%]">Amount (PI) & Qty</th>
                <th className="py-3 px-3 w-[10%] text-center">Status</th>
                <th className="py-3 px-4 w-[8%] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                      <Package size={22} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">
                      No Products or Quotations Found for this Customer
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                      When the customer requests quotations on rajbiosis.com, they will appear here with instant PI download.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* 1. Equipment Details (Image + Name + SKU) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <Package size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-600 transition truncate"
                            title={prod.productName}
                          >
                            {prod.productName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {prod.itemCode && (
                              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                                {prod.itemCode}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 truncate">
                              {prod.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Quotation Ref No & Date */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 text-xs inline-block">
                        {prod.refNo}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        📅 {prod.date}
                      </span>
                    </td>

                    {/* 3. Amount & Quantity */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-emerald-700 text-sm block">
                        ₹{formatCurrency(prod.grandTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Qty: <strong className="text-slate-700">{prod.qty} Unit</strong> • Rate: ₹{formatCurrency(prod.unitPrice)}
                      </span>
                    </td>

                    {/* 4. Status */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    </td>

                    {/* 5. Actions: ONLY ICONS (NO TEXT) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* VIEW ICON ONLY */}
                        <button
                          type="button"
                          onClick={() => setSelectedProductForQuote(prod)}
                          className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer border border-sky-100"
                          title="View Official Quotation / Proforma Invoice"
                        >
                          <Eye size={15} />
                        </button>

                        {/* DOWNLOAD ICON ONLY (LIGHT BACKGROUND) */}
                        <button
                          type="button"
                          disabled={isGeneratingPdf && downloadingProductId === prod.id}
                          onClick={() => {
                            setSelectedProductForQuote(prod);
                            setTimeout(() => {
                              handleDownloadPiPdf(prod);
                            }, 100);
                          }}
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer border border-emerald-200/90 disabled:opacity-50"
                          title="Download Proforma Invoice (PI PDF)"
                        >
                          {isGeneratingPdf && downloadingProductId === prod.id ? (
                            <RefreshCw size={13} className="animate-spin text-emerald-600" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* =========================================================================
          INTERACTIVE OFFICIAL QUOTATION / PROFORMA INVOICE (PI) VIEWER MODAL
          ========================================================================= */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-sky-50/30 to-indigo-50/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Official Quotation & Proforma Invoice (PI)
                    </h3>
                    <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                      Ref: {selectedProductForQuote.refNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedProductForQuote.productName} • {customer.hospitalName || 'Healthcare Institution'}
                  </p>
                </div>
              </div>

              {/* Modal Top Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadPiPdf(selectedProductForQuote)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Download Official 4-Page PDF"
                >
                  {isGeneratingPdf ? (
                    <RefreshCw size={14} className="animate-spin text-emerald-600" />
                  ) : (
                    <Download size={14} className="text-emerald-600" />
                  )}
                  <span>Download PI (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
                  title="Print Proforma Invoice"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProductForQuote(null)}
                  className="w-9 h-9 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Pages Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 custom-scrollbar space-y-6">
              {/* Page 1: Official Cover Letter */}
              <div
                className="w-full max-w-[760px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 text-[#222222] font-serif leading-relaxed relative"
                style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
              >
                {/* Subtle watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                  <span className="text-[120px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                    Rajbiosis
                  </span>
                </div>

                <DocumentHeader />

                <div className="flex items-center justify-between text-xs pt-4 font-sans font-medium text-slate-800">
                  <span>Ref: <strong className="font-mono">{selectedProductForQuote.refNo}</strong></span>
                  <span>Dated: <strong className="font-mono">{selectedProductForQuote.date}</strong></span>
                </div>

                <div className="pt-4 text-xs space-y-0.5">
                  <div className="italic">To,</div>
                  <div className="font-bold text-slate-900 not-italic text-sm">{customer.hospitalName || customer.fullName}</div>
                  <div className="italic text-slate-700">{customer.address || 'Medical Facility'}</div>
                  <div className="italic text-slate-700">{customer.district || 'Jaipur'}, {customer.state || 'Rajasthan'} - Contact: {customer.phone}</div>
                </div>

                <div className="pt-4 text-xs font-bold text-slate-900 font-sans">
                  <u>Sub: Quotation purchase of {selectedProductForQuote.productName}</u>
                </div>

                <div className="pt-4 text-xs space-y-3.5 text-slate-800 text-justify leading-relaxed">
                  <div>Dear Sir / Madam,</div>
                  <p>
                    At the outset, we wish to thank you for giving us an opportunity to explore a business opportunity with your esteemed organization. It is our great pleasure to introduce to you our Medical & Laboratory Instrument, which will allow you to significantly increase the productivity and clinical performance in your institution.
                  </p>
                  <p>
                    We at <strong>RAJ BIOSIS PVT LTD.</strong> believe these instruments will be very helpful in serving your patients with extreme precision. We are more than willing to assist you in explaining about the features and advantages and our representatives will make themselves available for any further information.
                  </p>
                  <p>
                    In view of the same, please find attached herewith our proforma quotation along with standard enclosures for your kind perusal.
                  </p>
                  <p>For any queries please feel free to revert.</p>
                  <p>We want to see you succeed and when you succeed, we succeed.</p>

                  <div className="pt-2">Yours faithfully,</div>
                  <div className="pt-3 space-y-0.5 italic text-slate-800 text-xs">
                    <div className="font-bold not-italic text-slate-900">Bhupender Raj</div>
                    <div>Sales & Mkt. Head</div>
                    <div className="not-italic font-medium">Raj Biosis Pvt Ltd.</div>
                    <div>B-7, Aman Plaza, Plot No. 26, Heera Nagar-A, Chitrakoot</div>
                    <div>Jaipur-302021 Rajasthan</div>
                    <div className="not-italic font-mono font-medium">+91-998-3333-469</div>
                  </div>
                </div>

                <DocumentFooter pageNum="1" />
              </div>

              {/* Page 2: Official Quotation Table */}
              <div
                className="w-full max-w-[760px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 text-[#222222] font-serif leading-relaxed relative"
                style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                  <span className="text-[120px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                    Rajbiosis
                  </span>
                </div>

                <DocumentHeader />

                <div className="text-center pt-2 pb-1 font-sans">
                  <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
                    PROFORMA INVOICE / QUOTATION
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs font-sans font-medium text-slate-800">
                  <span>Ref: <strong className="font-mono">{selectedProductForQuote.refNo}</strong></span>
                  <span>Dated: <strong className="font-mono">{selectedProductForQuote.date}</strong></span>
                </div>

                <div className="pt-3 text-xs space-y-0.5 font-sans">
                  <div className="italic">To,</div>
                  <div className="font-bold text-slate-900 not-italic">{customer.hospitalName || customer.fullName}</div>
                  <div className="text-slate-700">{customer.district || 'Jaipur'}, {customer.state || 'Rajasthan'}</div>
                </div>

                <div className="pt-3 text-xs font-bold text-slate-900 font-sans">
                  <u>Sub: Purchase of {selectedProductForQuote.productName}</u>
                </div>

                {/* Dynamic Items Table with exact official borders */}
                <div className="pt-4 font-sans">
                  <table className="w-full text-xs border border-black text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-black text-slate-900 font-bold">
                        <th className="py-2 px-2.5 border-r border-black w-10 text-center">Sr.</th>
                        <th className="py-2 px-3 border-r border-black">Item Description & Specifications</th>
                        <th className="py-2 px-2.5 border-r border-black w-14 text-center">Qty</th>
                        <th className="py-2 px-3 border-r border-black w-24 text-right">Rate (₹)</th>
                        <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/80 font-medium">
                      <tr>
                        <td className="py-3 px-2.5 border-r border-black text-center align-top font-bold">1</td>
                        <td className="py-3 px-3 border-r border-black align-top space-y-1.5">
                          <div className="font-bold text-slate-900 text-xs">{selectedProductForQuote.productName}</div>
                          {selectedProductForQuote.itemCode && (
                            <div className="text-[10px] font-mono font-semibold text-slate-600">Model: {selectedProductForQuote.itemCode}</div>
                          )}
                          <div className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line pl-1 border-l-2 border-slate-200">
                            {selectedProductForQuote.bullets || selectedProductForQuote.shortDesc}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                            ✓ {selectedProductForQuote.warranty}
                          </div>
                        </td>
                        <td className="py-3 px-2.5 border-r border-black text-center align-top font-bold">
                          {selectedProductForQuote.qty} No
                        </td>
                        <td className="py-3 px-3 border-r border-black text-right align-top font-mono font-semibold">
                          ₹{formatCurrency(selectedProductForQuote.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right align-top font-mono font-bold text-slate-900">
                          ₹{formatCurrency(selectedProductForQuote.grandTotal)}
                        </td>
                      </tr>

                      {/* Summary Row */}
                      <tr className="border-t-2 border-black font-bold bg-slate-50">
                        <td colSpan={4} className="py-2.5 px-3 border-r border-black text-right uppercase tracking-wider text-[11px]">
                          Grand Total (Inclusive of Taxes):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                          ₹{formatCurrency(selectedProductForQuote.grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Amount in Words */}
                  <div className="pt-3 text-xs italic text-slate-800">
                    <span>Amount in Words: </span>
                    <strong className="not-italic text-slate-900">
                      INR {numberToWordsIndian(selectedProductForQuote.grandTotal)} Only
                    </strong>
                  </div>

                  <div className="pt-6 flex justify-between items-end text-xs">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Customer Acceptance Signature:</div>
                      <div className="w-44 border-b border-dashed border-slate-400 mt-8"></div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="font-bold text-slate-900">For Raj Biosis Pvt Ltd.</div>
                      <div className="text-[11px] text-slate-600">Authorized Signatory</div>
                    </div>
                  </div>
                </div>

                <DocumentFooter pageNum="2" />
              </div>

              {/* Page 3: Terms and Conditions - Part 1 */}
              <div
                className="w-full max-w-[760px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 text-[#222222] font-serif leading-relaxed relative"
                style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                  <span className="text-[120px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                    Rajbiosis
                  </span>
                </div>

                <DocumentHeader />

                <div className="text-center pt-2 pb-2 font-sans">
                  <h3 className="font-bold text-xs underline text-slate-900 tracking-wider uppercase">
                    TERMS AND CONDITIONS (PART - 1)
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-justify font-sans leading-relaxed text-slate-800 pt-2">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">1. SCOPE OF SUPPLY</div>
                    <p className="pl-3">
                      The supply of the instrument and other equipment shall be strictly in accordance with our quotation and confirmation of purchase order.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">2. DELIVERY</div>
                    <p className="pl-3">
                      Delivery shall be within 1-2 weeks from the date of confirmed order along with advance payment or mutually agreed schedule.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">3. PRICE</div>
                    <p className="pl-3">
                      The price quoted is FOR destination. All taxes and government levies applicable as on the date of supply are inclusive.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">4. INSTALLATION AND COMMISSIONING</div>
                    <p className="pl-3">
                      Installation and operational training will be provided free of cost by Raj Biosis factory-trained biomedical service engineers.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">5. WARRANTY</div>
                    <p className="pl-3">
                      The equipment is covered under comprehensive warranty for a period of 12 months from the date of installation against all manufacturing defects.
                    </p>
                  </div>
                </div>

                <DocumentFooter pageNum="3" />
              </div>

              {/* Page 4: Terms and Conditions - Part 2 & Bank Account for RTGS/NEFT */}
              <div
                className="w-full max-w-[760px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 text-[#222222] font-serif leading-relaxed relative"
                style={{ fontFamily: 'Times New Roman, Georgia, serif' }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] overflow-hidden select-none">
                  <span className="text-[120px] font-bold text-[#8B2323] -rotate-30 tracking-widest uppercase">
                    Rajbiosis
                  </span>
                </div>

                <DocumentHeader />

                <div className="text-center pt-2 pb-2 font-sans">
                  <h3 className="font-bold text-xs underline text-slate-900 tracking-wider uppercase">
                    TERMS AND CONDITIONS (PART - 2)
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-justify font-sans leading-relaxed text-slate-800 pt-2">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">6. JURISDICTION</div>
                    <p className="pl-3 font-semibold text-slate-900">
                      All goods sold are subject to Jaipur Jurisdiction.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">7. FORCE MAJEURE</div>
                    <p className="pl-3">
                      RBPL shall not be held responsible for non-fulfillment of delivery of goods due to force majeure events like war, floods, strikes, or riots.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">8. PAYMENT</div>
                    <p className="pl-3">
                      100% advance along with confirmed purchase order or against dispatch documents through official banking channels.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">9. VALIDITY</div>
                    <p className="pl-3">
                      This quotation / proforma invoice remains valid for 30 days from the date of issue.
                    </p>
                  </div>

                  {/* Bank RTGS Details Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-[11px] space-y-1 mt-3">
                    <div className="font-bold text-slate-900 font-sans text-xs uppercase text-[#8B2323]">
                      Official Bank Details for RTGS / NEFT Remittance:
                    </div>
                    <div>Account Name: <strong className="text-slate-900">RAJ BIOSIS PVT. LTD.</strong></div>
                    <div>Bank: <strong className="text-slate-900">Bank of Baroda</strong></div>
                    <div>Current A/C No: <strong className="text-slate-900">39910200000318</strong></div>
                    <div>IFSC Code: <strong className="text-slate-900">BARB0CHITRA</strong></div>
                    <div>Branch: <strong>Chitrakoot, Jaipur-302021 Rajasthan</strong></div>
                  </div>

                  <div className="pt-6 flex justify-between items-end text-xs">
                    <div className="italic text-slate-600">
                      Thank you for choosing Raj Biosis healthcare solutions.
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="font-bold text-slate-900">For Raj Biosis Pvt Ltd.</div>
                      <div className="text-[11px] text-slate-600">Authorized Signatory</div>
                    </div>
                  </div>
                </div>

                <DocumentFooter pageNum="4" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          OFF-SCREEN DEDICATED EXPORT CONTAINER FOR 100% CRISP 4-PAGE PDF EXPORT
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
            <span>Ref: <strong className="font-mono">{activeProduct?.refNo}</strong></span>
            <span>Dated: <strong className="font-mono">{activeProduct?.date}</strong></span>
          </div>
          <div className="pt-4 text-xs space-y-0.5">
            <div className="italic">To,</div>
            <div className="font-bold text-slate-900 not-italic text-sm">{customer.hospitalName || customer.fullName}</div>
            <div className="italic text-slate-700">{customer.address || 'Medical Facility'}</div>
            <div className="italic text-slate-700">{customer.district || 'Jaipur'}, {customer.state || 'Rajasthan'} - Contact: {customer.phone}</div>
          </div>
          <div className="pt-4 text-xs font-bold text-slate-900 font-sans">
            <u>Sub: Quotation purchase of {activeProduct?.productName}</u>
          </div>
          <div className="pt-4 text-xs space-y-3.5 text-slate-800 text-justify leading-relaxed">
            <div>Dear Sir / Madam,</div>
            <p>
              At the outset, we wish to thank you for giving us an opportunity to explore a business opportunity with your esteemed organization. It is our great pleasure to introduce to you our Medical & Laboratory Instrument, which will allow you to significantly increase the productivity and clinical performance in your institution.
            </p>
            <p>
              We at <strong>RAJ BIOSIS PVT LTD.</strong> believe these instruments will be very helpful in serving your patients with extreme precision. We are more than willing to assist you in explaining about the features and advantages and our representatives will make themselves available for any further information.
            </p>
            <p>
              In view of the same, please find attached herewith our proforma quotation along with standard enclosures for your kind perusal.
            </p>
            <p>For any queries please feel free to revert.</p>
            <p>We want to see you succeed and when you succeed, we succeed.</p>
            <div className="pt-2">Yours faithfully,</div>
            <div className="pt-3 space-y-0.5 italic text-slate-800 text-xs">
              <div className="font-bold not-italic text-slate-900">Bhupender Raj</div>
              <div>Sales & Mkt. Head</div>
              <div className="not-italic font-medium">Raj Biosis Pvt Ltd.</div>
              <div>B-7, Aman Plaza, Plot No. 26, Heera Nagar-A, Chitrakoot</div>
              <div>Jaipur-302021 Rajasthan</div>
              <div className="not-italic font-mono font-medium">+91-998-3333-469</div>
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
          <div className="text-center pt-2 pb-1 font-sans">
            <h3 className="font-bold text-sm underline text-slate-900 tracking-wider">
              PROFORMA INVOICE / QUOTATION
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs font-sans font-medium text-slate-800">
            <span>Ref: <strong className="font-mono">{activeProduct?.refNo}</strong></span>
            <span>Dated: <strong className="font-mono">{activeProduct?.date}</strong></span>
          </div>
          <div className="pt-3 text-xs space-y-0.5 font-sans">
            <div className="italic">To,</div>
            <div className="font-bold text-slate-900 not-italic">{customer.hospitalName || customer.fullName}</div>
            <div className="text-slate-700">{customer.district || 'Jaipur'}, {customer.state || 'Rajasthan'}</div>
          </div>
          <div className="pt-3 text-xs font-bold text-slate-900 font-sans">
            <u>Sub: Purchase of {activeProduct?.productName}</u>
          </div>
          <div className="pt-4 font-sans">
            <table className="w-full text-xs border border-black text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-slate-900 font-bold">
                  <th className="py-2 px-2.5 border-r border-black w-10 text-center">Sr.</th>
                  <th className="py-2 px-3 border-r border-black">Item Description & Specifications</th>
                  <th className="py-2 px-2.5 border-r border-black w-14 text-center">Qty</th>
                  <th className="py-2 px-3 border-r border-black w-24 text-right">Rate (₹)</th>
                  <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/80 font-medium">
                <tr>
                  <td className="py-3 px-2.5 border-r border-black text-center align-top font-bold">1</td>
                  <td className="py-3 px-3 border-r border-black align-top space-y-1.5">
                    <div className="font-bold text-slate-900 text-xs">{activeProduct?.productName}</div>
                    {activeProduct?.itemCode && (
                      <div className="text-[10px] font-mono font-semibold text-slate-600">Model: {activeProduct.itemCode}</div>
                    )}
                    <div className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line pl-1 border-l-2 border-slate-200">
                      {activeProduct?.bullets || activeProduct?.shortDesc}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                      ✓ {activeProduct?.warranty}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 border-r border-black text-center align-top font-bold">
                    {activeProduct?.qty} No
                  </td>
                  <td className="py-3 px-3 border-r border-black text-right align-top font-mono font-semibold">
                    ₹{formatCurrency(activeProduct?.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right align-top font-mono font-bold text-slate-900">
                    ₹{formatCurrency(activeProduct?.grandTotal)}
                  </td>
                </tr>
                <tr className="border-t-2 border-black font-bold bg-slate-50">
                  <td colSpan={4} className="py-2.5 px-3 border-r border-black text-right uppercase tracking-wider text-[11px]">
                    Grand Total (Inclusive of Taxes):
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                    ₹{formatCurrency(activeProduct?.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="pt-3 text-xs italic text-slate-800">
              <span>Amount in Words: </span>
              <strong className="not-italic text-slate-900">
                INR {numberToWordsIndian(activeProduct?.grandTotal)} Only
              </strong>
            </div>
            <div className="pt-6 flex justify-between items-end text-xs">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Customer Acceptance Signature:</div>
                <div className="w-44 border-b border-dashed border-slate-400 mt-8"></div>
              </div>
              <div className="text-right space-y-0.5">
                <div className="font-bold text-slate-900">For Raj Biosis Pvt Ltd.</div>
                <div className="text-[11px] text-slate-600">Authorized Signatory</div>
              </div>
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
          <div className="text-center pt-2 pb-2 font-sans">
            <h3 className="font-bold text-xs underline text-slate-900 tracking-wider uppercase">
              TERMS AND CONDITIONS (PART - 1)
            </h3>
          </div>
          <div className="space-y-3.5 text-xs text-justify font-sans leading-relaxed text-slate-800 pt-2">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">1. SCOPE OF SUPPLY</div>
              <p className="pl-3">
                The supply of the instrument and other equipment shall be strictly in accordance with our quotation and confirmation of purchase order.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">2. DELIVERY</div>
              <p className="pl-3">
                Delivery shall be within 1-2 weeks from the date of confirmed order along with advance payment or mutually agreed schedule.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">3. PRICE</div>
              <p className="pl-3">
                The price quoted is FOR destination. All taxes and government levies applicable as on the date of supply are inclusive.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">4. INSTALLATION AND COMMISSIONING</div>
              <p className="pl-3">
                Installation and operational training will be provided free of cost by Raj Biosis factory-trained biomedical service engineers.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">5. WARRANTY</div>
              <p className="pl-3">
                The equipment is covered under comprehensive warranty for a period of 12 months from the date of installation against all manufacturing defects.
              </p>
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
          <div className="text-center pt-2 pb-2 font-sans">
            <h3 className="font-bold text-xs underline text-slate-900 tracking-wider uppercase">
              TERMS AND CONDITIONS (PART - 2)
            </h3>
          </div>
          <div className="space-y-3.5 text-xs text-justify font-sans leading-relaxed text-slate-800 pt-2">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">6. JURISDICTION</div>
              <p className="pl-3 font-semibold text-slate-900">
                All goods sold are subject to Jaipur Jurisdiction.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">7. FORCE MAJEURE</div>
              <p className="pl-3">
                RBPL shall not be held responsible for non-fulfillment of delivery of goods due to force majeure events like war, floods, strikes, or riots.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">8. PAYMENT</div>
              <p className="pl-3">
                100% advance along with confirmed purchase order or against dispatch documents through official banking channels.
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900">9. VALIDITY</div>
              <p className="pl-3">
                This quotation / proforma invoice remains valid for 30 days from the date of issue.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-[11px] space-y-1 mt-3">
              <div className="font-bold text-slate-900 font-sans text-xs uppercase text-[#8B2323]">
                Official Bank Details for RTGS / NEFT Remittance:
              </div>
              <div>Account Name: <strong className="text-slate-900">RAJ BIOSIS PVT. LTD.</strong></div>
              <div>Bank: <strong className="text-slate-900">Bank of Baroda</strong></div>
              <div>Current A/C No: <strong className="text-slate-900">39910200000318</strong></div>
              <div>IFSC Code: <strong className="text-slate-900">BARB0CHITRA</strong></div>
              <div>Branch: <strong>Chitrakoot, Jaipur-302021 Rajasthan</strong></div>
            </div>
            <div className="pt-6 flex justify-between items-end text-xs">
              <div className="italic text-slate-600">
                Thank you for choosing Raj Biosis healthcare solutions.
              </div>
              <div className="text-right space-y-0.5">
                <div className="font-bold text-slate-900">For Raj Biosis Pvt Ltd.</div>
                <div className="text-[11px] text-slate-600">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <DocumentFooter pageNum="4" />
        </div>
      </div>

    </div>
  );
}
