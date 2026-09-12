import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Navigation, Clock, Star, Shield, ArrowRight, X, ChevronDown,
  ChevronUp, CheckCircle2, DollarSign, Smartphone, Zap, AlertCircle, Volume2
} from 'lucide-react';
import { useDriverStore } from '@/stores';

// Optional subtle synthetic chime using Web Audio API (safe, zero external asset dependencies)
function playDispatchChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // AudioContext blocked or not allowed by browser policy
  }
}

export default function DriverIncomingToast() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    status,
    activeRide,
    pendingRequests,
    acceptRide,
    clearRequests,
    vehicleType,
  } = useDriverStore();

  const [expanded, setExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const lastRequestIdRef = useRef(null);

  const request = pendingRequests && pendingRequests.length > 0 ? pendingRequests[0] : null;

  // Sound chime when a new request arrives
  useEffect(() => {
    if (request && request.id !== lastRequestIdRef.current && status === 'AVAILABLE' && !activeRide) {
      lastRequestIdRef.current = request.id;
      playDispatchChime();
      setSecondsLeft(45);
      setExpanded(false); // Start in clean compact mode
    }
  }, [request, status, activeRide]);

  // Countdown timer: request stays until picked or declined or timeout
  useEffect(() => {
    if (!request || activeRide || status !== 'AVAILABLE') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearRequests();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request, activeRide, status, clearRequests]);

  // Strict rule: if on active trip OR status is not available OR no requests, don't show toast
  // Also suppress on /driver/dashboard to avoid duplicate popups with the native bottom offer card
  if (!request || activeRide || status !== 'AVAILABLE' || location.pathname === '/driver/dashboard' || location.pathname === '/driver') {
    return null;
  }

  const grossFare = request.estimatedFare || 140;
  const commission = Math.round(grossFare * 0.12 * 10) / 10;
  const netEarnings = Math.round((grossFare - commission) * 10) / 10;

  const handleAccept = () => {
    acceptRide(request);
    navigate(`/driver/ride/${request.id}`);
  };

  const handleDecline = () => {
    clearRequests();
  };

  const is100Km = request.is100KmOutstation || (request.estimatedDistance && request.estimatedDistance >= 80);

  return (
    <aside
      role="region"
      aria-label="Incoming ride dispatch notification"
      className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[440px] pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300"
    >
      <div className={`rounded-3xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-200 overflow-hidden ${
        is100Km
          ? 'bg-slate-900/98 text-white border-amber-400/90 shadow-amber-500/20'
          : 'bg-slate-900/98 text-white border-emerald-400/90 shadow-emerald-500/20'
      }`}>
        
        {/* ── Top Header Bar with Live Countdown ──────────────────────────────── */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${is100Km ? 'bg-amber-400' : 'bg-emerald-400'} animate-ping`} />
            <span className="font-black tracking-wide text-white uppercase text-[11px] flex items-center gap-1">
              <Zap size={13} className={is100Km ? 'text-amber-400' : 'text-emerald-400'} />
              {is100Km ? '100+ KM Outstation Dispatch' : 'New Ride Dispatch'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono flex items-center gap-1 ${
              secondsLeft <= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}>
              <Clock size={11} />
              <span>{secondsLeft}s</span>
            </div>
            <button
              onClick={handleDecline}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Decline request"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Main Compact Information ────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Fare & ETA Hero Line */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{grossFare}
                </span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  Net: ₹{netEarnings}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                12% Platform Fee · Guaranteed Daily UPI Payout
              </p>
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                is100Km
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-blue-400/20 text-blue-300 border-blue-400/40'
              }`}>
                {request.estimatedDistance || 4.2} km · {request.estimatedDuration || 12}m
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Pickup {request.pickupEtaMins || 2} mins away
              </p>
            </div>
          </div>

          {/* Route Summary */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Pickup</p>
                <p className="font-bold text-slate-200 truncate">{request.pickup?.name || 'Pickup Point'}</p>
              </div>
            </div>

            <div className="border-l border-dashed border-slate-700 ml-1 pl-3 my-0.5" />

            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Destination</p>
                <p className="font-bold text-slate-200 truncate">{request.destination?.name || 'Dropoff Location'}</p>
              </div>
            </div>
          </div>

          {/* Proximity Priority Badge */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-tight font-medium">
              <strong>Closest Driver Priority:</strong> User pickup is {request.pickupDistanceToDriver || 0.7} km from you.
            </span>
          </div>

          {/* ── Expanded Full Details (Accordion) ─────────────────────────────── */}
          {expanded && (
            <div className="pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              {/* Passenger Card */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    {request.userName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-white">{request.userName || 'Passenger'}</p>
                      <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded font-bold border border-blue-700/60">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-400 flex items-center gap-1">
                      ★ {request.userRating || 4.9} · 34 Past Trips
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {request.paymentMethod || 'UPI'}
                </span>
              </div>

              {/* Complete Financial Breakdown */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Transparent Earnings Breakdown
                </p>
                <div className="flex justify-between text-slate-300">
                  <span>Customer Gross Fare:</span>
                  <span className="font-bold">₹{grossFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Commission (12%):</span>
                  <span>-₹{commission.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-800 flex justify-between text-emerald-400 font-black text-xs">
                  <span>Net Credited to Driver UPI:</span>
                  <span>₹{netEarnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Special Note */}
              <div className="text-[10px] text-slate-400 italic px-1">
                {request.proximityNote || 'Request will be assigned to next driver if not accepted before timer expires.'}
              </div>
            </div>
          )}

          {/* ── Action Buttons ──────────────────────────────────────────────── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <span>{expanded ? 'Hide Details' : 'View Full Details'}</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                onClick={handleDecline}
                className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-bold transition-all border border-red-800/60"
                title="Decline request"
              >
                Decline
              </button>
            </div>

            <button
              onClick={handleAccept}
              className={`w-full py-3 px-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                is100Km
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
              }`}
            >
              <span>Accept & Start Trip</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
}
