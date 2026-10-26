'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  FolderUp, 
  FileSpreadsheet, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FolderTree, 
  RefreshCw, 
  ChevronDown, 
  FileText, 
  Video, 
  Tag, 
  SlidersHorizontal,
  HelpCircle,
  Scissors,
  Percent,
  Calendar,
  Boxes,
  Copy,
  CheckSquare,
  Square,
  Minus,
  Clock,
  ArrowUpDown,
  TrendingUp,
  Zap,
  Maximize2
} from 'lucide-react';
import { 
  generateDemoExcelFile, 
  exportProductsToExcelFile, 
  parseExcelFilesList, 
  EXCEL_COLUMNS 
} from '../../lib/excelHelper';

const COMPANIES = [
  {
    id: 'rajbiosis',
    name: 'Raj Biosis Private Limited',
    shortName: 'Raj Biosis',
    color: '#0ea5e9',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    defaultWebsites: ['rajbiosis.com']
  },
  {
    id: 'human_bio',
    name: 'Human Biomedicals',
    shortName: 'Human Biomedicals',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    defaultWebsites: ['humanbiomedicals.in', 'pulmocare.in', 'nephrolife.in']
  },
  {
    id: 'global_bio',
    name: 'Global Biomedical',
    shortName: 'Global Biomedical',
    color: '#6366f1',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    defaultWebsites: ['globalbiomedical.com', 'surgitech.in', 'orthodrive.in']
  }
];

export default function ProductCatalogManager({ initialSites = [] }) {
  // Main Products State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState('all'); // 'all' | 'rajbiosis' | 'human_bio' | 'global_bio'
  const [selectedProductType, setSelectedProductType] = useState('all'); // 'all' | 'normal' | 'hierarchical'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all'); // 'all' | 'visible' | 'hidden'
  const [selectedStockFilter, setSelectedStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');

  // View Layout: 'large' (large images) vs 'compact'
  const [viewMode, setViewMode] = useState('large');

  // Product Selection for Bulk Changes
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Modals State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addEditTab, setAddEditTab] = useState('basic'); // 'basic' | 'pricing' | 'inventory' | 'media' | 'specs' | 'websites'
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingSpecsProduct, setViewingSpecsProduct] = useState(null);
  const [quickWebsiteProduct, setQuickWebsiteProduct] = useState(null);
  const [previewImageProduct, setPreviewImageProduct] = useState(null);
  const [previewActiveImgIdx, setPreviewActiveImgIdx] = useState(0);
  const [websiteModalSearch, setWebsiteModalSearch] = useState('');

  // Bulk Operations Modals
  const [isBulkWordModalOpen, setIsBulkWordModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Bulk Title Word Remover State
  const [wordToRemove, setWordToRemove] = useState('');
  const [replaceWithWord, setReplaceWithWord] = useState('');
  const [isMatchCase, setIsMatchCase] = useState(false);
  const [isWordRemovalApplying, setIsWordRemovalApplying] = useState(false);

  // Bulk Commercials & Stock Editor State
  const [bulkPriceMode, setBulkPriceMode] = useState('keep'); // 'keep' | 'set' | 'inc_percent' | 'dec_percent' | 'inc_amount' | 'dec_amount'
  const [bulkPriceVal, setBulkPriceVal] = useState('');
  const [bulkMrpMode, setBulkMrpMode] = useState('keep'); // 'keep' | 'set' | 'auto_margin'
  const [bulkMrpVal, setBulkMrpVal] = useState('');
  const [bulkOffer, setBulkOffer] = useState('keep'); // 'keep' | '5' | '10' | '15' | '20' | '25' | '30' | 'custom'
  const [bulkCustomOffer, setBulkCustomOffer] = useState('');
  const [bulkGstRate, setBulkGstRate] = useState('keep'); // 'keep' | '0' | '5' | '12' | '18' | '28'
  const [bulkHsnCode, setBulkHsnCode] = useState('');
  const [bulkSkuPrefix, setBulkSkuPrefix] = useState('');
  const [bulkSkuSuffix, setBulkSkuSuffix] = useState('');
  const [bulkQtyMode, setBulkQtyMode] = useState('keep'); // 'keep' | 'set' | 'inc' | 'dec'
  const [bulkQtyVal, setBulkQtyVal] = useState('');
  const [bulkExpiryDate, setBulkExpiryDate] = useState('');
  const [bulkAvailability, setBulkAvailability] = useState('keep');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Import State
  const [importFiles, setImportFiles] = useState([]);
  const [parsedImportResults, setParsedImportResults] = useState(null);
  const [importCompanyTarget, setImportCompanyTarget] = useState('rajbiosis');
  const [importWebsiteTarget, setImportWebsiteTarget] = useState('all');
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    price: '',
    mrp: '',
    offer: '15',
    gstRate: '18',
    hsnCode: '9018',
    quantity: '25',
    expiryDate: '2028-06-30',
    batchNo: '',
    desc: '',
    capacity: '',
    throughput: '',
    instrument: '',
    model: '',
    usage: '',
    brand: '',
    parameters: '',
    automation: '',
    availability: 'In Stock',
    size: '',
    images: '',
    video: '',
    pdf: '',
    category: '',
    subCategory: '',
    companyId: 'rajbiosis',
    productType: 'normal',
    isVisible: true,
    hiddenWebsites: [],
    websiteVisibility: {},
    assignedWebsites: ['all']
  });
  const [newCustomWebsiteInput, setNewCustomWebsiteInput] = useState('');
  const [customWebsites, setCustomWebsites] = useState([]);

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Load products from MongoDB
  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setErrorMsg(data.error || 'Failed to load products');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to calculate Expiry Status and badge
  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return { text: 'No Expiry Set', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' };
    const exp = new Date(dateStr);
    if (isNaN(exp.getTime())) return { text: dateStr, badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: `Expired (${Math.abs(diffDays)}d ago)`, 
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', 
        isExpired: true,
        days: diffDays 
      };
    } else if (diffDays <= 90) {
      return { 
        text: `Expiring Soon (${diffDays}d left)`, 
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', 
        isSoon: true,
        days: diffDays 
      };
    } else {
      const formatted = exp.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      return { 
        text: `Exp: ${formatted}`, 
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', 
        isValid: true,
        days: diffDays 
      };
    }
  };

  // Helper to get all registered websites for a specific company
  const getWebsitesForCompany = (compKey) => {
    const list = new Set();
    const comp = COMPANIES.find(c => c.id === compKey);
    if (comp) {
      comp.defaultWebsites.forEach(w => list.add(w));
    }
    if (Array.isArray(initialSites)) {
      initialSites.forEach(s => {
        if (s.domain && (!s.companyId || s.companyId === compKey)) {
          list.add(s.domain);
        }
      });
    }
    customWebsites.forEach(w => {
      if (typeof w === 'string') list.add(w);
      else if (w.companyId === compKey || !w.companyId) list.add(w.domain);
    });
    products.forEach(p => {
      if (p.companyId === compKey) {
        if (Array.isArray(p.assignedWebsites)) {
          p.assignedWebsites.forEach(w => { if (w && w !== 'all') list.add(w); });
        }
        if (Array.isArray(p.hiddenWebsites)) {
          p.hiddenWebsites.forEach(w => { if (w) list.add(w); });
        }
        if (p.websiteVisibility) {
          Object.keys(p.websiteVisibility).forEach(w => list.add(w));
        }
      }
    });
    return Array.from(list);
  };

  // Compute all available website domains for current company or all
  const companyWebsites = useMemo(() => {
    if (selectedCompany !== 'all') {
      return getWebsitesForCompany(selectedCompany);
    }
    const all = new Set();
    COMPANIES.forEach(c => {
      getWebsitesForCompany(c.id).forEach(w => all.add(w));
    });
    return Array.from(all);
  }, [selectedCompany, initialSites, products, customWebsites]);

  // Core Helper: Is a product visible on a specific website domain?
  const isVisibleOnSite = (p, siteDomain) => {
    if (!siteDomain || siteDomain === 'all') {
      return p.isVisible !== false;
    }
    if (p.isVisible === false) return false;
    if (Array.isArray(p.hiddenWebsites) && p.hiddenWebsites.includes(siteDomain)) {
      return false;
    }
    if (p.websiteVisibility && p.websiteVisibility[siteDomain] === false) {
      return false;
    }
    if (Array.isArray(p.assignedWebsites) && p.assignedWebsites.length > 0 && !p.assignedWebsites.includes('all')) {
      if (!p.assignedWebsites.includes(siteDomain)) {
        return false;
      }
    }
    return true;
  };

  // Extract unique categories & dynamic subcategories
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats).sort();
  }, [products]);

  const uniqueSubCategories = useMemo(() => {
    const subCats = new Set();
    products.forEach(p => {
      const sub = p['sub category'] || p.subCategory;
      if (selectedCategory === 'all' || p.category === selectedCategory) {
        if (sub && sub.trim()) subCats.add(sub.trim());
      }
    });
    return Array.from(subCats).sort();
  }, [products, selectedCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Company Filter
      if (selectedCompany !== 'all' && p.companyId !== selectedCompany) {
        return false;
      }
      // Product Type Filter
      if (selectedProductType === 'normal') {
        const sub = p['sub category'] || p.subCategory;
        if (p.productType === 'hierarchical' || (sub && sub.trim())) return false;
      } else if (selectedProductType === 'hierarchical') {
        const sub = p['sub category'] || p.subCategory;
        if (!sub || !sub.trim()) return false;
      }
      // Category Filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Sub Category Filter
      if (selectedSubCategory !== 'all') {
        const sub = p['sub category'] || p.subCategory;
        if (sub !== selectedSubCategory) return false;
      }
      
      // Stock & Expiry Filter
      if (selectedStockFilter !== 'all') {
        const qty = typeof p.quantity === 'number' ? p.quantity : (parseInt(p.quantity || p.stockCount || 0, 10));
        const expStatus = getExpiryStatus(p.expiryDate);

        if (selectedStockFilter === 'in_stock' && qty <= 0) return false;
        if (selectedStockFilter === 'low_stock' && (qty <= 0 || qty > 10)) return false;
        if (selectedStockFilter === 'out_of_stock' && qty > 0) return false;
        if (selectedStockFilter === 'expiring_soon' && !expStatus.isSoon) return false;
        if (selectedStockFilter === 'expired' && !expStatus.isExpired) return false;
      }

      // Website & Visibility Filter
      if (selectedWebsite !== 'all') {
        const isLiveOnSite = isVisibleOnSite(p, selectedWebsite);
        if (selectedVisibility === 'visible' && !isLiveOnSite) return false;
        if (selectedVisibility === 'hidden' && isLiveOnSite) return false;
      } else {
        if (selectedVisibility === 'visible' && p.isVisible === false) return false;
        if (selectedVisibility === 'hidden' && p.isVisible !== false) return false;
      }

      // Search Query (Deep search across title, model, sku, hsn, brand, category, desc)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
        const modelMatch = (p.model || '').toLowerCase().includes(q);
        const skuMatch = (p.sku || '').toLowerCase().includes(q);
        const hsnMatch = (p.hsnCode || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const subCatMatch = (p['sub category'] || p.subCategory || '').toLowerCase().includes(q);
        const descMatch = (p.desc || p.shortDesc || '').toLowerCase().includes(q);
        if (!titleMatch && !modelMatch && !skuMatch && !hsnMatch && !brandMatch && !catMatch && !subCatMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCompany, selectedProductType, selectedCategory, selectedSubCategory, selectedStockFilter, selectedWebsite, selectedVisibility, searchQuery]);

  // Selection Logic
  const allFilteredSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every(p => selectedProductIds.includes(p.id || p._id));
  }, [filteredProducts, selectedProductIds]);

  const handleToggleSelectProduct = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all currently filtered
      const filteredIds = new Set(filteredProducts.map(p => p.id || p._id));
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      // Select all currently filtered
      const filteredIds = filteredProducts.map(p => p.id || p._id);
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  // Company Counts
  const companyCounts = useMemo(() => {
    return {
      all: products.length,
      rajbiosis: products.filter(p => p.companyId === 'rajbiosis').length,
      human_bio: products.filter(p => p.companyId === 'human_bio').length,
      global_bio: products.filter(p => p.companyId === 'global_bio').length,
    };
  }, [products]);

  // Overall Inventory Stats
  const inventoryStats = useMemo(() => {
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    products.forEach(p => {
      const q = typeof p.quantity === 'number' ? p.quantity : (parseInt(p.quantity || p.stockCount || 0, 10) || 0);
      totalStockUnits += q;
      if (q > 0 && q <= 10) lowStockCount++;
      const expStatus = getExpiryStatus(p.expiryDate);
      if (expStatus.isSoon) expiringSoonCount++;
      if (expStatus.isExpired) expiredCount++;
    });

    return { totalStockUnits, lowStockCount, expiringSoonCount, expiredCount };
  }, [products]);

  // 1-Click Quantity Quick Adjust (+ / -) directly from the row
  const handleAdjustQuantity = async (product, delta) => {
    const pId = product.id || product._id;
    const currentQty = typeof product.quantity === 'number' ? product.quantity : (parseInt(product.quantity || product.stockCount || 0, 10) || 0);
    const newQty = Math.max(0, currentQty + delta);
    const newStatus = newQty > 0 ? (newQty <= 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock';

    // Optimistic UI update
    setProducts(prev => prev.map(p => {
      if ((p.id === pId) || (p._id === pId)) {
        return { ...p, quantity: newQty, stockCount: newQty, availability: newStatus };
      }
      return p;
    }));

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pId,
          _id: pId,
          quantity: newQty,
          availability: newStatus
        })
      });
      setSuccessToast(`Stock updated: "${product.title}" is now ${newQty} units`);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  // 1-Click Toggle Website Visibility for a specific website
  const handleToggleWebsiteVisibility = async (product, siteDomain) => {
    const currentStatus = isVisibleOnSite(product, siteDomain);
    const nextStatus = !currentStatus;

    // Optimistically update
    setProducts(prev => prev.map(p => {
      if (p.id !== product.id && p._id !== product._id) return p;
      let newHidden = Array.isArray(p.hiddenWebsites) ? [...p.hiddenWebsites] : [];
      if (nextStatus) {
        newHidden = newHidden.filter(w => w !== siteDomain);
      } else {
        if (!newHidden.includes(siteDomain)) newHidden.push(siteDomain);
      }
      const newWebVis = { ...(p.websiteVisibility || {}), [siteDomain]: nextStatus };
      return {
        ...p,
        hiddenWebsites: newHidden,
        websiteVisibility: newWebVis
      };
    }));

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          _id: product._id,
          targetWebsite: siteDomain,
          isVisibleOnWebsite: nextStatus
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to update website visibility in MongoDB: ' + data.error);
        fetchProducts();
      } else {
        setSuccessToast(`Product "${product.title}" is now ${nextStatus ? '🟢 LIVE' : '⚪ HIDDEN'} on ${siteDomain}`);
      }
    } catch (err) {
      alert('Network error updating visibility: ' + err.message);
      fetchProducts();
    }
  };

  // Bulk Toggle for Website (Show all or hide all on selected website)
  const handleBulkToggleForWebsite = async (siteDomain, setVisible) => {
    if (!confirm(`Are you sure you want to ${setVisible ? 'SHOW' : 'HIDE'} all ${filteredProducts.length} filtered products on ${siteDomain}?`)) {
      return;
    }

    setProducts(prev => prev.map(p => {
      const isTarget = filteredProducts.some(fp => (fp.id === p.id || fp._id === p._id));
      if (!isTarget) return p;

      let newHidden = Array.isArray(p.hiddenWebsites) ? [...p.hiddenWebsites] : [];
      if (setVisible) {
        newHidden = newHidden.filter(w => w !== siteDomain);
      } else {
        if (!newHidden.includes(siteDomain)) newHidden.push(siteDomain);
      }
      const newWebVis = { ...(p.websiteVisibility || {}), [siteDomain]: setVisible };
      return { ...p, hiddenWebsites: newHidden, websiteVisibility: newWebVis };
    }));

    try {
      await Promise.all(
        filteredProducts.map(p => 
          fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: p.id,
              _id: p._id,
              targetWebsite: siteDomain,
              isVisibleOnWebsite: setVisible
            })
          })
        )
      );
      setSuccessToast(`All ${filteredProducts.length} products updated: ${setVisible ? '🟢 LIVE' : '⚪ HIDDEN'} on ${siteDomain}`);
    } catch (err) {
      alert('Error updating bulk visibility: ' + err.message);
      fetchProducts();
    }
  };

  // Global Toggle Visibility (Fallback)
  const handleToggleVisibility = async (product) => {
    const updatedVisibility = !product.isVisible;
    setProducts(prev => prev.map(p => (p.id === product.id || p._id === product._id) ? { ...p, isVisible: updatedVisibility } : p));
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          _id: product._id,
          isVisible: updatedVisibility
        })
      });
      const data = await res.json();
      if (!data.success) {
        setProducts(prev => prev.map(p => (p.id === product.id || p._id === product._id) ? { ...p, isVisible: !updatedVisibility } : p));
        alert('Failed to update product visibility in MongoDB: ' + data.error);
      } else {
        setSuccessToast(`Product "${product.title}" is now ${updatedVisibility ? '🟢 Live / Published' : '⚪ Hidden from Web'}`);
      }
    } catch (err) {
      setProducts(prev => prev.map(p => (p.id === product.id || p._id === product._id) ? { ...p, isVisible: !updatedVisibility } : p));
      alert('Network error updating visibility: ' + err.message);
    }
  };

  // Delete Single Product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to permanently delete product "${product.title}" from MongoDB?`)) {
      return;
    }
    const pId = product.id || product._id;
    setProducts(prev => prev.filter(p => p.id !== pId && p._id !== pId));
    setSelectedProductIds(prev => prev.filter(id => id !== pId));

    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(pId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to delete product: ' + data.error);
        fetchProducts();
      } else {
        setSuccessToast(`Product "${product.title}" deleted successfully.`);
      }
    } catch (err) {
      alert('Network error deleting product: ' + err.message);
      fetchProducts();
    }
  };

  // Execute Bulk Delete of Selected Products
  const handleExecuteBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products from MongoDB? This action cannot be undone.`)) {
      return;
    }

    const idsToDelete = [...selectedProductIds];
    setProducts(prev => prev.filter(p => !idsToDelete.includes(p.id) && !idsToDelete.includes(p._id)));
    setSelectedProductIds([]);

    try {
      const res = await fetch(`/api/products?ids=${encodeURIComponent(idsToDelete.join(','))}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(`Successfully deleted ${data.deletedCount || idsToDelete.length} products from MongoDB!`);
      } else {
        alert('Failed to bulk delete products: ' + data.error);
        fetchProducts();
      }
    } catch (err) {
      alert('Network error deleting products: ' + err.message);
      fetchProducts();
    }
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setAddEditTab('basic');
    setFormData({
      title: '',
      sku: 'RAJ-MED-' + Math.floor(1000 + Math.random() * 9000),
      price: '',
      mrp: '',
      offer: '15',
      gstRate: '18',
      hsnCode: '9018',
      quantity: '25',
      expiryDate: '2028-06-30',
      batchNo: 'LOT-2026-A1',
      desc: '',
      capacity: '',
      throughput: '',
      instrument: '',
      model: '',
      usage: '',
      brand: selectedCompany === 'human_bio' ? 'Human Biomedicals' : selectedCompany === 'global_bio' ? 'Global Biomedical' : 'Raj Biosis OEM',
      parameters: '',
      automation: 'Standard Clinical',
      availability: 'In Stock',
      size: '',
      images: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      video: '',
      pdf: '',
      category: '',
      subCategory: '',
      companyId: selectedCompany !== 'all' ? selectedCompany : 'rajbiosis',
      productType: 'normal',
      isVisible: true,
      hiddenWebsites: [],
      websiteVisibility: {},
      assignedWebsites: ['all']
    });
    setIsAddEditOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setAddEditTab('basic');
    const sub = product['sub category'] || product.subCategory || '';
    const pr = product.price || '';
    const mrpVal = product.mrp || (pr ? Math.round(Number(pr) * 1.25) : '');
    const offerVal = product.offer !== undefined ? product.offer : (product.discount !== undefined ? product.discount : '15');

    setFormData({
      title: product.title || product.name || '',
      sku: product.sku || product.model || '',
      price: pr,
      mrp: mrpVal,
      offer: String(offerVal),
      gstRate: String(product.gstRate !== undefined ? product.gstRate : 18),
      hsnCode: product.hsnCode || '9018',
      quantity: String(product.quantity !== undefined ? product.quantity : (product.stockCount || 25)),
      expiryDate: product.expiryDate || '2028-06-30',
      batchNo: product.batchNo || '',
      desc: product.desc || product.shortDesc || '',
      capacity: product.capacity || '',
      throughput: product.throughput || '',
      instrument: product.instrument || '',
      model: product.model || product.sku || '',
      usage: product.usage || '',
      brand: product.brand || '',
      parameters: product.parameters || '',
      automation: product.automation || '',
      availability: product.availability || product.stockStatus || 'In Stock',
      size: product.size || '',
      images: product.images || product.image || '',
      video: product.video || '',
      pdf: product.pdf || '',
      category: product.category || '',
      subCategory: sub,
      companyId: product.companyId || 'rajbiosis',
      productType: sub ? 'hierarchical' : (product.productType || 'normal'),
      isVisible: product.isVisible !== false,
      hiddenWebsites: Array.isArray(product.hiddenWebsites) ? product.hiddenWebsites : [],
      websiteVisibility: product.websiteVisibility || {},
      assignedWebsites: Array.isArray(product.assignedWebsites) ? product.assignedWebsites : ['all']
    });
    setIsAddEditOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter Product Title!');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const mrpNum = parseFloat(formData.mrp) || (priceNum ? Math.round(priceNum * 1.25) : 0);
    const offerNum = parseFloat(formData.offer) || 0;
    const qtyNum = parseInt(formData.quantity, 10) || 0;
    const gstNum = parseFloat(formData.gstRate) || 18;

    const payload = {
      ...formData,
      price: priceNum,
      mrp: mrpNum,
      offer: offerNum,
      discount: offerNum,
      quantity: qtyNum,
      stockCount: qtyNum,
      gstRate: gstNum,
      hsnCode: formData.hsnCode.trim() || '9018',
      sku: formData.sku.trim() || formData.model.trim() || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
      'sub category': formData.subCategory.trim(),
      productType: formData.subCategory.trim() ? 'hierarchical' : formData.productType,
      availability: formData.availability || (qtyNum > 0 ? 'In Stock' : 'Out of Stock')
    };

    if (editingProduct) {
      payload.id = editingProduct.id;
      payload._id = editingProduct._id;
    }

    try {
      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to save product to MongoDB: ' + data.error);
        return;
      }
      setIsAddEditOpen(false);
      setSuccessToast(editingProduct ? `Product "${formData.title}" updated!` : `New product "${formData.title}" added to MongoDB!`);
      fetchProducts();
    } catch (err) {
      alert('Network error saving product: ' + err.message);
    }
  };

  // =========================================================================
  // BULK OPERATION: REMOVE OR REPLACE WORD IN PRODUCT HEADINGS / TITLES
  // =========================================================================
  // Target products for word removal: selected ones, or if none selected, all currently filtered products
  const productsForWordRemoval = useMemo(() => {
    if (selectedProductIds.length > 0) {
      return products.filter(p => selectedProductIds.includes(p.id || p._id));
    }
    return filteredProducts;
  }, [selectedProductIds, products, filteredProducts]);

  // Live preview of titles with the word removed
  const wordRemovalPreviews = useMemo(() => {
    if (!wordToRemove.trim()) return [];
    const flags = isMatchCase ? 'g' : 'gi';
    const escaped = wordToRemove.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reg = new RegExp(escaped, flags);

    return productsForWordRemoval
      .filter(p => {
        const title = p.title || p.name || '';
        return reg.test(title);
      })
      .map(p => {
        const originalTitle = p.title || p.name || '';
        let newTitle = originalTitle.replace(reg, replaceWithWord.trim());
        newTitle = newTitle.replace(/\s+/g, ' ').replace(/^[\s\-_]+|[\s\-_]+$/g, '').trim();
        return {
          id: p.id || p._id,
          originalTitle,
          newTitle,
          matched: originalTitle !== newTitle
        };
      });
  }, [productsForWordRemoval, wordToRemove, replaceWithWord, isMatchCase]);

  const handleExecuteBulkWordRemoval = async () => {
    if (!wordToRemove.trim()) {
      alert('Please enter the word or phrase to remove from product headings!');
      return;
    }

    const targetIds = productsForWordRemoval.map(p => p.id || p._id);
    if (targetIds.length === 0) {
      alert('No products selected to apply changes to!');
      return;
    }

    setIsWordRemovalApplying(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkTitleWordRemove: true,
          ids: targetIds,
          removeWord: wordToRemove.trim(),
          replaceWith: replaceWithWord.trim(),
          matchCase: isMatchCase
        })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update local titles
        const flags = isMatchCase ? 'g' : 'gi';
        const escaped = wordToRemove.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(escaped, flags);

        setProducts(prev => prev.map(p => {
          const pId = p.id || p._id;
          if (!targetIds.includes(pId)) return p;
          let updatedTitle = (p.title || p.name || '').replace(reg, replaceWithWord.trim());
          updatedTitle = updatedTitle.replace(/\s+/g, ' ').replace(/^[\s\-_]+|[\s\-_]+$/g, '').trim();
          return { ...p, title: updatedTitle, name: updatedTitle };
        }));

        setSuccessToast(`Word "${wordToRemove}" removed from product titles!`);
        setIsBulkWordModalOpen(false);
        setWordToRemove('');
        setReplaceWithWord('');
      } else {
        alert('Failed to remove word: ' + data.error);
      }
    } catch (err) {
      alert('Error updating titles: ' + err.message);
    } finally {
      setIsWordRemovalApplying(false);
    }
  };

  // =========================================================================
  // BULK OPERATION: MASS UPDATE RATE, OFFER, GST, HSN, SKU, STOCK & EXPIRY
  // =========================================================================
  const productsForBulkEdit = useMemo(() => {
    if (selectedProductIds.length > 0) {
      return products.filter(p => selectedProductIds.includes(p.id || p._id));
    }
    return filteredProducts;
  }, [selectedProductIds, products, filteredProducts]);

  const handleExecuteBulkEdit = async () => {
    const targetIds = productsForBulkEdit.map(p => p.id || p._id);
    if (targetIds.length === 0) {
      alert('No products selected to update!');
      return;
    }

    const updatePayload = {};

    // Rate / Price calculation
    if (bulkPriceMode === 'set' && bulkPriceVal !== '') {
      updatePayload.price = parseFloat(bulkPriceVal) || 0;
    }
    // MRP
    if (bulkMrpMode === 'set' && bulkMrpVal !== '') {
      updatePayload.mrp = parseFloat(bulkMrpVal) || 0;
    }
    // Offer
    if (bulkOffer !== 'keep') {
      updatePayload.offer = bulkOffer === 'custom' ? (parseFloat(bulkCustomOffer) || 0) : parseFloat(bulkOffer);
      updatePayload.discount = updatePayload.offer;
    }
    // GST Rate
    if (bulkGstRate !== 'keep') {
      updatePayload.gstRate = parseFloat(bulkGstRate) || 0;
    }
    // HSN Code
    if (bulkHsnCode.trim()) {
      updatePayload.hsnCode = bulkHsnCode.trim();
    }
    // Stock / Quantity
    if (bulkQtyMode === 'set' && bulkQtyVal !== '') {
      updatePayload.quantity = parseInt(bulkQtyVal, 10) || 0;
      updatePayload.stockCount = updatePayload.quantity;
    }
    // Expiry Date
    if (bulkExpiryDate) {
      updatePayload.expiryDate = bulkExpiryDate;
    }
    // Availability
    if (bulkAvailability !== 'keep') {
      updatePayload.availability = bulkAvailability;
    }

    setIsBulkUpdating(true);
    try {
      // Optimistic updates for local state (handling relative % or amount modifications)
      setProducts(prev => prev.map(p => {
        const pId = p.id || p._id;
        if (!targetIds.includes(pId)) return p;

        let newPrice = p.price;
        if (bulkPriceMode === 'set' && bulkPriceVal !== '') {
          newPrice = parseFloat(bulkPriceVal) || 0;
        } else if (bulkPriceMode === 'inc_percent' && bulkPriceVal !== '') {
          newPrice = Math.round(p.price * (1 + (parseFloat(bulkPriceVal) || 0) / 100));
        } else if (bulkPriceMode === 'dec_percent' && bulkPriceVal !== '') {
          newPrice = Math.round(p.price * (1 - (parseFloat(bulkPriceVal) || 0) / 100));
        } else if (bulkPriceMode === 'inc_amount' && bulkPriceVal !== '') {
          newPrice = p.price + (parseFloat(bulkPriceVal) || 0);
        } else if (bulkPriceMode === 'dec_amount' && bulkPriceVal !== '') {
          newPrice = Math.max(0, p.price - (parseFloat(bulkPriceVal) || 0));
        }

        let newMrp = p.mrp;
        if (bulkMrpMode === 'set' && bulkMrpVal !== '') {
          newMrp = parseFloat(bulkMrpVal) || 0;
        } else if (bulkMrpMode === 'auto_margin') {
          newMrp = Math.round(newPrice * 1.25);
        }

        let newQty = p.quantity !== undefined ? p.quantity : (p.stockCount || 0);
        if (bulkQtyMode === 'set' && bulkQtyVal !== '') {
          newQty = parseInt(bulkQtyVal, 10) || 0;
        } else if (bulkQtyMode === 'inc' && bulkQtyVal !== '') {
          newQty = newQty + (parseInt(bulkQtyVal, 10) || 0);
        } else if (bulkQtyMode === 'dec' && bulkQtyVal !== '') {
          newQty = Math.max(0, newQty - (parseInt(bulkQtyVal, 10) || 0));
        }

        let newSku = p.sku || p.model || '';
        if (bulkSkuPrefix.trim()) {
          newSku = bulkSkuPrefix.trim() + newSku;
        }
        if (bulkSkuSuffix.trim()) {
          newSku = newSku + bulkSkuSuffix.trim();
        }

        return {
          ...p,
          ...updatePayload,
          price: newPrice,
          mrp: newMrp,
          quantity: newQty,
          stockCount: newQty,
          sku: newSku
        };
      }));

      // Call bulk update API
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkUpdate: true,
          ids: targetIds,
          updateData: updatePayload
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessToast(`Bulk updated ${targetIds.length} products with new commercials & inventory!`);
        setIsBulkEditModalOpen(false);
      } else {
        alert('Failed bulk update: ' + data.error);
        fetchProducts();
      }
    } catch (err) {
      alert('Error during bulk update: ' + err.message);
      fetchProducts();
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Excel Template Download
  const handleDownloadDemoTemplate = () => {
    try {
      const blob = generateDemoExcelFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Biomedical_Products_Template_Inventory_Commercials.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessToast('Demo Excel template downloaded successfully!');
    } catch (err) {
      alert('Error downloading template: ' + err.message);
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const companyLabel = selectedCompany === 'all' ? 'AllCompanies' : selectedCompany;
      const exportItems = selectedProductIds.length > 0
        ? products.filter(p => selectedProductIds.includes(p.id || p._id))
        : filteredProducts;

      const blob = exportProductsToExcelFile(exportItems, 'Products');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Products_Export_${companyLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessToast(`Exported ${exportItems.length} products to Excel with Commercials & Expiry!`);
    } catch (err) {
      alert('Error exporting products: ' + err.message);
    }
  };

  // Handle File / Folder Selection for Import
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => {
      const ext = f.name.toLowerCase().split('.').pop();
      return ['xlsx', 'xls', 'csv'].includes(ext);
    });

    if (validFiles.length === 0) {
      alert('No valid Excel (.xlsx, .xls) or CSV files selected.');
      return;
    }

    setImportFiles(validFiles);
    setIsParsingExcel(true);
    setParsedImportResults(null);

    try {
      const results = await parseExcelFilesList(validFiles);
      setParsedImportResults(results);
    } catch (err) {
      alert('Error parsing Excel: ' + err.message);
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Execute Import to MongoDB
  const handleExecuteImportToDb = async () => {
    if (!parsedImportResults || parsedImportResults.products.length === 0) return;

    setIsSavingImport(true);
    try {
      const preparedList = parsedImportResults.products.map(p => {
        let finalCompany = importCompanyTarget;
        if (importCompanyTarget === 'auto_detect') {
          const b = (p.brand || '').toLowerCase();
          if (b.includes('human')) finalCompany = 'human_bio';
          else if (b.includes('global')) finalCompany = 'global_bio';
          else finalCompany = 'rajbiosis';
        }

        return {
          ...p,
          companyId: finalCompany,
          assignedWebsites: importWebsiteTarget === 'all' ? ['all'] : [importWebsiteTarget],
          isVisible: true
        };
      });

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedList)
      });
      const data = await res.json();

      if (!data.success) {
        alert('Failed to import products: ' + data.error);
        return;
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
      setParsedImportResults(null);
      setSuccessToast(`Successfully imported ${data.insertedCount || preparedList.length} products into MongoDB!`);
      fetchProducts();
    } catch (err) {
      alert('Error saving import: ' + err.message);
    } finally {
      setIsSavingImport(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">

      {/* Floating Success Notification Toast */}
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

      {/* TOP METRICS & STATS STRIP (HUMAN-DESIGNED EXECUTIVE OVERVIEW) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Catalog Models */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2 font-mono">
            {products.length} <span className="text-xs font-normal text-slate-500 font-sans">Active Models</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Raj Biosis ({companyCounts.rajbiosis})</span> • 
            <span>Human ({companyCounts.human_bio})</span> • 
            <span>Global ({companyCounts.global_bio})</span>
          </div>
        </div>

        {/* Metric 2: Stock Units in Warehouse */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Stock</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {inventoryStats.totalStockUnits} <span className="text-xs font-normal text-slate-500 font-sans">Total Units</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${inventoryStats.lowStockCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            <span>{inventoryStats.lowStockCount} models low stock (&le;10)</span>
          </div>
        </div>

        {/* Metric 3: Commercials & Tax Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commercials &amp; GST</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Percent size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2 font-mono">
            18% <span className="text-xs font-normal text-slate-500 font-sans">Avg GST / HSN 9018</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bulk offers &amp; discount rates active
          </div>
        </div>

        {/* Metric 4: Expiry & Shelf Life Alerts */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expiry &amp; Batches</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              inventoryStats.expiringSoonCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2 font-mono">
            {inventoryStats.expiringSoonCount > 0 ? (
              <span className="text-amber-600">{inventoryStats.expiringSoonCount} <span className="text-xs font-normal text-slate-500 font-sans">Expiring Soon</span></span>
            ) : (
              <span className="text-emerald-600">All Valid <span className="text-xs font-normal text-slate-500 font-sans">(100%)</span></span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {inventoryStats.expiredCount > 0 ? `${inventoryStats.expiredCount} expired items` : 'Zero expired stock in catalog'}
          </div>
        </div>

      </div>

      {/* TOP COMMAND BAR: COMPANY PILLS, SEARCH & ACTIONS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Row 1: Company Switcher & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Company Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCompany('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                selectedCompany === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} className={selectedCompany === 'all' ? "text-sky-600" : "text-slate-400"} />
              <span>All Companies</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">
                {companyCounts.all}
              </span>
            </button>

            {COMPANIES.map(comp => {
              const count = companyCounts[comp.id] || 0;
              const isActive = selectedCompany === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedCompany(comp.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: comp.color }}></span>
                  <span>{comp.shortName}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? comp.badgeClass : 'bg-slate-200/70 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Bulk Word Remover Button (Direct Access) */}
            <button
              type="button"
              onClick={() => setIsBulkWordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Search and remove / replace any word across product headings"
            >
              <Scissors size={14} className="text-amber-700" />
              <span>Bulk Word Remover</span>
            </button>

            {/* Bulk Commercials & Stock Editor */}
            <button
              type="button"
              onClick={() => setIsBulkEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Bulk update Rate, Offer, GST, HSN, SKU & Stock Quantity"
            >
              <Zap size={14} className="text-indigo-600" />
              <span>Bulk Rate &amp; GST</span>
            </button>

            {/* Import Button */}
            <button
              type="button"
              onClick={() => {
                setImportCompanyTarget(selectedCompany !== 'all' ? selectedCompany : 'rajbiosis');
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            >
              <Upload size={14} className="text-slate-600" />
              <span>Import Excel / Folder</span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportToExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            >
              <Download size={14} className="text-slate-600" />
              <span>Export ({selectedProductIds.length > 0 ? selectedProductIds.length : filteredProducts.length})</span>
            </button>

            {/* Add Product (Primary CTA) */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm shadow-sky-500/25"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>

          </div>
        </div>

        {/* Row 2: Search Bar & Quick View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Model, SKU, HSN Code, Brand, Category, Technical Specs..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Mode Toggle (Large Image vs Compact) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/70 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('large')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'large'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Large high-clarity product images"
            >
              <Maximize2 size={13} />
              <span>Large Image View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'compact'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact table row view"
            >
              <Layers size={13} />
              <span>Compact View</span>
            </button>
          </div>

        </div>

        {/* Row 3: Multi-Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          
          {/* 1. Category Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory('all');
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400 truncate"
            >
              <option value="all">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 2. Subcategory Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Subcategory:
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={uniqueSubCategories.length === 0}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400 truncate disabled:opacity-50"
            >
              <option value="all">All Subcategories ({uniqueSubCategories.length})</option>
              {uniqueSubCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* 3. Stock & Expiry Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Stock &amp; Expiry Filter:
            </label>
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400 truncate"
            >
              <option value="all">All Inventory Status</option>
              <option value="in_stock">🟢 In Stock (&gt;0 units)</option>
              <option value="low_stock">🟡 Low Stock (&le;10 units)</option>
              <option value="out_of_stock">🔴 Out of Stock (0 units)</option>
              <option value="expiring_soon">⏳ Expiring Soon (&lt;90 Days)</option>
              <option value="expired">⚠️ Expired Products</option>
            </select>
          </div>

          {/* 4. Target Website Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Publish Website:
            </label>
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className={`w-full px-2.5 py-1.5 border rounded-xl font-mono text-xs outline-none transition truncate ${
                selectedWebsite !== 'all' 
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">🌐 All Websites (Multi-Site)</option>
              {companyWebsites.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* 5. Visibility Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {selectedWebsite === 'all' ? 'Visibility Status:' : `Visibility on ${selectedWebsite}:`}
            </label>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400"
            >
              <option value="all">All Visibility ({filteredProducts.length})</option>
              <option value="visible">
                {selectedWebsite === 'all' ? '🟢 Live / Published' : `🟢 Visible on ${selectedWebsite}`}
              </option>
              <option value="hidden">
                {selectedWebsite === 'all' ? '⚪ Hidden from Web' : `⚪ Hidden from ${selectedWebsite}`}
              </option>
            </select>
          </div>

        </div>

      </div>

      {/* Website Mode Active Banner */}
      {selectedWebsite !== 'all' && (
        <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">Website Filter Mode:</span>
                <span className="font-mono text-xs font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                  {selectedWebsite}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedWebsite('all')}
                  className="text-[10px] text-sky-600 hover:text-sky-800 hover:underline cursor-pointer font-medium"
                >
                  (Back to All Websites)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Niche product ke saamne button par click karke aap use directly <strong>{selectedWebsite}</strong> par live ya hide kar sakte hain.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleBulkToggleForWebsite(selectedWebsite, true)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              ✓ Show All on {selectedWebsite}
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggleForWebsite(selectedWebsite, false)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              ✕ Hide All from {selectedWebsite}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRODUCTS DATA TABLE (CLEAN, HUMAN-CRAFTED, SPACIOUS & RICH)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Subheader with Counter & Selection Controls */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {allFilteredSelected ? (
                <CheckSquare size={16} className="text-sky-600" />
              ) : (
                <Square size={16} className="text-slate-400" />
              )}
              <span>Select All Filtered ({filteredProducts.length})</span>
            </button>

            {selectedProductIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold font-mono text-[11px]">
                {selectedProductIds.length} Selected
              </span>
            )}

            <span>Showing <strong className="text-slate-800 font-mono">{filteredProducts.length}</strong> of {products.length} models</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadDemoTemplate}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Excel Template</span>
            </button>

            <button
              type="button"
              onClick={fetchProducts}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer font-medium"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin text-sky-500" : ""} />
              <span>Refresh Atlas</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/70">
                <th className="py-4 px-4 w-[4%] text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 w-[42%]">Product &amp; Model Specs</th>
                <th className="py-4 px-4 w-[18%]">Inventory &amp; Expiry</th>
                <th className="py-4 px-4 w-[18%]">Commercials &amp; Tax</th>
                <th className="py-4 px-4 w-[10%]">Channels</th>
                <th className="py-4 px-4 w-[8%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 font-medium text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <RefreshCw size={26} className="animate-spin mx-auto mb-2 text-sky-500" />
                    <span className="font-semibold text-slate-600">Loading products from MongoDB Atlas cluster...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Package size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No Products Found</h4>
                      <p className="text-xs text-slate-400">
                        {searchQuery || selectedCategory !== 'all' || selectedCompany !== 'all' || selectedStockFilter !== 'all'
                          ? 'Try clearing the search query or changing company / category / stock filters.'
                          : 'No products added yet. Click "+ Add Product" or import an Excel file.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenAddModal}
                          className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold shadow-xs hover:bg-sky-600 transition cursor-pointer"
                        >
                          + Add Product Manually
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportCompanyTarget(selectedCompany !== 'all' ? selectedCompany : 'rajbiosis');
                            setIsImportModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-200"
                        >
                          Import from Excel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const pId = p.id || p._id;
                  const isSelected = selectedProductIds.includes(pId);
                  const isLive = p.isVisible !== false;

                  const rawImages = p.images || p.image || '';
                  const imagesArray = rawImages ? rawImages.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const mainImage = imagesArray[0] || '';
                  const extraImagesCount = imagesArray.length > 1 ? imagesArray.length - 1 : 0;

                  const qty = typeof p.quantity === 'number' ? p.quantity : (parseInt(p.quantity || p.stockCount || 0, 10) || 0);
                  const expStatus = getExpiryStatus(p.expiryDate);
                  const mrpVal = p.mrp || (p.price ? Math.round(Number(p.price) * 1.25) : 0);
                  const offerVal = p.offer !== undefined ? p.offer : (p.discount !== undefined ? p.discount : 15);
                  const gstVal = p.gstRate !== undefined ? p.gstRate : 18;
                  const hsnVal = p.hsnCode || '9018';
                  const skuVal = p.sku || p.model || 'N/A';
                  const compObj = COMPANIES.find(c => c.id === p.companyId) || COMPANIES[0];

                  return (
                    <tr 
                      key={pId} 
                      className={`hover:bg-slate-50/80 transition border-b border-slate-100/70 ${
                        isSelected ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(pId)}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail (LARGE SIZE) & Identity */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-4">
                          
                          {/* Image Box (Large & High Definition) */}
                          <div
                            onClick={() => {
                              setPreviewImageProduct(p);
                              setPreviewActiveImgIdx(0);
                            }}
                            className={`rounded-2xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden hover:border-sky-400 hover:shadow-md transition cursor-pointer group relative ${
                              viewMode === 'large' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16'
                            }`}
                            title="Click to view full image gallery"
                          >
                            {mainImage ? (
                              <img 
                                src={mainImage} 
                                alt={p.title} 
                                className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <Package size={viewMode === 'large' ? 32 : 22} className="text-slate-300" />
                            )}

                            {/* Multiple Images Badge */}
                            {extraImagesCount > 0 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-bold backdrop-blur-xs">
                                +{extraImagesCount}
                              </span>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-sky-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-2xl">
                              <Eye size={18} className="text-white drop-shadow" />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="min-w-0 flex-1 pr-2">
                            
                            {/* Badges: Company & Brand */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${compObj.badgeClass}`}>
                                {compObj.shortName}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {p.brand || compObj.shortName}
                              </span>
                              {p.category && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {p.category} {p['sub category'] ? `› ${p['sub category']}` : ''}
                                </span>
                              )}
                            </div>

                            {/* Product Title (Interactive Click to preview) */}
                            <h4 
                              className="font-bold text-slate-900 text-sm leading-snug hover:text-sky-600 cursor-pointer transition"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                              title={p.title}
                              onClick={() => {
                                setPreviewImageProduct(p);
                                setPreviewActiveImgIdx(0);
                              }}
                            >
                              {p.title}
                            </h4>

                            {/* SKU & Model */}
                            <div className="text-[11px] text-slate-400 font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                              <span>SKU: <strong className="text-slate-700 font-semibold">{skuVal}</strong></span>
                              {p.model && p.model !== skuVal && (
                                <span>Model: <strong className="text-slate-600">{p.model}</strong></span>
                              )}
                            </div>

                          </div>
                        </div>
                      </td>

                      {/* Inventory & Expiry Column */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2">
                          
                          {/* Stock Quantity Stepper */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(p, -1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                title="Decrease stock -1"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="px-2.5 py-1 text-xs font-bold font-mono text-slate-800 min-w-[32px] text-center bg-slate-50/50">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdjustQuantity(p, 1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                title="Increase stock +1"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              qty > 10 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
                                : qty > 0 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/70' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                            }`}>
                              {qty > 10 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Expiry Date Badge */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${expStatus.badgeClass}`}>
                              <Calendar size={10} />
                              <span>{expStatus.text}</span>
                            </span>
                            {p.batchNo && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Lot: {p.batchNo}
                              </span>
                            )}
                          </div>

                        </div>
                      </td>

                      {/* Commercials, Pricing & Tax Column */}
                      <td className="py-4 px-4 align-top font-mono">
                        <div className="space-y-1">
                          
                          {/* Selling Price / Rate */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">
                              {p.price > 0 ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Contact for Quote'}
                            </span>
                            {offerVal > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-sans text-[10px] font-bold">
                                {offerVal}% OFF
                              </span>
                            )}
                          </div>

                          {/* MRP */}
                          {mrpVal > p.price && (
                            <div className="text-[11px] text-slate-400">
                              MRP: <span className="line-through">₹{Number(mrpVal).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {/* GST & HSN Code */}
                          <div className="text-[10px] text-slate-500 font-sans flex items-center gap-2 pt-0.5">
                            <span className="font-semibold text-slate-700 font-mono">+{gstVal}% GST</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">HSN: {hsnVal}</span>
                          </div>

                        </div>
                      </td>

                      {/* Channels / Websites Distribution */}
                      <td className="py-4 px-4 align-top">
                        {(() => {
                          const sites = getWebsitesForCompany(p.companyId);
                          const liveCount = sites.filter(s => isVisibleOnSite(p, s)).length;

                          return (
                            <div className="space-y-1.5">
                              <button
                                type="button"
                                onClick={() => setQuickWebsiteProduct(p)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                                title="Click to manage website distribution"
                              >
                                <Globe size={12} className={liveCount > 0 ? "text-emerald-600" : "text-slate-400"} />
                                <span>{liveCount}/{sites.length} Live</span>
                              </button>
                              <div className="text-[10px] text-slate-400">
                                {isLive ? '🟢 Globally Active' : '⚪ Hidden Globally'}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* 1. Edit Product */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer shadow-2xs"
                            title="Edit product details, price, inventory & specs"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* 2. View 18 Specs */}
                          <button
                            type="button"
                            onClick={() => setViewingSpecsProduct(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer border border-slate-200/80 shadow-2xs"
                            title="View all 18 clinical & technical specs"
                          >
                            <Eye size={14} />
                          </button>

                          {/* 3. Delete Product */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shadow-2xs"
                            title="Permanently delete product"
                          >
                            <Trash2 size={14} />
                          </button>

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

      {/* =========================================================================
          FLOATING STICKY BULK ACTIONS BAR (ACTIVATES UPON SELECTION)
          ========================================================================= */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-3 px-6 shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 flex-wrap">
          
          {/* Selection Counter & Clear */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold font-mono">
              {selectedProductIds.length} Products Selected
            </span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer ml-1"
            >
              Clear
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block"></div>

          {/* Action 1: Bulk Word Remover from Headings (User Request) */}
          <button
            type="button"
            onClick={() => setIsBulkWordModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Scissors size={14} />
            <span>Remove / Replace Word in Headings</span>
          </button>

          {/* Action 2: Bulk Commercials & Stock Editor (User Request) */}
          <button
            type="button"
            onClick={() => setIsBulkEditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Zap size={14} />
            <span>Update Rate, GST, HSN &amp; Stock</span>
          </button>

          {/* Action 3: Bulk Export */}
          <button
            type="button"
            onClick={handleExportToExcel}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Download size={13} />
            <span>Export Selected</span>
          </button>

          {/* Action 4: Bulk Delete */}
          <button
            type="button"
            onClick={handleExecuteBulkDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-rose-500/30"
          >
            <Trash2 size={13} />
            <span>Delete Selected</span>
          </button>

        </div>
      )}

      {/* =========================================================================
          MODAL 1: BULK WORD REMOVER & REPLACER IN HEADINGS / TITLES (USER SPECIAL)
          ========================================================================= */}
      {isBulkWordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl my-auto text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200 shadow-2xs">
                  <Scissors size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Bulk Title Word Remover &amp; Replacer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selected products ke title me se koi bhi word search karke turant remove ya replace karein.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsBulkWordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Controls */}
            <div className="space-y-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  1. Search Word to Remove from Headings *
                </label>
                <input
                  type="text"
                  value={wordToRemove}
                  onChange={(e) => setWordToRemove(e.target.value)}
                  placeholder="e.g. Turbine, 500mA, Refurbished, Pro-X9..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  autoFocus
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ye word heading me se cut ho jayega aur extra spaces automatically clean ho jayenge.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    2. Replace With (Leave empty to simply REMOVE)
                  </label>
                  <input
                    type="text"
                    value={replaceWithWord}
                    onChange={(e) => setReplaceWithWord(e.target.value)}
                    placeholder="Optional replacement word..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={isMatchCase}
                      onChange={(e) => setIsMatchCase(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Match Exact Case (Case Sensitive)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Preview List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Live Preview: {wordRemovalPreviews.length} Products Affected
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {productsForWordRemoval.length} products
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-slate-200 p-2.5 bg-slate-50/50">
                {wordRemovalPreviews.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    {wordToRemove.trim() 
                      ? `No product titles contain the word "${wordToRemove}".` 
                      : 'Type a word above to see live before/after changes.'}
                  </div>
                ) : (
                  wordRemovalPreviews.map(item => (
                    <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="text-[11px] text-rose-600 line-through">
                        {item.originalTitle}
                      </div>
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>{item.newTitle}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkWordModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!wordToRemove.trim() || wordRemovalPreviews.length === 0 || isWordRemovalApplying}
                onClick={handleExecuteBulkWordRemoval}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isWordRemovalApplying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Applying Changes to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Apply Word Removal ({wordRemovalPreviews.length} Products)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BULK COMMERCIALS & INVENTORY EDITOR (RATE, OFFER, GST, HSN, SKU, STOCK)
          ========================================================================= */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl my-auto text-xs max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200 shadow-2xs">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Bulk Commercials, Tax &amp; Inventory Editor
                  </h3>
                  <p className="text-xs text-slate-400">
                    Updating <strong>{productsForBulkEdit.length}</strong> selected products simultaneously in MongoDB.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsBulkEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. SELLING PRICE / RATE */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>1. Selling Price / Rate (₹)</span>
                  <span className="text-[10px] text-slate-400">Commercials</span>
                </label>
                <select
                  value={bulkPriceMode}
                  onChange={(e) => setBulkPriceMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  <option value="keep">Keep Current Prices</option>
                  <option value="set">Set Fixed Price for All</option>
                  <option value="inc_percent">Increase by Percentage (+%)</option>
                  <option value="dec_percent">Decrease by Percentage (-%)</option>
                  <option value="inc_amount">Increase by Amount (+₹)</option>
                  <option value="dec_amount">Decrease by Amount (-₹)</option>
                </select>
                {bulkPriceMode !== 'keep' && (
                  <input
                    type="number"
                    value={bulkPriceVal}
                    onChange={(e) => setBulkPriceVal(e.target.value)}
                    placeholder={bulkPriceMode === 'set' ? 'e.g. 485000' : 'e.g. 10'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                )}
              </div>

              {/* 2. MRP & MARGIN */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>2. Maximum Retail Price (MRP)</span>
                  <span className="text-[10px] text-slate-400">List Price</span>
                </label>
                <select
                  value={bulkMrpMode}
                  onChange={(e) => setBulkMrpMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  <option value="keep">Keep Current MRP</option>
                  <option value="auto_margin">Auto Calculate MRP (+25% over Selling Price)</option>
                  <option value="set">Set Fixed MRP for All</option>
                </select>
                {bulkMrpMode === 'set' && (
                  <input
                    type="number"
                    value={bulkMrpVal}
                    onChange={(e) => setBulkMrpVal(e.target.value)}
                    placeholder="e.g. 650000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                )}
              </div>

              {/* 3. OFFER / DISCOUNT PERCENTAGE */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>3. Offer / Discount Badge</span>
                  <span className="text-[10px] text-emerald-600 font-bold">% Discount</span>
                </label>
                <select
                  value={bulkOffer}
                  onChange={(e) => setBulkOffer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  <option value="keep">Keep Current Offer %</option>
                  <option value="5">5% OFF</option>
                  <option value="10">10% OFF</option>
                  <option value="15">15% OFF</option>
                  <option value="20">20% OFF</option>
                  <option value="25">25% OFF</option>
                  <option value="30">30% OFF</option>
                  <option value="custom">Custom Offer %</option>
                </select>
                {bulkOffer === 'custom' && (
                  <input
                    type="number"
                    value={bulkCustomOffer}
                    onChange={(e) => setBulkCustomOffer(e.target.value)}
                    placeholder="Enter custom discount %"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                )}
              </div>

              {/* 4. GST TAX RATE & HSN CODE */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>4. GST Rate &amp; HSN Code</span>
                  <span className="text-[10px] text-indigo-600 font-bold">Tax Compliance</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={bulkGstRate}
                    onChange={(e) => setBulkGstRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold font-mono"
                  >
                    <option value="keep">GST: Keep Current</option>
                    <option value="0">0% GST (Exempt)</option>
                    <option value="5">5% GST (Standard Medical)</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard Devices)</option>
                    <option value="28">28% GST</option>
                  </select>
                  <input
                    type="text"
                    value={bulkHsnCode}
                    onChange={(e) => setBulkHsnCode(e.target.value)}
                    placeholder="HSN Code (e.g. 9018)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* 5. INVENTORY QUANTITY (STOCK) */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>5. Stock Units (Quantity)</span>
                  <span className="text-[10px] text-slate-400">Warehouse Units</span>
                </label>
                <select
                  value={bulkQtyMode}
                  onChange={(e) => setBulkQtyMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  <option value="keep">Keep Current Stock</option>
                  <option value="set">Set Exact Stock Quantity</option>
                  <option value="inc">Add (+ Units)</option>
                  <option value="dec">Subtract (- Units)</option>
                </select>
                {bulkQtyMode !== 'keep' && (
                  <input
                    type="number"
                    value={bulkQtyVal}
                    onChange={(e) => setBulkQtyVal(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                )}
              </div>

              {/* 6. EXPIRY DATE & AVAILABILITY */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold flex items-center justify-between">
                  <span>6. Expiry Date &amp; Availability</span>
                  <span className="text-[10px] text-slate-400">Batch Validity</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={bulkExpiryDate}
                    onChange={(e) => setBulkExpiryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-xs"
                  />
                  <select
                    value={bulkAvailability}
                    onChange={(e) => setBulkAvailability(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs"
                  >
                    <option value="keep">Keep Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* 7. SKU PREFIX / SUFFIX */}
              <div className="sm:col-span-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-slate-800 font-bold block">
                  7. SKU Batch Tagging (Optional Prefix / Suffix)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={bulkSkuPrefix}
                    onChange={(e) => setBulkSkuPrefix(e.target.value)}
                    placeholder="Add SKU Prefix (e.g. RB-)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                  <input
                    type="text"
                    value={bulkSkuSuffix}
                    onChange={(e) => setBulkSkuSuffix(e.target.value)}
                    placeholder="Add SKU Suffix (e.g. -2026)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={handleExecuteBulkEdit}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isBulkUpdating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Updating MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Apply Updates to {productsForBulkEdit.length} Products</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD / EDIT PRODUCT MODAL (COMPLETE WITH ALL FIELDS & TABS)
          ========================================================================= */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl my-auto text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-500/20">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Biomedical Product to MongoDB'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set complete commercial pricing, GST, HSN, Stock quantity, and Batch Expiry dates.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Section Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/70 overflow-x-auto">
              {[
                { id: 'basic', label: '1. Identity & Brand' },
                { id: 'pricing', label: '2. Pricing, GST & HSN' },
                { id: 'inventory', label: '3. Stock & Expiry' },
                { id: 'media', label: '4. Images & Media' },
                { id: 'specs', label: '5. Technical Specs' },
                { id: 'websites', label: '6. Website Publishing' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAddEditTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    addEditTab === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-5">

              {/* TAB 1: BASIC & BRAND */}
              {addEditTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Parent Company *</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      >
                        {COMPANIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g. Raj Biosis OEM"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Title / Heading *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. RajBiosis-Vent Pro-X9 Mechanical Ventilator"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-bold text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. ICU & Critical Care"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="e.g. Mechanical Ventilators"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Model Code</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="e.g. PRO-X9-TURBINE"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">SKU Code</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. RAJ-ICU-8801"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="Brief overview of clinical performance, hospital benefits, and warranty..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING, GST & HSN */}
              {addEditTab === 'pricing' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Selling Rate / Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 485000"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-extrabold text-sm outline-none focus:bg-white focus:border-sky-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Maximum Retail Price MRP (₹)</label>
                      <input
                        type="number"
                        value={formData.mrp}
                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                        placeholder="e.g. 650000"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Offer / Discount (%)</label>
                      <input
                        type="number"
                        value={formData.offer}
                        onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                        placeholder="e.g. 15"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">GST Tax Rate (%)</label>
                      <select
                        value={formData.gstRate}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      >
                        <option value="0">0% GST (Exempted)</option>
                        <option value="5">5% GST (Standard Consumables)</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Medical Hardware &amp; Devices)</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">HSN Code (Indian Tax Code)</label>
                      <input
                        type="text"
                        value={formData.hsnCode}
                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        placeholder="e.g. 9018 (Medical, Surgical Instruments)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STOCK & EXPIRY */}
              {addEditTab === 'inventory' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Stock Quantity (Units) *</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="e.g. 25"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-sky-400"
                        required
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        If 0 units, product status switches to Out of Stock.
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Stock Availability Status</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      >
                        <option value="In Stock">In Stock (Dispatch in 24h)</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Made to Order">Made to Order (10-15 Days)</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Expiry Date / Shelf Life Validity</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Batch / Lot Number</label>
                      <input
                        type="text"
                        value={formData.batchNo}
                        onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                        placeholder="e.g. LOT-2026-X9"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & ASSETS */}
              {addEditTab === 'media' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Product Images (Comma separated URLs for multiple pictures)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>

                  {/* Image Previews */}
                  {formData.images && (
                    <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {formData.images.split(',').map((u, i) => u.trim()).filter(Boolean).map((url, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0 overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Product Demonstration Video URL</label>
                      <input
                        type="text"
                        value={formData.video}
                        onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Product PDF Datasheet Brochure URL</label>
                      <input
                        type="text"
                        value={formData.pdf}
                        onChange={(e) => setFormData({ ...formData, pdf: e.target.value })}
                        placeholder="https://example.com/datasheet.pdf"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CLINICAL SPECS */}
              {addEditTab === 'specs' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Capacity</label>
                      <input
                        type="text"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        placeholder="e.g. 20 ml to 2000 ml"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Throughput</label>
                      <input
                        type="text"
                        value={formData.throughput}
                        onChange={(e) => setFormData({ ...formData, throughput: e.target.value })}
                        placeholder="e.g. 300 tests / hour"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Compatible Instrument</label>
                      <input
                        type="text"
                        value={formData.instrument}
                        onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                        placeholder="e.g. Central Turbine / 415V"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Intended Usage</label>
                      <input
                        type="text"
                        value={formData.usage}
                        onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                        placeholder="e.g. ICU & Emergency"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Automation Type</label>
                      <input
                        type="text"
                        value={formData.automation}
                        onChange={(e) => setFormData({ ...formData, automation: e.target.value })}
                        placeholder="e.g. Fully Automated"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Size / Dimensions</label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        placeholder="e.g. 1420 x 580 x 640 mm"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Parameters &amp; Tests</label>
                    <input
                      type="text"
                      value={formData.parameters}
                      onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                      placeholder="e.g. VCV, PCV, SIMV, SpO2, EtCO2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: WEBSITES PUBLISHING */}
              {addEditTab === 'websites' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">Global Website Visibility:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${formData.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {formData.isVisible ? 'Live / Published' : 'Hidden from Web'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedWebsites.includes('all')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, assignedWebsites: ['all'] });
                          } else {
                            setFormData({ ...formData, assignedWebsites: [] });
                          }
                        }}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="font-bold text-slate-800">Publish on All Websites of Parent Company</span>
                    </label>

                    {!formData.assignedWebsites.includes('all') && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-600 block">Pick specific domains:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getWebsitesForCompany(formData.companyId).map(site => {
                            const isChecked = formData.assignedWebsites.includes(site);
                            return (
                              <label key={site} className="flex items-center gap-2 text-xs text-slate-700 font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, assignedWebsites: [...formData.assignedWebsites.filter(w => w !== 'all'), site] });
                                    } else {
                                      setFormData({ ...formData, assignedWebsites: formData.assignedWebsites.filter(w => w !== site) });
                                    }
                                  }}
                                  className="w-3.5 h-3.5 rounded text-sky-600"
                                />
                                <span>{site}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Navigation & Submit Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {addEditTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'pricing', 'inventory', 'media', 'specs', 'websites'];
                        const idx = tabs.indexOf(addEditTab);
                        if (idx > 0) setAddEditTab(tabs[idx - 1]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      &larr; Back
                    </button>
                  )}

                  {addEditTab !== 'websites' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'pricing', 'inventory', 'media', 'specs', 'websites'];
                        const idx = tabs.indexOf(addEditTab);
                        if (idx < tabs.length - 1) setAddEditTab(tabs[idx + 1]);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold transition shadow-sm shadow-sky-500/25 cursor-pointer flex items-center gap-2"
                  >
                    <Check size={15} />
                    <span>{editingProduct ? 'Save Changes' : 'Save Product to MongoDB'}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: FULL-SIZE INTERACTIVE IMAGE GALLERY PREVIEW MODAL
          ========================================================================= */}
      {previewImageProduct && (() => {
        const rawImages = previewImageProduct.images || previewImageProduct.image || '';
        const imageList = rawImages
          ? rawImages.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        const activeImageUrl = imageList[previewActiveImgIdx] || imageList[0] || '';
        const companyObj = COMPANIES.find(c => c.id === previewImageProduct.companyId) || COMPANIES[0];

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewImageProduct(null);
            }}
          >
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto animate-in zoom-in-95 duration-200 text-xs">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <Eye size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${companyObj.badgeClass}`}>
                        {companyObj.shortName}
                      </span>
                      {previewImageProduct.model && (
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          Model: {previewImageProduct.model}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 truncate mt-0.5" title={previewImageProduct.title}>
                      {previewImageProduct.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {activeImageUrl && (
                    <a
                      href={activeImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                      title="Open full resolution in new tab"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewImageProduct(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Image Showcase */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center min-h-[320px] max-h-[460px] relative overflow-hidden group">
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt={previewImageProduct.title}
                    className="max-h-[420px] max-w-full object-contain rounded-xl shadow-xs transition duration-300 group-hover:scale-[1.02]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <Package size={48} className="text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No Image Available</p>
                  </div>
                )}
              </div>

              {/* Multiple Images Carousel Thumbnails */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                    Images ({imageList.length}):
                  </span>
                  {imageList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewActiveImgIdx(idx)}
                      className={`w-14 h-14 rounded-xl border-2 p-0.5 overflow-hidden shrink-0 transition cursor-pointer ${
                        previewActiveImgIdx === idx
                          ? 'border-sky-500 ring-2 ring-sky-200 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Key Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Selling Price</span>
                  <span className="font-bold text-emerald-600 block mt-0.5 font-mono">
                    {previewImageProduct.price ? `₹${Number(previewImageProduct.price).toLocaleString('en-IN')}` : 'Quote'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock Units</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {previewImageProduct.quantity || 0} Units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">GST &amp; HSN</span>
                  <span className="font-semibold text-slate-700 block mt-0.5 font-mono">
                    +{previewImageProduct.gstRate || 18}% (HSN {previewImageProduct.hsnCode || '9018'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Expiry Date</span>
                  <span className="font-semibold text-slate-700 block mt-0.5 font-mono">
                    {previewImageProduct.expiryDate || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons in Modal Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const prod = previewImageProduct;
                    setPreviewImageProduct(null);
                    setViewingSpecsProduct(prod);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={14} className="text-slate-600" />
                  <span>View All 18 Specs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prod = previewImageProduct;
                    setPreviewImageProduct(null);
                    handleOpenEditModal(prod);
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>Edit Product</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL 5: 18 SPECIFICATIONS VIEWER MODAL
          ========================================================================= */}
      {viewingSpecsProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl my-auto text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <img 
                    src={viewingSpecsProduct.images?.split(',')[0] || ''} 
                    alt={viewingSpecsProduct.title} 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{viewingSpecsProduct.title}</h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    SKU: {viewingSpecsProduct.sku || 'N/A'} • Brand: {viewingSpecsProduct.brand}
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewingSpecsProduct(null)} 
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 18 Columns Key-Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Selling Rate (₹)</span>
                <span className="text-sm font-bold font-mono text-slate-800">
                  {viewingSpecsProduct.price > 0 ? `₹${Number(viewingSpecsProduct.price).toLocaleString('en-IN')}` : 'Contact for Quote'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tax &amp; HSN</span>
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  +{viewingSpecsProduct.gstRate || 18}% GST • HSN: {viewingSpecsProduct.hsnCode || '9018'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Stock Quantity &amp; Expiry</span>
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  {viewingSpecsProduct.quantity || 0} Units • Exp: {viewingSpecsProduct.expiryDate || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                <span className="text-xs font-semibold text-slate-700">
                  {viewingSpecsProduct.category} {viewingSpecsProduct['sub category'] ? `› ${viewingSpecsProduct['sub category']}` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.capacity || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Throughput</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.throughput || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compatible Instrument</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.instrument || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Parameters</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.parameters || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Automation Type</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.automation || 'Standard'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Size / Dimensions</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.size || 'N/A'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Description</span>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {viewingSpecsProduct.desc || 'No description provided.'}
              </p>
            </div>

            {/* Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {viewingSpecsProduct.pdf && (
                <a
                  href={viewingSpecsProduct.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileText size={13} className="text-rose-600" />
                  <span>View PDF Brochure</span>
                  <ExternalLink size={11} />
                </a>
              )}
              {viewingSpecsProduct.video && (
                <a
                  href={viewingSpecsProduct.video}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Video size={13} className="text-indigo-600" />
                  <span>Watch Video</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSpecsProduct(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: QUICK WEBSITE VISIBILITY CONTROL MODAL
          ========================================================================= */}
      {quickWebsiteProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-auto text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Website Visibility Control</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{quickWebsiteProduct.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setQuickWebsiteProduct(null); setWebsiteModalSearch(''); }} 
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of Websites */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {getWebsitesForCompany(quickWebsiteProduct.companyId).map(site => {
                const isLive = isVisibleOnSite(quickWebsiteProduct, site);
                return (
                  <div
                    key={site}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      isLive 
                        ? 'bg-emerald-50/40 border-emerald-200/80' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <span className={`font-mono text-xs truncate ${isLive ? 'font-bold text-slate-800' : 'text-slate-400 line-through'}`}>
                        {site}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleWebsiteVisibility(quickWebsiteProduct, site)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isLive
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs hover:bg-emerald-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {isLive ? '🟢 Live on Web' : '⚪ Hidden'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setQuickWebsiteProduct(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: EXCEL MULTI-IMPORT MODAL
          ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl my-auto text-xs">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shadow-2xs">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Import Products from Excel Sheets / Folders
                  </h3>
                  <p className="text-xs text-slate-400">
                    Supports Excel (.xlsx, .xls, .csv) with rate, GST, HSN, stock quantity, and expiry dates.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Assign Imported Products To Company:
                </label>
                <select
                  value={importCompanyTarget}
                  onChange={(e) => setImportCompanyTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-sky-400"
                >
                  <option value="rajbiosis">Raj Biosis Private Limited</option>
                  <option value="human_bio">Human Biomedicals</option>
                  <option value="global_bio">Global Biomedical</option>
                  <option value="auto_detect">⚡ Auto-Detect Company from &quot;brand&quot; Column</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Default Website Visibility:
                </label>
                <select
                  value={importWebsiteTarget}
                  onChange={(e) => setImportWebsiteTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-sky-400"
                >
                  <option value="all">Show on All Websites of Target Company</option>
                  {companyWebsites.map(w => (
                    <option key={w} value={w}>Specific: {w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File & Folder Upload Drop Area */}
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-4 bg-slate-50/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileSpreadsheet size={24} />
              </div>

              <div>
                <div className="font-bold text-sm text-slate-800">
                  Select Excel Files or an Entire Folder
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Files should have a sheet named <strong>&quot;Products&quot;</strong>. Multiple files supported.
                </p>
              </div>

              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFilesSelected} 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={folderInputRef} 
                webkitdirectory="true" 
                directory="true" 
                multiple 
                onChange={handleFilesSelected} 
                className="hidden" 
              />

              <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>Choose Multiple Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <FolderUp size={15} className="text-indigo-600" />
                  <span>Upload Entire Folder</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Don&apos;t have the format?{' '}
                <button 
                  type="button" 
                  onClick={handleDownloadDemoTemplate}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Download Sample Demo Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Parsing Progress */}
            {isParsingExcel && (
              <div className="p-4 bg-sky-50 text-sky-800 rounded-2xl flex items-center justify-center gap-2 font-semibold">
                <RefreshCw size={16} className="animate-spin text-sky-600" />
                <span>Reading and validating Excel sheets...</span>
              </div>
            )}

            {/* Parse Summary */}
            {parsedImportResults && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">
                        {parsedImportResults.products.length} Products Extracted from {importFiles.length} File(s)
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Mapped columns cleanly. Ready to save to MongoDB.
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-3 py-1 rounded-xl">
                    {parsedImportResults.products.length} Items
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase">
                        <th className="p-2">Title</th>
                        <th className="p-2">Rate (₹)</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Model / SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {parsedImportResults.products.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-slate-900 truncate max-w-[200px]">{p.title}</td>
                          <td className="p-2 font-mono">₹{p.price?.toLocaleString('en-IN')}</td>
                          <td className="p-2 font-mono">{p.quantity || 25}</td>
                          <td className="p-2 truncate max-w-[120px]">{p.category}</td>
                          <td className="p-2 font-mono">{p.model || p.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={!parsedImportResults || parsedImportResults.products.length === 0 || isSavingImport}
                onClick={handleExecuteImportToDb}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition shadow-sm shadow-emerald-500/25 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingImport ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving to MongoDB Atlas...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Confirm &amp; Import {parsedImportResults ? parsedImportResults.products.length : 0} Products</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
