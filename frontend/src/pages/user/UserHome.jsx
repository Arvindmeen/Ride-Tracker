import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Clock, Home, Briefcase, Star, ChevronRight,
  Plus, Search, X, Crosshair, ArrowRight, ShieldCheck, Zap,
  CheckCircle2, Sparkles, AlertCircle, RefreshCw, Car, Phone
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useBookingStore, useMapStore } from '@/stores';
import { locationService, pricingService } from '@/services';
import { VEHICLE_CATEGORIES } from '@/constants';
import { Button, Card, Spinner, Badge, Avatar } from '@/components/ui';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

// Preset Popular Destinations for Quick 1-Tap Selection
const POPULAR_DESTINATIONS = [
  {
    id: 'kgp_station',
    name: 'Kharagpur Jn Railway Station',
    category: 'Railway Terminus',
    desc: 'Main platform gates & VIP exit',
    lat: 22.3425,
    lng: 87.3290,
    distanceKm: 6.8,
    icon: '🚂',
  },
  {
    id: 'ccu_airport',
    name: 'Kolkata Airport (CCU Outstation)',
    category: '100+ km Outstation',
    desc: 'Terminal 2 Departure Expressway',
    lat: 22.6547,
    lng: 88.4467,
    distanceKm: 124.0,
    icon: '✈️',
  },
  {
    id: 'tech_market',
    name: 'Technology Market (Tech Mkt)',
    category: 'Campus Commercial',
    desc: 'Food joints, stationary & essentials',
    lat: 22.3190,
    lng: 87.3040,
    distanceKm: 2.2,
    icon: '🛍️',
  },
  {
    id: 'nalanda',
    name: 'Nalanda Classroom Complex',
    category: 'Academics',
    desc: 'Lecture halls & central library',
    lat: 22.3210,
    lng: 87.3080,
    distanceKm: 1.8,
    icon: '🏛️',
  },
  {
    id: 'bc_roy_hospital',
    name: 'BC Roy Technology Hospital',
    category: 'Healthcare',
    desc: 'Emergency OP & wellness center',
    lat: 22.3160,
    lng: 87.3020,
    distanceKm: 1.4,
    icon: '🏥',
  },
  {
    id: 'midnapore',
    name: 'Midnapore Town Collectorate',
    category: 'Intercity Hub',
    desc: 'District administrative center',
    lat: 22.4250,
    lng: 87.3190,
    distanceKm: 14.2,
    icon: '🏢',
  },
];

export default function UserHome() {
  const { user } = useAuthStore();
  const {
    pickup,
    destination,
    step,
    category,
    estimatedFare,
    setPickup,
    setDestination,
    setStep,
    setCategory,
    setEstimatedFare,
    reset,
  } = useBookingStore();

  const { drivers, startSimulation, setCenter, setZoom } = useMapStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'pickup' | 'destination'
  const [estimating, setEstimating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH'
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'active' | 'denied'

  // Initialize simulation
  useEffect(() => {
    startSimulation();
  }, [startSimulation]);

  // Live Location Detection & Continuous Tracking
  const detectLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const livePickupObj = {
          lat: latitude,
          lng: longitude,
          name: `My Live GPS Spot (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
          address: 'Current Live GPS Location (Accuracy ±5m)',
          userImage: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          userName: user?.name || 'Passenger',
        };
        setPickup(livePickupObj);
        setCenter({ lat: latitude, lng: longitude });
        setZoom(15);
        setGpsStatus('active');
      },
      (err) => {
        // High-accuracy fallback to IIT Kharagpur Scholars Ave
        const fallbackPickup = {
          lat: 22.3149,
          lng: 87.3060,
          name: 'Scholars Avenue (RK Hall Gate), IIT Kharagpur',
          address: 'IIT Kharagpur Campus, Kharagpur, West Bengal',
          userImage: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          userName: user?.name || 'Passenger',
        };
        setPickup(fallbackPickup);
        setCenter({ lat: 22.3149, lng: 87.3060 });
        setZoom(15);
        setGpsStatus('active');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Run GPS auto-detection on mount if pickup not set
  useEffect(() => {
    if (!pickup?.lat) {
      detectLiveGps();
    }
  }, []);

  // Search input debounced autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await locationService.searchPlaces(searchQuery);
      setSearchResults(res);
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const selectPlace = (place) => {
    const formatted = {
      lat: place.location?.lat || place.lat,
      lng: place.location?.lng || place.lng,
      name: place.name,
      address: place.address || place.name,
    };

    if (activeField === 'pickup') {
      setPickup(formatted);
    } else {
      setDestination(formatted);
    }

    setSearchQuery('');
    setSearchResults([]);
    setActiveField(null);

    if (pickup && activeField === 'destination') setStep('VEHICLE_SELECT');
    if (destination && activeField === 'pickup') setStep('VEHICLE_SELECT');
  };

  const handleSelectPresetDestination = (preset) => {
    setDestination({
      lat: preset.lat,
      lng: preset.lng,
      name: preset.name,
      address: preset.desc,
      distanceKm: preset.distanceKm,
    });
    setStep('VEHICLE_SELECT');
  };

  // Estimate Fare for selected category
  const handleEstimateFare = async (catId) => {
    if (!pickup || !destination) return;
    setEstimating(true);
    setCategory(catId);
    const fare = await pricingService.estimateFare(pickup, destination, catId);
    setEstimatedFare(fare);
    setEstimating(false);
    setStep('CONFIRM');
  };

  // Ride Booking & Radar Search
  const handleBookRide = async () => {
    setStep('SEARCHING');
    let c = 5;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        navigate('/app/ride/ACTIVE_RIDE');
      }
    }, 1000);
  };

  const nearbyCount = drivers.filter((d) => d.status !== 'OFFLINE').length;
  const is100KmTrip = destination?.distanceKm >= 80 || (estimatedFare?.distance && estimatedFare?.distance >= 80);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans bg-slate-900 text-slate-100">
      
      {/* ── Main Interactive Real-Time Map ───────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-400 font-bold text-xs">
            <Spinner size="lg" />
            <span>Loading Live CartoDB Map...</span>
          </div>
        }>
          <LiveMap
            zoom={15}
            pickup={pickup}
            destination={destination}
            showSurgeZones={true}
            tileTheme="light"
            height="100%"
            user={user}
            showNearbyPassengers={true}
            onRecenterGPS={detectLiveGps}
          />
        </Suspense>
      </div>

      {/* ── Top Floating Quick Status Chip ────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 z-20 pointer-events-auto flex items-center justify-between sm:justify-end gap-2">
        <button
          onClick={detectLiveGps}
          className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          title="Detect and center current GPS location"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[170px] sm:max-w-none">
            {gpsStatus === 'detecting' ? 'Scanning GPS...' : '📍 Live GPS Tracking'}
          </span>
          <Crosshair size={13} className="text-blue-600" />
        </button>

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs font-bold text-white flex items-center gap-1.5">
          <Car size={13} className="text-emerald-400" />
          <span>{nearbyCount} Vehicles Active</span>
        </div>
      </div>

      {/* ── Floating Booking Console ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 sm:inset-x-auto sm:top-4 sm:left-4 sm:bottom-4 z-30 pointer-events-auto w-full sm:w-[420px] max-w-full flex flex-col justify-end sm:justify-start">
        <div className="bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[calc(100vh-6rem)] flex flex-col">
          
          {/* ── STEP 1: LOCATION SELECTION ─────────────────────────────────────── */}
          {(step === 'LOCATION' || step === 'ROUTE_PREVIEW') && (
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Where Would You Like To Go?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time closest driver dispatch · IIT Kharagpur & Pan-India
                  </p>
                </div>
                <button
                  onClick={detectLiveGps}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Re-scan Live GPS position"
                >
                  <Crosshair size={16} />
                </button>
              </div>

              {/* Pickup Location Box */}
              <div
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all',
                  activeField === 'pickup' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                )}
                onClick={() => {
                  setActiveField('pickup');
                  setSearchQuery(pickup?.name || '');
                }}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {user?.name ? user.name.charAt(0) : '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pickup Spot</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {pickup?.name || 'Select or detect pickup spot'}
                  </p>
                </div>
                {pickup && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickup(null);
                      setStep('LOCATION');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Destination Location Box */}
              <div
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all',
                  activeField === 'destination' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                )}
                onClick={() => {
                  setActiveField('destination');
                  setSearchQuery(destination?.name || '');
                }}
              >
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  🏁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Destination</p>
                  <p className={clsx('text-xs sm:text-sm font-bold truncate', destination ? 'text-slate-900' : 'text-slate-400')}>
                    {destination?.name || 'Enter destination or pick below...'}
                  </p>
                </div>
                {destination && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestination(null);
                      setStep('LOCATION');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Active Search Field Input */}
              {activeField && (
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border-2 border-blue-600 rounded-xl outline-none shadow-sm"
                    placeholder={`Type ${activeField === 'pickup' ? 'pickup spot' : 'destination'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searching && <Spinner size="sm" className="absolute right-3.5 top-3" />}

                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 mt-1 max-h-52 overflow-y-auto">
                      {searchResults.map((r) => (
                        <button
                          key={r.id}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left border-b last:border-0 border-slate-100"
                          onClick={() => selectPlace(r)}
                        >
                          <MapPin size={15} className="text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{r.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preset Destinations Hub */}
              {!activeField && (
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Quick Destinations from Current Spot
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectPresetDestination(dest)}
                        className="p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-base">{dest.icon}</span>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {dest.distanceKm} km
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 mt-1 line-clamp-1">
                            {dest.name}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {dest.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pickup && destination && (
                <Button
                  className="w-full py-3 text-sm font-extrabold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                  onClick={() => setStep('VEHICLE_SELECT')}
                >
                  <span>Select Vehicle & View Fares</span>
                  <ArrowRight size={15} />
                </Button>
              )}
            </div>
          )}

          {/* ── STEP 2: VEHICLE SELECTION & LIVE ESTIMATION ─────────────────────── */}
          {step === 'VEHICLE_SELECT' && (
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep('LOCATION')}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                  >
                    ←
                  </button>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Select Vehicle</h3>
                    <p className="text-xs text-slate-500">Available fleet partners nearby</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {destination?.distanceKm || 4.2} km Trip
                </span>
              </div>

              {/* Dynamic Vehicle Cards */}
              <div className="space-y-2.5">
                {VEHICLE_CATEGORIES.map((cat) => {
                  const isBike = cat.id === 'MOTO';
                  const isAuto = cat.id === 'AUTO';
                  const isCab = cat.id === 'ECONOMY' || cat.id === 'PREMIUM';

                  const dist = destination?.distanceKm || 4.2;
                  const estPrice = is100KmTrip && isCab
                    ? Math.round(dist * 21 + 150)
                    : Math.round(cat.basePrice + dist * (cat.pricePerKm || 12));

                  const emoji = isBike ? '🏍️' : isAuto ? '🛺' : '🚗';

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleEstimateFare(cat.id)}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.01]',
                        category === cat.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-2xl flex items-center justify-center shrink-0">
                          {emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-black text-slate-900">{cat.label}</p>
                            <span className="text-[10px] text-slate-500 font-semibold">· {cat.seats} seat</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            ● {cat.eta} min away · Closest driver match
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-base font-black text-slate-900">₹{estPrice}</p>
                        <p className="text-[10px] text-slate-400">Total Fare</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Mode Selector */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">Payment Mode:</span>
                  <span className="text-blue-600 font-extrabold text-[11px]">Instant Driver Settlement</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMode('UPI')}
                    className={clsx(
                      'py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5',
                      paymentMode === 'UPI' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    )}
                  >
                    <span>⚡ UPI (GPay / PhonePe)</span>
                  </button>
                  <button
                    onClick={() => setPaymentMode('CASH')}
                    className={clsx(
                      'py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5',
                      paymentMode === 'CASH' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    )}
                  >
                    <span>💵 Cash / Pay Driver</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: FARE CONFIRMATION ─────────────────────────────────────── */}
          {step === 'CONFIRM' && estimatedFare && (
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <button
                  onClick={() => setStep('VEHICLE_SELECT')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  ←
                </button>
                <div>
                  <h3 className="text-base font-black text-slate-900">Confirm Booking</h3>
                  <p className="text-xs text-slate-500">Transparent fare breakdown</p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare:</span>
                  <span className="font-bold text-slate-900">₹{estimatedFare.base}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance ({estimatedFare.distance} km):</span>
                  <span className="font-bold text-slate-900">₹{estimatedFare.distanceFare || estimatedFare.distance * 12}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & GST (5%):</span>
                  <span className="font-bold text-slate-900">₹{estimatedFare.tax}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-slate-900 text-sm">Estimated Total:</span>
                  <span className="font-black text-2xl text-blue-600">₹{estimatedFare.total}</span>
                </div>
              </div>

              {/* Closest Driver Priority Guarantee */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  <strong>Proximity Dispatch Guarantee:</strong> Request will be pinged directly to the nearest available driver ({nearbyCount} partners in radius).
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 py-3 text-xs font-bold rounded-xl"
                  onClick={reset}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-2 py-3 text-sm font-black rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25"
                  onClick={handleBookRide}
                >
                  <span>Request Driver Now</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: RADAR SEARCHING ────────────────────────────────────────── */}
          {step === 'SEARCHING' && (
            <div className="p-6 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-xl">
                  📡
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {is100KmTrip ? 'Dispatching Outstation Highway Cab' : 'Finding Closest Driver Partner'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proximity Dispatch Active: Pinging nearest driver within 1 km of your pickup
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left text-xs space-y-2 font-medium max-w-sm mx-auto">
                <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">📍 Live Pickup:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {pickup?.name || 'Current Spot'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Scanning nearest campus and street units...</span>
                </div>
                {countdown <= 3 && (
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
                    <span>●</span>
                    <span>Direct driver match in progress (Subhash M. 0.4 km away)</span>
                  </div>
                )}
              </div>

              {countdown !== null && (
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                  <span>Connecting in:</span>
                  <span className="font-black text-lg text-blue-600">{countdown}s</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
