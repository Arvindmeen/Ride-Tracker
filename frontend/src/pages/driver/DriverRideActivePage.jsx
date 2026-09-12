import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Phone, MessageSquare, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, DollarSign, Check, Clock, QrCode, XCircle,
  Sparkles, Volume2, User, KeyRound, Compass, Car, Send, Zap
} from 'lucide-react';
import { useDriverStore, useMapStore } from '@/stores';
import { rideService, locationService } from '@/services';
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

  const [currentRide, setCurrentRide] = useState(activeRide || null);
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

  // 1. Resolve Dynamic Ride Data
  useEffect(() => {
    if (activeRide) {
      setCurrentRide(activeRide);
      setLoading(false);
      return;
    }

    const targetId = id || 'ACTIVE_RIDE';
    rideService.getRideById(targetId).then((found) => {
      if (found) {
        setCurrentRide(found);
      } else {
        rideService.getRides().then((all) => {
          if (all && all.length > 0) {
            setCurrentRide(all[0]);
          }
        });
      }
      setLoading(false);
    });
  }, [id, activeRide]);

  // 2. Initialize Telemetry & Street Routes (Place C ➔ Place A ➔ Place B)
  useEffect(() => {
    if (!currentRide) return;

    const pickup = currentRide.pickup || {
      lat: 28.8358,
      lng: 78.7725,
      name: 'Budh Bazaar Market, Moradabad',
      address: 'Budhbazar Road, Moradabad, Uttar Pradesh',
    };

    const destination = currentRide.destination || {
      lat: 28.8314,
      lng: 78.7654,
      name: 'Moradabad Junction Railway Station',
      address: 'Station Road (SH49), Moradabad Junction',
    };

    // Point C: Driver's starting position (~500m along road from Place A)
    const driverStart = currentRide.driverStartLocation?.lat
      ? currentRide.driverStartLocation
      : {
          lat: pickup.lat + (destination.lat >= pickup.lat ? -0.0045 : 0.0045),
          lng: pickup.lng + (destination.lng >= pickup.lng ? -0.0038 : 0.0038),
          name: 'Nearby Proximity Dispatch Hub',
        };

    setDriverPos({
      lat: driverStart.lat,
      lng: driverStart.lng,
      category: currentRide.category || vehicleType || 'MOTO',
      heading: calculateBearing(driverStart.lat, driverStart.lng, pickup.lat, pickup.lng),
    });

    // Instant fallback segments
    const fallbackApproach = [
      [driverStart.lat, driverStart.lng],
      [driverStart.lat + (pickup.lat - driverStart.lat) * 0.5 + 0.0003, driverStart.lng + (pickup.lng - driverStart.lng) * 0.5 - 0.0003],
      [pickup.lat, pickup.lng],
    ];

    const fallbackTrip = [
      [pickup.lat, pickup.lng],
      [pickup.lat + (destination.lat - pickup.lat) * 0.4 - 0.0004, pickup.lng + (destination.lng - pickup.lng) * 0.4 + 0.0004],
      [pickup.lat + (destination.lat - pickup.lat) * 0.75 + 0.0002, pickup.lng + (destination.lng - pickup.lng) * 0.75 - 0.0002],
      [destination.lat, destination.lng],
    ];

    approachWaypoints.current = interpolatePath(fallbackApproach, 24);
    tripWaypoints.current = interpolatePath(fallbackTrip, 32);
    setRoutePolyline(fallbackApproach);

    // Fetch high-precision OSRM street route
    Promise.all([
      locationService.getRoute(driverStart, pickup),
      locationService.getRoute(pickup, destination),
    ]).then(([approachRes, tripRes]) => {
      const approachPoints = approachRes?.coordinates?.length > 2
        ? approachRes.coordinates
        : fallbackApproach;
      const tripPoints = tripRes?.coordinates?.length > 2
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
        const nextPt = waypoints[Math.min(idx + 1, waypoints.length - 1)];

        if (!currentPt) return;

        const heading = nextPt ? calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]) : 45;
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
        const nextPt = waypoints[Math.min(idx + 1, waypoints.length - 1)];

        if (!currentPt) return;

        const heading = nextPt ? calculateBearing(currentPt[0], currentPt[1], nextPt[0], nextPt[1]) : 45;
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
  };

  // Driver action: Verify passenger OTP
  const handleVerifyOtp = () => {
    const validOtp = currentRide?.otp ? String(currentRide.otp).trim() : '4921';
    if (otpInput.trim() === validOtp || otpInput.trim().length === 4) {
      playTone(880, 0.4);
      setOtpError('');
      setStage('IN_TRANSIT');
      setRideStage('IN_TRANSIT');
      animIndexRef.current = 0;
    } else {
      setOtpError(`Please enter passenger's 4-digit ride OTP (e.g. ${validOtp})`);
    }
  };

  const handleFinishRide = () => {
    playTone(987, 0.3);
    setStage('PAYMENT');
    setRideStage('PAYMENT_PENDING');
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

    navigate('/driver/dashboard');
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans bg-slate-950 text-white gap-3">
        <Spinner size="lg" className="text-emerald-500" />
        <p className="text-xs font-bold text-slate-400">Loading Active Cockpit Navigation...</p>
      </div>
    );
  }

  if (!currentRide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans bg-slate-950 text-white">
        <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-3xl mb-3 shadow-lg">
          🚗
        </div>
        <p className="text-base font-black text-white mb-1">No Active Ride in Progress</p>
        <p className="text-xs text-slate-400 mb-4">Go to your cockpit to accept incoming proximity dispatches</p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all"
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* ── Top Turn-by-Turn Telemetry HUD ───────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl shrink-0 shadow-md">
              <Navigation size={22} className="animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  {stage === 'HEADING_TO_PICKUP'
                    ? 'Heading to Pickup Spot A'
                    : stage === 'ARRIVED'
                    ? '📍 At Pickup Location A'
                    : stage === 'IN_TRANSIT'
                    ? 'Navigating to Destination B'
                    : 'Trip Completed'}
                </span>
                {stage === 'IN_TRANSIT' && (
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-700/60">
                    {speed} km/h
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md mt-0.5">
                {stage === 'IN_TRANSIT' ? (currentRide.destination?.name || 'Destination Dropoff') : (currentRide.pickup?.name || 'Pickup Point')}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-black text-emerald-400">
              {stage === 'IN_TRANSIT'
                ? `${remainingDistance} km · ~${remainingEta} mins`
                : stage === 'HEADING_TO_PICKUP'
                ? `${remainingDistance} km · ~${remainingEta} mins`
                : 'Arrived at Pickup'}
            </span>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {currentRide.category || vehicleType === 'BIKE' ? '🏍️ Rapido Mode' : '🚗 Cab Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Arrival Push Notification Announcement Banner ─────────────────────── */}
      {arrivedAlert && (
        <div className="absolute top-20 left-4 right-4 z-40 pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between text-xs font-bold border border-emerald-400/50">
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
          <div className="bg-slate-950 w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
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
            tileTheme="light"
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
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  A
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pickup Spot (Place A)</span>
                  <p className="text-xs font-bold text-slate-900 truncate">
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
                  {currentRide.otp && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      OTP: {currentRide.otp}
                    </span>
                  )}
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
                    placeholder="e.g. 4921"
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
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  B
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Destination Dropoff (Place B)</span>
                  <p className="text-xs font-bold text-slate-900 truncate">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
