import { useState, useEffect } from 'react';
import { analyticsService } from '@/services';
import { StatCard, Spinner } from '@/components/ui';
import { TrendingUp, DollarSign, Users, Clock, XCircle, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { clsx } from 'clsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0891b2'];

const STAT_CONFIGS = [
  { key: 'totalRides',       label: 'Total Rides',    icon: Activity,   gradient: 'indigo', format: v => v.toLocaleString() },
  { key: 'revenue',          label: 'GMV Revenue',    icon: DollarSign, gradient: 'emerald', format: v => `₹${(v/100000).toFixed(1)}L` },
  { key: 'activeUsers',      label: 'Active Users',   icon: Users,      gradient: 'blue',   format: v => v.toLocaleString() },
  { key: 'avgETA',           label: 'Avg ETA',        icon: Clock,      gradient: 'amber',  format: v => `${v} min` },
  { key: 'cancellationRate', label: 'Cancel Rate',    icon: XCircle,    gradient: 'rose',   format: v => `${v}%` },
];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    analyticsService.getSummary().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="xl" className="text-indigo-500" />
    </div>
  );

  const rideData = data.rideVolume.slice(-period);
  const revenueData = data.revenue.slice(-period);
  const cancelData = data.cancellationRate.slice(-period);
  const etaData = data.avgETA.slice(-period);

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial & operational performance metrics</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[7, 14, 30].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CONFIGS.map(({ key, label, icon, gradient, format }) => (
          <StatCard
            key={key}
            label={label}
            value={format(data.todayStats[key])}
            icon={icon}
            gradient={gradient}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Ride Volume */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">Ride Volume</p>
          <p className="text-xs text-slate-400 mb-4">Trips dispatched per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={rideData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(rideData.length / 5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="value" name="Rides" stroke="#4f46e5" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">Revenue (₹)</p>
          <p className="text-xs text-slate-400 mb-4">Gross merchandise value per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(revenueData.length / 5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">Cancellation Rate</p>
          <p className="text-xs text-slate-400 mb-4">% of rides cancelled by users or drivers</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cancelData}>
              <defs>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(cancelData.length / 5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => [`${v}%`, 'Cancel Rate']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="value" name="Cancel Rate" stroke="#f43f5e" strokeWidth={2.5} fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Avg ETA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">Average ETA</p>
          <p className="text-xs text-slate-400 mb-4">Minutes from request to driver arrival</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={etaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(etaData.length / 5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip formatter={v => [`${v} min`, 'Avg ETA']} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" name="ETA" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      {data.categoryBreakdown && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">Ride Category Mix</p>
          <p className="text-xs text-slate-400 mb-5">Share of rides by vehicle category</p>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.categoryBreakdown} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {data.categoryBreakdown.map((item, i) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
