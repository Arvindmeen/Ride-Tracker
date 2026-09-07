import { useState, useEffect } from 'react';
import { rideService } from '@/services';
import { Card, Spinner, SectionHeader, Badge, EmptyState } from '@/components/ui';
import { Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const STATUS_CONFIG = {
  RIDE_STARTED: { label: 'In Progress', cls: 'blue' },
  DRIVER_APPROACHING: { label: 'Approaching', cls: 'blue' },
  DRIVER_ASSIGNED: { label: 'Assigned', cls: 'blue' },
  DRIVER_ARRIVED: { label: 'Arrived', cls: 'orange' },
  RIDE_COMPLETED: { label: 'Completed', cls: 'green' },
  CANCELLED: { label: 'Cancelled', cls: 'red' },
  SEARCHING: { label: 'Searching', cls: 'yellow' },
};

export default function AdminRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    rideService.getRides().then(r => { setRides(r); setLoading(false); });
  }, []);

  const filtered = filter === 'ALL' ? rides : rides.filter(r => r.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  return (
    <div className="p-5 space-y-5">
      <SectionHeader title="Ride Management" subtitle={`${rides.length} total rides`} />

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'RIDE_STARTED', 'DRIVER_APPROACHING', 'RIDE_COMPLETED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label || f}
            {f !== 'ALL' && <span className="ml-1">({rides.filter(r => r.status === f).length})</span>}
          </button>
        ))}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Ride ID</th><th>User</th><th>Pickup</th><th>Destination</th><th>Category</th><th>Fare</th><th>Status</th><th>Requested</th></tr></thead>
            <tbody>
              {filtered.map(ride => {
                const cfg = STATUS_CONFIG[ride.status] || { label: ride.status, cls: 'default' };
                return (
                  <tr key={ride.id}>
                    <td><code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{ride.id}</code></td>
                    <td className="font-medium text-slate-900">{ride.userId}</td>
                    <td className="text-slate-600 max-w-32 truncate">{ride.pickup.name || ride.pickup.address}</td>
                    <td className="text-slate-600 max-w-32 truncate">{ride.destination.name || ride.destination.address}</td>
                    <td><Badge>{ride.category}</Badge></td>
                    <td className="font-semibold">₹{ride.fare.total.toFixed(0)}</td>
                    <td><Badge variant={cfg.cls}>{cfg.label}</Badge></td>
                    <td className="text-slate-500 text-xs">{formatDistanceToNow(new Date(ride.requestedAt), { addSuffix: true })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
