import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, ArrowRight, Zap, Activity, Car, Phone,
  Shield, ShieldCheck, DollarSign, Navigation, Lock,
  GraduationCap, Building2,
  QrCode, Crosshair, Plane, Train, Hospital, ShoppingBag, X,
  TrendingUp, Star, Terminal, Radio, ExternalLink, Send, Check,
  Cpu, Globe2, BatteryCharging, Leaf, HeartPulse, RefreshCw,
  Sparkles, ChevronRight, Award, Compass, AlertCircle
} from 'lucide-react';
import { useAuthStore, useMapStore, useBookingStore } from '@/stores';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const LiveMap = React.lazy(() => import('@/components/map/LiveMap'));

/* ─── Regional Hubs ─────────────────────────────────────────────────────────── */
const REGIONAL_HUBS = [
  {
    id: 'kgp',
    name: 'IIT Kharagpur',
    state: 'West Bengal',
    locality: 'Scholars Avenue, IIT KGP',
    lat: 22.3149,
    lng: 87.3060,
    hotspots: [
      { id: 'tech_mkt', name: 'Technology Market', icon: ShoppingBag, badge: 'Campus', dist: 2.2, mins: 6, fare: 25, drop: 'Technology Market, IIT KGP', desc: 'Evening stalls, student stationery, and daily essentials' },
      { id: 'kgp_stn', name: 'Kharagpur Jn Station', icon: Train, badge: 'IRCTC Rail', dist: 5.2, mins: 14, fare: 80, drop: 'Kharagpur Jn Railway Station', desc: 'Platform 1 main gate & luggage drop zone' },
      { id: 'nalanda', name: 'Nalanda Complex', icon: GraduationCap, badge: 'Academic', dist: 1.8, mins: 5, fare: 18, drop: 'Nalanda Classroom Complex', desc: 'Morning lecture rush · 45s priority dispatch' },
      { id: 'bc_roy', name: 'Dr. B.C. Roy Hospital', icon: Hospital, badge: '24/7 Med', dist: 1.4, mins: 4, fare: 20, drop: 'Dr. B.C. Roy Multi-Specialty Hospital', desc: 'Zero-wait emergency healthcare corridor' },
      { id: 'midnapore', name: 'Midnapore Collectorate', icon: Building2, badge: 'District', dist: 14.6, mins: 28, fare: 220, drop: 'Midnapore District Collectorate', desc: 'District administrative courts & regional bus depot' },
      { id: 'ccu_air', name: 'Kolkata Airport (CCU)', icon: Plane, badge: 'Outstation', dist: 124, mins: 135, fare: 2680, drop: 'Netaji Subhash Chandra Bose Airport CCU T2', desc: 'Direct NH-16 high-speed expressway transfer' },
    ],
    drivers: [
      { id: 1, name: 'Subhash M.', vehicle: 'Hero Splendor EV', icon: '🏍️', dist: '0.3 km', eta: '1 min', r: 30, angle: 45, rating: 4.94, battery: 94 },
      { id: 2, name: 'Raju Toto', vehicle: 'Solar E-Toto #08', icon: '🛺', dist: '0.7 km', eta: '3 min', r: 52, angle: 135, rating: 4.91, battery: 88 },
      { id: 3, name: 'Arjun C.', vehicle: 'Tata Tigor EV Cab', icon: '🚗', dist: '1.4 km', eta: '5 min', r: 72, angle: 220, rating: 4.96, battery: 76 },
      { id: 4, name: 'Priya Verma', vehicle: 'Ather 450X EV', icon: '🏍️', dist: '0.9 km', eta: '3 min', r: 42, angle: 310, rating: 4.98, battery: 91 },
    ]
  },
  {
    id: 'delhi',
    name: 'New Delhi NCR',
    state: 'Delhi UT',
    locality: 'Connaught Place & IIT Delhi Corridor',
    lat: 28.6139,
    lng: 77.2090,
    hotspots: [
      { id: 'iit_delhi', name: 'IIT Delhi Hauz Khas', icon: GraduationCap, badge: 'Tech Node', dist: 8.4, mins: 18, fare: 135, drop: 'IIT Delhi Main Gate, Hauz Khas', desc: 'Metro station gate 1 rapid connection' },
      { id: 'ndls', name: 'New Delhi Rly Station', icon: Train, badge: 'IRCTC Rail', dist: 3.1, mins: 9, fare: 45, drop: 'New Delhi Railway Station Ajmeri Gate', desc: 'Vande Bharat and Rajdhani express connections' },
      { id: 'igi_t3', name: 'IGI Airport Terminal 3', icon: Plane, badge: 'Intl Airport', dist: 16.5, mins: 32, fare: 380, drop: 'Indira Gandhi International Airport T3', desc: 'Direct Airport Express elevated lane' },
    ],
    drivers: [
      { id: 11, name: 'Virender K.', vehicle: 'Tata Nexon EV Prime', icon: '🚗', dist: '0.5 km', eta: '2 min', r: 35, angle: 60, rating: 4.95, battery: 85 },
      { id: 12, name: 'Amit Solanki', vehicle: 'Ola S1 Pro Gen 2', icon: '🏍️', dist: '0.8 km', eta: '3 min', r: 48, angle: 170, rating: 4.89, battery: 92 },
      { id: 13, name: 'Manish Kumar', vehicle: 'Mahindra Treo E-Auto', icon: '🛺', dist: '0.4 km', eta: '1 min', r: 28, angle: 260, rating: 4.92, battery: 80 },
    ]
  },
  {
    id: 'blr',
    name: 'Bengaluru Tech Corridor',
    state: 'Karnataka',
    locality: 'Electronic City & Silk Board Junction',
    lat: 12.9716,
    lng: 77.5946,
    hotspots: [
      { id: 'ecity_phase1', name: 'Infosys Main Campus', icon: Building2, badge: 'Campus', dist: 4.8, mins: 12, fare: 65, drop: 'Infosys Gate 1, Electronic City Ph 1', desc: 'Dedicated corporate employee fast-drop' },
      { id: 'koramangala', name: 'Koramangala 5th Block', icon: ShoppingBag, badge: 'Startup Hub', dist: 7.2, mins: 19, fare: 110, drop: 'Koramangala 80ft Road Junction', desc: 'Incubators, tech cafes, and co-working hubs' },
      { id: 'kiaal_air', name: 'Kempegowda Intl Airport', icon: Plane, badge: 'Airport', dist: 48.0, mins: 65, fare: 1150, drop: 'BLR Airport Terminal 1 & 2', desc: 'Hebbal Flyover high-speed corridor' },
    ],
    drivers: [
      { id: 21, name: 'Chethan Gowda', vehicle: 'Ather 450 Apex', icon: '🏍️', dist: '0.3 km', eta: '1 min', r: 32, angle: 25, rating: 4.97, battery: 96 },
      { id: 22, name: 'Basavaraj P.', vehicle: 'MG ZS EV Green', icon: '🚗', dist: '1.1 km', eta: '4 min', r: 60, angle: 140, rating: 4.94, battery: 82 },
    ]
  },
  {
    id: 'mum',
    name: 'Mumbai MMR',
    state: 'Maharashtra',
    locality: 'BKC & International Terminal',
    lat: 19.0760,
    lng: 72.8777,
    hotspots: [
      { id: 'bkc_ifsc', name: 'BKC Financial Center', icon: Building2, badge: 'IFSC Hub', dist: 2.5, mins: 7, fare: 45, drop: 'SEBI Bhavan / Jio World Centre, BKC', desc: 'Zero-emission corporate fleet corridor' },
      { id: 'bom_t2', name: 'Mumbai Airport (CSMIA T2)', icon: Plane, badge: 'Airport', dist: 6.8, mins: 16, fare: 160, drop: 'CSMIA Terminal 2 International Departure', desc: 'Western Express Highway elevated lane' },
    ],
    drivers: [
      { id: 31, name: 'Sachin Patil', vehicle: 'Tata Express-T EV', icon: '🚗', dist: '0.4 km', eta: '2 min', r: 34, angle: 80, rating: 4.96, battery: 78 },
      { id: 32, name: 'Ganesh More', vehicle: 'TVS iQube Electric', icon: '🏍️', dist: '0.6 km', eta: '2 min', r: 46, angle: 200, rating: 4.91, battery: 94 },
    ]
  }
];

/* ─── Vehicle Services ───────────────────────────────────────────────────────── */
const VEHICLE_SERVICES = [
  { id: 'toto', name: 'Solar E-Toto', icon: '🛺', basePrice: 20, pricePerKm: 8, eta: '1 min', tag: 'Campus & Micro-Mobility' },
  { id: 'bike', name: 'Electric Bike', icon: '🏍️', basePrice: 15, pricePerKm: 6, eta: '2 mins', tag: 'Fastest Solo Commute' },
  { id: 'sedan', name: 'Prime EV Cab', icon: '🚗', basePrice: 60, pricePerKm: 14, eta: '4 mins', tag: 'AC Executive Comfort' },
  { id: 'outstation', name: 'Green Express', icon: '🛣️', basePrice: 650, pricePerKm: 15, eta: '10 min', tag: 'Intercity Highway' },
];

/* ─── Live Radar Widget (Self-Contained & Symmetrical) ───────────────────────── */
function LiveRadarWidget({ hub, onOpenMap, selectedDriver, onSelectDriver }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 45);
    return () => clearInterval(id);
  }, []);

  const sweepAngle = (tick * 2.2) % 360;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md border border-slate-800 flex flex-col justify-between h-full min-h-[460px]">
      {/* Radar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Live Fleet Radar</h3>
            <p className="text-[11px] text-slate-400">{hub.name} · {hub.drivers.length} Units Online</p>
          </div>
        </div>
        <button onClick={onOpenMap}
          className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all">
          <ExternalLink size={13} /> Fullscreen Map
        </button>
      </div>

      {/* Radar Scanner Center */}
      <div className="relative flex items-center justify-center py-6 sm:py-10 my-auto">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          {[100, 75, 50, 25].map(r => (
            <div key={r} className="absolute rounded-full border border-emerald-500/20 top-1/2 left-1/2"
              style={{ width: `${r}%`, height: `${r}%`, transform: 'translate(-50%, -50%)' }} />
          ))}

          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-emerald-500/15" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-full w-px bg-emerald-500/15" />
          </div>

          {/* Radar Sweep */}
          <div className="absolute top-1/2 left-1/2 origin-left pointer-events-none z-10"
            style={{ width: '50%', transform: `translateY(-50%) rotate(${sweepAngle}deg)` }}>
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, rgba(52,211,153,0.9), transparent)' }} />
          </div>
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: `conic-gradient(from ${sweepAngle - 60}deg, rgba(52,211,153,0.16), rgba(52,211,153,0.01), transparent 60deg)`
          }} />

          {/* User Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-[7px]">📍</div>
            <div className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping" />
          </div>

          {/* Driver Pings */}
          {hub.drivers.map(driver => {
            const rad = (driver.angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * driver.r / 2;
            const cy = 50 + Math.sin(rad) * driver.r / 2;
            const isSel = selectedDriver?.id === driver.id;

            return (
              <div key={driver.id} onClick={() => onSelectDriver(driver)}
                className="absolute z-30 cursor-pointer group"
                style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shadow-md transition-all group-hover:scale-110 ${
                  isSel ? 'bg-blue-600 border-white ring-4 ring-blue-500/30' : 'bg-slate-800 border-emerald-400'
                }`}>
                  {driver.icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Driver Telemetry Strip */}
      <div className="bg-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between border border-slate-700/60 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
            {selectedDriver ? selectedDriver.icon : hub.drivers[0]?.icon}
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {selectedDriver ? selectedDriver.name : hub.drivers[0]?.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {selectedDriver ? selectedDriver.vehicle : hub.drivers[0]?.vehicle} · Battery {selectedDriver?.battery || 92}%
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-emerald-400">
            {selectedDriver ? selectedDriver.dist : hub.drivers[0]?.dist} ({selectedDriver ? selectedDriver.eta : hub.drivers[0]?.eta})
          </p>
          <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
            ★ {selectedDriver ? selectedDriver.rating : hub.drivers[0]?.rating}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Fullscreen Map Modal ───────────────────────────────────────────────────── */
function MapModal({ open, onClose, center, pickup, destination, detectGPS }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl sm:mx-4 bg-white sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">National Fleet Map</h3>
            <p className="text-xs text-slate-500">Live GPS & NavIC Satellite Navigation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="h-[65vh] sm:h-[70vh]">
          <React.Suspense fallback={<div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-semibold">Loading Satellite Map...</div>}>
            <LiveMap center={center} zoom={15} pickup={pickup} destination={destination} showSurgeZones tileTheme="light" height="100%" onRecenterGPS={detectGPS} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role: userRole, isAuthenticated, login } = useAuthStore();
  const { setPickup, setDestination, setCategory, setEstimatedFare, setStep } = useBookingStore();
  const { setRegion, startSimulation } = useMapStore();
  const activeRole = isAuthenticated ? (userRole || user?.role || 'USER') : null;

  const [selectedHub, setSelectedHub] = useState(REGIONAL_HUBS[0]);
  const [selectedHotspot, setSelectedHotspot] = useState(REGIONAL_HUBS[0].hotspots[0]);
  const [selectedService, setSelectedService] = useState(VEHICLE_SERVICES[0]);
  const [selectedDriver, setSelectedDriver] = useState(REGIONAL_HUBS[0].drivers[0]);

  const [liveLocation, setLiveLocation] = useState({
    lat: REGIONAL_HUBS[0].lat,
    lng: REGIONAL_HUBS[0].lng,
    name: REGIONAL_HUBS[0].locality,
    locality: `${REGIONAL_HUBS[0].name}, ${REGIONAL_HUBS[0].state}`,
    isLive: false,
    loading: false,
  });

  const [pickupText, setPickupText] = useState(`📍 ${REGIONAL_HUBS[0].locality}`);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [portalTab, setPortalTab] = useState('rider');
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleHubSelect = (hub) => {
    setSelectedHub(hub);
    setSelectedHotspot(hub.hotspots[0]);
    setSelectedDriver(hub.drivers[0]);
    setLiveLocation({
      lat: hub.lat,
      lng: hub.lng,
      name: hub.locality,
      locality: `${hub.name}, ${hub.state}`,
      isLive: false,
      loading: false,
    });
    setPickupText(`📍 ${hub.locality}`);
    setRegion(hub.id.toUpperCase(), { lat: hub.lat, lng: hub.lng }, 15);
  };

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setLiveLocation(p => ({ ...p, loading: true }));
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLiveLocation({ lat, lng, name: 'Live GPS', locality: 'Detected GPS Location', isLive: true, loading: false });
        setPickupText(`📍 Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setRegion('LIVE_GPS', { lat, lng }, 15);
      },
      () => { setLiveLocation(p => ({ ...p, loading: false })); },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    startSimulation();
    if (searchParams.get('askLocation') === 'true' || searchParams.get('fromLogin') === 'true') detectGPS();
  }, []);

  const estFare = Math.round(selectedService.basePrice + selectedHotspot.dist * selectedService.pricePerKm);
  const mapCenter = useMemo(() => ({ lat: liveLocation.lat, lng: liveLocation.lng }), [liveLocation.lat, liveLocation.lng]);
  const mapPickup  = useMemo(() => ({ lat: liveLocation.lat, lng: liveLocation.lng, name: pickupText }), [liveLocation.lat, liveLocation.lng, pickupText]);
  const mapDest    = useMemo(() => ({ lat: liveLocation.lat + 0.01, lng: liveLocation.lng + 0.01, name: selectedHotspot.drop }), [liveLocation.lat, liveLocation.lng, selectedHotspot]);

  const handleLaunchRole = role => {
    login(role);
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'DRIVER') navigate('/driver/dashboard');
    else navigate('/app/home');
  };

  const handleConfirmBooking = () => {
    if (!isAuthenticated) login('USER');
    setPickup({ lat: liveLocation.lat, lng: liveLocation.lng, name: pickupText, address: liveLocation.locality });
    setDestination({ lat: mapDest.lat, lng: mapDest.lng, name: selectedHotspot.drop, address: selectedHotspot.desc });
    setCategory(selectedService.id === 'bike' ? 'MOTO' : 'CAR');
    setEstimatedFare(estFare);
    setStep('CONFIRM');
    navigate('/app/home');
  };

  const handleContactSubmit = e => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => { setContactSubmitted(false); setContactData({ name: '', email: '', message: '' }); }, 4000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* ── UNIFIED NAVBAR (Single clean header without stacked bars) ── */}
      <Navbar />

      {/* ── HERO SECTION: CENTERED, BALANCED & FULLY RESPONSIVE ── */}
      <section id="booking" className="w-full flex justify-center pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Symmetrical Hero Header */}
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Pan-India Urban & Campus Mobility Network
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Ride Anywhere, <span className="text-blue-600">Instantly.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Clean solar campus totos, electric bike taxis, and outstation cabs. Guaranteed upfront fares with real-time GPS telemetry and zero surge pricing.
            </p>
          </div>

          {/* Centered Regional Sector Segment Tabs */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl gap-1">
              {REGIONAL_HUBS.map(hub => {
                const isSel = selectedHub.id === hub.id;
                return (
                  <button key={hub.id} onClick={() => handleHubSelect(hub)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSel ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}>
                    {hub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symmetrical 2-Column Grid (Balanced Heights & Responsive) */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* LEFT: Booking Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5">
              
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Where are you going?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Current Hub: {selectedHub.name} ({selectedHub.state})</p>
              </div>

              {/* Pickup Point */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Pickup Location</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input type="text" value={pickupText} onChange={e => setPickupText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-24 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Enter pickup location" />
                  <button onClick={detectGPS}
                    className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all flex items-center gap-1">
                    <Crosshair size={12} className={liveLocation.loading ? 'animate-spin' : ''} /> GPS
                  </button>
                </div>
              </div>

              {/* Destination Drop */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Destination</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Navigation size={16} />
                  </div>
                  <input type="text" value={selectedHotspot.drop} readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                    placeholder="Select destination" />
                </div>
              </div>

              {/* Vehicle Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Vehicle Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {VEHICLE_SERVICES.map(srv => {
                    const price = Math.round(srv.basePrice + selectedHotspot.dist * srv.pricePerKm);
                    const isSel = srv.id === selectedService.id;
                    return (
                      <button key={srv.id} onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-2xl text-left border transition-all relative ${
                          isSel
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}>
                        <div className="text-2xl mb-1.5">{srv.icon}</div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{srv.name}</p>
                        <p className="text-sm font-extrabold text-blue-600 mt-1">₹{price}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{srv.eta}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transparent Fare Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Guaranteed Upfront Fare</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedHotspot.dist} km · ~{selectedHotspot.mins} mins ride</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ No hidden surge</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">₹{estFare}</p>
                  <p className="text-[10px] text-slate-400">GST included</p>
                </div>
              </div>

              {/* Main CTA */}
              <button onClick={handleConfirmBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 text-sm transition-all hover:scale-[1.01] active:scale-98">
                Confirm & Dispatch {selectedService.name} <ArrowRight size={16} />
              </button>

            </div>

            {/* RIGHT: Live Radar (Clean & Symmetrical, no awkward stacked cards below it!) */}
            <div className="lg:col-span-6 h-full">
              <LiveRadarWidget hub={selectedHub} onOpenMap={() => setMapModalOpen(true)} selectedDriver={selectedDriver} onSelectDriver={setSelectedDriver} />
            </div>

          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH RESPONSIVE TRUST & METRICS STRIP (Decongested & Centered) ── */}
      <section className="w-full flex justify-center py-8 sm:py-10 bg-white border-y border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
            
            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,200+</p>
              <p className="text-xs font-bold text-slate-700 mt-1">Active Verified Fleet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across 742 Indian Districts</p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">&lt; 25s</p>
              <p className="text-xs font-bold text-slate-700 mt-1">AI Match Latency</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sub-minute driver dispatch</p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">1.42M km</p>
              <p className="text-xs font-bold text-slate-700 mt-1">Clean EV Distance</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero tailpipe emissions</p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">0% Surge</p>
              <p className="text-xs font-bold text-slate-700 mt-1">Guaranteed Upfront Fare</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Transparent & MoRTH aligned</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES SECTION ── */}
      <section id="places-to-go" className="w-full flex justify-center py-14 sm:py-20 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">Popular Corridors</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Top Destinations in {selectedHub.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Upfront pricing with pre-mapped coordinates.</p>
            </div>
            <button onClick={detectGPS}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200">
              <Crosshair size={13} className={liveLocation.loading ? 'animate-spin' : ''} /> Detect GPS
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedHub.hotspots.map(place => {
              const Icon = place.icon;
              const isSel = selectedHotspot.id === place.id;
              return (
                <div key={place.id} onClick={() => { setSelectedHotspot(place); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`group cursor-pointer rounded-2xl p-5 border transition-all hover:shadow-md ${
                    isSel ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-600/10' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {place.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{place.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">{place.desc}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{place.dist} km · {place.mins} mins</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">₹{place.fare}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isSel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700'
                      }`}>
                        {isSel ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SAFETY & SOVEREIGN STANDARDS ── */}
      <section id="safety" className="w-full flex justify-center py-14 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">National Safety Protocol</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Safety & Compliance by Design</h2>
            <p className="text-sm text-slate-600">Engineered according to Ministry of Road Transport & Highways standards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Bharat ERSS 112 Emergency SOS',
                desc: 'One-touch SOS broadcasting encrypted GPS telemetry directly to the nearest Police Control Room and ERSS 112 network.',
                badge: '112 Integrated',
              },
              {
                icon: QrCode,
                title: 'DigiLocker & Aadhaar Biometric KYC',
                desc: 'Every commercial partner is verified using UIDAI Aadhaar biometrics, driving license validation, and police verification.',
                badge: '100% Verified',
              },
              {
                icon: BatteryCharging,
                title: 'Clean Electric Fleet Initiative',
                desc: 'Supporting the PM E-Drive scheme with 100% solar-charged campus Totos and zero-emission electric vehicles.',
                badge: 'Zero Carbon',
              },
            ].map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-800 shadow-xs">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PORTALS SHOWCASE ── */}
      <section id="showcase" className="w-full flex justify-center py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Unified System</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Three Portals. One Platform.</h2>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl gap-1">
              {[
                { id: 'rider', label: 'Passenger App', icon: '👤' },
                { id: 'driver', label: 'Driver Cockpit', icon: '🚗' },
                { id: 'admin', label: 'Operations Radar', icon: '🖥️' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setPortalTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    portalTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {portalTab === 'rider' && (
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">Passenger Console</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Safe, Verified & Instant Commuting</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Book rides with verified 4-digit OTP startup security. Enjoy transparent upfront pricing with zero cancellation surge penalties.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ 4-Digit Secure OTP Verification</li>
                  <li className="flex items-center gap-2">✓ 25-second average driver pairing</li>
                  <li className="flex items-center gap-2">✓ Instant UPI payments & shareable trip status</li>
                </ul>
                <button onClick={() => handleLaunchRole('USER')}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
                  Open Passenger App <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Partner Units</p>
                {[
                  { icon: '🛺', name: 'Raju Toto #08', type: 'Solar E-Toto', eta: '1 min', fare: '₹20' },
                  { icon: '🏍️', name: 'Subhash M.', type: 'Hero Splendor EV', eta: '2 mins', fare: '₹15' },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/60 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{d.name}</p>
                        <p className="text-[11px] text-slate-500">{d.type} · {d.eta} away</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{d.fare}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portalTab === 'driver' && (
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Driver Cockpit</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Highest Earnings. Daily UPI Cashout.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Drive your Toto, Bike, or Cab. Pay only a 12% platform fee — the lowest in India — with 88% going directly to your bank account.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Daily automatic UPI settlements</li>
                  <li className="flex items-center gap-2">✓ 12% operator fee vs 30% traditional aggregators</li>
                  <li className="flex items-center gap-2">✓ Zero penalties for selective destination declines</li>
                </ul>
                <button onClick={() => handleLaunchRole('DRIVER')}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
                  Open Driver Cockpit <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Today's Earnings Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <p className="text-xl font-bold text-emerald-600">₹2,480</p>
                    <p className="text-xs text-slate-500 mt-0.5">Net Payout</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <p className="text-xl font-bold text-slate-900">18</p>
                    <p className="text-xs text-slate-500 mt-0.5">Trips Done</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {portalTab === 'admin' && (
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">Operations Command</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Pan-India Fleet Oversight</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Real-time telemetry across all 742 districts. Live audits, automated GST invoicing, and security incident resolution.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">✓ Live telemetry stream for 1,200+ partner units</li>
                  <li className="flex items-center gap-2">✓ Aadhaar & DigiLocker KYC verification pipeline</li>
                  <li className="flex items-center gap-2">✓ MoRTH AIS-140 compliance reporting</li>
                </ul>
                <button onClick={() => handleLaunchRole('ADMIN')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
                  Open Operations Radar <ArrowRight size={14} />
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Operations Telemetry</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <p className="text-xl font-bold text-indigo-600">1,200+</p>
                    <p className="text-xs text-slate-500 mt-0.5">Active Fleet</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <p className="text-xl font-bold text-emerald-600">99.98%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Uptime SLA</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── 24/7 HELPLINES & CONTACT ── */}
      <section id="contact" className="w-full flex justify-center py-14 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Always Available</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">24/7 Helplines & Desks</h2>
                <p className="text-sm text-slate-600 mt-2">Emergency and operational response across educational campuses and transit hubs.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Bharat ERSS Emergency', number: '112', sub: 'National Police & Ambulance', cls: 'border-rose-200 bg-rose-50/50 text-rose-700' },
                  { label: 'Pan-India Toll-Free', number: '1800-VELOQ-IN', sub: '24/7 Mobility Support', cls: 'border-blue-200 bg-blue-50/50 text-blue-700' },
                  { label: 'IIT KGP Campus SOS', number: '+91 94340-KGP-SOS', sub: 'Campus Security Stand', cls: 'border-emerald-200 bg-emerald-50/50 text-emerald-700' },
                  { label: 'ONDC Dispute Desk', number: 'ondc@veloq.gov.in', sub: 'Open Network Grievance', cls: 'border-indigo-200 bg-indigo-50/50 text-indigo-700' },
                ].map(({ label, number, sub, cls }) => (
                  <div key={label} className={`p-4 rounded-2xl border ${cls}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-base font-black mt-1 text-slate-900">{number}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dispatch Form */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Send a Message</h3>
              {contactSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Message Received</p>
                  <p className="text-xs text-slate-500">A mobility officer will reach out shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <input type="text" required placeholder="Your Name" value={contactData.name}
                    onChange={e => setContactData({ ...contactData, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all" />
                  <input type="email" required placeholder="Email Address" value={contactData.email}
                    onChange={e => setContactData({ ...contactData, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all" />
                  <textarea rows={3} required placeholder="How can we help you?"
                    value={contactData.message}
                    onChange={e => setContactData({ ...contactData, message: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all resize-none" />
                  <button type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
                    <Send size={13} /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />

      {/* Fullscreen Map Modal */}
      <MapModal open={mapModalOpen} onClose={() => setMapModalOpen(false)} center={mapCenter} pickup={mapPickup} destination={mapDest} detectGPS={detectGPS} />
    </div>
  );
}
