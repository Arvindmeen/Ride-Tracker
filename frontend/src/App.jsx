import React, { Component, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import LocationToast from '@/components/common/LocationToast';
import MaintenanceBanner from '@/components/common/MaintenanceBanner';

// Role-based route guard — strict: each role stays in its own section
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function RequireRole({ role, children }) {
  const { isAuthenticated, role: userRole, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const target = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${target}`} replace />;
  }

  // Superuser Clearance:
  // If the logged-in user is an Operations Administrator (user?.role === 'ADMIN' or userRole === 'ADMIN'),
  // they possess administrative privilege to view, test, and monitor ALL sections:
  // - Admin Hub (/admin/*)
  // - Driver Cockpit & Dispatches (/driver/*)
  // - Passenger App & Bookings (/app/*)
  // They are never blocked, trapped, or redirected away from any route!
  const isSuperAdmin = user?.role === 'ADMIN' || userRole === 'ADMIN';
  if (isSuperAdmin) {
    return children;
  }

  // For non-admin roles (DRIVER, USER), enforce strict role isolation
  if (role && userRole !== role) {
    if (userRole === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/app/home" replace />;
  }
  return children;
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/app/home';
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Return to Ride
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import UserLayout from '@/layouts/UserLayout';
import DriverLayout from '@/layouts/DriverLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import DriverLandingPage from '@/pages/public/DriverLandingPage';
import AdminLandingPage from '@/pages/public/AdminLandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ContactPage from '@/pages/public/ContactPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';

// User pages
import UserHome from '@/pages/user/UserHome';
import LiveRidePage from '@/pages/user/LiveRidePage';
import TripsPage from '@/pages/user/TripsPage';
import TripDetailPage from '@/pages/user/TripDetailPage';
import UserProfile from '@/pages/user/UserProfile';
import UserSettingsPage from '@/pages/user/UserSettingsPage';

// Driver pages
import DriverDashboard from '@/pages/driver/DriverDashboard';
import DriverRequests from '@/pages/driver/DriverRequests';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverRideActivePage from '@/pages/driver/DriverRideActivePage';
import DriverProfilePage from '@/pages/driver/DriverProfilePage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLiveMap from '@/pages/admin/AdminLiveMap';
import AdminRides from '@/pages/admin/AdminRides';
import AdminDrivers from '@/pages/admin/AdminDrivers';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPricing from '@/pages/admin/AdminPricing';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminIncidents from '@/pages/admin/AdminIncidents';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

export default function App() {
  const { token, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token, fetchCurrentUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <MaintenanceBanner />
          <LocationToast />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/drive" element={<DriverLandingPage />} />
            <Route path="/driver/landing" element={<DriverLandingPage />} />
            <Route path="/admin-portal" element={<AdminLandingPage />} />
            <Route path="/admin/landing" element={<AdminLandingPage />} />
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
              <Route path="settings" element={<UserSettingsPage />} />
            </Route>

            <Route path="/driver" element={<RequireRole role="DRIVER"><DriverLayout /></RequireRole>}>
              <Route index element={<Navigate to="/driver/dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="requests" element={<DriverRequests />} />
              <Route path="ride" element={<DriverRideActivePage />} />
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
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
