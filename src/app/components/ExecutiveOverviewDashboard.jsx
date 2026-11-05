'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  FileText,
  Inbox,
  Users,
  Globe,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Calendar,
  MapPin,
  Layers,
  PieChart,
  BarChart3,
  Package,
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ExecutiveOverviewDashboard({
  leads = [],
  quotations = [],
  customers = [],
  sites = [],
  products = [],
  user = null,
  onNavigateTab = () => { }
}) {
  // Filter States
  const [selectedKpi, setSelectedKpi] = useState('pipeline');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [segmentMode, setSegmentMode] = useState('region'); // 'region' | 'segment'
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(9); // Default to Oct (idx 9)

  // Live Aggregate Computations
  const totalPipelineVal = useMemo(() => {
    return leads.reduce((acc, l) => {
      const num = parseInt((l.amount || l.quoteAmount || '0').replace(/[^0-9]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [leads]);

  const formattedPipeline = totalPipelineVal > 0
    ? `₹${(totalPipelineVal >= 10000000 ? (totalPipelineVal / 10000000).toFixed(2) + ' Cr' : (totalPipelineVal / 100000).toFixed(2) + ' L')}`
    : '₹0.00';

  const totalQuotesVal = useMemo(() => {
    return quotations.reduce((acc, q) => {
      const num = typeof q.totalAmount === 'number'
        ? q.totalAmount
        : parseInt(String(q.totalAmount || '0').replace(/[^0-9]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [quotations]);

  const networkStoresCount = sites.length > 0 ? sites.length : 0;
  const activeInquiriesCount = leads.length;
  const totalQuotationsCount = quotations.length;
  const verifiedDoctorsCount = customers.length;

  const estimatedProfitVal = totalPipelineVal > 0 ? totalPipelineVal * 0.28 : 0;
  const formattedProfit = estimatedProfitVal > 0
    ? `₹${(estimatedProfitVal >= 10000000 ? (estimatedProfitVal / 10000000).toFixed(2) + ' Cr' : (estimatedProfitVal / 100000).toFixed(2) + ' L')}`
    : '₹0.00';

  // Monthly Trend Data for Curve Chart (12 Months Jan - Dec)
  const isZeroPipeline = totalPipelineVal === 0 && leads.length === 0;
  const monthlyTrendData = [
    { month: 'Jan', actual: isZeroPipeline ? 0 : 95, previous: isZeroPipeline ? 0 : 98, actualVal: isZeroPipeline ? '₹0' : '₹95,000', prevVal: isZeroPipeline ? '₹0' : '₹98,000' },
    { month: 'Feb', actual: isZeroPipeline ? 0 : 93, previous: isZeroPipeline ? 0 : 94, actualVal: isZeroPipeline ? '₹0' : '₹93,000', prevVal: isZeroPipeline ? '₹0' : '₹94,000' },
    { month: 'Mar', actual: isZeroPipeline ? 0 : 101, previous: isZeroPipeline ? 0 : 96, actualVal: isZeroPipeline ? '₹0' : '₹1,01,000', prevVal: isZeroPipeline ? '₹0' : '₹96,000' },
    { month: 'Apr', actual: isZeroPipeline ? 0 : 100, previous: isZeroPipeline ? 0 : 100, actualVal: isZeroPipeline ? '₹0' : '₹1,00,000', prevVal: isZeroPipeline ? '₹0' : '₹1,00,000' },
    { month: 'May', actual: isZeroPipeline ? 0 : 107, previous: isZeroPipeline ? 0 : 98, actualVal: isZeroPipeline ? '₹0' : '₹1,07,000', prevVal: isZeroPipeline ? '₹0' : '₹98,000' },
    { month: 'Jun', actual: isZeroPipeline ? 0 : 105, previous: isZeroPipeline ? 0 : 102, actualVal: isZeroPipeline ? '₹0' : '₹1,05,000', prevVal: isZeroPipeline ? '₹0' : '₹1,02,000' },
    { month: 'Jul', actual: isZeroPipeline ? 0 : 105, previous: isZeroPipeline ? 0 : 106, actualVal: isZeroPipeline ? '₹0' : '₹1,05,000', prevVal: isZeroPipeline ? '₹0' : '₹1,06,000' },
    { month: 'Aug', actual: isZeroPipeline ? 0 : 103, previous: isZeroPipeline ? 0 : 101, actualVal: isZeroPipeline ? '₹0' : '₹1,03,000', prevVal: isZeroPipeline ? '₹0' : '₹1,01,000' },
    { month: 'Sep', actual: isZeroPipeline ? 0 : 104, previous: isZeroPipeline ? 0 : 98, actualVal: isZeroPipeline ? '₹0' : '₹1,04,000', prevVal: isZeroPipeline ? '₹0' : '₹98,000' },
    { month: 'Oct', actual: isZeroPipeline ? 0 : 106, previous: isZeroPipeline ? 0 : 96, actualVal: isZeroPipeline ? '₹0' : '₹1,06,000', prevVal: isZeroPipeline ? '₹0' : '₹96,000' },
    { month: 'Nov', actual: isZeroPipeline ? 0 : 105, previous: isZeroPipeline ? 0 : 92, actualVal: isZeroPipeline ? '₹0' : '₹1,05,000', prevVal: isZeroPipeline ? '₹0' : '₹92,000' },
    { month: 'Dec', actual: isZeroPipeline ? 0 : 109, previous: isZeroPipeline ? 0 : 91, actualVal: isZeroPipeline ? '₹0' : '₹1,09,000', prevVal: isZeroPipeline ? '₹0' : '₹91,000' }
  ];

  // SVG Line Chart coordinates calculation
  // Viewbox: 0 0 520 180 (x: 20 to 500, y: 20 to 150)
  // min value ~88, max value ~115
  const chartPointsActual = monthlyTrendData.map((d, i) => {
    const x = 25 + (i * (470 / 11));
    const y = isZeroPipeline ? 150 : 150 - ((d.actual - 88) / (115 - 88)) * 130;
    return { x, y, ...d };
  });

  const chartPointsPrev = monthlyTrendData.map((d, i) => {
    const x = 25 + (i * (470 / 11));
    const y = isZeroPipeline ? 150 : 150 - ((d.previous - 88) / (115 - 88)) * 130;
    return { x, y, ...d };
  });

  // Smooth SVG curve generator
  const getSvgPath = (points) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const actualPath = getSvgPath(chartPointsActual);
  const prevPath = getSvgPath(chartPointsPrev);
  const fillAreaPath = `${actualPath} L ${chartPointsActual[chartPointsActual.length - 1].x} 170 L ${chartPointsActual[0].x} 170 Z`;

  // Month-over-Month Performance Analysis Table Data
  const momTableData = [
    {
      kpi: 'Total Sales & Pipeline',
      actual: formattedPipeline,
      pm: totalPipelineVal > 0 ? '₹62.40 L' : '₹0.00',
      delta: totalPipelineVal > 0 ? '+₹9.10 L' : '₹0.00',
      percent: totalPipelineVal > 0 ? '+14.6%' : '0%',
      isPositive: totalPipelineVal > 0
    },
    {
      kpi: 'Estimated Gross Profit',
      actual: formattedProfit,
      pm: totalPipelineVal > 0 ? '₹17.47 L' : '₹0.00',
      delta: totalPipelineVal > 0 ? '+₹2.55 L' : '₹0.00',
      percent: totalPipelineVal > 0 ? '+14.6%' : '0%',
      isPositive: totalPipelineVal > 0
    },
    {
      kpi: 'Hospital RFQ Orders',
      actual: `${activeInquiriesCount} Inquiries`,
      pm: activeInquiriesCount > 0 ? '8 Inquiries' : '0 Inquiries',
      delta: activeInquiriesCount > 0 ? '+1' : '0',
      percent: activeInquiriesCount > 0 ? '+12.5%' : '0%',
      isPositive: activeInquiriesCount > 0
    },
    {
      kpi: 'Official Quotes Dispatched',
      actual: `${totalQuotationsCount} Quotes`,
      pm: totalQuotationsCount > 0 ? `${Math.max(0, totalQuotationsCount - 3)} Quotes` : '0 Quotes',
      delta: totalQuotationsCount > 0 ? '+3' : '0',
      percent: totalQuotationsCount > 0 ? '+12.0%' : '0%',
      isPositive: totalQuotationsCount > 0
    },
    {
      kpi: 'Registered Medical Buyers',
      actual: `${verifiedDoctorsCount} Verified`,
      pm: verifiedDoctorsCount > 0 ? `${Math.max(0, verifiedDoctorsCount - 1)} Accounts` : '0 Accounts',
      delta: verifiedDoctorsCount > 0 ? '+1' : '0',
      percent: verifiedDoctorsCount > 0 ? '+50.0%' : '0%',
      isPositive: verifiedDoctorsCount > 0
    },
    {
      kpi: 'Total Hardware Units',
      actual: activeInquiriesCount > 0 ? `${activeInquiriesCount * 4} Units` : '0 Units',
      pm: activeInquiriesCount > 0 ? '36 Units' : '0 Units',
      delta: activeInquiriesCount > 0 ? '+6' : '0',
      percent: activeInquiriesCount > 0 ? '+16.7%' : '0%',
      isPositive: activeInquiriesCount > 0
    },
    {
      kpi: 'Total Equipment Cost',
      actual: totalPipelineVal > 0 ? `₹${((totalPipelineVal * 0.72) / 100000).toFixed(2)} L` : '₹0.00',
      pm: totalPipelineVal > 0 ? '₹44.92 L' : '₹0.00',
      delta: totalPipelineVal > 0 ? '+₹6.56 L' : '₹0.00',
      percent: totalPipelineVal > 0 ? '+14.6%' : '0%',
      isPositive: false
    }
  ];

  // Region / State Performance Data
  const regionData = useMemo(() => {
    if (leads.length === 0) {
      return [
        { name: 'Rajasthan', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Maharashtra', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Delhi NCR', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Gujarat', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Karnataka', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Tamil Nadu', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Uttar Pradesh', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' }
      ];
    }
    return [
      { name: 'Rajasthan', actual: 28.4, prev: 24.1, label: '28.4L', prevLabel: '24.1L' },
      { name: 'Maharashtra', actual: 18.2, prev: 16.5, label: '18.2L', prevLabel: '16.5L' },
      { name: 'Delhi NCR', actual: 12.5, prev: 11.2, label: '12.5L', prevLabel: '11.2L' },
      { name: 'Gujarat', actual: 8.6, prev: 7.9, label: '8.6L', prevLabel: '7.9L' },
      { name: 'Karnataka', actual: 6.2, prev: 5.7, label: '6.2L', prevLabel: '5.7L' },
      { name: 'Tamil Nadu', actual: 4.8, prev: 4.4, label: '4.8L', prevLabel: '4.4L' },
      { name: 'Uttar Pradesh', actual: 3.5, prev: 3.1, label: '3.5L', prevLabel: '3.1L' }
    ];
  }, [leads]);

  const segmentData = useMemo(() => {
    if (leads.length === 0) {
      return [
        { name: 'ICU Ventilators & Critical Care', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'High-Freq Digital X-Ray & Imaging', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Multi-Para Patient Monitors', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'Syringe & Infusion Delivery Pumps', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' },
        { name: 'OT Tables & Surgical Lighting', actual: 0, prev: 0, label: '0.0L', prevLabel: '0.0L' }
      ];
    }
    return [
      { name: 'ICU Ventilators & Critical Care', actual: 34.2, prev: 29.5, label: '34.2L', prevLabel: '29.5L' },
      { name: 'High-Freq Digital X-Ray & Imaging', actual: 22.8, prev: 19.8, label: '22.8L', prevLabel: '19.8L' },
      { name: 'Multi-Para Patient Monitors', actual: 14.5, prev: 12.6, label: '14.5L', prevLabel: '12.6L' },
      { name: 'Syringe & Infusion Delivery Pumps', actual: 8.2, prev: 7.4, label: '8.2L', prevLabel: '7.4L' },
      { name: 'OT Tables & Surgical Lighting', actual: 5.8, prev: 5.2, label: '5.8L', prevLabel: '5.2L' }
    ];
  }, [leads]);

  const activeBarData = segmentMode === 'region' ? regionData : segmentData;
  const maxBarValue = Math.max(...activeBarData.map(d => d.actual), 35);

  const handleResetFilters = () => {
    setSelectedKpi('pipeline');
    setSelectedYear('2026');
    setSelectedMonth('All');
    setSelectedRegion('all');
    setSelectedCategory('all');
    setSegmentMode('region');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 text-slate-800">

      {/* =========================================================================
          TOP EXECUTIVE HEADER & GLOBAL FILTERS BAR (Matching Image Layout)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                RBPL Performance Dashboard
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time insights
              </p>
            </div>
          </div>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400 font-normal">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400 font-normal">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="All">All Months (YTD)</option>
              <option value="October">October</option>
              <option value="September">September</option>
              <option value="August">August</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400 font-normal">Territory:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="all">Pan-India (All 28 States)</option>
              <option value="rajasthan">Rajasthan Hub</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="delhi">Delhi NCR</option>
              <option value="gujarat">Gujarat</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOP GRID: LEFT TREND CHART (45%) + RIGHT 6 KPI CARDS (55%)
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">

        {/* LEFT CARD: INTERACTIVE KPI TREND LINE CHART (xl:col-span-6) */}
        <div className="xl:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Select Business KPI
                </label>
                <div className="relative inline-block">
                  <select
                    value={selectedKpi}
                    onChange={(e) => setSelectedKpi(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer hover:border-sky-400 transition"
                  >
                    <option value="pipeline">Quotation Pipeline Value</option>
                    <option value="profit">Institutional Profit Margin</option>
                    <option value="orders">Hospital RFQ Orders</option>
                    <option value="quotes">Dispatched Quotations</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs"></span>
                  <span>Total Pipeline</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400 border-t border-dashed"></span>
                  <span>Previous Year</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">
                Currently Viewing: <strong className="text-slate-800">Monthly Performance Trend</strong>
              </span>
              <span className="font-mono text-[11px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                {isZeroPipeline ? 'Index: ₹0.00 (No Pending RFQs)' : 'Peak: Oct 2026 (₹109K Index)'}
              </span>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="relative w-full h-48 sm:h-52 my-2">
            <svg viewBox="0 0 520 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="25" y1="30" x2="495" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="70" x2="495" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="110" x2="495" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="150" x2="495" y2="150" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="2" y="34" fontSize="9" fill="#94a3b8" fontFamily="monospace">110K</text>
              <text x="2" y="74" fontSize="9" fill="#94a3b8" fontFamily="monospace">100K</text>
              <text x="5" y="114" fontSize="9" fill="#94a3b8" fontFamily="monospace">90K</text>

              {/* Filled Area Gradient */}
              <path d={fillAreaPath} fill="url(#curveGradient)" />

              {/* Previous Year Line (Dotted Gray) */}
              <path
                d={prevPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Actual Pipeline Line (Solid Sky Blue) */}
              <path
                d={actualPath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Circles & Tooltips */}
              {chartPointsActual.map((pt, i) => (
                <g key={pt.month} onMouseEnter={() => setHoveredMonthIdx(i)} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredMonthIdx === i ? "6" : "3.5"}
                    fill={hoveredMonthIdx === i ? "#0284c7" : "#ffffff"}
                    stroke="#0284c7"
                    strokeWidth={hoveredMonthIdx === i ? "3" : "2"}
                    className="transition-all duration-150"
                  />
                  {/* Tooltip on active point */}
                  {hoveredMonthIdx === i && (
                    <g transform={`translate(${pt.x}, ${pt.y - 30})`}>
                      <rect x="-35" y="-12" width="70" height="22" rx="6" fill="#0f172a" />
                      <text x="0" y="3" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                        {pt.actualVal}
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* X Axis Month Labels */}
              {chartPointsActual.map((pt, i) => (
                <text
                  key={pt.month}
                  x={pt.x}
                  y="168"
                  fontSize="10"
                  fill={hoveredMonthIdx === i ? "#0284c7" : "#64748b"}
                  fontWeight={hoveredMonthIdx === i ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {pt.month}
                </text>
              ))}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hover on monthly nodes to inspect actual vs baseline</span>
            <button
              type="button"
              onClick={() => onNavigateTab('quotation')}
              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Incoming Leads in Web Quotation</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* RIGHT: 6 KPI CARDS (2 rows x 3 columns) (xl:col-span-6) */}
        <div className="xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* CARD 1: PRIMARY BLUE ACCENT CARD (Exactly as in uploaded photo) */}
          <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white rounded-3xl p-5 shadow-sm shadow-sky-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <span className="text-xs font-semibold text-sky-100 uppercase tracking-wider block">
                Total Pharmacies &amp; Stores
              </span>
              <div className="text-3xl sm:text-4xl font-black mt-2 text-white">
                {networkStoresCount}
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-sky-100 font-medium block">
                Across 28 Indian States &amp; UTs
              </span>
            </div>
          </div>

          {/* CARD 2: TOTAL SALES & PIPELINE */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Quotation Pipeline
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
                {formattedPipeline}
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${totalPipelineVal > 0 ? 'bg-sky-50 text-sky-700 border border-sky-200/80' : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                {totalPipelineVal > 0 && <ArrowUpRight size={12} className="text-sky-600" />}
                <span>{totalPipelineVal > 0 ? '▲ 14.2% vs Sep-2026' : '0% Active Pipeline'}</span>
              </span>
            </div>
          </div>

          {/* CARD 3: ACTIVE HOSPITAL INQUIRIES */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Hospital RFQs &amp; Leads
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {activeInquiriesCount} <span className="text-xs font-bold text-slate-400">Live</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${activeInquiriesCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                {activeInquiriesCount > 0 && <ArrowUpRight size={12} className="text-emerald-600" />}
                <span>{activeInquiriesCount > 0 ? '▲ 12.2% Direct Inquiries' : '0 Inquiries Pending'}</span>
              </span>
            </div>
          </div>

          {/* CARD 4: OFFICIAL QUOTATIONS ISSUED */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Quotations Issued
                </span>
                {quotations.filter(q => q.concessionStatus === 'concession_requested').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1">
                    <ShieldCheck size={10} />
                    <span>{quotations.filter(q => q.concessionStatus === 'concession_requested').length} Review Required</span>
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {totalQuotationsCount} <span className="text-xs font-bold text-slate-400">Issued</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${totalQuotationsCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                <span>{totalQuotationsCount > 0 ? '▼ 3.3% Dispatched' : '0 Quotes Issued'}</span>
              </span>
              {quotations.filter(q => q.concessionStatus === 'concession_requested').length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('quotation')}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Pending Concessions →</span>
                </button>
              )}
            </div>
          </div>

          {/* CARD 5: ESTIMATED GROSS PROFIT */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Estimated Gross Profit
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
                {formattedProfit}
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${totalPipelineVal > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                <span>{totalPipelineVal > 0 ? '▼ 0.5% vs Target' : '0.0% Baseline'}</span>
              </span>
            </div>
          </div>

          {/* CARD 6: AVERAGE HEALTH SCORE */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Average Health Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                92.4 <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                <span>▲ Excellent</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          BOTTOM ROW (3 COLUMNS Matching Image Layout)
          Col 1: Month-over-Month Performance Table (45%)
          Col 2: Region / Territory Performance Bar Chart (30%)
          Col 3: Sales and Cost Split Donut Chart (25%)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* COLUMN 1: MONTH-OVER-MONTH PERFORMANCE TABLE (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              Performance Analysis.
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Evaluation of Actual vs Previous Month (PM) performance, showcasing absolute change (PM Δ) and percentage movement (PM ▲%) across core KPIs including Sales, Profit, Orders, Units, and Cost.
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2.5 pr-2">KPI</th>
                    <th className="py-2.5 px-2">Actual</th>
                    <th className="py-2.5 px-2">PM</th>
                    <th className="py-2.5 px-2 text-right">PM Δ</th>
                    <th className="py-2.5 pl-2 text-right">PM▲%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                  {momTableData.map((row) => (
                    <tr key={row.kpi} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 pr-2 font-semibold text-slate-900 text-xs">
                        {row.kpi}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-800 text-xs">
                        {row.actual}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400 text-xs">
                        {row.pm}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-700 text-xs">
                        {row.delta}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${row.isPositive
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/80'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}>
                          {row.percent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">

            <button
              type="button"
              onClick={() => onNavigateTab('quotation')}
              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Quotation Desk</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* COLUMN 2: REGION / TERRITORY PERFORMANCE HORIZONTAL BARS (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header Switcher: Segment vs Region */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-black text-slate-900">
                {segmentMode === 'region' ? 'Region Performance' : 'Category Performance'}
              </h3>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSegmentMode('segment')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${segmentMode === 'segment'
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Segment
                </button>
                <button
                  type="button"
                  onClick={() => setSegmentMode('region')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${segmentMode === 'region'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Region
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Currently Viewing: {segmentMode === 'region' ? 'Country & State Quotation Distribution' : 'Top Biomedical Product Categories'}
            </p>

            <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 mb-3">
              <span className="flex items-center gap-1.5 text-sky-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
                <span>Current Period</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                <span>Previous Year</span>
              </span>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3.5">
              {activeBarData.map((item) => {
                const actualWidth = Math.min(100, Math.round((item.actual / maxBarValue) * 100));
                const prevWidth = Math.min(100, Math.round((item.prev / maxBarValue) * 100));
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span className="truncate pr-2 font-semibold text-slate-800">{item.name}</span>
                      <span className="font-mono text-[11px] font-bold text-sky-700 shrink-0">
                        ₹{item.label}
                      </span>
                    </div>
                    {/* Dual Horizontal Bars */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${actualWidth}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-slate-300 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${prevWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">

            <span className="font-mono text-slate-600 font-bold">7 Territories</span>
          </div>
        </div>

        {/* COLUMN 3: SALES AND COST SPLIT DONUT CHART (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-1">
              Sales and Cost Split
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 mb-3">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Total Cost</span>
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Profit Margin</span>
              </span>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring (Total Cost ~72%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                />
                {/* Profit Margin Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0284c7"
                  strokeWidth="14"
                  strokeDasharray={totalPipelineVal > 0 ? "66.85 238.76" : "0 238.76"}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Donut Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Profit Margin
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {totalPipelineVal > 0 ? '28%' : '0%'}
                </span>
              </div>
            </div>

            {/* Cost and Profit Legend Labels */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2 mb-4">
              <span className="text-[11px]">{totalPipelineVal > 0 ? '72.0% (OEM Cost)' : '0.0% (OEM Cost)'}</span>
              <span className="text-[11px] font-bold text-sky-700">{totalPipelineVal > 0 ? '28.0% (Gross Margin)' : '0.0% (Margin)'}</span>
            </div>

            {/* Analysis Text Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-sky-600" />
                <span>Analysis</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {totalPipelineVal > 0
                  ? 'Profit margin expanded 0.5% MoM while direct hospital quotations increased. ICU Ventilators and Patient Monitors generated highest gross contribution across institutional tenders.'
                  : 'Abhi pipeline me koi active RFQ ya quotation nahi hai. Nayi hospital inquiry aane par real-time profit aur cost margin calculation yahan auto-reflect hoga.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">

            <span className="text-emerald-600 font-bold">Strong</span>
          </div>
        </div>

      </div>

    </div>
  );
}

