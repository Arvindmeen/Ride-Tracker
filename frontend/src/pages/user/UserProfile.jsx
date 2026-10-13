import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { rideService } from '@/services';
import { Avatar } from '@/components/ui';
import {
  MapPin, Star, Clock, Shield, Phone, Mail, Home, Briefcase,
  ChevronRight, CreditCard, Bell, Lock, HelpCircle, LogOut,
  Navigation, Award, CheckCircle2, ArrowRight, Edit3, X, Save, Check,
  Key, Eye, EyeOff, Sparkles, AlertCircle, Heart, User, ShieldCheck,
  Smartphone, Share2, RefreshCw, FileText
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { clsx } from 'clsx';

export default function UserProfile() {
  const { user, logout, updateUserProfile, changePassword, fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'profile' | 'security' | 'preferences' | 'safety' | 'saved-places'
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Real-time dynamic metrics loaded live from backend & synchronized rides
  const [realtimeStats, setRealtimeStats] = useState({
    completedTrips: user?.totalRides || 0,
    rating: user?.rating ? Number(user.rating).toFixed(1) : '5.0',
    co2Saved: '0.0 kg',
    paymentMethod: user?.preferredPayment || 'UPI AutoPay',
    totalKm: '0.0',
    loading: false,
  });

  // Sync profile & rides in real time on mount and user changes
  useEffect(() => {
    let isMounted = true;
    const loadRealtimeProfile = async () => {
      try {
        if (fetchCurrentUser) {
          await fetchCurrentUser();
        }
        const rides = await rideService.getUserRides(user?.id);
        if (!isMounted) return;

        const completed = (rides || []).filter(
          (r) => r.status === 'RIDE_COMPLETED' || r.status === 'COMPLETED'
        );
        const rideCount = completed.length > 0 ? completed.length : (user?.totalRides || rides?.length || 0);

        // Sum distance across completed user journeys
        const totalKm = (rides || []).reduce((acc, r) => {
          const dist = Number(r.distanceKm || r.distance || 0);
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);

        // Clean EV carbon savings: approx 0.12 kg CO2 per km
        const co2SavedKg = totalKm > 0 
          ? (totalKm * 0.12).toFixed(1) + ' kg'
          : (rideCount > 0 ? (rideCount * 3.4).toFixed(1) + ' kg' : '0.0 kg');

        const liveRating = user?.rating ? Number(user.rating).toFixed(1) : '5.0';
        const rawPayment = user?.preferredPayment || 'UPI';
        const displayPayment = rawPayment === 'UPI' ? 'UPI AutoPay' : rawPayment === 'CASH' ? 'Cash on Arrival' : rawPayment === 'CARD' ? 'Debit/Credit Card' : rawPayment;

        setRealtimeStats({
          completedTrips: rideCount,
          rating: liveRating,
          co2Saved: co2SavedKg,
          paymentMethod: displayPayment,
          totalKm: totalKm.toFixed(1),
          loading: false,
        });
      } catch (err) {
        if (isMounted) setRealtimeStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadRealtimeProfile();
    return () => { isMounted = false; };
  }, [user?.id, user?.rating, user?.totalRides, user?.preferredPayment]);

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // ── Profile Details State ──────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || 'IIT Kharagpur / Moradabad',
    preferredPayment: user?.preferredPayment || 'UPI',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || 'IIT Kharagpur / Moradabad',
        preferredPayment: user.preferredPayment || 'UPI',
      });
    }
  }, [user]);

  // ── Password Change State ──────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // ── Ride Preferences State ─────────────────────────────────────────────────
  const [preferences, setPreferences] = useState({
    defaultVehicle: user?.defaultVehicle || 'TOTO',
    quietRide: user?.quietRide !== false,
    acPreference: user?.acPreference || 'COOL', // COOL | NORMAL | FRESH_AIR
    smsAlerts: user?.smsAlerts !== false,
    whatsappReceipts: user?.whatsappReceipts !== false,
    promotionalOffers: user?.promotionalOffers || false,
    autoShareRides: user?.autoShareRides !== false,
    emergencyContactName: user?.emergencyContactName || 'Family Emergency Contact',
    emergencyContactPhone: user?.emergencyContactPhone || '+91 94340 00112',
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // ── Saved Places State ─────────────────────────────────────────────────────
  const [savedPlaces, setSavedPlaces] = useState(user?.savedPlaces || [
    { id: 'home', label: 'Home / Residence', address: 'Scholars Avenue, Campus Residential Zone', icon: 'HOME' },
    { id: 'work', label: 'Department / Workplace', address: 'Nalanda Complex, Academic Corridor', icon: 'WORK' },
    { id: 'station', label: 'Transit Hub / Station', address: 'Kharagpur Jn Railway Station Platform 1', icon: 'STATION' },
  ]);

  if (!user) return null;

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      const res = await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        preferredPayment: profileForm.preferredPayment,
        city: profileForm.city,
      });
      if (res?.success) {
        setProfileSuccess(true);
        const displayPayment = profileForm.preferredPayment === 'UPI'
          ? 'UPI AutoPay'
          : profileForm.preferredPayment === 'CASH'
          ? 'Cash on Arrival'
          : profileForm.preferredPayment === 'CARD'
          ? 'Debit / Credit Card'
          : profileForm.preferredPayment;

        setRealtimeStats((prev) => ({
          ...prev,
          paymentMethod: displayPayment,
        }));
        setTimeout(() => setProfileSuccess(false), 3500);
      } else {
        setProfileError(res?.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res?.success) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(false), 4500);
      } else {
        setPasswordError(res?.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    if (e) e.preventDefault();
    setPrefSaving(true);
    try {
      await updateUserProfile({
        ...preferences,
        defaultVehicle: preferences.defaultVehicle,
        preferredPayment: profileForm.preferredPayment,
      });
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3500);
    } catch (e) {
    } finally {
      setPrefSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Password strength calculation
  const passStrength = (() => {
    const p = passwordForm.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  })();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-20 space-y-6 animate-fade-up font-sans">
      
      {/* ── Top Breadcrumbs / Title ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/app/home" className="hover:text-blue-600 transition-colors">Passenger Console</Link>
            <span>/</span>
            <span className="text-slate-900">User Details & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Account Management & Profile
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/home"
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <span>🛺 Book a Ride</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── User Identity Hero Profile Card (Clean, Responsive, Animated, No Overlapping Banner) ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
        {/* Subtle decorative glow in corner */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            {/* Avatar with Status Ring & Hover Micro-Animation */}
            <div className="relative self-start sm:self-auto shrink-0">
              <div className="ring-4 ring-blue-50/90 rounded-2xl shadow-sm bg-white p-1 transition-transform duration-200 group-hover:scale-105">
                <Avatar name={user?.name || 'User'} size="xl" className="rounded-xl" />
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
                title="Verified Active Passenger"
              />
            </div>

            {/* User Core Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {user?.name || 'Passenger'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <CheckCircle2 size={12} className="text-blue-600" />
                  <span>Verified Passenger</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg border border-slate-200/70">
                  ID: {user?.id || 'USR-PASSENGER-01'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span>{user?.email || 'user@example.com'}</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{user?.phone || '+91 94340 12891'}</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>{user?.city || profileForm.city || 'IIT Kharagpur / Moradabad'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Member Badge & Quick Status */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="text-xs font-bold text-slate-600 bg-slate-100/90 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/70 transition-colors flex items-center gap-1.5 shadow-2xs">
              <Sparkles size={13} className="text-amber-500" />
              <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}</span>
            </span>
          </div>
        </div>

        {/* ── 4 Real-time Dynamic Metrics Cards (Animated & Responsive) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-slate-100 text-center">
          <div
            onClick={() => navigate('/app/trips')}
            className="bg-slate-50/80 hover:bg-blue-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-200 cursor-pointer group/stat shadow-2xs"
            title="View completed trips"
          >
            <p className="text-xl sm:text-2xl font-black text-slate-900 group-hover/stat:text-blue-600 transition-colors">
              {realtimeStats.completedTrips}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Completed Trips
            </p>
          </div>

          <div className="bg-slate-50/80 hover:bg-amber-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-amber-200 transition-all duration-200 group/stat shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-amber-500 group-hover/stat:scale-105 transition-transform inline-block">
              ★ {realtimeStats.rating}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Passenger Rating
            </p>
          </div>

          <div className="bg-slate-50/80 hover:bg-emerald-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all duration-200 group/stat shadow-2xs">
            <p className="text-xl sm:text-2xl font-black text-emerald-600 group-hover/stat:scale-105 transition-transform inline-block">
              {realtimeStats.co2Saved}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Clean EV CO₂ Saved
            </p>
          </div>

          <div
            onClick={() => handleTabChange('profile')}
            className="bg-slate-50/80 hover:bg-blue-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-200 cursor-pointer group/stat shadow-2xs"
            title="Manage payment preference"
          >
            <p className="text-base sm:text-lg font-black text-blue-600 group-hover/stat:scale-105 transition-transform truncate">
              {realtimeStats.paymentMethod}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Default Payment
            </p>
          </div>
        </div>
      </div>

      {/* ── Multi-Tab Navigation Bar (Horizontal Scrollable & Modern) ─────────── */}
      <div className="flex gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { key: 'profile', label: 'Personal Details', icon: User },
          { key: 'security', label: 'Security & Password', icon: Key },
          { key: 'preferences', label: 'Ride Preferences', icon: Heart },
          { key: 'safety', label: 'Safety & Contacts', icon: ShieldCheck },
          { key: 'saved-places', label: 'Saved Places', icon: MapPin },
        ].map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 1: PERSONAL DETAILS
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your legal name, registered mobile number, email, and billing address.
            </p>
          </div>

          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Personal details updated and synced across all devices!</span>
              </div>
              <button onClick={() => setProfileSuccess(false)} className="text-emerald-700 hover:text-emerald-900">
                <X size={14} />
              </button>
            </div>
          )}

          {profileError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
              <button onClick={() => setProfileError(null)} className="text-rose-700 hover:text-rose-900">
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                    placeholder="e.g. Arvind Meena"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                    placeholder="+91 94340 12891"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled
                    value={profileForm.email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-20 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  Primary Hub / Campus City
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                    placeholder="IIT Kharagpur, West Bengal"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                Primary Payment Preference
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'UPI', label: 'UPI AutoPay', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'CASH', label: 'Cash on Arrival', desc: 'Direct to driver' },
                  { id: 'CARD', label: 'Debit / Credit Card', desc: 'Visa, RuPay, Master' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, preferredPayment: mode.id })}
                    className={clsx(
                      'p-3 rounded-2xl border text-left transition-all cursor-pointer',
                      profileForm.preferredPayment === mode.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <p className="text-xs font-black text-slate-900">{mode.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Personal Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 2: SECURITY & UPDATE PASSWORD
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Security & Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your account secure with robust encryption. Update your password regularly.
            </p>
          </div>

          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Password updated successfully! You can use your new credentials on future logins.</span>
              </div>
              <button onClick={() => setPasswordSuccess(false)} className="text-emerald-700 hover:text-emerald-900">
                <X size={14} />
              </button>
            </div>
          )}

          {passwordError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
              <button onClick={() => setPasswordError(null)} className="text-rose-700 hover:text-rose-900">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Update Password Form */}
          <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Key size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                  placeholder="Enter your existing account password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                  placeholder="Minimum 6 characters, mixed cases & numbers"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={clsx(
                          'flex-1 rounded-full transition-all duration-300',
                          passStrength >= lvl
                            ? passStrength <= 2
                              ? 'bg-rose-500'
                              : passStrength <= 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">
                    {passStrength <= 2 ? 'Weak password' : passStrength <= 3 ? 'Medium strength' : 'Strong & secure password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <CheckCircle2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-600 transition-all"
                  placeholder="Re-type your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key size={14} />
                    <span>Update Account Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Protocols Overview Card */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
              Account Protection Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-black">DigiLocker KYC</span>
                </div>
                <p className="text-[11px] text-slate-500">Aadhaar verified passenger identity</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Lock size={16} />
                  <span className="text-xs font-black">Bcrypt Hash</span>
                </div>
                <p className="text-[11px] text-slate-500">256-bit salted credentials store</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Key size={16} />
                  <span className="text-xs font-black">OTP Verification</span>
                </div>
                <p className="text-[11px] text-slate-500">4-digit departure trip authorization</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 3: RIDE PREFERENCES & COMFORT
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Ride Preferences & In-Cabin Comfort</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your booking defaults so every driver match adheres to your comfort needs.
            </p>
          </div>

          {prefSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Ride preferences updated and saved!</span>
              </div>
              <button onClick={() => setPrefSuccess(false)} className="text-emerald-700 hover:text-emerald-900">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* Default Vehicle Type */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-2">
                Default Preferred Vehicle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'TOTO', name: 'Solar E-Toto', icon: '🛺', desc: 'Fav clean campus mobility' },
                  { id: 'MOTO', name: 'Electric Bike', icon: '🏍️', desc: 'Fast solo sprint' },
                  { id: 'ECONOMY', name: 'Prime EV Cab', icon: '🚗', desc: 'Air-conditioned comfort' },
                  { id: 'XL', name: 'EV Transporter', icon: '🚚', desc: 'Cargo & group luggage' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, defaultVehicle: v.id })}
                    className={clsx(
                      'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                      preferences.defaultVehicle === v.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="text-2xl block mb-1">{v.icon}</span>
                    <p className="text-xs font-black text-slate-900">{v.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiet Ride Mode */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-900">Quiet Ride Mode</p>
                <p className="text-xs text-slate-500">
                  Notify assigned driver politely to keep radio music and small talk minimal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences({ ...preferences, quietRide: !preferences.quietRide })}
                className={clsx(
                  'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0',
                  preferences.quietRide ? 'bg-blue-600' : 'bg-slate-300'
                )}
              >
                <div
                  className={clsx(
                    'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                    preferences.quietRide ? 'translate-x-5.5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* AC Climate Preference */}
            <div>
              <label className="text-xs font-black text-slate-700 block mb-2">
                In-Cabin Climate Preference (Cabs & Totos)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'COOL', label: '❄️ Cool AC', sub: 'Chilled cabin' },
                  { id: 'NORMAL', label: '🍃 Moderate Air', sub: 'Balanced comfort' },
                  { id: 'FRESH_AIR', label: '🪟 Windows Open', sub: 'Natural breeze' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, acPreference: mode.id })}
                    className={clsx(
                      'p-3 rounded-2xl border text-left transition-all cursor-pointer',
                      preferences.acPreference === mode.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <p className="text-xs font-black text-slate-900">{mode.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{mode.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-black text-slate-700 block">
                Trip Notifications & Invoicing
              </label>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">SMS Driver ETA & Telemetry Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.smsAlerts}
                  onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">WhatsApp Official GST Ride Receipt</span>
                <input
                  type="checkbox"
                  checked={preferences.whatsappReceipts}
                  onChange={(e) => setPreferences({ ...preferences, whatsappReceipts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={prefSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                {prefSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Ride Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 4: SAFETY & EMERGENCY CONTACTS
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'safety' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Safety & Emergency Protocols</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live trip telemetry sharing, emergency contacts, and direct ERSS 112 speed-dial linkage.
            </p>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                112
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-950">National Emergency ERSS 112</h4>
                <p className="text-xs text-rose-800/80">
                  Instant integration with Ministry of Home Affairs emergency response centers.
                </p>
              </div>
            </div>
            <a
              href="tel:112"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm self-start sm:self-center transition-colors"
            >
              Emergency Call 112
            </a>
          </div>

          {/* Trusted Emergency Contact */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Trusted Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Contact Name / Relation</label>
                <input
                  type="text"
                  value={preferences.emergencyContactName}
                  onChange={(e) => setPreferences({ ...preferences, emergencyContactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  placeholder="e.g. Papa / Emergency Contact"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={preferences.emergencyContactPhone}
                  onChange={(e) => setPreferences({ ...preferences, emergencyContactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  placeholder="+91 94340 00112"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-2">
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-900">Auto-Share Live Ride Telemetry</p>
                <p className="text-xs text-slate-500">
                  Automatically SMS live tracking link to trusted contact when ride starts
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoShareRides}
                onChange={(e) => setPreferences({ ...preferences, autoShareRides: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Emergency Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TAB 5: SAVED PLACES
          ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'saved-places' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-black text-slate-900">Saved Places & Rapid Booking Shortcuts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              1-tap shortcut locations for campus gates, hostels, lecture halls, and rail junctions.
            </p>
          </div>

          <div className="space-y-3">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                    {place.icon === 'HOME' ? <Home size={18} /> : place.icon === 'WORK' ? <Briefcase size={18} /> : <Navigation size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{place.label}</h4>
                    <p className="text-xs text-slate-500">{place.address}</p>
                  </div>
                </div>

                <Link
                  to="/app/home"
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-800 text-xs font-black rounded-xl transition-colors shadow-xs"
                >
                  Book ➔
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
