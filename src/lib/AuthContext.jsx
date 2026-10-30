'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getRoleById, USER_ROLES } from '../data/roles';

const AuthContext = createContext(null);

const STORAGE_KEY = 'rbpl_current_user_session';
const TOKEN_KEY = 'rbpl_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStateFilter, setActiveStateFilter] = useState('all');
  const [authNotification, setAuthNotification] = useState(null);
  const router = useRouter();

  // Hydrate user from localStorage on initial render & check flash notification
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        const r = (parsed.role || '').toLowerCase();
        if (r.includes('admin')) {
          setActiveStateFilter('all');
        } else if (parsed.state && parsed.state !== 'All India (HQ)' && parsed.state !== 'All India (National HQ)') {
          setActiveStateFilter(parsed.state);
        } else {
          setActiveStateFilter('all');
        }
      }

      // Check for flash toast (e.g. after redirect or reload)
      const flash = localStorage.getItem('rbpl_auth_toast');
      if (flash) {
        localStorage.removeItem('rbpl_auth_toast');
        const parsedFlash = JSON.parse(flash);
        setAuthNotification(parsedFlash);
      }
    } catch (e) {
      console.warn('Failed to parse cached session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-dismiss auth notification toast after 2.5 seconds
  useEffect(() => {
    if (!authNotification) return;
    const timer = setTimeout(() => {
      setAuthNotification(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [authNotification]);

  // Login handler
  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      const r = (data.user.role || '').toLowerCase();
      if (r.includes('admin')) {
        setActiveStateFilter('all');
      } else if (data.user.state && data.user.state !== 'All India (HQ)' && data.user.state !== 'All India (National HQ)') {
        setActiveStateFilter(data.user.state);
      } else {
        setActiveStateFilter('all');
      }

      const toastData = {
        type: 'success',
        title: 'Logged in Successfully',
        message: `Welcome back, ${data.user.fullName || data.user.name || 'User'}!`
      };

      try {
        localStorage.setItem('rbpl_auth_toast', JSON.stringify(toastData));
      } catch (e) {}

      setAuthNotification(toastData);

      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Signup handler
  const signup = async (userData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed. Please try again.');
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      if (data.user.state && data.user.state !== 'All India (HQ)') {
        setActiveStateFilter(data.user.state);
      }

      const toastData = {
        type: 'success',
        title: 'Logged in Successfully',
        message: `Account created for ${data.user.fullName}!`
      };

      try {
        localStorage.setItem('rbpl_auth_toast', JSON.stringify(toastData));
      } catch (e) {}

      setAuthNotification(toastData);

      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    const toastData = {
      type: 'success',
      title: 'Logged out successfully',
      message: 'You have been safely signed out of Raj Biosis Hub.'
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = 'rbpl_auth_token=; Max-Age=0; path=/;';
      localStorage.setItem('rbpl_auth_toast', JSON.stringify(toastData));
      localStorage.setItem('rbpl_logout_msg', 'Logged out successfully');
    } catch (e) {
      // safe
    }
    setUser(null);
    setAuthNotification(toastData);

    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/');
    }
  };

  // Switch state filter
  const setStateFilter = (st) => {
    setActiveStateFilter(st);
  };

  // Update profile
  const updateProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Permissions helpers (Only 2 Roles: Admin & Sales)
  const roleId = (user?.role || 'guest').toLowerCase();
  const isAdmin = roleId === 'admin' || roleId === 'super_admin';
  const isSales = roleId === 'sales' || roleId === 'sales_executive' || roleId === 'district_manager';

  const canAccessTab = (tabName) => {
    if (!user) return false;
    if (isAdmin) return true;

    switch (tabName) {
      case 'leads':
      case 'customers':
      case 'quotation':
      case 'products':
        return true;
      case 'website':
      case 'vps':
      case 'marketing':
      case 'users':
        return isAdmin;
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        authNotification,
        setAuthNotification,
        showToast: (t) => setAuthNotification(t),
        activeStateFilter,
        setStateFilter,
        activeDistrictFilter: activeStateFilter, // alias for backwards compatibility
        setDistrictFilter: setStateFilter,
        updateProfile,
        isAdmin,
        isSales,
        isSuperAdmin: isAdmin, // backwards compatibility
        isDistrictManager: isSales,
        isSalesExecutive: isSales,
        canAccessTab,
        currentRole: getRoleById(user?.role || 'sales')
      }}
    >
      {children}

      {/* Floating Global Auth Toast Notification (Top Center, Maximum Visibility) */}
      {authNotification && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999999,
          }}
          className="flex items-center gap-3.5 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 min-w-[320px] max-w-md backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white tracking-tight leading-tight">
              {authNotification.title}
            </h4>
            {authNotification.message && (
              <p className="text-[11px] font-medium text-slate-300 mt-0.5 leading-snug">
                {authNotification.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAuthNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer ml-1 text-sm font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
