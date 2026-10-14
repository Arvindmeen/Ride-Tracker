import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Map, Car, Users, Tag, BarChart2, AlertTriangle,
  Settings, LogOut, Bell, Menu, X, Zap, HelpCircle, ShieldCheck, Radio,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuthStore();
  const { stats } = useAdminStore();
  const { currentRegion, setRegion } = useMapStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegionChange = (regKey) => {
    const reg = REGIONS[regKey];
    if (reg) setRegion(regKey, reg.center, reg.zoom);
  };

  const handleSwitchRole = (newRole) => {
    // Preserve admin role and privileges - never downgrade the admin account
    if (user?.role === 'ADMIN') {
      useAuthStore.setState({ role: 'ADMIN' });
      if (typeof window !== 'undefined') {
        localStorage.setItem('veloq_role', 'ADMIN');
      }
      if (newRole === 'USER') navigate('/app/home');
      else if (newRole === 'DRIVER') navigate('/driver/dashboard');
      else navigate('/admin/dashboard');
      return;
    }
    useAuthStore.setState({ role: newRole });
    if (typeof window !== 'undefined') {
      localStorage.setItem('veloq_role', newRole);
    }
    if (newRole === 'USER') navigate('/app/home');
    else if (newRole === 'DRIVER') navigate('/driver/dashboard');
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* ── Mobile Sidebar Backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/25 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Clean, Modern, Light Aesthetic) ─────────────────────── */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-300 shadow-xs',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 flex-shrink-0 bg-white">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)} title="Ride Tracker - Home">
            <img
              src="/toto-logo.svg"
              alt="Ride Tracker Logo"
              className="w-8 h-8 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-900 text-sm leading-none group-hover:text-blue-600 transition-colors">Ride Tracker</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fleet Operations</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Metrics Ticker */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats.activeRides || 188} Active Rides</span>
            </div>
            <span className="text-slate-500 text-[11px] font-semibold">{stats.onlineDrivers || 1312} Drivers</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[82%] rounded-full" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600',
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {label === 'Incidents & SOS' && stats.openIncidents > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-black animate-pulse">
                  {stats.openIncidents}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin User Footer - Interactive and Clickable */}
        <div className="border-t border-slate-200 p-3 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity group cursor-pointer"
              title="Click to view Admin Settings & Profile"
            >
              <Avatar name={user?.name || 'Arvind Meena'} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user?.name || 'Arvind Meena'}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold truncate">Chief Dispatcher</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Operations Workspace ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Operations Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black text-slate-900 hidden sm:inline">
                Operations Command
              </span>
              {/* Region Selector */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1">
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

          <div className="flex items-center gap-3">
            {/* Admin Preview Portal Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-500 px-1.5">Preview:</span>
              <button
                onClick={() => handleSwitchRole('USER')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white text-blue-700 shadow-xs hover:bg-blue-50 transition-all cursor-pointer"
                title="Preview Passenger View"
              >
                👤 Rider
              </button>
              <button
                onClick={() => handleSwitchRole('DRIVER')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white text-emerald-700 shadow-xs hover:bg-emerald-50 transition-all cursor-pointer"
                title="Preview Driver View"
              >
                🚗 Driver
              </button>
            </div>

            {/* Incident Bell */}
            <Link
              to="/admin/incidents"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Active Incidents"
            >
              <Bell size={18} />
              {stats.openIncidents > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </Link>

            {/* ── CLICKABLE ADMIN PROFILE NAVBAR PILL WITH DROPDOWN (User Requested) ── */}
            <div className="relative" ref={profileRef}>
              <div className="flex items-center rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all duration-200 shadow-xs hover:shadow-sm">
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors"
                  title="Click to open Admin Profile & System Settings"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs">
                    🛡️
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-extrabold text-slate-900 text-xs leading-none">
                      {user?.name || 'Arvind Meena'}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-bold leading-none mt-0.5">
                      Admin
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="pr-2.5 pl-1 py-1.5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  title="Admin Account Menu"
                  aria-label="Admin Account Menu"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name || 'Arvind Meena'}</p>
                    <p className="text-[10px] font-semibold text-slate-500 truncate">{user?.email || 'admin@ridetracker.in'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Fleet Administrator
                    </span>
                  </div>

                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <Settings size={14} />
                    <span>Admin Profile & Settings</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <BarChart2 size={14} />
                    <span>Financials & GMV</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => { setProfileMenuOpen(false); handleSwitchRole('USER'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Users size={14} />
                    <span>Switch to Passenger View</span>
                  </button>

                  <button
                    onClick={() => { setProfileMenuOpen(false); handleSwitchRole('DRIVER'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Car size={14} />
                    <span>Switch to Driver Cockpit</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
                <img src="/toto-logo.svg" alt="Ride Tracker" className="w-5 h-5 object-contain" />
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
