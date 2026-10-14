import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AdminSimulationBanner from '@/components/common/AdminSimulationBanner';
import DriverIncomingToast from '@/components/driver/DriverIncomingToast';
import { clsx } from 'clsx';

export default function DriverLayout() {
  const location = useLocation();
  const isCockpit = location.pathname === '/driver/dashboard' || location.pathname === '/driver';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans w-full max-w-full overflow-x-hidden">
      {/* ── Single Unified Navbar across Driver Panel & Whole Platform ── */}
      <Navbar />

      {/* ── Admin Inspection Banner (Active only when Admin tests Driver Cockpit) ── */}
      <AdminSimulationBanner />

      {/* ── Incoming Ride Dispatch Toast (Active Anywhere in Driver Panel) ── */}
      <DriverIncomingToast />

      {/* ── Content Area ── */}
      <main className={clsx("flex-1", isCockpit ? "pb-0 overflow-hidden" : "pb-12")}>
        <Outlet />
      </main>
    </div>
  );
}
