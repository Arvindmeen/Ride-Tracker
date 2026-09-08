import { useState, useEffect } from 'react';
import { rideService } from '@/services';
import { Spinner, EmptyState, Badge } from '@/components/ui';
import { Zap, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const STATUS_CONFIG = {
  RIDE_STARTED:       { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
  DRIVER_APPROACHING: { label: 'Approaching', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  DRIVER_ASSIGNED:    { label: 'Assigned',    cls: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  DRIVER_ARRIVED:     { label: 'Arrived',     cls: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  RIDE_COMPLETED:     { label: 'Completed',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED:          { label: 'Cancelled',   cls: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500' },
  SEARCHING:          { label: 'Searching',   cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400' },
};

const FILTERS = ['ALL', 'RIDE_STARTED', 'DRIVER_APPROACHING', 'RIDE_COMPLETED', 'CANCELLED'];

export default function AdminRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    rideService.getRides().then(r => { setRides(r); setLoading(false); });
  }, []);

  const filtered = filter === 'ALL' ? rides : rides.filter(r => r.status === filter);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="xl" className="text-indigo-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Rides & Telemetry</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rides.length} total rides in system</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">Live Dispatch Active</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const cfg = STATUS_CONFIG[f];
          const count = f === 'ALL' ? rides.length : rides.filter(r => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border',
                filter === f
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              {cfg && <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
              {f === 'ALL' ? 'All Rides' : cfg?.label || f}
              <span className={clsx('px-1.5 py-0.5 rounded-full text-[10px] font-black', filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>Passenger</th>
                <th>Route</th>
                <th>Category</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No rides match this filter</td></tr>
              ) : filtered.map(ride => {
                const cfg = STATUS_CONFIG[ride.status] || { label: ride.status, cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
                return (
                  <tr key={ride.id}>
                    <td>
                      <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{ride.id}</code>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-slate-800">{ride.userId}</span>
                    </td>
                    <td>
                      <div className="space-y-0.5 max-w-40">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span className="truncate">{ride.pickup?.name || ride.pickup?.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                          <span className="truncate">{ride.destination?.name || ride.destination?.address}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                        {ride.category}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-black text-slate-900">₹{ride.fare.total.toFixed(0)}</span>
                    </td>
                    <td>
                      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', cfg.cls)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(ride.requestedAt), { addSuffix: true })}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
