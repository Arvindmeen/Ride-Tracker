import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Map, Car, Users, Tag, BarChart2, AlertTriangle,
  Settings, LogOut, Bell, Menu, X, Zap, HelpCircle, ShieldCheck, Radio
} from 'lucide-react';
import { clsx } from 'clsx'
import { useAuthStore, useAdminStore, useMapStore } from '@/stores';
import { Avatar, StatusDot } from '@/components/ui';
import { REGIONS } from '@/constants';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/live-map', icon: Map, label: 'Live Fleet Map' },
  { to: '/admin/rides', icon: Zap, label: 'Rides & Telemetry' },
  { to: '/admin/drivers', icon: Car, label: 'Driver Audits' },
  { to: '/admin/users', icon: Users, label: 'Passengers' },
  { to: '/admin/pricing', icon: Tag, label: 'Dynamic Pricing' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Financials & GMV' },
  { to: '/admin/incidents', icon: AlertTriangle, label: 'Incidents & SOS' },
  { to: '/contact', icon: HelpCircle, label: 'Helpdesk' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, login } = useAuthStore();
  const { stats } = useAdminStore();
  const { currentRegion, setRegion } = useMapStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin "Test Portal" — switch to user/driver view to preview how the app looks
  const [previewRole, setPreviewRole] = useState(null);
  const handleSwitchRole = (role) => {
    setPreviewRole(role);
    login(role);
    if (role === 'USER') navigate('/app/home');
    else if (role === 'DRIVER') navigate('/driver/dashboard');
  };

  const handleRegionChange = (regKey) => {
    const reg = REGIONS[regKey];
    if (reg) setRegion(regKey, reg.center, reg.zoom);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-60 bg-slate-950 border-r border-slate-800 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 flex-shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <img
              src="/logo.png"
              alt="Ride Tracker Logo"
              className="w-7 h-7 rounded-lg object-cover shadow-sm border border-indigo-400/40"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-white text-sm leading-none">Ride Tracker</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 border border-blue-700">
                  Ops
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">Fleet Operations</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Metrics Ticker */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <StatusDot status="ACTIVE" className="w-1.5 h-1.5" />
              <span>{stats.activeRides || 14} Active Rides</span>
            </div>
            <span className="text-slate-400 text-[11px]">{stats.onlineDrivers || 18} Drivers</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[82%]" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {label === 'Incidents & SOS' && stats.openIncidents > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-black animate-pulse">
                  {stats.openIncidents}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin User Footer */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Operations Lead'}</p>
              <p className="text-[10px] text-slate-400">Chief Dispatcher</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Operations Workspace ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Operations Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold text-slate-900 hidden sm:inline">
                Operations Command
              </span>
              {/* Region Selector */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-500">Region:</span>
                <select
                  value={currentRegion || 'IIT_KGP'}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {Object.values(REGIONS).map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.id === 'IIT_KGP' ? '🎓 IIT Kharagpur' : `📍 ${reg.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Preview Portal Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 px-1.5">Preview:</span>
              <button
                onClick={() => handleSwitchRole('USER')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-white text-blue-700 shadow-sm hover:bg-blue-50 transition-all"
                title="Preview Passenger View"
              >
                👤 Rider
              </button>
              <button
                onClick={() => handleSwitchRole('DRIVER')}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-white text-emerald-700 shadow-sm hover:bg-emerald-50 transition-all"
                title="Preview Driver View"
              >
                🚗 Driver
              </button>
            </div>

            {/* Incident Bell */}
            <Link
              to="/admin/incidents"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Active Incidents"
            >
              <Bell size={17} />
              {stats.openIncidents > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </Link>

            {/* Admin badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              <ShieldCheck size={12} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* ── Slim Admin Footer ──────────────────────────────────────────── */}
          <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Ride Tracker" className="w-5 h-5 rounded-md object-cover" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Ride Tracker Telemetry & Dispatch</p>
                  <p className="text-[10px] text-slate-400">SLA 99.98% · Redis GEO · Apache Kafka</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-[11px] font-semibold">
                <Link to="/contact" className="text-blue-600 hover:underline">Helpdesk</Link>
                <Link to="/admin/live-map" className="hover:text-slate-800">Fleet Map</Link>
                <Link to="/admin/analytics" className="hover:text-slate-800">Financial Audit</Link>
                <span>Hotline: +91 (022) 8000-RIDE</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
