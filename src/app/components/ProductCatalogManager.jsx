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
  HelpCircle
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
    defaultWebsites: ['rajbiosis.com', 'cardiopulse.in', 'laparovision.com']
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
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingSpecsProduct, setViewingSpecsProduct] = useState(null);
  const [quickWebsiteProduct, setQuickWebsiteProduct] = useState(null);
  const [previewImageProduct, setPreviewImageProduct] = useState(null);
  const [previewActiveImgIdx, setPreviewActiveImgIdx] = useState(0);
  const [websiteModalSearch, setWebsiteModalSearch] = useState('');

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
    price: '',
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
      const timer = setTimeout(() => setSuccessToast(null), 4000);
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
    // If globally turned off
    if (p.isVisible === false) return false;
    // If explicitly marked hidden for this website
    if (Array.isArray(p.hiddenWebsites) && p.hiddenWebsites.includes(siteDomain)) {
      return false;
    }
    if (p.websiteVisibility && p.websiteVisibility[siteDomain] === false) {
      return false;
    }
    // If assignedWebsites does not include 'all' and does not include siteDomain
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

  // Filtered Products (Strict Website-Level & General Filters)
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
      
      // Website & Visibility Filter
      if (selectedWebsite !== 'all') {
        const isLiveOnSite = isVisibleOnSite(p, selectedWebsite);
        if (selectedVisibility === 'visible' && !isLiveOnSite) {
          return false;
        }
        if (selectedVisibility === 'hidden' && isLiveOnSite) {
          return false;
        }
      } else {
        // All Websites Selected
        if (selectedVisibility === 'visible' && p.isVisible === false) {
          return false;
        }
        if (selectedVisibility === 'hidden' && p.isVisible !== false) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
        const modelMatch = (p.model || p.sku || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const subCatMatch = (p['sub category'] || p.subCategory || '').toLowerCase().includes(q);
        const descMatch = (p.desc || p.shortDesc || '').toLowerCase().includes(q);
        if (!titleMatch && !modelMatch && !brandMatch && !catMatch && !subCatMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCompany, selectedProductType, selectedCategory, selectedSubCategory, selectedWebsite, selectedVisibility, searchQuery]);

  // Company Counts
  const companyCounts = useMemo(() => {
    return {
      all: products.length,
      rajbiosis: products.filter(p => p.companyId === 'rajbiosis').length,
      human_bio: products.filter(p => p.companyId === 'human_bio').length,
      global_bio: products.filter(p => p.companyId === 'global_bio').length,
    };
  }, [products]);

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
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: updatedVisibility } : p));
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
        // Rollback
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: !updatedVisibility } : p));
        alert('Failed to update product visibility in MongoDB: ' + data.error);
      } else {
        setSuccessToast(`Product "${product.title}" is now globally ${updatedVisibility ? 'Live / Visible' : 'Hidden from Websites'}`);
      }
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: !updatedVisibility } : p));
      alert('Network error updating visibility: ' + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to permanently delete product "${product.title}" from MongoDB?`)) {
      return;
    }
    // Optimistic remove
    setProducts(prev => prev.filter(p => p.id !== product.id && p._id !== product._id));
    try {
      const queryId = product._id || product.id;
      const res = await fetch(`/api/products?id=${encodeURIComponent(queryId)}`, {
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

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      price: '',
      desc: '',
      capacity: '',
      throughput: '',
      instrument: '',
      model: '',
      usage: '',
      brand: selectedCompany === 'human_bio' ? 'Human Biomedicals' : selectedCompany === 'global_bio' ? 'Global Biomedical' : 'Raj Biosis',
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
    const sub = product['sub category'] || product.subCategory || '';
    setFormData({
      title: product.title || product.name || '',
      price: product.price || '',
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

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      'sub category': formData.subCategory.trim(),
      productType: formData.subCategory.trim() ? 'hierarchical' : formData.productType
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

  // Handle Quick Website Assignment Change
  const handleSaveQuickWebsiteAssignment = async (product, newWebsitesList) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          _id: product._id,
          assignedWebsites: newWebsitesList
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, assignedWebsites: newWebsitesList } : p));
        setSuccessToast(`Website assignment updated for "${product.title}"`);
      }
    } catch (err) {
      alert('Error updating website assignment: ' + err.message);
    }
  };

  // Excel Template Download
  const handleDownloadDemoTemplate = () => {
    try {
      const blob = generateDemoExcelFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Biomedical_Products_Template_18Columns.xlsx';
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
      const blob = exportProductsToExcelFile(filteredProducts, 'Products');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Products_Export_${companyLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessToast(`Exported ${filteredProducts.length} products to Excel!`);
    } catch (err) {
      alert('Error exporting products: ' + err.message);
    }
  };

  // Handle File / Folder Selection for Import
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only excel / csv files
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
      const result = await parseExcelFilesList(validFiles);
      setParsedImportResults(result);
    } catch (err) {
      alert('Failed to parse uploaded Excel files: ' + err.message);
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Confirm and Save Excel Import to MongoDB
  const handleExecuteImportToDb = async () => {
    if (!parsedImportResults || parsedImportResults.products.length === 0) {
      alert('No products to import.');
      return;
    }

    setIsSavingImport(true);

    try {
      // Attach company & website defaults
      const finalProducts = parsedImportResults.products.map(p => {
        let comp = importCompanyTarget;
        if (importCompanyTarget === 'auto_detect') {
          const brandL = (p.brand || '').toLowerCase();
          if (brandL.includes('human')) comp = 'human_bio';
          else if (brandL.includes('global')) comp = 'global_bio';
          else comp = 'rajbiosis';
        }

        return {
          ...p,
          companyId: comp,
          assignedWebsites: importWebsiteTarget === 'all' ? ['all'] : [importWebsiteTarget],
          isVisible: true
        };
      });

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProducts)
      });
      const data = await res.json();

      if (!data.success) {
        alert('Import failed: ' + data.error);
        return;
      }

      setIsImportModalOpen(false);
      setImportFiles([]);
      setParsedImportResults(null);
      setSuccessToast(`🎉 Successfully imported ${data.insertedCount || finalProducts.length} products to MongoDB!`);
      fetchProducts();
    } catch (err) {
      alert('Network error importing products: ' + err.message);
    } finally {
      setIsSavingImport(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-sm transition animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1">
            <X size={15} />
          </button>
        </div>
      )}

      {/* =========================================================================
          TOP COMPANY SELECTOR TABS (Raj Biosis, Human Bio, Global Bio)
          ========================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* All Companies Button */}
          <button
            type="button"
            onClick={() => setSelectedCompany('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedCompany === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Building2 size={15} />
            <span>All Companies</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedCompany === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {companyCounts.all}
            </span>
          </button>

          {/* Raj Biosis */}
          <button
            type="button"
            onClick={() => setSelectedCompany('rajbiosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedCompany === 'rajbiosis'
                ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-300 shrink-0"></span>
            <span>Raj Biosis</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedCompany === 'rajbiosis' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {companyCounts.rajbiosis}
            </span>
          </button>

          {/* Human Biomedicals */}
          <button
            type="button"
            onClick={() => setSelectedCompany('human_bio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedCompany === 'human_bio'
                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 shrink-0"></span>
            <span>Human Biomedicals</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedCompany === 'human_bio' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {companyCounts.human_bio}
            </span>
          </button>

          {/* Global Biomedical */}
          <button
            type="button"
            onClick={() => setSelectedCompany('global_bio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedCompany === 'global_bio'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 shrink-0"></span>
            <span>Global Biomedical</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedCompany === 'global_bio' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {companyCounts.global_bio}
            </span>
          </button>
        </div>

        {/* Live Info Pill */}
        <div className="text-[11px] text-slate-500 font-medium px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-xl hidden xl:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>MongoDB Atlas: Har Company Ka Ek Baar Save Hota Hai</span>
        </div>
      </div>

      {/* =========================================================================
          MAIN ACTION & FILTER TOOLBAR (CLEAN & LIGHT)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        {/* Top Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Model, Brand, Category, Subcategory..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons: Download Template, Export, Import, Add */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Download Demo Excel Template */}
            <button
              type="button"
              onClick={handleDownloadDemoTemplate}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download 18-column sample Excel template with demo medical products"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Demo Excel Template</span>
            </button>

            {/* Export Current Products to Excel */}
            <button
              type="button"
              onClick={handleExportToExcel}
              disabled={filteredProducts.length === 0}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              title="Export all visible products to formatted Excel (.xlsx)"
            >
              <Download size={14} className="text-sky-600" />
              <span>Export ({filteredProducts.length})</span>
            </button>

            {/* Import Multiple Excel / Folder */}
            <button
              type="button"
              onClick={() => {
                setImportFiles([]);
                setParsedImportResults(null);
                setImportCompanyTarget(selectedCompany !== 'all' ? selectedCompany : 'rajbiosis');
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Import multiple Excel files or entire folder into MongoDB"
            >
              <Upload size={14} className="text-indigo-600" />
              <span>Import Excel / Folder</span>
            </button>

            {/* Add New Product Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/20"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Type, Category, SubCategory, Website, Visibility) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          
          {/* 1. Product Type Filter (Normal vs Categorized) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Product Structure:
            </label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400"
            >
              <option value="all">All Structures</option>
              <option value="normal">📦 Normal Products (Direct)</option>
              <option value="hierarchical">📂 Categorized (Cat &gt; SubCat)</option>
            </select>
          </div>

          {/* 2. Category Filter */}
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

          {/* 3. Sub Category Filter */}
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

          {/* 4. Select Target Website Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Website:
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

          {/* 5. Visibility Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {selectedWebsite === 'all' ? 'Visibility Status:' : `Visibility on ${selectedWebsite}:`}
            </label>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400"
            >
              <option value="all">All Products ({filteredProducts.length})</option>
              <option value="visible">
                {selectedWebsite === 'all' ? '🟢 Live / Visible on Web' : `🟢 Visible on ${selectedWebsite}`}
              </option>
              <option value="hidden">
                {selectedWebsite === 'all' ? '⚪ Hidden from Web' : `⚪ Hidden from ${selectedWebsite}`}
              </option>
            </select>
          </div>

        </div>

      </div>

      {/* Website Visibility Mode Banner */}
      {selectedWebsite !== 'all' && (
        <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">Website Visibility Mode:</span>
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
                Niche har product ke saamne button par click karke aap use directly <strong>{selectedWebsite}</strong> par show ya hide kar sakte hain.
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
          PRODUCTS DATA TABLE (CLEAN, LIGHT & INFORMATIVE)
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Subheader */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <strong className="text-slate-800 font-bold font-mono">{filteredProducts.length}</strong>
            <span>of {products.length} total products</span>
            {selectedCompany !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700 text-[11px]">
                Company: {COMPANIES.find(c => c.id === selectedCompany)?.name}
              </span>
            )}
            {selectedWebsite !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 font-mono font-medium text-sky-800 text-[11px]">
                Website: {selectedWebsite}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer font-medium"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-sky-500" : ""} />
            <span>Refresh Atlas</span>
          </button>
        </div>

        {/* Table Body (100% Width, Zero Horizontal Scrollbar) */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/70">
                <th className="py-4 px-5 w-[52%]">Product &amp; Model</th>
                <th className="py-4 px-4 w-[16%] whitespace-nowrap">Brand</th>
                <th className="py-4 px-4 w-[16%] whitespace-nowrap">Selling Price</th>
                <th className="py-4 px-5 text-center w-[16%] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 font-medium text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-sky-500" />
                    <span>Loading products from MongoDB Atlas...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Package size={22} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No Products Match Current Filter</h4>
                      <p className="text-xs text-slate-400">
                        {searchQuery || selectedCategory !== 'all' || selectedCompany !== 'all'
                          ? 'Try clearing the search query or changing company / category filters.'
                          : 'No products added yet. You can import an Excel file or click "Add Product".'}
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
                          Import from Excel / Folder
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLive = p.isVisible !== false;

                  return (
                    <tr key={p.id || p._id} className="hover:bg-slate-50/70 transition border-b border-slate-100/70">
                      
                      {/* Product Thumbnail & 2-Line Title (Spacious Row) */}
                      <td className="py-5 px-5">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImageProduct(p);
                              setPreviewActiveImgIdx(0);
                            }}
                            className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden hover:border-sky-400 hover:shadow-md transition cursor-pointer group relative"
                            title="Click to view full image in modal"
                          >
                            {p.images ? (
                              <img 
                                src={p.images.split(',')[0].trim()} 
                                alt={p.title} 
                                className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <Package size={22} className="text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-sky-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-2xl">
                              <Eye size={15} className="text-white drop-shadow" />
                            </div>
                          </button>

                          <div className="min-w-0 flex-1 pr-2">
                            <h4 
                              className="font-bold text-slate-800 text-sm leading-snug hover:text-sky-600 cursor-pointer transition"
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
                            <div className="text-[11px] text-slate-400 font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                              <span>Model: <strong className="text-slate-600 font-semibold">{p.model || 'N/A'}</strong></span>
                              {p.availability && (
                                <span className={`px-2 py-0.5 rounded-md font-sans text-[10px] font-semibold ${
                                  p.availability.toLowerCase().includes('stock') 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                }`}>
                                  {p.availability}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand Only (Clean text, No parent company) */}
                      <td className="py-5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-700 text-xs block">
                          {p.brand || 'Raj Biosis'}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-5 px-4 whitespace-nowrap font-mono">
                        <div className="text-xs font-bold text-slate-800">
                          {p.price > 0 ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Contact for Quote'}
                        </div>
                        {p.capacity && (
                          <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[120px] mt-0.5" title={p.capacity}>
                            {p.capacity}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons (Icon-Only, Hide/Show Included, Zero Clutter) */}
                      <td className="py-5 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. View 18 Specs */}
                          <button
                            type="button"
                            onClick={() => setViewingSpecsProduct(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer border border-slate-200/80 shadow-2xs"
                            title="View all 18 specifications"
                          >
                            <Eye size={15} />
                          </button>

                          {/* 2. Hide / Show Product (Visibility Toggle) */}
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(p)}
                            className={`p-2 rounded-xl border transition cursor-pointer shadow-2xs ${
                              isLive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                            title={isLive ? "Product is Live — Click to Hide" : "Product is Hidden — Click to Show"}
                          >
                            {isLive ? <Eye size={15} className="text-emerald-600" /> : <EyeOff size={15} className="text-slate-400" />}
                          </button>

                          {/* 3. Websites Visibility Control Modal */}
                          {(() => {
                            const sites = getWebsitesForCompany(p.companyId);
                            const liveCount = sites.filter(s => isVisibleOnSite(p, s)).length;
                            const allLive = liveCount === sites.length && sites.length > 0;
                            const noneLive = liveCount === 0;

                            return (
                              <button
                                type="button"
                                onClick={() => setQuickWebsiteProduct(p)}
                                className={`p-2 rounded-xl border transition cursor-pointer relative shadow-2xs ${
                                  allLive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : noneLive
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                                }`}
                                title={`Manage Websites (${liveCount}/${sites.length} live)`}
                              >
                                <Globe size={15} />
                                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                                  allLive ? 'bg-emerald-500' : noneLive ? 'bg-slate-300' : 'bg-sky-500'
                                }`} />
                              </button>
                            );
                          })()}

                          {/* 4. Edit Product */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer shadow-2xs"
                            title="Edit Product Details"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* 5. Delete Product */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shadow-2xs"
                            title="Delete Product permanently"
                          >
                            <Trash2 size={15} />
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
          MODAL 1: ADD / EDIT PRODUCT MODAL (CLEAN LIGHT DESIGN)
          ========================================================================= */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-500/20">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Biomedical Product to MongoDB'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Har company ke liye ek baar save hota hai aur multiple websites pe manage hota hai.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              
              {/* SECTION 1: COMPANY OWNERSHIP & PRODUCT TYPE */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Company &amp; Structure Type
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company */}
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Parent Company *
                    </label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-sky-400"
                    >
                      {COMPANIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Type (Normal vs Categorized) */}
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Product Hierarchy Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, productType: 'normal', subCategory: '' })}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                          formData.productType === 'normal'
                            ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        📦 Normal Product
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, productType: 'hierarchical' })}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                          formData.productType === 'hierarchical'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        📂 Cat &gt; Subcategory
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BASIC INFO (Title, Price, Model, Brand) */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Product Identity (From 18 Columns)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-slate-700 font-bold block mb-1">Product Title / Name *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. RajBiosis-Vent Pro-X9 Mechanical Ventilator"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 485000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Model / Code</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. PRO-X9-TURBINE"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Raj Biosis OEM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400 font-medium"
                    />
                  </div>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. ICU & Critical Care"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">
                      Product Subcategory {formData.productType === 'normal' && <span className="text-slate-400 font-normal">(Optional for Normal Products)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        subCategory: e.target.value,
                        productType: e.target.value.trim() ? 'hierarchical' : formData.productType
                      })}
                      placeholder="e.g. Mechanical Ventilators"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    placeholder="Brief description of clinical performance and features..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                  />
                </div>
              </div>

              {/* SECTION 3: TECHNICAL SPECIFICATIONS (Capacity, Throughput, Parameters, Instrument, Automation, etc.) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Technical Specifications (Exact Columns)
                </span>

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
                    <label className="text-slate-700 font-bold block mb-1">Stock Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white focus:border-sky-400"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Made to Order">Made to Order</option>
                      <option value="Limited Stock">Limited Stock</option>
                      <option value="Dispatch in 24h">Dispatch in 24h</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Dimensions &amp; Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g. 1420 x 580 x 640 mm (35 kg)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: MEDIA & ATTACHMENTS (Images, Video, PDF) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  4. Media &amp; URLs (Images, Video, PDF)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Image URL</label>
                    <input
                      type="text"
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product Video URL</label>
                    <input
                      type="text"
                      value={formData.video}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs outline-none focus:bg-white focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Product PDF URL</label>
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

              {/* SECTION 5: MULTI-WEBSITE ASSIGNMENT & VISIBILITY */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    5. Multi-Website Assignment &amp; Visibility
                  </span>
                  
                  {/* Visibility Switch */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">Display on Websites:</span>
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${formData.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {formData.isVisible ? 'Live / Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-500">
                  Select which websites of <strong>{COMPANIES.find(c => c.id === formData.companyId)?.name}</strong> will show this product:
                </p>

                <div className="space-y-2">
                  {/* All Websites Option */}
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
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
                    <span className="font-bold text-slate-800">Show on All Websites of this Company</span>
                    <span className="text-[10px] text-slate-400">(Default Recommended)</span>
                  </label>

                  {/* Specific Website Checkboxes */}
                  {!formData.assignedWebsites.includes('all') && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">Pick Specific Websites:</div>
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

                      {/* Add Custom Website Input */}
                      <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={newCustomWebsiteInput}
                          onChange={(e) => setNewCustomWebsiteInput(e.target.value)}
                          placeholder="Add new website domain (e.g. newportal.in)"
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCustomWebsiteInput.trim()) {
                              const cleaned = newCustomWebsiteInput.trim().toLowerCase();
                              if (!formData.assignedWebsites.includes(cleaned)) {
                                setFormData({ ...formData, assignedWebsites: [...formData.assignedWebsites.filter(w => w !== 'all'), cleaned] });
                              }
                              setNewCustomWebsiteInput('');
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          + Add Domain
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold transition shadow-sm shadow-sky-500/25 cursor-pointer flex items-center gap-2"
                >
                  <Check size={15} />
                  <span>{editingProduct ? 'Save Changes' : 'Save Product to MongoDB'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EXCEL & FOLDER MULTI-IMPORT MODAL
          ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl my-auto text-xs">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shadow-2xs">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Import Products from Multiple Excel Files / Folder
                  </h3>
                  <p className="text-xs text-slate-400">
                    Supports 18-column Excel sheets (.xlsx, .xls, .csv). Multiple files and entire folders supported.
                  </p>
                </div>
              </div>
              <button 
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
                  Files should have a sheet named <strong>&quot;Products&quot;</strong> with the 18 columns. You can upload multiple Excel files at once.
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

              {/* Demo Download Reminder */}
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

            {/* Parse Summary & Preview */}
            {parsedImportResults && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">
                        {parsedImportResults.products.length} Products Successfully Extracted from {importFiles.length} File(s)
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        All 18 columns mapped cleanly. Ready to save to MongoDB.
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-3 py-1 rounded-xl">
                    {parsedImportResults.products.length} Items
                  </span>
                </div>

                {/* First 3 Rows Preview Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase">
                        <th className="p-2">Title</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Subcategory</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">Brand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {parsedImportResults.products.slice(0, 4).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-slate-900 truncate max-w-[180px]">{p.title}</td>
                          <td className="p-2 font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="p-2 truncate max-w-[120px]">{p.category}</td>
                          <td className="p-2 font-mono text-[10px] text-indigo-700">{p['sub category'] || '(Normal)'}</td>
                          <td className="p-2 font-mono">{p.model}</td>
                          <td className="p-2">{p.brand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedImportResults.errors.length > 0 && (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] space-y-1">
                    <strong className="block">File Warnings:</strong>
                    {parsedImportResults.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition cursor-pointer"
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

      {/* =========================================================================
          MODAL 3: PRODUCT FULL 18 SPECS VIEWER DRAWER / MODAL
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
                    Model: {viewingSpecsProduct.model || 'N/A'} • Brand: {viewingSpecsProduct.brand}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingSpecsProduct(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* 18 Columns Key-Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Selling Price</span>
                <span className="text-sm font-bold font-mono text-slate-800">
                  {viewingSpecsProduct.price > 0 ? `₹${Number(viewingSpecsProduct.price).toLocaleString('en-IN')}` : 'Contact for Quote'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Category &amp; Subcategory</span>
                <span className="text-xs font-semibold text-slate-700">
                  {viewingSpecsProduct.category} {viewingSpecsProduct['sub category'] ? `↳ ${viewingSpecsProduct['sub category']}` : '(Normal)'}
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
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Intended Usage</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.usage || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Parameters</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.parameters || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Automation</span>
                <span className="text-xs text-slate-700">{viewingSpecsProduct.automation || 'Standard'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Availability</span>
                <span className="text-xs text-emerald-700 font-semibold">{viewingSpecsProduct.availability || 'In Stock'}</span>
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
          MODAL 4: QUICK WEBSITE VISIBILITY & HIDE/SHOW MANAGER
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
                onClick={() => { setQuickWebsiteProduct(null); setWebsiteModalSearch(''); }} 
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-600">Quick Actions:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const websites = getWebsitesForCompany(quickWebsiteProduct.companyId);
                    setQuickWebsiteProduct({
                      ...quickWebsiteProduct,
                      hiddenWebsites: [],
                      websiteVisibility: Object.fromEntries(websites.map(w => [w, true])),
                      assignedWebsites: ['all'],
                      isVisible: true
                    });
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  ✓ Show on All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const websites = getWebsitesForCompany(quickWebsiteProduct.companyId);
                    setQuickWebsiteProduct({
                      ...quickWebsiteProduct,
                      hiddenWebsites: [...websites],
                      websiteVisibility: Object.fromEntries(websites.map(w => [w, false]))
                    });
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  ✕ Hide from All
                </button>
              </div>
            </div>

            {/* Website Search Filter (if more than 2 websites) */}
            {getWebsitesForCompany(quickWebsiteProduct.companyId).length > 2 && (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={websiteModalSearch}
                  onChange={(e) => setWebsiteModalSearch(e.target.value)}
                  placeholder="Filter website domain..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-sky-400 transition"
                />
                {websiteModalSearch && (
                  <button
                    type="button"
                    onClick={() => setWebsiteModalSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* List of Websites with direct Live / Hidden switch */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Manage Visibility Per Website:
              </span>
              {getWebsitesForCompany(quickWebsiteProduct.companyId)
                .filter(site => !websiteModalSearch || site.toLowerCase().includes(websiteModalSearch.toLowerCase().trim()))
                .map(site => {
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
                        onClick={() => {
                          let newHidden = Array.isArray(quickWebsiteProduct.hiddenWebsites) ? [...quickWebsiteProduct.hiddenWebsites] : [];
                          if (isLive) {
                            if (!newHidden.includes(site)) newHidden.push(site);
                          } else {
                            newHidden = newHidden.filter(w => w !== site);
                          }
                          const newWebVis = { ...(quickWebsiteProduct.websiteVisibility || {}), [site]: !isLive };
                          setQuickWebsiteProduct({
                            ...quickWebsiteProduct,
                            hiddenWebsites: newHidden,
                            websiteVisibility: newWebVis
                          });
                        }}
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
              {getWebsitesForCompany(quickWebsiteProduct.companyId)
                .filter(site => !websiteModalSearch || site.toLowerCase().includes(websiteModalSearch.toLowerCase().trim())).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
                  No websites matching &quot;{websiteModalSearch}&quot;
                </div>
              )}
            </div>

            {/* Add Custom Website Domain Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Add New Website Domain for this Company:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCustomWebsiteInput}
                  onChange={(e) => setNewCustomWebsiteInput(e.target.value)}
                  placeholder="e.g. medical-store.in"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const domain = newCustomWebsiteInput.trim().toLowerCase();
                    if (!domain) return;
                    if (!customWebsites.includes(domain)) {
                      setCustomWebsites(prev => [...prev, domain]);
                    }
                    setNewCustomWebsiteInput('');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setQuickWebsiteProduct(null); setWebsiteModalSearch(''); }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/products', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: quickWebsiteProduct.id,
                        _id: quickWebsiteProduct._id,
                        hiddenWebsites: quickWebsiteProduct.hiddenWebsites || [],
                        websiteVisibility: quickWebsiteProduct.websiteVisibility || {},
                        assignedWebsites: quickWebsiteProduct.assignedWebsites || ['all'],
                        isVisible: quickWebsiteProduct.isVisible !== false
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setProducts(prev => prev.map(p => (p.id === quickWebsiteProduct.id || p._id === quickWebsiteProduct._id) ? {
                        ...p,
                        hiddenWebsites: quickWebsiteProduct.hiddenWebsites || [],
                        websiteVisibility: quickWebsiteProduct.websiteVisibility || {},
                        assignedWebsites: quickWebsiteProduct.assignedWebsites || ['all'],
                        isVisible: quickWebsiteProduct.isVisible !== false
                      } : p));
                      setSuccessToast(`Website visibility updated for "${quickWebsiteProduct.title}"`);
                    } else {
                      alert('Failed to update: ' + data.error);
                    }
                  } catch (err) {
                    alert('Error saving: ' + err.message);
                  }
                  setQuickWebsiteProduct(null);
                  setWebsiteModalSearch('');
                }}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold cursor-pointer shadow-xs"
              >
                Save Changes to MongoDB
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: FULL-SIZE IMAGE PREVIEW MODAL WITH DIRECT ACTIONS
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
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
              
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
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`flex-col items-center justify-center text-slate-400 p-8 text-center ${activeImageUrl ? 'hidden' : 'flex'}`}
                >
                  <Package size={48} className="text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-600">No Image Available</p>
                  <p className="text-xs text-slate-400 mt-1">This product does not have an image URL set.</p>
                </div>
              </div>

              {/* Multiple Images Carousel Thumbnails (if > 1) */}
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                  <span className="font-semibold text-slate-700 truncate block mt-0.5">
                    {previewImageProduct.category || 'General'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Subcategory</span>
                  <span className="font-semibold text-slate-700 truncate block mt-0.5">
                    {previewImageProduct['sub category'] || previewImageProduct.subCategory || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Selling Price</span>
                  <span className="font-bold text-emerald-600 block mt-0.5 font-mono">
                    {previewImageProduct.price ? `₹${Number(previewImageProduct.price).toLocaleString('en-IN')}` : 'Quote'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock Status</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">
                    {previewImageProduct.availability || 'In Stock'}
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prod = previewImageProduct;
                      setPreviewImageProduct(null);
                      setQuickWebsiteProduct(prod);
                    }}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Globe size={14} className="text-emerald-600" />
                    <span>Manage Websites</span>
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
          </div>
        );
      })()}

    </div>
  );
}
