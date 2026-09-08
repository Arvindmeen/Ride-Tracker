import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, MessageSquare, Share2, AlertTriangle, MapPin,
  Clock, Star, X, CheckCircle2, ShieldCheck, DollarSign,
  Copy, Send, Lock, Check, ChevronUp, ChevronDown, Compass
} from 'lucide-react';
import { clsx } from 'clsx';
import { rideService } from '@/services';
import { useMapStore } from '@/stores';
import { Spinner, Modal, Badge, Button, VehicleIcon } from '@/components/ui';

const LiveMap = lazy(() => import('@/components/map/LiveMap'));

const STATUS_STEPS = [
  { key: 'DRIVER_ASSIGNED', label: 'Driver Confirmed' },
  { key: 'DRIVER_APPROACHING', label: 'Driver Approaching' },
  { key: 'DRIVER_ARRIVED', label: 'Driver Arrived at Pickup' },
  { key: 'RIDE_STARTED', label: 'Ride in Progress' },
  { key: 'RIDE_COMPLETED', label: 'Ride Completed' },
];

function getFareDisplay(fare) {
  if (!fare) return '28';
  if (typeof fare === 'object') {
    return Math.round(fare.total ?? fare.base ?? 28);
  }
  return typeof fare === 'number' ? Math.round(fare) : fare;
}

export default function LiveRidePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startSimulation } = useMapStore();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Driver moving coordinates
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    rideService.getRideById(id).then((r) => {
      const defaultRide = r || {
        id: id || 'RIDE-8092',
        status: 'DRIVER_APPROACHING',
        pickup: { lat: 22.3150, lng: 87.3050, name: 'Scholars Avenue (RK Hall Gate)' },
        destination: { lat: 22.3190, lng: 87.3040, name: 'Technology Market (Tech Mkt)' },
        distance: 2.4,
        fare: 28,
        otp: '4921',
        driverInfo: {
          name: 'Subhash Mondal',
          phone: '+91 94340 12891',
          rating: 4.92,
          category: 'MOTO',
          vehicle: 'Hero Splendor Plus (Bike)',
          plate: 'WB 29 AB 1042',
          eta: 3,
        },
      };

      setRide(defaultRide);
      setDriverLocation({
        lat: defaultRide.pickup.lat - 0.003,
        lng: defaultRide.pickup.lng - 0.002,
        category: defaultRide.driverInfo?.category || 'MOTO',
        heading: 45,
      });
      setLoading(false);
    });
    startSimulation();
  }, [id, startSimulation]);

  // Smooth real-time driver movement simulation
  useEffect(() => {
    if (!ride || !driverLocation) return;
    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        if (!prev) return prev;
        const target = ride.status === 'RIDE_STARTED' ? ride.destination : ride.pickup;
        if (!target?.lat) return prev;

        const dLat = (target.lat - prev.lat) * 0.12;
        const dLng = (target.lng - prev.lng) * 0.12;

        return {
          ...prev,
          lat: prev.lat + dLat,
          lng: prev.lng + dLng,
          heading: (prev.heading + 15) % 360,
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [ride, driverLocation]);

  // Simulate ride state progression
  useEffect(() => {
    if (!ride || ride.status === 'RIDE_COMPLETED') return;
    const statuses = ['DRIVER_APPROACHING', 'DRIVER_ARRIVED', 'RIDE_STARTED', 'RIDE_COMPLETED'];
    const currentIdx = statuses.indexOf(ride.status);
    if (currentIdx < 0) return;

    const timer = setTimeout(() => {
      const nextStatus = statuses[Math.min(currentIdx + 1, statuses.length - 1)];
      setRide((r) => ({ ...r, status: nextStatus }));
      if (nextStatus === 'RIDE_COMPLETED') setShowRating(true);
    }, 14000);

    return () => clearTimeout(timer);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-3 bg-slate-50">
        <Spinner size="xl" className="text-blue-600" />
        <span className="text-xs font-bold text-slate-500">Connecting to Active Trip...</span>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-4 bg-slate-50">
        <p className="text-slate-600 font-bold text-base">Active Ride not found</p>
        <Button onClick={() => navigate('/app/home')}>Back to Home</Button>
      </div>
    );
  }

  const statusIdx = STATUS_STEPS.findIndex((s) => s.key === ride.status);
  const statusLabel = STATUS_STEPS[statusIdx]?.label || ride.status;

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
                    : `Driver is ${ride.driverInfo?.eta || 3} mins away · ${ride.distance} km`}
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
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {/* Real Vehicle Icon */}
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                  <VehicleIcon category={ride.driverInfo?.category || 'MOTO'} size="lg" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base">
                    {ride.driverInfo?.name || 'Subhash Mondal'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {ride.driverInfo?.vehicle || 'Hero Splendor Plus (Bike)'} ·{' '}
                    <span className="text-amber-500 font-bold">★ {ride.driverInfo?.rating || 4.9}</span>
                  </p>
                  <span className="font-mono text-xs font-bold bg-white text-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 inline-block mt-1">
                    {ride.driverInfo?.plate || 'WB 29 AB 1042'}
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
                Connecting to {ride.driverInfo?.name}. Your personal mobile number remains completely confidential.
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
                  {ride.driverInfo?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{ride.driverInfo?.name}</h3>
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
              Broadcasting GPS: {driverLocation?.lat.toFixed(4)}° N, {driverLocation?.lng.toFixed(4)}° E
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
                Rate your journey with {ride.driverInfo?.name}:
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
                setShowRating(false);
                navigate('/app/trips');
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
