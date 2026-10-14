import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Wrench, Sparkles, X, ChevronRight, KeyRound } from 'lucide-react';

export default function MaintenanceBanner() {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('veloq_maint_banner_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('veloq_maint_banner_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md text-xs font-medium transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Status & Message */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-100" />
          </span>

          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-100 border border-white/10 flex-shrink-0">
            <Wrench size={11} className="animate-pulse" />
            <span>Beta Maintenance</span>
          </div>

          <p className="text-white/95 text-xs font-semibold truncate sm:whitespace-normal">
            Platform is currently under <strong className="font-extrabold text-white underline decoration-amber-200/60">active development & testing</strong>. Features are in sandbox preview.
          </p>
        </div>

        {/* Right Side: Quick Action & Dismiss */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          {location.pathname !== '/login' && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1 bg-white text-orange-900 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-xs hover:bg-amber-50 active:scale-95 transition-all"
            >
              <KeyRound size={12} className="text-orange-600" />
              <span>Test Credentials</span>
              <ChevronRight size={12} />
            </Link>
          )}

          <button
            onClick={handleDismiss}
            title="Dismiss notice for this session"
            className="p-1 hover:bg-black/15 rounded-md text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
