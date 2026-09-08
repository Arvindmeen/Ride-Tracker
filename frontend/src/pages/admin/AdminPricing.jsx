import { useState, useEffect } from 'react';
import { pricingService } from '@/services';
import { MOCK_GRID_CELLS, MOCK_PRICING_HISTORY } from '@/mock/pricing';
import { Spinner } from '@/components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { clsx } from 'clsx';
import { Zap, TrendingUp, Activity } from 'lucide-react';

function SurgeBar({ value }) {
  const pct = Math.min(((value - 1) / 2) * 100, 100);
  const color = value >= 2.5 ? '#f43f5e' : value >= 1.5 ? '#f97316' : value > 1 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={clsx('text-xs font-black font-mono w-8', value >= 2 ? 'text-rose-600' : value > 1 ? 'text-orange-500' : 'text-emerald-600')}>
        {value}x
      </span>
    </div>
  );
}

export default function AdminPricing() {
  const [selectedCell, setSelectedCell] = useState(MOCK_GRID_CELLS[0]);
  const [history, setHistory] = useState(MOCK_PRICING_HISTORY);

  useEffect(() => {
    pricingService.getPricingHistory(selectedCell.id).then(setHistory);
  }, [selectedCell.id]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Dynamic Pricing Engine</h1>
        <p className="text-sm text-slate-500 mt-0.5">Flink-powered surge pricing — demand/supply per H3 grid cell</p>
        <div className="mt-3 p-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <p className="text-xs font-semibold text-indigo-800">
            Pricing computed by Apache Flink streaming job — demand/supply ratio updated every 30 seconds per H3 grid cell
          </p>
        </div>
      </div>

      {/* Grid Cell Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Grid Cell Snapshot</h2>
          <p className="text-xs text-slate-500 mt-0.5">Current demand, supply and surge per zone — click a row to inspect</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Cell ID</th>
                <th>Demand</th>
                <th>Supply</th>
                <th>Active Rides</th>
                <th>Avail. Drivers</th>
                <th>Avg ETA</th>
                <th>D/S Ratio</th>
                <th>Surge</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GRID_CELLS.map(cell => (
                <tr
                  key={cell.id}
                  className={clsx('cursor-pointer', selectedCell.id === cell.id && 'bg-indigo-50 border-l-4 border-l-indigo-500')}
                  onClick={() => setSelectedCell(cell)}
                >
                  <td>
                    <span className="font-bold text-slate-900">{cell.zone}</span>
                    {selectedCell.id === cell.id && <span className="ml-2 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">Selected</span>}
                  </td>
                  <td>
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-mono">{cell.id}</code>
                  </td>
                  <td><span className="font-mono font-bold text-slate-800">{cell.demand}</span></td>
                  <td><span className="font-mono font-bold text-slate-800">{cell.supply}</span></td>
                  <td><span className="text-sm font-semibold text-slate-700">{cell.activeRides}</span></td>
                  <td><span className="text-sm font-semibold text-slate-700">{cell.availableDrivers}</span></td>
                  <td><span className="text-sm text-slate-600">{cell.avgETA} min</span></td>
                  <td>
                    <span className={clsx('font-mono font-black text-sm', cell.ratio > 2 ? 'text-rose-600' : cell.ratio > 1.3 ? 'text-orange-500' : 'text-emerald-600')}>
                      {cell.ratio.toFixed(2)}x
                    </span>
                  </td>
                  <td className="w-32 min-w-[120px]"><SurgeBar value={cell.surge} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-0.5">Demand vs Supply — {selectedCell.zone}</p>
          <p className="text-xs text-slate-400 mb-4">Last 24 hours per-hour analysis</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={h => `${h}:00`} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="demand" name="Demand" stroke="#f43f5e" strokeWidth={2} fill="url(#demandGrad)" />
              <Area type="monotone" dataKey="supply" name="Supply" stroke="#10b981" strokeWidth={2} fill="url(#supplyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-0.5">Surge Multiplier — {selectedCell.zone}</p>
          <p className="text-xs text-slate-400 mb-4">Flink output — last 24 hours</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="surgeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[1, 3]} />
              <Tooltip labelFormatter={h => `${h}:00`} formatter={v => [`${v}x`, 'Surge']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="surge" name="Surge" stroke="#f59e0b" strokeWidth={2.5} fill="url(#surgeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-indigo-500" />
          <p className="text-sm font-bold text-slate-900">Flink Pricing Pipeline Architecture</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { label: 'Kafka: ride.requested',        color: 'bg-blue-50 text-blue-700 border border-blue-200' },
            { label: '→', color: '' },
            { label: 'Kafka: driver.gps',            color: 'bg-blue-50 text-blue-700 border border-blue-200' },
            { label: '→', color: '' },
            { label: 'Flink Tumbling Window (30s)',   color: 'bg-violet-50 text-violet-700 border border-violet-200' },
            { label: '→', color: '' },
            { label: 'Demand / Supply Ratio',        color: 'bg-slate-100 text-slate-700 border border-slate-200' },
            { label: '→', color: '' },
            { label: 'Surge Formula',                color: 'bg-orange-50 text-orange-700 border border-orange-200' },
            { label: '→', color: '' },
            { label: 'Redis HSET surge:multipliers', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
            { label: '→', color: '' },
            { label: 'Kafka: pricing.updated',       color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
            { label: '→', color: '' },
            { label: 'WebSocket broadcast',          color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
          ].map((item, i) => (
            item.color
              ? <span key={i} className={`px-2.5 py-1 rounded-xl font-semibold ${item.color}`}>{item.label}</span>
              : <span key={i} className="text-slate-400 font-bold">{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
