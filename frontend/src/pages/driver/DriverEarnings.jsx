import React, { useState } from 'react';
import { useDriverStore } from '@/stores';
import { Badge } from '@/components/ui';
import {
  TrendingUp, DollarSign, Clock, Zap, ArrowDownToLine, CheckCircle2,
  MapPin, Star, Smartphone, ShieldCheck, ChevronRight, Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', gross: 1600, net: 1408, rides: 11 },
  { day: 'Tue', gross: 1950, net: 1716, rides: 14 },
  { day: 'Wed', gross: 1720, net: 1513, rides: 10 },
  { day: 'Thu', gross: 2150, net: 1892, rides: 16 },
  { day: 'Fri', gross: 2700, net: 2376, rides: 21 },
  { day: 'Sat', gross: 3100, net: 2728, rides: 24 },
  { day: 'Sun', gross: 2090, net: 1840, rides: 12 },
];

export default function DriverEarnings() {
  const { todayEarnings, todayRides, onlineMinutes, pastTrips, upiId, vehicleType } = useDriverStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [customUpi, setCustomUpi] = useState(upiId || 'driver.partner@okhdfcbank');
  const [withdrawnSuccess, setWithdrawnSuccess] = useState(false);

  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  const weekGross = weeklyData.reduce((s, d) => s + d.gross, 0);
  const weekNet = weeklyData.reduce((s, d) => s + d.net, 0);
  const monthNet = 54820;

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = todayEarnings;
    setWithdrawnAmount(amount);
    setWithdrawnSuccess(true);
    useDriverStore.getState().withdrawEarnings(amount);
    setTimeout(() => {
      setWithdrawnSuccess(false);
      setShowWithdrawModal(false);
    }, 2800);
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto space-y-6 pb-24 font-sans text-slate-900">
      {/* Header with Title & Cashout Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Wallet & Earnings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {vehicleType === 'BIKE' ? '🏍️ Rapido Bike Partner' : '🚗 Cab Driver Partner'} · Transparent 12% Commission
          </p>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={todayEarnings <= 0}
          className={`font-extrabold px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs transition-all ${
            todayEarnings > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <ArrowDownToLine size={16} />
          <span>{todayEarnings > 0 ? `Withdraw to UPI (₹${todayEarnings})` : 'Zero Balance Available'}</span>
        </button>
      </div>

      {/* Period Balance Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Today Net (88%)</p>
          <p className="text-2xl sm:text-3xl font-black mt-1">₹{todayEarnings.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-200 mt-1">{todayRides} trips completed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Week</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">₹{weekNet.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Gross: ₹{weekGross.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">₹{monthNet.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">312 total rides</p>
        </div>
      </div>

      {/* Weekly Earnings Graph */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Weekly Earnings Trend (Net Payout)</h3>
            <p className="text-xs text-slate-500">Calculated after 12% platform commission</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Avg: ₹{Math.round(weekNet / 7)} / day
          </span>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="netEarningGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                formatter={v => [`₹${v}`, 'Net Payout']}
                contentStyle={{ fontSize: 12, borderRadius: 12, background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5} fill="url(#netEarningGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commission Transparency Card */}
      <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-extrabold text-slate-900 text-sm">Transparent 12% Commission Guarantee</p>
          <p className="text-slate-600 max-w-md leading-relaxed">
            Other aggregators take up to 25–30%. Ride Tracker caps platform fees at 12% to ensure driver partners keep 88% of all gross fares.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-2xs">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span className="font-bold text-emerald-800">Zero Hidden Deductions</span>
        </div>
      </div>

      {/* Detailed Past Trips History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Trip History & Fare Receipts</h3>
          <span className="text-xs text-slate-500 font-medium">{pastTrips.length} recent trips recorded</span>
        </div>

        <div className="space-y-2.5">
          {pastTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {trip.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{trip.date}</span>
                  <span className="text-xs font-bold text-amber-500">★ {trip.rating}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="truncate">{trip.pickup}</span>
                  </p>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{trip.drop}</span>
                  </p>
                </div>

                <p className="text-[11px] text-slate-500">
                  Passenger: <strong className="text-slate-700">{trip.customerName}</strong> · {trip.distance} · {trip.duration} · Paid via {trip.paymentMethod}
                </p>
              </div>

              {/* Fare breakdown */}
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                <span className="text-lg font-black text-emerald-700">₹{trip.netEarning}</span>
                <p className="text-[10px] text-slate-500">
                  Gross ₹{trip.fare} - 12% comm (₹{trip.commission})
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Paid to Driver
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instant UPI Cashout Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900">
            {withdrawnSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Transfer Successful!</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  ₹{withdrawnAmount || todayEarnings} has been sent via UPI IMPS to <strong className="text-slate-900">{customUpi}</strong>. Transaction Ref: #UPI{Date.now().toString().slice(-8)}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Instant UPI Bank Transfer</h3>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Transferrable Net Balance</p>
                    <p className="text-2xl font-black text-emerald-700">₹{todayEarnings}.00</p>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-300">
                    Instant 0s Transfer
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your UPI ID (Google Pay / PhonePe / Paytm / Bank)
                  </label>
                  <input
                    type="text"
                    required
                    value={customUpi}
                    onChange={(e) => setCustomUpi(e.target.value)}
                    placeholder="mobile@upi or name@okaxis"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Direct 24/7 NPCI IMPS transfer
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Zero transfer transaction fee
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-md shadow-emerald-600/20 text-sm transition-all cursor-pointer active:scale-95"
                >
                  Confirm Transfer ₹{todayEarnings}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
