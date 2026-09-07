import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Home, Clock, User, Settings, LogOut, Bell, Menu, X,
  Shield, Phone, Activity, ChevronDown, ExternalLink,
  MapPin, AlertCircle, Sparkles, HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useMapStore } from '@/stores';
import { Avatar } from '@/components/ui';
import { REGIONS } from '@/constants';

const NAV_ITEMS = [
  { to: '/app/home', icon: Home, label: 'Book Ride' },
  { to: '/app/trips', icon: Clock, label: 'My Trips' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/contact', icon: HelpCircle, label: 'Help & Contact' },
];

export default function UserLayout() {
  const { user, logout, login } = useAuthStore();
  const { currentRegion, setRegion } = useMapStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegionSwitch = (regKey) => {
    const reg = REGIONS[regKey];
    if (reg) {
      setRegion(regKey, reg.center, reg.zoom);
    }
  };

  const handleSwitchRole = (role) => {
    login(role);
    if (role === 'DRIVER') navigate('/driver/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* ── Top Passenger Announcement & Region Bar ────────────────────────────── */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-300">Active Passenger Region:</span>
            <select
              value={currentRegion || 'IIT_KGP'}
              onChange={(e) => handleRegionSwitch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-md px-2 py-0.5 focus:outline-none"
            >
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.id === 'IIT_KGP' ? '🎓 IIT Kharagpur (Campus & Station)' : `📍 ${reg.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">
              SOS Helpline: <strong className="text-white">+91 (022) 8000-RIDE</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link to="/contact" className="text-blue-400 hover:text-white underline font-medium">
              24/7 Passenger Support
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Passenger Navbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-8 h-8 rounded-xl object-cover shadow-sm border border-sky-300 transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 leading-none">Veloq</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Rider
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium">Passenger Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all',
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                    )
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2.5">
            {/* Verified Passenger Badge (Strict Role Separation) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold">
              <Sparkles size={13} className="text-blue-600" />
              <span>Verified Passenger</span>
            </div>

            {/* Emergency SOS Button */}
            <a
              href="tel:+9102280007433"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
              title="Immediate Safety SOS Dispatch"
            >
              <Shield size={14} className="animate-pulse" />
              <span>SOS 24/7</span>
            </a>

            {/* User Profile info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Avatar name={user?.name || 'Rider'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name?.split(' ')[0] || 'Passenger'}</p>
                <p className="text-[10px] text-slate-500 font-medium">Standard Account</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50',
                  )
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <Shield size={13} className="text-red-500" />
                <span>Emergency SOS:</span>
              </span>
              <a href="tel:+9102280007433" className="font-bold text-red-600 hover:underline">
                +91 (022) 8000-RIDE
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Main View Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* ── Respective Passenger Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Passenger Brand & Trust */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Veloq Logo"
                  className="w-7 h-7 rounded-lg object-cover shadow-sm border border-sky-400/40"
                />
                <span className="font-extrabold text-base text-white">Veloq Passenger</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Safe, verified transit across university campuses and metropolitan cities. 100% upfront fares with zero surge exploitation.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <Shield size={14} />
                <span>GPS Live Monitored & Number Masked</span>
              </div>
            </div>

            {/* Quick Passenger Links */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">Passenger Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/app/home" className="hover:text-white transition-colors">Book a Campus Toto / Cab</Link></li>
                <li><Link to="/app/trips" className="hover:text-white transition-colors">View Past Rides & Receipts</Link></li>
                <li><Link to="/app/profile" className="hover:text-white transition-colors">Manage Profile & Wallet</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Lost & Found Assistance</Link></li>
              </ul>
            </div>

            {/* Campus & Cities */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">Campus & City Hubs</h4>
              <ul className="space-y-2 text-slate-400">
                <li>IIT Kharagpur (Tech Mkt / Halls)</li>
                <li>Kharagpur Railway Junction</li>
                <li>Mumbai (BKC, Bandra, Airport)</li>
                <li>Delhi NCR & Bengaluru Corridor</li>
              </ul>
            </div>

            {/* Emergency Helplines & Contact Us */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">Passenger Helpdesk</h4>
              <div className="space-y-2">
                <p className="text-xs text-slate-300">
                  24/7 Operations Hotline: <br />
                  <strong className="text-white text-sm">+91 (022) 8000-RIDE</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Tech Market Desk, IIT Kharagpur: <br />
                  <strong className="text-slate-300">+91 94340-KGP-RIDE</strong>
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold text-xs mt-1"
                >
                  <span>Submit Support Ticket</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <p>© 2026 Veloq Technologies India Pvt. Ltd. Safe Passenger Commute Guarantee.</p>
            <div className="flex items-center gap-4">
              <Link to="/contact" className="hover:text-slate-300">Contact Us</Link>
              <span className="hover:text-slate-300">Safety Standards</span>
              <span className="hover:text-slate-300">UPI / Cash Protected</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation Bar ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-30 shadow-lg">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700',
              )
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
