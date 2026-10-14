import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Phone, MessageSquare, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, DollarSign, Check, Clock, QrCode, XCircle,
  Sparkles, Volume2, User, KeyRound, Compass, Car, Send, Zap
} from 'lucide-react';
import { useDriverStore, useMapStore } from '@/stores';
import { rideService, locationService, rideSync } from '@/services';
import { Spinner } from '@/components/ui';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

// Web Audio API chime for stage transitions (Arrival, OTP verification, Trip Complete)
function playTone(freq = 600, duration = 0.25) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked
  }
}

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

function interpolatePath(points, targetSteps = 30) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) return points;

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

const DEMO_FALLBACKS = {
  'REQ-LOC-02': {
    id: 'REQ-LOC-02',
    userId: 'U005',
    userName: 'Sneha Mondal',
    userRating: 4.92,
    pickup: {
      lat: 22.3195,
      lng: 87.3082,
      name: 'Nalanda Complex Gate',
      address: 'Academic Complex, IIT KGP',
    },
    destination: {
      lat: 22.3168,
      lng: 87.3015,
      name: 'Technology Market (Tech Mkt)',
      address: 'Market Street, IIT Kharagpur',
    },
    estimatedFare: 28,
    estimatedDistance: 2.2,
    estimatedDuration: 6,
    category: 'MOTO',
    status: 'HEADING_TO_PICKUP',
  },
  'REQ-OUT-124': {
    id: 'REQ-OUT-124',
    userId: 'U002',
    userName: 'Debanjan Chatterjee (IIT KGP PhD)',
    userRating: 4.96,
    pickup: {
      lat: 22.3149,
      lng: 87.3105,
      name: 'Scholars Avenue, RK Hall Gate',
      address: 'IIT Kharagpur Campus, WB',
    },
    destination: {
      lat: 22.6547,
      lng: 88.4467,
      name: 'Kolkata Airport (CCU Terminal 2)',
      address: 'NH16 Highway Outstation, Kolkata',
    },
    estimatedFare: 2680,
    estimatedDistance: 124.0,
    estimatedDuration: 135,
    category: 'CAR',
    status: 'HEADING_TO_PICKUP',
  },
};

function normalizeRideData(ride) {
  if (!ride) return null;
  const rawPickup = ride.pickup || {};
  const rawDest = ride.destination || {};
  const isMbd = String(rawPickup.name || rawPickup.address || '').toLowerCase().includes('moradabad') ||
                String(rawDest.name || rawDest.address || '').toLowerCase().includes('moradabad');

  const pLat = Number.isFinite(Number(rawPickup.lat)) ? Number(rawPickup.lat) : (isMbd ? 28.8358 : 22.3195);
  const pLng = Number.isFinite(Number(rawPickup.lng)) ? Number(rawPickup.lng) : (isMbd ? 78.7725 : 87.3082);
  const dLat = Number.isFinite(Number(rawDest.lat)) ? Number(rawDest.lat) : (isMbd ? 28.8314 : 22.3168);
  const dLng = Number.isFinite(Number(rawDest.lng)) ? Number(rawDest.lng) : (isMbd ? 78.7654 : 87.3015);

  return {
    ...ride,
    pickup: {
      ...rawPickup,
      lat: pLat,
      lng: pLng,
      name: rawPickup.name || (isMbd ? 'Budh Bazaar Market, Moradabad' : 'Nalanda Complex Gate, IIT KGP'),
      address: rawPickup.address || (isMbd ? 'Budhbazar Road, Moradabad' : 'Academic Complex, IIT Kharagpur'),
    },
    destination: {
      ...rawDest,
      lat: dLat,
      lng: dLng,
      name: rawDest.name || (isMbd ? 'Moradabad Junction Railway Station' : 'Technology Market (Tech Mkt)'),
      address: rawDest.address || (isMbd ? 'Station Road, Moradabad' : 'Market Street, IIT Kharagpur'),
    },
  };
}

export default function DriverRideActivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeRide,
    vehicleType,
    completeRide,
    setRideStage,
    activeRideStage,
  } = useDriverStore();

  const [currentRide, setCurrentRide] = useState(() => normalizeRideData(activeRide) || null);
  const [loading, setLoading] = useState(!activeRide);
  const [stage, setStage] = useState(activeRideStage || 'HEADING_TO_PICKUP');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [arrivedAlert, setArrivedAlert] = useState(false);
  const [quickPingToast, setQuickPingToast] = useState('');
  const [speed, setSpeed] = useState(0);
  const [driverPos, setDriverPos] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [remainingEta, setRemainingEta] = useState(2);
  const [remainingDistance, setRemainingDistance] = useState(0.6);

  // Waypoints for smooth simulation
  const approachWaypoints = useRef([]);
  const tripWaypoints = useRef([]);
  const animIndexRef = useRef(0);
  const lastHeadingRef = useRef(45);

  // 1. Resolve Dynamic Ride Data
  useEffect(() => {
    if (activeRide) {
      setCurrentRide(normalizeRideData(activeRide));
      setLoading(false);
      return;
    }

    const targetId = id || 'ACTIVE_RIDE';
    rideService.getRideById(targetId).then((found) => {
      if (found) {
        setCurrentRide(normalizeRideData(found));
      } else {
        rideService.getActiveRide().then((active) => {
          if (active) {
            setCurrentRide(normalizeRideData(active));
          } else {
            const fallback = DEMO_FALLBACKS[targetId] || DEMO_FALLBACKS['REQ-LOC-02'];
            setCurrentRide(normalizeRideData(fallback));
          }
        });
      }
      setLoading(false);
    });
  }, [id, activeRide]);

  // 2. Initialize Telemetry & Street Routes (Place C ➔ Place A ➔ Place B)
  useEffect(() => {
    if (!currentRide) return;

    const safeRide = normalizeRideData(currentRide);
    const pickup = safeRide.pickup;
    const destination = safeRide.destination;

    // Point C: Driver's starting position (~250m along road from Place A)
    const isMbd = Math.abs(pickup.lat - 28.835) < 0.09 && Math.abs(pickup.lng - 78.77) < 0.09;
    const isTotoOrLocal = String(safeRide?.category || vehicleType || '').toUpperCase().includes('AUTO') ||
                          String(safeRide?.category || vehicleType || '').toUpperCase().includes('TOTO') ||
                          String(pickup?.name || '').toLowerCase().includes('kharagpur') ||
                          String(pickup?.name || '').toLowerCase().includes('tech mkt');
    const latOffset = isMbd ? 0.0020 : (isTotoOrLocal ? 0.0016 : 0.0022);
    const lngOffset = isMbd ? -0.0018 : (isTotoOrLocal ? -0.0015 : -0.0020);

    const rawDriverStart = safeRide.driverStartLocation;
    const driverStartLat = Number.isFinite(Number(rawDriverStart?.lat))
      ? Number(rawDriverStart.lat)
      : (isMbd ? 28.8395 : (pickup.lat + latOffset));
    const driverStartLng = Number.isFinite(Number(rawDriverStart?.lng))
      ? Number(rawDriverStart.lng)
      : (isMbd ? 78.7760 : (pickup.lng + lngOffset));

    const pickupShortName = (pickup.name || 'Pickup Point').split(',')[0];
    const driverStart = {
      lat: driverStartLat,
      lng: driverStartLng,
      name: rawDriverStart?.name || (isMbd ? 'Civil Lines Taxi Stand, Moradabad' : `${pickupShortName} Transit Point`),
      address: rawDriverStart?.address || (isMbd ? 'Civil Lines Approach Road, Moradabad 244001' : `Road corridor ~250m from ${pickupShortName}`),
    };

    const initialHeading = calculateBearing(driverStart.lat, driverStart.lng, pickup.lat, pickup.lng);
    lastHeadingRef.current = initialHeading;

    setDriverPos({
      lat: driverStart.lat,
      lng: driverStart.lng,
      category: safeRide.category || vehicleType || 'MOTO',
      heading: initialHeading,
    });

    // Instant fallback segments
    const fallbackApproach = [
      [driverStart.lat, driverStart.lng],
      [driverStart.lat + (pickup.lat - driverStart.lat) * 0.5 + 0.0003, driverStart.lng + (pickup.lng - driverStart.lng) * 0.5 - 0.0003],
      [pickup.lat, pickup.lng],
    ].filter(([lt, lg]) => Number.isFinite(lt) && Number.isFinite(lg));

    const fallbackTrip = [
      [pickup.lat, pickup.lng],
      [pickup.lat + (destination.lat - pickup.lat) * 0.4 - 0.0004, pickup.lng + (destination.lng - pickup.lng) * 0.4 + 0.0004],
      [pickup.lat + (destination.lat - pickup.lat) * 0.75 + 0.0002, pickup.lng + (destination.lng - pickup.lng) * 0.75 - 0.0002],
      [destination.lat, destination.lng],
    ].filter(([lt, lg]) => Number.isFinite(lt) && Number.isFinite(lg));

    approachWaypoints.current = interpolatePath(fallbackApproach, 24);
    tripWaypoints.current = interpolatePath(fallbackTrip, 32);
    setRoutePolyline(fallbackApproach);

    // Fetch high-precision OSRM street route
    Promise.all([
      locationService.getRoute(driverStart, pickup),
      locationService.getRoute(pickup, destination),
    ]).then(([approachRes, tripRes]) => {
      const approachPoints = (approachRes?.coordinates?.length > 2 && approachRes.coordinates.every(([lt, lg]) => Number.isFinite(lt) && Number.isFinite(lg)))
        ? approachRes.coordinates
        : fallbackApproach;
      const tripPoints = (tripRes?.coordinates?.length > 2 && tripRes.coordinates.every(([lt, lg]) => Number.isFinite(lt) && Number.isFinite(lg)))
        ? tripRes.coordinates
        : fallbackTrip;

      approachWaypoints.current = interpolatePath(approachPoints, 24);
      tripWaypoints.current = interpolatePath(tripPoints, 32);

      if (stage === 'HEADING_TO_PICKUP') {
        setRoutePolyline(approachPoints);
      } else {
        setRoutePolyline(tripPoints);
      }
    }).catch((err) => {
      console.warn('Driver route background fallback active:', err);
    });
  }, [currentRide]);

  // Cross-Tab synchronization with Passenger tab
  useEffect(() => {
    const unsub = rideSync.subscribe((evt) => {
      if (!evt?.payload) return;
      const targetId = evt.payload.rideId || evt.payload.id;
      if (currentRide?.id && targetId && targetId !== currentRide.id) return;

      if (evt.type === 'DRIVER_ARRIVED') {
        playTone(784, 0.35);
        setStage('ARRIVED');
        setRideStage('ARRIVED');
        setArrivedAlert(true);
        animIndexRef.current = 0;
        setSpeed(0);
        if (tripWaypoints.current?.length > 0) {
          setRoutePolyline(tripWaypoints.current);
        }
      } else if (evt.type === 'RIDE_STARTED') {
        playTone(880, 0.4);
        setStage('IN_TRANSIT');
        setRideStage('IN_TRANSIT');
        animIndexRef.current = 0;
        if (tripWaypoints.current?.length > 0) {
          setRoutePolyline(tripWaypoints.current);
        }
      } else if (evt.type === 'RIDE_COMPLETED') {
        playTone(987, 0.3);
        setStage('PAYMENT');
        setRideStage('PAYMENT_PENDING');
        setSpeed(0);
      }
    });
    return unsub;
  }, [currentRide?.id, setRideStage]);

  // 3. Waiting stopwatch when at pickup
  useEffect(() => {
    let timer;
    if (stage === 'ARRIVED') {
      timer = setInterval(() => {
        setWaitingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // 4. Smooth Real-Time Progression along Street Routes
  useEffect(() => {
    if (!currentRide || stage === 'PAYMENT' || stage === 'COMPLETED') return;

    const interval = setInterval(() => {
      if (stage === 'HEADING_TO_PICKUP') {
        // Driver at C moves to Pickup Spot A
        const waypoints = approachWaypoints.current;
        if (!waypoints || waypoints.length === 0) return;

        animIndexRef.current = Math.min(animIndexRef.current + 1, waypoints.length - 1);
        const idx = animIndexRef.current;
        const currentPt = waypoints[idx];

        if (!currentPt || !Number.isFinite(currentPt[0]) || !Number.isFinite(currentPt[1])) return;

        const lookaheadIdx = Math.min(idx + 3, waypoints.length - 1);
        let heading = lastHeadingRef.current;
        if (lookaheadIdx > idx) {
          const targetPt = waypoints[lookaheadIdx];
          const dist = Math.hypot(targetPt[0] - currentPt[0], targetPt[1] - currentPt[1]);
          if (dist > 0.00002) {
            heading = calculateBearing(currentPt[0], currentPt[1], targetPt[0], targetPt[1]);
            lastHeadingRef.current = heading;
          }
        } else if (idx > 1) {
          const prevPt = waypoints[idx - 2] || waypoints[idx - 1];
          heading = calculateBearing(prevPt[0], prevPt[1], currentPt[0], currentPt[1]);
          lastHeadingRef.current = heading;
        }
        const progress = waypoints.length > 1 ? idx / (waypoints.length - 1) : 1;
        const remainingDistKm = Math.max(0.1, Math.round((1 - progress) * 0.7 * 10) / 10);
        const remainingEtaMins = Math.max(1, Math.round((1 - progress) * 2));
        const currentSpeed = Math.round(26 + Math.random() * 12);

        setDriverPos({
          lat: currentPt[0],
          lng: currentPt[1],
          heading,
          category: currentRide.category || vehicleType || 'MOTO',
        });
        setSpeed(currentSpeed);
        setRemainingDistance(remainingDistKm);
        setRemainingEta(remainingEtaMins);

        // Reached pickup spot A
        if (idx >= waypoints.length - 1) {
          playTone(784, 0.35);
          setStage('ARRIVED');
          setRideStage('ARRIVED');
          setArrivedAlert(true);
          setTimeout(() => setArrivedAlert(false), 5000);
          animIndexRef.current = 0;
          setSpeed(0);
          if (tripWaypoints.current?.length > 0) {
            setRoutePolyline(tripWaypoints.current);
          }
        }
      } else if (stage === 'IN_TRANSIT') {
        // Driver & Passenger move TOGETHER from A to Destination B!
        const waypoints = tripWaypoints.current;
        if (!waypoints || waypoints.length === 0) return;

        animIndexRef.current = Math.min(animIndexRef.current + 1, waypoints.length - 1);
        const idx = animIndexRef.current;
        const currentPt = waypoints[idx];

        if (!currentPt || !Number.isFinite(currentPt[0]) || !Number.isFinite(currentPt[1])) return;

        const lookaheadIdx = Math.min(idx + 3, waypoints.length - 1);
        let heading = lastHeadingRef.current;
        if (lookaheadIdx > idx) {
          const targetPt = waypoints[lookaheadIdx];
          const dist = Math.hypot(targetPt[0] - currentPt[0], targetPt[1] - currentPt[1]);
          if (dist > 0.00002) {
            heading = calculateBearing(currentPt[0], currentPt[1], targetPt[0], targetPt[1]);
            lastHeadingRef.current = heading;
          }
        } else if (idx > 1) {
          const prevPt = waypoints[idx - 2] || waypoints[idx - 1];
          heading = calculateBearing(prevPt[0], prevPt[1], currentPt[0], currentPt[1]);
          lastHeadingRef.current = heading;
        }
        const progress = waypoints.length > 1 ? idx / (waypoints.length - 1) : 1;
        const totalTripKm = currentRide.distance || 1.4;
        const remainingDistKm = Math.max(0.1, Math.round((1 - progress) * totalTripKm * 10) / 10);
        const remainingEtaMins = Math.max(1, Math.round((1 - progress) * Math.max(2, Math.round(totalTripKm * 2.2))));
        const currentSpeed = Math.round(35 + Math.random() * 15);

        setDriverPos({
          lat: currentPt[0],
          lng: currentPt[1],
          heading,
          category: currentRide.category || vehicleType || 'MOTO',
        });
        setSpeed(currentSpeed);
        setRemainingDistance(remainingDistKm);
        setRemainingEta(remainingEtaMins);

        // Reached destination B
        if (idx >= waypoints.length - 1) {
          playTone(987, 0.3);
          setStage('PAYMENT');
          setRideStage('PAYMENT_PENDING');
          setSpeed(0);
        }
      }
    }, 850);

    return () => clearInterval(interval);
  }, [currentRide, stage, vehicleType, setRideStage]);

  const fareAmount = typeof currentRide?.fare === 'object'
    ? Math.round(currentRide.fare.total ?? currentRide.fare.base ?? 42)
    : Math.round(currentRide?.fare || 42);
  const commission = Math.round(fareAmount * 0.12 * 10) / 10;
  const netEarnings = Math.round((fareAmount - commission) * 10) / 10;

  const handleQuickPing = (msg) => {
    playTone(700, 0.2);
    setQuickPingToast(`Sent to passenger: "${msg}"`);
    setTimeout(() => setQuickPingToast(''), 3500);
  };

  // Driver action: "I Have Arrived at Pickup"
  const handleSayIArrived = () => {
    playTone(784, 0.35);
    setStage('ARRIVED');
    setRideStage('ARRIVED');
    setArrivedAlert(true);
    setTimeout(() => setArrivedAlert(false), 5000);
    animIndexRef.current = 0;
    setSpeed(0);
    if (tripWaypoints.current?.length > 0) {
      setRoutePolyline(tripWaypoints.current);
    }
    if (currentRide?.id) {
      rideSync.broadcast('DRIVER_ARRIVED', { rideId: currentRide.id });
    }
  };

  // Driver action: Verify passenger OTP
  const handleVerifyOtp = () => {
    const validOtp = currentRide?.otp ? String(currentRide.otp).trim() : '4921';
    if (otpInput.trim() === validOtp) {
      playTone(880, 0.4);
      setOtpError('');
      setStage('IN_TRANSIT');
      setRideStage('IN_TRANSIT');
      animIndexRef.current = 0;
      if (currentRide?.id) {
        rideSync.broadcast('RIDE_STARTED', { rideId: currentRide.id });
      }
    } else {
      setOtpError('Incorrect OTP. Please enter the valid 4-digit passenger OTP.');
    }
  };

  const handleFinishRide = () => {
    playTone(987, 0.3);
    setStage('PAYMENT');
    setRideStage('PAYMENT_PENDING');
    if (currentRide?.id) {
      rideSync.broadcast('RIDE_COMPLETED', { rideId: currentRide.id });
    }
  };

  const handleCollectAndFinish = async () => {
    playTone(1046, 0.5);
    const completedAt = new Date().toISOString();
    const durationMins = Math.max(2, Math.round((currentRide?.distance || 1.4) * 2.2));

    const completedRidePayload = {
      ...currentRide,
      status: 'RIDE_COMPLETED',
      completedAt,
      durationMinutes: durationMins,
      payment: {
        method: 'UPI',
        status: 'COMPLETED',
        amount: fareAmount,
      },
    };

    // 1. Credit driver store
    completeRide(fareAmount);

    // 2. Persist in database & API
    try {
      await rideService.updateRide(currentRide?.id, completedRidePayload);
    } catch (e) {}

    if (currentRide?.id) {
      rideSync.broadcast('RIDE_COMPLETED', { rideId: currentRide.id, completedRide: completedRidePayload });
    }

    navigate('/driver/dashboard');
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans bg-slate-50 text-slate-900 gap-3">
        <Spinner size="lg" className="text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading Active Cockpit Navigation...</p>
      </div>
    );
  }

  if (!currentRide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans bg-slate-50 text-slate-900">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-3xl mb-3 shadow-md">
          🚗
        </div>
        <p className="text-base font-black text-slate-900 mb-1">No Active Ride in Progress</p>
        <p className="text-xs text-slate-500 mb-4">Go to your cockpit to accept incoming proximity dispatches</p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          Open Driver Cockpit
        </button>
      </div>
    );
  }

  const formatWaiting = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const passengerName = currentRide.userName || currentRide.passengerName || 'Verified Passenger';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* ── Top Turn-by-Turn Telemetry HUD ───────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md text-slate-900 p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl shrink-0 shadow-md">
              <Navigation size={22} className="animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  {stage === 'HEADING_TO_PICKUP'
                    ? 'Heading to Pickup Spot A'
                    : stage === 'ARRIVED'
                    ? '📍 At Pickup Location A'
                    : stage === 'IN_TRANSIT'
                    ? 'Navigating to Destination B'
                    : 'Trip Completed'}
                </span>
                {stage === 'IN_TRANSIT' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-300">
                    {speed} km/h
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-xs sm:max-w-md mt-0.5">
                {stage === 'IN_TRANSIT' ? (currentRide.destination?.name || 'Destination Dropoff') : (currentRide.pickup?.name || 'Pickup Point')}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-black text-emerald-700">
              {stage === 'IN_TRANSIT'
                ? `${remainingDistance} km · ~${remainingEta} mins`
                : stage === 'HEADING_TO_PICKUP'
                ? `${remainingDistance} km · ~${remainingEta} mins`
                : 'Arrived at Pickup'}
            </span>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              {String(currentRide.category || vehicleType || '').toUpperCase().includes('MOTO') || String(currentRide.category || vehicleType || '').toUpperCase().includes('BIKE')
                ? '🏍️ Rapido Mode'
                : String(currentRide.category || vehicleType || '').toUpperCase().includes('AUTO') || String(currentRide.category || vehicleType || '').toUpperCase().includes('TOTO')
                ? '🛺 Toto Mode'
                : String(currentRide.category || vehicleType || '').toUpperCase().includes('XL')
                ? '🚚 Transporter Mode'
                : '🚗 Cab Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Arrival Push Notification Announcement Banner ─────────────────────── */}
      {arrivedAlert && (
        <div className="absolute top-20 left-4 right-4 z-40 pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold border border-emerald-400/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-sm">Passenger Notified!</p>
                <p className="text-emerald-100 text-[11px]">
                  <strong>{passengerName}</strong> was pinged: "Your driver has arrived at the pickup location."
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-800 px-2.5 py-1 rounded-full font-mono font-bold shrink-0">
              Free Waiting Active
            </span>
          </div>
        </div>
      )}

      {/* ── Main Live Map Canvas with moving vehicle marker & route ─────────────── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="bg-slate-50 w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
            <Spinner size="lg" />
          </div>
        }>
          <LiveMap
            pickup={currentRide.pickup}
            destination={currentRide.destination}
            activeDriverLocation={driverPos}
            routePolyline={routePolyline}
            rideStage={stage === 'IN_TRANSIT' ? 'RIDE_STARTED' : stage === 'HEADING_TO_PICKUP' ? 'DRIVER_APPROACHING' : stage}
            height="100%"
            tileTheme="osm"
            showSurgeZones={false}
          />
        </Suspense>
      </div>

      {/* ── Bottom HUD: Passenger Card & Contextual Trip Actions ──────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <div className="mx-3 sm:mx-6 mb-3 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6">
          
          {/* ── STAGE 1: HEADING TO PICKUP ───────────────────────────────────── */}
          {stage === 'HEADING_TO_PICKUP' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shadow-sm">
                    {passengerName.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900">{passengerName}</h4>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold border border-emerald-200">
                        Passenger
                      </span>
                    </div>
                    <p className="text-xs text-amber-500 font-bold mt-0.5">
                      ★ {currentRide.userRating || 4.9} · Verified Account
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 transition-colors"
                    title="Private Anonymized Call"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-colors"
                    title="In-App Messaging"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>

              {/* Pickup Address Card */}
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 transition-all">
                <div className="relative w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm shadow-blue-500/20 ring-4 ring-blue-500/20">
                  <span>A</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white animate-ping" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Pickup Spot (Place A)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <p className="text-xs font-black text-slate-900 truncate">
                    {currentRide.pickup?.name || currentRide.pickup?.address}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentRide.pickup?.address}
                  </p>
                </div>
              </div>

              {/* Quick Communication Chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  "I've reached your lane",
                  'Heavy traffic near chowk',
                  'Please be ready at gate',
                ].map((txt) => (
                  <button
                    key={txt}
                    onClick={() => handleQuickPing(txt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  >
                    💬 {txt}
                  </button>
                ))}
              </div>

              {/* Action Button: Arrived at Pickup */}
              <button
                onClick={handleSayIArrived}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <MapPin size={15} />
                <span>I've Arrived at Pickup Spot A</span>
              </button>
            </div>
          )}

          {/* ── STAGE 2: AT PICKUP & OTP VERIFICATION ─────────────────────────── */}
          {stage === 'ARRIVED' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Waiting for Passenger at Place A
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock size={12} className="text-slate-500" />
                  <span>{formatWaiting(waitingSeconds)}</span>
                </div>
              </div>

              {/* OTP Input Form */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <KeyRound size={15} className="text-emerald-600" />
                    <span>Enter 4-Digit Passenger Start OTP:</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="****"
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-4 py-2.5 text-center font-mono font-black text-base tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Check size={16} />
                    <span>Start Ride</span>
                  </button>
                </div>
                {otpError && <p className="text-[11px] font-bold text-rose-600">{otpError}</p>}
              </div>

              {/* Destination Dropoff Preview */}
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-200 transition-all">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm shadow-rose-500/20 ring-4 ring-rose-500/20">
                  <span>B</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Destination Dropoff (Place B)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-xs font-black text-slate-900 truncate">
                    {currentRide.destination?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentRide.destination?.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 3: IN TRANSIT TO DESTINATION B ─────────────────────────── */}
          {stage === 'IN_TRANSIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    ● Moving Together Towards Destination B
                  </span>
                  <h4 className="text-sm font-black text-slate-900 truncate max-w-xs mt-0.5">
                    {currentRide.destination?.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 font-mono">
                    {remainingDistance} km
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold">~{remainingEta} mins ETA</p>
                </div>
              </div>

              {/* Live Route Tracker */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Compass size={16} className="text-blue-600 animate-spin-slow" />
                  <span className="font-bold">Driving Speed:</span>
                </div>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {speed} km/h
                </span>
              </div>

              {/* Complete Ride CTA */}
              <button
                onClick={handleFinishRide}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/25 text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Complete Trip (Arrived at Destination B)</span>
              </button>
            </div>
          )}

          {/* ── STAGE 4: FARE COLLECTION & UPI SETTLEMENT ────────────────────── */}
          {stage === 'PAYMENT' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Trip Completed!</h3>
                <p className="text-xs text-slate-500">Collect fare from passenger via UPI QR or Cash</p>
              </div>

              {/* Earnings Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Gross Fare:</span>
                  <span className="font-bold text-slate-900">₹{fareAmount}.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee (12%):</span>
                  <span>- ₹{commission}.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-emerald-700">
                  <span>Driver Net Credited to UPI:</span>
                  <span>₹{netEarnings}.00</span>
                </div>
              </div>

              {/* Collect & Finish CTA */}
              <button
                onClick={handleCollectAndFinish}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/25 text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <DollarSign size={15} />
                <span>Payment Received · Ready for Next Ride</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Private Masked Phone Call Simulation Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Phone size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black">Private Encrypted Call</h3>
              <p className="text-xs text-slate-500 mt-1">
                Virtual number masking protects your phone number and passenger identity.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs text-slate-800 font-bold border border-slate-200">
              Dialing {passengerName} via +91 80 6900-MASK
            </div>
            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
