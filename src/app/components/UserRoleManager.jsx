'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  Building2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { USER_ROLES, getRoleById } from '../../data/roles';
import { ALL_INDIAN_STATES } from '../../data/indianDistricts';
import { useAuth } from '../../lib/AuthContext';

export default function UserRoleManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('sales');
  const [editState, setEditState] = useState('Rajasthan');
  const [editDesignation, setEditDesignation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all') {
      const r = (u.role || '').toLowerCase();
      if (roleFilter === 'admin' && r !== 'admin' && r !== 'super_admin') return false;
      if (roleFilter === 'sales' && r !== 'sales' && r !== 'sales_executive' && r !== 'district_manager') return false;
    }
    if (stateFilter !== 'all' && (u.state || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.fullName || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      const matchState = (u.state || '').toLowerCase().includes(q);
      const matchOrg = (u.organization || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchState && !matchOrg) return false;
    }
    return true;
  });

  // Unique states represented
  const uniqueStates = Array.from(new Set(users.map(u => u.state).filter(Boolean)));

  // Open edit modal
  const openEditModal = (u) => {
    setEditingUser(u);
    const r = (u.role || 'sales').toLowerCase();
    setEditRole(r === 'admin' || r === 'super_admin' ? 'admin' : 'sales');
    setEditState(u.state || 'Rajasthan');
    setEditDesignation(u.designation || '');
    setStatusMessage(null);
  };

  // Save user changes
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editRole,
          state: editState,
          district: editState,
          designation: editDesignation
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Role and State territory updated for ${editingUser.fullName}!` });
        await fetchUsers();
        setTimeout(() => {
          setEditingUser(null);
        }, 800);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update user' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white text-slate-800 shadow-xs border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100">
            <ShieldCheck size={12} />
            <span>Biomedical Distributor Staff Directory (Admin & Sales)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Team & Sales Territory Roles
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Assign staff roles (Admin or Sales) and allocate State territories across India.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={isLoading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Role Summary Stats (Only 2 Roles: Admin & Sales) */}
      <div className="grid grid-cols-2 gap-4">
        {USER_ROLES.map((role) => {
          const count = users.filter((u) => {
            const r = (u.role || '').toLowerCase();
            if (role.id === 'admin') return r === 'admin' || r === 'super_admin';
            return r === 'sales' || r === 'sales_executive' || r === 'district_manager';
          }).length;
          return (
            <div
              key={role.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.tagColor}`}>
                  {role.badge}
                </span>
                <span className="text-xl font-black text-slate-800">{count}</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">{role.name}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{role.description}</div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, email, state..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="admin">👑 Admin HQ</option>
              <option value="sales">💼 Sales Team</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <option value="all">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-sky-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Staff Members ({filteredUsers.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Total Accounts: {users.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading staff directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No accounts found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned State</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const roleDef = getRoleById(u.role);
                  const isCurrent = currentUser?.email === u.email;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${roleDef.avatarBg}`}>
                            {roleDef.id === 'admin' ? '👑' : '💼'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.designation || roleDef.shortTitle}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-700">
                            <Mail size={11} className="text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Phone size={11} />
                            <span>+91 {u.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleDef.tagColor}`}>
                          <span>{roleDef.badge}</span>
                        </span>
                      </td>

                      {/* Assigned State */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{u.state || 'Rajasthan'}</span>
                        </div>
                      </td>

                      {/* Org */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 truncate block max-w-[150px]">
                          {u.organization || 'Raj Biosis'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 text-[11px] font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Edit3 size={12} />
                          <span>Assign Role/State</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role & State Modal (Only 2 Roles: Admin or Sales, Only State!) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  {editRole === 'admin' ? '👑' : '💼'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Reassign Role & State Territory
                  </h3>
                  <div className="text-[11px] text-slate-500">{editingUser.fullName}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              
              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Role Selection (Exactly 2 Roles: Admin or Sales) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Portal Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500"
                >
                  <option value="admin">👑 Administrator (HQ Admin)</option>
                  <option value="sales">💼 Biomedical Sales Representative</option>
                </select>
              </div>

              {/* State Selection (Only State Dropdown!) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned State Territory *
                </label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Designation
                </label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder="e.g. State Sales Lead"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Save Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
