import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Car, Users, LayoutDashboard, Radio, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores';

export default function AdminSimulationBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const [minimized, setMinimized] = useState(false);

  // Check if current user is an admin
  const isSuperAdmin = user?.role === 'ADMIN' || role === 'ADMIN';

  // Only display if user is an admin AND currently browsing driver or passenger simulation views
  const isDriverView = location.pathname.startsWith('/driver') || location.pathname === '/drive';
  const isPassengerView = location.pathname.startsWith('/app');

  const isSimulating = isDriverView || isPassengerView;

  if (!isSuperAdmin || !isSimulating) {
    return null;
  }

  const viewName = isDriverView
    ? 'Driver Cockpit & Dispatch Simulator'
    : 'Passenger App & Booking Simulator';

  // Minimized floating pill (in case user wants maximum viewport real estate)
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-1.5 bg-indigo-950/95 text-white border border-indigo-500/50 rounded-2xl p-1.5 pl-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck size={15} className="text-emerald-400" />
            <span className="text-xs font-black tracking-tight hover:text-indigo-200 transition-colors">
              Admin Hub
            </span>
          </div>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="ml-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1 rounded-xl text-[11px] shadow-sm flex items-center gap-1 transition-all cursor-pointer"
            title="Return to Admin Dashboard"
          >
            <span>Exit</span>
            <ArrowRight size={11} />
          </button>

          <button
            onClick={() => setMinimized(false)}
            className="p-1 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900 transition-colors"
            title="Expand Admin Banner"
          >
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-700/60 shadow-md z-30 transition-all animate-in slide-in-from-top-1 duration-200 font-sans">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/60 border border-indigo-400/50 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} className="text-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
              Admin Simulator Mode:
            </span>
            <span className="text-xs font-bold text-indigo-200 bg-indigo-900/60 border border-indigo-700/60 px-2 py-0.5 rounded-lg truncate">
              {viewName}
            </span>
          </div>
        </div>

        {/* Center / Right: Quick Navigation & Return Button */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Quick Switchers */}
          <div className="hidden md:flex items-center gap-1 bg-black/30 border border-indigo-800/60 rounded-xl p-0.5">
            <Link
              to="/driver/dashboard"
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                isDriverView
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Car size={11} />
              <span>Driver Cockpit</span>
            </Link>

            <Link
              to="/app/home"
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                isPassengerView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users size={11} />
              <span>Rider View</span>
            </Link>
          </div>

          {/* Master 1-Tap Return Button */}
          <Link
            to="/admin/dashboard"
            className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer"
            title="Return back to Operations Admin Dashboard"
          >
            <LayoutDashboard size={13} />
            <span>Return to Admin Hub</span>
            <ArrowRight size={13} className="shrink-0" />
          </Link>

          {/* Minimize toggle */}
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900/80 transition-colors"
            title="Minimize banner"
            aria-label="Minimize Admin Banner"
          >
            <ChevronDown size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
