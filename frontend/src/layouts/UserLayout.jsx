import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Home, Clock, User, LogOut, Menu, X,
  Shield, HelpCircle, Sparkles, Navigation, Phone
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores';
import { Avatar } from '@/components/ui';

const NAV_ITEMS = [
  { to: '/app/home', icon: Home, label: 'Book Ride' },
  { to: '/app/trips', icon: Clock, label: 'My Trips' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/contact', icon: HelpCircle, label: 'Support' },
];

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans w-full max-w-full overflow-x-hidden">
      {/* ── Main Passenger Header Navbar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <Link to="/app/home" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="Ride Tracker Logo"
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-blue-200 transition-transform group-hover:scale-105"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 leading-none">Ride Tracker</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Rider
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  )
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Header Area: Emergency SOS, Avatar, and Logout */}
          <div className="flex items-center gap-2">
            {/* Emergency SOS Hotline */}
            <a
              href="tel:+9102280007433"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-black transition-all shadow-xs"
              title="Emergency SOS Hotline"
            >
              <Shield size={13} className="animate-pulse" />
              <span>SOS</span>
            </a>

            {/* Profile Avatar & Name */}
            <Link
              to="/app/profile"
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity"
            >
              <Avatar name={user?.name || 'Rider'} size="sm" />
              <span className="hidden sm:block text-xs font-bold text-slate-800">
                {user?.name?.split(' ')[0] || 'Passenger'}
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main View Content Area (Protected with pb-20 on mobile to not hide under bottom nav) ── */}
      <main className="flex-1 pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* ── Desktop Slim Footer ────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Ride Tracker" className="w-6 h-6 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-white text-xs">Ride Tracker Passenger Portal</span>
              <p className="text-[11px] text-slate-500">Live GPS Monitored · Number Masked · 24/7 Security</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <Link to="/app/home" className="hover:text-white transition-colors">Book a Ride</Link>
            <Link to="/app/trips" className="hover:text-white transition-colors">My Trips</Link>
            <Link to="/app/profile" className="hover:text-white transition-colors">Profile</Link>
            <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">Safety Support</Link>
          </div>

          <p className="text-[10px] text-slate-500">© 2026 Ride Tracker Technologies Pvt. Ltd.</p>
        </div>
      </footer>

      {/* ── Mobile Frosted Glass Bottom Navigation Bar ─────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 flex z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] py-1.5 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[10px] font-bold transition-all',
                isActive
                  ? 'text-blue-600 bg-blue-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              )
            }
          >
            <Icon size={19} className="transition-transform" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
