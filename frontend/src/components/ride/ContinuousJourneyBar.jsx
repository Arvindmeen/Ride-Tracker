import React from 'react';
import {
  MapPin, Flag, KeyRound, Copy, Check, Navigation,
  Clock, Zap, ShieldCheck, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDuration } from '@/utils/formatters';

export default function ContinuousJourneyBar({
  ride,
  status,
  activeDriverEta,
  activeDriverDistance,
  activeDriverSpeed,
  onCopyOtp,
  copiedOtp,
  onQuickFillOtp,
}) {
  const currentStatus = status || ride?.status || 'DRIVER_APPROACHING';
  const pickupName = ride?.pickup?.name || 'Pickup Spot';
  const destinationName = ride?.destination?.name || 'Destination Spot';
  const otp = ride?.otp || '4921';
  const driverName = ride?.driverInfo?.name || 'Vikram Singh';

  // Determine vehicle emoji
  const cat = String(ride?.category || ride?.driverInfo?.category || '').toUpperCase();
  const vehicleEmoji = cat.includes('AUTO') || cat.includes('TOTO')
    ? '🛺'
    : cat.includes('BIKE') || cat.includes('MOTO')
    ? '🏍️'
    : cat.includes('XL') || cat.includes('TRANSPORTER')
    ? '🚚'
    : '🚗';

  // Calculate smooth continuous progress percentage (0 to 100%)
  let progressPercent = 20;
  if (currentStatus === 'DRIVER_ASSIGNED') {
    progressPercent = 15;
  } else if (currentStatus === 'DRIVER_APPROACHING') {
    // Approaches from 15% to 45% based on remaining distance/eta
    const dist = typeof activeDriverDistance === 'number' ? activeDriverDistance : 0.28;
    const initialDist = 0.28;
    const ratio = Math.max(0, Math.min(1, 1 - dist / initialDist));
    progressPercent = Math.round(15 + ratio * 30);
  } else if (currentStatus === 'DRIVER_ARRIVED') {
    progressPercent = 45; // Exactly at the Pickup & OTP gate
  } else if (currentStatus === 'RIDE_STARTED') {
    // In transit from Pickup (45%) to Destination (95%)
    const totalDist = Number(ride?.distance) || 1.4;
    const distRemaining = typeof activeDriverDistance === 'number' ? activeDriverDistance : totalDist * 0.5;
    const ratio = Math.max(0, Math.min(1, 1 - distRemaining / totalDist));
    progressPercent = Math.round(45 + ratio * 50);
  } else if (currentStatus === 'RIDE_COMPLETED') {
    progressPercent = 100;
  }

  // Stage display info
  const stageInfo = {
    DRIVER_ASSIGNED: {
      badge: 'Driver Confirmed',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Driver Confirmed & En Route',
      desc: `Heading to your pickup spot at ${pickupName}`,
      pingColor: 'bg-blue-500',
    },
    DRIVER_APPROACHING: {
      badge: 'Driver Approaching',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Driver Approaching Pickup',
      desc: `Driver is ${formatDuration(activeDriverEta)} away · ${activeDriverDistance ?? 0.24} km`,
      pingColor: 'bg-amber-500',
    },
    DRIVER_ARRIVED: {
      badge: 'Driver Arrived',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      title: 'Driver Arrived at Pickup Spot',
      desc: 'Vehicle is parked outside. Share OTP to board and start ride.',
      pingColor: 'bg-emerald-500',
    },
    RIDE_STARTED: {
      badge: 'Ride in Progress',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Journey in Progress',
      desc: `En route to ${destinationName} · ${formatDuration(activeDriverEta)} remaining (${activeDriverDistance ?? 1.2} km)`,
      pingColor: 'bg-indigo-500',
    },
    RIDE_COMPLETED: {
      badge: 'Trip Completed',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      title: 'Safely Arrived at Destination',
      desc: `Welcome to ${destinationName}! Hope you enjoyed the ride.`,
      pingColor: 'bg-emerald-500',
    },
  }[currentStatus] || {
    badge: 'Active Ride',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Ride in Progress',
    desc: 'Connecting live telemetry...',
    pingColor: 'bg-blue-500',
  };

  const isAtPickupOrBefore = currentStatus === 'DRIVER_APPROACHING' || currentStatus === 'DRIVER_ASSIGNED' || currentStatus === 'DRIVER_ARRIVED';
  const isDriverArrived = currentStatus === 'DRIVER_ARRIVED';
  const isRideStarted = currentStatus === 'RIDE_STARTED' || currentStatus === 'RIDE_COMPLETED';

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4 font-sans transition-all">
      
      {/* ── 1. Top Live Stage Header with Real-time Telemetry ──────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative mt-1 shrink-0">
            <span className={clsx('animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full opacity-75', stageInfo.pingColor)} />
            <span className={clsx('relative inline-flex rounded-full h-3.5 w-3.5 ring-2 ring-white', stageInfo.pingColor)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                {stageInfo.title}
              </h1>
              <span className={clsx('text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-2xs', stageInfo.badgeColor)}>
                {stageInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-xs sm:max-w-md">
              {stageInfo.desc}
            </p>
          </div>
        </div>

        {/* Live Speed Badge */}
        {activeDriverSpeed > 0 && (
          <div className="shrink-0 text-right hidden sm:block">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
              <Zap size={11} className="text-amber-500 fill-amber-500" />
              <span>{activeDriverSpeed} km/h</span>
            </span>
          </div>
        )}
      </div>

      {/* ── 2. The Continuous Updated Animated Progress Bar ────────────────── */}
      <div className="pt-2 pb-1 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-0.5">
          <span className="flex items-center gap-1 text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Driver En Route</span>
          </span>
          <span className={clsx('transition-colors', isAtPickupOrBefore ? 'text-amber-700 font-extrabold' : 'text-slate-400')}>
            Pickup & Share OTP
          </span>
          <span className={clsx('transition-colors', isRideStarted ? 'text-emerald-700 font-extrabold' : 'text-slate-400')}>
            Destination Drop-off
          </span>
        </div>

        {/* The Continuous Track Container */}
        <div className="relative w-full h-3.5 sm:h-4 bg-slate-100 rounded-full p-0.5 border border-slate-200/90 shadow-inner overflow-visible">
          {/* Animated Gradient Fill Bar */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${Math.min(100, Math.max(8, progressPercent))}%` }}
          >
            {/* Shimmer light sweep running continuously through bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-flow" />
          </div>

          {/* Gliding Vehicle Marker Pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10 select-none pointer-events-none"
            style={{ left: `calc(${Math.min(96, Math.max(4, progressPercent))}% - 14px)` }}
          >
            {/* Floating Live Tooltip above moving pin */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md border border-slate-700 flex items-center gap-1 animate-float-subtle">
              <span>{currentStatus === 'DRIVER_ARRIVED' ? 'At Pickup' : currentStatus === 'RIDE_COMPLETED' ? 'Arrived' : `${activeDriverEta || 2}m`}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
            </div>

            {/* Moving Vehicle Disc (Front of vehicle points forward in direction of travel) */}
            <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-600 shadow-md shadow-indigo-500/25 flex items-center justify-center text-sm transform hover:scale-110 transition-transform">
              <span className="inline-block transform -scale-x-100">{vehicleEmoji}</span>
            </div>
          </div>

          {/* Milestone Waypoint Ticks on Track */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[45%] w-2 h-2 rounded-full bg-white border border-slate-300 shadow-xs pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 right-1 w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs pointer-events-none" />
        </div>
      </div>

      {/* ── 3. Journey Points: Starting Point & Destination Point ─────────── */}
      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          
          {/* Starting Journey Point */}
          <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Starting Point (Pickup)
                </span>
                {isDriverArrived && (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    Driver Here
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-900 truncate mt-0.5">
                {pickupName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Boarding location for this ride
              </p>
            </div>
          </div>

          {/* Destination Journey Point */}
          <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <Flag size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  Destination (Drop-off)
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-500">
                  {ride?.distance || 1.4} km
                </span>
              </div>
              <p className="font-bold text-slate-900 truncate mt-0.5">
                {destinationName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Final trip drop-off point
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. Explicit Animated OTP Asking Box ───────────────────────────── */}
      {currentStatus !== 'RIDE_COMPLETED' && (
        <div
          className={clsx(
            'p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden',
            isDriverArrived
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-emerald-400 shadow-md shadow-emerald-500/10'
              : isRideStarted
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 border-amber-300/80 shadow-2xs'
          )}
        >
          {/* Subtle animated background glow for arrived state */}
          {isDriverArrived && (
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none animate-pulse-subtle" />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <KeyRound
                  size={15}
                  className={clsx(
                    isDriverArrived ? 'text-emerald-700 animate-bounce' : isRideStarted ? 'text-slate-500' : 'text-amber-700'
                  )}
                />
                <span
                  className={clsx(
                    'text-[11px] font-black uppercase tracking-wider',
                    isDriverArrived ? 'text-emerald-900' : isRideStarted ? 'text-slate-600' : 'text-amber-900'
                  )}
                >
                  {isDriverArrived
                    ? 'Driver is Waiting! Share Ride OTP'
                    : isRideStarted
                    ? 'Ride Started · OTP Verified'
                    : 'Share Start OTP with Driver'}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {isDriverArrived
                  ? `Tell this 4-digit PIN to ${driverName} to verify and start your ride to ${destinationName}`
                  : isRideStarted
                  ? `OTP ${otp} confirmed with ${driverName}. Enjoy your smooth travel!`
                  : `Keep this 4-digit code ready. Share with ${driverName} when boarding.`}
              </p>
            </div>

            {/* OTP Pill & Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="flex items-center gap-1.5 bg-white border border-slate-300/90 shadow-2xs px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">OTP:</span>
                <span className="font-mono text-base font-black text-slate-950 tracking-wider">
                  {otp}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyOtp?.(otp)}
                  className="p-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer rounded-md hover:bg-slate-100"
                  title="Copy Start OTP"
                  aria-label="Copy OTP"
                >
                  {copiedOtp ? (
                    <Check size={14} className="text-emerald-600 animate-in zoom-in-75" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              {/* 1-Tap Quick Fill & Start Button for Arrived state */}
              {isDriverArrived && onQuickFillOtp && (
                <button
                  type="button"
                  onClick={onQuickFillOtp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="1-Tap verify OTP and start journey"
                >
                  <Zap size={13} className="fill-white" />
                  <span>1-Tap Start</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
