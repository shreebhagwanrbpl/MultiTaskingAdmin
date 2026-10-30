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
  Info,
  Sparkles,
  Tag,
  Building2
} from 'lucide-react';
import { DEFAULT_HOMEPAGE_CONFIG } from '../../data/defaultHomepage';

const COLOR_OPTIONS = [
  { id: 'rose', name: 'Coral Rose', badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  { id: 'amber', name: 'Amber Gold', badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  { id: 'emerald', name: 'Clinical Emerald', badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-600' },
  { id: 'sky', name: 'Medical Sky Blue', badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  { id: 'indigo', name: 'Deep Indigo', badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-600' },
  { id: 'red-outline', name: 'Ruby Outline', badgeClass: 'bg-white text-rose-600 border border-rose-300', text: 'text-rose-600', dot: 'border-2 border-rose-500 bg-white' }
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
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 ${
          toast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20' 
            : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* MODERN MEDICAL TOP ACTION BAR */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1.5">
              <span>Storefront</span>
              <span>/</span>
              <span className="text-slate-700 font-semibold">Home Page Customization</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {dbStatus.connected ? 'MongoDB Cluster Live' : 'Local Storage Cache'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Home Page Builder & Content Management</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadHomepageConfig}
              disabled={isLoading}
              title="Refresh configuration from MongoDB"
              className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-sky-600" : ""} />
            </button>

            <a
              href="/preview/rajbiosis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition flex items-center gap-2"
            >
              <Eye size={14} className="text-sky-600" />
              <span>Preview Website</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* MODERN SEGMENTED PILL TAB BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'offers', label: 'Top Offers & Announcement Bar', count: (config.offers || []).length, icon: Sparkles },
            { id: 'carousel', label: 'Hero Banner Slider (5 Slides)', count: (config.carousel || []).length, icon: ImageIcon },
            { id: 'categories', label: 'Equipment Categories', count: (config.categories || []).length, icon: Layers },
            { id: 'brands', label: 'Brand Partners & Logos', count: (config.brands || []).length, icon: Building2 },
            { id: 'preview', label: 'Storefront Layout Preview', count: null, icon: Eye }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-sky-50 text-sky-700 border border-sky-200/90 shadow-2xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <TabIcon size={14} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
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
            {/* Clean Medical Info Note */}
            <div className="p-4 bg-gradient-to-r from-sky-50/70 via-sky-50/40 to-indigo-50/30 border border-sky-100/90 rounded-2xl text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={15} />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold text-sky-900">Promotional Top Ribbon:</strong> These offer badges are displayed at the very top of your medical storefront header. You can add, edit, reorder, or toggle individual offers in real-time.
              </div>
            </div>

            {/* Pristine Modern Medical Storefront Top Ribbon Preview (NO BLACK!) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Live Storefront Preview • Top Announcement Bar
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Header preview on rajbiosis.com
                </span>
              </div>

              {/* Clean Luminous Light Medical Header Ribbon */}
              <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition">
                <div className="flex flex-wrap items-center gap-2">
                  {(config.offers || []).filter(o => o.active).map(offer => {
                    const theme = COLOR_OPTIONS.find(c => c.id === offer.color) || COLOR_OPTIONS[0];
                    return (
                      <span
                        key={offer.id}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 shadow-2xs text-slate-800 hover:border-sky-300 transition"
                      >
                        <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                        <strong className={theme.text || 'text-slate-900'}>{offer.tag}:</strong>
                        <span className="text-slate-600 font-medium">{offer.title}</span>
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs">
                    <Phone size={12} className="text-sky-600" />
                    <span className="font-mono">{config.offersConfig?.hotline || '+91 9999-BIOSIS'}</span>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    {config.offersConfig?.quoteBtnText || 'Request A Quote'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Table of Offers */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Offers & Promo Pills</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure promotional headlines, tags, color schemes, and target links</p>
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
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Offer</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-14 text-center">Order</th>
                      <th className="py-3 px-4 w-24">Status</th>
                      <th className="py-3 px-4">Badge / Tag</th>
                      <th className="py-3 px-4">Offer Headline</th>
                      <th className="py-3 px-4">Color Style</th>
                      <th className="py-3 px-4">Target Link</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(config.offers || []).map((offer, idx) => {
                      const theme = COLOR_OPTIONS.find(c => c.id === offer.color) || COLOR_OPTIONS[0];
                      return (
                        <tr key={offer.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400">
                              <button
                                onClick={() => handleMoveOffer(idx, -1)}
                                disabled={idx === 0}
                                title="Move Up"
                                className="hover:text-slate-800 disabled:opacity-20 cursor-pointer p-1 rounded hover:bg-slate-100"
                              >
                                <MoveUp size={13} />
                              </button>
                              <button
                                onClick={() => handleMoveOffer(idx, 1)}
                                disabled={idx === (config.offers || []).length - 1}
                                title="Move Down"
                                className="hover:text-slate-800 disabled:opacity-20 cursor-pointer p-1 rounded hover:bg-slate-100"
                              >
                                <MoveDown size={13} />
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
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${theme.badgeClass}`}>
                              {offer.tag}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">
                            {offer.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`}></span>
                              <span>{theme.name}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                            {offer.link || '#'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setOfferModalOpen(true);
                                }}
                                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                title="Delete offer"
                                className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Secondary Options Card */}
              <div className="bg-slate-50/60 border-t border-slate-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Hotline Number</label>
                  <input
                    type="text"
                    value={config.offersConfig?.hotline || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      offersConfig: { ...(prev.offersConfig || {}), hotline: e.target.value }
                    }))}
                    className="w-full px-3.5 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none font-semibold text-slate-800 shadow-2xs"
                    placeholder="+91 9999-BIOSIS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Quote Button Text</label>
                  <input
                    type="text"
                    value={config.offersConfig?.quoteBtnText || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      offersConfig: { ...(prev.offersConfig || {}), quoteBtnText: e.target.value }
                    }))}
                    className="w-full px-3.5 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none font-semibold text-slate-800 shadow-2xs"
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
            <div className="p-4 bg-gradient-to-r from-sky-50/70 via-sky-50/40 to-indigo-50/30 border border-sky-100/90 rounded-2xl text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={15} />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold text-sky-900">Hero Banner Slider:</strong> Up to 5 high-impact promotional slides can be configured. Each slide includes a high-resolution banner image, headline, description, and direct call-to-action buttons.
              </div>
            </div>

            {/* Slide Navigation & Selector */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Configured Slides:</span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                    {(config.carousel || []).length} of 5 Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSlide(activeSlideIndex)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer transition"
                  >
                    Delete Slide {activeSlideIndex + 1}
                  </button>

                  <button
                    onClick={handleAddSlide}
                    disabled={(config.carousel || []).length >= 5}
                    className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Slide</span>
                  </button>
                </div>
              </div>

              {/* Slide Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(config.carousel || []).map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                      idx === activeSlideIndex
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Slide {idx + 1}</span>
                    <span className="text-[11px] opacity-80 truncate max-w-[120px]">{slide.title}</span>
                  </button>
                ))}
              </div>

              {/* Current Slide Form */}
              {currentSlide && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-start">
                  {/* Left: Image Upload & Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Banner Image (File Upload or URL)
                    </label>

                    <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-2 text-center h-48 flex items-center justify-center overflow-hidden relative shadow-2xs">
                      {currentSlide.image ? (
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs font-medium">No image selected</div>
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
                        className="flex-1 py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload size={13} className="text-sky-600" />
                        <span>Upload Image File</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={currentSlide.image || ''}
                        onChange={(e) => handleUpdateSlide('image', e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Right: Content Fields */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={currentSlide.badge || ''}
                          onChange={(e) => handleUpdateSlide('badge', e.target.value)}
                          placeholder="e.g. Direct OEM Procurement"
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Slide Number</label>
                        <input
                          type="text"
                          disabled
                          value={`Slide ${activeSlideIndex + 1} of ${(config.carousel || []).length}`}
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-mono shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
                      <input
                        type="text"
                        value={currentSlide.title || ''}
                        onChange={(e) => handleUpdateSlide('title', e.target.value)}
                        placeholder="e.g. Advanced Diagnostics for Better Healthcare"
                        className="w-full px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description / Spec Summary</label>
                      <textarea
                        rows={2}
                        value={currentSlide.subtitle || ''}
                        onChange={(e) => handleUpdateSlide('subtitle', e.target.value)}
                        placeholder="Short summary of medical systems shown"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Button</label>
                        <input
                          type="text"
                          value={currentSlide.primaryBtnText || ''}
                          onChange={(e) => handleUpdateSlide('primaryBtnText', e.target.value)}
                          placeholder="Button label"
                          className="w-full px-3.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white mb-2 shadow-2xs"
                        />
                        <input
                          type="text"
                          value={currentSlide.primaryBtnLink || ''}
                          onChange={(e) => handleUpdateSlide('primaryBtnLink', e.target.value)}
                          placeholder="Link target (#categories)"
                          className="w-full px-3.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-mono shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Button</label>
                        <input
                          type="text"
                          value={currentSlide.secondaryBtnText || ''}
                          onChange={(e) => handleUpdateSlide('secondaryBtnText', e.target.value)}
                          placeholder="Button label"
                          className="w-full px-3.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white mb-2 shadow-2xs"
                        />
                        <input
                          type="text"
                          value={currentSlide.secondaryBtnLink || ''}
                          onChange={(e) => handleUpdateSlide('secondaryBtnLink', e.target.value)}
                          placeholder="Link target (#rfq)"
                          className="w-full px-3.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-mono shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Modern Medical Preview of Banner (NO PITCH BLACK!) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                  Interactive Banner Preview
                </span>
                <span className="font-mono text-slate-600 font-bold">
                  Slide {activeSlideIndex + 1} of {(config.carousel || []).length}
                </span>
              </div>

              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 h-72 select-none shadow-2xs">
                {currentSlide && (
                  <>
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Soft modern medical gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent p-6 flex flex-col justify-end text-white">
                      <span className="text-[11px] font-bold bg-white/90 text-slate-900 px-3 py-1 rounded-full w-fit mb-2 shadow-xs backdrop-blur-xs">
                        {currentSlide.badge}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black drop-shadow-sm">{currentSlide.title}</h4>
                      <p className="text-xs text-slate-100 line-clamp-1 max-w-lg mt-1 font-medium">{currentSlide.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex(prev => (prev - 1 + config.carousel.length) % config.carousel.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md cursor-pointer transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex(prev => (prev + 1) % config.carousel.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md cursor-pointer transition"
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
            <div className="p-4 bg-gradient-to-r from-sky-50/70 via-sky-50/40 to-indigo-50/30 border border-sky-100/90 rounded-2xl text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={15} />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold text-sky-900">Equipment Categories:</strong> Configure clinical departments displayed on the homepage. You can assign category images, item count badges, and catalog links.
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Biomedical Categories</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{(config.categories || []).length} Core clinical verticals shown on the homepage</p>
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
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(config.categories || []).map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-slate-200/80 rounded-2xl bg-white hover:border-sky-300 hover:shadow-md transition p-3.5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden relative mb-2.5 shadow-2xs">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-white/95 text-slate-800 text-[10px] font-bold rounded-md shadow-xs">
                          {cat.badge || `${cat.itemCount || 10} Items`}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-700 transition">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryModalOpen(true);
                        }}
                        className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
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
            <div className="p-4 bg-gradient-to-r from-sky-50/70 via-sky-50/40 to-indigo-50/30 border border-sky-100/90 rounded-2xl text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={15} />
              </div>
              <div className="leading-relaxed">
                <strong className="font-bold text-sky-900">Brand Partners & OEM Directory:</strong> Manage OEM logos displayed under "Brands We Deal In & Support". You can add unlimited brands with logos, partnership levels, and website links.
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Brands We Deal In & Support</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{(config.brands || []).length} Partner brands registered</p>
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
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Brand Logo</span>
                </button>
              </div>

              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(config.brands || []).map((brand) => (
                  <div
                    key={brand.id}
                    className="border border-slate-200/80 rounded-2xl bg-white hover:border-sky-300 hover:shadow-md transition p-4 flex flex-col justify-between items-center text-center group"
                  >
                    <div className="w-full flex justify-end">
                      <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                        {brand.tier}
                      </span>
                    </div>

                    <div className="w-full h-16 my-2.5 flex items-center justify-center p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-black text-slate-700">{brand.name}</span>
                      )}
                    </div>

                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-900 truncate">{brand.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{brand.tagline || brand.website}</div>
                    </div>

                    <div className="w-full mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setBrandModalOpen(true);
                        }}
                        className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
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
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clean Storefront Simulation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live simulation of the header, offers ribbon, hero carousel, and categories</p>
              </div>
              <a
                href="/preview/rajbiosis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition"
              >
                <span>Open Full Preview</span>
                <ExternalLink size={12} className="text-sky-600" />
              </a>
            </div>

            {/* Simulated Browser Frame */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              {/* Browser Bar */}
              <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-[11px] font-mono text-slate-600 flex-1 ml-2 shadow-2xs">
                  https://rajbiosis.com/
                </div>
              </div>

              {/* Clean Medical Top Offers Ribbon (NO BLACK!) */}
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 text-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {(config.offers || []).filter(o => o.active).map(offer => (
                    <span key={offer.id} className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] bg-white border border-slate-200 shadow-2xs text-slate-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <strong>{offer.tag}:</strong> {offer.title}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600 text-[11px] font-mono font-bold">{config.offersConfig?.hotline}</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[11px] font-bold rounded-xl shadow-xs">
                    {config.offersConfig?.quoteBtnText || 'Request A Quote'}
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-3.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    RB
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">Raj Biosis Private Limited</span>
                    <span className="text-[10px] text-slate-400 font-medium">Biomedical & Hospital Equipment Hub</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs text-slate-600 font-semibold">
                  <span className="text-sky-600 font-bold">All Products</span>
                  <span>Categories</span>
                  <span>About</span>
                  <span>Services</span>
                  <span>Contact</span>
                  <button className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-xs">
                    Request Quote
                  </button>
                </div>
              </div>

              {/* Hero Banner Snapshot */}
              <div className="p-6 bg-slate-50/70 border-b border-slate-100">
                <div className="relative rounded-2xl overflow-hidden shadow-sm h-64 bg-slate-100 border border-slate-200/80">
                  {currentSlide && (
                    <>
                      <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent p-6 flex flex-col justify-end text-white">
                        <span className="text-[10px] bg-white/90 text-slate-900 px-2.5 py-0.5 rounded-full w-fit mb-2 font-bold">{currentSlide.badge}</span>
                        <h3 className="text-2xl font-black">{currentSlide.title}</h3>
                        <p className="text-xs text-slate-100 mt-1 max-w-lg font-medium">{currentSlide.subtitle}</p>
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/90 text-slate-800 text-[10px] font-mono font-bold rounded-full shadow-xs">
                        {activeSlideIndex + 1} / {(config.carousel || []).length}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Categories Grid Snapshot */}
              <div className="p-6 bg-white border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Featured Clinical Departments</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(config.categories || []).slice(0, 6).map(c => (
                    <div key={c.id} className="border border-slate-200/80 rounded-xl p-2 text-center bg-slate-50/50">
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-white mb-1.5">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block truncate">{c.name}</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingOffer.id ? 'Edit Promotional Offer' : 'Add New Promotional Offer'}
              </h3>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingOffer.tag || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                  placeholder="e.g. Flash Sale / Special Offer"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Headline</label>
                <input
                  type="text"
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. FLAT 20% OFF on ICU Packages"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Color Theme</label>
                <select
                  value={editingOffer.color || 'rose'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, color: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none bg-white shadow-2xs font-medium"
                >
                  {COLOR_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={editingOffer.link || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, link: e.target.value })}
                  placeholder="#categories or /offers"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveOffer(editingOffer)}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCategory.id ? 'Edit Equipment Category' : 'Add Equipment Category'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Title</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. ICU & Critical Care"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Items Count</label>
                  <input
                    type="number"
                    value={editingCategory.itemCount || 10}
                    onChange={(e) => setEditingCategory({ ...editingCategory, itemCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingCategory.badge || `${editingCategory.itemCount || 10} Items`}
                    onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Image (Upload or URL)</label>
                <input
                  type="file"
                  ref={categoryFileRef}
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setEditingCategory({ ...editingCategory, image: dataUrl }))}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => categoryFileRef.current?.click()}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition shadow-2xs text-xs"
                  >
                    Upload File
                  </button>
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-[11px] shadow-2xs"
                  />
                </div>
                {editingCategory.image && (
                  <div className="w-full h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                    <img src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="e.g. Turbine Ventilators, Patient Monitors..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCategory(editingCategory)}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBrand.id ? 'Edit Partner Brand' : 'Add Partner Brand Logo'}
              </h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Mindray / OSCAR / Philips"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Partnership Level</label>
                <input
                  type="text"
                  value={editingBrand.tier || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, tier: e.target.value })}
                  placeholder="e.g. Authorised Distributor / OEM Partner"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Logo (Upload File or URL)</label>
                <input
                  type="file"
                  ref={brandFileRef}
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setEditingBrand({ ...editingBrand, logo: dataUrl }))}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => brandFileRef.current?.click()}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition shadow-2xs text-xs"
                  >
                    Upload Logo
                  </button>
                  <input
                    type="text"
                    value={editingBrand.logo || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.value })}
                    placeholder="https://... logo.png"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-[11px] shadow-2xs"
                  />
                </div>
                {editingBrand.logo && (
                  <div className="w-full h-18 rounded-2xl border border-slate-200 flex items-center justify-center p-2.5 bg-slate-50 shadow-2xs">
                    <img src={editingBrand.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingBrand.tagline || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, tagline: e.target.value })}
                    placeholder="e.g. Ultrasound & Critical Care"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editingBrand.website || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBrandModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBrand(editingBrand)}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
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
