import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, ArrowRight, ChevronDown, Menu, X, Users, Car,
  Shield, Phone, MapPin, Sparkles, LayoutDashboard, ExternalLink,
  Zap, LogOut, CheckCircle2, ChevronRight, Navigation, DollarSign,
  Terminal, ShieldCheck, UserCheck, AlertCircle, Clock, Search,
  Crosshair, Loader2
} from 'lucide-react';
import { useAuthStore, useMapStore, useDriverStore } from '@/stores';
import { locationService } from '@/services';
import { REGIONS } from '@/constants';

const POPULAR_CITIES = [
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, icon: '💻' },
  { name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090, icon: '🏛️' },
  { name: 'Mumbai MMR', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, icon: '🌊' },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, icon: '✈️' },
  { name: 'IIT Kharagpur', state: 'West Bengal', lat: 22.3149, lng: 87.3105, icon: '🎓' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, icon: '💎' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, icon: '🚗' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, login } = useAuthStore();
  const { userLocation, setUserLocation, currentRegion, setRegion } = useMapStore();
  const { todayEarnings, status: driverStatus } = useDriverStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [locSearchQuery, setLocSearchQuery] = useState('');
  const [locSearchResults, setLocSearchResults] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const profileRef = useRef(null);
  const locationRef = useRef(null);

  const role = isAuthenticated ? (user?.role || 'USER') : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setLocationMenuOpen(false);
  }, [location.pathname]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geocoded = await locationService.reverseGeocode(latitude, longitude);
        setUserLocation({
          lat: latitude,
          lng: longitude,
          name: geocoded.name || 'My Live Location',
          address: geocoded.address,
          city: geocoded.city || 'Detected City',
          state: geocoded.state || '',
          isGpsDetected: true,
        });
        setIsDetectingGps(false);
        setLocationMenuOpen(false);
      },
      (err) => {
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Search input debounced autocomplete
  useEffect(() => {
    if (!locSearchQuery.trim()) {
      setLocSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingLoc(true);
      const results = await locationService.searchPlaces(locSearchQuery, userLocation);
      setLocSearchResults(results);
      setIsSearchingLoc(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [locSearchQuery, userLocation]);

  const handleSelectSearchedPlace = (place) => {
    setUserLocation({
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      address: place.address,
      city: place.city || place.name,
      state: place.state || '',
      isGpsDetected: false,
    });
    setLocSearchQuery('');
    setLocSearchResults([]);
    setLocationMenuOpen(false);
  };

  const handleSelectCity = (city) => {
    setUserLocation({
      lat: city.lat,
      lng: city.lng,
      name: city.name,
      address: `${city.name}, ${city.state}`,
      city: city.name,
      state: city.state,
      isGpsDetected: false,
    });
    setLocationMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayLocationName = userLocation?.city || userLocation?.name || 'Set Location';

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs font-sans flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* ── Left: Brand Identity + Dynamic Location Selector ─────────────────── */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              to={role === 'DRIVER' ? '/driver/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/'}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <img
                src="/logo.png"
                alt="Riders Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm border border-slate-200 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                    Riders India
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
                  Pan-India Mobility
                </span>
              </div>
            </Link>

            {/* Dynamic Live Location Popover */}
            <div className="relative shrink-0 max-[479px]:hidden" ref={locationRef}>
              <button
                onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-colors whitespace-nowrap shadow-xs"
                title="Change or Detect Your Location"
              >
                <span className="relative flex h-2 w-2">
                  {userLocation?.isGpsDetected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${userLocation?.isGpsDetected ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
                </span>
                <MapPin size={13} className="text-blue-600 shrink-0" />
                <span className="max-w-[110px] sm:max-w-[160px] truncate">
                  {displayLocationName}
                </span>
                <ChevronDown size={13} className={`text-slate-500 transition-transform shrink-0 ${locationMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {locationMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                    <p className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-600" />
                      <span>Your Active Location</span>
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {userLocation?.isGpsDetected ? 'GPS Active' : 'Manual'}
                    </span>
                  </div>

                  {/* 1-Tap Use GPS Location Button */}
                  <button
                    onClick={handleDetectGPS}
                    disabled={isDetectingGps}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 transition-all active:scale-[0.99] mb-3"
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                        <span>Detecting live GPS location...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair size={14} className="text-blue-600" />
                        <span>Use Exact GPS Location</span>
                      </>
                    )}
                  </button>

                  {/* Search City / Locality Input */}
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search any city, campus, or area..."
                      value={locSearchQuery}
                      onChange={(e) => setLocSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    {locSearchQuery && (
                      <button
                        onClick={() => { setLocSearchQuery(''); setLocSearchResults([]); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Live Search Autocomplete Results */}
                  {locSearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-1 mb-3 pr-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">Matching Locations</p>
                      {locSearchResults.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => handleSelectSearchedPlace(place)}
                          className="w-full text-left p-2 rounded-xl text-xs hover:bg-blue-50/80 transition-colors flex items-start gap-2 group"
                        >
                          <MapPin size={13} className="text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 group-hover:text-blue-700 truncate">{place.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{place.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Select Popular Cities */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
                      Popular Hubs
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {POPULAR_CITIES.map((city) => {
                        const isCurrent = userLocation?.city === city.name || userLocation?.name === city.name;
                        return (
                          <button
                            key={city.name}
                            onClick={() => handleSelectCity(city)}
                            className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>{city.icon}</span>
                              <span className="truncate">{city.name}</span>
                            </span>
                            {isCurrent && <CheckCircle2 size={12} className="text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Center: Clean Navigation (Never wraps, hides gracefully on narrow laptops) ── */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
            {isAuthenticated && role === 'USER' ? (
              <Link
                to="/app/home"
                className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 whitespace-nowrap"
              >
                Book Ride
              </Link>
            ) : (
              <a
                href="/#booking"
                className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 whitespace-nowrap"
              >
                Book Ride
              </a>
            )}

            {/* Dynamic Radar / My Bookings / My Rides based on auth & role */}
            {isAuthenticated ? (
              role === 'DRIVER' ? (
                <Link
                  to="/driver/dashboard"
                  className="px-3 py-2 rounded-xl transition-colors text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-800 flex items-center gap-1.5 whitespace-nowrap border border-emerald-200/60 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  My Rides
                </Link>
              ) : role === 'ADMIN' ? (
                <Link
                  to="/admin/rides"
                  className="px-3 py-2 rounded-xl transition-colors text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-800 flex items-center gap-1.5 whitespace-nowrap border border-indigo-200/60 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                  Fleet Radar
                </Link>
              ) : (
                <Link
                  to="/app/trips"
                  className="px-3 py-2 rounded-xl transition-colors text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-800 flex items-center gap-1.5 whitespace-nowrap border border-blue-200/60 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  My Bookings
                </Link>
              )
            ) : (
              <a
                href="/#booking"
                className="px-3 py-2 rounded-xl transition-colors hover:text-blue-600 hover:bg-slate-100 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Live Radar
              </a>
            )}

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
            {!isAuthenticated && (
              <button
                onClick={() => {
                  login('DRIVER');
                  navigate('/driver/dashboard');
                }}
                className="px-3 py-2 rounded-xl transition-colors text-emerald-700 hover:bg-emerald-50 font-bold whitespace-nowrap"
              >
                Drive & Earn
              </button>
            )}
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
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all whitespace-nowrap shrink-0 ${
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
              <div className="relative shrink-0 max-lg:hidden" ref={profileRef}>
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
                        {role !== 'USER' && (
                          <button
                            onClick={() => { login('DRIVER'); navigate('/driver/dashboard'); setProfileMenuOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${role === 'DRIVER' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <span>Driver Cockpit</span>
                            {role === 'DRIVER' && <CheckCircle2 size={13} />}
                          </button>
                        )}
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

            {/* Signed-in profile shortcut */}
            {isAuthenticated && (
              <Link
                to={role === 'DRIVER' ? '/driver/profile' : role === 'ADMIN' ? '/admin/settings' : '/app/profile'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white shadow-sm ${
                  role === 'DRIVER' ? 'bg-emerald-600' : role === 'ADMIN' ? 'bg-indigo-600' : 'bg-blue-600'
                }`}>
                  {role === 'DRIVER' ? '🚗' : role === 'ADMIN' ? '🖥️' : '👤'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Ride Tracker User'}</p>
                  <p className="text-[11px] text-slate-500">
                    {role === 'DRIVER' ? 'Driver profile' : role === 'ADMIN' ? 'Operations settings' : 'Passenger profile'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              </Link>
            )}
            
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
              {isAuthenticated ? (
                role === 'DRIVER' ? (
                  <Link
                    to="/driver/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-emerald-700 bg-emerald-50 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>My Rides</span>
                    </div>
                    <ChevronRight size={15} className="text-emerald-500" />
                  </Link>
                ) : (
                  <Link
                    to="/app/trips"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-blue-700 bg-blue-50 font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>My Bookings</span>
                    </div>
                    <ChevronRight size={15} className="text-blue-500" />
                  </Link>
                )
              ) : (
                <a
                  href="/#booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Radar</span>
                  </div>
                  <ChevronRight size={15} className="text-slate-400" />
                </a>
              )}

              {isAuthenticated && role === 'USER' ? (
                <Link
                  to="/app/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
                >
                  <span>Book a Ride</span>
                  <ChevronRight size={15} className="text-slate-400" />
                </Link>
              ) : (
                <a
                  href="/#booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
                >
                  <span>Book a Ride</span>
                  <ChevronRight size={15} className="text-slate-400" />
                </a>
              )}
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
