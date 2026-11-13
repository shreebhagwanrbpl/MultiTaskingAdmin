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
  X,
  LogOut,
  Trash2,
  Lock,
  Radio,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { USER_ROLES, getRoleById } from '../../data/roles';
import { ALL_INDIAN_STATES } from '../../data/indianDistricts';
import { useAuth } from '../../lib/AuthContext';

export default function UserRoleManager() {
  const { user: currentUser, isAdmin, setAuthNotification } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action Loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

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
    // Auto-refresh users directory every 15 seconds to keep online statuses live
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  // Force Logout a user session
  const handleForceLogout = async (targetUser) => {
    if (!targetUser) return;
    if (targetUser.email === currentUser?.email) {
      alert('You cannot force logout your own active admin session. Use the Sign Out button instead.');
      return;
    }

    if (!confirm(`Are you sure you want to force logout ${targetUser.fullName || targetUser.email}?\n\nTheir current active session will be immediately terminated.`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUser.id,
          action: 'force_logout'
        })
      });

      const data = await res.json();
      if (data.success) {
        // Broadcast force logout signal across browser tabs
        try {
          const channel = new BroadcastChannel('rbpl_auth_channel');
          channel.postMessage({
            type: 'FORCE_LOGOUT',
            userId: targetUser.id,
            email: targetUser.email
          });
          setTimeout(() => channel.close(), 1000);
        } catch (e) {}

        if (setAuthNotification) {
          setAuthNotification({
            type: 'success',
            title: 'User Force Logged Out',
            message: `Active session for ${targetUser.fullName} was terminated.`
          });
        }
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to force logout user');
      }
    } catch (err) {
      alert('Error force logging out user: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanently delete a user account
  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return;
    if (targetUser.email === currentUser?.email) {
      alert('Security violation: You cannot delete your own active admin account.');
      return;
    }

    if (targetUser.id === 'usr_super_admin' || targetUser.email === 'admin@rajbiosis.com') {
      alert('Primary Master Super Admin account cannot be deleted.');
      return;
    }

    const conf = confirm(
      `⚠️ PERMANENT ACCOUNT DELETION\n\nKya aap pakka is account ko delete karna chahte hain?\n\nMember: ${targetUser.fullName}\nEmail: ${targetUser.email}\nRole: ${targetUser.roleTitle || targetUser.role}\n\nYe account MongoDB aur pure system se permanently remove ho jayega!`
    );
    if (!conf) return;

    setActionLoadingId(targetUser.id);
    try {
      const res = await fetch(`/api/auth/users?id=${encodeURIComponent(targetUser.id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (data.success) {
        // If user is currently online on any browser, also broadcast force logout
        try {
          const channel = new BroadcastChannel('rbpl_auth_channel');
          channel.postMessage({
            type: 'FORCE_LOGOUT',
            userId: targetUser.id,
            email: targetUser.email
          });
          setTimeout(() => channel.close(), 1000);
        } catch (e) {}

        if (setAuthNotification) {
          setAuthNotification({
            type: 'success',
            title: 'Account Deleted Permanently',
            message: `Account for ${targetUser.fullName} has been removed from database.`
          });
        }
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user account');
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all') {
      const r = (u.role || '').toLowerCase();
      if (roleFilter === 'admin' && r !== 'admin' && r !== 'super_admin') return false;
      if (roleFilter === 'sales' && r !== 'sales' && r !== 'sales_executive' && r !== 'district_manager') return false;
    }
    if (stateFilter !== 'all' && (u.state || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (statusFilter === 'online' && !u.isOnline) return false;
    if (statusFilter === 'offline' && u.isOnline) return false;

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

  const onlineCount = users.filter(u => u.isOnline).length;
  const adminCount = users.filter(u => (u.role || '').toLowerCase().includes('admin')).length;
  const salesCount = users.filter(u => !(u.role || '').toLowerCase().includes('admin')).length;
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

  // If accessed by non-admin, render restriction card
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4 my-12 bg-white rounded-3xl border border-slate-200 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted to Central Administrator</h2>
        <p className="text-xs text-slate-500">
          This section is exclusively reserved for Central HQ Admin to monitor employee logins, assign state territories, and manage user accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white text-slate-800 shadow-xs border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Admin HQ Session & Account Governance</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Staff Directory & Active Login Sessions
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Monitor real-time logged in staff, view assigned state territories, force logout active sessions, and delete accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={isLoading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Sessions</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Accounts</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <div className="text-[10px] text-slate-400">Registered biomedical staff</div>
        </div>

        {/* Online / Active Now */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1 bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Logins</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-800">{onlineCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Active online sessions</div>
        </div>

        {/* Admin HQ */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admin HQ</span>
            <span className="text-sm">👑</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{adminCount}</div>
          <div className="text-[10px] text-slate-400">Pan-India HQ administrators</div>
        </div>

        {/* Sales Team */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sales Team</span>
            <span className="text-sm">💼</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{salesCount}</div>
          <div className="text-[10px] text-slate-400">State territory executives</div>
        </div>
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
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Status ({users.length})</option>
              <option value="online">🟢 Online Now ({onlineCount})</option>
              <option value="offline">⚪ Offline</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Roles</option>
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
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
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
              Staff Members & Login Sessions ({filteredUsers.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Auto-syncing every 15s
          </span>
        </div>

        {isLoading && users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading staff directory & active logins...</span>
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
                  <th className="py-3 px-4">Login Status</th>
                  <th className="py-3 px-4 text-right">Admin Session Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const roleDef = getRoleById(u.role);
                  const isCurrent = currentUser?.email === u.email;
                  const isMasterSuperAdmin = u.id === 'usr_super_admin' || u.email === 'admin@rajbiosis.com';
                  const isProcessing = actionLoadingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-2xs ${roleDef.avatarBg}`}>
                            {roleDef.id === 'admin' ? '👑' : '💼'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black border border-emerald-300">
                                  Current Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.designation || roleDef.shortTitle}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleDef.tagColor}`}>
                          <span>{roleDef.badge}</span>
                        </span>
                      </td>

                      {/* Assigned State */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200">
                          <MapPin size={12} className="text-rose-500 shrink-0" />
                          <span>{u.state || 'Rajasthan'}</span>
                          {roleDef.id !== 'admin' && (
                            <span className="text-[9px] text-slate-400 font-bold ml-1" title="Locked Territory">
                              🔒
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Login Status */}
                      <td className="py-3.5 px-4">
                        {u.isOnline ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Online Now</span>
                            </span>
                            {u.lastLoginAt && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 pl-1">
                                <Clock size={9} />
                                <span>{new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              <span>Offline</span>
                            </span>
                            {u.lastLoginAt && (
                              <div className="text-[10px] text-slate-400">
                                {new Date(u.lastLoginAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions Strip */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Force Logout Button */}
                          <button
                            type="button"
                            onClick={() => handleForceLogout(u)}
                            disabled={isProcessing || isCurrent}
                            title={isCurrent ? "You cannot force logout your own admin session" : "Force logout this user's active session"}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                          >
                            <LogOut size={12} className="text-amber-600" />
                            <span>Logout</span>
                          </button>

                          {/* Edit Role & State Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            disabled={isProcessing}
                            title="Edit role, designation, or state territory"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 text-[11px] font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>

                          {/* Delete Account Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isProcessing || isCurrent || isMasterSuperAdmin}
                            title={isCurrent ? "Cannot delete your own account" : isMasterSuperAdmin ? "Master Admin cannot be deleted" : "Permanently delete this account"}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                          >
                            <Trash2 size={12} className="text-rose-600" />
                            <span>Delete</span>
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

      {/* EDIT ROLE & STATE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Manage Staff Permissions & Territory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-semibold ${
                statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member Details</span>
                <div className="font-bold text-sm text-slate-900 mt-0.5">{editingUser.fullName}</div>
                <div className="text-xs text-slate-500 font-mono">{editingUser.email} • +91 {editingUser.phone}</div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditRole('admin');
                      setEditState('All India (Pan-India HQ)');
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      editRole === 'admin'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">👑</span>
                    <div>
                      <div className="text-xs font-bold text-purple-900">Admin HQ</div>
                      <div className="text-[10px] text-purple-700">Pan-India Control</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditRole('sales');
                      if (editState === 'All India (Pan-India HQ)') {
                        setEditState('Rajasthan');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                      editRole === 'sales'
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">💼</span>
                    <div>
                      <div className="text-xs font-bold text-sky-900">Sales Team</div>
                      <div className="text-[10px] text-sky-700">State Territory Lock</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* State Territory Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State Territory (Sales Territory)
                </label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  disabled={editRole === 'admin'}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {editRole === 'admin' ? (
                    <option value="All India (Pan-India HQ)">All India (Pan-India HQ Control)</option>
                  ) : (
                    ALL_INDIAN_STATES.filter(s => s !== 'All India (Pan-India HQ)').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sales staff are locked to this state and cannot change their territory.
                </p>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation / Title
                </label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder="e.g. Senior Biomedical Sales Executive"
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
