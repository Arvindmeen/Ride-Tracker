import { useState } from 'react';
import {
  User, ShieldCheck, Car, Award, CreditCard, Phone,
  FileCheck, Star, Clock, AlertTriangle, CheckCircle2, ChevronRight, Save
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useDriverStore } from '@/stores';

export default function DriverProfilePage() {
  const { user } = useAuthStore();
  const { status, vehicleType, todayEarnings, completedTrips } = useDriverStore();
  const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS | VEHICLE | BANK | DOCUMENTS
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [driverInfo, setDriverInfo] = useState({
    name: user?.name || 'Rajesh Kumar',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'rajesh@ridetracker.in',
    licenseNumber: 'DL-0420210084920',
    licenseExpiry: '14 Oct 2031',
    vehicleModel: 'Maruti Suzuki Dzire (Cab)',
    vehiclePlate: 'DL 01 AB 1234',
    vehicleCategory: 'ECONOMY',
    fuelType: 'CNG + Petrol',
    insuranceExpiry: '30 Dec 2026',
    bankAccount: 'HDFC Bank •••• 1042',
    ifscCode: 'HDFC0001042',
    upiId: 'rajesh.kumar@okhdfcbank',
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* ── Top Driver Card ────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/30 border border-emerald-400/40">
              {driverInfo.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{driverInfo.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black tracking-wider">
                  <ShieldCheck size={12} />
                  KYC VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{driverInfo.phone} · {driverInfo.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={14} className="fill-amber-400" />
                  4.92 Rating
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-semibold">412 Rides Completed</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">99% Safety Score</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Today's Net Payout</span>
            <span className="text-2xl font-black text-emerald-400">₹{todayEarnings || '4,198'}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">88% Driver Share (12% Cap)</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'DETAILS', label: 'Personal & License', icon: User },
          { id: 'VEHICLE', label: 'Vehicle Specs', icon: Car },
          { id: 'BANK', label: 'Bank & Instant UPI', icon: CreditCard },
          { id: 'DOCUMENTS', label: 'Badges & Compliance', icon: Award },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              activeTab === id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-fade-up">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Driver partner profile updated and synced successfully!</span>
        </div>
      )}

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      {activeTab === 'DETAILS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-extrabold text-white">Commercial Driving Profile</h2>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>Save Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={driverInfo.name}
                onChange={(e) => setDriverInfo({ ...driverInfo, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Registered Phone Number</label>
              <input
                type="text"
                value={driverInfo.phone}
                onChange={(e) => setDriverInfo({ ...driverInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Driving License (DL) Number</label>
              <input
                type="text"
                value={driverInfo.licenseNumber}
                onChange={(e) => setDriverInfo({ ...driverInfo, licenseNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">License Validity Expiry</label>
              <input
                type="text"
                value={driverInfo.licenseExpiry}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-slate-400 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-extrabold text-white">Registered Commercial Vehicle</h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
              Approved for Commercial Trips
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Vehicle Model & Make</label>
              <input
                type="text"
                value={driverInfo.vehicleModel}
                onChange={(e) => setDriverInfo({ ...driverInfo, vehicleModel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Registration Plate (Yellow Board)</label>
              <input
                type="text"
                value={driverInfo.vehiclePlate}
                onChange={(e) => setDriverInfo({ ...driverInfo, vehiclePlate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Fuel Type</label>
              <input
                type="text"
                value={driverInfo.fuelType}
                onChange={(e) => setDriverInfo({ ...driverInfo, fuelType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Commercial Insurance Valid Till</label>
              <input
                type="text"
                value={driverInfo.insuranceExpiry}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-slate-400 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BANK' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white">Bank Account & UPI Settlement</h2>
              <p className="text-xs text-slate-400 mt-0.5">Trips are settled directly to this account with 0 withdrawal fee.</p>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>Update Payout Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Bank Name & Account</label>
              <input
                type="text"
                value={driverInfo.bankAccount}
                onChange={(e) => setDriverInfo({ ...driverInfo, bankAccount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">IFSC Code</label>
              <input
                type="text"
                value={driverInfo.ifscCode}
                onChange={(e) => setDriverInfo({ ...driverInfo, ifscCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-semibold uppercase font-mono focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Instant Instant UPI VPA (For Direct Daily Payouts)</label>
              <input
                type="text"
                value={driverInfo.upiId}
                onChange={(e) => setDriverInfo({ ...driverInfo, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-emerald-400 font-bold focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DOCUMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">
            Verification Badges & Compliance
          </h2>

          <div className="space-y-3">
            {[
              { title: 'Police Background Verification (PCC)', status: 'Verified', date: 'Valid till Nov 2026', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
              { title: 'Commercial Vehicle Fitness Certificate', status: 'Active', date: 'Valid till Mar 2027', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
              { title: 'Driver Partner Training & Safety Protocol', status: 'Certified', date: 'Grade A+ (100% Score)', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
              { title: 'Speed Governor Calibration', status: 'Compliant', date: '80 km/h Electronic Governor Active', color: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white">{doc.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.date}</p>
                </div>
                <span className={clsx('text-xs font-extrabold px-3 py-1 rounded-full border', doc.color)}>
                  ✓ {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
