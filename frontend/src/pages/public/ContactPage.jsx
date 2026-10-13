import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertTriangle,
  GraduationCap, Building2, ShieldCheck, HelpCircle, MessageSquare,
  ArrowRight, ExternalLink, Shield, Sparkles, Car, Zap, Check, RotateCcw
} from 'lucide-react';

const QUICK_TOPICS = [
  { id: 'lost_item', label: '🛺 Lost Item inside Toto / Cab', topic: 'campus_toto', role: 'passenger' },
  { id: 'fare_dispute', label: '💳 Fare / UPI Payment Clarification', topic: 'booking_help', role: 'passenger' },
  { id: 'driver_payout', label: '💵 Driver Partner Payout & KYC', topic: 'driver_onboard', role: 'driver' },
  { id: 'station_transfer', label: '✈️ Airport / KGP Station Pre-booking', topic: 'station_airport', role: 'passenger' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'passenger', // 'passenger' | 'driver' | 'iit_student' | 'corporate'
    topic: 'booking_help',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setTicketId(`RT-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
  };

  const selectQuickTopic = (item) => {
    setFormData((f) => ({
      ...f,
      role: item.role,
      topic: item.topic,
      message: f.message ? f.message : `Inquiry regarding: ${item.label.replace(/^[^\s]+\s/, '')}. `,
    }));
  };

  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-900 font-sans">
      {/* ── Pristine White Hero Section (Light, Clean, Elegant) ───────────── */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-14 sm:pt-16 sm:pb-18 relative overflow-hidden">
        {/* Soft Ambient Subtle Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200/80 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24/7 Pan-India & Campus Operations Support</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            How Can Our Dispatch Team Assist You?
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3.5 leading-relaxed font-medium">
            Whether you are booking a Toto inside IIT Kharagpur, navigating Mumbai highway routes, or setting up corporate accounts, our live dispatch officers are standing by 24/7.
          </p>

          {/* Key Reliability Metric Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-emerald-600">⚡</span>
              <span>&lt; 3 Min Avg Response Time</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-blue-600">🛡️</span>
              <span>24/7 Toll-Free Escalation</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-purple-600">🎓</span>
              <span>Dedicated Campus Nodes</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-rose-600">📞</span>
              <span>National Emergency 112 Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Instant Topic Shortcuts ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 sm:p-4">
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2.5 px-1">
            Fast Track Inquiries · Click to auto-fill details:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {QUICK_TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectQuickTopic(item)}
                className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 transition-all cursor-pointer truncate"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Helpdesk & Contact Grid ──────────────────────────────────── */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── Left Column: Direct Official Channels ──────────────────────── */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Live Support Channels
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2.5">Direct Operations Desk</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">All hotlines connect directly with verified human dispatch officers.</p>
            </div>

            <div className="space-y-3">
              {/* 24/7 Hotline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-500">National Dispatch Hotline</p>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded">Toll-Free</span>
                      </div>
                      <p className="text-base font-black text-slate-900 mt-0.5">+91 (022) 8000-RIDE (7433)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Instant live trip escalations & booking assistance</p>
                    </div>
                  </div>
                  <a
                    href="tel:+9102280007433"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Call
                  </a>
                </div>
              </div>

              {/* Campus Node */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-500">IIT Kharagpur Helpdesk</p>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded">Campus Node</span>
                      </div>
                      <p className="text-base font-black text-slate-900 mt-0.5">+91 94340-KGP-RIDE</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Technology Market (Tech Mkt), IIT KGP 721302</p>
                    </div>
                  </div>
                  <a
                    href="tel:+919434054774"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Call
                  </a>
                </div>
              </div>

              {/* Official Email */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-500">Electronic Support Desk</p>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">&lt; 15m SLA</span>
                      </div>
                      <p className="text-base font-black text-slate-900 mt-0.5">support@ridetracker.in</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Driver KYC verification, tax invoices & corporate fleet</p>
                    </div>
                  </div>
                  <a
                    href="mailto:support@ridetracker.in"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>

              {/* Emergency Police/SOS Box */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-rose-900">National Emergency Services</p>
                      <p className="text-[11px] text-rose-700 font-medium">Police, Fire & Medical Instant Escalation</p>
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs active:scale-95 shrink-0"
                  >
                    Dial 112
                  </a>
                </div>
              </div>
            </div>

            {/* Regional Operating Hubs */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Major Regional Operations Hubs</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Mumbai HQ</p>
                  <p className="text-[10px] text-slate-500">BKC Finance Hub, MH 400051</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Bengaluru Tech</p>
                  <p className="text-[10px] text-slate-500">Koramangala 5th Block, KA 560095</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Delhi NCR</p>
                  <p className="text-[10px] text-slate-500">Cyber City Gurugram, HR 122002</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="font-bold text-slate-900">Kolkata Node</p>
                  <p className="text-[10px] text-slate-500">Sector V Salt Lake, WB 700091</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Dispatch Ticket Form ───────────────── */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Generate Dispatch Ticket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated queue routes directly to on-duty city dispatchers.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Officers Online</span>
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Ticket Logged & Assigned
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">Ticket #{ticketId}</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    Thank you, <strong>{formData.name || 'User'}</strong>. Your inquiry has been routed to our live dispatcher. A confirmation and response has been sent to <strong>{formData.email}</strong>.
                  </p>
                </div>
                <div className="p-3.5 max-w-sm mx-auto rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1">
                  <p><strong>Department:</strong> {formData.topic.replace(/_/g, ' ').toUpperCase()}</p>
                  <p><strong>Estimated First Callback:</strong> &lt; 15 Minutes</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', role: 'passenger', topic: 'booking_help', message: '' });
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-md"
                >
                  <RotateCcw size={14} />
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4.5">
                {/* Role Picker Buttons */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">I am reaching out as a:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'passenger', label: 'Passenger', icon: '👤' },
                      { id: 'driver', label: 'Driver Partner', icon: '🚖' },
                      { id: 'iit_student', label: 'IIT Student/Faculty', icon: '🎓' },
                      { id: 'corporate', label: 'Enterprise Fleet', icon: '🏢' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r.id })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          formData.role === r.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="truncate">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajesh@ridetracker.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Phone & Inquiry Department */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Inquiry Department</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                    >
                      <option value="booking_help">Ride Booking & Fare Clarification</option>
                      <option value="campus_toto">IIT Kharagpur Campus Toto & Lost Items</option>
                      <option value="driver_onboard">Driver Partner Registration & Payouts</option>
                      <option value="station_airport">KGP Junction & Kolkata Airport Transfers</option>
                      <option value="corporate_acct">Corporate Monthly Invoicing & Billing</option>
                      <option value="safety_report">Safety Incident or Route Deviation Report</option>
                    </select>
                  </div>
                </div>

                {/* Details Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Message / Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how our operations officers can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Send size={15} />
                  <span>Submit Dispatch Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
