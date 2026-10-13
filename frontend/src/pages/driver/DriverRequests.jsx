import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore, useMapStore } from '@/stores';
import { Card, Spinner, VehicleIcon } from '@/components/ui';
import { CheckCircle, XCircle, MapPin, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

// Realistic mock requests with Proximity to Driver matching
const DEMO_REQUESTS = [
  {
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
    pickupDistanceToDriver: 0.3,
    pickupEtaMins: 1,
    is100KmOutstation: false,
    category: 'MOTO',
    surgeMultiplier: 1.0,
    requestedAt: new Date().toISOString(),
  },
];

export default function DriverRequests() {
  const { status, pendingRequests, acceptRide, clearRequests, removeRequest, addRequest } = useDriverStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({});

  // Load demo requests when driver is available and queue is empty
  useEffect(() => {
    if (pendingRequests.length === 0 && status !== 'OFFLINE') {
      const timer = setTimeout(() => {
        DEMO_REQUESTS.forEach((r, i) => setTimeout(() => addRequest(r), i * 1200));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []); // run once on mount — requests auto-appear after driver goes online

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
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center font-sans">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-4xl border border-slate-200 shadow-2xs">
          🚗
        </div>
        <h2 className="text-xl font-black text-slate-900">You're Offline</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium">
          Go online from your cockpit to start receiving proximity ride requests.
        </p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="mt-5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          Open Cockpit → Go Online
        </button>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center font-sans">
        {/* Animated pulse radar */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-ping delay-150" />
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900">Scanning for Nearby Rides</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium">
          Proximity engine active · Receiving requests where passenger is within 5 km of your GPS
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => DEMO_REQUESTS.forEach((r) => addRequest(r))}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 font-bold transition-all cursor-pointer shadow-2xs"
          >
            Reload Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-4 font-sans text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900">Incoming Ride Queue</h1>
          <p className="text-xs text-slate-500 font-medium">Filtered strictly by driver proximity (Closest to pickup)</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
          {pendingRequests.length} nearby requests
        </span>
      </div>

      {pendingRequests.map(req => {
        const secs = countdown[req.id] ?? 30;
        return (
          <div
            key={req.id}
            className={clsx(
              'bg-white rounded-3xl border-2 p-5 shadow-2xs transition-all',
              secs <= 8 ? 'border-red-400 bg-red-50/20' : 'border-slate-200 hover:border-emerald-400',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                  <VehicleIcon category={req.category} size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{req.userName}</p>
                    {req.is100KmOutstation && (
                      <span className="text-[10px] font-black bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        100+ km Outstation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 font-bold">★ {req.userRating} · Verified Passenger</p>
                </div>
              </div>
              <div className={clsx(
                'text-xs font-black font-mono px-2.5 py-1 rounded-lg flex items-center gap-1',
                secs <= 8 ? 'bg-red-50 text-red-700 animate-pulse border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200',
              )}>
                <span>{secs}s</span>
              </div>
            </div>

            {/* Proximity Match Guarantee Badge */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-2.5 mb-3 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold text-slate-900">Closest Driver Match: </span>
                <span>User is only <strong className="text-emerald-700">{req.pickupDistanceToDriver || 0.7} km away</strong> ({req.pickupEtaMins || 2} mins to pickup).</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-emerald-50/60 rounded-2xl p-2.5 border border-emerald-200">
                <p className="text-xl font-black text-emerald-700">₹{req.estimatedFare}</p>
                <p className="text-[10px] text-emerald-800 font-bold">
                  Net: ₹{Math.round(req.estimatedFare * 0.88)} (UPI)
                </p>
              </div>
              <div className="bg-blue-50/60 rounded-2xl p-2.5 border border-blue-200">
                <p className="text-lg font-black text-blue-700">{req.pickupDistanceToDriver || 0.7} km</p>
                <p className="text-[10px] text-blue-800 font-bold">To Pickup</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                <p className="text-lg font-black text-slate-900">{req.estimatedDistance} km</p>
                <p className="text-[10px] text-slate-500 font-bold">Trip Distance</p>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-semibold">
              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-blue-600 text-[10px] font-bold">PICKUP (NEAR YOU):</p>
                  <p className="font-bold text-slate-900">{req.pickup.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-rose-600 text-[10px] font-bold">DESTINATION:</p>
                  <p className="font-bold text-slate-900">{req.destination.name}</p>
                </div>
              </div>
            </div>

            {/* Accept / Pass Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => removeRequest(req.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Pass
              </button>
              <button
                onClick={() => handleAcceptTrip(req)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>Accept {req.is100KmOutstation ? 'Outstation Trip' : 'Ride'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

