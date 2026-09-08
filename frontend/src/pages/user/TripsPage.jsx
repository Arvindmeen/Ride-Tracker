import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, ArrowRight, Plus, Search, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { rideService } from '@/services';
import { useAuthStore } from '@/stores';
import { Spinner, EmptyState, Badge, Button, VehicleIcon } from '@/components/ui';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  RIDE_COMPLETED:     { label: 'Completed',   color: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:          { label: 'Cancelled',   color: 'bg-rose-500',    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  RIDE_STARTED:       { label: 'In Progress', color: 'bg-blue-500',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  DRIVER_APPROACHING: { label: 'Active Pick', color: 'bg-blue-500',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const FILTERS = [
  { value: 'ALL',       label: 'All Trips' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ACTIVE',    label: 'Active'    },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function TripsPage() {
  const { user } = useAuthStore();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    rideService.getUserRides(user?.id || 'U001').then((r) => {
      setRides(r);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = filter === 'ALL' ? rides : rides.filter((r) => {
    if (filter === 'COMPLETED') return r.status === 'RIDE_COMPLETED';
    if (filter === 'CANCELLED') return r.status === 'CANCELLED';
    if (filter === 'ACTIVE') return ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(r.status);
    return true;
  });

  const counts = {
    ALL: rides.length,
    COMPLETED: rides.filter((r) => r.status === 'RIDE_COMPLETED').length,
    ACTIVE: rides.filter((r) => ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(r.status)).length,
    CANCELLED: rides.filter((r) => r.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-20 space-y-6">
      
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
            Ride History & Receipts
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            My Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {rides.length} trips recorded · Transparent e-receipts & live tracking
          </p>
        </div>

        <Link to="/app/home" className="shrink-0">
          <Button className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus size={15} />
            <span>Book New Ride</span>
          </Button>
        </Link>
      </div>

      {/* ── Filter Tabs (Touch scrollable, no ugly scrollbar) ───────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0',
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{f.label}</span>
              {counts[f.value] > 0 && (
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-black',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {counts[f.value]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Trip List Cards ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No trips found"
          description="You haven't taken any trips under this category yet. Book your first ride with Veloq!"
          action={
            <Link to="/app/home">
              <Button className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
                Book a Ride Now →
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ride) => {
            const cfg = STATUS_CONFIG[ride.status] || {
              label: ride.status,
              color: 'bg-slate-400',
              badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
            };
            const isActive = ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(
              ride.status
            );

            return (
              <Link
                key={ride.id}
                to={isActive ? `/app/ride/${ride.id}` : `/app/trips/${ride.id}`}
                className="block group"
              >
                <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3.5">
                  
                  {/* Top Card Bar: Vehicle Icon, Category, Status, Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {/* Scalable Real Vehicle SVG Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shrink-0 group-hover:border-blue-200 transition-colors">
                        <VehicleIcon category={ride.category} size="md" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {ride.category} Ride
                          </h3>
                          {ride.userRating && (
                            <span className="text-[11px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              ★ {ride.userRating}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          <span>
                            {ride.completedAt
                              ? format(new Date(ride.completedAt), 'MMM d, yyyy · h:mm a')
                              : format(new Date(ride.requestedAt), 'MMM d, yyyy · h:mm a')}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill & Upfront Fare */}
                    <div className="text-right shrink-0">
                      <p className="text-base sm:text-lg font-black text-slate-900">
                        ₹{typeof ride.fare === 'object' ? Math.round(ride.fare.total) : ride.fare}
                      </p>
                      <span
                        className={clsx(
                          'inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5',
                          cfg.badgeClass
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="relative pl-6 space-y-2.5 text-xs">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-600 to-rose-600" />
                    
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <p className="text-slate-800 font-bold truncate">
                        <span className="text-[10px] font-extrabold uppercase text-blue-600 mr-1.5">Pickup:</span>
                        {ride.pickup?.name || ride.pickup?.address}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-xs" />
                      <p className="text-slate-800 font-bold truncate">
                        <span className="text-[10px] font-extrabold uppercase text-rose-600 mr-1.5">Drop:</span>
                        {ride.destination?.name || ride.destination?.address}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer: Distance, Duration, and View Receipt CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {ride.distance && <span>{ride.distance} km</span>}
                      {ride.durationMinutes && (
                        <>
                          <span>·</span>
                          <span>{ride.durationMinutes} mins</span>
                        </>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform text-xs">
                      {isActive ? 'Live Ride Tracking' : 'Trip Receipt & Details'}
                      <ChevronRight size={14} />
                    </span>
                  </div>

                  {/* Active Ride Banner */}
                  {isActive && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-2xl text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                          <span>Active trip in progress · Tap to view live map</span>
                        </div>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  )}

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
