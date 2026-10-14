import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminSimulationBanner from '@/components/common/AdminSimulationBanner';

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans w-full max-w-full overflow-x-hidden">
      {/* ── Unified Navbar across the entire website ── */}
      <Navbar />

      {/* ── Admin Inspection Banner (Active only when Admin tests Rider App) ── */}
      <AdminSimulationBanner />

      {/* ── Main Passenger Route Content ── */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* ── Unified Footer ── */}
      <Footer />
    </div>
  );
}
