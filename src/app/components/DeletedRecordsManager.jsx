'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  Globe,
  DollarSign,
  Package,
  Eye,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  Phone,
  Mail,
  X
} from 'lucide-react';

export default function DeletedRecordsManager({ user = null, onRecordRestored = () => { } }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lead', 'quotation'
  const [actorFilter, setActorFilter] = useState('all'); // 'all', 'admin', 'employee'

  // Modal / Action states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [purgingId, setPurgingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [confirmPurgeModal, setConfirmPurgeModal] = useState({ isOpen: false, record: null, isAll: false });

  const fetchDeletedRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/deleted-records');
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
      }
    } catch (e) {
      console.warn('Failed to fetch deleted records:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedRecords();
  }, []);

  const showToast = (title, message, type = 'success') => {
    setToastMsg({ title, message, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // 1-Click Restore to Live System
  const handleRestoreRecord = async (record) => {
    if (!record) return;
    setRestoringId(record.id);
    try {
      const res = await fetch('/api/deleted-records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, originalId: record.originalId })
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.filter(r => r.id !== record.id));
        showToast(
          'Record Restored Successfully!',
          `"${record.title || record.hospital || record.originalId}" ko wapas live system me restore kar diya gaya hai.`
        );
        // Inform parent dashboard & other tabs to refresh leads
        onRecordRestored();
        try {
          const channel = new BroadcastChannel('biomedical_leads_channel');
          channel.postMessage({ type: 'LEAD_RESTORED', record });
          setTimeout(() => { try { channel.close(); } catch (e) { } }, 3000);
        } catch (e) { }
      } else {
        showToast('Restore Failed', data.error || 'Server error while restoring record', 'error');
      }
    } catch (e) {
      showToast('Restore Failed', e.message, 'error');
    } finally {
      setRestoringId(null);
    }
  };

  // Permanent Wipe / Purge from Archive
  const handleConfirmPurge = async () => {
    const { record, isAll } = confirmPurgeModal;
    setConfirmPurgeModal({ isOpen: false, record: null, isAll: false });

    if (isAll) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/deleted-records?clearAll=true', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setRecords([]);
          showToast('Archive Cleared', 'Sabhi deleted records ko permanent wipe kar diya gaya hai.');
        }
      } catch (e) {
        showToast('Error', e.message, 'error');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!record) return;
    setPurgingId(record.id);
    try {
      const res = await fetch(`/api/deleted-records?id=${encodeURIComponent(record.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.filter(r => r.id !== record.id));
        showToast('Permanently Purged', `Record ${record.originalId || record.id} permanently wipe ho gaya hai.`);
      }
    } catch (e) {
      showToast('Purge Error', e.message, 'error');
    } finally {
      setPurgingId(null);
    }
  };

  // Compute Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Type filter
      if (typeFilter !== 'all') {
        const t = (r.itemType || 'lead').toLowerCase();
        if (typeFilter === 'lead' && t !== 'lead' && t !== 'rfq') return false;
        if (typeFilter === 'quotation' && t !== 'quotation') return false;
      }

      // Actor Filter (Admin vs Employee)
      if (actorFilter !== 'all') {
        const role = (r.deletedBy?.role || '').toLowerCase();
        const isAdmin = role.includes('admin') || role.includes('super');
        if (actorFilter === 'admin' && !isAdmin) return false;
        if (actorFilter === 'employee' && isAdmin) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `
          ${r.originalId || ''} 
          ${r.title || ''} 
          ${r.hospital || ''} 
          ${r.doctorName || ''} 
          ${r.equipment || ''} 
          ${r.phone || ''} 
          ${r.email || ''} 
          ${r.deletedBy?.name || ''} 
          ${r.deletedBy?.role || ''}
        `.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [records, typeFilter, actorFilter, searchQuery]);

  // Aggregate stats
  const totalLeadsArchived = records.filter(r => (r.itemType || 'lead') === 'lead' || r.itemType === 'rfq').length;
  const totalQuotesArchived = records.filter(r => r.itemType === 'quotation').length;
  const adminDeletesCount = records.filter(r => (r.deletedBy?.role || '').toLowerCase().includes('admin')).length;
  const employeeDeletesCount = records.length - adminDeletesCount;

  const totalArchivedValue = useMemo(() => {
    return records.reduce((acc, r) => {
      const num = parseInt(String(r.amount || '0').replace(/[^0-9]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [records]);

  const formattedArchivedVal = totalArchivedValue > 0
    ? `₹${(totalArchivedValue >= 10000000 ? (totalArchivedValue / 10000000).toFixed(2) + ' Cr' : (totalArchivedValue / 100000).toFixed(2) + ' L')}`
    : '₹0.00';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all ${toastMsg.type === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
          <CheckCircle2 size={18} className={toastMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'} />
          <div>
            <div className="text-xs font-bold">{toastMsg.title}</div>
            <div className="text-[11px] opacity-90">{toastMsg.message}</div>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-600 text-white flex items-center justify-center font-black shadow-xs">
              <Archive size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Deleted Records
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-100 text-rose-800 border border-rose-200">
                  {records.length} Archived
                </span>
              </div>

            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchDeletedRecords}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmPurgeModal({ isOpen: true, isAll: true })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200 shadow-2xs"
            >
              <Trash2 size={14} />
              <span>Purge Entire Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Deleted Inquiries &amp; RFQ
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {totalLeadsArchived}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Excluded from active desk
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Deleted Quotations
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {totalQuotesArchived}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Stored for legal audit
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Archived Pipeline Value
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">
              {formattedArchivedVal}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Zero impact on live KPIs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Deletion Audits
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {adminDeletesCount} <span className="text-xs font-bold text-slate-400">Admin</span> / {employeeDeletesCount} <span className="text-xs font-bold text-slate-400">Team</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              User ID &amp; timestamps tracked
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 w-full md:w-auto min-w-[260px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital, doctor, phone, equipment, or who deleted..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-400 font-normal">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="all">All Types ({records.length})</option>
              <option value="lead">Hospital RFQs ({totalLeadsArchived})</option>
              <option value="quotation">Quotations ({totalQuotesArchived})</option>
            </select>
          </div>

          {/* Actor Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-400 font-normal">Deleted By:</span>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="all">Everyone ({records.length})</option>
              <option value="admin">Administrators ({adminDeletesCount})</option>
              <option value="employee">Sales &amp; Employees ({employeeDeletesCount})</option>
            </select>
          </div>

          {(searchQuery || typeFilter !== 'all' || actorFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setActorFilter('all');
              }}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 px-2 py-1 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw size={28} className="animate-spin text-sky-500 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-700">Loading audit records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
              <Archive size={30} />
            </div>
            <h3 className="text-base font-black text-slate-800">
              {records.length === 0 ? 'No Deleted Records in System' : 'No Records Match Filters'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {records.length === 0
                ? 'Jab bhi koi employee ya admin inquiry ya quotation delete karega, uska poora audit data yahan automatically save ho jayega.'
                : 'Try clearing your search query or changing filter criteria above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Ref &amp; Timestamp</th>
                  <th className="py-3.5 px-4">Deleted By (User &amp; Role)</th>
                  <th className="py-3.5 px-4">Hospital &amp; Contact</th>
                  <th className="py-3.5 px-4">Requested Hardware</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Source Website</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((item) => {
                  const isLead = (item.itemType || 'lead') === 'lead' || item.itemType === 'rfq';
                  const isRestoring = restoringId === item.id;
                  const isPurging = purgingId === item.id;
                  const roleName = item.deletedBy?.role || 'Staff';
                  const isAdminRole = roleName.toLowerCase().includes('admin');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">

                      {/* Column 1: Ref & Timestamp */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.originalId || item.id}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isLead ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                            {isLead ? 'Hospital RFQ' : 'Quotation'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                          <Clock size={11} className="text-slate-400" />
                          <span>
                            {item.deletedAt ? new Date(item.deletedAt).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', hour12: true
                            }) : 'Recently'}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Deleted By */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAdminRole ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                            {isAdminRole ? '👑' : '💼'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{item.deletedBy?.name || 'Authorized User'}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${isAdminRole ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                {roleName}
                              </span>
                            </div>
                            {item.deletedBy?.email && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {item.deletedBy.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Hospital & Contact */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          {item.hospital || item.title || 'Institution'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.doctorName || 'Medical Buyer'}
                          {item.phone && <span className="font-mono text-slate-400 ml-1.5">({item.phone})</span>}
                        </div>
                      </td>

                      {/* Column 4: Requested Hardware */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <div className="font-medium text-slate-800 truncate" title={item.equipment}>
                          {item.equipment || 'Biomedical Equipment'}
                        </div>
                      </td>

                      {/* Column 5: Amount */}
                      <td className="py-3.5 px-4 align-top font-mono font-bold text-slate-900">
                        {item.amount || '₹0'}
                      </td>

                      {/* Column 6: Source Website */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                          <Globe size={11} className="text-slate-400" />
                          <span>{item.sourceWebsite || 'rajbiosis.com'}</span>
                        </span>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestoreRecord(item)}
                            disabled={isRestoring || isPurging}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200/90 transition shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Restore this record back to active system"
                          >
                            <RotateCcw size={12} className={isRestoring ? 'animate-spin' : ''} />
                            <span>{isRestoring ? 'Restoring...' : 'Restore'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Inspect complete payload"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmPurgeModal({ isOpen: true, record: item, isAll: false })}
                            disabled={isRestoring || isPurging}
                            className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Permanently wipe from archive"
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
          </div>
        )}
      </div>

      {/* Confirmation Modal for Permanent Purge */}
      {confirmPurgeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {confirmPurgeModal.isAll ? 'Purge Entire Archive?' : 'Permanently Delete From Vault?'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {confirmPurgeModal.isAll
                  ? 'Kripya dhyan dein: Sabhi archived deleted records permanently wipe ho jayenge aur inhe dobara restore nahi kiya ja sakega.'
                  : `Record "${confirmPurgeModal.record?.originalId || confirmPurgeModal.record?.id}" ko archive se permanently delete kiya ja raha hai. Iske baad ise restore nahi kiya ja sakega.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPurgeModal({ isOpen: false, record: null, isAll: false })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Permanently Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspection JSON Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Archive size={18} className="text-rose-600" />
                <h3 className="text-base font-black text-slate-900">
                  Archived Record Audit Payload ({selectedRecord.originalId || selectedRecord.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Deleted By</span>
                <span className="font-bold text-slate-800">{selectedRecord.deletedBy?.name}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{selectedRecord.deletedBy?.role} ({selectedRecord.deletedBy?.email || 'N/A'})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Deletion Time</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedRecord.deletedAt ? new Date(selectedRecord.deletedAt).toLocaleString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72">
              {JSON.stringify(selectedRecord, null, 2)}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const rec = selectedRecord;
                  setSelectedRecord(null);
                  handleRestoreRecord(rec);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={12} />
                <span>Restore to Live System</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

