import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car, Shield, DollarSign, Clock, MapPin, CheckCircle2, ChevronRight,
  TrendingUp, ArrowRight, Award, Zap, Phone, Star, Sparkles, Navigation,
  BatteryCharging, HelpCircle, Users, Check, AlertCircle, ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const VEHICLE_CATEGORIES = [
  {
    id: 'BIKE',
    icon: '🏍️',
    title: 'Bike Taxi (Rapido Mode)',
    tag: 'Highest Trip Volume',
    dailyMin: 800,
    dailyMax: 1500,
    hourlyRate: 140,
    desc: 'Perfect for students & single commuters. Lowest fuel consumption, zero traffic delays, instant dispatches near colleges, tech parks, and metro gates.',
    perks: ['Fuel saving up to 60%', 'Fast 45-second passenger pickup', 'Flexible 1-hr micro shifts'],
  },
  {
    id: 'TOTO',
    icon: '🛺',
    title: 'Toto & E-Rickshaw',
    tag: 'Zero Fuel Expense',
    dailyMin: 700,
    dailyMax: 1300,
    hourlyRate: 120,
    desc: 'Pure electric last-mile shuttle for campus corridors, railway station gates, and local bazaars. Low maintenance and zero petrol expenses.',
    perks: ['100% Electric, zero petrol cost', 'Steady morning & evening rush', 'Short 1-3 km repeat trips'],
  },
  {
    id: 'AUTO',
    icon: '🛺',
    title: 'Auto Rickshaw',
    tag: 'City Commuter Choice',
    dailyMin: 1100,
    dailyMax: 1900,
    hourlyRate: 170,
    desc: 'The backbone of Indian cities. High daily ride demand, fair transparent meter tariffs, and steady family trips across all neighborhoods.',
    perks: ['Higher per-km fare earnings', 'No luggage bargaining', 'Return trip proximity matching'],
  },
  {
    id: 'CAB',
    icon: '🚗',
    title: 'Economy & Sedan Cab',
    tag: 'Comfort & Premium',
    dailyMin: 1800,
    dailyMax: 3400,
    hourlyRate: 260,
    desc: 'Hatchbacks and sedans for city executives, shopping trips, and airport runs. Enjoy premium fares, air-conditioned comfort, and corporate bonuses.',
    perks: ['Higher average ticket size', 'Airport priority dispatch lane', 'Peak hour surge bonuses'],
  },
  {
    id: 'XL',
    icon: '🚐',
    title: 'XL & Outstation Highway',
    tag: 'Maximum Single-Trip Payout',
    dailyMin: 3200,
    dailyMax: 6500,
    hourlyRate: 420,
    desc: 'Long-distance interstate corridors and large family groups. 100+ km guaranteed round-trip payouts with highway toll reimbursements.',
    perks: ['Guaranteed round-trip return fare', 'Tolls & night allowance included', 'High single-trip earnings'],
  },
];

const COMPARISON_POINTS = [
  {
    feature: 'Platform Commission Cap',
    rideTracker: 'Strict 12% Flat Cap (You Keep 88%)',
    others: '25% - 32% Hidden Commissions',
    highlight: true,
  },
  {
    feature: 'Daily UPI Payouts',
    rideTracker: 'Instant Daily Settlement to UPI / Bank',
    others: 'Delayed weekly payout cycles',
    highlight: true,
  },
  {
    feature: 'Proximity Dispatch Distance',
    rideTracker: 'Nearest Driver First (0.2 km - 1.5 km)',
    others: 'Sends requests from 4+ km away',
    highlight: true,
  },
  {
    feature: 'Dead Mile Fuel Loss',
    rideTracker: 'Near zero — pick up right around your lane',
    others: 'High unpaid travel to pickup spots',
    highlight: false,
  },
  {
    feature: 'Driver Contact & Privacy',
    rideTracker: 'Virtual Masked Calling & Free In-App Chat',
    others: 'Personal phone numbers leaked',
    highlight: false,
  },
  {
    feature: 'Unfair Penalties & Blocking',
    rideTracker: 'Zero arbitrary suspensions, fair dispute review',
    others: 'Frequent account blocks without appeal',
    highlight: false,
  },
];

const FAQ_ITEMS = [
  {
    q: 'What documents do I need to register as a Driver Partner?',
    a: 'You only need: 1) Valid Driving License (DL), 2) Vehicle Registration Certificate (RC), 3) Aadhaar Card or Voter ID, and 4) UPI ID or Bank Account for daily direct payouts. Verification takes less than 15 minutes.',
  },
  {
    q: 'How and when do I receive my trip earnings?',
    a: 'Your earnings are credited directly to your registered UPI ID or Bank account daily. Cash collected directly from passengers is settled automatically against your 12% platform fee balance.',
  },
  {
    q: 'Do I have fixed working hours or shifts?',
    a: 'No. You are your own boss. You can turn the Cockpit ONLINE or OFFLINE anytime with 1 tap. Drive full-time or pick up a single ride on your way home.',
  },
  {
    q: 'Why does Ride Tracker only charge 12% commission?',
    a: 'We believe drivers are the heartbeat of urban mobility. By keeping our platform lean and autonomous, we pass 88% of every fare directly to you, making Ride Tracker the fairest mobility partner in India.',
  },
  {
    q: 'How does proximity dispatch ensure I get nearby passengers?',
    a: 'Our dispatch algorithm calculates strict spatial geodesic distance. We never dispatch a driver from 4 km away when you are parked 300 meters from the pickup spot. This cuts empty fuel wastage to near zero.',
  },
];

export default function DriverLandingPage() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState('BIKE');
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [openFaq, setOpenFaq] = useState(null);

  const activeCategory = VEHICLE_CATEGORIES.find((v) => v.id === selectedVehicle) || VEHICLE_CATEGORIES[0];
  
  // Dynamic earnings calculation
  const dailyGross = activeCategory.hourlyRate * hoursPerDay;
  const platformFee = Math.round(dailyGross * 0.12);
  const dailyNet = dailyGross - platformFee;
  const monthlyNet = dailyNet * (daysPerWeek * 4.2);
  const annualPotential = monthlyNet * 12;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col w-full max-w-full overflow-x-hidden">
      {/* ── Top Unified Navbar ── */}
      <Navbar />

      <main className="flex-1">
        {/* ── Driver Hero Section (Pristine Light / Emerald Theme) ───────────── */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 pb-16 sm:pt-16 sm:pb-24">
          {/* Subtle light background patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Value Prop & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>🇮🇳 India's Fair Fleet Network · 88% Direct Payouts</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-[1.2]">
                  Drive with Ride Tracker.<br />
                  <span className="text-emerald-600">Earn up to ₹45,000/mo</span> on your own terms.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                  Keep <strong className="text-slate-900">88% of every fare</strong> with our guaranteed 12% platform fee cap. 
                  Enjoy daily UPI settlements, genuine nearest-driver proximity dispatches, and zero unfair deductions.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    to="/register?role=DRIVER"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Sign Up as Driver Partner</span>
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/login?role=DRIVER"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Driver Cockpit Login</span>
                  </Link>
                </div>

                {/* Micro trust indicators */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-black text-emerald-700">12%</p>
                    <p className="text-[11px] font-bold text-slate-500">Fixed Platform Fee Cap</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-black text-emerald-700">Daily</p>
                    <p className="text-[11px] font-bold text-slate-500">Auto UPI Payouts</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-black text-emerald-700">&lt; 15 min</p>
                    <p className="text-[11px] font-bold text-slate-500">Paperless KYC Approval</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Quick Card / Cockpit Preview */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-7 space-y-6 relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-xs">
                        {activeCategory.icon}
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900 leading-tight">Driver Partner Cockpit</h2>
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Ready for Instant Dispatch
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2.5 py-1 rounded-xl">
                      Live GPS
                    </span>
                  </div>

                  {/* Simulated Incoming Trip Request */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Nearby Proximity Trip · 450m Away
                      </span>
                      <span className="text-base font-black text-emerald-800">₹85.00</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">Pickup: Technology Market Gate #1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">Drop: Kharagpur Jn Railway Station</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-emerald-200/60">
                      <span>Trip Distance: 5.2 km</span>
                      <span className="text-emerald-700 font-black">Net To You: ₹74.80 (88%)</span>
                    </div>
                  </div>

                  {/* Trust list */}
                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Zero penalty for rejecting inconvenient rides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>National 112 emergency SOS with live GPS tracing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Virtual phone masking protects your personal number</span>
                    </div>
                  </div>

                  <Link
                    to="/register?role=DRIVER"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Get Started in 2 Minutes</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Vehicle Categories Supported ───────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Choose How You Drive
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Vehicles We Welcome On Our Fleet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
                Whether you own a two-wheeler, electric rickshaw, or sedan cab, Ride Tracker offers consistent passenger dispatches across your city.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VEHICLE_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedVehicle(cat.id)}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer text-left space-y-4 hover:shadow-lg ${
                    selectedVehicle === cat.id
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{cat.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Daily Earnings</p>
                      <p className="text-sm font-black text-emerald-700">₹{cat.dailyMin} - ₹{cat.dailyMax}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">~₹{cat.hourlyRate}/hr</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                    {cat.perks.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/register?role=DRIVER&vehicle=${cat.id}`);
                    }}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedVehicle === cat.id
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Register With {cat.title.split(' ')[0]}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive Daily / Monthly Earnings Calculator ─────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Transparent Calculator
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Calculate Your Potential Take-Home
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
                See exactly how much you keep after the 12% platform fee. No surprises or fine print.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Sliders on Left */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Vehicle selector */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">
                      Select Vehicle Category
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {VEHICLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedVehicle(cat.id)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            selectedVehicle === cat.id
                              ? 'bg-white border-emerald-500 shadow-sm text-emerald-800 font-black ring-2 ring-emerald-500/20'
                              : 'bg-white/80 border-slate-200 text-slate-600 font-bold hover:bg-white'
                          }`}
                        >
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <div className="text-[10px] truncate">{cat.title.split(' ')[0]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours driven per day slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-slate-600">Hours Driven Per Day:</span>
                      <span className="text-emerald-700 font-black text-sm bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                        {hoursPerDay} Hours / Day
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>4 hrs (Part-time)</span>
                      <span>8 hrs (Standard)</span>
                      <span>12 hrs (Full-time)</span>
                    </div>
                  </div>

                  {/* Days per week */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-slate-600">Working Days Per Week:</span>
                      <span className="text-emerald-700 font-black text-sm bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                        {daysPerWeek} Days / Week
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="7"
                      step="1"
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>4 Days</span>
                      <span>5 Days</span>
                      <span>6 Days</span>
                      <span>7 Days</span>
                    </div>
                  </div>
                </div>

                {/* Earnings Summary Card on Right */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-emerald-200 shadow-md p-6 text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Estimated Net Take-Home
                  </span>

                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-emerald-600">
                      ₹{Math.round(monthlyNet).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">Per Month Direct to Your Bank</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 text-left">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Daily Fare:</span>
                      <span className="font-bold text-slate-900">₹{dailyGross}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Platform Fee (12%):</span>
                      <span>- ₹{platformFee}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-emerald-700">
                      <span>Daily Net Take-Home:</span>
                      <span>₹{dailyNet}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Annual estimated potential: <strong className="text-slate-900">₹{Math.round(annualPotential).toLocaleString('en-IN')}</strong>
                  </div>

                  <Link
                    to="/register?role=DRIVER"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <span>Claim Your Driver Slot</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Why Drivers Prefer Ride Tracker (Comparison Table) ──────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Transparent Comparison
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Why Drivers Choose Us Over Legacy Platforms
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-100 px-6 py-4 text-xs font-black text-slate-600 border-b border-slate-200">
                <div className="col-span-5 sm:col-span-4">Benefit / Feature</div>
                <div className="col-span-4 sm:col-span-4 text-emerald-700 font-black">Ride Tracker</div>
                <div className="col-span-3 sm:col-span-4 text-slate-400">Legacy Aggregators</div>
              </div>

              <div className="divide-y divide-slate-100">
                {COMPARISON_POINTS.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 px-6 py-4 text-xs items-center">
                    <div className="col-span-5 sm:col-span-4 font-bold text-slate-900">
                      {item.feature}
                    </div>
                    <div className="col-span-4 sm:col-span-4 font-extrabold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span>{item.rideTracker}</span>
                    </div>
                    <div className="col-span-3 sm:col-span-4 text-slate-500 font-medium">
                      {item.others}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-Step Simple Onboarding ────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Get Started Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
                Start Driving In 3 Easy Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-left space-y-3 relative shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  1
                </div>
                <h3 className="text-base font-black text-slate-900">Sign Up Online</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Provide your name, phone number, vehicle type, and preferred operating territory in under 2 minutes.
                </p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-left space-y-3 relative shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  2
                </div>
                <h3 className="text-base font-black text-slate-900">Paperless KYC Verification</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Upload a photo of your Driving License and Vehicle RC. Our verification team approves profiles within 15 minutes.
                </p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-left space-y-3 relative shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                  3
                </div>
                <h3 className="text-base font-black text-slate-900">Turn ON Cockpit & Earn</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Switch your Cockpit to ONLINE. Receive instant trip requests from passengers right near your location and collect daily payouts.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/register?role=DRIVER"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                <span>Register as Partner Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Driver FAQ Accordion ────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Everything you need to know about joining Ride Tracker as a driver partner.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left font-black text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronRight
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-90 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Bottom High-Converting Driver CTA Banner ────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-xs">
                <span>🎁 Special Welcome Incentive</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black max-w-2xl mx-auto leading-tight">
                Earn Your First ₹500 Bonus After Completing 10 Proximity Rides.
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto font-medium">
                Join thousands of driver partners who enjoy fair 88% direct earnings, daily settlements, and full respect.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/register?role=DRIVER"
                  style={{ color: '#064e3b' }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 !text-[#064e3b] font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span style={{ color: '#064e3b' }} className="font-black text-[#064e3b]">Join as Driver Partner Now</span>
                  <ArrowRight size={16} className="text-emerald-900 shrink-0" />
                </Link>
                <Link
                  to="/login?role=DRIVER"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm border border-white/20 transition-all active:scale-95 cursor-pointer"
                >
                  Open Driver Cockpit
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Unified Footer ── */}
      <Footer />
    </div>
  );
}
