import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, MessageSquare, Share2, AlertTriangle, MapPin,
  Clock, Star, X, CheckCircle2, ShieldCheck, DollarSign,
  Copy, Send, Lock, Check, ChevronUp, ChevronDown, Compass,
  Navigation, Zap, Crosshair, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { rideService, locationService, rideSync } from '@/services';
import { useMapStore, useBookingStore } from '@/stores';
import { Spinner, Badge, Button, VehicleIcon } from '@/components/ui';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

const STATUS_STEPS = [
  { key: 'DRIVER_ASSIGNED', label: 'Driver Confirmed' },
  { key: 'DRIVER_APPROACHING', label: 'Driver Approaching' },
  { key: 'DRIVER_ARRIVED', label: 'Driver Arrived at Pickup' },
  { key: 'RIDE_STARTED', label: 'Ride in Progress' },
  { key: 'RIDE_COMPLETED', label: 'Ride Completed' },
];

function getFareDisplay(fare) {
  if (!fare) return '48';
  if (typeof fare === 'object') {
    return Math.round(fare.total ?? fare.base ?? 48);
  }
  return typeof fare === 'number' ? Math.round(fare) : fare;
}

// Calculate bearing heading angle between two coordinate points
function calculateBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Generate smooth multi-step interpolated coordinates along polyline via cumulative distance resampling
function interpolatePath(points, targetSteps = 30) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) return points;

  // Calculate cumulative distances
  const cumDists = [0];
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    cumDists.push(cumDists[i] + d);
  }
  const totalDist = cumDists[cumDists.length - 1];
  if (totalDist === 0) return points;

  const result = [];
  for (let s = 0; s < targetSteps; s++) {
    const targetDist = (s / (targetSteps - 1)) * totalDist;
    let segIdx = 0;
    while (segIdx < cumDists.length - 2 && cumDists[segIdx + 1] < targetDist) {
      segIdx++;
    }
    const segStart = cumDists[segIdx];
    const segLen = cumDists[segIdx + 1] - segStart;
    const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;
    const p1 = points[segIdx];
    const p2 = points[segIdx + 1];
    result.push([
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t,
    ]);
  }
  return result;
}

export default function LiveRidePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startSimulation, userLocation, drivers, setUserLocation } = useMapStore();
  const {
    pickup: storePickup,
    destination: storeDestination,
    category: storeCategory,
    estimatedFare: storeFare,
    assignedDriver,
    setPickup,
    setDestination,
  } = useBookingStore();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Namaste! I am on my way to your pickup point.' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Moving driver coordinates & dynamic telemetry
  const [driverLocation, setDriverLocation] = useState(null);
  const [activeDriverEta, setActiveDriverEta] = useState(2);
  const [activeDriverDistance, setActiveDriverDistance] = useState(0.6);
  const [activeDriverSpeed, setActiveDriverSpeed] = useState(32);
  const [routePolyline, setRoutePolyline] = useState(null);

  // Waypoints for smooth simulation
  const approachWaypoints = useRef([]);
  const tripWaypoints = useRef([]);
  const animIndexRef = useRef(0);

  // Initialize Ride Details
  useEffect(() => {
    // Check if dynamic ride was pre-booked in store/localStorage
    let dynamicTrip = null;
    if (id) {
      const storedTrips = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('veloq_user_trips') || '[]') : [];
      dynamicTrip = storedTrips.find((r) => r.id === id) || null;
    }

    const defaultPickup = dynamicTrip?.pickup?.lat
      ? dynamicTrip.pickup
      : storePickup?.lat
      ? storePickup
      : userLocation?.lat
      ? userLocation
      : {
          lat: 28.8358,
          lng: 78.7725,
          name: 'Budh Bazaar Market, Moradabad',
          address: 'Budhbazar Road, Moradabad, Uttar Pradesh',
        };

    const defaultDestination = dynamicTrip?.destination?.lat
      ? dynamicTrip.destination
      : storeDestination?.lat
      ? storeDestination
      : {
          lat: 28.8314,
          lng: 78.7654,
          name: 'Moradabad Junction Railway Station',
          address: 'Station Road (SH49), Moradabad Junction',
        };

    const isMoradabad = Math.abs(defaultPickup.lat - 28.835) < 0.08 && Math.abs(defaultPickup.lng - 78.77) < 0.08;
    const dynamicCategory = dynamicTrip?.category || storeCategory || 'MOTO';
    const dynamicFare = dynamicTrip?.fare || storeFare || { total: 42, base: 25, distance: 12, tax: 2, currency: 'INR' };
    const dynamicDistance = dynamicTrip?.distance || storeFare?.distance || (isMoradabad ? 1.4 : 3.4);

    // Safely extract and normalize driver properties (guarantees strings/primitives, NO raw nested objects in JSX)
    const rawDriver = dynamicTrip?.driverInfo || assignedDriver || drivers?.[0] || {
      name: 'Subhash Mondal',
      phone: '+91 94340 12891',
      rating: 4.92,
      category: dynamicCategory,
      vehicle: dynamicCategory === 'ECONOMY' ? 'Maruti Suzuki Dzire (Cab)' : 'Hero Splendor Plus (Bike)',
      plate: 'UP 21 AB 4921',
    };

    const vehicleModel = typeof rawDriver.vehicle === 'object'
      ? (rawDriver.vehicle?.model || rawDriver.vehicleModel || 'Hero Splendor Plus (Bike)')
      : (rawDriver.vehicleModel || rawDriver.vehicle || 'Hero Splendor Plus (Bike)');

    const vehiclePlate = typeof rawDriver.vehicle === 'object'
      ? (rawDriver.vehicle?.plate || rawDriver.vehicleNumber || 'UP 21 AB 4921')
      : (rawDriver.vehicleNumber || rawDriver.plate || 'UP 21 AB 4921');

    const vehicleCategory = typeof rawDriver.vehicle === 'object'
      ? (rawDriver.vehicle?.category || rawDriver.category || dynamicCategory)
      : (rawDriver.category || dynamicCategory);

    const matchedDriver = {
      name: rawDriver.name || 'Subhash Mondal',
      phone: rawDriver.phone || '+91 94340 12891',
      rating: typeof rawDriver.rating === 'number' ? rawDriver.rating : 4.92,
      category: vehicleCategory,
      vehicle: vehicleModel,
      plate: vehiclePlate,
    };

    // Sensible driver spawn at Point C: ~500-700m along road network from pickup Spot A
    const startDriverLat = dynamicTrip?.driverStartLocation?.lat || 
      (isMoradabad ? 28.8395 : defaultPickup.lat + (defaultDestination.lat >= defaultPickup.lat ? -0.0045 : 0.0045));
    const startDriverLng = dynamicTrip?.driverStartLocation?.lng || 
      (isMoradabad ? 78.7760 : defaultPickup.lng + (defaultDestination.lng >= defaultPickup.lng ? -0.0038 : 0.0038));
    const startDriverName = dynamicTrip?.driverStartLocation?.name ||
      (isMoradabad ? 'Civil Lines Taxi Stand, Moradabad' : `${defaultPickup.name.split(',')[0]} Transit Point`);
    const startDriverAddress = dynamicTrip?.driverStartLocation?.address ||
      (isMoradabad ? 'Civil Lines Approach Road, Moradabad 244001' : `Road corridor ~600m from ${defaultPickup.name.split(',')[0]}`);

    const initialRide = {
      id: id || dynamicTrip?.id || `RIDE-${Date.now().toString().slice(-6)}`,
      status: dynamicTrip?.status || 'DRIVER_APPROACHING',
      stage: dynamicTrip?.stage || 'HEADING_TO_PICKUP',
      pickup: defaultPickup, // Place A
      destination: defaultDestination, // Place B
      driverStartLocation: { lat: startDriverLat, lng: startDriverLng, name: startDriverName, address: startDriverAddress }, // Place C
      distance: dynamicDistance,
      fare: dynamicFare,
      otp: dynamicTrip?.otp || String(Math.floor(1000 + Math.random() * 9000)),
      driverInfo: matchedDriver,
      requestedAt: dynamicTrip?.requestedAt || new Date().toISOString(),
      startedAt: dynamicTrip?.startedAt || null,
      completedAt: dynamicTrip?.completedAt || null,
    };

    setRide(initialRide);
    rideService.recordRide(initialRide);

    setDriverLocation({
      lat: startDriverLat,
      lng: startDriverLng,
      category: matchedDriver.category || 'MOTO',
      heading: calculateBearing(startDriverLat, startDriverLng, defaultPickup.lat, defaultPickup.lng),
      speed: 32,
    });

    // Instant realistic road fallback segments while high-precision OSRM resolves
    const fallbackApproach = [
      [startDriverLat, startDriverLng],
      [startDriverLat + (defaultPickup.lat - startDriverLat) * 0.5 + 0.0003, startDriverLng + (defaultPickup.lng - startDriverLng) * 0.5 - 0.0003],
      [defaultPickup.lat, defaultPickup.lng],
    ];

    const fallbackTrip = [
      [defaultPickup.lat, defaultPickup.lng],
      [defaultPickup.lat + (defaultDestination.lat - defaultPickup.lat) * 0.4 - 0.0004, defaultPickup.lng + (defaultDestination.lng - defaultPickup.lng) * 0.4 + 0.0004],
      [defaultPickup.lat + (defaultDestination.lat - defaultPickup.lat) * 0.75 + 0.0002, defaultPickup.lng + (defaultDestination.lng - defaultPickup.lng) * 0.75 - 0.0002],
      [defaultDestination.lat, defaultDestination.lng],
    ];

    approachWaypoints.current = interpolatePath(fallbackApproach, 24);
    tripWaypoints.current = interpolatePath(fallbackTrip, 32);
    setRoutePolyline(fallbackApproach);
    setLoading(false);

    // Fetch detailed real street geometry in background
    Promise.all([
      locationService.getRoute({ lat: startDriverLat, lng: startDriverLng }, defaultPickup),
      locationService.getRoute(defaultPickup, defaultDestination),
    ]).then(([approachRes, tripRes]) => {
      const approachPoints = approachRes?.coordinates && approachRes.coordinates.length > 2
        ? approachRes.coordinates
        : fallbackApproach;
      const tripPoints = tripRes?.coordinates && tripRes.coordinates.length > 2
        ? tripRes.coordinates
        : fallbackTrip;

      approachWaypoints.current = interpolatePath(approachPoints, 24);
      tripWaypoints.current = interpolatePath(tripPoints, 32);

      setRoutePolyline(approachPoints);
    }).catch((err) => {
      console.warn('Background route calculation fallback active:', err);
    });

    startSimulation();
  }, [id, storePickup, storeDestination, storeCategory, storeFare, assignedDriver, userLocation, startSimulation]);

  // Cross-Tab real-time listener from Driver Partner actions
  useEffect(() => {
    const unsub = rideSync.subscribe((evt) => {
      if (!evt?.payload) return;
      const targetId = evt.payload.rideId || evt.payload.id;
      if (ride?.id && targetId && targetId !== ride.id) return;

      if (evt.type === 'DRIVER_ARRIVED') {
        setRide((r) => r ? { ...r, status: 'DRIVER_ARRIVED', stage: 'ARRIVED' } : r);
        animIndexRef.current = 0;
        if (tripWaypoints.current?.length > 0) {
          setRoutePolyline(tripWaypoints.current);
        }
      } else if (evt.type === 'RIDE_STARTED') {
        setRide((r) => r ? { ...r, status: 'RIDE_STARTED', stage: 'IN_TRANSIT' } : r);
        animIndexRef.current = 0;
        if (tripWaypoints.current?.length > 0) {
          setRoutePolyline(tripWaypoints.current);
        }
      } else if (evt.type === 'RIDE_COMPLETED') {
        setRide((r) => r ? { ...r, status: 'RIDE_COMPLETED', stage: 'COMPLETED' } : r);
        setShowRating(true);
      }
    });
    return unsub;
  }, [ride?.id]);

  // Smooth real-time driver movement & passenger journey along route
  useEffect(() => {
    if (!ride || ride.status === 'RIDE_COMPLETED') return;

    const interval = setInterval(() => {
      if (ride.status === 'DRIVER_APPROACHING') {
        const waypoints = approachWaypoints.current;
        if (!waypoints || waypoints.length === 0) return;

        animIndexRef.current = Math.min(animIndexRef.current + 1, waypoints.length - 1);
        const idx = animIndexRef.current;
        const currentPt = waypoints[idx];
        const nextPt = waypoints[Math.min(idx + 1, waypoints.length - 1)];

        if (!currentPt) return;

        const heading = nextPt ? calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]) : 45;
        const progress = waypoints.length > 1 ? idx / (waypoints.length - 1) : 1;
        const remainingEta = Math.max(1, Math.round((1 - progress) * 2));
        const remainingDist = Math.max(0.1, Math.round((1 - progress) * 0.6 * 10) / 10);
        const speed = Math.round(28 + Math.random() * 10);

        setDriverLocation({
          lat: currentPt[0],
          lng: currentPt[1],
          category: ride.driverInfo?.category || 'MOTO',
          heading,
          speed,
        });
        setActiveDriverEta(remainingEta);
        setActiveDriverDistance(remainingDist);
        setActiveDriverSpeed(speed);

        // Reached pickup spot
        if (idx >= waypoints.length - 1) {
          setRide((r) => ({ ...r, status: 'DRIVER_ARRIVED' }));
          rideSync.broadcast('DRIVER_ARRIVED', { rideId: ride.id });
          animIndexRef.current = 0;
          // Switch polyline to the trip destination leg
          if (tripWaypoints.current && tripWaypoints.current.length > 0) {
            setRoutePolyline(tripWaypoints.current);
          }
        }
      } else if (ride.status === 'DRIVER_ARRIVED') {
        // Paused at pickup waiting for boarding, then automatically start ride
        setActiveDriverEta(0);
        setActiveDriverDistance(0);
        setActiveDriverSpeed(0);
      } else if (ride.status === 'RIDE_STARTED') {
        // Driver and User move TOGETHER along trip route to destination
        const waypoints = tripWaypoints.current;
        if (!waypoints || waypoints.length === 0) return;

        animIndexRef.current = Math.min(animIndexRef.current + 1, waypoints.length - 1);
        const idx = animIndexRef.current;
        const currentPt = waypoints[idx];
        const nextPt = waypoints[Math.min(idx + 1, waypoints.length - 1)];

        if (!currentPt) return;

        const heading = nextPt ? calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]) : 45;
        const progress = waypoints.length > 1 ? idx / (waypoints.length - 1) : 1;
        const totalTripKm = ride.distance || 1.4;
        const totalTripMins = Math.max(2, Math.round(totalTripKm * 2.2));
        const remainingEta = Math.max(1, Math.round((1 - progress) * totalTripMins));
        const remainingDist = Math.max(0.1, Math.round((1 - progress) * totalTripKm * 10) / 10);
        const speed = Math.round(32 + Math.random() * 12);

        setDriverLocation({
          lat: currentPt[0],
          lng: currentPt[1],
          category: ride.driverInfo?.category || 'MOTO',
          heading,
          speed,
        });
        setActiveDriverEta(remainingEta);
        setActiveDriverDistance(remainingDist);
        setActiveDriverSpeed(speed);

        // Reached destination
        if (idx >= waypoints.length - 1) {
          const completedTimestamp = new Date().toISOString();
          const tripDurationMins = Math.max(2, Math.round((ride.distance || 1.4) * 2.2));

          const completedRide = {
            ...ride,
            status: 'RIDE_COMPLETED',
            completedAt: completedTimestamp,
            duration: tripDurationMins,
            durationMinutes: tripDurationMins,
            userRating: userRating || 5,
            payment: {
              ...(typeof ride.payment === 'object' ? ride.payment : {}),
              method: ride.payment?.method || 'UPI',
              status: 'COMPLETED',
              amount: typeof ride.fare === 'object' ? Math.round(ride.fare.total) : ride.fare || 42,
            },
          };
          setRide(completedRide);
          setActiveDriverSpeed(0);
          setShowRating(true);

          // Update user's physical location to the destination they just arrived at!
          if (ride.destination?.lat && ride.destination?.lng) {
            setUserLocation({
              lat: ride.destination.lat,
              lng: ride.destination.lng,
              name: ride.destination.name || 'Current Location',
              address: ride.destination.address || ride.destination.name,
              city: ride.destination.city || 'Moradabad',
              isGpsDetected: true,
            });
            setPickup({
              lat: ride.destination.lat,
              lng: ride.destination.lng,
              name: ride.destination.name,
              address: ride.destination.address || ride.destination.name,
            });
            setDestination(null);
          }

          // Persist completed trip in rideService & localStorage
          rideService.updateRide(ride.id, completedRide);
          rideSync.broadcast('RIDE_COMPLETED', { rideId: ride.id, completedRide });
        }
      }
    }, 850);

    return () => clearInterval(interval);
  }, [ride, setUserLocation, setPickup, setDestination]);

  // Handle manual start ride from arrived state or timer
  useEffect(() => {
    if (ride?.status === 'DRIVER_ARRIVED') {
      const t = setTimeout(() => {
        setRide((r) => ({ ...r, status: 'RIDE_STARTED' }));
        rideSync.broadcast('RIDE_STARTED', { rideId: ride.id });
        animIndexRef.current = 0;
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [ride?.status]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((m) => [...m, { sender: 'user', text: newMsg }]);
    setNewMsg('');
    setTimeout(() => {
      setChatMessages((m) => [
        ...m,
        { sender: 'driver', text: 'Understood, arriving in 2 minutes!' },
      ]);
    }, 1500);
  };

  if (loading || !ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-3 bg-slate-50">
        <Spinner size="xl" className="text-blue-600" />
        <span className="text-xs font-bold text-slate-500">Connecting to Active Trip...</span>
      </div>
    );
  }

  const statusIdx = STATUS_STEPS.findIndex((s) => s.key === ride.status);
  const statusLabel = STATUS_STEPS[statusIdx]?.label || ride.status;

  const driverName = ride.driverInfo?.name || 'Subhash Mondal';
  const driverVehicle = typeof ride.driverInfo?.vehicle === 'object'
    ? (ride.driverInfo?.vehicle?.model || 'Maruti Suzuki Dzire')
    : (ride.driverInfo?.vehicle || 'Hero Splendor Plus (Bike)');
  const driverPlate = typeof ride.driverInfo?.plate === 'object'
    ? 'DL 01 AB 1042'
    : (ride.driverInfo?.plate || 'DL 01 AB 1042');
  const driverRating = ride.driverInfo?.rating || 4.9;
  const driverCategory = ride.driverInfo?.category || 'MOTO';

  return (
    <div className="relative w-full max-w-full overflow-x-hidden min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-slate-100 font-sans">
      
      {/* ── TOP SAFETY & OTP BAR (Mobile Header) ─────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-black text-slate-900">{statusLabel}</span>
        </div>

        {/* Quick OTP Pill */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
          <span className="text-[10px] font-bold text-amber-800 uppercase">OTP:</span>
          <span className="font-mono font-black text-xs text-amber-900">{ride.otp || '4921'}</span>
          <button
            onClick={() => {
              if (navigator.clipboard) navigator.clipboard.writeText(ride.otp || '4921');
              setCopiedOtp(true);
              setTimeout(() => setCopiedOtp(false), 2000);
            }}
            className="text-amber-700 hover:text-amber-900 p-0.5"
            title="Copy OTP"
          >
            {copiedOtp ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* ── LEFT DESKTOP PANEL / MOBILE BOTTOM DETAILS ──────────────────────── */}
      <div className="w-full md:w-[460px] lg:w-[480px] shrink-0 bg-white border-r border-slate-200 z-20 flex flex-col md:h-[calc(100vh-3.5rem)] md:overflow-y-auto order-2 md:order-1">
        
        {/* Step Progress & Status Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {statusLabel}
                </h1>
                <p className="text-xs text-slate-500">
                  {ride.status === 'RIDE_COMPLETED'
                    ? 'Arrived safely at destination'
                    : ride.status === 'RIDE_STARTED'
                    ? `En route to destination · ${activeDriverEta} mins remaining (${activeDriverDistance} km)`
                    : ride.status === 'DRIVER_ARRIVED'
                    ? 'Driver arrived at pickup! Board vehicle and share OTP.'
                    : `Driver is ${activeDriverEta} mins away · ${activeDriverDistance} km`}
                </p>
              </div>
            </div>

            {/* OTP Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 text-right">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                Start OTP
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-black text-lg text-amber-900 leading-none">
                  {ride.otp || '4921'}
                </span>
                <button
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(ride.otp || '4921');
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2000);
                  }}
                  className="text-amber-700 hover:text-amber-900"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex gap-1.5 pt-1">
            {STATUS_STEPS.map((s, i) => (
              <div
                key={s.key}
                className={clsx(
                  'flex-1 h-1.5 rounded-full transition-all duration-500',
                  i <= statusIdx ? 'bg-blue-600' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
        </div>

        {/* Driver Partner Details Card */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Real Vehicle Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                  <VehicleIcon category={driverCategory} size="lg" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base">
                    {driverName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {driverVehicle} ·{' '}
                    <span className="text-amber-500 font-bold">★ {driverRating}</span>
                  </p>
                  <span className="font-mono text-xs font-bold bg-white text-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 inline-block mt-1">
                    {driverPlate}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                Verified
              </span>
            </div>

            {/* Quick Actions: Call, Chat, SOS */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
              <button
                onClick={() => setShowCallModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold transition-colors"
              >
                <Phone size={15} />
                <span>Call Driver</span>
              </button>

              <button
                onClick={() => setShowChatModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-2xl text-xs font-bold transition-colors"
              >
                <MessageSquare size={15} />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setShowSOS(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold transition-colors"
              >
                <AlertTriangle size={15} />
                <span>Emergency</span>
              </button>
            </div>
          </div>

          {/* Route Overview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Route Information
            </h3>
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-blue-600 to-rose-600" />
              
              <div className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Pickup</span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {ride.pickup?.name || 'Current Location'}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-sm" />
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Destination</span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {ride.destination?.name || 'Destination Point'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Upfront Guaranteed Fare</span>
              <p className="text-2xl font-black text-slate-900">
                ₹{getFareDisplay(ride.fare)}.00
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Paid via UPI AutoPay
            </span>
          </div>

          {/* Safety Notice */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>Encrypted trip · Driver number is masked · 24/7 Safety Desk monitored</span>
          </div>
        </div>

      </div>

      {/* ── RIGHT FULL INTERACTIVE MAP (Order 1 on mobile for visual presence) ── */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden min-h-[300px] sm:min-h-[400px] md:h-[calc(100vh-3.5rem)] order-1 md:order-2">
        <Suspense
          fallback={
            <div className="bg-slate-900 w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
              <Spinner size="lg" />
            </div>
          }
        >
          <LiveMap
            pickup={ride.pickup}
            destination={ride.destination}
            activeDriverLocation={driverLocation}
            routeCoordinates={routePolyline}
            rideStage={ride.status}
            activeRide={ride}
            activeDriverEta={activeDriverEta}
            activeDriverDistance={activeDriverDistance}
            activeDriverSpeed={activeDriverSpeed}
            height="100%"
          />
        </Suspense>
      </div>

      {/* ── Masked Call Simulation Modal ─────────────────────────────────────── */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Phone size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Encrypted Masked Call</h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to {driverName}. Your personal mobile number remains completely confidential.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs font-bold text-slate-700 border border-slate-200">
              Virtual Relay Gateway: +91 (080) 6900-RIDE
            </div>
            <Button
              variant="danger"
              className="w-full py-3 rounded-xl text-xs font-bold"
              onClick={() => setShowCallModal(false)}
            >
              Disconnect Call
            </Button>
          </div>
        </div>
      )}

      {/* ── In-App Chat Modal ────────────────────────────────────────────────── */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3 flex flex-col h-[420px] animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  {driverName.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{driverName}</h3>
                  <p className="text-[10px] text-slate-400">Encrypted in-app messaging</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={clsx(
                    'p-3 rounded-2xl max-w-[80%]',
                    msg.sender === 'user'
                      ? 'ml-auto bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message to driver..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Emergency SOS Modal ──────────────────────────────────────────────── */}
      {showSOS && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Emergency Rapid SOS Beacon</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your live GPS coordinates will be transmitted instantly to local police authorities and the 24/7 Veloq Safety Desk.
              </p>
            </div>

            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 font-mono">
              Broadcasting GPS: {driverLocation?.lat?.toFixed ? driverLocation.lat.toFixed(4) : '22.3150'}° N, {driverLocation?.lng?.toFixed ? driverLocation.lng.toFixed(4) : '87.3050'}° E
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 py-3 text-xs font-bold rounded-xl"
                onClick={() => setShowSOS(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 py-3 text-xs font-bold rounded-xl shadow-lg shadow-red-600/30"
                onClick={() => {
                  alert('SOS Alert Transmitted to Campus Security & Police Emergency Desk.');
                  setShowSOS(false);
                }}
              >
                Trigger SOS Beacon
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rating & Receipt Modal on Ride Completion ───────────────────────── */}
      {showRating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">You have arrived!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trip completed safely · ₹{getFareDisplay(ride.fare)}.00 paid via UPI
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                Rate your journey with {driverName}:
              </p>
              <div className="flex justify-center gap-2 text-amber-400 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {star <= userRating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full py-3.5 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-700 shadow-md"
              onClick={() => {
                const finalRide = {
                  ...ride,
                  userRating,
                  status: 'RIDE_COMPLETED',
                };
                rideService.updateRide(ride.id, finalRide);
                setShowRating(false);
                navigate(`/app/trips/${ride.id}`);
              }}
            >
              Submit Rating & View Trip Receipt
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
