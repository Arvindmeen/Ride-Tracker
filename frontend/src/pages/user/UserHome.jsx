import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Clock, Search, X, Crosshair, ArrowRight,
  ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Car,
  ArrowUpDown, Compass, Check, Layers, ChevronRight, CreditCard, Shield,
  Eye, Radio, Zap, ChevronLeft, Pause, Play
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useBookingStore, useMapStore, useDriverStore } from '@/stores';
import { locationService, pricingService, rideService, rideSync } from '@/services';
import { Button, Spinner, Badge, Avatar } from '@/components/ui';
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

// Curated Promo Coupons: Dynamic percentage discounts with max caps proportional to ride amount
export const PROMO_COUPONS = {
  RIDE50: {
    code: 'RIDE50',
    name: '50% Off (Up to ₹50)',
    percent: 50,
    maxDiscount: 50,
    minFare: 20,
    desc: '50% off up to ₹50 on rides ₹20+',
  },
  VELOQ50: {
    code: 'VELOQ50',
    name: '50% Off (Up to ₹50)',
    percent: 50,
    maxDiscount: 50,
    minFare: 20,
    desc: '50% off up to ₹50 on rides ₹20+',
  },
  FIRST50: {
    code: 'FIRST50',
    name: '50% Off (Up to ₹50)',
    percent: 50,
    maxDiscount: 50,
    minFare: 20,
    desc: '50% off up to ₹50 on rides ₹20+',
  },
  TOTO20: {
    code: 'TOTO20',
    name: '20% Off (Up to ₹20)',
    percent: 20,
    maxDiscount: 20,
    minFare: 15,
    desc: '20% off up to ₹20 on rides ₹15+',
  },
  SAVE20: {
    code: 'SAVE20',
    name: '20% Off (Up to ₹20)',
    percent: 20,
    maxDiscount: 20,
    minFare: 15,
    desc: '20% off up to ₹20 on rides ₹15+',
  },
  CAMPUS25: {
    code: 'CAMPUS25',
    name: '25% Student Saver (Up to ₹30)',
    percent: 25,
    maxDiscount: 30,
    minFare: 20,
    desc: '25% off up to ₹30 on rides ₹20+',
  },
};

// Unified Vehicle Services matching the clean card screenshot
export const VEHICLE_SERVICES = [
  {
    id: 'toto',
    name: 'Solar E-Toto',
    category: 'AUTO',
    icon: '🛺',
    basePrice: 20,
    pricePerKm: 8,
    eta: '1 min',
    tag: 'Campus & Micro-Mobility',
    seats: 3,
    model: 'Solar E-Toto #08',
  },
  {
    id: 'bike',
    name: 'Electric Bike',
    category: 'MOTO',
    icon: '🏍️',
    basePrice: 15,
    pricePerKm: 6,
    eta: '2 mins',
    tag: 'Fastest Solo Commute',
    seats: 1,
    model: 'Electric Bike (Ather EV)',
  },
  {
    id: 'cab',
    name: 'Prime EV Cab',
    category: 'ECONOMY',
    icon: '🚗',
    basePrice: 60,
    pricePerKm: 14,
    eta: '4 mins',
    tag: 'AC Executive Comfort',
    seats: 4,
    model: 'Prime EV Cab (Tata Tigor)',
  },
  {
    id: 'transporter',
    name: 'EV Transporter',
    category: 'XL',
    icon: '🚚',
    basePrice: 80,
    pricePerKm: 14,
    eta: '3 mins',
    tag: 'Luggage & Goods Cargo',
    seats: 2,
    model: 'EV Transporter (Tata Ace EV)',
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

  // On-demand Map View: false by default (clean, focused booking flow)
  const [showMap, setShowMap] = useState(false);

  // Selected Vehicle Service (auto-synced with store category and persistent storage)
  const [selectedService, setSelectedService] = useState(() => {
    const savedId = typeof window !== 'undefined' ? localStorage.getItem('veloq_selected_vehicle_id') : null;
    const savedCat = typeof window !== 'undefined' ? localStorage.getItem('veloq_selected_vehicle_category') : null;
    const targetCat = category || savedCat;

    if (targetCat) {
      const match = VEHICLE_SERVICES.find(
        (s) => s.category === targetCat || s.id === String(targetCat).toLowerCase()
      );
      if (match) return match;
    }
    if (savedId) {
      const matchId = VEHICLE_SERVICES.find((s) => s.id === savedId);
      if (matchId) return matchId;
    }
    return VEHICLE_SERVICES[0];
  });

  // Keep selectedService synchronized whenever store category changes
  useEffect(() => {
    if (category) {
      const match = VEHICLE_SERVICES.find(
        (s) => s.category === category || s.id === String(category).toLowerCase()
      );
      if (match && match.id !== selectedService.id) {
        setSelectedService(match);
      }
    }
  }, [category, selectedService.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'pickup' | 'destination'
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CASH' | 'CARD'
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'active' | 'denied'
  const [nearbyHotspots, setNearbyHotspots] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [matchingStatus, setMatchingStatus] = useState(null);
  const [corridorFilter, setCorridorFilter] = useState('All');

  // Gentle, non-panicking countdown for driver acceptance
  const [activeBookedRideId, setActiveBookedRideId] = useState(null);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

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

  // Gentle countdown timer when driver accepts (lets user stay on page or view map without panicking!)
  useEffect(() => {
    if (autoRedirectTimer === null || autoRedirectTimer <= 0 || isTimerPaused) return;
    const timer = setInterval(() => {
      setAutoRedirectTimer((prev) => {
        if (prev <= 1) {
          if (activeBookedRideId) {
            navigate(`/app/ride/${activeBookedRideId}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRedirectTimer, isTimerPaused, activeBookedRideId, navigate]);

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

    const dist = formatted.distanceKm || 3.5;
    const base = selectedService.basePrice;
    const distanceFare = Math.round(dist * selectedService.pricePerKm);
    const tax = Math.round((base + distanceFare) * 0.05);
    const total = base + distanceFare + tax;
    setEstimatedFare({
      base,
      distance: dist,
      distanceFare,
      tax,
      total,
      currency: 'INR',
    });
    setCategory(selectedService.category);
    setStep('VEHICLE_SELECT');
  };

  const handleSwapLocations = (e) => {
    e.stopPropagation();
    if (!pickup || !destination) return;
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Select Vehicle Service
  const handleSelectVehicleService = (srv) => {
    if (!srv) return;
    setSelectedService(srv);
    setCategory(srv.category);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veloq_selected_vehicle_id', srv.id);
      localStorage.setItem('veloq_selected_vehicle_category', srv.category);
    }
    const dist = destination?.distanceKm || 4.2;
    const base = srv.basePrice;
    const distanceFare = Math.round(dist * srv.pricePerKm);
    const tax = Math.round((base + distanceFare) * 0.05);
    const total = base + distanceFare + tax;
    setEstimatedFare({
      base,
      distance: dist,
      distanceFare,
      tax,
      total,
      currency: 'INR',
    });
  };

  const handleProceedToConfirm = (srv) => {
    const target = srv || selectedService;
    handleSelectVehicleService(target);
    setStep('CONFIRM');
  };

  // Promo Code Validation (Dynamic percentage discount based strictly on ride amount)
  const handleApplyPromo = (e, customCode = null) => {
    e?.preventDefault();
    const clean = (customCode || promoInput).trim().toUpperCase();
    if (!clean) {
      setAppliedCoupon(null);
      setPromoMessage('');
      return;
    }

    const coupon = PROMO_COUPONS[clean];
    if (coupon) {
      const baseRideFare = selectedService.basePrice;
      const distanceCharge = Math.round(activeDistance * selectedService.pricePerKm);
      const subtotalFare = baseRideFare + distanceCharge;

      if (coupon.minFare && subtotalFare < coupon.minFare) {
        setAppliedCoupon(null);
        setPromoMessage(`⚠️ ${coupon.code} requires a min. ride fare of ₹${coupon.minFare} (Current: ₹${subtotalFare})`);
        return;
      }

      setAppliedCoupon(coupon);
      setPromoInput(coupon.code);
      
      // Calculate savings dynamically: Proportional to ride fare, never exceeding subtotal
      const calculatedSavings = Math.min(
        coupon.maxDiscount,
        Math.round(subtotalFare * (coupon.percent / 100)),
        Math.max(0, subtotalFare - 10)
      );
      setPromoMessage(`🎉 ${coupon.code} applied! ${coupon.percent}% OFF (₹${calculatedSavings} saved on this ₹${subtotalFare} ride)`);
    } else {
      setAppliedCoupon(null);
      setPromoMessage('❌ Invalid coupon code. Try RIDE50 or TOTO20');
    }
  };

  // Ride Booking & Animated Real-Time Driver Proximity Match (No Panicking!)
  const handleBookRide = async () => {
    setStep('SEARCHING');
    setAutoRedirectTimer(null);
    setIsTimerPaused(false);

    setMatchingStatus({
      status: 'BROADCASTING',
      message: 'Broadcasting request to nearby verified drivers in real-time...',
      progress: 35,
    });

    dispatchSimulation.simulateUserBookingAcceptance(
      pickup || userLocation,
      selectedService.category,
      (update) => {
        setMatchingStatus(update);
        if (update.driver) {
          setAssignedDriver(update.driver);
        }
        if (update.status === 'ACCEPTED') {
          const dynamicRideId = `RIDE-${Date.now().toString().slice(-6)}`;
          setActiveBookedRideId(dynamicRideId);

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
          const dist = destination?.distanceKm || routeInfo?.distanceKm || 4.2;
          const baseFare = selectedService.basePrice;
          const distFare = Math.round(dist * selectedService.pricePerKm);
          const subtotal = baseFare + distFare;

          // Calculate dynamic promo discount based on the ride amount
          const promoDiscount = appliedCoupon
            ? Math.min(
                appliedCoupon.maxDiscount,
                Math.round(subtotal * (appliedCoupon.percent / 100)),
                Math.max(0, subtotal - 10)
              )
            : 0;

          const tax = Math.max(1, Math.round((subtotal - promoDiscount) * 0.05));
          const finalFare = Math.max(10, subtotal - promoDiscount + tax);

          const dynamicOtp = String(Math.floor(1000 + Math.random() * 9000));
          const isTotoOrLocal = String(selectedService?.category || '').toUpperCase().includes('AUTO') ||
                                String(selectedService?.category || '').toUpperCase().includes('TOTO') ||
                                String(currentPickup.name || '').toLowerCase().includes('kharagpur') ||
                                String(currentPickup.name || '').toLowerCase().includes('tech mkt');
          const latOffset = isTotoOrLocal ? 0.0016 : 0.0020;
          const lngOffset = isTotoOrLocal ? -0.0015 : -0.0018;

          const cLat = update.driver?.location?.lat || (currentPickup.lat + latOffset);
          const cLng = update.driver?.location?.lng || (currentPickup.lng + lngOffset);
          const cName = update.driver?.location?.name || `${currentPickup.name.split(',')[0]} Local Stand`;
          const cAddress = update.driver?.location?.address || `Approach corridor ~250m from ${currentPickup.name.split(',')[0]}`;

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
            category: selectedService.category,
            pickup: currentPickup,
            destination: currentDest,
            driverStartLocation: driverLocationC,
            fare: {
              total: finalFare,
              base: baseFare,
              distance: dist,
              distanceFare: distFare,
              discount: promoDiscount,
              promoCode: appliedCoupon ? appliedCoupon.code : null,
              tax: tax,
              currency: 'INR',
            },
            distance: dist,
            duration: Math.max(2, Math.round(dist * 2.2)),
            durationMinutes: Math.max(2, Math.round(dist * 2.2)),
            payment: { method: paymentMode, status: 'PENDING', amount: finalFare },
            requestedAt: new Date().toISOString(),
            otp: dynamicOtp,
            driverInfo: {
              ...(update.driver || {}),
              name: update.driver?.name || 'Subhash Mondal',
              phone: update.driver?.phone || '+91 94340 12891',
              rating: update.driver?.rating || 4.92,
              vehicle: selectedService.model || update.driver?.vehicleModel || 'Solar E-Toto #08',
              plate: update.driver?.vehicleNumber || 'WB 26 Q 4921',
              category: selectedService.category,
              currentLocation: driverLocationC,
            },
          };
          rideService.recordRide(bookedRide);
          if (typeof window !== 'undefined') {
            localStorage.setItem('veloq_active_booked_ride', JSON.stringify(bookedRide));
          }
          rideSync.broadcast('RIDE_BOOKED', bookedRide);
          try {
            useDriverStore.getState().acceptRide(bookedRide);
          } catch (e) {}

          // Start calm 10s countdown, giving user full control to watch map or proceed at their own pace
          setAutoRedirectTimer(10);
        }
      },
      drivers
    );
  };

  const nearbyCount = drivers.filter((d) => d.status !== 'OFFLINE').length || 8;

  // Filtered corridor destinations
  const visibleCorridors = (nearbyHotspots.length > 0 ? nearbyHotspots : POPULAR_DESTINATIONS).filter((d) => {
    if (corridorFilter === 'All') return true;
    return d.filter === corridorFilter || d.badge === corridorFilter;
  });

  const activeDistance = destination?.distanceKm || routeInfo?.distanceKm || 4.2;
  const baseRideFare = selectedService.basePrice;
  const distanceCharge = Math.round(activeDistance * selectedService.pricePerKm);
  const subtotalFare = baseRideFare + distanceCharge;

  // Calculate promo discount dynamically based on ride amount
  const effectivePromoDiscount = appliedCoupon
    ? Math.min(
        appliedCoupon.maxDiscount,
        Math.round(subtotalFare * (appliedCoupon.percent / 100)),
        Math.max(0, subtotalFare - 10)
      )
    : 0;

  const taxesAndLevies = Math.max(1, Math.round((subtotalFare - effectivePromoDiscount) * 0.05));
  const currentCalculatedFare = Math.max(10, subtotalFare - effectivePromoDiscount + taxesAndLevies);

  return (
    <div className="relative w-full max-w-full overflow-x-hidden min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/50 font-sans pb-16">
      
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
                Fast pickups across {userLocation?.city || 'campus corridors & transit hubs'} · Continuous live GPS tracking
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

      {/* ── ON-DEMAND LIVE MAP (Allows free scrolling/panning without panicking user) ── */}
      {showMap && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            
            {/* Map Top Floating Header */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-xs font-bold text-white shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Continuous Radar</span>
                <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">
                  · {nearbyCount} active vehicles gliding
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
                  tileTheme="osm"
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
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg shrink-0">
                  {selectedService.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-200 truncate">
                    {pickup ? pickup.name : 'Select pickup point'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {destination ? `To: ${destination.name} (${destination.distanceKm || 4.2} km) · ${selectedService.name}` : 'Select destination to view route'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  onClick={() => setShowMap(false)}
                  className="rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto cursor-pointer"
                >
                  Proceed with Booking →
                </Button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── MAIN BOOKING EXPERIENCE ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ── STEP 1: PICKUP & DROP-OFF SEARCH ───────────────────────────────── */}
        {(step === 'LOCATION' || step === 'ROUTE_PREVIEW') && (
          <div className="space-y-6">
            
            {/* Input Card with connected route timeline */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-4 sm:p-5 relative transition-all">
              
              {/* Connected Route Inputs (Compact, Animated & User-Friendly) */}
              <div className="relative bg-slate-50/80 border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 transition-all">
                
                {/* Visual Journey Left Spine */}
                <div className="absolute left-[17px] sm:left-[19px] top-[22px] bottom-[22px] w-[2px] flex flex-col items-center pointer-events-none z-10">
                  {/* Pickup Spot Marker (Animated pulsing circle) */}
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shadow-xs shrink-0" />
                  
                  {/* Flowing Gradient Route Spine */}
                  <div className="flex-1 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-400 to-rose-500 my-1 relative overflow-hidden opacity-80">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-transparent animate-shimmer-flow" />
                  </div>
                  
                  {/* Destination Dropoff Marker (Crisp beacon square) */}
                  <div className="w-2.5 h-2.5 rounded-[3px] bg-rose-600 ring-4 ring-rose-100 shadow-xs shrink-0" />
                </div>

                <div className="space-y-0.5">
                  {/* Pickup Field */}
                  <div
                    className={clsx(
                      'group relative flex items-center gap-2.5 pl-8 sm:pl-9 pr-2 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-200',
                      activeField === 'pickup'
                        ? 'bg-white shadow-xs ring-1 ring-blue-500/20'
                        : 'hover:bg-white/70'
                    )}
                    onClick={() => {
                      setActiveField('pickup');
                      setSearchQuery(pickup?.name || '');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <span>Pickup Spot</span>
                          <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        </span>
                        {pickup?.lat && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100/80 inline-flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className={clsx(
                        'text-xs sm:text-sm font-black truncate mt-0.5 leading-tight',
                        pickup ? 'text-slate-900' : 'text-slate-400'
                      )}>
                        {pickup?.name || 'Enter pickup point or tap to locate...'}
                      </p>
                    </div>

                    {/* 1-Tap Quick GPS Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        detectLiveGps();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200/80 transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs"
                      title="Use exact GPS"
                    >
                      <Crosshair size={12} className="text-blue-600" />
                      <span className="hidden sm:inline">Use GPS</span>
                    </button>

                    {pickup && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickup(null);
                          setStep('LOCATION');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Clear Pickup"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Seam Hairline Divider with Floating Animated Circular Swap Button */}
                  <div className="relative h-px bg-slate-200/70 my-0.5 ml-8 sm:ml-9 mr-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSwapLocations}
                      className="absolute -top-3.5 right-4 sm:right-6 z-20 group flex items-center justify-center w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-white border border-slate-200 hover:border-indigo-500 shadow-2xs hover:shadow-md hover:shadow-indigo-500/20 active:scale-90 transition-all duration-300 cursor-pointer"
                      title="Swap pickup and destination"
                    >
                      <ArrowUpDown
                        size={12}
                        className="text-slate-500 group-hover:text-indigo-600 group-hover:rotate-180 transition-transform duration-500 ease-out"
                      />
                    </button>
                  </div>

                  {/* Destination Dropoff Field */}
                  <div
                    className={clsx(
                      'group relative flex items-center gap-2.5 pl-8 sm:pl-9 pr-2 py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all duration-200',
                      activeField === 'destination'
                        ? 'bg-white shadow-xs ring-1 ring-rose-500/20'
                        : 'hover:bg-white/70'
                    )}
                    onClick={() => {
                      setActiveField('destination');
                      setSearchQuery(destination?.name || '');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <span>Destination Drop-off</span>
                        <span className="w-1 h-1 rounded-full bg-rose-500" />
                      </span>
                      <p
                        className={clsx(
                          'text-xs sm:text-sm font-black truncate mt-0.5 leading-tight',
                          destination ? 'text-slate-900' : 'text-slate-400'
                        )}
                      >
                        {destination?.name || 'Where would you like to go?'}
                      </p>
                    </div>

                    {destination && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestination(null);
                          setStep('LOCATION');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Clear Destination"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── QUICK 1-TAP DESTINATION CHIPS (Completely decoupled and outside route connector) ── */}
              <div className="pt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Quick 1-Tap Destinations</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">Tap to route</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {visibleCorridors.slice(0, 6).map((corridor) => (
                    <button
                      key={corridor.id || corridor.name}
                      onClick={() => handleSelectPresetDestination(corridor)}
                      className={clsx(
                        'px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border shadow-2xs active:scale-95',
                        destination?.name === corridor.name
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                      )}
                    >
                      <span>{corridor.icon || '📍'}</span>
                      <span>{corridor.name.split(',')[0]}</span>
                      {corridor.distanceKm && (
                        <span className={clsx('text-[10px] font-mono font-normal', destination?.name === corridor.name ? 'text-blue-100' : 'text-slate-400')}>
                          · {corridor.distanceKm} km
                        </span>
                      )}
                    </button>
                  ))}
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

              {/* ── INTEGRATED LIVE VEHICLE FLEET & DISPATCH HUB ────────────────── */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Available Rides Nearby
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      8 Online
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {destination ? `Distance: ${activeDistance} km` : 'Guaranteed Upfront Fare'}
                  </span>
                </div>

                {/* 4 Vehicle Matrix Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {VEHICLE_SERVICES.map((srv) => {
                    const price = Math.round(srv.basePrice + (destination ? activeDistance * srv.pricePerKm : 0));
                    const isSel = selectedService.id === srv.id;

                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleSelectVehicleService(srv)}
                        className={clsx(
                          'p-3.5 rounded-2xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between group',
                          isSel
                            ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-4 ring-blue-500/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-2xs'
                        )}
                      >
                        {isSel && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                        )}

                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-slate-100/80 group-hover:bg-white flex items-center justify-center p-1 transition-colors">
                            {srv.id === 'toto' ? (
                              <img src="/toto-logo.svg" alt="Toto" className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-2xl">{srv.icon}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {srv.eta}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <p className="text-xs font-black text-slate-900 leading-tight truncate">
                            {srv.name}
                          </p>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-sm font-black text-blue-600">
                              ₹{price}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {destination ? 'total' : 'starts'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Method Selector Pill Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Payment:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'UPI', label: '⚡ UPI AutoPay' },
                        { id: 'CASH', label: '💵 Cash to Driver' },
                        { id: 'WALLET', label: '👛 Wallet' },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMode(pm.id)}
                          className={clsx(
                            'px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer',
                            paymentMode === pm.id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                          )}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Zero Surge Guaranteed</span>
                  </span>
                </div>

                {/* Primary Booking / Dispatch CTA */}
                <div className="pt-2">
                  {destination ? (
                    <Button
                      className="w-full py-4 text-xs sm:text-sm font-black rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                      onClick={() => handleProceedToConfirm(selectedService)}
                    >
                      <span>Confirm & Dispatch {selectedService.name} • ₹{currentCalculatedFare}</span>
                      <ArrowRight size={18} />
                    </Button>
                  ) : (
                    <Button
                      className="w-full py-4 text-xs sm:text-sm font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                      onClick={() => {
                        if (visibleCorridors && visibleCorridors.length > 0) {
                          handleSelectPresetDestination(visibleCorridors[0]);
                        } else {
                          setActiveField('destination');
                        }
                      }}
                    >
                      <span>👉 Select Destination to Dispatch {selectedService.name} (from ₹{selectedService.basePrice})</span>
                      <ArrowRight size={18} />
                    </Button>
                  )}
                </div>

              </div>

            </div>

            {/* ── QUICK 1-TAP POPULAR CORRIDORS ───────────────────────────────── */}
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

        {/* ── STEP 2: VEHICLE SELECTION (Matching the Image Exactly) ─────────── */}
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
                  {activeDistance} km
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

            {/* Vehicle Type Card Grid (Matching Image Exactly) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Vehicle Type</label>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Upfront Fare Guaranteed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_SERVICES.map((srv) => {
                  const price = Math.round(srv.basePrice + activeDistance * srv.pricePerKm);
                  const isSel = selectedService.id === srv.id;

                  return (
                    <button
                      key={srv.id}
                      onClick={() => handleSelectVehicleService(srv)}
                      className={clsx(
                        'p-3.5 rounded-2xl text-left border transition-all relative cursor-pointer',
                        isSel
                          ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs'
                      )}
                    >
                      <div className="text-3xl mb-2">{srv.icon}</div>
                      <p className="text-xs font-black text-slate-900 leading-tight">{srv.name}</p>
                      <p className="text-sm font-black text-blue-600 mt-1">₹{price}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{srv.eta}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 uppercase tracking-wider">
                  Payment Method
                </span>
                <span className="text-emerald-600 font-bold">Zero Cash Surcharges</span>
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

              {/* Proceed Action Button */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  className="w-full sm:w-auto px-7 py-3.5 text-xs sm:text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => handleProceedToConfirm(selectedService)}
                >
                  <span>Review & Confirm {selectedService.name} (₹{currentCalculatedFare})</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 3: TRIP CONFIRMATION & FARE INVOICE ───────────────────────── */}
        {step === 'CONFIRM' && (
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
                  <p className="text-xs text-slate-500">Upfront price guarantee · Clean electric fleet</p>
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
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {selectedService.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {selectedService.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeDistance} km journey · ~{selectedService.eta} ETA
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-blue-600">
                    ₹{currentCalculatedFare}
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
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-black text-slate-800">Have a Promo Coupon?</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Try:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPromo(null, 'RIDE50')}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200/80 cursor-pointer transition-colors"
                  >
                    RIDE50 (50% Off)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPromo(null, 'TOTO20')}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/80 cursor-pointer transition-colors"
                  >
                    TOTO20 (20% Off)
                  </button>
                </div>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <p className="font-mono font-black text-emerald-950 text-xs">
                        {appliedCoupon.code} <span className="font-sans font-bold text-emerald-700">({appliedCoupon.percent}% OFF · ₹{effectivePromoDiscount} saved)</span>
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium">Calculated proportional to your ₹{subtotalFare} ride fare</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setPromoInput('');
                      setPromoMessage('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
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
              )}

              {promoMessage && !appliedCoupon && (
                <p className="text-xs font-bold text-rose-500 animate-shake">
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Itemized Fare Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Ride Fare:</span>
                <span className="font-bold text-slate-900">₹{baseRideFare}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Charge ({activeDistance} km):</span>
                <span className="font-bold text-slate-900">
                  ₹{distanceCharge}
                </span>
              </div>
              {effectivePromoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/80">
                  <span>Promo Discount ({appliedCoupon?.code} · {appliedCoupon?.percent}% OFF):</span>
                  <span>- ₹{effectivePromoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Regulatory Levies (5%):</span>
                <span className="font-bold text-slate-900">₹{taxesAndLevies}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-black text-slate-900">
                <span className="text-sm">Final Payable Amount:</span>
                <span className="text-2xl text-blue-600">
                  ₹{currentCalculatedFare}
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
                <span>Confirm & Request Ride (₹{currentCalculatedFare})</span>
                <ArrowRight size={16} />
              </Button>
            </div>

          </div>
        )}

        {/* ── STEP 4: ANIMATED LIVE DISPATCH & RADAR (No-Panic Flow) ─────────── */}
        {step === 'SEARCHING' && (
          <div className="max-w-lg mx-auto py-6 sm:py-8 space-y-5 animate-in fade-in duration-300">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-6 text-center">
              
              {/* Animated Radar Beacon */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-blue-500/10 animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-xl z-10">
                  {selectedService.icon}
                </div>
              </div>

              {/* Animated Text Updates */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight transition-all">
                  {matchingStatus?.status === 'ACCEPTED' 
                    ? '🎉 Driver Partner Confirmed!' 
                    : matchingStatus?.status === 'DRIVER_NOTIFIED'
                    ? '⚡ Driver Partner Reviewing...'
                    : `Finding Nearest ${selectedService.name}`}
                </h2>
                
                {/* Smooth Animated Message */}
                <div className="h-10 flex items-center justify-center mt-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {matchingStatus?.message || `Broadcasting request to verified ${selectedService.name} drivers nearby...`}
                  </p>
                </div>
              </div>

              {/* Progressive Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-xs" 
                  style={{ width: `${matchingStatus?.progress || 35}%` }}
                />
              </div>

              {/* Status Details / Driver Partner Card */}
              {matchingStatus?.driver ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-left space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-1 shrink-0 shadow-xs">
                        {String(selectedService.category).toUpperCase().includes('AUTO') || String(selectedService.name).toLowerCase().includes('toto') ? (
                          <img src="/toto-logo.svg" alt="Toto" className="w-7 h-7 object-contain" />
                        ) : (
                          <span className="text-xl">{selectedService.icon}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-emerald-950 text-sm">{matchingStatus.driver.name}</p>
                        <p className="text-xs text-emerald-700 font-semibold">
                          ★ {matchingStatus.driver.rating || 4.9} · {selectedService.model || matchingStatus.driver.vehicleModel}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                      ACCEPTED ✓
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-bold">Plate: {matchingStatus.driver.vehicleNumber || 'WB 26 Q 4921'}</span>
                    <span className="font-mono font-black text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      OTP: {matchingStatus.otp || '4821'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Contacting {nearbyCount} verified drivers around your pickup spot...</span>
                </div>
              )}

              {/* Non-Panicking Control Actions */}
              <div className="space-y-2.5 pt-2">
                
                {/* On-Demand Map Watch Button */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <span>🗺️</span>
                  <span>{showMap ? 'Hide Map Radar' : 'Watch Live Driver on Map'}</span>
                </button>

                {/* When driver is confirmed: Calm action button with optional countdown pause */}
                {matchingStatus?.status === 'ACCEPTED' && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-300">
                    <Button
                      className="w-full py-4 text-sm font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      onClick={() => {
                        if (activeBookedRideId) navigate(`/app/ride/${activeBookedRideId}`);
                      }}
                    >
                      <span>Open Live Ride Tracking Cockpit</span>
                      <ArrowRight size={16} />
                    </Button>

                    {/* Calm countdown notice that user can pause or cancel without panic */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>
                        {isTimerPaused 
                          ? 'Auto-tracking paused. Take your time.' 
                          : `Opening tracking view in ${autoRedirectTimer || 10}s...`}
                      </span>
                      <button
                        onClick={() => setIsTimerPaused(!isTimerPaused)}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isTimerPaused ? <Play size={10} /> : <Pause size={10} />}
                        <span>{isTimerPaused ? 'Resume' : 'Stay on this Screen'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel Booking option */}
                <Button
                  variant="ghost"
                  className="text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  onClick={() => {
                    setAutoRedirectTimer(null);
                    reset();
                  }}
                >
                  Cancel Request
                </Button>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
