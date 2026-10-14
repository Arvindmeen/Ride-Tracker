import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench, Sparkles, X, Check, Copy, ArrowRight, ShieldCheck,
  AlertCircle, CheckCircle2, User, Car, Zap, Activity
} from 'lucide-react';
import { useAuthStore } from '@/stores';

const DEMO_LIST = [
  {
    role: 'Passenger',
    icon: '👤',
    email: 'rahul@ridetracker.in',
    password: 'password123',
    desc: 'Book rides, track GPS, and view trips',
    badge: 'Passenger',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    link: '/login?role=USER',
  },
  {
    role: 'Driver Partner',
    icon: '🚗',
    email: 'driver@ridetracker.in',
    password: 'password123',
    desc: 'Go online, accept requests, simulator',
    badge: 'Driver',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    link: '/login?role=DRIVER',
  },
  {
    role: 'Admin Operations',
    icon: '⚡',
    email: 'admin@ridetracker.in',
    password: 'admin123',
    desc: 'Real-time telemetry, fleet & pricing control',
    badge: 'Admin',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    link: '/login?role=ADMIN',
  },
];

export default function MaintenanceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    showBetaNotice,
    closeBetaNotice,
    isAuthenticated,
    user,
    role
  } = useAuthStore();

  // 1. Every time user logs in: show beta notice popup immediately
  useEffect(() => {
    const isLoginTriggered = showBetaNotice || (typeof window !== 'undefined' && sessionStorage.getItem('veloq_show_beta_modal') === 'true');
    if (isLoginTriggered) {
      const timer = setTimeout(() => setIsOpen(true), 200);
      return () => clearTimeout(timer);
    }
  }, [showBetaNotice, location.pathname]);

  // 2. Also pop up on first visit if visitor hasn't seen it yet
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('veloq_maint_modal_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('veloq_maint_modal_seen', 'true');
    sessionStorage.removeItem('veloq_show_beta_modal');
    closeBetaNotice?.();
  };

  const handleNavigateToLogin = (path) => {
    handleDismiss();
    navigate(path);
  };

  const handleCopy = (text, key, e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  if (!isOpen) return null;

  const roleLabel = role === 'ADMIN'
    ? 'Operations Command Admin'
    : role === 'DRIVER'
    ? 'Verified Driver Partner'
    : 'Verified Passenger';

  const roleBadgeColor = role === 'ADMIN'
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : role === 'DRIVER'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in transition-all font-sans">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Modal Card */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badge & Title */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Wrench size={13} className="text-amber-600 animate-pulse" />
              <span>Beta Version · Under Active Maintenance</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {isAuthenticated ? 'Beta Sandbox Notice' : 'Platform Notice & Demo Preview'}
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome to <strong className="text-slate-900 font-bold">Ride Tracker</strong>! This release is currently in <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">v1.0-Beta</span> and undergoing <span className="font-semibold text-slate-900">active maintenance & performance testing</span>.
          </p>

          {/* Logged-In User Active Session Card */}
          {isAuthenticated && user && (
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-indigo-100 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-500" />
                  <span>Active Session Clearance</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {roleBadgeColor.includes('purple') ? '🛡️ Admin' : roleBadgeColor.includes('emerald') ? '🚗 Driver' : '👤 Passenger'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {role === 'ADMIN' ? '🛡️' : role === 'DRIVER' ? '🚗' : '👤'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name || 'Ride Tracker Member'}</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email || 'Logged in'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sandbox Highlights */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-slate-700">
                <strong>Simulated GPS & Redis Dispatches:</strong> Rides, maps, and drivers are live in an active testing sandbox.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-slate-700">
                <strong>No Real Bank Charges:</strong> Fares, driver payouts (88%), and company fee (12%) use mock UPI transfers.
              </p>
            </div>
          </div>

          {/* Test Credentials Box (Shown for visitors or when switching accounts) */}
          {!isAuthenticated && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wide text-slate-800">
                    Testing Credentials
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  1-Click Ready ⚡
                </span>
              </div>

              <div className="space-y-2">
                {DEMO_LIST.map((demo) => (
                  <div
                    key={demo.role}
                    onClick={() => handleNavigateToLogin(demo.link)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl p-1 rounded-lg bg-slate-50 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {demo.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{demo.role}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${demo.badgeColor}`}>
                            {demo.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
                          <span className="text-slate-700 font-semibold truncate">{demo.email}</span>
                          <span>/</span>
                          <span className="text-slate-500">{demo.password}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(`${demo.email} / ${demo.password}`, demo.role, e)}
                        title="Copy credentials"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedKey === demo.role ? (
                          <Check size={13} className="text-emerald-600 font-bold" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
                        <span>Login</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDismiss}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>OK, Got It! Continue</span>
              <Check size={16} />
            </button>

            {!isAuthenticated && location.pathname !== '/login' && (
              <button
                onClick={() => handleNavigateToLogin('/login')}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Go to Login</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-4">
            🔒 Sandbox Environment · No actual monetary transactions executed
          </p>
        </div>
      </div>
    </div>
  );
}
