'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  PhoneCall,
  Mail,
  MapPin,
  Building2,
  Calendar,
  History,
  X,
  Trash2,
  Download,
  CheckCircle2,
  Edit3,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function CustomerProfilesManager({ onRefreshNeeded }) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [selectedAuditCustomer, setSelectedAuditCustomer] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchCustomers = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.warn('Failed to load customer profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(false);
    // Poll for new/edited profiles every 6 seconds silently without flickering
    const interval = setInterval(() => fetchCustomers(true), 6000);
    return () => clearInterval(interval);
  }, []);

  // Filtered customer profiles (sorted newest / most recently updated first)
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        if (districtFilter !== 'all' && (c.district || '').toLowerCase() !== districtFilter.toLowerCase()) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = (c.fullName || '').toLowerCase().includes(q);
          const hospMatch = (c.hospitalName || '').toLowerCase().includes(q);
          const phoneMatch = (c.phone || '').toLowerCase().includes(q);
          const emailMatch = (c.email || '').toLowerCase().includes(q);
          const distMatch = (c.district || '').toLowerCase().includes(q);
          const desigMatch = (c.designation || '').toLowerCase().includes(q);
          if (!nameMatch && !hospMatch && !phoneMatch && !emailMatch && !distMatch && !desigMatch) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [customers, districtFilter, searchQuery]);

  // Unique districts represented
  const availableDistricts = useMemo(() => {
    const set = new Set();
    customers.forEach(c => {
      if (c.district && c.district.trim()) set.add(c.district.trim());
    });
    return Array.from(set).sort();
  }, [customers]);

  // Counts
  const totalProfiles = customers.length;
  const editedProfilesCount = customers.filter(c => (c.editCount || 0) > 0 || c.lastAction === 'Profile Edited').length;

  const handleDeleteCustomer = async (id, e) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this customer profile from database?')) return;
    setIsDeletingId(id);
    try {
      await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      setCustomers(prev => prev.filter(c => c.id !== id && c._id !== id));
      if (selectedAuditCustomer && (selectedAuditCustomer.id === id || selectedAuditCustomer._id === id)) {
        setSelectedAuditCustomer(null);
      }
    } catch (err) {
      alert('Failed to delete profile: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('No customer profiles to export.');
      return;
    }
    const headers = ['ID', 'Full Name', 'Designation', 'Hospital/Clinic', 'Phone', 'Email', 'District', 'State', 'Address', 'Pincode', 'Status', 'Edits', 'Registered At', 'Last Updated At'];
    const rows = customers.map(c => [
      c.id || '',
      `"${c.fullName || ''}"`,
      `"${c.designation || ''}"`,
      `"${c.hospitalName || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.district || ''}"`,
      `"${c.state || ''}"`,
      `"${c.address || ''}"`,
      `"${c.pincode || ''}"`,
      `"${c.lastAction || 'Registered'}"`,
      c.editCount || 0,
      c.createdAt || '',
      c.updatedAt || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Customer_Profiles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Registered Accounts</span>
            <span className="text-2xl font-bold text-slate-800">{totalProfiles}</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Verified Medical Buyers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Profile Edits Tracked</span>
            <span className="text-2xl font-bold text-slate-800">{editedProfilesCount}</span>
            <span className="text-[11px] text-amber-600 font-medium block mt-0.5">With Field Change History</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Edit3 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Districts Represented</span>
            <span className="text-2xl font-bold text-slate-800">{availableDistricts.length}</span>
            <span className="text-[11px] text-sky-600 font-medium block mt-0.5">Across Rajasthan & Pan-India</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <MapPin size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Live Database Sync</span>
            <span className="text-2xl font-bold text-slate-800">Connected</span>
            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">MongoDB: customers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, hospital, phone, district..."
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-sky-400 transition"
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

            {/* District Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">District:</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:border-sky-400"
              >
                <option value="all">All Districts ({customers.length})</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCustomers}
              className="text-xs py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-medium flex items-center gap-1.5 transition border border-slate-200/60"
              title="Refresh list"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="text-xs py-1.5 px-3 bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Customer Profiles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-3 px-4">Doctor / Representative</th>
                <th className="py-3 px-4">Hospital / Entity</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Profile Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Audit & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 font-medium text-slate-600">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                      <Users size={22} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No Customer Profiles Registered Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      When doctors or hospital procurement teams create or edit their profile on rajbiosis.com, their details and edit audit history will appear here separately.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const hasEdits = (cust.editCount || 0) > 0 || cust.lastAction === 'Profile Edited';
                  return (
                    <tr
                      key={cust.id || cust._id}
                      onClick={() => setSelectedAuditCustomer(cust)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span>{cust.fullName || 'Medical Client'}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block">
                          {cust.designation || 'Healthcare Representative'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span>{cust.hospitalName || 'Clinic / Hospital'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 font-semibold">{cust.phone || '—'}</div>
                        <span className="text-[11px] text-slate-400 truncate max-w-[170px] block">{cust.email || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 font-semibold text-[11px] inline-flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{cust.district || 'Rajasthan'}</span>
                        </span>
                        {cust.state && <span className="text-[10px] text-slate-400 block mt-0.5">{cust.state}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasEdits ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Edit3 size={10} />
                            <span>Profile Edited ({cust.editCount || 1}x)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Sparkles size={10} />
                            <span>New Profile Created</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-700 font-semibold block">
                          {cust.updatedAt ? new Date(cust.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {cust.updatedAt ? new Date(cust.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAuditCustomer(cust)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                            title="View Profile Details & Edit Changes"
                          >
                            <History size={12} />
                            <span>Audit</span>
                          </button>

                          {cust.phone && (
                            <a
                              href={`tel:${cust.phone}`}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-2xs"
                              title="Call Customer"
                            >
                              <PhoneCall size={12} />
                            </a>
                          )}

                          <button
                            onClick={(e) => handleDeleteCustomer(cust.id || cust._id, e)}
                            disabled={isDeletingId === (cust.id || cust._id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Profile"
                          >
                            <Trash2 size={12} />
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

      {/* =====================================================================
          CUSTOMER PROFILE AUDIT & FIELD CHANGE DRAWER / MODAL
          ===================================================================== */}
      {selectedAuditCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Users size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedAuditCustomer.fullName || 'Customer Profile'}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {selectedAuditCustomer.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedAuditCustomer.designation || 'Medical Officer'} • {selectedAuditCustomer.hospitalName || 'Healthcare Facility'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAuditCustomer(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Overview Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hospital / Clinic</span>
                  <span className="text-slate-800 font-bold text-sm">{selectedAuditCustomer.hospitalName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Phone</span>
                  <span className="text-slate-800 font-mono font-bold text-sm">{selectedAuditCustomer.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                  <span className="text-slate-800 font-medium">{selectedAuditCustomer.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">District & State</span>
                  <span className="text-slate-800 font-semibold">{selectedAuditCustomer.district || 'Jaipur'}, {selectedAuditCustomer.state || 'Rajasthan'}</span>
                </div>
                {selectedAuditCustomer.address && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                    <span className="text-slate-700 font-medium">{selectedAuditCustomer.address} {selectedAuditCustomer.pincode ? `(${selectedAuditCustomer.pincode})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Edit History & Changes Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Profile Edit History & Field Changes Audit
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {selectedAuditCustomer.editCount || 0} Edit(s) Recorded
                  </span>
                </div>

                {!selectedAuditCustomer.editHistory || selectedAuditCustomer.editHistory.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
                    No edits have been made since the account was initially created.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAuditCustomer.editHistory.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                            item.action?.includes('Updated') || item.action?.includes('Edit')
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {item.action || 'Activity'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN') : 'Just now'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          {item.summary}
                        </p>

                        {/* Detailed Field Diff if available */}
                        {Array.isArray(item.changes) && item.changes.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                              <thead>
                                <tr className="text-slate-400 font-semibold text-[10px] uppercase">
                                  <th className="py-1">Field</th>
                                  <th className="py-1">Previous Value</th>
                                  <th className="py-1">Updated Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {item.changes.map((ch, cIdx) => (
                                  <tr key={cIdx}>
                                    <td className="py-1 font-bold text-slate-700">{ch.label || ch.field}</td>
                                    <td className="py-1 text-rose-600 line-through font-mono">{ch.oldValue || '(empty)'}</td>
                                    <td className="py-1 text-emerald-600 font-bold font-mono">{ch.newValue || '(empty)'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Connected Site: <strong className="text-slate-700">{selectedAuditCustomer.siteDomain || 'rajbiosis.com'}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedAuditCustomer.phone && (
                  <a
                    href={`tel:${selectedAuditCustomer.phone}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <PhoneCall size={13} />
                    <span>Call Client</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedAuditCustomer(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
