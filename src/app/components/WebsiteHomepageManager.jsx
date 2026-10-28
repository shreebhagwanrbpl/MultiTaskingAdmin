'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Upload,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flame,
  Truck,
  ShieldCheck,
  Award,
  Zap,
  Gift,
  Phone,
  ArrowRight,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Eye,
  Sliders,
  FolderPlus,
  Link as LinkIcon,
  HelpCircle,
  Play,
  Pause,
  ImageIcon,
  Layers,
  Settings,
  MoreVertical,
  Info
} from 'lucide-react';
import { DEFAULT_HOMEPAGE_CONFIG } from '../../data/defaultHomepage';

const COLOR_OPTIONS = [
  { id: 'rose', name: 'Zoho Red', badgeClass: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-600' },
  { id: 'amber', name: 'Amber Warning', badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200', dot: 'bg-amber-500' },
  { id: 'emerald', name: 'Forest Green', badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-600' },
  { id: 'sky', name: 'Corporate Blue', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-600' },
  { id: 'indigo', name: 'Deep Indigo', badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-600' },
  { id: 'red-outline', name: 'Red Outline', badgeClass: 'bg-white text-red-600 border border-red-300', dot: 'border border-red-500' }
];

export default function WebsiteHomepageManager() {
  const [config, setConfig] = useState(DEFAULT_HOMEPAGE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('offers'); // 'offers', 'carousel', 'categories', 'brands', 'preview'
  const [toast, setToast] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, source: 'local' });

  // Carousel interactive preview state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // File upload refs
  const carouselFileRef = useRef(null);
  const categoryFileRef = useRef(null);
  const brandFileRef = useRef(null);

  useEffect(() => {
    loadHomepageConfig();
  }, []);

  useEffect(() => {
    if (!isAutoplay || !config.carousel || config.carousel.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % config.carousel.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoplay, config.carousel?.length]);

  const loadHomepageConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/website/homepage?domain=rajbiosis.com');
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data);
        setDbStatus({
          connected: json.isDbConnected || json.source === 'mongodb',
          source: json.source || 'mongodb'
        });
      }
    } catch (e) {
      console.warn('API error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/website/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const json = await res.json();
      if (json.success) {
        setDbStatus({
          connected: !!json.savedToMongo,
          source: json.source
        });
        showToast('success', json.savedToMongo 
          ? 'Homepage configuration saved to MongoDB.' 
          : 'Saved locally in cache (MongoDB cluster offline).');
      } else {
        showToast('error', 'Save error: ' + (json.error || 'Failed'));
      }
    } catch (e) {
      showToast('error', 'Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      callback(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const persistConfig = async (newConfig, successMessage) => {
    try {
      const res = await fetch('/api/website/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const json = await res.json();
      if (json.success) {
        setDbStatus({
          connected: !!json.savedToMongo,
          source: json.source
        });
        if (successMessage) {
          showToast('success', successMessage);
        }
      } else {
        showToast('error', 'Save error: ' + (json.error || 'Failed'));
      }
    } catch (e) {
      showToast('error', 'Error: ' + e.message);
    }
  };

  // Offers
  const handleSaveOffer = (data) => {
    let newOffers;
    if (editingOffer && editingOffer.id) {
      newOffers = (config.offers || []).map(o => o.id === editingOffer.id ? { ...o, ...data } : o);
    } else {
      newOffers = [...(config.offers || []), { id: 'off-' + Date.now(), active: true, ...data }];
    }
    const newConfig = { ...config, offers: newOffers };
    setConfig(newConfig);
    setOfferModalOpen(false);
    setEditingOffer(null);
    persistConfig(newConfig, 'Offer saved to MongoDB');
  };

  const handleDeleteOffer = (id) => {
    if (confirm('Delete this offer banner?')) {
      const updated = (config.offers || []).filter(o => o.id !== id);
      const newConfig = { ...config, offers: updated };
      setConfig(newConfig);
      persistConfig(newConfig, 'Offer deleted from MongoDB');
    }
  };

  const handleToggleOffer = (id) => {
    const updated = (config.offers || []).map(o => o.id === id ? { ...o, active: !o.active } : o);
    const newConfig = { ...config, offers: updated };
    setConfig(newConfig);
    persistConfig(newConfig, 'Offer status updated');
  };

  const handleMoveOffer = (idx, dir) => {
    const list = [...(config.offers || [])];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    const newConfig = { ...config, offers: list };
    setConfig(newConfig);
    persistConfig(newConfig, 'Offer position saved');
  };

  // Carousel
  const handleUpdateSlide = (field, val) => {
    setConfig(prev => {
      const slides = [...(prev.carousel || [])];
      if (slides[activeSlideIndex]) {
        slides[activeSlideIndex] = { ...slides[activeSlideIndex], [field]: val };
      }
      return { ...prev, carousel: slides };
    });
  };

  const handleAddSlide = () => {
    if ((config.carousel || []).length >= 5) {
      alert('Maximum 5 hero slides allowed.');
      return;
    }
    const newSlide = {
      id: 'slide-' + Date.now(),
      title: 'New Biomedical Equipment Banner',
      subtitle: 'Certified hospital equipment delivered direct from OEM',
      badge: 'Direct OEM Procurement',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80',
      primaryBtnText: 'Explore Equipment',
      primaryBtnLink: '#categories',
      secondaryBtnText: 'Request Institutional RFQ',
      secondaryBtnLink: '#rfq',
      active: true
    };
    const updated = [...(config.carousel || []), newSlide];
    const newConfig = { ...config, carousel: updated };
    setConfig(newConfig);
    setActiveSlideIndex(updated.length - 1);
    persistConfig(newConfig, 'New slide added and saved');
  };

  const handleDeleteSlide = (idx) => {
    if ((config.carousel || []).length <= 1) {
      alert('At least one hero banner slide is required.');
      return;
    }
    if (confirm('Remove this slide from hero carousel?')) {
      const updated = (config.carousel || []).filter((_, i) => i !== idx);
      const newConfig = { ...config, carousel: updated };
      setConfig(newConfig);
      setActiveSlideIndex(Math.max(0, idx - 1));
      persistConfig(newConfig, 'Slide removed from MongoDB');
    }
  };

  // Categories
  const handleSaveCategory = (data) => {
    let updated;
    if (editingCategory && editingCategory.id) {
      updated = (config.categories || []).map(c => c.id === editingCategory.id ? { ...c, ...data } : c);
    } else {
      updated = [...(config.categories || []), { id: 'cat-' + Date.now(), active: true, ...data }];
    }
    const newConfig = { ...config, categories: updated };
    setConfig(newConfig);
    setCategoryModalOpen(false);
    setEditingCategory(null);
    persistConfig(newConfig, 'Category saved to MongoDB');
  };

  const handleDeleteCategory = (id) => {
    if (confirm('Delete this equipment category?')) {
      const updated = (config.categories || []).filter(c => c.id !== id);
      const newConfig = { ...config, categories: updated };
      setConfig(newConfig);
      persistConfig(newConfig, 'Category deleted from MongoDB');
    }
  };

  // Brands
  const handleSaveBrand = (data) => {
    let updated;
    if (editingBrand && editingBrand.id) {
      updated = (config.brands || []).map(b => b.id === editingBrand.id ? { ...b, ...data } : b);
    } else {
      updated = [...(config.brands || []), { id: 'brand-' + Date.now(), active: true, ...data }];
    }
    const newConfig = { ...config, brands: updated };
    setConfig(newConfig);
    setBrandModalOpen(false);
    setEditingBrand(null);
    persistConfig(newConfig, 'Brand saved to MongoDB');
  };

  const handleDeleteBrand = (id) => {
    if (confirm('Remove this partner brand?')) {
      const updated = (config.brands || []).filter(b => b.id !== id);
      const newConfig = { ...config, brands: updated };
      setConfig(newConfig);
      persistConfig(newConfig, 'Brand removed from MongoDB');
    }
  };

  const currentSlide = config.carousel?.[activeSlideIndex] || config.carousel?.[0];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-md border text-xs font-medium flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-red-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ZOHO STYLE TOP ACTION BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Storefront</span>
              <span>/</span>
              <span className="text-slate-800 font-medium">Home Page Customization</span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {dbStatus.connected ? 'MongoDB Connected' : 'Local Storage Fallback'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Home Page Builder & Content Management
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadHomepageConfig}
              disabled={isLoading}
              title="Refresh from MongoDB"
              className="p-2 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            <a
              href="/preview/rajbiosis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>Preview Website</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-[#E42528] hover:bg-[#CC1F22] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* ZOHO HORIZONTAL UNDERLINE TAB BAR */}
        <div className="mt-4 pt-3 flex items-center gap-6 border-t border-slate-100 overflow-x-auto text-xs">
          {[
            { id: 'offers', label: 'Top Offers & Announcement Bar', count: (config.offers || []).length },
            { id: 'carousel', label: 'Hero Banner Slider (5 Slides)', count: (config.carousel || []).length },
            { id: 'categories', label: 'Equipment Categories', count: (config.categories || []).length },
            { id: 'brands', label: 'Brand Partners & Logos', count: (config.brands || []).length },
            { id: 'preview', label: 'Storefront Layout Preview', count: null }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 font-semibold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? 'border-[#E42528] text-[#E42528]' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isActive ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: TOP OFFERS & ANNOUNCEMENT BAR */}
        {/* ========================================================================= */}
        {activeTab === 'offers' && (
          <div className="space-y-5">
            {/* Zoho Info Note */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Promotional Top Ribbon:</strong> These offer badges are displayed at the very top of your storefront header. You can add, edit, reorder, or toggle individual offers.
              </div>
            </div>

            {/* Clean Light-Themed Preview Strip (Not pitch black!) */}
            <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Storefront Preview: Top Ribbon
              </div>
              <div className="border border-slate-200 rounded bg-[#101828] text-white p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {(config.offers || []).filter(o => o.active).map(offer => {
                    const theme = COLOR_OPTIONS.find(c => c.id === offer.color) || COLOR_OPTIONS[0];
                    return (
                      <span
                        key={offer.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/10 border border-white/20 text-white"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                        <strong className="font-semibold">{offer.tag}:</strong>
                        <span>{offer.title}</span>
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="text-slate-300 font-mono text-[11px]">
                    {config.offersConfig?.hotline || '+91 9999-BIOSIS'}
                  </span>
                  <span className="px-3 py-1 rounded bg-[#E42528] text-white font-medium text-[11px]">
                    {config.offersConfig?.quoteBtnText || 'Request A Quote'}
                  </span>
                </div>
              </div>
            </div>

            {/* Zoho Style Table of Offers */}
            <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Active Offers & Promo Pills</h3>
                  <p className="text-xs text-slate-500">Configure promotional text, tags, and click links</p>
                </div>
                <button
                  onClick={() => {
                    setEditingOffer({
                      tag: 'Special Offer',
                      title: '',
                      desc: '',
                      color: 'rose',
                      link: '#categories'
                    });
                    setOfferModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white text-xs font-medium rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Offer</span>
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">Order</th>
                    <th className="py-2.5 px-4 w-24">Status</th>
                    <th className="py-2.5 px-4">Badge / Tag</th>
                    <th className="py-2.5 px-4">Offer Headline</th>
                    <th className="py-2.5 px-4">Color Style</th>
                    <th className="py-2.5 px-4">Target Link</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(config.offers || []).map((offer, idx) => {
                    const theme = COLOR_OPTIONS.find(c => c.id === offer.color) || COLOR_OPTIONS[0];
                    return (
                      <tr key={offer.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              onClick={() => handleMoveOffer(idx, -1)}
                              disabled={idx === 0}
                              className="hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              onClick={() => handleMoveOffer(idx, 1)}
                              disabled={idx === (config.offers || []).length - 1}
                              className="hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                            >
                              <MoveDown size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={offer.active}
                              onChange={() => handleToggleOffer(offer.id)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                          </label>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${theme.badgeClass}`}>
                            {offer.tag}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {offer.title}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                            <span>{theme.name}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {offer.link || '#'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-500">
                            <button
                              onClick={() => {
                                setEditingOffer(offer);
                                setOfferModalOpen(true);
                              }}
                              className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="p-1 border border-transparent rounded hover:border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Secondary Options */}
              <div className="bg-slate-50/70 border-t border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Support Hotline Number</label>
                  <input
                    type="text"
                    value={config.offersConfig?.hotline || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      offersConfig: { ...(prev.offersConfig || {}), hotline: e.target.value }
                    }))}
                    className="w-full px-3 py-1.5 bg-white text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="+91 9999-BIOSIS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Quote Button Text</label>
                  <input
                    type="text"
                    value={config.offersConfig?.quoteBtnText || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      offersConfig: { ...(prev.offersConfig || {}), quoteBtnText: e.target.value }
                    }))}
                    className="w-full px-3 py-1.5 bg-white text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Request A Quote"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HERO BANNER SLIDER (5 SLIDES) */}
        {/* ========================================================================= */}
        {activeTab === 'carousel' && (
          <div className="space-y-5">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Hero Banner Slider:</strong> Up to 5 promotional slides can be configured. Each slide includes a high-resolution banner image, headline, description, and direct call-to-action buttons.
              </div>
            </div>

            {/* Slide Navigation & Selector */}
            <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Configured Slides:</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {(config.carousel || []).length} of 5 Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSlide(activeSlideIndex)}
                    className="px-2.5 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 cursor-pointer"
                  >
                    Delete Slide {activeSlideIndex + 1}
                  </button>

                  <button
                    onClick={handleAddSlide}
                    disabled={(config.carousel || []).length >= 5}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add Slide</span>
                  </button>
                </div>
              </div>

              {/* Slide Tabs */}
              <div className="flex items-center gap-2">
                {(config.carousel || []).map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 py-2 text-xs font-medium rounded border transition cursor-pointer flex items-center gap-2 ${
                      idx === activeSlideIndex
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Slide {idx + 1}</span>
                    <span className="text-[10px] opacity-70 truncate max-w-[120px]">{slide.title}</span>
                  </button>
                ))}
              </div>

              {/* Current Slide Form */}
              {currentSlide && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3 items-start">
                  {/* Left: Image Upload & Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Banner Image (File Upload or URL)
                    </label>

                    <div className="border border-slate-300 rounded bg-slate-50 p-2 text-center h-48 flex items-center justify-center overflow-hidden relative">
                      {currentSlide.image ? (
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs">No image selected</div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={carouselFileRef}
                      onChange={(e) => handleFileUpload(e, (dataUrl) => handleUpdateSlide('image', dataUrl))}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => carouselFileRef.current?.click()}
                        className="flex-1 py-1.5 px-3 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Upload Image File</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={currentSlide.image || ''}
                        onChange={(e) => handleUpdateSlide('image', e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Right: Content Fields */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={currentSlide.badge || ''}
                          onChange={(e) => handleUpdateSlide('badge', e.target.value)}
                          placeholder="e.g. Direct OEM Procurement"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Slide Number</label>
                        <input
                          type="text"
                          disabled
                          value={`Slide ${activeSlideIndex + 1} of ${(config.carousel || []).length}`}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-100 text-slate-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Main Headline</label>
                      <input
                        type="text"
                        value={currentSlide.title || ''}
                        onChange={(e) => handleUpdateSlide('title', e.target.value)}
                        placeholder="e.g. Advanced Diagnostics for Better Healthcare"
                        className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Description / Spec Summary</label>
                      <textarea
                        rows={2}
                        value={currentSlide.subtitle || ''}
                        onChange={(e) => handleUpdateSlide('subtitle', e.target.value)}
                        placeholder="Short summary of medical systems shown"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Primary Button</label>
                        <input
                          type="text"
                          value={currentSlide.primaryBtnText || ''}
                          onChange={(e) => handleUpdateSlide('primaryBtnText', e.target.value)}
                          placeholder="Button label"
                          className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-white mb-1.5"
                        />
                        <input
                          type="text"
                          value={currentSlide.primaryBtnLink || ''}
                          onChange={(e) => handleUpdateSlide('primaryBtnLink', e.target.value)}
                          placeholder="Link target (#categories)"
                          className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Secondary Button</label>
                        <input
                          type="text"
                          value={currentSlide.secondaryBtnText || ''}
                          onChange={(e) => handleUpdateSlide('secondaryBtnText', e.target.value)}
                          placeholder="Button label"
                          className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-white mb-1.5"
                        />
                        <input
                          type="text"
                          value={currentSlide.secondaryBtnLink || ''}
                          onChange={(e) => handleUpdateSlide('secondaryBtnLink', e.target.value)}
                          placeholder="Link target (#rfq)"
                          className="w-full px-3 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Light-Themed Preview of Banner */}
            <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                  Interactive Banner Preview
                </span>
                <span className="font-mono text-slate-600">
                  Slide {activeSlideIndex + 1} of {(config.carousel || []).length}
                </span>
              </div>

              <div className="relative border border-slate-200 rounded overflow-hidden bg-slate-900 h-64 select-none">
                {currentSlide && (
                  <>
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                      <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded w-fit mb-2">
                        {currentSlide.badge}
                      </span>
                      <h4 className="text-xl font-bold">{currentSlide.title}</h4>
                      <p className="text-xs text-slate-200 line-clamp-1 max-w-lg mt-1">{currentSlide.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex(prev => (prev - 1 + config.carousel.length) % config.carousel.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded bg-black/40 text-white hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex(prev => (prev + 1) % config.carousel.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded bg-black/40 text-white hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BIOMEDICAL EQUIPMENT CATEGORIES */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-5">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Equipment Categories:</strong> Configure clinical departments displayed on the homepage. You can assign category images, item count badges, and catalog links.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Biomedical Categories</h3>
                  <p className="text-xs text-slate-500">6 Core clinical verticals shown on the homepage</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory({
                      name: '',
                      itemCount: 10,
                      badge: '10 Items',
                      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
                      description: ''
                    });
                    setCategoryModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white text-xs font-medium rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {(config.categories || []).map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-slate-200 rounded bg-white hover:border-slate-300 hover:shadow-xs transition p-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-24 bg-slate-100 rounded overflow-hidden relative mb-2">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/70 text-white text-[9px] font-mono rounded">
                          {cat.badge || `${cat.itemCount || 10} Items`}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{cat.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BRANDS WE DEAL IN & SUPPORT ("+ Add Brand Logo") */}
        {/* ========================================================================= */}
        {activeTab === 'brands' && (
          <div className="space-y-5">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Brand Partners & OEM Directory:</strong> Manage OEM logos displayed under "Brands We Deal In & Support". You can add unlimited brands with logos, partnership levels, and website links.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Brands We Deal In & Support</h3>
                  <p className="text-xs text-slate-500">{(config.brands || []).length} Partner brands registered</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBrand({
                      name: '',
                      tier: 'Authorized Partner',
                      tagline: '',
                      logo: '',
                      website: 'https://'
                    });
                    setBrandModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white text-xs font-medium rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Brand Logo</span>
                </button>
              </div>

              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {(config.brands || []).map((brand) => (
                  <div
                    key={brand.id}
                    className="border border-slate-200 rounded bg-white hover:border-slate-300 hover:shadow-xs transition p-3 flex flex-col justify-between items-center text-center"
                  >
                    <div className="w-full flex justify-end">
                      <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                        {brand.tier}
                      </span>
                    </div>

                    <div className="w-full h-14 my-2 flex items-center justify-center p-1">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{brand.name}</span>
                      )}
                    </div>

                    <div className="w-full">
                      <div className="text-xs font-semibold text-slate-900 truncate">{brand.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{brand.tagline || brand.website}</div>
                    </div>

                    <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setBrandModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STOREFRONT LAYOUT PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded shadow-xs p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Clean Storefront Simulation</h3>
                <p className="text-xs text-slate-500">Live preview of the header, offers ribbon, carousel, and categories</p>
              </div>
              <a
                href="/preview/rajbiosis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5"
              >
                <span>Open in Full Tab</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden shadow-xs bg-white">
              {/* Browser Address Bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                </div>
                <div className="bg-white border border-slate-200 rounded px-3 py-0.5 text-[11px] font-mono text-slate-600 flex-1 ml-2">
                  https://rajbiosis.com/
                </div>
              </div>

              {/* Top Offers Ribbon */}
              <div className="bg-[#101828] text-white px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {(config.offers || []).filter(o => o.active).map(offer => (
                    <span key={offer.id} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-white/10 text-white font-medium">
                      <strong>{offer.tag}:</strong> {offer.title}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-300 text-[11px] font-mono">{config.offersConfig?.hotline}</span>
                  <span className="px-2.5 py-0.5 bg-[#E42528] text-white text-[10px] font-semibold rounded">
                    {config.offersConfig?.quoteBtnText}
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                    RB
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">Raj Biosis Private Limited</span>
                    <span className="text-[10px] text-slate-400">Biomedical & Hospital Equipment</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs text-slate-600 font-medium">
                  <span className="text-red-600 font-semibold">All Products</span>
                  <span>Categories</span>
                  <span>About</span>
                  <span>Services</span>
                  <span>Contact</span>
                  <button className="px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-semibold">
                    Request Quote
                  </button>
                </div>
              </div>

              {/* Hero Banner Snapshot */}
              <div className="p-5 bg-slate-50 border-b border-slate-200">
                <div className="relative rounded overflow-hidden shadow-xs h-64 bg-slate-900">
                  {currentSlide && (
                    <>
                      <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded w-fit mb-2 font-medium">{currentSlide.badge}</span>
                        <h3 className="text-2xl font-bold">{currentSlide.title}</h3>
                        <p className="text-xs text-slate-200 mt-1 max-w-lg">{currentSlide.subtitle}</p>
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[10px] font-mono rounded">
                        {activeSlideIndex + 1} / {(config.carousel || []).length}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Categories Grid Snapshot */}
              <div className="p-6 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Biomedical Equipment Categories</h4>
                  <span className="text-xs text-red-600 font-medium">All Categories &gt;</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {(config.categories || []).map((cat, idx) => (
                    <div key={idx} className="border border-slate-200 rounded p-2 text-center bg-slate-50/50">
                      <div className="w-full h-20 rounded overflow-hidden mb-1.5">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="font-semibold text-xs text-slate-800 truncate">{cat.name}</div>
                      <div className="text-[10px] text-slate-400">{cat.badge}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands Snapshot */}
              <div className="p-6 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Brands We Deal In & Support</h4>
                <div className="flex flex-wrap items-center gap-3">
                  {(config.brands || []).map((brand, idx) => (
                    <div key={idx} className="border border-slate-200 rounded bg-white px-3 py-2 flex items-center gap-2">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-5 max-w-[80px] object-contain" />
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">{brand.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT OFFER */}
      {/* ========================================================================= */}
      {offerModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full shadow-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingOffer.id ? 'Edit Promotional Offer' : 'Add New Promotional Offer'}
              </h3>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingOffer.tag || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                  placeholder="e.g. Flash Sale / Special Offer"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Offer Headline</label>
                <input
                  type="text"
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. FLAT 20% OFF on ICU Packages"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Color Theme</label>
                <select
                  value={editingOffer.color || 'rose'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, color: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                >
                  {COLOR_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={editingOffer.link || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, link: e.target.value })}
                  placeholder="#categories or /offers"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveOffer(editingOffer)}
                className="px-4 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white font-medium rounded cursor-pointer"
              >
                Save Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ========================================================================= */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full shadow-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCategory.id ? 'Edit Equipment Category' : 'Add Equipment Category'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category Title</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. ICU & Critical Care"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Items Count</label>
                  <input
                    type="number"
                    value={editingCategory.itemCount || 10}
                    onChange={(e) => setEditingCategory({ ...editingCategory, itemCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingCategory.badge || `${editingCategory.itemCount || 10} Items`}
                    onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category Image (Upload or URL)</label>
                <input
                  type="file"
                  ref={categoryFileRef}
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setEditingCategory({ ...editingCategory, image: dataUrl }))}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => categoryFileRef.current?.click()}
                    className="px-3 py-1.5 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Upload File
                  </button>
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
                {editingCategory.image && (
                  <div className="w-full h-20 rounded border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="e.g. Turbine Ventilators, Patient Monitors..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCategory(editingCategory)}
                className="px-4 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white font-medium rounded cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BRAND LOGO */}
      {/* ========================================================================= */}
      {brandModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full shadow-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBrand.id ? 'Edit Partner Brand' : 'Add Partner Brand Logo'}
              </h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Mindray / OSCAR / Philips"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Partnership Level</label>
                <input
                  type="text"
                  value={editingBrand.tier || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, tier: e.target.value })}
                  placeholder="e.g. Authorised Distributor / OEM Partner"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Brand Logo (Upload File or URL)</label>
                <input
                  type="file"
                  ref={brandFileRef}
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setEditingBrand({ ...editingBrand, logo: dataUrl }))}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => brandFileRef.current?.click()}
                    className="px-3 py-1.5 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Upload Logo
                  </button>
                  <input
                    type="text"
                    value={editingBrand.logo || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.value })}
                    placeholder="https://... logo.png"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
                {editingBrand.logo && (
                  <div className="w-full h-16 rounded border border-slate-200 flex items-center justify-center p-2 bg-slate-50">
                    <img src={editingBrand.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingBrand.tagline || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, tagline: e.target.value })}
                    placeholder="e.g. Ultrasound & Critical Care"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editingBrand.website || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBrandModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBrand(editingBrand)}
                className="px-4 py-1.5 bg-[#E42528] hover:bg-[#CC1F22] text-white font-medium rounded cursor-pointer"
              >
                Save Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
