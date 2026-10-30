'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleById, USER_ROLES } from '../data/roles';

const AuthContext = createContext(null);

const STORAGE_KEY = 'rbpl_current_user_session';
const TOKEN_KEY = 'rbpl_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStateFilter, setActiveStateFilter] = useState('all');
  const router = useRouter();

  // Hydrate user from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.state && parsed.state !== 'All India (HQ)') {
          setActiveStateFilter(parsed.state);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (data.user.state && data.user.state !== 'All India (HQ)') {
        setActiveStateFilter(data.user.state);
      } else {
        setActiveStateFilter('all');
      }

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

      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = 'rbpl_auth_token=; Max-Age=0; path=/;';
    } catch (e) {
      // safe
    }
    router.push('/login');
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
