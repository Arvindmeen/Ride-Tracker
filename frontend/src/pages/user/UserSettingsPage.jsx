import React, { useState } from 'react';
import {
  Bell, Shield, CreditCard, Moon, Sun, Smartphone,
  Lock, CheckCircle2, Save, User, Heart, AlertCircle, HelpCircle, FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores';

export default function UserSettingsPage() {
  const { user, updateUserProfile } = useAuthStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    theme: 'light',
    smsAlerts: true,
    whatsappReceipts: true,
    promotionalOffers: false,
    quietRide: true,
    acPreference: 'COOL', // COOL | NORMAL | NO_AC
    defaultPayment: user?.preferredPayment || 'UPI',
    emergencyContactName: 'Family Member',
    emergencyContactPhone: '+91 98765 00000',
    autoShareRides: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedSuccess(false);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    updateUserProfile({ preferredPayment: settings.defaultPayment });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Passenger Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your ride preferences, safety emergency contacts, and notifications.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fade-up">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Your preferences have been updated and synced successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Ride Experience Preferences ─────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Heart size={18} className="text-blue-600" />
            <span>Ride Experience</span>
          </div>

          {/* Quiet Ride */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Quiet Ride Mode</p>
              <p className="text-xs text-slate-500">Notify driver politely to keep music/conversation minimal</p>
            </div>
            <button
              onClick={() => handleToggle('quietRide')}
              className={clsx(
                'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer',
                settings.quietRide ? 'bg-blue-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                  settings.quietRide ? 'translate-x-5.5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* AC Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Cabin AC Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'COOL', label: '❄️ Cool 22°C' },
                { id: 'NORMAL', label: '🍃 Gentle AC' },
                { id: 'NO_AC', label: '🪟 Windows Down' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleChange('acPreference', opt.id)}
                  className={clsx(
                    'py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer',
                    settings.acPreference === opt.id
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Default Payment Method</label>
            <select
              value={settings.defaultPayment}
              onChange={(e) => handleChange('defaultPayment', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="UPI">⚡ UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="CASH">💵 Cash to Driver</option>
              <option value="CARD">💳 Credit / Debit Card</option>
              <option value="WALLET">👛 Ride Tracker In-App Wallet</option>
            </select>
          </div>
        </div>

        {/* ── Safety & Emergency Contacts ─────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Shield size={18} className="text-red-600" />
            <span>Safety & Emergency SOS</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary SOS Contact Name</label>
            <input
              type="text"
              value={settings.emergencyContactName}
              onChange={(e) => handleChange('emergencyContactName', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Mobile Number</label>
            <input
              type="text"
              value={settings.emergencyContactPhone}
              onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-slate-800">Auto-Share Night Rides</p>
              <p className="text-xs text-slate-500">Automatically SMS live GPS track between 9 PM and 6 AM</p>
            </div>
            <button
              onClick={() => handleToggle('autoShareRides')}
              className={clsx(
                'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer',
                settings.autoShareRides ? 'bg-red-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                  settings.autoShareRides ? 'translate-x-5.5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Notifications ──────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Bell size={18} className="text-blue-600" />
            <span>Notifications & Receipts</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">SMS Driver Arrival Alerts</p>
              <p className="text-xs text-slate-500">Get SMS when your driver arrives at pickup</p>
            </div>
            <button
              onClick={() => handleToggle('smsAlerts')}
              className={clsx(
                'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer',
                settings.smsAlerts ? 'bg-blue-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                  settings.smsAlerts ? 'translate-x-5.5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">WhatsApp Invoices</p>
              <p className="text-xs text-slate-500">Instant GST invoice & trip summary on WhatsApp</p>
            </div>
            <button
              onClick={() => handleToggle('whatsappReceipts')}
              className={clsx(
                'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer',
                settings.whatsappReceipts ? 'bg-blue-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                  settings.whatsappReceipts ? 'translate-x-5.5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Discounts & Ride Passes</p>
              <p className="text-xs text-slate-500">Alerts about seasonal coupons and weekend passes</p>
            </div>
            <button
              onClick={() => handleToggle('promotionalOffers')}
              className={clsx(
                'w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer',
                settings.promotionalOffers ? 'bg-blue-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform',
                  settings.promotionalOffers ? 'translate-x-5.5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Privacy & DPDP Compliance ──────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Lock size={18} className="text-emerald-600" />
            <span>Privacy & Compliance</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Ride Tracker complies with the Digital Personal Data Protection (DPDP) Act. Your phone number is masked for drivers, and GPS records are encrypted.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => alert('Your ride logs and encrypted data download request has been scheduled. You will receive a secure ZIP archive via email.')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Download My Ride Data (JSON/CSV)</span>
              <FileText size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => alert('Safety team notified. Account privacy settings updated.')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Phone Number Masking Status</span>
              <span className="text-emerald-600 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ACTIVE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
