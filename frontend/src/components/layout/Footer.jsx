import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores';

export default function Footer() {
  const { user, isAuthenticated, role } = useAuthStore();
  const activeRole = isAuthenticated ? (role || user?.role || 'USER') : null;

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Col 1: Brand & Pan-India info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Veloq Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-md shadow-sky-500/20 border border-sky-500/30"
              />
              <span className="font-black text-xl text-white tracking-tight">Veloq India</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              India's real-time campus and metropolitan mobility network. Connecting students, daily city commuters, professional bike and cab drivers, and operations centers with sub-second geospatial telemetry.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pan-India & Campus Operations Live · 99.98% SLA
              </span>
            </div>
          </div>

          {/* Col 2: Role-Specific Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {activeRole === 'DRIVER'
                ? 'Driver Partner Hub'
                : activeRole === 'ADMIN'
                ? 'Operations Radar'
                : activeRole === 'USER'
                ? 'Passenger Mobility'
                : 'Mobility Services'}
            </h4>
            <ul className="space-y-2">
              {activeRole === 'USER' && (
                <>
                  <li><Link to="/app/home" className="hover:text-white transition-colors">Book a Ride</Link></li>
                  <li><Link to="/app/trips" className="hover:text-white transition-colors">My Past Trips</Link></li>
                  <li><Link to="/app/profile" className="hover:text-white transition-colors">Passenger Profile</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Helpline & SOS</Link></li>
                </>
              )}

              {activeRole === 'DRIVER' && (
                <>
                  <li><Link to="/driver/dashboard" className="hover:text-white transition-colors">Driver Cockpit</Link></li>
                  <li><Link to="/driver/earnings" className="hover:text-white transition-colors">Daily Earnings & UPI</Link></li>
                  <li><Link to="/driver/requests" className="hover:text-white transition-colors">Incoming Dispatches</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Driver Welfare & Support</Link></li>
                </>
              )}

              {activeRole === 'ADMIN' && (
                <>
                  <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Operations Radar</Link></li>
                  <li><Link to="/admin/live-map" className="hover:text-white transition-colors">Fleet Live Map</Link></li>
                  <li><Link to="/admin/drivers" className="hover:text-white transition-colors">Drivers Audit</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Dispatch Desk</Link></li>
                </>
              )}

              {!activeRole && (
                <>
                  <li><Link to="/login" className="hover:text-white transition-colors">Passenger Booking</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Drive With Us (12% Fee)</Link></li>
                  <li><Link to="/#places-to-go" className="hover:text-white transition-colors">Campus & City Hubs</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Helpline</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Campus & Regional Hubs */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Campus & Regions</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300 font-semibold">IIT Kharagpur Campus</span></li>
              <li><span className="text-slate-400">Kharagpur Jn Railway Station</span></li>
              <li><span className="text-slate-400">Mumbai Metropolitan (BKC/BOM)</span></li>
              <li><span className="text-slate-400">Delhi NCR (IGI T3/Cyber City)</span></li>
              <li><span className="text-slate-400">Bengaluru Tech Corridor</span></li>
            </ul>
          </div>

          {/* Col 4: Safety & Support */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Safety & Helplines</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Emergency Support Hotline
                </Link>
              </li>
              <li><span className="text-slate-400">Driver 12% Commission Charter</span></li>
              <li><span className="text-slate-400">Campus Toto Regulations</span></li>
              <li><span className="text-slate-400">Privacy & Phone Masking</span></li>
              <li><span className="text-slate-400">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment security */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Veloq Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-300">Contact Us</Link>
            <span className="hover:text-slate-300">UPI Instant Settlements</span>
            <span className="hover:text-slate-300">Fastag Integrated</span>
            <span className="hover:text-slate-300">Safety SOS Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
