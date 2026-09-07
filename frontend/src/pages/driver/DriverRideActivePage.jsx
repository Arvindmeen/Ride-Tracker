import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Navigation, Phone, MessageSquare, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, DollarSign, Check, Clock, QrCode, XCircle,
  Sparkles, Volume2, User, KeyRound, Compass, Car, Send, Zap
} from 'lucide-react';
import { useDriverStore, useMapStore } from '@/stores';
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

  const [stage, setStage] = useState(activeRideStage || 'HEADING_TO_PICKUP'); // 'HEADING_TO_PICKUP' | 'ARRIVED' | 'IN_TRANSIT' | 'PAYMENT'
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [arrivedAlert, setArrivedAlert] = useState(false);
  const [quickPingToast, setQuickPingToast] = useState('');
  const [speed, setSpeed] = useState(0);

  // Driver simulated moving coordinate
  const [driverPos, setDriverPos] = useState({
    lat: activeRide?.pickup?.lat ? activeRide.pickup.lat - 0.003 : 22.3110,
    lng: activeRide?.pickup?.lng ? activeRide.pickup.lng - 0.002 : 87.3020,
    heading: 45,
    category: vehicleType || 'MOTO',
  });

  // Waiting stopwatch when driver arrives at pickup
  useEffect(() => {
    let timer;
    if (stage === 'ARRIVED') {
      timer = setInterval(() => {
        setWaitingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // Simulated GPS progression & speed
  useEffect(() => {
    if (!activeRide) return;
    const interval = setInterval(() => {
      setDriverPos((prev) => {
        const target = stage === 'IN_TRANSIT' ? activeRide.destination : activeRide.pickup;
        if (!target?.lat) return prev;
        const dLat = (target.lat - prev.lat) * 0.12;
        const dLng = (target.lng - prev.lng) * 0.12;
        
        if (stage === 'IN_TRANSIT') {
          setSpeed(Math.round(28 + Math.random() * 20));
        } else if (stage === 'HEADING_TO_PICKUP') {
          setSpeed(Math.round(18 + Math.random() * 15));
        } else {
          setSpeed(0);
        }

        return {
          lat: prev.lat + dLat,
          lng: prev.lng + dLng,
          heading: (prev.heading + 10) % 360,
          category: vehicleType || 'MOTO',
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRide, stage, vehicleType]);

  const fareAmount = activeRide?.estimatedFare || 85;
  const commission = Math.round(fareAmount * 0.12 * 10) / 10;
  const netEarnings = Math.round((fareAmount - commission) * 10) / 10;

  const handleQuickPing = (msg) => {
    playTone(700, 0.2);
    setQuickPingToast(`Sent to passenger: "${msg}"`);
    setTimeout(() => setQuickPingToast(''), 3500);
  };

  // Driver action: "I Have Arrived at Pickup"
  const handleSayIArrived = () => {
    playTone(784, 0.35); // G5 chime
    setStage('ARRIVED');
    setRideStage('ARRIVED');
    setArrivedAlert(true);
    setTimeout(() => setArrivedAlert(false), 5000);
  };

  // Driver action: Verify passenger OTP
  const handleVerifyOtp = () => {
    if (otpInput.trim().length === 4 || otpInput === '4921') {
      playTone(880, 0.4); // A5 chime
      setOtpError('');
      setStage('IN_TRANSIT');
      setRideStage('IN_TRANSIT');
    } else {
      setOtpError('Please enter the 4-digit ride OTP given by passenger (e.g. 4921)');
    }
  };

  const handleFinishRide = () => {
    playTone(987, 0.3); // B5 chime
    setStage('PAYMENT');
    setRideStage('PAYMENT_PENDING');
  };

  const handleCollectAndFinish = () => {
    playTone(1046, 0.5); // C6 celebratory chime
    completeRide(fareAmount);
    navigate('/driver/dashboard');
  };

  if (!activeRide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans bg-slate-950 text-white">
        <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-3xl mb-3 shadow-lg">
          🚗
        </div>
        <p className="text-base font-black text-white mb-1">No Active Ride in Progress</p>
        <p className="text-xs text-slate-400 mb-4">Go to your cockpit to accept incoming proximity dispatches</p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all"
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

  const is100Km = activeRide.is100KmOutstation || (activeRide.estimatedDistance && activeRide.estimatedDistance >= 80);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* ── Top Turn-by-Turn Telemetry HUD ───────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shrink-0 shadow-md">
              <Navigation size={22} className="animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  {stage === 'HEADING_TO_PICKUP'
                    ? 'Heading to Pickup Spot'
                    : stage === 'ARRIVED'
                    ? '📍 At Pickup Location'
                    : stage === 'IN_TRANSIT'
                    ? 'Trip in Progress (Navigating)'
                    : 'Trip Completed'}
                </span>
                {stage === 'IN_TRANSIT' && (
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-700/60">
                    {speed} km/h
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md mt-0.5">
                {stage === 'IN_TRANSIT' ? activeRide.destination?.name : activeRide.pickup?.name}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-black text-emerald-400">
              {stage === 'IN_TRANSIT'
                ? `${activeRide.estimatedDistance || 12} km · Active`
                : '0.7 km · ~2 mins'}
            </span>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {vehicleType === 'BIKE' ? '🏍️ Rapido Mode' : '🚗 Cab Mode'}
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
                  <strong>{activeRide.userName}</strong> was pinged: "Your driver has arrived at the pickup location."
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
            pickup={activeRide.pickup}
            destination={activeRide.destination}
            activeDriverLocation={driverPos}
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
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-base shadow-sm">
                    {activeRide.userName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900">{activeRide.userName}</h4>
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 rounded font-bold border border-blue-200">
                        Passenger
                      </span>
                    </div>
                    <p className="text-xs text-amber-500 font-bold mt-0.5">
                      ★ {activeRide.userRating || 4.9} · Verified Account
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

              {/* Pickup Spot Details */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-500 shrink-0">Pickup Point:</span>
                  <span className="font-bold text-slate-900 truncate">{activeRide.pickup?.name}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">
                  0.7 km away
                </span>
              </div>

              {/* 🎯 CORE USER REQUEST: "SAY I ARRIVED" BUTTON */}
              <div className="pt-1">
                <button
                  onClick={handleSayIArrived}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 flex flex-col items-center justify-center gap-1 text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-95 border-2 border-emerald-400/80"
                >
                  <div className="flex items-center gap-2.5 text-base sm:text-lg">
                    <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                    <CheckCircle2 size={22} className="shrink-0" />
                    <span>I HAVE ARRIVED AT PICKUP POINT</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-100/90">
                    Tap to notify passenger & activate free waiting timer
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ── STAGE 2: ARRIVED AT PICKUP (WAITING & OTP VERIFICATION) ───────── */}
          {stage === 'ARRIVED' && (
            <div className="space-y-4">
              {/* Arrival Status & Waiting Timer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      📍 You Are At Pickup Point
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Passenger Alerted · Free Waiting (5:00 min)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs">
                  <Clock size={13} className="text-amber-600 animate-pulse" />
                  <span>Waiting: {formatWaiting(waitingSeconds)}</span>
                </div>
              </div>

              {/* Quick Passenger Ping Chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Quick Arrival Pings to Passenger
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "💬 I'm outside at the gate",
                    "🚨 Flashed my headlights",
                    "👋 Standing near pickup spot"
                  ].map((ping, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPing(ping)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 hover:border-slate-300 active:scale-95"
                    >
                      {ping}
                    </button>
                  ))}
                </div>
                {quickPingToast && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    <span>{quickPingToast}</span>
                  </div>
                )}
              </div>

              {/* 4-Digit Passenger Ride OTP Input Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-blue-950 text-sm flex items-center gap-1.5">
                      <KeyRound size={16} className="text-blue-600" />
                      <span>Ask Passenger For 4-Digit Ride OTP</span>
                    </h4>
                    <p className="text-blue-700 text-[11px] mt-0.5">
                      Verify passenger boarding by entering the code shown on their booking screen
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOtpInput('4921');
                      setOtpError('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center gap-1"
                    title="Autofill passenger OTP for demo"
                  >
                    <Sparkles size={13} />
                    <span>Fill OTP (4921)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/\D/g, ''));
                        if (otpError) setOtpError('');
                      }}
                      placeholder="• • • •"
                      className="text-center font-mono font-black text-3xl tracking-[0.5em] w-64 bg-white border-2 border-blue-300 focus:border-emerald-500 rounded-2xl py-3 focus:outline-none shadow-sm transition-colors text-slate-900"
                    />
                  </div>
                  {otpError && (
                    <p className="text-center text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                      <AlertTriangle size={13} />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-95"
                >
                  <KeyRound size={18} />
                  <span>Verify OTP & Start Trip</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STAGE 3: IN TRANSIT (DRIVING TO DESTINATION) ─────────────────── */}
          {stage === 'IN_TRANSIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase">Trip in Progress</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                    Heading To: {activeRide.destination?.name}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-slate-900">₹{fareAmount}</span>
                  <p className="text-[10px] text-emerald-600 font-bold">Net: ₹{netEarnings}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">Destination Distance:</span>
                <span className="font-mono font-bold text-slate-900">
                  {activeRide.estimatedDistance || 12} km ({activeRide.estimatedDuration || 25} mins)
                </span>
              </div>

              <button
                onClick={handleFinishRide}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
              >
                <CheckCircle2 size={20} />
                <span>Arrived at Destination · Complete Trip</span>
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
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <DollarSign size={18} />
                <span>Payment Received · Ready for Next Ride</span>
                <ArrowRight size={18} />
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
              Dialing {activeRide.userName} via +91 80 6900-MASK
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
