import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Avatar } from '@/components/ui';
import {
  MapPin, Star, Clock, Shield, Phone, Mail, Home, Briefcase,
  ChevronRight, CreditCard, Bell, Lock, HelpCircle, LogOut,
  Navigation, Award, CheckCircle2, ArrowRight, Edit3, X, Save, Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';

const MENU_GROUPS = [
  {
    title: 'Preferences & Security',
    items: [
      { label: 'Payment methods & UPI', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Manage UPI IDs & cards' },
      { label: 'Push Notifications',   icon: Bell,       color: 'text-amber-600',  bg: 'bg-amber-50',  desc: 'Trip alerts & driver ETA' },
      { label: 'Privacy & Safety',      icon: Lock,       color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Number masking & location share' },
      { label: 'Help & 24/7 Support',   icon: HelpCircle, color: 'text-blue-600',   bg: 'bg-blue-50',   desc: 'Ticket history & safety hotline' },
    ],
  },
];

export default function UserProfile() {
  const { user, logout, updateUserProfile } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredPayment: user?.preferredPayment || 'UPI',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile(formData);
    setSaving(false);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-20 space-y-6 animate-fade-up">

      {/* Profile Saved Success Toast */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">
              ✓
            </div>
            <p className="text-xs sm:text-sm font-bold">Profile updated and synced with backend database successfully!</p>
          </div>
          <button onClick={() => setSavedSuccess(false)} className="text-emerald-600 hover:text-emerald-800 p-1">
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* ── Profile Hero Header Card ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Banner with modern mesh gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle at 80% 30%, white 0%, transparent 60%)',
            }}
          />
        </div>

        {/* User Identity Details */}
        <div className="px-5 sm:px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-3">
            <div className="ring-4 ring-white rounded-full inline-block shadow-md bg-white">
              <Avatar name={user.name} size="xl" />
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full shadow-xs">
                <CheckCircle2 size={13} className="text-blue-600" />
                <span>Verified Passenger</span>
              </span>

              <button
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    preferredPayment: user.preferredPayment || 'UPI',
                  });
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{user.email}</p>
          </div>

          {/* Stats Bar (Spacious and cleanly responsive) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5 pt-5 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-lg sm:text-xl font-black text-slate-900">
                {user.totalRides || 38}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5">
                Total Rides
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-lg sm:text-xl font-black text-amber-500">
                ★ {user.rating ? Number(user.rating).toFixed(1) : '4.9'}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5">
                Rating
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-lg sm:text-xl font-black text-emerald-600">
                {user.preferredPayment || 'UPI'}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5">
                Primary Pay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">Edit Personal Profile</h3>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+91 98000 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Preferred Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'CASH', 'CARD'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredPayment: mode })}
                      className={clsx(
                        'py-2 px-3 rounded-xl text-xs font-bold border transition-all',
                        formData.preferredPayment === mode
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contact Information Card ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          Contact Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xs">
              <Phone size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Phone</span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {user.phone || '+91 98302 11928'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xs">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {user.email || 'passenger@veloq.in'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Saved Places ────────────────────────────────────────────────────── */}
      {user.savedPlaces && user.savedPlaces.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Saved Places
            </h2>
            <span className="text-[11px] font-bold text-blue-600">Quick Select</span>
          </div>

          <div className="space-y-2.5">
            {user.savedPlaces.map((p) => (
              <Link
                key={p.id}
                to="/app/home"
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all group"
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
                    p.icon === 'HOME' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {p.icon === 'HOME' ? <Home size={18} /> : <Briefcase size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {p.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{p.address}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Emergency Safety Contacts ────────────────────────────────────────── */}
      {user.emergencyContacts && user.emergencyContacts.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50/70 to-pink-50/70 border border-rose-200 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Shield size={14} />
              </div>
              <h2 className="text-sm font-black text-rose-900">Safety & SOS Contacts</h2>
            </div>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Live Broadcast Active
            </span>
          </div>

          <div className="space-y-2">
            {user.emergencyContacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-white/90 rounded-2xl border border-rose-100 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.relation} · {c.phone}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Phone size={12} />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Account Preferences Menu ────────────────────────────────────────── */}
      {MENU_GROUPS.map((group) => (
        <div
          key={group.title}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100"
        >
          {group.items.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
                  item.bg
                )}
              >
                <item.icon size={18} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
                <span className="block text-xs text-slate-400 truncate">{item.desc}</span>
              </div>
              <ChevronRight
                size={16}
                className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </button>
          ))}
        </div>
      ))}

      {/* ── Sign Out ──────────────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-sm transition-colors shadow-xs"
      >
        <LogOut size={16} />
        <span>Sign Out of Account</span>
      </button>

      <p className="text-center text-xs text-slate-400">
        Veloq Passenger Portal · Version 3.4.0 · IIT Kharagpur Edition
      </p>
    </div>
  );
}
