import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, ArrowRight, Zap, Activity, Car, Phone,
  Shield, ShieldCheck, DollarSign, Navigation, Lock,
  GraduationCap, Building2,
  QrCode, Crosshair, Plane, Train, Hospital, ShoppingBag, X,
  TrendingUp, Star, Terminal, Radio, ExternalLink, Send, Check,
  Cpu, Globe2, BatteryCharging, Leaf, HeartPulse, RefreshCw,
  Sparkles, ChevronRight, Award, Compass, AlertCircle, Search, ArrowUpDown
} from 'lucide-react';
import { useAuthStore, useMapStore, useBookingStore } from '@/stores';
import { locationService } from '@/services';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  },
  {
    id: 'kolkata',
    name: 'Kolkata Metropolitan',
    state: 'West Bengal',
    locality: 'Park Street & Salt Lake IT Corridor',
    lat: 22.5726,
    lng: 88.3639,
    hotspots: [
      { id: 'park_st', name: 'Park Street Central Hub', icon: ShoppingBag, badge: 'Commercial', dist: 2.5, mins: 8, fare: 50, drop: 'Park Street Metro Gate 2', desc: 'Historic shopping, dining, and central office hub' },
      { id: 'ccu_airport', name: 'Netaji Subhash Airport (CCU T2)', icon: Plane, badge: 'Airport', dist: 14.2, mins: 32, fare: 320, drop: 'CCU Terminal 2 Departure Expressway', desc: 'VIP flyover drop lane with zero terminal delay' },
      { id: 'howrah_stn', name: 'Howrah Junction Railway Terminus', icon: Train, badge: 'IRCTC Rail', dist: 4.8, mins: 15, fare: 85, drop: 'Howrah Station Platform 1 Cab Road', desc: 'Direct access to Eastern & South Eastern trains' },
      { id: 'saltlake_sec5', name: 'Salt Lake Sector V IT Hub', icon: Building2, badge: 'Tech Node', dist: 8.6, mins: 22, fare: 140, drop: 'Sector V Webel Bhavan Junction', desc: 'Major IT tech parks, Wipro & TCS campuses' },
    ],
    drivers: [
      { id: 41, name: 'Subhash Mondal', vehicle: 'Tata Tigor EV Cab', icon: '🚗', dist: '0.5 km', eta: '2 min', r: 38, angle: 90, rating: 4.93, battery: 85 },
      { id: 42, name: 'Debabrata Sen', vehicle: 'Ather 450X EV', icon: '🏍️', dist: '0.8 km', eta: '3 min', r: 50, angle: 210, rating: 4.96, battery: 90 },
    ]
  },
  {
    id: 'hyd',
    name: 'Hyderabad Cyber City',
    state: 'Telangana',
    locality: 'HITEC City & Gachibowli Corridor',
    lat: 17.3850,
    lng: 78.4867,
    hotspots: [
      { id: 'hitec_city', name: 'HITEC City Cyber Towers', icon: Building2, badge: 'Tech Node', dist: 12.5, mins: 24, fare: 180, drop: 'Cyber Towers Main Gate, Madhapur', desc: 'Core tech corridor connecting Google, Microsoft & Oracle' },
      { id: 'hyd_airport', name: 'Rajiv Gandhi Int Airport (HYD)', icon: Plane, badge: 'Airport', dist: 24.0, mins: 38, fare: 460, drop: 'RGIA Shamshabad Departure Ramp', desc: 'PVNR Elevated Expressway high-speed transit' },
      { id: 'secunderabad_stn', name: 'Secunderabad Railway Station', icon: Train, badge: 'IRCTC Rail', dist: 7.8, mins: 18, fare: 110, drop: 'Secunderabad Junction Platform 1', desc: 'South Central Railway headquarters & Vande Bharat' },
    ],
    drivers: [
      { id: 51, name: 'Suresh Reddy', vehicle: 'Ola S1 Pro Gen 2', icon: '🏍️', dist: '0.4 km', eta: '1 min', r: 30, angle: 40, rating: 4.97, battery: 95 },
      { id: 52, name: 'Karthik Rao', vehicle: 'MG ZS EV Prime', icon: '🚗', dist: '1.2 km', eta: '4 min', r: 58, angle: 180, rating: 4.92, battery: 82 },
    ]
  },
  {
    id: 'pune',
    name: 'Pune IT & Heritage Hub',
    state: 'Maharashtra',
    locality: 'Hinjawadi & Koregaon Park Corridor',
    lat: 18.5204,
    lng: 73.8567,
    hotspots: [
      { id: 'hinjawadi_ph1', name: 'Hinjawadi IT Park Phase 1', icon: Building2, badge: 'Tech Node', dist: 16.5, mins: 32, fare: 240, drop: 'Rajiv Gandhi Infotech Park Gate 1', desc: 'Infosys, Wipro, and Cognizant corporate corridor' },
      { id: 'pnq_airport', name: 'Pune Int Airport (PNQ)', icon: Plane, badge: 'Airport', dist: 9.8, mins: 22, fare: 180, drop: 'Lohegaon PNQ Terminal Departure', desc: 'Viman Nagar elevated transit corridor' },
      { id: 'pune_junction', name: 'Pune Railway Junction', icon: Train, badge: 'IRCTC Rail', dist: 2.4, mins: 7, fare: 40, drop: 'Pune Station Main Concourse', desc: 'Central Mumbai-Pune expressway connections' },
    ],
    drivers: [
      { id: 61, name: 'Rohan Deshmukh', vehicle: 'Mahindra Treo EV', icon: '🛺', dist: '0.3 km', eta: '1 min', r: 28, angle: 110, rating: 4.95, battery: 89 },
      { id: 62, name: 'Amit Jadhav', vehicle: 'Hero Splendor Plus', icon: '🏍️', dist: '0.6 km', eta: '2 min', r: 42, angle: 270, rating: 4.90, battery: 91 },
    ]
  }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findClosestHub(lat, lng) {
  let closest = REGIONAL_HUBS[0];
  let minD = Infinity;
  for (const hub of REGIONAL_HUBS) {
    const d = calculateDistance(lat, lng, hub.lat, hub.lng);
    if (d < minD) {
      minD = d;
      closest = hub;
    }
  }
  return { hub: closest, distanceKm: minD };
}

/* ─── Vehicle Services ───────────────────────────────────────────────────────── */
const VEHICLE_SERVICES = [
  { id: 'toto', name: 'Solar E-Toto', icon: '🛺', basePrice: 20, pricePerKm: 8, eta: '1 min', tag: 'Campus & Micro-Mobility' },
  { id: 'bike', name: 'Electric Bike', icon: '🏍️', basePrice: 15, pricePerKm: 6, eta: '2 mins', tag: 'Fastest Solo Commute' },
  { id: 'sedan', name: 'Prime EV Cab', icon: '🚗', basePrice: 60, pricePerKm: 14, eta: '4 mins', tag: 'AC Executive Comfort' },
  { id: 'outstation', name: 'Green Express', icon: '🛣️', basePrice: 650, pricePerKm: 15, eta: '10 min', tag: 'Intercity Highway' },
];

/* ─── Live Radar Widget (Self-Contained & Symmetrical) ───────────────────────── */
/* ─── Hero Interactive Ride Showcase (Clean, Animated, 100% Map-Free UI) ─────── */
function HeroRideShowcase({ 
  selectedHub, 
  selectedHotspot, 
  selectedService, 
  estFare, 
  pickupText,
  onConfirmBooking 
}) {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col justify-between h-full min-h-[500px] overflow-hidden">
      {/* Ambient decorative glowing backdrop lights */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Status Strip */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white tracking-tight">Pan-India Fleet Active</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct dispatch across {selectedHub.name}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-black text-blue-400">11,560 Fleet</span>
          <p className="text-[10px] text-slate-400 font-medium">Pan-India Online</p>
        </div>
      </div>

      {/* Center Route & Trip Simulation Visualizer */}
      <div className="relative z-10 my-auto py-5 space-y-4">
        
        {/* Route Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3">
          <div className="flex items-start gap-3">
            {/* Route Pins */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
              <div className="w-0.5 h-10 bg-gradient-to-b from-blue-500 via-slate-600 to-emerald-500 my-1" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            </div>

            {/* From & To Details */}
            <div className="flex-1 space-y-2.5 min-w-0">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pickup Location</p>
                <p className="text-xs font-bold text-white truncate">{pickupText.replace('📍 ', '')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Destination Drop</p>
                <p className="text-xs font-bold text-white truncate">{selectedHotspot.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{selectedHotspot.drop}</p>
              </div>
            </div>

            {/* Estimated Fare Box */}
            <div className="text-right shrink-0 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/60 shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated</p>
              <p className="text-lg font-black text-emerald-400">₹{estFare}</p>
              <p className="text-[10px] text-slate-400">{selectedHotspot.dist} km · {selectedHotspot.mins}m</p>
            </div>
          </div>
        </div>

        {/* Assigned Driver Preview Pill */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-md shrink-0">
              {selectedService.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-extrabold text-white truncate">Direct Driver Match</p>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 shrink-0">
                  Verified Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                ★ 4.95 (1,200+ trips) · {selectedService.name}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ETA 2 MINS
            </span>
          </div>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-800/40 rounded-xl p-2 border border-slate-800">
            <p className="text-xs font-black text-white">&lt; 30s</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Match Speed</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-2 border border-slate-800">
            <p className="text-xs font-black text-emerald-400">0% Surge</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fixed Upfront</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-2 border border-slate-800">
            <p className="text-xs font-black text-blue-400">112 SOS</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Police Linked</p>
          </div>
        </div>

      </div>

      {/* Bottom Dispatch Trigger */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          <span className="text-slate-200 font-bold">Fast & transparent</span> pricing
        </div>
        <button
          onClick={onConfirmBooking}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
        >
          <span>Book Ride Now</span>
          <ArrowRight size={14} />
        </button>
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
  const { userLocation, setUserLocation, setCenter, setRegion, startSimulation } = useMapStore();
  const activeRole = isAuthenticated ? (userRole || user?.role || 'USER') : null;

  const [selectedHub, setSelectedHub] = useState(REGIONAL_HUBS[0]);
  const [selectedHotspot, setSelectedHotspot] = useState(REGIONAL_HUBS[0].hotspots[0]);
  const [selectedService, setSelectedService] = useState(VEHICLE_SERVICES[0]);
  const [selectedDriver, setSelectedDriver] = useState(REGIONAL_HUBS[0].drivers[0]);
  const [dynamicCorridors, setDynamicCorridors] = useState([]);
  const [corridorsLoading, setCorridorsLoading] = useState(false);

  const [liveLocation, setLiveLocation] = useState({
    lat: REGIONAL_HUBS[0].lat,
    lng: REGIONAL_HUBS[0].lng,
    name: REGIONAL_HUBS[0].locality,
    locality: `${REGIONAL_HUBS[0].name}, ${REGIONAL_HUBS[0].state}`,
    isLive: false,
    loading: false,
  });

  const [pickupText, setPickupText] = useState(REGIONAL_HUBS[0].locality);
  const [destText, setDestText] = useState(REGIONAL_HUBS[0].hotspots[0].name || REGIONAL_HUBS[0].hotspots[0].drop);
  const [pickupCoords, setPickupCoords] = useState({
    lat: REGIONAL_HUBS[0].lat,
    lng: REGIONAL_HUBS[0].lng,
    name: REGIONAL_HUBS[0].locality,
    address: `${REGIONAL_HUBS[0].name}, ${REGIONAL_HUBS[0].state}`,
  });

  // Manual Autocomplete Search State
  const [activeSearchField, setActiveSearchField] = useState(null); // 'pickup' | 'destination' | null
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const bookingFormRef = useRef(null);

  const [portalTab, setPortalTab] = useState('rider');
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Close search dropdowns when clicking outside the booking form
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bookingFormRef.current && !bookingFormRef.current.contains(e.target)) {
        setActiveSearchField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for manual Pickup input
  useEffect(() => {
    if (activeSearchField !== 'pickup') return;
    const cleanQuery = pickupText.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setPickupSuggestions([]);
      return;
    }

    setIsSearchingPickup(true);
    const timer = setTimeout(() => {
      locationService.searchPlaces(cleanQuery, pickupCoords).then(results => {
        setPickupSuggestions(results || []);
        setIsSearchingPickup(false);
      }).catch(() => {
        setIsSearchingPickup(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [pickupText, activeSearchField]);

  // Debounced search for manual Destination input
  useEffect(() => {
    if (activeSearchField !== 'destination') return;
    const cleanQuery = destText.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setDestSuggestions([]);
      return;
    }

    setIsSearchingDest(true);
    const timer = setTimeout(() => {
      locationService.searchPlaces(cleanQuery, pickupCoords).then(results => {
        setDestSuggestions(results || []);
        setIsSearchingDest(false);
      }).catch(() => {
        setIsSearchingDest(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [destText, activeSearchField]);

  // Sync Popular Corridors and Hero with userLocation (from GPS or Navbar selector)
  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;

    const lat = userLocation.lat;
    const lng = userLocation.lng;
    const { hub: closestHub, distanceKm } = findClosestHub(lat, lng);

    if (distanceKm <= 50) {
      setSelectedHub(closestHub);
    }

    const locName = userLocation.name || 'Current Location';
    const locAddress = userLocation.address || userLocation.name || 'Current Location';

    setLiveLocation({
      lat,
      lng,
      name: locName,
      locality: locAddress,
      isLive: Boolean(userLocation.isGpsDetected),
      loading: false,
    });
    setPickupCoords({
      lat,
      lng,
      name: locName,
      address: locAddress,
    });
    setPickupText(locName);

    setCorridorsLoading(true);
    // Request nearby corridors strictly within 100 KM
    locationService.getNearbyPlaces(lat, lng, 100).then((places) => {
      setCorridorsLoading(false);
      if (places && places.length > 0) {
        const mapped = places.map((p, idx) => {
          const dist = p.distanceKm
            ? Math.round(p.distanceKm * 10) / 10
            : Math.round(calculateDistance(lat, lng, p.lat, p.lng) * 10) / 10 || 3.8;
          const mins = Math.max(3, Math.round(dist * 2.2));
          const fare = Math.round(25 + dist * 12);

          let Icon = Building2;
          let badge = p.type ? p.type.toUpperCase() : 'Transit';
          const lowerName = (p.name || '').toLowerCase();
          if (lowerName.includes('airport') || p.type === 'airport') { Icon = Plane; badge = 'Airport'; }
          else if (lowerName.includes('station') || lowerName.includes('junction') || p.type === 'station') { Icon = Train; badge = 'Rail Hub'; }
          else if (lowerName.includes('iit') || lowerName.includes('college') || lowerName.includes('campus')) { Icon = GraduationCap; badge = 'Academic'; }
          else if (lowerName.includes('hospital')) { Icon = Hospital; badge = '24/7 Med'; }
          else if (lowerName.includes('market') || lowerName.includes('mall') || lowerName.includes('complex')) { Icon = ShoppingBag; badge = 'Commercial'; }
          else if (lowerName.includes('park') || lowerName.includes('tech') || lowerName.includes('cyber')) { Icon = Building2; badge = 'Tech Node'; }

          return {
            id: p.id || `dyn-corr-${idx}`,
            name: p.name,
            icon: Icon,
            badge,
            dist,
            mins,
            fare,
            drop: p.address || p.name,
            desc: p.address || `${p.name}, ${p.city || userLocation.city || ''}`,
            lat: p.lat,
            lng: p.lng,
          };
        });

        setDynamicCorridors(mapped);
        setSelectedHotspot(mapped[0]);
        setDestText(mapped[0].name || mapped[0].drop);
      } else {
        setDynamicCorridors(closestHub.hotspots);
        setSelectedHotspot(closestHub.hotspots[0]);
        setDestText(closestHub.hotspots[0].name || closestHub.hotspots[0].drop);
      }
    }).catch(() => {
      setCorridorsLoading(false);
      setDynamicCorridors(closestHub.hotspots);
      setSelectedHotspot(closestHub.hotspots[0]);
      setDestText(closestHub.hotspots[0].name || closestHub.hotspots[0].drop);
    });
  }, [userLocation?.lat, userLocation?.lng, userLocation?.city, userLocation?.name]);

  const handleHubSelect = (hub) => {
    setSelectedHub(hub);
    setSelectedHotspot(hub.hotspots[0]);
    setDestText(hub.hotspots[0].name || hub.hotspots[0].drop);
    setSelectedDriver(hub.drivers[0]);
    setDynamicCorridors(hub.hotspots);
    const newLoc = {
      lat: hub.lat,
      lng: hub.lng,
      name: hub.locality,
      address: `${hub.name}, ${hub.state}`,
      city: hub.name,
      state: hub.state,
      isGpsDetected: false,
    };
    setUserLocation(newLoc);
    setPickupCoords({
      lat: hub.lat,
      lng: hub.lng,
      name: hub.locality,
      address: `${hub.name}, ${hub.state}`,
    });
    setLiveLocation({
      lat: hub.lat,
      lng: hub.lng,
      name: hub.locality,
      locality: `${hub.name}, ${hub.state}`,
      isLive: false,
      loading: false,
    });
    setPickupText(hub.locality);
    setActiveSearchField(null);
    setRegion(hub.id.toUpperCase(), { lat: hub.lat, lng: hub.lng }, 15);
  };

  const handleSelectPickup = (place) => {
    setPickupText(place.name);
    const newCoords = {
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      address: place.address || place.name,
    };
    setPickupCoords(newCoords);
    setLiveLocation(prev => ({
      ...prev,
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      locality: place.address || place.name,
    }));
    setActiveSearchField(null);

    // Recalculate distance to current destination
    if (selectedHotspot?.lat && selectedHotspot?.lng) {
      const dist = Math.round(calculateDistance(place.lat, place.lng, selectedHotspot.lat, selectedHotspot.lng) * 10) / 10 || 4.2;
      const mins = Math.max(3, Math.round(dist * 2.2));
      const fare = Math.round(25 + dist * 12);
      setSelectedHotspot(prev => ({ ...prev, dist, mins, fare }));
    }
  };

  const handleSelectDestination = (place) => {
    setDestText(place.name);
    const dist = Math.round(calculateDistance(pickupCoords.lat, pickupCoords.lng, place.lat, place.lng) * 10) / 10 || 4.8;
    const mins = Math.max(3, Math.round(dist * 2.2));
    const fare = Math.round(25 + dist * 12);

    let Icon = Building2;
    let badge = place.type ? place.type.toUpperCase() : (dist > 50 ? 'Outstation' : 'Custom');
    const lowerName = (place.name || '').toLowerCase();
    if (lowerName.includes('airport') || place.type === 'airport') { Icon = Plane; badge = 'Airport'; }
    else if (lowerName.includes('station') || lowerName.includes('junction') || place.type === 'station') { Icon = Train; badge = 'Rail Hub'; }
    else if (lowerName.includes('iit') || lowerName.includes('college') || lowerName.includes('campus')) { Icon = GraduationCap; badge = 'Academic'; }
    else if (lowerName.includes('hospital')) { Icon = Hospital; badge = '24/7 Med'; }
    else if (lowerName.includes('market') || lowerName.includes('mall')) { Icon = ShoppingBag; badge = 'Commercial'; }

    setSelectedHotspot({
      id: place.id || `custom-${Date.now()}`,
      name: place.name,
      drop: place.address || place.name,
      desc: place.address || `${place.name}, ${place.city || ''}`,
      dist,
      mins,
      fare,
      lat: place.lat,
      lng: place.lng,
      badge,
      icon: Icon,
    });
    setActiveSearchField(null);
  };

  const handleSwapLocations = () => {
    const currentPickupText = pickupText;
    const currentPickupCoords = { ...pickupCoords };
    const currentDestText = destText;
    const currentHotspot = { ...selectedHotspot };

    setPickupText(currentDestText);
    setPickupCoords({
      lat: currentHotspot.lat || currentPickupCoords.lat,
      lng: currentHotspot.lng || currentPickupCoords.lng,
      name: currentHotspot.name || currentDestText,
      address: currentHotspot.desc || currentHotspot.drop || currentDestText,
    });

    setDestText(currentPickupText);
    setSelectedHotspot({
      ...currentHotspot,
      name: currentPickupText,
      drop: currentPickupCoords.address || currentPickupText,
      desc: currentPickupCoords.address || currentPickupText,
      lat: currentPickupCoords.lat,
      lng: currentPickupCoords.lng,
    });
  };

  const handlePickupKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pickupSuggestions.length > 0) {
        handleSelectPickup(pickupSuggestions[0]);
      } else if (pickupText.trim()) {
        setIsSearchingPickup(true);
        try {
          const results = await locationService.searchPlaces(pickupText.trim(), pickupCoords);
          if (results && results.length > 0) {
            handleSelectPickup(results[0]);
          }
        } finally {
          setIsSearchingPickup(false);
        }
      }
    }
  };

  const handleDestKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (destSuggestions.length > 0) {
        handleSelectDestination(destSuggestions[0]);
      } else if (destText.trim()) {
        setIsSearchingDest(true);
        try {
          const results = await locationService.searchPlaces(destText.trim(), pickupCoords);
          if (results && results.length > 0) {
            handleSelectDestination(results[0]);
          }
        } finally {
          setIsSearchingDest(false);
        }
      }
    }
  };

  const handleSelectHotspot = (place) => {
    setSelectedHotspot(place);
    setDestText(place.name || place.drop);
    setActiveSearchField(null);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setLiveLocation(p => ({ ...p, loading: true }));
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const geo = await locationService.reverseGeocode(lat, lng);
          const newLoc = {
            lat,
            lng,
            name: geo.name || `Live Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
            address: geo.address || 'Current Live GPS Location',
            city: geo.city || 'Your Area',
            state: geo.state || '',
            isGpsDetected: true,
          };
          setUserLocation(newLoc);
          setPickupCoords({ lat, lng, name: newLoc.name, address: newLoc.address });
          setLiveLocation({ lat, lng, name: newLoc.name, locality: newLoc.address, isLive: true, loading: false });
          setPickupText(newLoc.name);

          if (selectedHotspot?.lat && selectedHotspot?.lng) {
            const dist = Math.round(calculateDistance(lat, lng, selectedHotspot.lat, selectedHotspot.lng) * 10) / 10 || 4.2;
            const mins = Math.max(3, Math.round(dist * 2.2));
            const fare = Math.round(25 + dist * 12);
            setSelectedHotspot(prev => ({ ...prev, dist, mins, fare }));
          }
        } catch (e) {
          const newLoc = {
            lat,
            lng,
            name: `Live Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
            address: 'Detected GPS Location',
            city: 'Current Area',
            state: '',
            isGpsDetected: true,
          };
          setUserLocation(newLoc);
          setPickupCoords({ lat, lng, name: newLoc.name, address: newLoc.address });
          setLiveLocation({ lat, lng, name: newLoc.name, locality: newLoc.address, isLive: true, loading: false });
          setPickupText(newLoc.name);
        }
        setActiveSearchField(null);
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

  const handleLaunchRole = role => {
    login(role);
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'DRIVER') navigate('/driver/dashboard');
    else navigate('/app/home');
  };

  const handleConfirmBooking = () => {
    // ALWAYS switch active persona to USER for passenger booking flow
    login('USER');

    const pLat = pickupCoords.lat || liveLocation.lat;
    const pLng = pickupCoords.lng || liveLocation.lng;
    const pName = pickupText.replace(/^📍\s*/, '') || 'Selected Pickup';
    const pAddress = pickupCoords.address || liveLocation.locality || pName;

    const dLat = selectedHotspot.lat || (pLat + 0.015);
    const dLng = selectedHotspot.lng || (pLng + 0.015);
    const dName = selectedHotspot.name || destText || 'Selected Destination';
    const dAddress = selectedHotspot.desc || selectedHotspot.drop || destText || dName;
    const distKm = selectedHotspot.dist || 4.2;

    // Center map and generate local simulated drivers for the searched city
    if (setUserLocation) {
      setUserLocation({
        lat: pLat,
        lng: pLng,
        name: pName,
        address: pAddress,
        isGpsDetected: false,
      });
    }
    if (setCenter) {
      setCenter({ lat: pLat, lng: pLng });
    }

    setPickup({
      lat: pLat,
      lng: pLng,
      name: pName,
      address: pAddress,
    });
    setDestination({
      lat: dLat,
      lng: dLng,
      name: dName,
      address: dAddress,
      distanceKm: distKm,
    });
    setCategory(selectedService.id === 'bike' ? 'MOTO' : selectedService.id === 'toto' ? 'AUTO' : 'ECONOMY');
    setEstimatedFare({
      base: Math.round(estFare * 0.35),
      distanceFare: Math.round(estFare * 0.58),
      tax: Math.round(estFare * 0.07),
      total: estFare,
      distance: distKm,
    });
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
            <div className="flex w-full min-w-0 max-w-4xl flex-wrap items-center justify-center p-1.5 bg-slate-200/70 rounded-2xl gap-1">
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
          <div className="grid w-full min-w-0 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* LEFT: Booking Card */}
            <div ref={bookingFormRef} className="w-full min-w-0 max-w-full lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5 relative">
              
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900">Where are you going?</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    ⚡ 100 KM Corridors & Manual
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Current Hub: {selectedHub.name} ({selectedHub.state})</p>
              </div>

              {/* Pickup Point with Manual Typing & GPS */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Pickup Location (From)</label>
                  <span className="text-[10px] font-semibold text-blue-600">Manual Search / GPS</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-blue-600">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    value={pickupText}
                    onChange={e => {
                      setPickupText(e.target.value);
                      setActiveSearchField('pickup');
                    }}
                    onFocus={() => setActiveSearchField('pickup')}
                    onKeyDown={handlePickupKeyDown}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-24 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                    placeholder="Search pickup city, landmark, or campus..."
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1">
                    {pickupText && (
                      <button
                        type="button"
                        onClick={() => {
                          setPickupText('');
                          setActiveSearchField('pickup');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                        title="Clear pickup"
                      >
                        <X size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={detectGPS}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all flex items-center gap-1"
                      title="Detect live GPS"
                    >
                      <Crosshair size={12} className={liveLocation.loading ? 'animate-spin' : ''} /> GPS
                    </button>
                  </div>
                </div>

                {/* Pickup Autocomplete Dropdown */}
                {activeSearchField === 'pickup' && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        detectGPS();
                        setActiveSearchField(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-blue-50/80 hover:bg-blue-100 text-left transition-colors font-bold text-xs text-blue-700"
                    >
                      <Crosshair size={14} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="font-extrabold text-blue-800">Use My Exact Live GPS Location</p>
                        <p className="text-[10px] text-blue-600 font-normal">Real-time GPS pin with high accuracy</p>
                      </div>
                    </button>

                    {isSearchingPickup && (
                      <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                        <RefreshCw size={13} className="animate-spin text-blue-600" />
                        <span>Searching locations in India...</span>
                      </div>
                    )}

                    {!isSearchingPickup && pickupSuggestions.map(place => (
                      <button
                        key={place.id || place.name}
                        type="button"
                        onClick={() => handleSelectPickup(place)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 text-left transition-colors"
                      >
                        <MapPin size={14} className="text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{place.name}</p>
                            {place.distanceKm != null && (
                              <span className="text-[10px] font-mono text-blue-600 font-bold shrink-0">{place.distanceKm} km</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connecting Line & Swap Button */}
              <div className="flex justify-center -my-2.5 relative z-20">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-[11px] font-bold"
                  title="Swap Pickup & Destination"
                >
                  <ArrowUpDown size={13} className="text-blue-600" />
                  <span>Swap From ⇄ To</span>
                </button>
              </div>

              {/* Destination Drop (Manual Autocomplete Search & 100km Corridors) */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Destination (To)</label>
                  <span className="text-[10px] font-semibold text-emerald-600">Manual Search / 100km Corridors</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-emerald-600">
                    <Navigation size={16} />
                  </div>
                  <input
                    type="text"
                    value={destText}
                    onChange={e => {
                      setDestText(e.target.value);
                      setActiveSearchField('destination');
                    }}
                    onFocus={() => setActiveSearchField('destination')}
                    onKeyDown={handleDestKeyDown}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                    placeholder="Search destination city, landmark, or corridor..."
                  />
                  {destText && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestText('');
                        setActiveSearchField('destination');
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                      title="Clear destination"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Destination Autocomplete Dropdown */}
                {activeSearchField === 'destination' && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                    {isSearchingDest && (
                      <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                        <RefreshCw size={13} className="animate-spin text-blue-600" />
                        <span>Searching destinations across India...</span>
                      </div>
                    )}

                    {/* Search Results */}
                    {destSuggestions.length > 0 && destSuggestions.map(place => (
                      <button
                        key={place.id || place.name}
                        type="button"
                        onClick={() => handleSelectDestination(place)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50 text-left transition-colors"
                      >
                        <Navigation size={14} className="text-emerald-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">{place.name}</p>
                            {place.distanceKm != null && (
                              <span className="text-[10px] font-mono text-emerald-600 font-bold shrink-0">{place.distanceKm} km</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                        </div>
                      </button>
                    ))}

                    {/* Quick 100km Corridors Suggestions if no search results yet */}
                    {destSuggestions.length === 0 && !isSearchingDest && (
                      <div className="p-3 bg-slate-50/70">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                          ⚡ Suggested Corridors Within 100 KM
                        </p>
                        <div className="space-y-1">
                          {(dynamicCorridors.length > 0 ? dynamicCorridors : selectedHub.hotspots).slice(0, 4).map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                handleSelectHotspot(c);
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-left transition-colors"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{c.desc || c.drop}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold text-emerald-600">₹{c.fare}</span>
                                <p className="text-[9px] text-slate-400">{c.dist} km</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick 100 KM Suggested Corridors Strip */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    ⚡ 100 KM Suggested Corridors:
                  </span>
                  <a href="#places-to-go" className="text-[10px] font-bold text-blue-600 hover:underline">
                    View All Corridors
                  </a>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(dynamicCorridors.length > 0 ? dynamicCorridors : selectedHub.hotspots).slice(0, 4).map(place => {
                    const isSel = selectedHotspot?.id === place.id;
                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => handleSelectHotspot(place)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1 ${
                          isSel
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <span>{place.name.split(' ')[0]}</span>
                        <span className={`text-[10px] ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>
                          ({place.dist}km)
                        </span>
                      </button>
                    );
                  })}
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

            {/* RIGHT: Live Interactive Ride Showcase (100% Map-Free, High-Converting Perfect UI) */}
            <div className="w-full min-w-0 max-w-full lg:col-span-6 h-full">
              <HeroRideShowcase 
                selectedHub={selectedHub} 
                selectedHotspot={selectedHotspot} 
                selectedService={selectedService} 
                estFare={estFare} 
                pickupText={pickupText} 
                onConfirmBooking={handleConfirmBooking} 
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH RESPONSIVE TRUST & METRICS STRIP (Decongested & Centered) ── */}
      <section className="w-full flex justify-center py-8 sm:py-10 bg-white border-y border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
            
            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">11,560+</p>
              <p className="text-xs font-bold text-slate-700 mt-1">Verified Fleet Online</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across 30+ Indian Hubs</p>
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

      {/* ── POPULAR ROUTES SECTION (LOCATION-AWARE & STRICTLY 100 KM RANGE) ── */}
      <section id="places-to-go" className="w-full flex justify-center py-14 sm:py-20 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  ⚡ 100 KM Range Suggestions
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>📍 Based on {userLocation?.city || selectedHub.name} (Live GPS)</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Corridors (Within 100 KM)
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                High-frequency transit corridors, regional hubs, and campus links suggested within 100 km of {userLocation?.name || selectedHub.locality}. Tap any corridor or freely enter custom destinations above.
              </p>
            </div>
            <button onClick={detectGPS}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 shadow-xs">
              <Crosshair size={13} className={liveLocation.loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
              <span>{liveLocation.isLive ? 'GPS Synced' : 'Detect GPS'}</span>
            </button>
          </div>

          {corridorsLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs font-semibold text-slate-600">Finding popular 100 KM travel corridors for your location...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(dynamicCorridors.length > 0 ? dynamicCorridors : selectedHub.hotspots).map(place => {
                const Icon = place.icon || Building2;
                const isSel = selectedHotspot?.id === place.id;
                return (
                  <div key={place.id} onClick={() => handleSelectHotspot(place)}
                    className={`group cursor-pointer rounded-2xl p-5 border transition-all hover:shadow-md ${
                      isSel ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-600/10' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {place.dist} km
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {place.badge || '100km'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{place.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">{place.desc || place.drop}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">⚡ Within 100 km · ~{place.mins}m</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">₹{place.fare}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-blue-700 group-hover:bg-blue-50'
                        }`}>
                          {isSel ? 'Selected' : 'Pick Corridor'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            <div className="flex max-w-full flex-wrap justify-center p-1 bg-slate-200/70 rounded-2xl gap-1">
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
    </div>
  );
}
