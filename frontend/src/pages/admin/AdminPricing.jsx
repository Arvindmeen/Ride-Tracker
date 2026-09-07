import { useState, useEffect } from 'react';
import { pricingService } from '@/services';
import { MOCK_GRID_CELLS, MOCK_PRICING_HISTORY } from '@/mock/pricing';
import { Card, Spinner, SectionHeader, Badge } from '@/components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { clsx } from 'clsx';
import { Zap } from 'lucide-react';

function SurgeBar({ value }) {
  const pct = Math.min(((value - 1) / 2) * 100, 100);
  const color = value >= 2.5 ? 'bg-red-500' : value >= 1.5 ? 'bg-orange-400' : value > 1 ? 'bg-yellow-400' : 'bg-green-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
        <div className={clsx('h-1.5 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={clsx('text-xs font-bold font-mono w-8', value >= 2 ? 'text-red-600' : value > 1 ? 'text-orange-500' : 'text-green-600')}>
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
    <div className="p-5 space-y-6">
      <div>
        <SectionHeader title="Dynamic Pricing Engine" subtitle="Flink-powered surge pricing — demand/supply analysis per grid cell" />
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center gap-2">
          <Zap size={13} />
          Pricing computed by Apache Flink streaming job — demand/supply ratio updated every 30 seconds per H3 grid cell
        </div>
      </div>

      {/* Grid cells */}
      <Card>
        <SectionHeader title="Grid Cell Snapshot" subtitle="Current demand, supply, and surge per zone" className="mb-4" />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th><th>Cell ID</th><th>Demand</th><th>Supply</th><th>Active Rides</th><th>Avail. Drivers</th><th>Avg ETA</th><th>D/S Ratio</th><th>Surge</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GRID_CELLS.map(cell => (
                <tr key={cell.id} className={clsx('cursor-pointer', selectedCell.id === cell.id && 'bg-blue-50')}
                  onClick={() => setSelectedCell(cell)}>
                  <td className="font-medium text-slate-900">{cell.zone}</td>
                  <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{cell.id}</code></td>
                  <td><span className="font-mono font-semibold text-slate-800">{cell.demand}</span></td>
                  <td><span className="font-mono font-semibold text-slate-800">{cell.supply}</span></td>
                  <td>{cell.activeRides}</td>
                  <td>{cell.availableDrivers}</td>
                  <td>{cell.avgETA} min</td>
                  <td>
                    <span className={clsx('font-mono font-bold text-sm', cell.ratio > 2 ? 'text-red-600' : cell.ratio > 1.3 ? 'text-orange-500' : 'text-green-600')}>
                      {cell.ratio.toFixed(2)}x
                    </span>
                  </td>
                  <td className="w-32"><SurgeBar value={cell.surge} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected cell history */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-1">Demand vs Supply — {selectedCell.zone}</p>
          <p className="text-xs text-slate-500 mb-4">Last 24 hours</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={h => `${h}:00`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="demand" name="Demand" stroke="#dc2626" strokeWidth={2} fill="url(#demandGrad)" />
              <Area type="monotone" dataKey="supply" name="Supply" stroke="#16a34a" strokeWidth={2} fill="url(#supplyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-1">Surge Multiplier — {selectedCell.zone}</p>
          <p className="text-xs text-slate-500 mb-4">Flink output — last 24 hours</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="surgeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/><stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[1, 3]} />
              <Tooltip labelFormatter={h => `${h}:00`} formatter={v => [`${v}x`, 'Surge']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="surge" name="Surge" stroke="#d97706" strokeWidth={2.5} fill="url(#surgeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Flink pipeline explainer */}
      <Card className="border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-4">Flink Pricing Pipeline Architecture</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { label: 'Kafka: ride.requested', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: '→', color: '' },
            { label: 'Kafka: driver.gps', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: '→', color: '' },
            { label: 'Flink Tumbling Window (30s)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: '→', color: '' },
            { label: 'Demand / Supply Ratio', color: 'bg-slate-50 text-slate-700 border-slate-200' },
            { label: '→', color: '' },
            { label: 'Surge Formula', color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: '→', color: '' },
            { label: 'Redis HSET surge:multipliers', color: 'bg-red-50 text-red-700 border-red-200' },
            { label: '→', color: '' },
            { label: 'Kafka: pricing.updated', color: 'bg-green-50 text-green-700 border-green-200' },
            { label: '→', color: '' },
            { label: 'WebSocket broadcast', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          ].map((item, i) => (
            item.color ? (
              <span key={i} className={`px-2 py-1 rounded-lg border font-medium ${item.color}`}>{item.label}</span>
            ) : (
              <span key={i} className="text-slate-400 font-bold">{item.label}</span>
            )
          ))}
        </div>
      </Card>
    </div>
  );
}
