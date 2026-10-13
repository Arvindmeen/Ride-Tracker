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
import { formatDuration } from '@/utils/formatters';

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
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCompliments, setSelectedCompliments] = useState(['🛺 Clean EV Toto', '🕒 On Time']);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const pinInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
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
    if (typeof window !== 'undefined') {
      try {
        const rawActive = localStorage.getItem('veloq_active_booked_ride');
        if (rawActive) {
          const parsed = JSON.parse(rawActive);
          if (parsed && (!id || id === 'active' || parsed.id === id)) {
            dynamicTrip = parsed;
          }
        }
      } catch (e) {}

      if (!dynamicTrip && id) {
        const storedTrips = JSON.parse(localStorage.getItem('veloq_user_trips') || '[]');
        dynamicTrip = storedTrips.find((r) => r.id === id) || null;
      }
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

    let finalDestination = dynamicTrip?.destination?.lat
      ? dynamicTrip.destination
      : storeDestination?.lat
      ? storeDestination
      : {
          lat: 28.8314,
          lng: 78.7654,
          name: 'Moradabad Junction Railway Station',
          address: 'Station Road (SH49), Moradabad Junction',
        };

    // Guarantee that Destination is distinct from Pickup
    if (
      !finalDestination?.name ||
      finalDestination.name.trim().toLowerCase() === defaultPickup.name.trim().toLowerCase() ||
      (Math.abs((finalDestination.lat || 0) - (defaultPickup.lat || 0)) < 0.001 &&
       Math.abs((finalDestination.lng || 0) - (defaultPickup.lng || 0)) < 0.001)
    ) {
      if (Math.abs(defaultPickup.lat - 22.319) < 0.06) {
        // Kharagpur region
        finalDestination = {
          lat: 22.3396,
          lng: 87.3225,
          name: 'Kharagpur Jn Railway Station',
          address: 'Station Rd, Railway Colony, Kharagpur 721301',
        };
      } else if (Math.abs(defaultPickup.lat - 28.835) < 0.08) {
        // Moradabad region
        finalDestination = {
          lat: 28.8314,
          lng: 78.7654,
          name: 'Moradabad Junction Railway Station',
          address: 'Station Rd (SH49), Moradabad 244001',
        };
      } else {
        finalDestination = {
          lat: defaultPickup.lat + 0.022,
          lng: defaultPickup.lng + 0.022,
          name: `${defaultPickup.name.split(' ')[0]} Central Transit Hub`,
          address: 'Main Transit Corridor',
        };
      }
    }

    const defaultDestination = finalDestination;

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

    const isToto = dynamicCategory === 'AUTO' || dynamicCategory === 'TOTO' || dynamicCategory === 'toto';
    const isBike = dynamicCategory === 'MOTO' || dynamicCategory === 'BIKE' || dynamicCategory === 'bike';
    const isCab = dynamicCategory === 'ECONOMY' || dynamicCategory === 'CAB' || dynamicCategory === 'cab';
    const isTransporter = dynamicCategory === 'XL' || dynamicCategory === 'TRANSPORTER' || dynamicCategory === 'transporter';
    const defaultModel = isToto ? 'Solar E-Toto #08' : isBike ? 'Electric Bike (Ather EV)' : isCab ? 'Prime EV Cab (Tata Tigor)' : isTransporter ? 'EV Transporter (Tata Ace EV)' : 'EV Transporter (Tata Ace EV)';

    const vehicleModel = typeof rawDriver.vehicle === 'object'
      ? (rawDriver.vehicle?.model || rawDriver.vehicleModel || defaultModel)
      : (rawDriver.vehicleModel || rawDriver.vehicle || defaultModel);

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

    // Realistic driver spawn at Point C: Pick the absolute closest matching vehicle on the map!
    const isTotoOrLocal = String(vehicleCategory).toUpperCase().includes('AUTO') ||
                          String(vehicleCategory).toUpperCase().includes('TOTO') ||
                          String(defaultPickup?.name || '').toLowerCase().includes('kharagpur') ||
                          String(defaultPickup?.name || '').toLowerCase().includes('tech mkt');

    // Look for the closest driver on the map matching this vehicle category
    let nearestMapDriver = null;
    if (drivers && drivers.length > 0) {
      const isMatchingCat = (d) => {
        const c = String(d.vehicle?.category || d.category || '').toUpperCase();
        const m = String(d.vehicle?.model || d.vehicleModel || '').toUpperCase();
        if (isToto) return c.includes('AUTO') || c.includes('TOTO') || m.includes('TOTO') || m.includes('AUTO');
        if (isBike) return c.includes('MOTO') || c.includes('BIKE') || m.includes('BIKE') || m.includes('ACTIVA');
        if (isTransporter) return c.includes('XL') || c.includes('TRANSPORTER');
        return c.includes('ECONOMY') || c.includes('CAB') || c.includes('PREMIUM');
      };

      const matchPool = drivers.filter((d) => d.status !== 'OFFLINE' && isMatchingCat(d));
      const poolToUse = matchPool.length > 0 ? matchPool : drivers.filter((d) => d.status !== 'OFFLINE');

      if (poolToUse.length > 0) {
        poolToUse.sort((a, b) => {
          const distA = Math.hypot((a.location?.lat ?? a.lat) - defaultPickup.lat, (a.location?.lng ?? a.lng) - defaultPickup.lng);
          const distB = Math.hypot((b.location?.lat ?? b.lat) - defaultPickup.lat, (b.location?.lng ?? b.lng) - defaultPickup.lng);
          return distA - distB;
        });
        nearestMapDriver = poolToUse[0];
      }
    }

    const startDriverLat = Number(dynamicTrip?.driverStartLocation?.lat || 
      (nearestMapDriver ? (nearestMapDriver.location?.lat ?? nearestMapDriver.lat) : (isMoradabad ? 28.8375 : defaultPickup.lat + (isTotoOrLocal ? 0.0014 : 0.0018))));
    const startDriverLng = Number(dynamicTrip?.driverStartLocation?.lng || 
      (nearestMapDriver ? (nearestMapDriver.location?.lng ?? nearestMapDriver.lng) : (isMoradabad ? 78.7745 : defaultPickup.lng + (isTotoOrLocal ? -0.0013 : -0.0016))));
    const startDriverName = dynamicTrip?.driverStartLocation?.name ||
      (nearestMapDriver?.location?.name || `${defaultPickup.name.split(',')[0]} Transit Point`);
    const startDriverAddress = dynamicTrip?.driverStartLocation?.address ||
      (nearestMapDriver?.location?.address || `Approach corridor ~200m from ${defaultPickup.name.split(',')[0]}`);

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

    // High-density waypoints for continuous 60fps smooth movement (Zero 'tik tik' jumps)
    approachWaypoints.current = interpolatePath(fallbackApproach, 120);
    tripWaypoints.current = interpolatePath(fallbackTrip, 150);
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

      approachWaypoints.current = interpolatePath(approachPoints, 120);
      tripWaypoints.current = interpolatePath(tripPoints, 150);

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
        
        // Realistic approach metrics (~280m spawn)
        const approachTotalKm = 0.28;
        const remainingEta = Math.max(1, Math.round((1 - progress) * 2));
        const remainingDist = Math.max(0.02, Math.round((1 - progress) * approachTotalKm * 100) / 100);

        // Realistic vehicle-category specific speeds (E-Toto 18-21 km/h, Bike 26-30 km/h, Cab 34-38 km/h)
        const cat = String(ride.driverInfo?.category || '').toUpperCase();
        const isToto = cat.includes('AUTO') || cat.includes('TOTO');
        const isBike = cat.includes('BIKE') || cat.includes('MOTO');
        const isCab = cat.includes('CAB') || cat.includes('PRIME');
        const baseSpeed = isToto ? 19 : isBike ? 28 : isCab ? 36 : 22;
        const speed = Math.max(12, Math.round(baseSpeed + Math.sin(idx * 0.4) * 2.2));

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

        // Reached pickup spot: Driver parks and waits for boarding!
        if (idx >= waypoints.length - 1) {
          setRide((r) => ({ ...r, status: 'DRIVER_ARRIVED', stage: 'ARRIVED' }));
          rideSync.broadcast('DRIVER_ARRIVED', { rideId: ride.id });
          animIndexRef.current = 0;
          setActiveDriverEta(0);
          setActiveDriverDistance(0);
          setActiveDriverSpeed(0);
          // Switch polyline to the trip destination leg
          if (tripWaypoints.current && tripWaypoints.current.length > 0) {
            setRoutePolyline(tripWaypoints.current);
          }
        }
      } else if (ride.status === 'DRIVER_ARRIVED') {
        // Driver is safely parked at pickup spot waiting for passenger OTP verification
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
        const remainingDist = Math.max(0.05, Math.round((1 - progress) * totalTripKm * 10) / 10);
        
        const cat = String(ride.driverInfo?.category || '').toUpperCase();
        const isToto = cat.includes('AUTO') || cat.includes('TOTO');
        const isBike = cat.includes('BIKE') || cat.includes('MOTO');
        const isCab = cat.includes('CAB') || cat.includes('PRIME');
        const baseSpeed = isToto ? 20 : isBike ? 29 : isCab ? 37 : 24;
        const speed = Math.max(14, Math.round(baseSpeed + Math.sin(idx * 0.3) * 2.5));

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
            stage: 'COMPLETED',
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
              city: ride.destination.city || 'Kharagpur',
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
    }, 220);

    return () => clearInterval(interval);
  }, [ride, setUserLocation, setPickup, setDestination, userRating]);

  // Passenger & Driver Boarding OTP Verification Handler
  const handleVerifyOtpAndStart = (overrideOtp = null) => {
    const entered = (overrideOtp !== null ? overrideOtp : inputOtp).trim();
    const actualOtp = String(ride?.otp || '4921').trim();
    if (entered === actualOtp || entered.length === 4 || overrideOtp !== null) {
      setOtpError('');
      setOtpSuccess(true);
      setTimeout(() => {
        setRide((r) => ({ ...r, status: 'RIDE_STARTED', stage: 'IN_TRANSIT' }));
        rideSync.broadcast('RIDE_STARTED', { rideId: ride.id });
        animIndexRef.current = 0;
        setOtpSuccess(false);
      }, 600);
    } else {
      setOtpError(`Incorrect OTP. Please enter the 4-digit OTP: ${actualOtp}`);
    }
  };

  const handleDigitChange = (idx, value) => {
    const clean = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // Pasted full or partial OTP
      const chars = clean.slice(0, 4).split('');
      for (let i = 0; i < 4; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      const combined = newDigits.join('');
      setInputOtp(combined);
      setOtpError('');
      if (clean.length >= 4) {
        handleVerifyOtpAndStart(combined);
      } else {
        const nextIdx = Math.min(chars.length, 3);
        pinInputRefs[nextIdx]?.current?.focus();
      }
      return;
    }

    newDigits[idx] = clean;
    setOtpDigits(newDigits);
    const combined = newDigits.join('');
    setInputOtp(combined);
    setOtpError('');

    if (clean && idx < 3) {
      pinInputRefs[idx + 1]?.current?.focus();
    }

    if (combined.length === 4) {
      handleVerifyOtpAndStart(combined);
    }
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      pinInputRefs[idx - 1]?.current?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    const actualOtp = String(ride?.otp || '4921');
    const chars = actualOtp.split('');
    setOtpDigits(chars);
    setInputOtp(actualOtp);
    handleVerifyOtpAndStart(actualOtp);
  };

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
                    ? `En route to destination · ${formatDuration(activeDriverEta)} remaining (${activeDriverDistance} km)`
                    : ride.status === 'DRIVER_ARRIVED'
                    ? 'Driver arrived at pickup! Board vehicle and share OTP.'
                    : `Driver is ${formatDuration(activeDriverEta)} away · ${activeDriverDistance} km`}
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

        {/* ── DRIVER ARRIVED & BOARDING OTP CARD (Responsive, Animated & Compact) ── */}
        {ride.status === 'DRIVER_ARRIVED' && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-lg shadow-emerald-600/10 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header with live arrived status */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Driver Arrived at Pickup
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span>Ready to Board</span>
              </span>
            </div>

            {/* Clear Prompt & Interactive 4-Box PIN Input */}
            <div className="text-center space-y-2.5">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Share this 4-digit Ride OTP with <span className="text-emerald-700 font-black">{driverName}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vehicle: <strong className="text-slate-800">{driverVehicle}</strong> ({driverPlate})
                </p>
              </div>

              {/* 4 Interactive Segmented Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = otpDigits[idx] || '';
                  return (
                    <input
                      key={idx}
                      ref={pinInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onFocus={(e) => e.target.select()}
                      className={clsx(
                        'w-11 h-12 sm:w-12 sm:h-12 rounded-xl text-center font-mono font-black text-xl sm:text-2xl transition-all duration-200 cursor-text shadow-2xs outline-none',
                        otpSuccess
                          ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700 scale-105'
                          : digit
                          ? 'bg-emerald-50/70 border-2 border-emerald-500 text-slate-950 ring-2 ring-emerald-100 font-black'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100'
                      )}
                      placeholder={(ride.otp || '4921')[idx]}
                    />
                  );
                })}
              </div>

              {/* Validation & Helper Row */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Your Ride PIN: <strong className="font-mono font-bold text-slate-900">{ride.otp || '4921'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(ride.otp || '4921');
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {otpError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-bold text-rose-700 animate-shake">
                  {otpError}
                </div>
              )}

              {otpSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-black text-emerald-700 animate-bounce">
                  ✓ OTP Verified! Boarding confirmed, journey starting...
                </div>
              )}

              {/* 1-Tap Passenger Quick Boarding Action */}
              <button
                type="button"
                onClick={handleQuickFillOtp}
                disabled={otpSuccess}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-600/30 cursor-pointer disabled:opacity-60"
              >
                <span>⚡ 1-Tap Fill & Start Journey</span>
              </button>
            </div>
          </div>
        )}

        {/* Driver Partner Details Card */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Real Vehicle Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                  {String(driverCategory).toUpperCase().includes('AUTO') || String(driverCategory).toUpperCase().includes('TOTO') || String(driverVehicle).toLowerCase().includes('toto') ? (
                    <img src="/toto-logo.svg" alt="Toto" className="w-11 h-11 object-contain drop-shadow-sm" />
                  ) : (
                    <VehicleIcon category={driverCategory} size="lg" />
                  )}
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
                Your live GPS coordinates will be transmitted instantly to local police authorities and the 24/7 Ride Tracker Safety Desk.
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl text-center space-y-4 my-auto animate-scale-in border border-slate-100">
            
            {/* Celebration Header */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>
              <span className="absolute top-0 right-1/3 text-2xl animate-bounce">🎉</span>
              <span className="absolute top-2 left-1/3 text-xl animate-pulse">✨</span>
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Trip Safely Completed
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                You have arrived at your destination!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thank you for commuting with Ride Tracker Kharagpur
              </p>
            </div>

            {/* Fare & Journey Receipt Pill */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid Fare</span>
                  <p className="text-xl font-black text-slate-900">₹{getFareDisplay(ride.fare)}.00</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
                    <Check size={12} />
                    <span>UPI AutoPay Success</span>
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Txn #{ride.id?.slice(-6) || '894102'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Distance Covered</span>
                  <p className="font-bold text-slate-800">{ride.distance || 1.4} km</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Travel Duration</span>
                  <p className="font-bold text-slate-800">{ride.durationMinutes || 6} mins</p>
                </div>
              </div>
            </div>

            {/* Interactive 5-Star Driver Rating */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  {driverName.charAt(0)}
                </div>
                <p className="text-xs font-black text-slate-800">
                  How was your ride with {driverName}?
                </p>
              </div>

              {/* Star Selection Row */}
              <div className="flex justify-center gap-2 text-amber-400 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(star)}
                    className="text-3xl transition-all hover:scale-125 focus:outline-none cursor-pointer"
                    title={`Rate ${star} star`}
                  >
                    {(hoverRating || userRating) >= star ? '★' : '☆'}
                  </button>
                ))}
              </div>

              {/* Dynamic Sentiment Text */}
              <p className="text-xs font-extrabold text-amber-600 transition-all">
                {(hoverRating || userRating) === 5 && '🌟 Exceptional! Outstanding Ride'}
                {(hoverRating || userRating) === 4 && '👍 Very Good! Smooth & Pleasant Trip'}
                {(hoverRating || userRating) === 3 && '🙂 Satisfactory Experience'}
                {(hoverRating || userRating) === 2 && '😐 Needs Improvement'}
                {(hoverRating || userRating) === 1 && '😞 Poor Service'}
              </p>
            </div>

            {/* Quick Compliment Chips (Multi-select) */}
            <div className="space-y-1.5 pt-1 text-left">
              <span className="text-[11px] font-black text-slate-700 block">Give compliments:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🛺 Clean EV Toto',
                  '🕒 Punctual & On Time',
                  '💬 Polite Driver',
                  '🛣️ Smooth & Safe Driving',
                  '⚡ Fast Route',
                  '🌱 Zero Emissions',
                ].map((tag) => {
                  const isSelected = selectedCompliments.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedCompliments((prev) =>
                          isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={clsx(
                        'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Written Feedback */}
            <div className="text-left pt-1">
              <label className="text-[11px] font-black text-slate-700 block mb-1">
                Written Feedback & Suggestions (Optional):
              </label>
              <textarea
                rows={2}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder={`Share your experience with ${driverName} or report any details...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
              />
            </div>

            {/* Submit & Navigation CTAs */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 cursor-pointer"
                onClick={() => {
                  const finalRide = {
                    ...ride,
                    userRating,
                    feedbackNote,
                    compliments: selectedCompliments,
                    status: 'RIDE_COMPLETED',
                  };
                  rideService.updateRide(ride.id, finalRide);
                  setRatingSubmitted(true);
                  setTimeout(() => {
                    setShowRating(false);
                    navigate(`/app/trips/${ride.id}`);
                  }, 500);
                }}
              >
                {ratingSubmitted ? '✓ Rating Submitted!' : 'Submit Rating & View Full Invoice'}
              </Button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRating(false);
                    navigate('/app');
                  }}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Book Another Ride
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRating(false);
                    navigate(`/app/trips/${ride.id}`);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  View Receipt →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
