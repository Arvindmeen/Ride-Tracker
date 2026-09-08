import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Clock, Search, X, Crosshair, ArrowRight,
  ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Car,
  ArrowUpDown, Compass, Check, Layers, ChevronRight, CreditCard, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useBookingStore, useMapStore } from '@/stores';
import { locationService, pricingService } from '@/services';
import { VEHICLE_CATEGORIES } from '@/constants';
import { Button, Spinner, Badge, Avatar, VehicleIcon } from '@/components/ui';

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
    badge: 'Transit',
  },
  {
    id: 'tech_market',
    name: 'Technology Market (Tech Mkt)',
    category: 'Campus Commercial',
    desc: 'Food joints, stationary & essentials',
    lat: 22.3190,
    lng: 87.3040,
    distanceKm: 2.2,
    badge: 'Popular',
  },
  {
    id: 'nalanda',
    name: 'Nalanda Classroom Complex',
    category: 'Academics',
    desc: 'Lecture halls & central library',
    lat: 22.3210,
    lng: 87.3080,
    distanceKm: 1.8,
    badge: 'Campus',
  },
  {
    id: 'bc_roy_hospital',
    name: 'BC Roy Technology Hospital',
    category: 'Healthcare',
    desc: 'Emergency OP & wellness center',
    lat: 22.3160,
    lng: 87.3020,
    distanceKm: 1.4,
    badge: 'Health',
  },
  {
    id: 'ccu_airport',
    name: 'Kolkata Airport (CCU Outstation)',
    category: '100+ km Outstation',
    desc: 'Terminal 2 Departure Expressway',
    lat: 22.6547,
    lng: 88.4467,
    distanceKm: 124.0,
    badge: 'Outstation',
  },
  {
    id: 'midnapore',
    name: 'Midnapore Town Collectorate',
    category: 'Intercity Hub',
    desc: 'District administrative center',
    lat: 22.4250,
    lng: 87.3190,
    distanceKm: 14.2,
    badge: 'Intercity',
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

  // Mobile View Switcher: 'console' (Booking flow) or 'map' (Full interactive map view)
  const [mobileView, setMobileView] = useState('console');

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

  const handleSwapLocations = (e) => {
    e.stopPropagation();
    if (!pickup || !destination) return;
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
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
    <div className="relative w-full max-w-full overflow-x-hidden min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-slate-100 font-sans">
      
      {/* ── MOBILE VIEW SWITCHER (Only visible on small screens) ───────────── */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMobileView('console')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              mobileView === 'console'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Ride Console
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              mobileView === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Live Map
          </button>
        </div>

        {/* GPS Quick Status Pill */}
        <button
          onClick={detectLiveGps}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold"
          title="Recenter GPS"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{gpsStatus === 'detecting' ? 'GPS...' : 'Live GPS'}</span>
          <Crosshair size={12} className="text-emerald-700" />
        </button>
      </div>

      {/* ── LEFT BOOKING CONSOLE (Responsive Sidebar on Desktop, Primary Flow on Mobile) ── */}
      <div
        className={clsx(
          'w-full md:w-[460px] lg:w-[480px] shrink-0 bg-white border-r border-slate-200 z-20 flex flex-col',
          'md:h-[calc(100vh-3.5rem)] md:overflow-y-auto',
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Console Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                Veloq Instant Booking
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Where are you heading?
              </h1>
            </div>

            {/* Desktop Quick GPS Scan */}
            <button
              onClick={detectLiveGps}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
              title="Detect current GPS location"
            >
              <Crosshair size={14} />
              <span>{gpsStatus === 'detecting' ? 'Locating...' : 'My Location'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{nearbyCount} verified drivers partner active nearby</span>
          </div>
        </div>

        {/* ── STEP 1: LOCATION SELECTION ────────────────────────────────────── */}
        {(step === 'LOCATION' || step === 'ROUTE_PREVIEW') && (
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            
            {/* Input Form with modern connected line */}
            <div className="relative bg-slate-50 border border-slate-200 rounded-3xl p-3.5 sm:p-4 space-y-3">
              {/* Connected Dots bar */}
              <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-400 to-rose-500" />

              {/* Pickup Field */}
              <div
                className={clsx(
                  'relative flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all bg-white',
                  activeField === 'pickup'
                    ? 'border-blue-600 ring-4 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => {
                  setActiveField('pickup');
                  setSearchQuery(pickup?.name || '');
                }}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm z-10">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Pickup Location
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {pickup?.name || 'Enter or detect pickup spot...'}
                  </p>
                </div>
                {pickup && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickup(null);
                      setStep('LOCATION');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Swap Locations Button */}
              {pickup && destination && (
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    onClick={handleSwapLocations}
                    className="p-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all"
                    title="Swap pickup and drop"
                  >
                    <ArrowUpDown size={14} />
                  </button>
                </div>
              )}

              {/* Destination Field */}
              <div
                className={clsx(
                  'relative flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all bg-white',
                  activeField === 'destination'
                    ? 'border-rose-600 ring-4 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => {
                  setActiveField('destination');
                  setSearchQuery(destination?.name || '');
                }}
              >
                <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm z-10">
                  🏁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Destination Drop-off
                  </p>
                  <p
                    className={clsx(
                      'text-xs sm:text-sm font-bold truncate',
                      destination ? 'text-slate-900' : 'text-slate-400'
                    )}
                  >
                    {destination?.name || 'Where do you want to go?'}
                  </p>
                </div>
                {destination && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestination(null);
                      setStep('LOCATION');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Active Search Field Input & Results */}
            {activeField && (
              <div className="relative animate-fade-in">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    autoFocus
                    className="w-full pl-9 pr-10 py-3 text-xs sm:text-sm border-2 border-blue-600 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10"
                    placeholder={`Search ${activeField === 'pickup' ? 'pickup spot' : 'destination'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searching ? (
                    <Spinner size="sm" className="absolute right-3.5 top-3.5 text-blue-600" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                {/* Autocomplete Dropdown List */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 text-left transition-colors"
                        onClick={() => selectPlace(r)}
                      >
                        <MapPin size={16} className="text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{r.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick 1-Tap Preset Destinations */}
            {!activeField && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    Popular Destinations
                  </p>
                  <span className="text-[11px] font-bold text-blue-600">Quick 1-Tap</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => handleSelectPresetDestination(dest)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group flex flex-col justify-between bg-white shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                          {dest.badge}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-blue-600">
                          {dest.distanceKm} km
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 mt-2 line-clamp-1">
                        {dest.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {dest.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button: Next step */}
            {pickup && destination && (
              <Button
                className="w-full py-3.5 text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 mt-2"
                onClick={() => setStep('VEHICLE_SELECT')}
              >
                <span>Select Vehicle & View Fares</span>
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        )}

        {/* ── STEP 2: VEHICLE SELECTION WITH REAL VEHICLE ICONS ─────────────── */}
        {step === 'VEHICLE_SELECT' && (
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('LOCATION')}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Change Location"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-base font-black text-slate-900">Choose a Ride</h2>
                  <p className="text-xs text-slate-500">
                    {destination?.distanceKm || 4.2} km · Closest driver matching
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                {destination?.distanceKm || 4.2} km
              </span>
            </div>

            {/* Route Summary Pill */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="truncate font-bold text-slate-800">
                  <span className="text-blue-600">● </span>{pickup?.name || 'Pickup'}
                </p>
                <p className="truncate font-bold text-slate-800 mt-0.5">
                  <span className="text-rose-600">■ </span>{destination?.name || 'Destination'}
                </p>
              </div>
              <button
                onClick={() => setStep('LOCATION')}
                className="text-blue-600 hover:underline text-[11px] font-bold shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Real Vehicle Cards List */}
            <div className="space-y-2.5">
              {VEHICLE_CATEGORIES.map((cat) => {
                const isCab = cat.id === 'ECONOMY' || cat.id === 'PREMIUM';
                const dist = destination?.distanceKm || 4.2;
                const estPrice = is100KmTrip && isCab
                  ? Math.round(dist * 21 + 150)
                  : Math.round(cat.basePrice + dist * (cat.pricePerKm || 12));

                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleEstimateFare(cat.id)}
                    className={clsx(
                      'w-full flex items-center justify-between p-3 sm:p-4 rounded-3xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                    )}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Authentic Scalable Vehicle SVG */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center p-1.5 shrink-0 border border-slate-200/80">
                        <VehicleIcon category={cat.id} size="lg" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm sm:text-base font-black text-slate-900">
                            {cat.label}
                          </p>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            · {cat.seats} seats
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{cat.desc}</p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{cat.eta} min away · Proximity match</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p className="text-base sm:text-lg font-black text-slate-900">
                        ₹{estPrice}
                      </p>
                      <span className="text-[10px] text-slate-400">Total Fare</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment Mode Selector */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700">Payment Option</span>
                <span className="text-emerald-600 font-bold">Instant Confirmation</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMode('UPI')}
                  className={clsx(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2',
                    paymentMode === 'UPI'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span>⚡ UPI (GPay / PhonePe)</span>
                </button>
                <button
                  onClick={() => setPaymentMode('CASH')}
                  className={clsx(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2',
                    paymentMode === 'CASH'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <button
                onClick={() => setStep('VEHICLE_SELECT')}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ←
              </button>
              <div>
                <h2 className="text-base font-black text-slate-900">Review & Confirm</h2>
                <p className="text-xs text-slate-500">Transparent upfront pricing</p>
              </div>
            </div>

            {/* Selected Vehicle Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-blue-50/50 border border-blue-200">
              <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 flex items-center justify-center p-1 shrink-0">
                <VehicleIcon category={category} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900">
                  {VEHICLE_CATEGORIES.find((c) => c.id === category)?.label || category}
                </p>
                <p className="text-xs text-slate-600">
                  {destination?.distanceKm || estimatedFare.distance || 4.2} km journey
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-600">₹{estimatedFare.total}</p>
                <span className="text-[10px] text-slate-500">Guaranteed</span>
              </div>
            </div>

            {/* Itemized Fare Card */}
            <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare:</span>
                <span className="font-bold text-slate-900">₹{estimatedFare.base}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Rate ({estimatedFare.distance} km):</span>
                <span className="font-bold text-slate-900">
                  ₹{estimatedFare.distanceFare || estimatedFare.distance * 12}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Local Levies (5%):</span>
                <span className="font-bold text-slate-900">₹{estimatedFare.tax}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">Estimated Total:</span>
                <span className="font-black text-2xl text-blue-600">₹{estimatedFare.total}</span>
              </div>
            </div>

            {/* Proximity Dispatch Guarantee */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Proximity Dispatch Active</p>
                <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                  Request will be pinged immediately to nearest driver within 1 km radius. Number masking is enabled for your privacy.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="secondary"
                className="flex-1 py-3.5 text-xs font-bold rounded-2xl"
                onClick={reset}
              >
                Cancel
              </Button>
              <Button
                className="flex-2 py-3.5 text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                onClick={handleBookRide}
              >
                <span>Request Driver Now</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: RADAR SEARCHING ───────────────────────────────────────── */}
        {step === 'SEARCHING' && (
          <div className="p-6 sm:p-8 text-center space-y-5 flex-1 flex flex-col justify-center">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-blue-500/10 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-xl z-10">
                📡
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                {is100KmTrip ? 'Dispatching Highway Cab' : 'Finding Nearest Driver Partner'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Proximity Dispatch Active: Contacting top rated drivers closest to your pickup
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 text-left text-xs space-y-2.5 font-medium max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-200">
                <span className="text-slate-500">📍 Pickup:</span>
                <span className="font-bold text-slate-900 truncate max-w-[190px]">
                  {pickup?.name || 'Current Spot'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Scanning nearest fleet units...</span>
              </div>
              {countdown <= 3 && (
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs bg-blue-50 p-2 rounded-xl border border-blue-100">
                  <CheckCircle2 size={14} />
                  <span>Direct match: Subhash M. (0.4 km away)</span>
                </div>
              )}
            </div>

            {countdown !== null && (
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                <span>Connecting in:</span>
                <span className="font-black text-xl text-blue-600">{countdown}s</span>
              </div>
            )}

            <Button
              variant="ghost"
              className="text-xs font-bold text-rose-600 hover:bg-rose-50"
              onClick={reset}
            >
              Cancel Request
            </Button>
          </div>
        )}
      </div>

      {/* ── RIGHT INTERACTIVE MAP (Full desktop view, or accessible on mobile toggle) ── */}
      <div
        className={clsx(
          'flex-1 relative bg-slate-900 overflow-hidden',
          'h-[calc(100vh-7rem)] md:h-[calc(100vh-3.5rem)]',
          mobileView === 'console' ? 'hidden md:block' : 'block'
        )}
      >
        {/* Floating Top Desktop Info Pills */}
        <div className="hidden md:flex absolute top-4 right-4 z-20 items-center gap-2 pointer-events-auto">
          <button
            onClick={detectLiveGps}
            className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-colors"
            title="Recenter GPS"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{gpsStatus === 'detecting' ? 'Scanning GPS...' : '📍 Live GPS Tracking'}</span>
            <Crosshair size={14} className="text-blue-600" />
          </button>

          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 shadow-md text-xs font-bold text-white flex items-center gap-2">
            <Car size={14} className="text-emerald-400" />
            <span>{nearbyCount} Vehicles Active</span>
          </div>
        </div>

        {/* Live CartoDB Map */}
        <Suspense
          fallback={
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-400 font-bold text-xs">
              <Spinner size="lg" />
              <span>Loading Live CartoDB Map...</span>
            </div>
          }
        >
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

        {/* Mobile Floating Sheet on Map View */}
        {mobileView === 'map' && (
          <div className="md:hidden absolute bottom-3 inset-x-3 z-30 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">
                    {step === 'LOCATION'
                      ? 'Select Locations to Book'
                      : `${category || 'Economy'} Selected`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {pickup ? `From: ${pickup.name.slice(0, 24)}...` : 'Tap Console to pick route'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setMobileView('console')}
                  className="rounded-xl text-xs font-bold bg-blue-600 text-white"
                >
                  Open Booking Console →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
