import { useState, useEffect } from 'react';
import { driverService } from '@/services';
import { Card, Spinner, SectionHeader, Badge, Avatar, Rating, StatusDot } from '@/components/ui';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    driverService.getDrivers().then(d => { setDrivers(d); setLoading(false); });
  }, []);

  const filtered = filter === 'ALL' ? drivers : drivers.filter(d => d.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  const statusCls = { AVAILABLE: 'green', ON_RIDE: 'yellow', OFFLINE: 'default', ARRIVING: 'blue' };

  return (
    <div className="p-5 space-y-5">
      <SectionHeader title="Driver Management" subtitle={`${drivers.length} drivers registered`} />

      <div className="flex gap-2">
        {['ALL', 'AVAILABLE', 'ON_RIDE', 'OFFLINE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {f === 'ALL' ? `All (${drivers.length})` : `${f.replace('_', ' ')} (${drivers.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Driver</th><th>Vehicle</th><th>Category</th><th>Status</th><th>Rating</th><th>Today Rides</th><th>Today Earnings</th><th>Performance</th><th>Documents</th></tr></thead>
            <tbody>
              {filtered.map(driver => {
                const hasExpiredDoc = driver.documents?.some(d => d.status === 'EXPIRED');
                const hasPendingDoc = driver.documents?.some(d => d.status === 'PENDING');
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={driver.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 whitespace-nowrap">{driver.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-slate-800">{driver.vehicle.make} {driver.vehicle.model}</p>
                      <p className="text-xs font-mono text-slate-500">{driver.vehicle.plate}</p>
                    </td>
                    <td><Badge>{driver.vehicle.category}</Badge></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={driver.status} />
                        <Badge variant={statusCls[driver.status] || 'default'}>{driver.status.replace('_', ' ')}</Badge>
                      </div>
                    </td>
                    <td><Rating value={driver.rating} /></td>
                    <td className="text-center font-semibold text-slate-800">{driver.todayRides}</td>
                    <td className="font-semibold text-slate-800">₹{driver.todayEarnings.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full">
                          <div className={clsx('h-1.5 rounded-full', driver.performanceScore >= 90 ? 'bg-green-500' : driver.performanceScore >= 70 ? 'bg-yellow-400' : 'bg-red-500')}
                            style={{ width: `${driver.performanceScore}%` }} />
                        </div>
                        <span className="text-xs font-mono text-slate-600">{driver.performanceScore}</span>
                      </div>
                    </td>
                    <td>
                      {hasExpiredDoc ? <Badge variant="red">Expired</Badge> : hasPendingDoc ? <Badge variant="yellow">Pending</Badge> : <Badge variant="green">OK</Badge>}
                    </td>
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
