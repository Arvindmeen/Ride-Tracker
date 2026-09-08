import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Zap, Users, DollarSign, Clock, TrendingDown, AlertTriangle,
  ArrowRight, Activity, ShieldCheck, Phone, MapPin, Radio, Compass,
  CheckCircle2, Flame, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsService, incidentService } from '@/services';
import { useAdminStore, useMapStore } from '@/stores';
import { StatCard, Card, Spinner, SeverityBadge, SectionHeader, StatusDot, Badge, VehicleIcon } from '@/components/ui';

export default function AdminDashboard() {
  const { stats, hotspots } = useAdminStore();
  const [analytics, setAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startSimulation, drivers } = useMapStore();

  const [privateContactTarget, setPrivateContactTarget] = useState(null);

  useEffect(() => {
    startSimulation();
    Promise.all([analyticsService.getSummary(), incidentService.getIncidents()]).then(([a, inc]) => {
      setAnalytics(a);
      setIncidents(inc.filter(i => i.status !== 'RESOLVED').slice(0, 5));
      setLoading(false);
    });
  }, [startSimulation]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="xl" /></div>;

  const rideData = analytics?.rideVolume?.slice(-14) || [];
  const revenueData = analytics?.revenue?.slice(-14) || [];
  const combined = rideData.map((r, i) => ({ ...r, revenue: revenueData[i]?.value || 0 }));

  return (
    <div className="p-5 sm:p-7 space-y-7 font-sans text-slate-900 bg-slate-50 min-h-screen">
      {/* ── Top Operations Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pan-India Fleet Operations</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Admin Master Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live telemetry across IIT Kharagpur campus, tier-1 metros, and Indian regional hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/live-map"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Radio size={14} className="animate-spin" />
            <span>Open Pan-India Live Map Radar</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
            <StatusDot status="ACTIVE" />
            <span>100K evt/s Kafka Live</span>
          </div>
        </div>
      </div>

      {/* ── Company Earnings & Financial Highlights (User Requested) ─────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Platform GMV */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform GMV</p>
          <p className="text-3xl font-black text-slate-900 mt-1">₹{stats.totalGMV.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Gross fares processed across all Indian zones</p>
        </div>

        {/* Company Commission (12% Pure Earnings) */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg shadow-indigo-900/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Company Revenue (12% Cut)</p>
            <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
              Net Profit
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-1">₹{stats.companyCommission.toLocaleString()}</p>
          <p className="text-xs text-indigo-200 mt-1">Pure platform commission earnings collected</p>
        </div>

        {/* Driver Net Payouts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Payouts (88%)</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">₹{stats.driverPayouts.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Dispatched to partners via instant daily UPI</p>
        </div>
      </div>

      {/* ── Secondary Live Operational Indicators ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Rides in Motion"
          value={stats.activeRides}
          icon={Zap}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
          change={8}
        />
        <StatCard
          label="Online Driver Fleet"
          value={stats.onlineDrivers.toLocaleString()}
          icon={Car}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
          change={4}
        />
        <StatCard
          label="Average Dispatch ETA"
          value={`${stats.avgETA} min`}
          icon={Clock}
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
          change={-15}
        />
        <StatCard
          label="Cancellation Rate"
          value={`${stats.cancellationRate}%`}
          icon={TrendingDown}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
          change={-2}
        />
      </div>

      {/* ── Demand Hotspots / Where Users Use Service Most ─────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">High-Demand Usage Hotspots & Demand Heatmap</h3>
            <p className="text-xs text-slate-500">Live spatial demand zones across IIT Kharagpur & Indian metropolitan corridors</p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Flame size={14} className="text-amber-600" />
            <span>Dynamic Flink Surges Active</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Hotspot Zone</th>
                <th className="py-2.5 px-3">City / Campus</th>
                <th className="py-2.5 px-3">Rides / Hour</th>
                <th className="py-2.5 px-3">Dynamic Surge</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {hotspots.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{h.name}</td>
                  <td className="py-3 px-3">{h.city}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{h.ridesPerHour} rides/hr</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                      {h.surge}x Surge
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {h.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link to="/admin/pricing" className="text-blue-600 hover:text-blue-800 font-bold underline text-[11px]">
                      Tune Surge
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Which Driver What Do & Performance Audit ─────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Live Driver Activity & Job Audit ("Which Driver What Do")</h3>
            <p className="text-xs text-slate-500">Live surveillance on bike riders, auto drivers, and cab operators</p>
          </div>
          <Link to="/admin/drivers" className="text-xs font-bold text-blue-600 hover:underline">
            View All Drivers Directory →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Driver Partner</th>
                <th className="py-2.5 px-3">Vehicle & Plate</th>
                <th className="py-2.5 px-3">Current Location / Zone</th>
                <th className="py-2.5 px-3">Live Status / What Doing</th>
                <th className="py-2.5 px-3">Performance & Quality</th>
                <th className="py-2.5 px-3 text-right">Private Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {drivers.slice(0, 6).map((driver) => {
                const isBike = driver.vehicle.category === 'MOTO' || driver.vehicle.category === 'BIKE';
                const isAuto = driver.vehicle.category === 'AUTO' || driver.vehicle.category === 'TOTO';
                return (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5">
                          <VehicleIcon category={driver.vehicle.category} size="xs" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{driver.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{driver.vehicle.model}</p>
                      <p className="text-[11px] font-mono text-slate-500">{driver.vehicle.plate || 'WB 29 AB 1042'}</p>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {driver.region || 'IIT Kharagpur'} · {driver.location.lat.toFixed(3)}° N
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        driver.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : driver.status === 'ON_RIDE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {driver.status === 'AVAILABLE'
                          ? 'Available (Idle on Map)'
                          : driver.status === 'ON_RIDE'
                          ? 'On Active Customer Ride'
                          : 'Offline'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-500">★ {driver.rating}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {driver.performanceScore || 94}% Perfect
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setPrivateContactTarget({ name: driver.name, role: 'Driver Partner', phone: driver.phone })}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        Contact Privately
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Private Contact Anonymized Modal ─────────────────────────────────── */}
      {privateContactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Phone size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black">Private Admin Dispatch Gateway</h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to {privateContactTarget.name} ({privateContactTarget.role}) via masked virtual PBX.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl font-mono text-xs font-bold text-slate-700">
              Encrypted Line: +91 (080) 6900-ADMIN-01
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPrivateContactTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Encrypted call initiated to ${privateContactTarget.name}. Connected via virtual proxy.`);
                  setPrivateContactTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Start Masked Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
