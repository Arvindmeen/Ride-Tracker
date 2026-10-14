import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, X, Sparkles, Check, User, Car, Shield } from 'lucide-react';

const QUICK_ROLES = [
  {
    role: 'Passenger / Rider',
    id: 'USER',
    icon: '👤',
    email: 'rahul@ridetracker.in',
    password: 'password123',
    desc: 'Book rides, track GPS, and view trips',
    badge: 'Passenger',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    redirect: '/login?role=USER&redirect=/app/home',
  },
  {
    role: 'Driver Partner',
    id: 'DRIVER',
    icon: '🚗',
    email: 'driver@ridetracker.in',
    password: 'password123',
    desc: 'Accept rides & driver simulator',
    badge: 'Driver',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    redirect: '/login?role=DRIVER',
  },
  {
    role: 'Admin Operations',
    id: 'ADMIN',
    icon: '⚡',
    email: 'admin@ridetracker.in',
    password: 'admin123',
    desc: 'Fleet telemetry & control center',
    badge: 'Admin',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    redirect: '/login?role=ADMIN',
  },
];

export default function AuthRequiredModal({ isOpen, onClose, actionName = 'book a ride' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectRole = (redirectUrl) => {
    onClose();
    navigate(redirectUrl);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in"
      >
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7">
          {/* Lock Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
              <Lock size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Authentication Required
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Please Sign In to Continue
              </h2>
            </div>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
            You must be signed in to <strong className="text-slate-900 font-bold">{actionName}</strong>, track live GPS drivers, or view trip receipts.
          </p>

          {/* Quick 1-Click Testing Accounts */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600" />
                <span>1-Click Test Sign In</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-600">Auto-Fills Instantly ⚡</span>
            </div>

            <div className="space-y-2">
              {QUICK_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRole(r.redirect)}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg p-1 rounded-lg bg-slate-50 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {r.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{r.role}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md border ${r.badgeColor}`}>
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {r.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0">
                    <span>Sign In</span>
                    <ArrowRight size={11} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectRole('/login?role=USER&redirect=/app/home')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Sign In Page</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('/register')}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
