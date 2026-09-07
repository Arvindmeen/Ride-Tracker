import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore, useMapStore } from '@/stores';
import { Card, Spinner } from '@/components/ui';
import { CheckCircle, XCircle, MapPin, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

// Realistic mock requests with Proximity to Driver matching
const DEMO_REQUESTS = [
  {
    id: 'REQ-OUT-124',
    userId: 'U002',
    userName: 'Debanjan Chatterjee (IIT KGP PhD)',
    userRating: 4.96,
    pickup: { name: 'Scholars Avenue, RK Hall Gate', address: 'IIT Kharagpur Campus, WB' },
    destination: { name: 'Kolkata Airport (CCU Terminal 2)', address: 'NH16 Highway Outstation, Kolkata' },
    estimatedFare: 2680,
    estimatedDistance: 124.0, // 100+ km outstation trip!
    estimatedDuration: 135,
    pickupDistanceToDriver: 0.7, // Only 0.7 km away from driver!
    pickupEtaMins: 2,
    is100KmOutstation: true,
    category: 'CAR',
    surgeMultiplier: 1.0,
    requestedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-LOC-02',
    userId: 'U005',
    userName: 'Sneha Mondal',
    userRating: 4.92,
    pickup: { name: 'Nalanda Complex Gate', address: 'Academic Complex, IIT KGP' },
    destination: { name: 'Technology Market (Tech Mkt)', address: 'Market Street, IIT Kharagpur' },
    estimatedFare: 28,
    estimatedDistance: 2.2,
    estimatedDuration: 6,
    pickupDistanceToDriver: 0.3,
    pickupEtaMins: 1,
    is100KmOutstation: false,
    category: 'MOTO',
    surgeMultiplier: 1.0,
    requestedAt: new Date().toISOString(),
  },
];

export default function DriverRequests() {
  const { status, pendingRequests, acceptRide, clearRequests, addRequest } = useDriverStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({});

  // Load demo requests
  useEffect(() => {
    if (pendingRequests.length === 0 && status === 'AVAILABLE') {
      DEMO_REQUESTS.forEach((r, i) => setTimeout(() => addRequest(r), i * 1500));
    }
  }, [status]);

  // Countdown timers
  useEffect(() => {
    pendingRequests.forEach(r => {
      if (!countdown[r.id]) setCountdown(c => ({ ...c, [r.id]: 30 }));
    });
    const t = setInterval(() => {
      setCountdown(c => {
        const next = { ...c };
        Object.keys(next).forEach(k => { if (next[k] > 0) next[k]--; });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pendingRequests.length]);

  const handleAcceptTrip = (req) => {
    acceptRide(req);
    navigate(`/driver/ride/${req.id}`);
  };

  if (status === 'OFFLINE') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl">🚗</div>
        <h2 className="text-lg font-bold text-white">You're offline</h2>
        <p className="text-sm text-slate-400 mt-1">Go online from the dashboard to receive proximity ride requests</p>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <div className="w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <h2 className="text-lg font-bold text-white">Scanning for Nearby Rides</h2>
        <p className="text-sm text-slate-400 mt-1">
          Proximity engine active · Only receiving requests where user is within 5 km of you
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => DEMO_REQUESTS.forEach((r) => addRequest(r))}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 hover:text-white border border-slate-700"
          >
            Reload Proximity Requests
          </button>
        </div>
        <Spinner size="md" className="mt-6 text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Incoming Ride Queue</h1>
          <p className="text-xs text-slate-400">Filtered strictly by driver proximity (Closest to pickup)</p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
          {pendingRequests.length} nearby requests
        </span>
      </div>

      {pendingRequests.map(req => {
        const secs = countdown[req.id] ?? 30;
        return (
          <div
            key={req.id}
            className={clsx(
              'bg-slate-900 rounded-3xl border-2 p-5 shadow-xl transition-all',
              secs <= 8 ? 'border-red-500/80 bg-red-950/20' : 'border-slate-700 hover:border-emerald-500/60',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg">
                  {req.category === 'MOTO' ? '🏍️' : '🚗'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-white">{req.userName}</p>
                    {req.is100KmOutstation && (
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                        100+ km Outstation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-400 font-medium">★ {req.userRating} · Verified Passenger</p>
                </div>
              </div>
              <div className={clsx(
                'text-xs font-black font-mono px-2.5 py-1 rounded-lg flex items-center gap-1',
                secs <= 8 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/20 text-blue-400',
              )}>
                <span>{secs}s</span>
              </div>
            </div>

            {/* Proximity Match Guarantee Badge */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-2.5 mb-3 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Closest Driver Match: </span>
                <span>User is only <strong>{req.pickupDistanceToDriver || 0.7} km away</strong> ({req.pickupEtaMins || 2} mins to pickup).</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700">
                <p className="text-xl font-black text-emerald-400">₹{req.estimatedFare}</p>
                <p className="text-[10px] text-emerald-500 font-semibold">
                  Net: ₹{Math.round(req.estimatedFare * 0.88)} (UPI)
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700">
                <p className="text-lg font-black text-blue-300">{req.pickupDistanceToDriver || 0.7} km</p>
                <p className="text-[10px] text-blue-400 font-semibold">To Pickup</p>
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700">
                <p className="text-lg font-black text-white">{req.estimatedDistance} km</p>
                <p className="text-[10px] text-slate-400 font-semibold">Trip Distance</p>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-2 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs font-semibold">
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 text-[10px] font-bold">PICKUP (NEAR YOU):</p>
                  <p className="font-bold text-white">{req.pickup.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-[10px] font-bold">DESTINATION:</p>
                  <p className="font-bold text-white">{req.destination.name}</p>
                </div>
              </div>
            </div>

            {/* Accept / Pass Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => clearRequests()}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
              >
                Pass
              </button>
              <button
                onClick={() => handleAcceptTrip(req)}
                className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={16} />
                <span>Accept {req.is100KmOutstation ? '100+ km Trip' : 'Ride'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
