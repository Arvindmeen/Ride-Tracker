import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Clock, Search, X, Crosshair, ArrowRight,
  ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Car,
  ArrowUpDown, Compass, Check, Layers, ChevronRight, CreditCard, Shield,
  Eye, Radio, Zap, ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useBookingStore, useMapStore, useDriverStore } from '@/stores';
import { locationService, pricingService, rideService, rideSync } from '@/services';
import { VEHICLE_CATEGORIES } from '@/constants';
import { Button, Spinner, Badge, Avatar, VehicleIcon } from '@/components/ui';
import LiveDispatchTicker from '@/components/ui/LiveDispatchTicker';
import { dispatchSimulation } from '@/services/dispatchSimulation';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

function isValidPoint(point) {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

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
    filter: 'Transit',
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
    filter: 'Campus',
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
    filter: 'Campus',
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
    filter: 'Hospital',
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
    filter: 'Outstation',
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
    filter: 'Transit',
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
    setAssignedDriver,
    reset,
  } = useBookingStore();

  const { drivers, startSimulation, setCenter, setZoom, userLocation, setUserLocation } = useMapStore();
  const navigate = useNavigate();

  // On-demand Map View: false by default (no permanent split screen!)
  const [showMap, setShowMap] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'pickup' | 'destination'
  const [estimating, setEstimating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'active' | 'denied'
  const [nearbyHotspots, setNearbyHotspots] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [corridorFilter, setCorridorFilter] = useState('All');

  // Initialize driver simulation
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
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geo = await locationService.reverseGeocode(latitude, longitude);
          const livePickupObj = {
            lat: latitude,
            lng: longitude,
            name: geo.name || `Live Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
            address: geo.address || 'Current Live GPS Location (Accuracy ±5m)',
            city: geo.city,
            state: geo.state,
            userImage: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            userName: user?.name || 'Passenger',
          };
          setPickup(livePickupObj);
          setUserLocation({
            lat: latitude,
            lng: longitude,
            name: geo.name,
            address: geo.address,
            city: geo.city,
            state: geo.state,
            isGpsDetected: true,
          });
          setCenter({ lat: latitude, lng: longitude });
          setZoom(15);
          setGpsStatus('active');
        } catch (e) {
          const fallbackObj = {
            lat: latitude,
            lng: longitude,
            name: `Live GPS Point (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
            address: 'Detected GPS Location',
            userImage: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            userName: user?.name || 'Passenger',
          };
          setPickup(fallbackObj);
          setCenter({ lat: latitude, lng: longitude });
          setZoom(15);
          setGpsStatus('active');
        }
      },
      (err) => {
        if (pickup?.lat && pickup?.lng) {
          setCenter({ lat: pickup.lat, lng: pickup.lng });
          setZoom(15);
          setGpsStatus('active');
          return;
        }

        const fallback = userLocation || {
          lat: 22.3149,
          lng: 87.3105,
          name: 'Technology Market (Tech Mkt)',
          address: 'Tech Market Rd, IIT Kharagpur 721302',
          city: 'Kharagpur',
        };
        const fallbackPickup = {
          lat: fallback.lat,
          lng: fallback.lng,
          name: fallback.name,
          address: fallback.address || fallback.name,
          userImage: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          userName: user?.name || 'Passenger',
        };
        setPickup(fallbackPickup);
        setCenter({ lat: fallback.lat, lng: fallback.lng });
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

  // Fetch dynamic nearby place predictions based on user pickup coordinates
  useEffect(() => {
    if (pickup?.lat && pickup?.lng) {
      locationService.getNearbyPlaces(pickup.lat, pickup.lng, 100).then((res) => {
        if (res && res.length > 0) {
          setNearbyHotspots(res.filter(isValidPoint));
        }
      });
    }
  }, [pickup?.lat, pickup?.lng]);

  // Compute real route geometry and distance between pickup and destination
  useEffect(() => {
    if (pickup?.lat && destination?.lat) {
      locationService.getRoute(pickup, destination).then((r) => {
        if (r) {
          setRouteInfo(r);
          if (r.distanceKm && destination) {
            setDestination({
              ...destination,
              distanceKm: r.distanceKm,
            });
          }
        }
      });
    } else {
      setRouteInfo(null);
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  // Search input debounced autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await locationService.searchPlaces(searchQuery, pickup || userLocation);
      setSearchResults(res);
      setSearching(false);
    }, 220);
    return () => clearTimeout(t);
  }, [searchQuery, pickup, userLocation]);

  const selectPlace = (place) => {
    const lat = Number(place.location?.lat ?? place.lat);
    const lng = Number(place.location?.lng ?? place.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSearchResults([]);
      setActiveField(null);
      return;
    }
    const formatted = {
      lat,
      lng,
      name: place.name,
      address: place.address || place.name,
      distanceKm: place.distanceKm,
    };

    if (activeField === 'pickup') {
      setPickup(formatted);
      if (setUserLocation) {
        setUserLocation({
          lat: formatted.lat,
          lng: formatted.lng,
          name: formatted.name,
          address: formatted.address,
          isGpsDetected: false,
        });
      }
      if (setCenter) {
        setCenter({ lat: formatted.lat, lng: formatted.lng });
      }
    } else {
      setDestination(formatted);
      if (!pickup && setCenter) {
        setCenter({ lat: formatted.lat, lng: formatted.lng });
      }
    }

    setSearchQuery('');
    setSearchResults([]);
    setActiveField(null);

    if (pickup && activeField === 'destination') setStep('VEHICLE_SELECT');
    if (destination && activeField === 'pickup') setStep('VEHICLE_SELECT');
  };

  const handleSelectPresetDestination = (preset) => {
    if (!isValidPoint(preset)) return;
    const formatted = {
      lat: Number(preset.lat),
      lng: Number(preset.lng),
      name: preset.name,
      address: preset.address || preset.desc,
      distanceKm: preset.distanceKm || 3.5,
    };
    setDestination(formatted);
    if (!pickup && setCenter) {
      setCenter({ lat: formatted.lat, lng: formatted.lng });
    }
    setStep('VEHICLE_SELECT');
  };

  const handleSwapLocations = (e) => {
    e.stopPropagation();
    if (!pickup || !destination) return;
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Promo Code Validation
  const handleApplyPromo = (e) => {
    e?.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'RIDE50' || clean === 'VELOQ50' || clean === 'FIRST50') {
      setAppliedDiscount(50);
      setPromoMessage('🎉 Promo RIDE50 applied! ₹50 OFF');
    } else if (clean === 'TOTO20' || clean === 'SAVE20') {
      setAppliedDiscount(20);
      setPromoMessage('🎉 Promo applied! ₹20 OFF');
    } else if (clean) {
      setAppliedDiscount(0);
      setPromoMessage('❌ Invalid code. Use RIDE50 or TOTO20');
    }
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

  // Ride Booking & Real-Time Driver Proximity Match Simulation
  const handleBookRide = async () => {
    setStep('SEARCHING');
    setMatchingStatus({
      status: 'BROADCASTING',
      message: 'Broadcasting request to nearby drivers in real-time...',
      progress: 30,
    });
    setCountdown(3);

    dispatchSimulation.simulateUserBookingAcceptance(
      pickup || userLocation,
      category,
      (update) => {
        setMatchingStatus(update);
        if (update.driver) {
          setAssignedDriver(update.driver);
        }
        if (update.status === 'ACCEPTED') {
          const dynamicRideId = `RIDE-${Date.now().toString().slice(-6)}`;
          const currentPickup = pickup || userLocation || {
            lat: 22.3149,
            lng: 87.3105,
            name: 'Technology Market, IIT Kharagpur',
            address: 'Tech Market Rd, Kharagpur 721302',
          };
          const currentDest = destination || {
            lat: 22.3425,
            lng: 87.3290,
            name: 'Kharagpur Jn Railway Station',
            address: 'Station Road, Kharagpur',
          };
          const totalFare = estimatedFare?.total || estimatedFare?.base || 42;
          const totalDist = destination?.distanceKm || routeInfo?.distanceKm || estimatedFare?.distance || 1.4;

          const dynamicOtp = String(Math.floor(1000 + Math.random() * 9000));
          const cLat = update.driver?.location?.lat || (currentPickup.lat + (currentDest.lat >= currentPickup.lat ? -0.0045 : 0.0045));
          const cLng = update.driver?.location?.lng || (currentPickup.lng + (currentDest.lng >= currentPickup.lng ? -0.0038 : 0.0038));
          const cName = update.driver?.location?.name || `${currentPickup.name.split(',')[0]} Transit Point`;
          const cAddress = update.driver?.location?.address || `Corridor ~600m from ${currentPickup.name.split(',')[0]}`;

          const driverLocationC = {
            lat: cLat,
            lng: cLng,
            name: cName,
            address: cAddress,
          };

          const bookedRide = {
            id: dynamicRideId,
            userId: user?.id || 'USR-PASSENGER-01',
            userName: user?.name || 'Passenger',
            userPhone: user?.phone || '+91 99887 76655',
            status: 'DRIVER_APPROACHING',
            stage: 'HEADING_TO_PICKUP',
            category: category || 'MOTO',
            pickup: currentPickup,
            destination: currentDest,
            driverStartLocation: driverLocationC,
            fare: estimatedFare || { total: totalFare, base: 25, distance: 12, tax: 2, currency: 'INR' },
            distance: totalDist,
            payment: { method: paymentMode, status: 'PENDING', amount: totalFare },
            requestedAt: new Date().toISOString(),
            otp: dynamicOtp,
            driverInfo: {
              ...(update.driver || {}),
              name: update.driver?.name || 'Subhash Mondal',
              phone: update.driver?.phone || '+91 94340 12891',
              rating: update.driver?.rating || 4.92,
              vehicle: update.driver?.vehicleModel || (category === 'ECONOMY' ? 'Maruti Suzuki Dzire (Cab)' : 'Hero Splendor Plus (Bike)'),
              plate: update.driver?.vehicleNumber || 'WB 26 Q 4921',
              category: category || 'MOTO',
              currentLocation: driverLocationC,
            },
          };
          rideService.recordRide(bookedRide);
          rideSync.broadcast('RIDE_BOOKED', bookedRide);
          try {
            useDriverStore.getState().acceptRide(bookedRide);
          } catch (e) {}

          setTimeout(() => {
            navigate(`/app/ride/${dynamicRideId}`);
          }, 1400);
        }
      }
    );
  };

  const nearbyCount = drivers.filter((d) => d.status !== 'OFFLINE').length || 8;
  const is100KmTrip = destination?.distanceKm >= 80 || (estimatedFare?.distance && estimatedFare?.distance >= 80);

  // Filtered corridor destinations
  const visibleCorridors = (nearbyHotspots.length > 0 ? nearbyHotspots : POPULAR_DESTINATIONS).filter((d) => {
    if (corridorFilter === 'All') return true;
    return d.filter === corridorFilter || d.badge === corridorFilter;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/50 font-sans pb-16">
      
      {/* ── TOP HERO BANNER: Ola/Uber Grade Title & Live Telemetry ─────────────── */}
      <section className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Greeting */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Instant Mobility Booking
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {nearbyCount} Drivers Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Where are you heading, {user?.name?.split(' ')[0] || 'Rider'}? 🛺
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Fast pickups across {userLocation?.city || 'campus corridors & transit hubs'} · Upfront transparent fares
              </p>
            </div>

            {/* Prominent "See Journey On Map" Button (Toggles live map on-demand) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setShowMap(!showMap)}
                className={clsx(
                  'group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 shadow-md active:scale-95 cursor-pointer',
                  showMap
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30 ring-2 ring-blue-500/20 hover:ring-blue-500/40'
                )}
                title="View interactive GPS map with live route and drivers"
              >
                <div className="relative flex items-center justify-center">
                  <span className="text-base group-hover:scale-110 transition-transform">🗺️</span>
                  {!showMap && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 animate-ping" />
                  )}
                </div>
                <span>{showMap ? 'Hide Map View' : 'See Journey On Map'}</span>
                <ChevronRight size={16} className={clsx('transition-transform duration-200', showMap ? 'rotate-90' : 'group-hover:translate-x-0.5')} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── ON-DEMAND LIVE MAP DRAWER / MODAL (Appears smoothly when toggled) ── */}
      {showMap && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            
            {/* Map Top Floating Header */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-xs font-bold text-white shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live GPS Radar</span>
                <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">
                  · {nearbyCount} active vehicles on radar
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={detectLiveGps}
                  className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 text-xs font-black text-slate-800 shadow-lg flex items-center gap-1.5 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
                  title="Re-center GPS"
                >
                  <Crosshair size={13} className="text-blue-600" />
                  <span className="hidden sm:inline">Re-center</span>
                </button>

                <button
                  onClick={() => setShowMap(false)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Close Map and return to booking flow"
                >
                  <X size={14} />
                  <span>Close Map</span>
                </button>
              </div>
            </div>

            {/* Floating Live Dispatch Ticker */}
            <div className="absolute top-16 left-3 right-3 sm:right-auto sm:max-w-md z-30 pointer-events-auto">
              <LiveDispatchTicker />
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="h-[380px] sm:h-[480px] w-full relative">
              <Suspense
                fallback={
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-400 font-bold text-xs">
                    <Spinner size="lg" />
                    <span>Loading Live OpenStreetMap Network...</span>
                  </div>
                }
              >
                <LiveMap
                  zoom={15}
                  center={pickup ? { lat: pickup.lat, lng: pickup.lng } : (destination ? { lat: destination.lat, lng: destination.lng } : (userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null))}
                  pickup={pickup}
                  destination={destination}
                  routeCoordinates={routeInfo?.coordinates}
                  showSurgeZones={true}
                  tileTheme="light"
                  height="100%"
                  user={user}
                  showNearbyPassengers={true}
                  onRecenterGPS={detectLiveGps}
                />
              </Suspense>
            </div>

            {/* Map Bottom Route Banner */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-base shrink-0">
                  📍
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-200 truncate">
                    {pickup ? pickup.name : 'Select pickup point'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {destination ? `To: ${destination.name} (${destination.distanceKm || 4.2} km)` : 'Select destination to view route'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  onClick={() => setShowMap(false)}
                  className="rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
                >
                  Proceed with Booking →
                </Button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── MAIN BOOKING EXPERIENCE (Clean, Ola/Uber Grade Form) ──────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ── STEP 1: PICKUP & DROP-OFF SEARCH ───────────────────────────────── */}
        {(step === 'LOCATION' || step === 'ROUTE_PREVIEW') && (
          <div className="space-y-6">
            
            {/* Input Card with modern route line */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7 relative transition-all">
              
              <div className="relative space-y-3.5">
                
                {/* Connecting timeline dot track */}
                <div className="absolute left-[23px] top-[26px] bottom-[26px] w-0.5 bg-gradient-to-b from-blue-600 via-indigo-400 to-rose-500 rounded-full" />

                {/* Pickup Field */}
                <div
                  className={clsx(
                    'relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all bg-slate-50/70 hover:bg-slate-50',
                    activeField === 'pickup'
                      ? 'border-blue-600 bg-white ring-4 ring-blue-500/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                  onClick={() => {
                    setActiveField('pickup');
                    setSearchQuery(pickup?.name || '');
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs z-10">
                    📍
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Pickup Spot
                      </p>
                      {pickup?.lat && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Verified Spot
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                      {pickup?.name || 'Enter pickup point or tap to detect...'}
                    </p>
                  </div>

                  {/* 1-Tap Quick GPS Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      detectLiveGps();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black border border-blue-200 transition-colors shrink-0 cursor-pointer"
                    title="Use exact GPS"
                  >
                    <Crosshair size={13} />
                    <span className="hidden sm:inline">Use GPS</span>
                  </button>

                  {pickup && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickup(null);
                        setStep('LOCATION');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                      title="Clear Pickup"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Swap Pickup & Destination Button */}
                {pickup && destination && (
                  <div className="flex justify-center -my-2 relative z-10">
                    <button
                      onClick={handleSwapLocations}
                      className="p-2 rounded-full bg-white border border-slate-300 shadow-md text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all cursor-pointer"
                      title="Swap pickup and destination"
                    >
                      <ArrowUpDown size={15} />
                    </button>
                  </div>
                )}

                {/* Destination Dropoff Field */}
                <div
                  className={clsx(
                    'relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all bg-slate-50/70 hover:bg-slate-50',
                    activeField === 'destination'
                      ? 'border-rose-600 bg-white ring-4 ring-rose-500/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                  onClick={() => {
                    setActiveField('destination');
                    setSearchQuery(destination?.name || '');
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs z-10">
                    🏁
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Destination Drop-off
                    </p>
                    <p
                      className={clsx(
                        'text-xs sm:text-sm font-black truncate mt-0.5',
                        destination ? 'text-slate-900' : 'text-slate-400'
                      )}
                    >
                      {destination?.name || 'Where would you like to go?'}
                    </p>
                  </div>

                  {destination && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDestination(null);
                        setStep('LOCATION');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                      title="Clear Destination"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

              </div>

              {/* Active Search Dropdown / Autocomplete Box */}
              {activeField && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      autoFocus
                      className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm border-2 border-blue-600 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10 bg-white"
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
                  <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {activeField === 'pickup' && (
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50/80 hover:bg-blue-100 text-left transition-colors font-extrabold text-xs text-blue-700 cursor-pointer"
                        onClick={() => {
                          detectLiveGps();
                          setActiveField(null);
                          setSearchQuery('');
                        }}
                      >
                        <Crosshair size={16} className="text-blue-600 shrink-0" />
                        <div>
                          <p className="font-extrabold text-blue-800">Use My Exact Live GPS Location</p>
                          <p className="text-[10px] text-blue-600 font-normal">Real-time GPS pin with live accuracy</p>
                        </div>
                      </button>
                    )}

                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                        onClick={() => selectPlace(r)}
                      >
                        <MapPin size={16} className="text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                            {r.distanceKm && (
                              <span className="text-[10px] font-mono text-blue-600 font-bold shrink-0">{r.distanceKm} km</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{r.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready to view vehicles button */}
              {pickup && destination && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{pickup.name.split(',')[0]}</span>
                    {' → '}
                    <span className="font-bold text-slate-800">{destination.name.split(',')[0]}</span>
                    <span className="text-blue-600 font-black ml-1">({destination.distanceKm || 4.2} km)</span>
                  </div>

                  <Button
                    className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => setStep('VEHICLE_SELECT')}
                  >
                    <span>View Vehicles & Fares</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}

            </div>

            {/* ── QUICK 1-TAP POPULAR CORRIDORS (Ola/Rapido style) ───────────── */}
            {!activeField && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-6 space-y-4">
                
                {/* Header & Category Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>⚡ Popular 1-Tap Corridors in {userLocation?.city || 'Kharagpur'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Zero Delay
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tap any destination below for instantaneous route selection
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Transit', 'Campus', 'Hospital'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setCorridorFilter(f)}
                        className={clsx(
                          'px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                          corridorFilter === f
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corridors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleCorridors.map((dest) => (
                    <button
                      key={dest.id || dest.name}
                      onClick={() => handleSelectPresetDestination(dest)}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all duration-200 group flex flex-col justify-between bg-white shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                          {dest.badge || dest.filter || 'Corridor'}
                        </span>
                        {dest.distanceKm && (
                          <span className="text-[11px] font-mono font-bold text-blue-600">
                            {dest.distanceKm} km
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 mt-2.5 line-clamp-1">
                        {dest.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {dest.address || dest.desc}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">1-Tap Book</span>
                        <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Select ➔
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ── STEP 2: VEHICLE SELECTION (Authentic Ola/Uber Tier Cards) ──────── */}
        {step === 'VEHICLE_SELECT' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Bar with Route Pill & Back Button */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setStep('LOCATION')}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Change Route"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-900">Choose Your Ride</h2>
                  <p className="text-xs text-slate-500 truncate">
                    {pickup?.name.split(',')[0]} → {destination?.name.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                  {destination?.distanceKm || 4.2} km
                </span>
                
                {/* Quick Map Peek Toggle */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-black text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>🗺️</span>
                  <span>{showMap ? 'Hide Map' : 'See on Map'}</span>
                </button>
              </div>
            </div>

            {/* Vehicle Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                      'w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border-2 text-left transition-all duration-200 cursor-pointer shadow-xs',
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-lg ring-4 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Scalable Vehicle Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center p-2 shrink-0 border border-slate-200/80 shadow-xs">
                        <VehicleIcon category={cat.id} size="lg" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm sm:text-base font-black text-slate-900">
                            {cat.label}
                          </p>
                          <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                            {cat.seats} seats
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{cat.desc}</p>
                        <p className="text-[11px] text-emerald-600 font-extrabold mt-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{cat.eta} min away · Proximity match</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p className="text-base sm:text-lg font-black text-slate-900">
                        ₹{estPrice}
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold">Total Fare</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 uppercase tracking-wider">
                  Payment Method
                </span>
                <span className="text-emerald-600 font-bold">Guaranteed Price</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'UPI', icon: '⚡', label: 'UPI / QR', sub: 'GPay · PhonePe · Paytm' },
                  { id: 'CASH', icon: '💵', label: 'Cash to Driver', sub: 'Pay on Arrival' },
                  { id: 'CARD', icon: '💳', label: 'Card / Net', sub: 'Instant Online' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMode(m.id)}
                    className={clsx(
                      'py-3 px-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between',
                      paymentMode === m.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    <span className="text-lg mb-1">{m.icon}</span>
                    <div>
                      <p className="text-xs font-black">{m.label}</p>
                      <p className={clsx('text-[10px]', paymentMode === m.id ? 'text-blue-100' : 'text-slate-500')}>
                        {m.sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 3: TRIP CONFIRMATION & FARE INVOICE ───────────────────────── */}
        {step === 'CONFIRM' && estimatedFare && (
          <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('VEHICLE_SELECT')}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-base font-black text-slate-900">Review & Confirm Ride</h2>
                  <p className="text-xs text-slate-500">Upfront price guarantee · No surge surprises</p>
                </div>
              </div>

              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Guaranteed Fare
              </span>
            </div>

            {/* Selected Vehicle Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center p-2 shrink-0">
                    <VehicleIcon category={category} size="md" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {VEHICLE_CATEGORIES.find((c) => c.id === category)?.label || category}
                    </p>
                    <p className="text-xs text-slate-500">
                      {destination?.distanceKm || estimatedFare.distance || 4.2} km · ~12 mins ETA
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-blue-600">
                    ₹{Math.max(10, (estimatedFare.total || 45) - appliedDiscount)}
                  </p>
                  <p className="text-[10px] text-slate-400">All Taxes Included</p>
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-black text-slate-900 shrink-0">Pickup:</span>
                  <span className="text-slate-600 truncate">{pickup?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span className="font-black text-slate-900 shrink-0">Drop:</span>
                  <span className="text-slate-600 truncate">{destination?.name}</span>
                </div>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-800">Have a Promo Coupon?</span>
                <span className="text-[11px] text-blue-600 font-bold">Use RIDE50</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. RIDE50)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={clsx('text-xs font-bold', appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-500')}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Itemized Fare Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Ride Fare:</span>
                <span className="font-bold text-slate-900">₹{estimatedFare.base}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Charge ({estimatedFare.distance} km):</span>
                <span className="font-bold text-slate-900">
                  ₹{estimatedFare.distanceFare || Math.round(estimatedFare.distance * 12)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Regulatory Surcharges (5%):</span>
                <span className="font-bold text-slate-900">₹{estimatedFare.tax}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount:</span>
                  <span>- ₹{appliedDiscount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-black text-slate-900">
                <span className="text-sm">Final Payable Amount:</span>
                <span className="text-2xl text-blue-600">
                  ₹{Math.max(10, (estimatedFare.total || 45) - appliedDiscount)}
                </span>
              </div>
            </div>

            {/* Dispatch Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                className="py-3.5 px-5 text-xs font-bold rounded-2xl cursor-pointer"
                onClick={() => setStep('VEHICLE_SELECT')}
              >
                Back
              </Button>
              
              <button
                onClick={() => setShowMap(!showMap)}
                className="py-3.5 px-5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>🗺️</span>
                <span>{showMap ? 'Hide Map' : 'See on Map'}</span>
              </button>

              <Button
                className="flex-1 py-4 text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                onClick={handleBookRide}
              >
                <span>Confirm & Request Ride (₹{Math.max(10, (estimatedFare.total || 45) - appliedDiscount)})</span>
                <ArrowRight size={16} />
              </Button>
            </div>

          </div>
        )}

        {/* ── STEP 4: RADAR DISPATCHING / CONNECTING ─────────────────────────── */}
        {step === 'SEARCHING' && (
          <div className="max-w-md mx-auto py-10 text-center space-y-6">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-blue-500/10 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-4xl shadow-2xl z-10">
                📡
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {matchingStatus?.status === 'ACCEPTED' 
                  ? '🎉 Driver Partner Assigned!' 
                  : is100KmTrip 
                  ? 'Dispatching Highway Cab' 
                  : 'Finding Nearest Driver Partner'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {matchingStatus?.message || 'Proximity Dispatch: Assigning the verified driver closest to your pickup spot'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg text-left text-xs space-y-3.5 max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span className="text-slate-500">📍 Pickup:</span>
                <span className="font-bold text-slate-900 truncate max-w-[190px]">
                  {pickup?.name || 'Current Spot'}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${matchingStatus?.progress || 40}%` }}
                />
              </div>

              {matchingStatus?.driver ? (
                <div className="flex items-center justify-between bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {matchingStatus.driver.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950 text-xs">{matchingStatus.driver.name}</p>
                      <p className="text-[11px] text-emerald-700">
                        ★ {matchingStatus.driver.rating} · {matchingStatus.driver.vehicleModel}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-xs">
                    {matchingStatus.status === 'ACCEPTED' ? 'ASSIGNED ✓' : 'PINGING...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Connecting to {nearbyCount} active driver partners...</span>
                </div>
              )}
            </div>

            {/* Map Watch Button while Searching */}
            <div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-black text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <span>🗺️</span>
                <span>{showMap ? 'Hide Map Radar' : 'Watch Live Dispatch on Map'}</span>
              </button>
            </div>

            <Button
              variant="ghost"
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              onClick={reset}
            >
              Cancel Request
            </Button>
          </div>
        )}

      </main>

    </div>
  );
}
