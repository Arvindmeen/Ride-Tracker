import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Bell, DollarSign, User, LogOut, Phone,
  CheckCircle2, Menu, X, HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useDriverStore } from '@/stores';
import { StatusDot, Avatar } from '@/components/ui';
import DriverIncomingToast from '@/components/driver/DriverIncomingToast';

const NAV_ITEMS = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Cockpit' },
  { to: '/driver/requests', icon: Bell, label: 'Requests' },
  { to: '/driver/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/driver/profile', icon: User, label: 'Profile' },
  { to: '/contact', icon: HelpCircle, label: 'Support' },
];

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const { status, setStatus, vehicleType, operatingScope, todayEarnings } = useDriverStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleOnline = () => {
    setStatus(status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE');
  };

  const vehicleLabel = {
    BIKE: '🏍️ Bike',
    CAR: '🚗 Cab',
    AUTO: '🛺 Auto/Toto',
  }[vehicleType || 'BIKE'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* ── Driver Status Ribbon ──────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Driver Partner Network
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {vehicleLabel}
            </span>
            <span className="hidden sm:inline text-slate-400">
              Territory: <strong className="text-blue-300">
                {operatingScope === 'IIT_KGP' ? '🎓 IIT Kharagpur' : '🇮🇳 Pan-India'}
              </strong>
            </span>
          </div>
          <Link to="/contact" className="text-emerald-400 hover:text-white font-semibold transition-colors">
            Partner Helpdesk
          </Link>
        </div>
      </div>

      {/* ── Main Driver Top Navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo + Online Toggle */}
          <div className="flex items-center gap-4">
            <Link to="/driver/dashboard" className="flex items-center gap-2.5 group shrink-0">
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-8 h-8 rounded-xl object-cover shadow-sm border border-emerald-500/40 transition-transform group-hover:scale-105"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white leading-none">Veloq</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-700 hidden sm:inline">
                  Partner
                </span>
              </div>
            </Link>

            {/* Online / Offline Toggle */}
            <button
              onClick={toggleOnline}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all border',
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
              <span className="hidden sm:inline">
                {status === 'AVAILABLE' ? 'ONLINE' : 'GO ONLINE'}
              </span>
              <span className="sm:hidden">
                {status === 'AVAILABLE' ? '●' : '○'}
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800',
                    )
                  }
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: Today's earnings + Driver Profile + Logout */}
          <div className="flex items-center gap-2.5">
            {/* Today earnings pill */}
            <Link
              to="/driver/earnings"
              className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all"
              title="Today's Earnings"
            >
              <DollarSign size={13} className="text-emerald-400" />
              <span>₹{todayEarnings?.toLocaleString?.() ?? 1840}</span>
            </Link>

            {/* Driver Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Avatar name={user?.name || 'Driver'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name?.split(' ')[0] || 'Driver'}
                </p>
                <p className="text-[10px] text-amber-400 font-medium">★ 4.91 · Tier 1</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold',
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
                +91 (022) 8000-RIDE
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Incoming Ride Dispatch Toast ──────────────────────────────────── */}
      <DriverIncomingToast />

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* ── Slim Driver Footer ────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-500 text-xs border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-700 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-xs">Veloq Driver Partner</span>
              <p className="text-[10px] text-slate-600">12% lowest fee · Instant UPI · Zero penalties</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <Link to="/driver/dashboard" className="hover:text-slate-300 transition-colors">Cockpit</Link>
            <Link to="/driver/earnings" className="hover:text-slate-300 transition-colors">Earnings</Link>
            <Link to="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors">Partner Helpdesk</Link>
          </div>
          <p className="text-[10px] text-slate-700">© 2026 Veloq Technologies India Pvt. Ltd.</p>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-30 shadow-xl">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors',
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300',
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
