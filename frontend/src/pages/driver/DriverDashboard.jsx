import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, MapPin, DollarSign, Clock,
  Volume2, VolumeX, ArrowRight, CheckCircle2, Zap,
  FlaskConical, X, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDriverStore, useMapStore } from '@/stores';
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
    proximityNote: 'Closest Driver Match: You are 0.7 km from pickup. Drivers in Kolkata (>100 km away) cannot receive this request.',
    requestedAt: new Date().toISOString(),
  },
  CAMPUS_LOCAL_KGP: {
    id: 'REQ-LOCAL-2KM',
    userId: 'U-KGP-22',
    userName: 'Sneha Mondal (IIT KGP)',
    userRating: 4.92,
    pickup: { lat: 22.3155, lng: 87.3055, name: 'Scholars Avenue (Patel Hall Gate)' },
    destination: { lat: 22.3190, lng: 87.3040, name: 'Technology Market (Tech Mkt)' },
    estimatedFare: 28,
    estimatedDistance: 2.2,
    estimatedDuration: 6,
    category: 'MOTO',
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
    proximityNote: 'Closest Driver Match: You are 0.8 km from pickup in BKC. Pune drivers (>140 km away) were not pinged.',
    requestedAt: new Date().toISOString(),
  },
};

function RequestCountdown({ onExpire }) {
  const [sec, setSec] = useState(20);
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

  return (
    <div className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono flex items-center gap-1 ${
      sec <= 5 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-800'
    }`}>
      <Clock size={12} />
      <span>{sec}s remaining</span>
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
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [driverGps, setDriverGps] = useState({
    lat: 22.3150,
    lng: 87.3050,
    isLive: false,
    tracking: false,
  });

  // Real device GPS detection for Driver Partner
  const detectDriverGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverGps({ lat: latitude, lng: longitude, isLive: true, tracking: true });
        setRegion('LIVE_GPS', { lat: latitude, lng: longitude }, 15);
      },
      (err) => {
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
        // By default show the 100+ km Outstation request or local based on scope
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
  };

  const handleAcceptTrip = (req) => {
    acceptRide(req);
    navigate(`/driver/ride/${req.id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* ── Unified Floating Driver Toolbar (single row) ───────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-2 pointer-events-auto flex-wrap">
        {/* Vehicle Mode Switcher */}
        <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl flex items-center gap-0.5">
          {[['BIKE','🏍️','Bike'],['CAR','🚗','Cab'],['AUTO','🛺','Auto']].map(([type, emoji, label]) => (
            <button
              key={type}
              onClick={() => setVehicleType(type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vehicleType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Operating Scope */}
        <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl flex items-center gap-0.5">
          <button
            onClick={() => handleScopeChange('IIT_KGP')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              operatingScope === 'IIT_KGP' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🎓 IIT KGP
          </button>
          <button
            onClick={() => handleScopeChange('PAN_INDIA')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              operatingScope === 'PAN_INDIA' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🇮🇳 Pan-India
          </button>
        </div>

        {/* Proximity Radius */}
        <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 hidden sm:inline">Radius:</span>
          <div className="flex gap-0.5">
            {[3, 5, 10, 15].map((rad) => (
              <button
                key={rad}
                onClick={() => setPickupRadiusKm(rad)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  pickupRadiusKm === rad ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rad}km
              </button>
            ))}
          </div>
        </div>

        {/* GPS + Sound + Debug panel toggle */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={detectDriverGps}
            className="bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1 shadow-xl transition-all"
            title="Center GPS"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">{driverGps.isLive ? 'GPS Live' : 'GPS'}</span>
            <span className="sm:hidden">📍</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-slate-900/95 backdrop-blur-md p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all"
            title={soundEnabled ? 'Sound On' : 'Muted'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          {/* Collapsible debug panel toggle */}
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              showDebugPanel
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/95 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title="Simulation Debug Panel"
          >
            <FlaskConical size={14} />
          </button>
        </div>
      </div>

      {/* ── Debug / Simulation Panel (collapsible) ────────────────────────────── */}
      {showDebugPanel && (
        <div className="absolute top-16 right-3 z-30 bg-slate-900/98 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3 shadow-2xl pointer-events-auto min-w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              <FlaskConical size={12} /> Simulation Panel
            </span>
            <button onClick={() => setShowDebugPanel(false)} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleTriggerSpecificRequest('100KM_OUTSTATION')}
              className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
            >
              🚀 Test 100+ km Outstation (₹2,680)
            </button>
            <button
              onClick={() => handleTriggerSpecificRequest('LOCAL')}
              className="w-full text-left px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all"
            >
              ⚡ Test Local Ride (₹28)
            </button>
          </div>
        </div>
      )}

      {/* ── Main Live Map Canvas ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="bg-slate-950 w-full h-full flex items-center justify-center"><Spinner size="lg" /></div>}>
          <LiveMap
            zoom={operatingScope === 'IIT_KGP' ? 15 : 13}
            height="100%"
            showSurgeZones={status === 'AVAILABLE'}
            tileTheme="light"
            activeDriverLocation={driverGps.isLive ? { lat: driverGps.lat, lng: driverGps.lng, category: vehicleType } : null}
            onRecenterGPS={detectDriverGps}
          />
        </Suspense>
      </div>

      {/* ── Center Status / Go Online Toggle ─────────────────────────────────── */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={status === 'OFFLINE' ? goOnline : goOffline}
          className={clsx(
            'flex items-center gap-3 px-8 py-3.5 rounded-full shadow-2xl font-black text-sm border-2 transition-all hover:scale-105 active:scale-95',
            status === 'OFFLINE'
              ? 'bg-slate-950/95 border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-white'
              : 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30',
          )}
        >
          <span className={clsx(
            'w-3 h-3 rounded-full',
            status !== 'OFFLINE' ? 'bg-white animate-ping' : 'bg-slate-500',
          )} />
          <span>
            {status === 'OFFLINE'
              ? 'Tap to Go Online'
              : `ONLINE · ${vehicleType === 'BIKE' ? 'Bike' : vehicleType === 'CAR' ? 'Cab' : 'Auto'} Ready`}
          </span>
        </button>
      </div>

      {/* ── Bottom HUD: Incoming Request Radar OR Metrics Card ───────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
        {/* Active Trip Banner if on a ride */}
        {activeRide && (
          <div className="mx-3 sm:mx-6 mb-3 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                {vehicleType === 'BIKE' ? '🏍️' : '🚗'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Trip in Progress</p>
                <p className="text-sm font-extrabold">{activeRide.userName} · {activeRide.destination?.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/driver/ride/${activeRide.id}`)}
              className="bg-white text-blue-900 font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              <span>Open Navigation HUD</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Quick Get New Ride Dispatch Bar or Incoming Request Banner */}
        {status === 'AVAILABLE' && !activeRide && (
          <>
            {pendingRequests.length > 0 ? (
              <div className="mx-3 sm:mx-6 mb-3 bg-slate-900/98 backdrop-blur-xl rounded-3xl border-2 border-emerald-400 p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
                      {pendingRequests[0].category === 'BIKE' ? '🏍️' : '🚗'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          ⚡ New Ride Dispatch
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          {pendingRequests[0].pickupDistanceToDriver || 0.7} km from you
                        </span>
                        {pendingRequests[0].is100KmOutstation && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                            100+ km Outstation
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        {pendingRequests[0].userName} · ₹{pendingRequests[0].estimatedFare} (Net: ₹{Math.round(pendingRequests[0].estimatedFare * 0.88)})
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                        📍 Pickup: <span className="text-slate-200 font-semibold">{pendingRequests[0].pickup?.name}</span> ➔ 🏁 Drop: <span className="text-slate-200 font-semibold">{pendingRequests[0].destination?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => clearRequests()}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptTrip(pendingRequests[0])}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle size={15} />
                      <span>Accept & Start Trip</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-3 sm:mx-6 mb-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Proximity Radar Active</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                        Ready for Dispatches
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Scanning for passengers within {pickupRadiusKm} km of your GPS spot
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTriggerSpecificRequest('LOCAL')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-blue-600/25"
                    title="Trigger a new local ride dispatch"
                  >
                    <Zap size={13} />
                    <span>+ Get Local Ride (₹28)</span>
                  </button>
                  <button
                    onClick={() => handleTriggerSpecificRequest('100KM_OUTSTATION')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-amber-500/25"
                    title="Trigger a 100+ km Outstation dispatch"
                  >
                    <span>🛣️ + Get 100+ km Outstation (₹2,680)</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Driver Stats Bottom Drawer */}
        <div className="bg-slate-950/95 backdrop-blur-md rounded-t-3xl border-t border-slate-800 px-4 sm:px-6 pt-3 pb-5">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">₹{todayEarnings.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 font-semibold">Today's Net (88%)</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">{todayRides}</p>
              <p className="text-[11px] text-slate-400 font-semibold">Completed Trips</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-blue-400">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</p>
              <p className="text-[11px] text-slate-400 font-semibold">Hours Online</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-amber-400">★ {rating}</p>
              <p className="text-[11px] text-slate-400 font-semibold">Partner Rating</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link to="/driver/earnings" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              <span>View Past Rides & UPI Cashout</span>
              <ArrowRight size={13} />
            </Link>
            <span className="text-slate-500 font-mono text-[11px]">
              Proximity Dispatch Filter Active (Max {pickupRadiusKm} km to pickup)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
