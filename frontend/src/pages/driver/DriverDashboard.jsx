import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, MapPin, DollarSign, Clock,
  Volume2, VolumeX, ArrowRight, CheckCircle2, Zap,
  FlaskConical, X, ChevronDown, ChevronUp, Navigation,
  Shield, Compass, Sparkles, User, AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDriverStore, useMapStore } from '@/stores';
import { rideService, rideSync } from '@/services';
import { Spinner } from '@/components/ui';
import { REGIONS } from '@/constants';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

// Diverse real-world Indian requests including 100+ km Outstation and Local Trips
const DEMO_REQUESTS = {
  OUTSTATION_100KM_KGP: {
    id: 'REQ-OUTSTATION-124KM',
    userId: 'U-KGP-91',
    userName: 'Debanjan Chatterjee (IIT KGP PhD)',
    userRating: 4.96,
    userRides: 142,
    pickup: { lat: 22.3150, lng: 87.3050, name: 'Scholars Avenue, RK Hall (IIT KGP)' },
    destination: { lat: 22.6547, lng: 88.4467, name: 'Kolkata Airport (CCU Terminal 2 Outstation)' },
    estimatedFare: 2680,
    estimatedDistance: 124.0, // 100+ km outstation trip
    estimatedDuration: 135, // 2h 15m
    category: 'CAR',
    paymentMethod: 'UPI',
    is100KmOutstation: true,
    pickupDistanceToDriver: 0.7, // Only 0.7 km from driver!
    pickupEtaMins: 2,
    proximityNote: 'Closest Driver Priority: User pickup is only 0.7 km from your current spot.',
    requestedAt: new Date().toISOString(),
  },
  CAMPUS_LOCAL_KGP: {
    id: 'REQ-LOCAL-2KM',
    userId: 'U-KGP-22',
    userName: 'Sneha Mondal (IIT KGP)',
    userRating: 4.92,
    userRides: 38,
    pickup: { lat: 22.3155, lng: 87.3055, name: 'Scholars Avenue (Patel Hall Gate)' },
    destination: { lat: 22.3190, lng: 87.3040, name: 'Technology Market (Tech Mkt)' },
    estimatedFare: 28,
    estimatedDistance: 2.2,
    estimatedDuration: 6,
    category: 'BIKE',
    paymentMethod: 'UPI',
    is100KmOutstation: false,
    pickupDistanceToDriver: 0.3, // 0.3 km from driver
    pickupEtaMins: 1,
    proximityNote: 'Immediate Proximity: Passenger is 0.3 km from your current GPS spot.',
    requestedAt: new Date().toISOString(),
  },
  OUTSTATION_100KM_METRO: {
    id: 'REQ-OUTSTATION-142KM',
    userId: 'U-IND-88',
    userName: 'Rajiv Singhania (Corporate)',
    userRating: 4.94,
    userRides: 219,
    pickup: { lat: 19.0607, lng: 72.8688, name: 'Bandra-Kurla Complex (BKC), Mumbai' },
    destination: { lat: 18.5913, lng: 73.7389, name: 'Hinjewadi Tech Park Phase 1, Pune (Expressway)' },
    estimatedFare: 3150,
    estimatedDistance: 142.0, // 100+ km outstation trip
    estimatedDuration: 160,
    category: 'CAR',
    paymentMethod: 'UPI',
    is100KmOutstation: true,
    pickupDistanceToDriver: 0.8, // 0.8 km from driver
    pickupEtaMins: 3,
    proximityNote: 'Closest Driver Priority: You are 0.8 km from pickup in BKC. Pune drivers (>140 km away) were not pinged.',
    requestedAt: new Date().toISOString(),
  },
};

// Web Audio API chime for incoming request alert
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext might be blocked until user interacts
  }
}

function RequestCountdown({ initialSeconds = 45, onExpire }) {
  const [sec, setSec] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExpire]);

  const percent = Math.max(0, (sec / initialSeconds) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-1000',
            sec <= 10 ? 'bg-rose-500' : 'bg-emerald-400'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={clsx(
        'font-mono text-xs font-black flex items-center gap-1',
        sec <= 10 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
      )}>
        <Clock size={12} />
        {sec}s
      </span>
    </div>
  );
}

export default function DriverDashboard() {
  const {
    status,
    vehicleType,
    setVehicleType,
    operatingScope,
    setOperatingScope,
    pickupRadiusKm,
    setPickupRadiusKm,
    todayEarnings,
    todayRides,
    onlineMinutes,
    rating,
    activeRide,
    pendingRequests,
    goOnline,
    goOffline,
    addRequest,
    clearRequests,
    acceptRide,
  } = useDriverStore();

  const { startSimulation, setRegion } = useMapStore();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [driverGps, setDriverGps] = useState({
    lat: 22.3150,
    lng: 87.3050,
    isLive: false,
    tracking: false,
  });

  // Sound trigger on new incoming request
  const prevReqCountRef = useRef(pendingRequests.length);
  useEffect(() => {
    if (pendingRequests.length > prevReqCountRef.current && soundEnabled) {
      playChime();
    }
    prevReqCountRef.current = pendingRequests.length;
  }, [pendingRequests.length, soundEnabled]);

  // Real device GPS detection for Driver Partner
  const detectDriverGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverGps({ lat: latitude, lng: longitude, isLive: true, tracking: true });
        setRegion('LIVE_GPS', { lat: latitude, lng: longitude }, 15);
      },
      () => {
        setDriverGps({ lat: 22.3149, lng: 87.3105, isLive: true, tracking: false });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Initialize simulation & GPS
  useEffect(() => {
    startSimulation();
    detectDriverGps();
  }, [startSimulation]);

  // Simulate incoming request when driver goes online
  useEffect(() => {
    if (status === 'AVAILABLE' && pendingRequests.length === 0 && !activeRide) {
      const timer = setTimeout(() => {
        const req = operatingScope === 'IIT_KGP'
          ? DEMO_REQUESTS.OUTSTATION_100KM_KGP
          : DEMO_REQUESTS.OUTSTATION_100KM_METRO;
        addRequest({ ...req, id: `REQ-${Date.now().toString().slice(-4)}` });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, pendingRequests.length, activeRide, operatingScope, addRequest]);

  const handleScopeChange = (scope) => {
    setOperatingScope(scope);
    clearRequests();
    if (scope === 'IIT_KGP') {
      setRegion('IIT_KGP', REGIONS.IIT_KGP.center, REGIONS.IIT_KGP.zoom);
    } else {
      setRegion('MUMBAI', REGIONS.MUMBAI.center, REGIONS.MUMBAI.zoom);
    }
  };

  const handleTriggerSpecificRequest = (type) => {
    clearRequests();
    let template;
    if (type === '100KM_OUTSTATION') {
      template = operatingScope === 'IIT_KGP'
        ? DEMO_REQUESTS.OUTSTATION_100KM_KGP
        : DEMO_REQUESTS.OUTSTATION_100KM_METRO;
    } else {
      template = DEMO_REQUESTS.CAMPUS_LOCAL_KGP;
    }
    addRequest({ ...template, id: `REQ-${Date.now().toString().slice(-4)}` });
    setShowSimMenu(false);
  };

  const handleAcceptTrip = (req) => {
    acceptRide(req);
    navigate(`/driver/ride/${req.id}`);
  };

  const currentRequest = pendingRequests[0];
  const netEarnings = currentRequest
    ? Math.round(currentRequest.estimatedFare * 0.88)
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-50 text-slate-900 font-sans select-none">
      {/* ── State-of-the-Art Floating Driver Cockpit Bar (Pristine Light Theme) ─── */}
      <header className="absolute top-3 inset-x-3 z-30 pointer-events-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Left Cluster: Status + Vehicle + Territory */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Online / Offline Switch */}
          <button
            onClick={status === 'OFFLINE' ? goOnline : goOffline}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-sm active:scale-95 border cursor-pointer',
              status === 'OFFLINE'
                ? 'bg-white/95 backdrop-blur-md border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                : 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20'
            )}
            title="Click to toggle your availability"
          >
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                status !== 'OFFLINE' ? 'bg-white animate-ping' : 'bg-slate-400'
              )}
            />
            <span>{status === 'OFFLINE' ? 'Offline' : 'Online'}</span>
          </button>

          {/* Vehicle Mode Pill */}
          <div className="bg-white/95 backdrop-blur-xl p-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-0.5">
            {[
              ['BIKE', '🏍️', 'Bike'],
              ['CAR', '🚗', 'Cab'],
              ['AUTO', '🛺', 'Auto'],
              ['XL', '🚐', 'XL'],
            ].map(([type, emoji, label]) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                  vehicleType === type
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <span>{emoji}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Operating Scope Pill */}
          <div className="bg-white/95 backdrop-blur-xl p-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-0.5">
            <button
              onClick={() => handleScopeChange('IIT_KGP')}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                operatingScope === 'IIT_KGP'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              🎓 IIT KGP
            </button>
            <button
              onClick={() => handleScopeChange('PAN_INDIA')}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                operatingScope === 'PAN_INDIA'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              🇮🇳 All-India
            </button>
          </div>
        </div>

        {/* Right Cluster: Radius + GPS + Sound + Dispatch Simulator */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Pickup Radius Selector */}
          <div className="bg-white/95 backdrop-blur-xl px-2 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-500 font-bold hidden md:inline">Radius:</span>
            {[3, 5, 10, 15].map((rad) => (
              <button
                key={rad}
                onClick={() => setPickupRadiusKm(rad)}
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                  pickupRadiusKm === rad
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {rad}k
              </button>
            ))}
          </div>

          {/* GPS Recenter */}
          <button
            onClick={detectDriverGps}
            className="bg-white/95 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Center GPS on your vehicle"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm transition-all cursor-pointer"
            title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
          >
            {soundEnabled ? <Volume2 size={15} className="text-emerald-600" /> : <VolumeX size={15} />}
          </button>

          {/* Simulation Dispatch Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSimMenu(!showSimMenu)}
              className={clsx(
                'px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-all border cursor-pointer',
                showSimMenu
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white/95 backdrop-blur-xl border-slate-200 text-amber-600 hover:bg-amber-50'
              )}
              title="Test ride dispatch simulation"
            >
              <Zap size={13} />
              <span className="hidden sm:inline">Test Dispatch</span>
            </button>

            {showSimMenu && (
              <div className="absolute right-0 top-10 z-40 bg-white border border-amber-300 rounded-2xl p-2 shadow-xl w-64 animate-in fade-in-50 zoom-in-95 text-slate-800">
                <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
                  <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={11} /> Instant Test Dispatches
                  </span>
                  <button onClick={() => setShowSimMenu(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={12} />
                  </button>
                </div>
                <button
                  onClick={() => handleTriggerSpecificRequest('100KM_OUTSTATION')}
                  className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900">🛣️ 100+ km Outstation</p>
                    <p className="text-[10px] text-slate-500">₹2,680 fare · Kolkata Airport</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">Net ₹2,358</span>
                </button>
                <button
                  onClick={() => handleTriggerSpecificRequest('LOCAL')}
                  className="w-full text-left p-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-xs font-semibold transition-all flex items-center justify-between mt-1 cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-900">⚡ Campus Local Ride</p>
                    <p className="text-[10px] text-slate-500">₹28 fare · Tech Market</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">Net ₹25</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Active Ride In-Progress Banner ─────────────────────────────────── */}
      {activeRide && (
        <div className="absolute top-16 inset-x-3 z-30 pointer-events-auto max-w-xl mx-auto">
          <Link
            to="/driver/ride"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-400/80 font-bold transition-all animate-pulse"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              <div>
                <p className="text-sm font-black text-white leading-tight">
                  Active Ride in Progress: {activeRide.userName || 'Passenger'}
                </p>
                <p className="text-[11px] text-emerald-100 font-semibold mt-0.5">
                  Heading to: {activeRide.destination?.name || activeRide.destination?.address || 'Destination'}
                </p>
              </div>
            </div>
            <span className="bg-white text-emerald-700 px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
              <span>Resume Trip</span>
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      )}

      {/* ── Main Map Canvas ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="bg-slate-100 w-full h-full flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <LiveMap
            zoom={operatingScope === 'IIT_KGP' ? 15 : 13}
            height="100%"
            showSurgeZones={status === 'AVAILABLE'}
            tileTheme="osm"
            activeDriverLocation={driverGps.isLive ? { lat: driverGps.lat, lng: driverGps.lng, category: vehicleType } : null}
            onRecenterGPS={detectDriverGps}
          />
        </Suspense>
      </div>

      {/* ── Central Dispatch Modal (Single Source of Truth, Uber Driver Style) ─── */}
      {status === 'AVAILABLE' && !activeRide && currentRequest && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/98 backdrop-blur-2xl rounded-3xl border-2 border-emerald-500 p-4 sm:p-5 shadow-2xl ring-1 ring-emerald-500/20 text-slate-900">
            {/* Header Badge + Countdown Timer */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {String(currentRequest.category).toUpperCase().includes('MOTO') || String(currentRequest.category).toUpperCase().includes('BIKE')
                    ? '🏍️'
                    : String(currentRequest.category).toUpperCase().includes('AUTO') || String(currentRequest.category).toUpperCase().includes('TOTO')
                    ? '🛺'
                    : String(currentRequest.category).toUpperCase().includes('XL')
                    ? '🚚'
                    : '🚗'}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      {String(currentRequest.category).toUpperCase().includes('MOTO') || String(currentRequest.category).toUpperCase().includes('BIKE')
                        ? 'Bike Taxi Dispatch'
                        : String(currentRequest.category).toUpperCase().includes('AUTO') || String(currentRequest.category).toUpperCase().includes('TOTO')
                        ? 'Toto / Auto Dispatch'
                        : String(currentRequest.category).toUpperCase().includes('XL')
                        ? 'Transporter Dispatch'
                        : 'Cab Dispatch'}
                    </span>
                    {currentRequest.is100KmOutstation && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-black px-2 py-0.5 rounded-full border border-amber-200">
                        100+ km Outstation
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pickup is <strong className="text-emerald-700 font-bold">{currentRequest.pickupDistanceToDriver || 0.7} km</strong> from you (~{currentRequest.pickupEtaMins || 2} mins away)
                  </p>
                </div>
              </div>

              <RequestCountdown onExpire={() => clearRequests()} />
            </div>

            {/* Earnings Spotlight */}
            <div className="my-3.5 bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Net Earnings</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-700 tracking-tight">₹{netEarnings}</span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Net (88%)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold text-slate-600">Gross: ₹{currentRequest.estimatedFare}</p>
                <p className="text-[10px] text-slate-500 font-medium">12% platform fee · Instant UPI</p>
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-blue-700 mt-0.5">
                  <span>{currentRequest.estimatedDistance} km</span>
                  <span>·</span>
                  <span>{currentRequest.estimatedDuration} mins</span>
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div className="space-y-2.5 my-3 pl-1">
              {/* Pickup */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{currentRequest.pickup?.name}</p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{currentRequest.destination?.name}</p>
                </div>
              </div>
            </div>

            {/* Passenger & Proximity Pill */}
            <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 flex items-center justify-between text-xs text-slate-700 mb-4">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700">
                  {currentRequest.userName?.charAt(0) || 'P'}
                </div>
                <span className="font-bold text-slate-900 truncate">{currentRequest.userName}</span>
                <span className="text-amber-600 font-bold shrink-0">★ {currentRequest.userRating || 4.9}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                ⚡ Proximity Match
              </span>
            </div>

            {/* Action Buttons: Decline & Accept */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => clearRequests()}
                className="w-1/3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => handleAcceptTrip(currentRequest)}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Accept & Start Trip</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Idle Proximity Radar Card (When Online & No Request) ─────────────── */}
      {status === 'AVAILABLE' && !activeRide && !currentRequest && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto px-3 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 relative" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">Radar Active</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-200">
                    {pickupRadiusKm} km range
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Listening for passenger requests near your GPS</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleTriggerSpecificRequest('LOCAL')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all border border-blue-200 flex items-center gap-0.5 cursor-pointer"
                title="Simulate Local Trip (₹28)"
              >
                <Zap size={11} />
                <span>Local</span>
              </button>
              <button
                onClick={() => handleTriggerSpecificRequest('100KM_OUTSTATION')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all border border-amber-200 flex items-center gap-0.5 cursor-pointer"
                title="Simulate 100+ km Outstation (₹2,680)"
              >
                <span>Outstation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offline Prompt ───────────────────────────────────────────────────── */}
      {status === 'OFFLINE' && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3 text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Cockpit Offline · Dispatches Paused</span>
            <button
              onClick={goOnline}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Go Online
            </button>
          </div>
        </div>
      )}

      {/* ── Active Ride Progress Banner ──────────────────────────────────────── */}
      {activeRide && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto px-3 w-full max-w-md">
          <div className="bg-blue-600/95 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-2xl">{vehicleType === 'BIKE' ? '🏍️' : '🚗'}</span>
              <div className="truncate text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">Trip in Progress</p>
                <p className="text-xs font-extrabold truncate">{activeRide.userName} · {activeRide.destination?.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/driver/ride/${activeRide.id}`)}
              className="bg-white text-blue-900 font-extrabold px-3 py-1.5 rounded-xl text-xs hover:bg-blue-50 transition-all flex items-center gap-1 shrink-0 shadow-sm"
            >
              <span>HUD</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Sleek Collapsible Bottom Metrics Bar (Pristine Light Theme) ─────── */}
      <footer className="absolute bottom-0 inset-x-0 z-30 pointer-events-auto bg-white/95 backdrop-blur-2xl border-t border-slate-200 text-slate-800 shadow-md transition-all duration-300">
        {/* Compact Strip Header (Always visible) */}
        <div
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="text-slate-500 text-[11px] font-semibold">Today's Net:</span>
              <span className="font-black">₹{todayEarnings.toLocaleString()}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-800">
              <span className="text-slate-500 text-[11px] font-semibold">Trips:</span>
              <span className="font-black">{todayRides}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden md:flex items-center gap-1 text-blue-700">
              <span className="text-slate-500 text-[11px] font-semibold">Online:</span>
              <span className="font-black">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</span>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="flex items-center gap-1 text-amber-600 font-black">
              ★ {rating}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Link
              to="/driver/earnings"
              onClick={(e) => e.stopPropagation()}
              className="text-emerald-700 hover:text-emerald-900 font-extrabold transition-colors flex items-center gap-1 mr-1"
            >
              <span>Wallet & UPI</span>
              <ArrowRight size={12} />
            </Link>
            <button
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle statistics drawer"
            >
              {statsExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded Details Drawer */}
        {statsExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center animate-in fade-in-50 duration-200 bg-white">
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
              <p className="text-lg font-black text-emerald-700">₹{todayEarnings.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-800 font-bold">Guaranteed 88% Net</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <p className="text-lg font-black text-slate-900">{todayRides}</p>
              <p className="text-[10px] text-slate-500 font-bold">Completed Trips</p>
            </div>
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
              <p className="text-lg font-black text-blue-700">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</p>
              <p className="text-[10px] text-blue-800 font-bold">Driver Shift Time</p>
            </div>
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
              <p className="text-lg font-black text-amber-700">★ {rating}</p>
              <p className="text-[10px] text-amber-800 font-bold">Tier 1 Partner Rating</p>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
