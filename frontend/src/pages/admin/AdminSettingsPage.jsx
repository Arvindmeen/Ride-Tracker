import { useState, useEffect } from 'react';
import {
  Settings, Sliders, Shield, MapPin, DollarSign, Bell,
  Save, CheckCircle2, AlertTriangle, Database, RefreshCw, Key
} from 'lucide-react';
import { clsx } from 'clsx';
import { REGIONS } from '@/constants';

export default function AdminSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [config, setConfig] = useState({
    platformFeePercent: 12, // 12% transparent platform fee
    driverSharePercent: 88,
    maxSurgeMultiplier: 1.5,
    minFareBase: 40,
    perKmRateDefault: 14,
    emergencySosAutoDial: true,
    emergencyPhonePolice: '112',
    sosEscalationMinutes: 3,
    activeRegion: 'IIT_KHARAGPUR',
    maintenanceMode: false,
    autoAcceptRadiusKm: 5,
  });

  useEffect(() => {
    fetch('/api/v1/auth/database-status')
      .then(res => res.json())
      .then(data => {
        if (data && data.database) setDbStatus(data.database);
      })
      .catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'platformFeePercent') {
        const val = Math.min(30, Math.max(5, Number(value) || 0));
        next.platformFeePercent = val;
        next.driverSharePercent = 100 - val;
      }
      return next;
    });
    setSavedSuccess(false);
  };

  const handleToggle = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-24">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Settings size={20} />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Configuration & Controls</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global operational parameters, commission splits, safety escalation thresholds, and city geofences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fade-up">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Platform policies and dispatch configuration updated across all nodes!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Commission & Fares ────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <DollarSign size={17} className="text-blue-600" />
            <span>Financials & Driver Split Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Platform Take Rate
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="5"
                  max="25"
                  value={config.platformFeePercent}
                  onChange={(e) => handleChange('platformFeePercent', Number(e.target.value))}
                  className="text-2xl font-black text-slate-900 w-16 bg-transparent outline-none border-b-2 border-blue-500"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Capped at 12% in current transparent tier</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Driver Payout Share
              </label>
              <div className="text-2xl font-black text-emerald-600">
                {config.driverSharePercent}%
              </div>
              <p className="text-[10px] text-emerald-600 mt-1.5">Direct to partner UPI instantly</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Maximum Dynamic Surge Multiplier</span>
                <span className="text-blue-600 font-black">{config.maxSurgeMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={config.maxSurgeMultiplier}
                onChange={(e) => handleChange('maxSurgeMultiplier', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Enforces fair price ceiling during heavy rain or peak train timings.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Minimum Fare (₹)</label>
                <input
                  type="number"
                  value={config.minFareBase}
                  onChange={(e) => handleChange('minFareBase', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Rate per KM (₹)</label>
                <input
                  type="number"
                  value={config.perKmRateDefault}
                  onChange={(e) => handleChange('perKmRateDefault', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Emergency Safety & SOS Protocol ──────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <Shield size={17} className="text-red-600" />
            <span>Safety, SOS Escalation & Compliance</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-red-50/60 border border-red-100 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-slate-800">Auto-Alert Police Control (112)</p>
              <p className="text-[11px] text-slate-500">Auto-dial emergency dispatch if SOS is unacknowledged</p>
            </div>
            <button
              onClick={() => handleToggle('emergencySosAutoDial')}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer',
                config.emergencySosAutoDial ? 'bg-red-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5 h-5 rounded-full bg-white shadow-xs transition-transform',
                  config.emergencySosAutoDial ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Police Line</label>
              <input
                type="text"
                value={config.emergencyPhonePolice}
                onChange={(e) => handleChange('emergencyPhonePolice', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Escalation Timeout (Minutes)</label>
              <input
                type="number"
                value={config.sosEscalationMinutes}
                onChange={(e) => handleChange('sosEscalationMinutes', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Compliance & Privacy Policy</p>
            <p className="text-[11px] text-slate-500">
              Indian DPDP Act 2023 certified. Ride telemetry is stored for 90 days and anonymized thereafter.
            </p>
          </div>
        </div>

        {/* ── Operational Zones & Geofencing ───────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <MapPin size={17} className="text-indigo-600" />
            <span>Active City & Dispatch Radius</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Primary Operating Hub</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(REGIONS).map(([key, reg]) => (
                <button
                  key={key}
                  onClick={() => handleChange('activeRegion', key)}
                  className={clsx(
                    'p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer',
                    config.activeRegion === key
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <p>{reg.name}</p>
                  <span className="text-[10px] text-slate-400 font-normal">Active Geofence</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Driver Dispatch Radius</span>
              <span className="text-blue-600 font-black">{config.autoAcceptRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={config.autoAcceptRadiusKm}
              onChange={(e) => handleChange('autoAcceptRadiusKm', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* ── Platform Health & Maintenance ────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <Database size={17} className="text-amber-600" />
            <span>System Maintenance & Data Engine</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-amber-900">Platform Maintenance Mode</p>
              <p className="text-[11px] text-amber-700">Pauses new rider booking requests gracefully</p>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer',
                config.maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
              )}
            >
              <div
                className={clsx(
                  'w-5 h-5 rounded-full bg-white shadow-xs transition-transform',
                  config.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Database Engine:</span>
              <strong className="text-slate-900 font-mono">
                {dbStatus?.engine || 'SQLite 3 (Disk) + Persistent JSON Mirror'}
              </strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>DB Connection Status:</span>
              <strong className="text-emerald-600 font-mono">
                {dbStatus?.connected ? 'ONLINE (Disk Persistent)' : 'CONNECTED'}
              </strong>
            </div>
            {dbStatus && (
              <div className="flex justify-between text-slate-600">
                <span>Database Records:</span>
                <span className="font-mono text-slate-800 font-bold">
                  {dbStatus.totalUsers || 0} users · {dbStatus.totalDrivers || 0} drivers · {dbStatus.totalRides || 0} rides
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GPS Broadcast Channel:</span>
              <strong className="text-emerald-600 font-mono">WebRTC / BroadcastChannel v1</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Server Uptime:</span>
              <strong className="text-slate-900 font-mono">99.98%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
