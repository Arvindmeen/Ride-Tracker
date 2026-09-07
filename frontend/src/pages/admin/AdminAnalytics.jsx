import { useState, useEffect } from 'react';
import { analyticsService } from '@/services';
import { Card, Spinner, SectionHeader, Badge } from '@/components/ui';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#1a56db', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#0891b2'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    analyticsService.getSummary().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  const rideData = data.rideVolume.slice(-period);
  const revenueData = data.revenue.slice(-period);
  const cancelData = data.cancellationRate.slice(-period);
  const etaData = data.avgETA.slice(-period);

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Platform Analytics" subtitle="Historical performance metrics" />
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[7, 14, 30].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Rides', value: data.todayStats.totalRides.toLocaleString() },
          { label: 'Revenue', value: `₹${(data.todayStats.revenue / 100000).toFixed(1)}L` },
          { label: 'Active Users', value: data.todayStats.activeUsers.toLocaleString() },
          { label: 'Avg ETA', value: `${data.todayStats.avgETA} min` },
          { label: 'Cancel Rate', value: `${data.todayStats.cancellationRate}%` },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Ride volume */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Ride Volume</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={rideData}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a56db" stopOpacity={0.15}/><stop offset="95%" stopColor="#1a56db" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(rideData.length / 6)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" name="Rides" stroke="#1a56db" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Revenue (₹)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(revenueData.length / 6)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#16a34a" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Cancellation rate */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Cancellation Rate (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cancelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(cancelData.length / 6)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 15]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" name="Cancel %" stroke="#dc2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Peak hours */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Demand by Hour (Today)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" name="Rides" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category breakdown */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Rides by Category</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.categoryBreakdown} dataKey="rides" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, share }) => `${category} ${share}%`} labelLine={false}>
                {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Region table */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 mb-4">Revenue by Region</p>
          <div className="space-y-2">
            {data.demandByRegion.map((r, i) => {
              const maxRev = Math.max(...data.demandByRegion.map(x => x.revenue));
              return (
                <div key={r.region} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4 font-mono">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{r.region}</span>
                      <span className="text-slate-600">₹{r.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-1.5 rounded-full" style={{ width: `${(r.revenue / maxRev) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
