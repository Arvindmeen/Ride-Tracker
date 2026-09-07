import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, ArrowRight, ChevronDown, Menu, X, Users, Car,
  Shield, Phone, MapPin, Sparkles, LayoutDashboard, ExternalLink,
  Zap, LogOut, CheckCircle2, ChevronRight, Navigation, DollarSign,
  Terminal, ShieldCheck, UserCheck, AlertCircle, Clock
} from 'lucide-react';
import { useAuthStore, useMapStore, useDriverStore } from '@/stores';
import { REGIONS } from '@/constants';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, login } = useAuthStore();
  const { currentRegion, setRegion } = useMapStore();
  const { todayEarnings, status: driverStatus, todayRides } = useDriverStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const regionRef = useRef(null);

  const role = isAuthenticated ? (user?.role || 'USER') : null;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setRegionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setRegionMenuOpen(false);
  }, [location.pathname]);

  const handleSelectRegion = (regKey) => {
    const reg = REGIONS[regKey];
    if (reg) {
      setRegion(regKey, reg.center, reg.zoom);
    }
    setRegionMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeRegionObj = REGIONS[currentRegion] || REGIONS.IIT_KGP;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs font-sans transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* ── Left: Brand Identity & Role Badge ─────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
            <Link
              to={role === 'DRIVER' ? '/driver/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/'}
              className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-md shadow-sky-500/25 border border-sky-500/30 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                    Veloq
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                    role === 'DRIVER'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : role === 'USER'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-sky-100 text-sky-800 border-sky-200'
                  }`}>
                    {role === 'DRIVER' ? 'Driver Partner' : role === 'ADMIN' ? 'Operations' : role === 'USER' ? 'Passenger' : 'India'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${role === 'DRIVER' && driverStatus === 'OFFLINE' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-[10px] text-slate-500 font-semibold tracking-tight hidden sm:inline">
                    {role === 'DRIVER'
                      ? driverStatus === 'AVAILABLE' ? 'Online · Ready for Dispatches' : 'Cockpit Ready'
                      : role === 'ADMIN'
                      ? '99.98% Pan-India SLA'
                      : 'Live Campus & City Fleet'}
                  </span>
                </div>
              </div>
            </Link>

            {/* Territory / Region Dropdown (Available to Passengers & Drivers) */}
            {role !== 'ADMIN' && (
              <div className="relative" ref={regionRef}>
                <button
                  onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-colors"
                  title="Change Territory / Hub"
                >
                  <MapPin size={13} className="text-blue-600 flex-shrink-0" />
                  <span className="max-w-[100px] sm:max-w-[140px] truncate">
                    {currentRegion === 'IIT_KGP' ? 'IIT Kharagpur' : activeRegionObj.name}
                  </span>
                  <ChevronDown size={13} className={`text-slate-500 transition-transform ${regionMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {regionMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Select Active Territory</p>
                    </div>
                    <div className="space-y-1">
                      {Object.values(REGIONS).map((reg) => {
                        const isSelected = reg.id === (currentRegion || 'IIT_KGP');
                        return (
                          <button
                            key={reg.id}
                            onClick={() => handleSelectRegion(reg.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-extrabold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{reg.id === 'IIT_KGP' ? '🎓' : reg.id === 'KOLKATA' ? '✈️' : reg.id === 'DELHI' ? '🏛️' : reg.id === 'BANGALORE' ? '💻' : '🌊'}</span>
                              <span className="truncate">{reg.id === 'IIT_KGP' ? 'IIT Kharagpur & Station' : reg.name}</span>
                            </div>
                            {isSelected && <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Center: Strictly Role-Separated Desktop Navigation Links ─────── */}
          <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700">
            
            {/* ROLE 1: PASSENGER ONLY */}
            {role === 'USER' && (
              <>
                <Link
                  to="/app/home"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70 ${
                    location.pathname === '/app/home' ? 'text-blue-600 bg-blue-50 font-bold' : ''
                  }`}
                >
                  Book a Ride
                </Link>
                <Link
                  to="/app/home"
                  className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70"
                >
                  My Rides
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70 ${
                    location.pathname === '/contact' ? 'text-blue-600 bg-blue-50 font-bold' : ''
                  }`}
                >
                  24/7 Helpline
                </Link>
              </>
            )}

            {/* ROLE 2: DRIVER ONLY */}
            {role === 'DRIVER' && (
              <>
                <Link
                  to="/driver/dashboard"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-emerald-600 hover:bg-emerald-50/70 ${
                    location.pathname === '/driver/dashboard' ? 'text-emerald-600 bg-emerald-50 font-bold' : ''
                  }`}
                >
                  Driver Cockpit
                </Link>
                <Link
                  to="/driver/earnings"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-emerald-600 hover:bg-emerald-50/70 ${
                    location.pathname === '/driver/earnings' ? 'text-emerald-600 bg-emerald-50 font-bold' : ''
                  }`}
                >
                  My Earnings & UPI Payouts
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-emerald-600 hover:bg-emerald-50/70 ${
                    location.pathname === '/contact' ? 'text-emerald-600 bg-emerald-50 font-bold' : ''
                  }`}
                >
                  Driver Welfare & Support
                </Link>
              </>
            )}

            {/* ROLE 3: ADMIN ONLY */}
            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-indigo-600 hover:bg-indigo-50/70 ${
                    location.pathname === '/admin/dashboard' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''
                  }`}
                >
                  Operations Radar
                </Link>
                <Link
                  to="/admin/live-map"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-indigo-600 hover:bg-indigo-50/70 ${
                    location.pathname === '/admin/live-map' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''
                  }`}
                >
                  Fleet Live Map
                </Link>
                <Link
                  to="/admin/drivers"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-indigo-600 hover:bg-indigo-50/70 ${
                    location.pathname === '/admin/drivers' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''
                  }`}
                >
                  Drivers Audit
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-indigo-600 hover:bg-indigo-50/70 ${
                    location.pathname === '/admin/analytics' ? 'text-indigo-600 bg-indigo-50 font-bold' : ''
                  }`}
                >
                  Revenue & 12% GMV
                </Link>
              </>
            )}

            {/* PUBLIC GUEST ONLY */}
            {!isAuthenticated && (
              <>
                <a
                  href="/#booking"
                  className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70"
                >
                  How It Works
                </a>
                <a
                  href="/#places-to-go"
                  className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70"
                >
                  Destinations
                </a>
                <a
                  href="/#showcase"
                  className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70"
                >
                  Ecosystem
                </a>
                <Link
                  to="/contact"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-blue-50/70 ${
                    location.pathname === '/contact' ? 'text-blue-600 bg-blue-50 font-bold' : ''
                  }`}
                >
                  24/7 Helpline
                </Link>
              </>
            )}
          </nav>

          {/* ── Right: Role-Specific Profile / Auth Controls ────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Pill */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
                    role === 'DRIVER'
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950'
                      : role === 'ADMIN'
                      ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-950'
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                    role === 'DRIVER' ? 'bg-emerald-600' : role === 'ADMIN' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {role === 'DRIVER' ? '🚗' : role === 'ADMIN' ? '🖥️' : '👤'}
                  </div>

                  <div className="text-left hidden sm:block">
                    <p className="font-black leading-tight text-slate-900 truncate max-w-[120px]">
                      {user?.name || (role === 'DRIVER' ? 'Subhash Mondal' : role === 'ADMIN' ? 'Ops Admin' : 'Arvind Meena')}
                    </p>
                    <p className={`text-[10px] font-semibold ${
                      role === 'DRIVER' ? 'text-emerald-700' : role === 'ADMIN' ? 'text-indigo-700' : 'text-blue-700'
                    }`}>
                      {role === 'DRIVER'
                        ? `₹${todayEarnings} Net · 4.9★`
                        : role === 'ADMIN'
                        ? 'Super Admin'
                        : 'Verified Passenger'}
                    </p>
                  </div>

                  <ChevronDown size={13} className={`text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-xs font-black text-slate-900">
                        {user?.name || (role === 'DRIVER' ? 'Subhash Mondal' : role === 'ADMIN' ? 'Ops Admin' : 'Arvind Meena')}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {role === 'DRIVER' ? 'Driver Partner · WB 29 AB 1042' : role === 'ADMIN' ? 'admin@veloq.in' : 'IIT Kharagpur Student / Rider'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs font-bold text-slate-700">
                      {role === 'USER' && (
                        <>
                          <Link
                            to="/app/home"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                          >
                            <Car size={14} className="text-blue-600" />
                            <span>Book a Ride</span>
                          </Link>
                          <Link
                            to="/contact"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                          >
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>Safety & 24/7 Support</span>
                          </Link>
                        </>
                      )}

                      {role === 'DRIVER' && (
                        <>
                          <Link
                            to="/driver/dashboard"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <Car size={14} className="text-emerald-600" />
                            <span>Driver Cockpit</span>
                          </Link>
                          <Link
                            to="/driver/earnings"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <DollarSign size={14} className="text-emerald-600" />
                            <span>Daily Earnings (₹{todayEarnings})</span>
                          </Link>
                        </>
                      )}

                      {role === 'ADMIN' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                          >
                            <Terminal size={14} className="text-indigo-600" />
                            <span>Operations Radar</span>
                          </Link>
                          <Link
                            to="/admin/live-map"
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-indigo-600" />
                            <span>Live Fleet Map</span>
                          </Link>
                        </>
                      )}

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1"
                >
                  <span>Register Free</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile / Tablet Responsive Drawer (Strictly Role Separated) ──────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 sm:top-18 bg-white border-b border-slate-200 shadow-2xl z-40 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-4">
            
            {/* User Profile Card if logged in */}
            {isAuthenticated && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white ${
                    role === 'DRIVER' ? 'bg-emerald-600' : role === 'ADMIN' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {role === 'DRIVER' ? '🚗' : role === 'ADMIN' ? '🖥️' : '👤'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      {user?.name || (role === 'DRIVER' ? 'Subhash Mondal' : role === 'ADMIN' ? 'Ops Admin' : 'Arvind Meena')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {role === 'DRIVER' ? `Driver · ₹${todayEarnings} Net Today` : role === 'ADMIN' ? 'Operations Admin' : 'Verified Passenger'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Links per Role */}
            <div className="space-y-1 font-bold text-xs sm:text-sm">
              {role === 'USER' && (
                <>
                  <Link
                    to="/app/home"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-2"><Car size={15} /> Book a Ride</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-2"><Phone size={15} /> 24/7 Helpline & SOS</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </>
              )}

              {role === 'DRIVER' && (
                <>
                  <Link
                    to="/driver/dashboard"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-2"><Car size={15} /> Driver Cockpit</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                  <Link
                    to="/driver/earnings"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-2"><DollarSign size={15} /> My Earnings & UPI Payouts</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-2"><Phone size={15} /> Driver Welfare Helpline</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </>
              )}

              {role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span className="flex items-center gap-2"><Terminal size={15} /> Operations Command Center</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                  <Link
                    to="/admin/live-map"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span className="flex items-center gap-2"><MapPin size={15} /> Live Fleet Map</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <a
                    href="/#booking"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
                  >
                    <span>How It Works</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </a>
                  <a
                    href="/#places-to-go"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
                  >
                    <span>Destinations</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </a>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50"
                  >
                    <span>24/7 Helpline</span>
                    <ChevronRight size={14} className="text-blue-500" />
                  </Link>
                  <div className="pt-2 flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 py-2.5 text-center border border-slate-300 rounded-xl font-bold text-slate-800 hover:bg-slate-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 py-2.5 text-center bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
