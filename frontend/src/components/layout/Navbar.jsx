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
  const { todayEarnings, status: driverStatus } = useDriverStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const regionRef = useRef(null);

  const role = isAuthenticated ? (user?.role || 'USER') : null;

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
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs font-sans flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* ── Left: Brand Identity + Territory Dropdown ───────────────────────── */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              to={role === 'DRIVER' ? '/driver/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/'}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm border border-slate-200 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                    Veloq
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${
                    role === 'DRIVER'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : role === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {role === 'DRIVER' ? 'Driver' : role === 'ADMIN' ? 'Operations' : 'Passenger'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-tight hidden sm:inline mt-0.5">
                  Live National Fleet
                </span>
              </div>
            </Link>

            {/* Territory / Hub Dropdown */}
            <div className="relative shrink-0" ref={regionRef}>
              <button
                onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-colors whitespace-nowrap"
                title="Select Hub / Territory"
              >
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">
                  {currentRegion === 'IIT_KGP' ? 'IIT Kharagpur' : activeRegionObj.name}
                </span>
                <ChevronDown size={13} className={`text-slate-500 transition-transform shrink-0 ${regionMenuOpen ? 'rotate-180' : ''}`} />
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
                            <span className="truncate">{reg.id === 'IIT_KGP' ? 'IIT Kharagpur Campus' : reg.name}</span>
                          </div>
                          {isSelected && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Center: Clean Navigation (Never wraps, hides gracefully on narrow laptops) ── */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
            <a
              href="/#booking"
              className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 whitespace-nowrap"
            >
              Book Ride
            </a>
            <a
              href="/#booking"
              className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Live Radar
            </a>
            <a
              href="/#places-to-go"
              className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 whitespace-nowrap"
            >
              Corridors
            </a>
            <a
              href="/#safety"
              className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 whitespace-nowrap"
            >
              Safety
            </a>
            <button
              onClick={() => {
                login('DRIVER');
                navigate('/driver/dashboard');
              }}
              className="px-3 py-2 rounded-xl transition-colors text-emerald-700 hover:bg-emerald-50 font-bold whitespace-nowrap"
            >
              Drive & Earn
            </button>
          </nav>

          {/* ── Right: 112 SOS + Console CTA + Profile ─────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* National Emergency 112 SOS Pill */}
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-extrabold transition-all shadow-xs whitespace-nowrap shrink-0"
              title="National Emergency 112"
            >
              <Shield size={13} className="text-rose-600 animate-pulse shrink-0" />
              <span className="hidden sm:inline">112 SOS</span>
            </a>

            {/* Console / Cockpit CTA */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  if (role === 'DRIVER') navigate('/driver/dashboard');
                  else if (role === 'ADMIN') navigate('/admin/dashboard');
                  else navigate('/app/home');
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all whitespace-nowrap shrink-0 ${
                  role === 'DRIVER'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : role === 'ADMIN'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>{role === 'DRIVER' ? 'Cockpit' : role === 'ADMIN' ? 'Operations' : 'Console'}</span>
                <ArrowRight size={12} className="shrink-0" />
              </button>
            )}

            {/* Profile Pill */}
            {isAuthenticated ? (
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-xs whitespace-nowrap shrink-0"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                    role === 'DRIVER' ? 'bg-emerald-600' : role === 'ADMIN' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {role === 'DRIVER' ? '🚗' : role === 'ADMIN' ? '🖥️' : '👤'}
                  </div>
                  <span className="font-bold text-slate-900 truncate max-w-[90px] sm:max-w-[120px] hidden sm:inline">
                    {user?.name || 'Rahul Mehra'}
                  </span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform shrink-0 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-xs font-black text-slate-900">{user?.name || 'Rahul Mehra'}</p>
                      <p className="text-[11px] text-slate-500">
                        {role === 'DRIVER' ? 'Verified Driver Partner' : role === 'ADMIN' ? 'Operations Controller' : 'Verified Passenger'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs font-bold text-slate-700">
                      <Link to="/app/home" className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        <Car size={14} className="text-blue-600 shrink-0" />
                        <span>Book a Ride</span>
                      </Link>
                      <Link to="/app/trips" className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        <Clock size={14} className="text-slate-600 shrink-0" />
                        <span>My Trips History</span>
                      </Link>
                      <Link to="/contact" className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        <Phone size={14} className="text-emerald-600 shrink-0" />
                        <span>24/7 National Helpline</span>
                      </Link>

                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] uppercase font-extrabold text-slate-400 px-3 py-1">Switch Role Cockpit</p>
                        <button
                          onClick={() => { login('USER'); navigate('/app/home'); setProfileMenuOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${role === 'USER' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span>Passenger App</span>
                          {role === 'USER' && <CheckCircle2 size={13} />}
                        </button>
                        <button
                          onClick={() => { login('DRIVER'); navigate('/driver/dashboard'); setProfileMenuOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${role === 'DRIVER' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span>Driver Cockpit</span>
                          {role === 'DRIVER' && <CheckCircle2 size={13} />}
                        </button>
                        <button
                          onClick={() => { login('ADMIN'); navigate('/admin/dashboard'); setProfileMenuOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${role === 'ADMIN' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <span>Operations Radar</span>
                          {role === 'ADMIN' && <CheckCircle2 size={13} />}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut size={14} className="shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Register</span>
                  <ArrowRight size={12} className="shrink-0" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile / Tablet Responsive Drawer ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-16 sm:top-18 bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-2xl z-40 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-slide-down">
          <div className="px-4 py-4 space-y-4">
            
            {/* Quick Emergency 112 SOS */}
            <a
              href="tel:112"
              className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-rose-600" />
                <span>National Emergency: Dial 112</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">Call Now</span>
            </a>

            {/* Hub Selector on Mobile */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Current Hub</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(REGIONS).slice(0, 4).map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left border ${
                      reg.id === (currentRegion || 'IIT_KGP')
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {reg.id === 'IIT_KGP' ? 'IIT Kharagpur' : reg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1 pt-2 border-t border-slate-100 font-semibold text-sm">
              <a
                href="/#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
              >
                <span>Book a Ride</span>
                <ChevronRight size={15} className="text-slate-400" />
              </a>
              <a
                href="/#places-to-go"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
              >
                <span>Popular Corridors</span>
                <ChevronRight size={15} className="text-slate-400" />
              </a>
              <a
                href="/#safety"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
              >
                <span>Safety & Standards</span>
                <ChevronRight size={15} className="text-slate-400" />
              </a>
              <button
                onClick={() => {
                  login('DRIVER');
                  navigate('/driver/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-emerald-700 hover:bg-emerald-50 text-left font-bold"
              >
                <span>Drive & Earn (12% Fee)</span>
                <ChevronRight size={15} className="text-emerald-500" />
              </button>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50"
              >
                <span>24/7 Helpline & Support</span>
                <ChevronRight size={15} className="text-blue-500" />
              </Link>
            </div>

            {/* Auth Buttons on Mobile */}
            {!isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2.5 text-center border border-slate-200 rounded-xl font-bold text-xs text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2.5 text-center bg-blue-600 text-white rounded-xl font-bold text-xs"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
