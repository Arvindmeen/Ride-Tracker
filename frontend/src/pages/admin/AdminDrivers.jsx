import { useState, useEffect } from 'react';
import { driverService } from '@/services';
import { Spinner, Avatar, StatusDot, ProgressBar } from '@/components/ui';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CFG = {
  AVAILABLE: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ON_RIDE:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  OFFLINE:   { cls: 'bg-slate-100 text-slate-500 border-slate-200',  dot: 'bg-slate-400' },
  ARRIVING:  { cls: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
};

const FILTERS = ['ALL', 'AVAILABLE', 'ON_RIDE', 'OFFLINE'];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    driverService.getDrivers().then(d => { setDrivers(d); setLoading(false); });
  }, []);

  const filtered = drivers
    .filter(d => filter === 'ALL' || d.status === filter)
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.vehicle?.plate?.includes(search));

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="xl" className="text-indigo-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Driver Audits</h1>
          <p className="text-sm text-slate-500 mt-0.5">{drivers.length} registered driver partners</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or plate…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 w-56 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const count = f === 'ALL' ? drivers.length : drivers.filter(d => d.status === f).length;
          const cfg = STATUS_CFG[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                filter === f
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
              )}
            >
              {cfg && <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
              {f === 'ALL' ? 'All Drivers' : f.replace('_', ' ')}
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
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Today Rides</th>
                <th>Today Earnings</th>
                <th>Performance</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No drivers match</td></tr>
              ) : filtered.map(driver => {
                const cfg = STATUS_CFG[driver.status] || STATUS_CFG.OFFLINE;
                const hasExpiredDoc = driver.documents?.some(d => d.status === 'EXPIRED');
                const hasPendingDoc = driver.documents?.some(d => d.status === 'PENDING');
                const perfColor = driver.performanceScore >= 90 ? 'emerald' : driver.performanceScore >= 70 ? 'amber' : 'rose';
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={driver.name} size="sm" ring />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-slate-800">{driver.vehicle.make} {driver.vehicle.model}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded-md inline-block">{driver.vehicle.plate}</p>
                    </td>
                    <td>
                      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', cfg.cls)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {driver.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-bold text-amber-500">★ {driver.rating?.toFixed(1)}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-sm font-bold text-slate-800">{driver.todayRides}</span>
                    </td>
                    <td>
                      <span className="text-sm font-black text-slate-900">₹{driver.todayEarnings?.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={driver.performanceScore} color={perfColor} className="w-16" />
                        <span className="text-xs font-bold text-slate-600">{driver.performanceScore}</span>
                      </div>
                    </td>
                    <td>
                      {hasExpiredDoc
                        ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">⚠ Expired</span>
                        : hasPendingDoc
                          ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Pending</span>
                          : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ OK</span>
                      }
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
