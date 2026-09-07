import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import UserLayout from '@/layouts/UserLayout';
import DriverLayout from '@/layouts/DriverLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ContactPage from '@/pages/public/ContactPage';

// User pages
import UserHome from '@/pages/user/UserHome';
import LiveRidePage from '@/pages/user/LiveRidePage';
import TripsPage from '@/pages/user/TripsPage';
import UserProfile from '@/pages/user/UserProfile';

// Driver pages
import DriverDashboard from '@/pages/driver/DriverDashboard';
import DriverRequests from '@/pages/driver/DriverRequests';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverRideActivePage from '@/pages/driver/DriverRideActivePage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLiveMap from '@/pages/admin/AdminLiveMap';
import AdminRides from '@/pages/admin/AdminRides';
import AdminDrivers from '@/pages/admin/AdminDrivers';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPricing from '@/pages/admin/AdminPricing';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminIncidents from '@/pages/admin/AdminIncidents';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

// Role-based route guard
function RequireRole({ role, children }) {
  const { isAuthenticated, role: userRole } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && userRole !== role && userRole !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

// Simple settings stub
function SettingsPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-lg font-bold text-slate-900 mb-4">Settings</h1>
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {['Theme', 'Language', 'Notifications', 'Privacy', 'About'].map(s => (
          <div key={s} className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
            <span>{s}</span><span className="text-slate-400">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TripDetailPage() {
  return <div className="p-6 text-center text-slate-500 py-16">Trip detail coming soon</div>;
}

function DriverProfilePage() {
  const { user } = useAuthStore();
  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-20">
      <h1 className="text-lg font-bold text-slate-900">Driver Profile</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <p className="text-amber-500 text-sm font-medium">★ 4.82 · 3,842 rides</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {['Vehicle details', 'Documents', 'Bank account', 'Earnings history', 'Support'].map(s => (
          <div key={s} className="flex justify-between items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
            <span>{s}</span><span className="text-slate-400">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Reset password</h1>
        <p className="text-sm text-slate-500 mb-4">Enter your email and we'll send a reset link.</p>
        <input type="email" placeholder="you@example.com" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
        <button className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">Send reset link</button>
      </div>
    </div>
  );
}

function AdminSettingsPage() {
  return <div className="p-6"><h1 className="text-lg font-bold text-slate-900 mb-4">Admin Settings</h1><div className="text-sm text-slate-500">Platform configuration, zones, pricing rules, notification settings</div></div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* User app */}
          <Route path="/app" element={<RequireRole role="USER"><UserLayout /></RequireRole>}>
            <Route index element={<Navigate to="/app/home" replace />} />
            <Route path="home" element={<UserHome />} />
            <Route path="book" element={<UserHome />} />
            <Route path="ride/:id" element={<LiveRidePage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="trips/:id" element={<TripDetailPage />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Driver app */}
          <Route path="/driver" element={<RequireRole role="DRIVER"><DriverLayout /></RequireRole>}>
            <Route index element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="requests" element={<DriverRequests />} />
            <Route path="ride/:id" element={<DriverRideActivePage />} />
            <Route path="earnings" element={<DriverEarnings />} />
            <Route path="profile" element={<DriverProfilePage />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin" element={<RequireRole role="ADMIN"><AdminLayout /></RequireRole>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="live-map" element={<AdminLiveMap />} />
            <Route path="rides" element={<AdminRides />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="incidents" element={<AdminIncidents />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
