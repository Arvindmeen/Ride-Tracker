import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { MapPin, Phone, Shield, Zap, DollarSign, Users } from 'lucide-react';

export default function Footer() {
  const { user, isAuthenticated, role } = useAuthStore();
  const activeRole = isAuthenticated ? (role || user?.role || 'USER') : null;

  return (
    <footer className="w-full bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80 mt-auto flex justify-center">
      {/* Main footer grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Brand column */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Veloq Logo"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-sky-500/20 border border-sky-500/30" />
              <div>
                <span className="font-black text-xl text-white tracking-tight block leading-none">Veloq India</span>
                <span className="text-[10px] text-slate-500 font-semibold">Real-Time Mobility Network</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              India's campus and metropolitan mobility network connecting students, city commuters, bike drivers, and operations centers with sub-second GPS telemetry.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · 99.98% SLA
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                <Shield size={10} /> Pan-India Network
              </span>
            </div>

            {/* Quick feature badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[{ icon: Zap, label: '< 35s Match', c: 'text-amber-400' }, { icon: DollarSign, label: '12% Fee', c: 'text-emerald-400' }, { icon: Users, label: '18 Partners', c: 'text-blue-400' }].map(({ icon: I, label, c }) => (
                <div key={label} className="bg-slate-900 rounded-xl p-2 text-center border border-slate-800">
                  <I size={14} className={`${c} mx-auto mb-0.5`} />
                  <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">
              {activeRole === 'DRIVER' ? 'Driver Hub' : activeRole === 'ADMIN' ? 'Operations' : activeRole === 'USER' ? 'My Rides' : 'Services'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {activeRole === 'USER' && (<>
                <li><Link to="/app/home" className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">Book a Ride</Link></li>
                <li><Link to="/app/trips" className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">My Past Trips</Link></li>
                <li><Link to="/app/profile" className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">Passenger Profile</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors hover:translate-x-0.5 inline-block">24/7 SOS Helpline</Link></li>
              </>)}
              {activeRole === 'DRIVER' && (<>
                <li><Link to="/driver/dashboard" className="hover:text-white transition-colors">Driver Cockpit</Link></li>
                <li><Link to="/driver/earnings" className="hover:text-white transition-colors">Daily Earnings &amp; UPI</Link></li>
                <li><Link to="/driver/requests" className="hover:text-white transition-colors">Incoming Dispatches</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Welfare &amp; Support</Link></li>
              </>)}
              {activeRole === 'ADMIN' && (<>
                <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Operations Radar</Link></li>
                <li><Link to="/admin/live-map" className="hover:text-white transition-colors">Fleet Live Map</Link></li>
                <li><Link to="/admin/drivers" className="hover:text-white transition-colors">Drivers Audit</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Dispatch Desk</Link></li>
              </>)}
              {!activeRole && (<>
                <li><Link to="/login" className="hover:text-white transition-colors">Book a Ride</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Drive &amp; Earn (12% Fee)</Link></li>
                <li><Link to="/#places-to-go" className="hover:text-white transition-colors">Campus Routes</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Helpline</Link></li>
              </>)}
            </ul>
          </div>

          {/* Campus Hubs column */}
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Campus &amp; Regions</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5"><MapPin size={11} className="text-blue-500 flex-shrink-0" /><span className="text-slate-300 font-semibold">IIT Kharagpur</span></li>
              <li><span className="text-slate-500">Kharagpur Jn Station</span></li>
              <li><span className="text-slate-500">Mumbai Metropolitan (BKC)</span></li>
              <li><span className="text-slate-500">Delhi NCR (IGI / Cyber City)</span></li>
              <li><span className="text-slate-500">Bengaluru Tech Corridor</span></li>
            </ul>
          </div>

          {/* Safety column */}
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Safety &amp; Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/contact" className="hover:text-white transition-colors">Emergency Hotline</Link></li>
              <li><span className="text-slate-500">12% Commission Charter</span></li>
              <li><span className="text-slate-500">Campus Toto Regulations</span></li>
              <li><span className="text-slate-500">Privacy &amp; Phone Masking</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <p>© 2026 Veloq Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center">
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <span>UPI Settlements</span>
            <span>Fastag Ready</span>
            <span className="flex items-center gap-1"><Phone size={10} /> SOS Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
