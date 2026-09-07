import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Bell, DollarSign, User, LogOut, Phone,
  Activity, Shield, CheckCircle2, ChevronDown, Menu, X,
  HelpCircle, ExternalLink, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useDriverStore } from '@/stores';
import { StatusDot, Avatar } from '@/components/ui';
import DriverIncomingToast from '@/components/driver/DriverIncomingToast';

const NAV_ITEMS = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Cockpit' },
  { to: '/driver/requests', icon: Bell, label: 'Requests' },
  { to: '/driver/earnings', icon: DollarSign, label: 'Earnings & UPI' },
  { to: '/driver/profile', icon: User, label: 'Profile' },
  { to: '/contact', icon: HelpCircle, label: 'Support & Help' },
];

export default function DriverLayout() {
  const { user, logout, login } = useAuthStore();
  const { status, setStatus, vehicleType, setVehicleType, operatingScope, setOperatingScope, earnings } = useDriverStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (role) => {
    login(role);
    if (role === 'USER') navigate('/app/home');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  const toggleOnline = () => {
    setStatus(status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE');
  };

  const vehicleBadge = {
    BIKE: { label: '🏍️ Bike Partner', sub: 'Single Passenger Taxi' },
    CAR: { label: '🚗 Cab Partner', sub: 'Sedan Dzire / Hatchback' },
    AUTO: { label: '🛺 Toto/Auto Partner', sub: 'Campus 4-Seater' },
  }[vehicleType || 'BIKE'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* ── Top Driver Ribbon: Fleet Mode & Welfare Hotline ──────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Active Operating Scope & Mode */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Driver Partner Network Live
            </span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Mode:</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {vehicleBadge.label}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Territory:</span>
              <span className="font-bold text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded border border-blue-800/60">
                {operatingScope === 'IIT_KGP' ? '🎓 IIT Kharagpur Campus' : '🇮🇳 Pan-India Highways'}
              </span>
            </div>
          </div>

          {/* Welfare Hotline & Contact */}
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">
              Driver Welfare Hotline: <strong className="text-white">+91 (022) 8000-RIDE (Ext 2)</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link to="/contact" className="text-emerald-400 hover:text-white underline font-semibold">
              Partner Helpdesk & Grievance
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Driver Top Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Online Status */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-8 h-8 rounded-xl object-cover shadow-sm border border-emerald-500/40 transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-white leading-none">Veloq</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-700">
                    Partner
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">Driver Operations Cockpit</span>
              </div>
            </Link>

            {/* Online / Offline Toggle Button */}
            <button
              onClick={toggleOnline}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all border shadow-xs',
                status === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white',
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  status === 'AVAILABLE' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500',
                )}
              />
              <span>{status === 'AVAILABLE' ? 'ONLINE (ACCEPTING RIDES)' : 'GO ONLINE'}</span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all',
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800',
                    )
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Section: Today's Earnings, Switch Roles & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Wallet Pill */}
            <Link
              to="/driver/earnings"
              className="hidden sm:flex items-center gap-2 bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all"
              title="Today's Settled Earnings · Click for Instant UPI Cashout"
            >
              <DollarSign size={14} className="text-emerald-400" />
              <span>Today: ₹{earnings?.today || 1840}</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-1 rounded">
                12% Fee
              </span>
            </Link>

            {/* Verified Driver Partner Badge (Strict Role Separation) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Verified Driver Partner</span>
            </div>

            {/* Driver Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Avatar name={user?.name || 'Driver'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name?.split(' ')[0] || 'Subhash M.'}
                </p>
                <p className="text-[10px] text-amber-400 font-medium">★ 4.91 · Tier 1</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
                    isActive ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800',
                  )
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Phone size={13} />
                <span>Driver Welfare Hotline:</span>
              </span>
              <a href="tel:+9102280007433" className="font-bold text-white hover:underline">
                +91 (022) 8000-RIDE (Ext 2)
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Right-Side Floating Incoming Ride Dispatch Toast ─────────────── */}
      <DriverIncomingToast />

      {/* ── Content Area ─────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ── Respective Driver Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Driver Welfare Charter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Activity size={16} className="text-white" />
                </div>
                <span className="font-extrabold text-base text-white">Driver Partner Welfare</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                India's fairest gig mobility network. Guaranteed 12% lowest platform fee, zero penalties on legitimate cancellations, and instant daily UPI bank transfers.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>100% Transparent Upfront Net Payouts</span>
              </div>
            </div>

            {/* Col 2: Driver Navigation */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">Partner Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/driver/dashboard" className="hover:text-white transition-colors">Live Radar & Cockpit</Link></li>
                <li><Link to="/driver/requests" className="hover:text-white transition-colors">Incoming Ride Queue</Link></li>
                <li><Link to="/driver/earnings" className="hover:text-white transition-colors">Daily Earnings & Instant Cashout</Link></li>
                <li><Link to="/driver/profile" className="hover:text-white transition-colors">Documents & Vehicle Registration</Link></li>
              </ul>
            </div>

            {/* Col 3: Operating Stands */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">Operating Stands & Hubs</h4>
              <ul className="space-y-2 text-slate-400">
                <li>IIT Kharagpur Main Gate Toto Stand</li>
                <li>Kharagpur Railway Station Auto Union</li>
                <li>Puri Gate & Nalanda Complex Stand</li>
                <li>Mumbai BKC & Delhi NCR Transit Stands</li>
              </ul>
            </div>

            {/* Col 4: Welfare Helplines & Contact Us */}
            <div>
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">24/7 Partner Helpdesk</h4>
              <div className="space-y-2">
                <p className="text-xs text-slate-300">
                  Driver Helpline (24/7): <br />
                  <strong className="text-emerald-400 text-sm">+91 (022) 8000-RIDE (Ext 2)</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Tech Mkt Fleet Coordination Stand: <br />
                  <strong className="text-slate-300">+91 94340-KGP-RIDE</strong>
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-xs mt-1"
                >
                  <span>Submit Partner Grievance</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
            <p>© 2026 Veloq Technologies India Pvt. Ltd. Driver Partner Protection Charter.</p>
            <div className="flex items-center gap-4">
              <Link to="/contact" className="hover:text-slate-300">Contact Partner Desk</Link>
              <span className="hover:text-slate-300">IMPS / UPI Daily Settlement</span>
              <span className="hover:text-slate-300">Roadside Assistance (RSA)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation Bar ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-30 shadow-xl">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors',
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200',
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
