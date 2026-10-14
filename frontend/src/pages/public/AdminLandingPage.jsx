import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Activity, BarChart2, Zap, Users, Car,
  MapPin, AlertTriangle, ArrowRight, Lock, CheckCircle2,
  Terminal, Globe2, Radio, Server, Cpu, Database,
  Eye, RefreshCw, FileText, ChevronRight, HelpCircle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/stores';

const TELEMETRY_METRICS = [
  { label: 'Platform Telemetry Uptime', val: '99.98%', sub: 'SLA Guaranteed Core' },
  { label: 'Proximity Spatial Dispatch', val: '< 80 ms', sub: 'Geodesic Nearest Driver' },
  { label: 'Automated Commission Split', val: '12.0%', sub: 'Platform Commission Cap' },
  { label: 'Driver Net Payout Share', val: '88.0%', sub: 'Direct UPI Daily Flow' },
];

const OPS_MODULES = [
  {
    icon: Globe2,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    title: 'Multi-City Fleet Radar & Geofencing',
    desc: 'Monitor thousands of active two-wheelers, toto e-rickshaws, and cabs in real time across Delhi NCR, Bengaluru, IIT Kharagpur, Mumbai, and Kolkata with sub-second WebSocket updates.',
    features: ['Live driver coordinate vector tracking', 'Dynamic polygon zone geofencing', 'Dead-mile route heatmap analytics'],
  },
  {
    icon: Zap,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Automated Surge & Demand Balancing',
    desc: 'Smart pricing engine automatically adjusts dynamic multipliers (1.0x to 3.0x) during heavy rainfall, train arrivals, and campus rush hours with corridor-specific fare protection.',
    features: ['Corridor surge caps to prevent gouging', 'Campus student discount overrides', 'Real-time passenger demand index'],
  },
  {
    icon: AlertTriangle,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    title: 'Centralized 112 SOS & Incident Desk',
    desc: 'Instant priority telemetry alerts whenever an in-ride emergency is reported. One-click driver contact masking, live vehicle route tracing, and direct escalation to authorities.',
    features: ['Real-time 112 emergency routing', 'Speed violation and route anomaly alerts', 'Incident timeline logs for audit'],
  },
  {
    icon: BarChart2,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    title: 'Automated Revenue Reconciliation',
    desc: 'Full-cycle financial transparency. Computes gross merchandise value (GMV), isolates the 12% company fee, and generates automated daily UPI settlement batches for driver partners.',
    features: ['Real-time GMV and platform fee ledger', 'Automated UPI payout batching', 'Tax & GST invoice compliance export'],
  },
  {
    icon: Users,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    title: 'Driver Partner Audits & KYC Engine',
    desc: 'Streamlined verification queue for driving licenses, vehicle RC, and insurance policies. Prevent fraud with automated document OCR cross-checks and biometric matching.',
    features: ['15-minute paperless onboarding queue', 'Vehicle inspection status tracking', 'Driver safety rating history'],
  },
  {
    icon: ShieldCheck,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    title: 'Zero-Trust RBAC & Audit Trails',
    desc: 'Military-grade access controls. Granular permissions for Super Admins, City Dispatchers, Emergency Handlers, and Financial Auditors with immutable access logging.',
    features: ['Role-based permission gating', 'Immutable audit change trails', '256-bit AES database encryption'],
  },
];

export default function AdminLandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, role: userRole } = useAuthStore();
  const isAdmin = isAuthenticated && (userRole === 'ADMIN' || user?.role === 'ADMIN');
  const [activeTab, setActiveTab] = useState('radar');

  // Always start at very top of screen when landing on page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col w-full max-w-full overflow-x-hidden">
      {/* ── Top Unified Navbar ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── Admin Hero Section (Pristine Light / Indigo Enterprise Styling) ── */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 pb-16 sm:pt-16 sm:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Mission Control Pitch */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black shadow-xs">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>
                    {isAdmin
                      ? `Operations Clearance Active · Logged in as ${user?.name || 'Operations Admin'}`
                      : 'Ride Tracker Operations Gateway · Enterprise Fleet Telemetry'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Mission Control for<br />
                  <span className="text-indigo-600">Modern Urban Mobility.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                  Centralized real-time fleet telemetry, autonomous proximity dispatching, dynamic algorithmic surge management, and automated financial reconciliation across Indian metropolises and academic hubs.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/login?role=ADMIN"}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                  >
                    {!isAdmin && <Lock size={16} />}
                    <span>{isAdmin ? "Open Operations Command Hub" : "Access Operations Console"}</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to={isAdmin ? "/admin/live-map" : "/contact"}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{isAdmin ? "Live Fleet Radar" : "Request City Ops Deployment"}</span>
                  </Link>
                </div>

                {/* System Vital Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                  {TELEMETRY_METRICS.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-xl sm:text-2xl font-black text-indigo-700">{m.val}</p>
                      <p className="text-[11px] font-bold text-slate-700">{m.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{m.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Operations Command Terminal & Live Fleet Map Radar Image View */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                  
                  {/* Top Bar with Tab Switcher */}
                  <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        🛰️
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-slate-900 leading-tight">National Fleet Command</h2>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Satellite Radar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveTab('radar')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === 'radar' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🗺️ Map View
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('telemetry')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === 'telemetry' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ⚡ Telemetry
                      </button>
                    </div>
                  </div>

                  {activeTab === 'radar' ? (
                    /* ── Interactive Fleet Map Radar Image View ── */
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Radar Screen Visualizer Canvas */}
                      <div className="relative w-full h-56 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-3.5">
                        {/* Grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                        
                        {/* Radar sweep animation */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(99,102,241,0.25)_0deg,transparent_60deg)] animate-[spin_4s_linear_infinite] rounded-full pointer-events-none scale-150 origin-center" />

                        {/* Top Overlay Tag */}
                        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                          <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>GPS FEED: 12.9716° N, 77.5946° E</span>
                          </span>
                          <span className="bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                            1,312 NODES
                          </span>
                        </div>

                        {/* Simulated Vehicle Pins on Map */}
                        <div className="relative z-10 w-full h-full my-auto flex items-center justify-center">
                          {/* Concentric radar range rings */}
                          <div className="absolute w-44 h-44 rounded-full border border-indigo-500/20 pointer-events-none" />
                          <div className="absolute w-28 h-28 rounded-full border border-indigo-500/30 pointer-events-none" />

                          {/* Center Node */}
                          <div className="absolute w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500" />

                          {/* Moving Vehicle Blips with Labels */}
                          <div className="absolute -top-1 left-8 flex items-center gap-1 bg-slate-900/90 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded-md shadow-xs animate-bounce">
                            <span>🚗 Cab #104</span>
                            <span className="text-white font-mono">0.3km</span>
                          </div>

                          <div className="absolute bottom-2 right-8 flex items-center gap-1 bg-slate-900/90 border border-blue-500/40 text-[9px] font-bold text-blue-400 px-1.5 py-0.5 rounded-md shadow-xs">
                            <span>🛺 Toto #08</span>
                            <span className="text-white font-mono">1 min</span>
                          </div>

                          <div className="absolute top-8 right-12 flex items-center gap-1 bg-slate-900/90 border border-amber-500/40 text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded-md shadow-xs">
                            <span>🏍️ Moto #42</span>
                          </div>

                          <div className="absolute bottom-6 left-6 flex items-center gap-1 bg-slate-900/90 border border-purple-500/40 text-[9px] font-bold text-purple-300 px-1.5 py-0.5 rounded-md shadow-xs">
                            <span>🚗 Tigor EV</span>
                          </div>
                        </div>

                        {/* Bottom Live Corridor Pill */}
                        <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
                          <span className="truncate">Active Corridor: Central Tech Park ➔ Metro Gate 3</span>
                          <span className="font-bold text-emerald-400 font-mono ml-2">88 ms</span>
                        </div>
                      </div>

                      {/* Live Status Cards */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Dispatch Health</span>
                          <p className="text-sm font-black text-slate-900 mt-0.5">100% Guaranteed</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Live Hotspots</span>
                          <p className="text-sm font-black text-slate-900 mt-0.5">5 City Hubs</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to="/admin/live-map"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer"
                      >
                        <span>Open Full-Screen Live Fleet Map ➔</span>
                      </Link>
                    </div>
                  ) : (
                    /* ── Telemetry Event Stream ── */
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Active Telemetry Tickers */}
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Active Dispatches</span>
                          <p className="text-xl font-black text-slate-900">188 Trips</p>
                          <p className="text-[10px] text-emerald-600 font-bold">● 100% On Schedule</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Online Drivers</span>
                          <p className="text-xl font-black text-slate-900">1,312 Partners</p>
                          <p className="text-[10px] text-blue-600 font-bold">● 5 Regional Hubs</p>
                        </div>
                      </div>

                      {/* Live Simulated Event Feed */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          Live Dispatch Telemetry Stream
                        </span>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-700 font-bold">[DISPATCH_MATCH]</span>
                            <span className="text-[10px] text-slate-400">0.04s</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Trip #R-8820 matched to Driver D-104 (0.3km) via Geodesic Spatial Index.
                          </p>
                          <div className="pt-1 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Fare: ₹85.00</span>
                            <span className="text-indigo-600">Platform Comm: ₹10.20</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={isAdmin ? "/admin/dashboard" : "/login?role=ADMIN"}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        <span>{isAdmin ? "Launch Operations Console ⚡" : "Authenticate with Operations Credential"}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Enterprise Modules Grid ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Core Command Modules
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Complete Oversight Across Every Wheel and Corridor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
                Engineered for city transportation managers, campus fleet administrators, and high-volume dispatch operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OPS_MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all text-left space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs" style={{}} >
                      <div className={`w-full h-full rounded-2xl flex items-center justify-center ${mod.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{mod.title}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                      {mod.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Architecture & Security Compliance ──────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div>
              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Enterprise Reliability
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Built on Resilient, Low-Latency Infrastructure
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-900">Spatial Telemetry Cache</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sub-millisecond driver geohashing with automatic dead-mile distance calculations and live route interpolation.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Lock size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-900">Strict Privacy Masking</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Passengers and drivers communicate exclusively through anonymized virtual numbers to prevent harassment and data leakage.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Server size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-900">Financial Audit Ledger</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Immutable transaction logs tracking every rupee of gross merchandise value, platform fees, and driver direct credits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Secure Operations Sign In CTA ───────────────────────────────────── */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
                <Lock size={28} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Ready to Access National Operations?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto mt-2">
                  Enter with your authorized enterprise administrative credentials or request operational access for your city transport division.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/login?role=ADMIN"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  Sign In to Operations Console
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all active:scale-95 cursor-pointer"
                >
                  Contact Administrator Helpdesk
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Unified Footer ── */}
      <Footer />
    </div>
  );
}
