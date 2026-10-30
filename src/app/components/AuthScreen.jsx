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
  Building2,
  ShieldCheck,
  Activity,
  HeartPulse,
  Stethoscope,
  Dna,
  Check,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { USER_ROLES, DEMO_USERS } from '../../data/roles';
import { ALL_INDIAN_STATES } from '../../data/indianDistricts';

// Biomedical Equipment Categories Showcase
const BIOMEDICAL_EQUIPMENT_TAGS = [
  { icon: '🫁', name: 'ICU Ventilators' },
  { icon: '💓', name: 'Multi-Para Monitors' },
  { icon: '🔬', name: 'Modular OT Lights' },
  { icon: '🩸', name: 'Dialysis Machines' },
  { icon: '⚡', name: 'Biphasic Defibrillators' }
];

export default function AuthScreen({ initialMode = 'login', redirectTo = '/' }) {
  const router = useRouter();
  const { user, login, signup, loading: authLoading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('admin@rajbiosis.com');
  const [loginPassword, setLoginPassword] = useState('admin@rajbiosis');

  // Signup state (Only 2 Roles: admin or sales, and Only State: no districts!)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('sales'); // 'admin' | 'sales'
  const [selectedState, setSelectedState] = useState('Rajasthan');
  const [organization, setOrganization] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, redirectTo, router]);

  // Quick fill demo user
  const handleDemoFill = async (demoUser) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await login(demoUser.email, demoUser.password);
      if (res.success) {
        setSuccessMessage(`Logged in as ${demoUser.fullName}!`);
        setTimeout(() => router.push(redirectTo), 400);
      } else {
        setErrorMessage(res.error || 'Login failed');
      }
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
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
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success) {
        setSuccessMessage('Login successful! Redirecting to Biomedical Hub...');
        setTimeout(() => router.push(redirectTo), 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
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
    <div className="min-h-screen bg-slate-100/90 flex items-center justify-center py-8 px-4 font-sans text-slate-800 overflow-y-auto">
      
      {/* Centered Biomedical Distributor Card */}
      <div className={`bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 w-full ${mode === 'signup' ? 'max-w-lg' : 'max-w-md'} p-6 sm:p-8 transition-all duration-200 relative overflow-hidden`}>
        
        {/* Subtle Top Medical Gradient Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-600"></div>

        {/* Brand Header with Biomedical Theme */}
        <div className="text-center mb-6 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold uppercase tracking-wider mb-3">
            <HeartPulse size={13} className="text-sky-600 animate-pulse" />
            <span>Biomedical & ICU Equipment Distributor Portal</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-2xl p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img src="/rajbiosis-logo.png" alt="Raj Biosis" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                RAJ BIOSIS
              </h1>
              <p className="text-[11px] font-semibold text-slate-500">
                Hospital Equipment & Multi-Brand Sales Hub
              </p>
            </div>
          </div>

          {/* Biomedical Equipment Showcase Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {BIOMEDICAL_EQUIPMENT_TAGS.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80 text-[10px] font-medium"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-sky-700 shadow-xs'
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
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Staff Account
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* LOGIN FORM                                                           */}
        {/* ==================================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <span 
                  onClick={() => alert('Password reset verification has been sent to your registered contact.')}
                  className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-sm tracking-wide transition cursor-pointer shadow-lg shadow-sky-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-sky-400"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In / Login Karo</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ==================================================================== */}
        {/* SIGNUP FORM (ONLY 2 ROLES: ADMIN OR SALES | ONLY STATE SELECTION)     */}
        {/* ==================================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            
            {/* 1. ROLE SELECTION: EXACTLY 2 ROLES (ADMIN OR SALES) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Select Portal Role *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setSelectedState('All India (Pan-India HQ)');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedRole === 'admin'
                      ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Admin</div>
                      <div className="text-[10px] text-slate-500">Central HQ Control</div>
                    </div>
                  </div>
                  {selectedRole === 'admin' && (
                    <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Sales Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('sales');
                    if (selectedState === 'All India (Pan-India HQ)') {
                      setSelectedState('Rajasthan');
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedRole === 'sales'
                      ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💼</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Sales</div>
                      <div className="text-[10px] text-slate-500">Hospital Quotations</div>
                    </div>
                  </div>
                  {selectedRole === 'sales' && (
                    <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 2. STATE SELECTION (ONLY STATE DROPDOWN, NO DISTRICTS!) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Assigned State Territory *
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-2.5 text-rose-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-bold cursor-pointer"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (+91) *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@rajbiosis.com"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Org Name</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Raj Biosis Sales"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password (Min. 6 chars) *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full pl-8 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-sky-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm tracking-wide transition cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create {selectedRole === 'admin' ? 'Admin' : 'Sales'} Account / Submit</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Fast Test Logins (Admin & Sales) */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 text-center">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            1-Click Demo Logins:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoFill(demo)}
                className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>{demo.avatar}</span>
                <span>{demo.role === 'admin' ? 'Admin HQ' : `Sales (${demo.state})`}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
