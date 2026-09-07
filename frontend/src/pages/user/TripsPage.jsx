import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Star, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { rideService } from '@/services';
import { useAuthStore } from '@/stores';
import { Card, Spinner, EmptyState, Badge } from '@/components/ui';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  RIDE_COMPLETED: { label: 'Completed', cls: 'green' },
  CANCELLED: { label: 'Cancelled', cls: 'red' },
  RIDE_STARTED: { label: 'In Progress', cls: 'blue' },
  DRIVER_APPROACHING: { label: 'Active', cls: 'blue' },
};

export default function TripsPage() {
  const { user } = useAuthStore();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    rideService.getUserRides(user?.id || 'U001').then(r => {
      setRides(r);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = filter === 'ALL' ? rides : rides.filter(r => {
    if (filter === 'COMPLETED') return r.status === 'RIDE_COMPLETED';
    if (filter === 'CANCELLED') return r.status === 'CANCELLED';
    if (filter === 'ACTIVE') return ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(r.status);
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-slate-900">My Trips</h1>
        <Badge variant="default">{rides.length} total</Badge>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-5 bg-slate-100 p-1 rounded-xl">
        {['ALL', 'COMPLETED', 'CANCELLED', 'ACTIVE'].map(f => (
          <button key={f}
            className={clsx('flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all', filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}
            onClick={() => setFilter(f)}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No trips yet" description="Book your first ride to see it here" action={<Link to="/app/home"><button className="text-blue-600 text-sm font-medium">Book a ride →</button></Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(ride => {
            const cfg = STATUS_CONFIG[ride.status] || { label: ride.status, cls: 'default' };
            const isActive = ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(ride.status);
            return (
              <Link key={ride.id} to={isActive ? `/app/ride/${ride.id}` : `/app/trips/${ride.id}`}>
                <Card className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {ride.category === 'ECONOMY' ? '🚗' : ride.category === 'PREMIUM' ? '🏎️' : ride.category === 'XL' ? '🚌' : ride.category === 'MOTO' ? '🏍️' : '🛺'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={cfg.cls}>{cfg.label}</Badge>
                        <span className="text-xs text-slate-500">{ride.category}</span>
                        {ride.userRating && <span className="text-xs text-amber-500">★{ride.userRating}</span>}
                      </div>
                      <div className="flex items-start gap-1.5 text-sm text-slate-700 mb-0.5">
                        <MapPin size={11} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{ride.pickup.name || ride.pickup.address}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-sm text-slate-700">
                        <MapPin size={11} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{ride.destination.name || ride.destination.address}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Clock size={11} />
                        <span>{ride.completedAt ? format(new Date(ride.completedAt), 'MMM d, h:mm a') : format(new Date(ride.requestedAt), 'MMM d, h:mm a')}</span>
                        {ride.distance && <><span>·</span><span>{ride.distance} km</span></>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">₹{ride.fare.total.toFixed(0)}</p>
                      <ChevronRight size={14} className="text-slate-400 ml-auto mt-2" />
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full pulse" />
                        Tap to track your ride
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
