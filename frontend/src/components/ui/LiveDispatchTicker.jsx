import React, { useEffect, useState } from 'react';
import { useDispatchStore } from '@/stores';
import { dispatchSimulation } from '@/services/dispatchSimulation';
import { 
  Radio, 
  Activity, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Navigation,
  Car,
  Bike
} from 'lucide-react';

export default function LiveDispatchTicker() {
  const { 
    liveDispatches, 
    nationalFleetCount, 
    activeTrips, 
    acceptanceRate,
    isTickerExpanded, 
    setTickerExpanded, 
    setDispatchState,
    addDispatch
  } = useDispatchStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewPing, setIsNewPing] = useState(false);

  // Initialize and subscribe to simulation engine
  useEffect(() => {
    dispatchSimulation.start();

    const unsubscribe = dispatchSimulation.subscribe((event) => {
      if (event.type === 'RIDE_ACCEPTED') {
        addDispatch(event.dispatch);
        setDispatchState({ stats: event.stats });
        setIsNewPing(true);
        setTimeout(() => setIsNewPing(false), 900);
      }
    });

    return () => {
      unsubscribe();
      dispatchSimulation.stop();
    };
  }, [addDispatch, setDispatchState]);

  // Rotate through recent dispatches every 3.5s
  useEffect(() => {
    if (!liveDispatches || liveDispatches.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveDispatches.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [liveDispatches]);

  const activeDispatch = liveDispatches[currentIndex] || liveDispatches[0];

  return (
    <div className="z-30 transition-all duration-300 pointer-events-auto">
      {/* ── Compact / Expanded Glass HUD ── */}
      <div className={`backdrop-blur-xl bg-slate-900/90 border border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
        isTickerExpanded ? 'p-3' : 'px-3 py-1.5'
      }`}>
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isNewPing ? 'animate-ping' : 'animate-pulse'}`} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wider text-emerald-400 uppercase text-[10px] flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              Live All-India Dispatch
            </span>
          </div>

          {/* Quick Metrics (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 text-slate-300 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="font-bold text-white">{(nationalFleetCount || 11560).toLocaleString('en-IN')}</span>
              <span className="text-slate-400">Online Fleet</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="font-bold text-white">{(activeTrips || 1842).toLocaleString('en-IN')}</span>
              <span className="text-slate-400">Trips Active</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="font-bold text-emerald-400">{acceptanceRate || 98.6}%</span>
              <span className="text-slate-400">Match Rate</span>
            </div>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setTickerExpanded(!isTickerExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isTickerExpanded ? 'Collapse Ticker' : 'Expand Ticker'}
          >
            {isTickerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic Dispatch Live Stream (when expanded) */}
        {isTickerExpanded && activeDispatch && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                {activeDispatch.category === 'MOTO' ? (
                  <Bike className="w-3.5 h-3.5" />
                ) : (
                  <Car className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-200 truncate">
                  <span className="font-semibold text-white">{activeDispatch.driverName}</span>
                  <span className="text-slate-400 text-[11px]">({activeDispatch.vehicleModel || 'Cab'})</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                  <Navigation className="w-2.5 h-2.5 text-slate-500" />
                  <span>{activeDispatch.pickupArea || activeDispatch.cityName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">₹{activeDispatch.fare}</span>
                  <span className="text-slate-600">•</span>
                  <span>ETA {activeDispatch.etaMinutes || 3}m</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 text-right text-[10px] text-slate-500 font-mono">
              Just now
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
