import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, MessageSquare, Share2, AlertTriangle, ChevronDown, MapPin,
  Navigation, Clock, Star, X, CheckCircle2, ShieldCheck, DollarSign,
  Copy, Send, Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { rideService } from '@/services';
import { useMapStore } from '@/stores';
import { Spinner, Modal, Badge } from '@/components/ui';

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

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner size="xl" /></div>;
  if (!ride) return <div className="flex items-center justify-center h-screen text-slate-500">Ride not found</div>;

  const statusIdx = STATUS_STEPS.findIndex((s) => s.key === ride.status);
  const statusLabel = STATUS_STEPS[statusIdx]?.label || ride.status;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* ── Live Leaflet Map ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="bg-slate-200 w-full h-full flex items-center justify-center"><Spinner size="lg" /></div>}>
          <LiveMap
            pickup={ride.pickup}
            destination={ride.destination}
            activeDriverLocation={driverLocation}
            height="100%"
          />
        </Suspense>
      </div>

      {/* ── Top Status Floating Header ──────────────────────────────────────── */}
      <div className="relative z-20 m-3 sm:m-4 space-y-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
            <div>
              <p className="text-sm font-black text-slate-900">{statusLabel}</p>
              <p className="text-xs text-slate-500">
                {ride.status === 'RIDE_COMPLETED'
                  ? 'Arrived at destination'
                  : `Driver is ${ride.driverInfo?.eta || 3} mins away · ${ride.distance} km`}
              </p>
            </div>
          </div>

          {/* OTP Safety Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-1.5 flex items-center gap-2">
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Start OTP</p>
              <p className="font-mono font-black text-base text-amber-900 leading-none">{ride.otp || '4921'}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(ride.otp || '4921');
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

        {/* Multi-step progress bar */}
        <div className="flex gap-1.5 px-1">
          {STATUS_STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i <= statusIdx ? 'bg-blue-600' : 'bg-slate-300/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Passenger Card & Controls ─────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
        <div className="mx-3 sm:mx-6 mb-3 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          {/* Driver & Vehicle Details */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
                {ride.driverInfo?.category === 'MOTO' ? '🏍️' : '🚗'}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{ride.driverInfo?.name || 'Subhash Mondal'}</h3>
                <p className="text-xs text-slate-500">
                  {ride.driverInfo?.vehicle || 'Hero Splendor Plus'} · <span className="text-amber-600 font-bold">★ {ride.driverInfo?.rating || 4.9}</span>
                </p>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {ride.driverInfo?.plate || 'WB 29 AB 1042'}
                </span>
              </div>
            </div>

            {/* Call, Chat & Share actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCallModal(true)}
                className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                title="Private Masked Call"
              >
                <Phone size={18} />
              </button>

              <button
                onClick={() => setShowChatModal(true)}
                className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors"
                title="In-App Chat"
              >
                <MessageSquare size={18} />
              </button>

              <button
                onClick={() => setShowSOS(true)}
                className="w-10 h-10 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-colors"
                title="Emergency SOS"
              >
                <AlertTriangle size={18} />
              </button>
            </div>
          </div>

          {/* Route Overview & Fare */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span className="truncate">{ride.pickup?.name}</span>
              </p>
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span className="truncate">{ride.destination?.name}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Upfront Fare:</span>
                <p className="text-base font-black text-slate-900">₹{getFareDisplay(ride.fare)}.00</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                Paid via UPI AutoPay
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Masked Call Simulation Modal ─────────────────────────────────────── */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Phone size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black">Encrypted Private Calling</h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to {ride.driverInfo?.name}. Your phone number remains hidden and anonymous.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs font-bold text-slate-700">
              Virtual Gateway: +91 (080) 6900-RIDE
            </div>
            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Disconnect Call
            </button>
          </div>
        </div>
      )}

      {/* ── In-App Chat Modal ────────────────────────────────────────────────── */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3 flex flex-col h-96">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black">Chat with {ride.driverInfo?.name}</h3>
                <p className="text-[10px] text-slate-400">Encrypted in-app messaging</p>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-2xl max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
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
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Emergency SOS Modal ──────────────────────────────────────────────── */}
      {showSOS && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
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
              <button
                onClick={() => setShowSOS(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('SOS Alert Transmitted to Campus Security & Police Emergency Desk.');
                  setShowSOS(false);
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Trigger SOS Beacon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rating & Receipt Modal on Ride Completion ───────────────────────── */}
      {showRating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">You have arrived!</h3>
              <p className="text-xs text-slate-500">Trip completed safely · ₹{getFareDisplay(ride.fare)}.00 paid via UPI</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">Rate your journey with {ride.driverInfo?.name}:</p>
              <div className="flex justify-center gap-2 text-amber-400 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setUserRating(star)} className="text-2xl hover:scale-125 transition-transform">
                    ★
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowRating(false);
                navigate('/app/trips');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all"
            >
              Submit Rating & View Trip Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
