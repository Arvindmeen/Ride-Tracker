import { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Crosshair, CheckCircle2, AlertTriangle,
  X, Loader2, Sparkles, ArrowRight
} from 'lucide-react';
import { useMapStore, useBookingStore } from '@/stores';
import { locationService } from '@/services';
import { clsx } from 'clsx';

export default function LocationToast() {
  const { userLocation, setUserLocation } = useMapStore();
  const { setPickup } = useBookingStore();

  // 'PROMPT' | 'DETECTING' | 'SUCCESS' | 'ERROR' | 'CLOSED'
  const [toastState, setToastState] = useState('CLOSED');
  const [detectedPlace, setDetectedPlace] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user already dismissed or detected location in this session
    const hasAsked = sessionStorage.getItem('ridetracker_location_asked');
    if (!hasAsked) {
      // Show prompt toast after a brief natural delay (600ms) on opening website
      const timer = setTimeout(() => {
        setToastState('PROMPT');
        sessionStorage.setItem('ridetracker_location_asked', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setToastState('ERROR');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setToastState('DETECTING');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode to get city and area name
          const geo = await locationService.reverseGeocode(lat, lng);
          const placeName = geo?.name || geo?.city || `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
          const address = geo?.address || placeName;
          const city = geo?.city || 'Your Area';

          const newLoc = {
            lat,
            lng,
            name: placeName,
            address,
            city,
            state: geo?.state || '',
            isGpsDetected: true,
          };

          // Update global map store (triggers drivers generation around user)
          setUserLocation(newLoc);

          // Update booking store pickup
          if (setPickup) {
            setPickup({
              lat,
              lng,
              name: placeName,
              address,
            });
          }

          setDetectedPlace(placeName);
          setToastState('SUCCESS');

          // Auto-close success toast after 5 seconds
          setTimeout(() => {
            setToastState('CLOSED');
          }, 5000);
        } catch (err) {
          // Fallback with coordinates
          const placeName = `Live Coordinates (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;
          setUserLocation({
            lat,
            lng,
            name: placeName,
            address: 'Detected GPS Location',
            city: 'Current Area',
            state: '',
            isGpsDetected: true,
          });
          setDetectedPlace(placeName);
          setToastState('SUCCESS');
          setTimeout(() => {
            setToastState('CLOSED');
          }, 5000);
        }
      },
      (err) => {
        setToastState('ERROR');
        let msg = 'Location access was denied or unavailable.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please allow location in your browser address bar to find nearest rides.';
        } else if (err.code === 2) {
          msg = 'Unable to determine your current location. Please search your pickup manually.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or select your city manually.';
        }
        setErrorMessage(msg);
        // Auto-close error after 7 seconds
        setTimeout(() => {
          setToastState('CLOSED');
        }, 7000);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const handleDismiss = () => {
    setToastState('CLOSED');
  };

  if (toastState === 'CLOSED') return null;

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-[9999] w-[calc(100vw-2rem)] sm:w-96 transition-all duration-300 ease-out transform',
        toastState !== 'CLOSED' ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      )}
      role="alert"
    >
      {/* ── 1. PROMPT STATE: Ask User to Allow Location ──────────────────────── */}
      {toastState === 'PROMPT' && (
        <div className="bg-white/95 backdrop-blur-xl border border-blue-200/90 rounded-2xl p-4 shadow-2xl shadow-blue-900/15 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 shadow-xs relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20" />
              <img src="/toto-logo.svg" alt="Toto" className="w-7 h-7 object-contain drop-shadow-xs" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Find Nearest Rides
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                Allow Location for Live Nearest Toto & Cabs?
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Allow your live location to instantly discover nearest available Totos, Autos & Cabs around you with zero surge.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleRequestLocation}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crosshair size={13} className="text-blue-100" />
                  <span>Allow & Detect</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. DETECTING STATE: Loading Animation ────────────────────────────── */}
      {toastState === 'DETECTING' && (
        <div className="bg-white/95 backdrop-blur-xl border border-blue-200 rounded-2xl p-4 shadow-2xl shadow-blue-900/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
              <Loader2 size={20} className="animate-spin text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-slate-900">Detecting exact GPS coordinates...</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Searching nearest Toto & cab drivers in your area</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. SUCCESS STATE: Location Detected ──────────────────────────────── */}
      {toastState === 'SUCCESS' && (
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-200 rounded-2xl p-4 shadow-2xl shadow-emerald-900/15 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 shadow-xs">
              <CheckCircle2 size={20} />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Location Detected ✓
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 truncate">
                {detectedPlace || 'Location Synced'}
              </h4>
              <p className="text-[11px] text-emerald-800 font-semibold mt-0.5 leading-relaxed">
                Found nearest available Toto & cab rides in your area. Live GPS active!
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── 4. ERROR STATE: Location Access Denied ───────────────────────────── */}
      {toastState === 'ERROR' && (
        <div className="bg-white/95 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 shadow-2xl shadow-amber-900/15 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-xs">
              <AlertTriangle size={19} />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Location Disabled
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Location Access Needed
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {errorMessage || 'Location permission was denied. You can still select your pickup city or campus manually on the map.'}
              </p>
              <button
                onClick={handleRequestLocation}
                className="mt-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Try allowing location again</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
