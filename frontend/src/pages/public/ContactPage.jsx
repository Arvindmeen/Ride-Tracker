import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertTriangle,
  GraduationCap, Building2, ShieldCheck, HelpCircle, MessageSquare,
  ArrowRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            24/7 Pan-India & Campus Operations
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            How Can Our Dispatch Team Assist You?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Whether you are booking a Toto inside IIT Kharagpur, driving in Mumbai, or setting up corporate fleet accounts across India, our support officers are on standby.
          </p>
        </div>
      </section>

      {/* ── Main Content Grid ────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Helplines & Offices */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Instant Helplines
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Direct Contact Channels</h2>
              <p className="text-xs text-slate-500 mt-1">Average response time: under 3 minutes.</p>
            </div>

            <div className="space-y-3.5">
              {/* 24/7 Hotline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">24/7 Pan-India Operations Hotline</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">+91 (022) 8000-RIDE (7433)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Toll-free emergency & ride booking assistance</p>
                </div>
              </div>

              {/* Campus Node */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">IIT Kharagpur Campus Helpdesk</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">+91 94340-KGP-RIDE</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Technology Market (Tech Mkt), IIT Kharagpur, WB 721302</p>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Official Electronic Inquiries</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">support@veloq.in</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Partnership, driver compliance, and corporate billing</p>
                </div>
              </div>
            </div>

            {/* Regional Hub Locations */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Hubs</h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Mumbai HQ</p>
                  <p className="text-[11px] text-slate-500">BKC Finance Hub, MH 400051</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Bengaluru Tech</p>
                  <p className="text-[11px] text-slate-500">Koramangala 5th Block, KA 560095</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Delhi NCR</p>
                  <p className="text-[11px] text-slate-500">Cyber City Gurugram, HR 122002</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-900">Kolkata</p>
                  <p className="text-[11px] text-slate-500">Sector V Salt Lake, WB 700091</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dispatch Ticket Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900 mb-1">Generate Dispatch Ticket</h2>
            <p className="text-xs text-slate-500 mb-6">Our automated safety and operations queue routes tickets immediately.</p>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Inquiry Logged & Dispatched</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name || 'User'}</strong>. Your ticket <strong>#RT-{Math.floor(100000 + Math.random() * 900000)}</strong> has been assigned to our live city dispatcher. We will reach out to <strong>{formData.email}</strong> within 15 minutes.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', role: 'passenger', topic: 'booking_help', message: '' });
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Arvind Meena"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="arvind@iitkgp.ac.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="passenger">Passenger / Rider</option>
                      <option value="iit_student">IIT Kharagpur Student / Faculty</option>
                      <option value="driver">Driver Partner (Bike/Cab/Toto)</option>
                      <option value="corporate">Corporate / Enterprise Fleet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Inquiry Department</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="booking_help">Ride Booking & Fare Clarification</option>
                    <option value="campus_toto">IIT Kharagpur Campus Toto & Lost Item</option>
                    <option value="driver_onboard">Driver Partner Registration & Payouts</option>
                    <option value="station_airport">KGP Junction & Kolkata Airport Transfers</option>
                    <option value="corporate_acct">Corporate Monthly Invoicing & Billing</option>
                    <option value="safety_report">Safety Incident or Route Deviation Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how our operations team can assist your journey..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Send size={16} />
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
