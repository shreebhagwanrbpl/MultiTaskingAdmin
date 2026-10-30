'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HeartPulse,
  Check,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { USER_ROLES, DEMO_USERS } from '../../data/roles';
import { ALL_INDIAN_STATES } from '../../data/indianDistricts';
import BiomedicalLeftAnimation from './BiomedicalLeftAnimation';

export default function AuthScreen({ initialMode = 'login', redirectTo = '/' }) {
  const router = useRouter();
  const { user, login, signup, loading: authLoading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [logoutNotice, setLogoutNotice] = useState('');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('admin@rajbiosis.com');
  const [loginPassword, setLoginPassword] = useState('admin@rajbiosis');

  // Signup state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('sales');
  const [selectedState, setSelectedState] = useState('Rajasthan');
  const [organization, setOrganization] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, redirectTo, router]);

  // Check for logout message
  useEffect(() => {
    try {
      const msg = localStorage.getItem('rbpl_logout_msg');
      if (msg) {
        setLogoutNotice(msg);
        localStorage.removeItem('rbpl_logout_msg');
      }
    } catch (e) {}
  }, []);

  // Auto-dismiss in-card notifications after 2.5 seconds
  useEffect(() => {
    if (!logoutNotice) return;
    const timer = setTimeout(() => setLogoutNotice(''), 2500);
    return () => clearTimeout(timer);
  }, [logoutNotice]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Quick fill demo user
  const handleDemoFill = async (demoUser) => {
    setIsLoading(true);
    setErrorMessage('');
    setLogoutNotice('');
    try {
      const res = await login(demoUser.email, demoUser.password);
      if (res.success) {
        setSuccessMessage('Logged in Successfully');
        setTimeout(() => {
          if (redirectTo) router.push(redirectTo);
        }, 300);
      } else {
        setErrorMessage(res.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (e) {
      setErrorMessage(e.message);
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter Email/Phone and Password');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setLogoutNotice('');
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success) {
        setSuccessMessage('Logged in Successfully');
        setTimeout(() => {
          if (redirectTo) router.push(redirectTo);
        }, 300);
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error');
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: selectedRole,
        state: selectedState,
        organization: organization.trim() || 'Raj Biosis Biomedical Sales Network'
      });
      if (res.success) {
        setSuccessMessage('Biomedical account created! Entering portal...');
        setTimeout(() => router.push(redirectTo), 500);
      } else {
        setErrorMessage(res.error || 'Signup failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Signup error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fixed viewport with zero screen scrolling
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#080E1C] font-sans text-slate-800">

      {/* =================================================================== */}
      {/* LEFT SIDE: BIOMEDICAL TECH ANIMATION (APPROVED BY USER)             */}
      {/* =================================================================== */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] h-full relative overflow-hidden border-r border-slate-800/80">
        <BiomedicalLeftAnimation />
      </div>

      {/* =================================================================== */}
      {/* RIGHT SIDE: ELEVATED LUXURY LOGIN CARD (FIXED SCREEN, PROPER COLOR) */}
      {/* =================================================================== */}
      <div className="w-full lg:w-[45%] xl:w-[42%] h-full max-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50/30 overflow-hidden relative">

        {/* Soft Ambient Glow in the background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Elevated Luxury Card */}
        <div className={`w-full ${mode === 'signup' ? 'max-w-[460px]' : 'max-w-[420px]'} bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] p-6 sm:p-7 relative z-10 transition-all duration-300 overflow-hidden my-auto`}>

          {/* Subtle Top Medical Gradient Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-600" />

          {/* Header Branding */}
          <div className="flex items-center gap-3.5 mb-5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 p-2 border border-slate-200/90 shadow-xs flex items-center justify-center shrink-0 ring-4 ring-slate-100/80">
              <img src="/rajbiosis-logo.png" alt="Raj Biosis" className="w-full h-full object-contain filter drop-shadow-2xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  RAJ BIOSIS
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-extrabold border border-sky-200/80 tracking-wide uppercase">
                  Hub Portal
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Admin & Employee Panel
              </p>
            </div>
          </div>

          {/* Segmented Mode Switcher Tabs */}
          <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-4 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Sign In to Hub
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Create Staff Account
            </button>
          </div>

          {/* Error / Success / Logout Notifications */}
          {logoutNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs flex items-center justify-between gap-2.5 font-bold shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-emerald-950">Logged out successfully</div>
                  <div className="text-[10px] font-semibold text-emerald-700">You have been safely signed out.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogoutNotice('')}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer font-bold"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs flex items-center justify-between gap-2.5 font-bold shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-emerald-950">Logged in Successfully</div>
                  <div className="text-[10px] font-semibold text-emerald-700">Entering Biomedical Hub...</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage('')}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer font-bold"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================================================================ */}
          {/* LOGIN FORM                                                       */}
          {/* ================================================================ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Official Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin@rajbiosis.com or 9876543210"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Password</label>
                  <span
                    onClick={() => alert('Password reset verification has been sent to your registered contact.')}
                    className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter secret password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all font-semibold shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-extrabold text-sm tracking-wide transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 border mt-1 active:scale-[0.99] disabled:opacity-50 ${
                  successMessage
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 hover:from-sky-700 hover:via-indigo-700 hover:to-sky-700 text-white border-sky-400/60 shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/30'
                }`}
              >
                {successMessage ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Logged in Successfully!</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Hub</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================ */}
          {/* SIGNUP FORM                                                       */}
          {/* ================================================================ */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Select Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setSelectedState('All India (Pan-India HQ)');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${selectedRole === 'admin'
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Admin</div>
                    </div>
                    {selectedRole === 'admin' && <Check size={14} className="text-purple-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('sales');
                      if (selectedState === 'All India (Pan-India HQ)') {
                        setSelectedState('Rajasthan');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${selectedRole === 'sales'
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">💼</span>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Sales Staff</div>
                    </div>
                    {selectedRole === 'sales' && <Check size={14} className="text-sky-600" />}
                  </button>
                </div>
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Assigned State *
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={selectedRole === 'admin'}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-semibold disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer shadow-2xs"
                  >
                    {selectedRole === 'admin' ? (
                      <option value="All India (Pan-India HQ)">All India (Pan-India HQ Control)</option>
                    ) : (
                      ALL_INDIAN_STATES.filter(s => s !== 'All India (Pan-India HQ)').map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-semibold shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-semibold shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rajbiosis.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-semibold shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Password (min 6 chars) *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-semibold shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wide transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 border border-emerald-400 mt-1"
              >
                <span>Create Staff Account</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Official Enterprise Compliance & Verification Footer (Only on Login tab, hidden on Create Staff Account) */}
          {mode === 'login' && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>Verified</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Raj Biosis Central Support Desk:\nEmail: support@rajbiosis.com\nToll-Free: 1800-RAJ-BIOSIS\nOfficial Hospital Distributor Helpline')}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>HQ Support</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 text-sky-600">
                  <Lock size={14} />
                </div>
                <div className="leading-tight">
                  <div className="text-[11px] font-bold text-slate-900">
                    Authorized Personnel
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    End-to-endencrypted.
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-[10px] text-slate-400 font-medium">
                © 2026 Raj Biosis Private Limited
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
