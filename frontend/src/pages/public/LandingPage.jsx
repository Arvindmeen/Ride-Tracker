import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Clock, Shield, Star, ArrowRight, Zap, Globe, Activity,
  Car, Users, CheckCircle2, ChevronRight, Phone, Mail, Award,
  Sparkles, Compass, AlertTriangle, Radio, ShieldCheck, HeartHandshake,
  TrendingUp, Layers, Terminal, ChevronDown, Send, Check, Smartphone,
  DollarSign, BarChart3, Navigation, Lock, Search, Calendar, Briefcase,
  Luggage, Fuel, BatteryCharging, ChevronUp, ExternalLink, HelpCircle,
  GraduationCap, Building2, Map as MapIcon, Sliders, RefreshCw, QrCode,
  Crosshair, Plane, Train, Hospital, ShoppingBag, Share2, SlidersHorizontal
} from 'lucide-react';
import { useAuthStore, useMapStore, useBookingStore } from '@/stores';
import { REGIONS } from '@/constants';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const LiveMap = React.lazy(() => import('@/components/map/LiveMap'));

// Dynamic Regional Destination Catalogs for Precise Indian Location Predictions
const REGIONAL_PREDICTIONS = {
  IIT_KGP: [
    {
      id: 'kgp_station',
      name: 'Kharagpur Jn Railway Station',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Train,
      dropName: 'Kharagpur Junction Railway Station (Platform 1 Gate)',
    },
    {
      id: 'ccu_airport',
      name: 'Kolkata Airport (CCU T2 Outstation)',
      categoryLabel: '100+ km Outstation',
      tagline: 'Direct NH16 6-lane expressway transfer directly to Terminal 2 Departures',
      distanceKm: 124.0,
      durationMins: 135,
      estFare: 2680,
      badge: '100+ km Outstation',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Plane,
      dropName: 'Kolkata Airport (CCU Terminal 2 Departure Gate)',
    },
    {
      id: 'tech_market',
      name: 'Technology Market (Tech Mkt)',
      categoryLabel: 'Campus Core & Food',
      tagline: 'Evening food stalls, student canteens, stationery, and daily essentials',
      distanceKm: 2.2,
      durationMins: 6,
      estFare: 25,
      badge: 'Flat Campus Toto',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShoppingBag,
      dropName: 'Technology Market (Tech Mkt), IIT Kharagpur',
    },
    {
      id: 'nalanda',
      name: 'Nalanda Classroom Complex',
      categoryLabel: 'Academic Core',
      tagline: 'Fast bike or toto transfer for 8 AM morning engineering lectures and exams',
      distanceKm: 1.8,
      durationMins: 5,
      estFare: 18,
      badge: '1-Min Arrival',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: GraduationCap,
      dropName: 'Nalanda Classroom Complex (Tower 1)',
    },
    {
      id: 'bc_roy_hospital',
      name: 'Dr. B.C. Roy Medical Hub',
      categoryLabel: '24/7 Healthcare',
      tagline: 'Rapid priority ambulance and Toto dispatch for medical appointments & emergencies',
      distanceKm: 1.4,
      durationMins: 4,
      estFare: 20,
      badge: 'Priority Medical',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Hospital,
      dropName: 'Dr. B.C. Roy Multi-Speciality Hospital, Balarampur',
    },
    {
      id: 'midnapore_town',
      name: 'Midnapore Town District Centre',
      categoryLabel: 'District Headquarters',
      tagline: 'District administration, courts, intercity central bus terminus & bazaars',
      distanceKm: 14.6,
      durationMins: 28,
      estFare: 220,
      badge: 'Intercity Connect',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Building2,
      dropName: 'Midnapore Collectorate & Central Bus Terminus',
    },
  ],
  MUMBAI: [
    {
      id: 'bom_airport',
      name: 'Mumbai Airport (CSMIA T2)',
      categoryLabel: 'International & Domestic',
      tagline: 'Express cab via Western Express Highway directly to Departure Gate 4',
      distanceKm: 6.8,
      durationMins: 18,
      estFare: 280,
      badge: 'Terminal 2',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Plane,
      dropName: 'Chhatrapati Shivaji Maharaj International Airport (T2)',
    },
    {
      id: 'dadar_station',
      name: 'Dadar Central Terminus',
      categoryLabel: 'Rail Transit Hub',
      tagline: 'Central & Western railway interchange for local and outstation trains',
      distanceKm: 4.5,
      durationMins: 14,
      estFare: 110,
      badge: 'High Frequency',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Train,
      dropName: 'Dadar Railway Station (Central Line Gate)',
    },
    {
      id: 'bkc_corp',
      name: 'Bandra Kurla Complex (BKC)',
      categoryLabel: 'Financial District',
      tagline: 'Corporate headquarters, SEBI, US Consulate & Jio World Centre',
      distanceKm: 3.2,
      durationMins: 9,
      estFare: 95,
      badge: 'Business Hub',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Building2,
      dropName: 'Bandra-Kurla Complex (G Block)',
    },
    {
      id: 'pune_outstation',
      name: 'Pune Hinjewadi (100+ km Outstation)',
      categoryLabel: 'Expressway Intercity',
      tagline: 'Direct Mumbai-Pune Expressway sedan transit with Fastag tolls included',
      distanceKm: 142.0,
      durationMins: 155,
      estFare: 3150,
      badge: '100+ km Outstation',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Car,
      dropName: 'Hinjewadi Tech Park Phase 1, Pune',
    },
    {
      id: 'phoenix_mall',
      name: 'Phoenix Marketcity Kurla',
      categoryLabel: 'Shopping & Dining',
      tagline: 'Retail stores, cinema multiplex, food courts & family entertainment',
      distanceKm: 2.8,
      durationMins: 8,
      estFare: 75,
      badge: 'Popular Retail',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: ShoppingBag,
      dropName: 'Phoenix Marketcity, Kurla West',
    },
    {
      id: 'marine_drive',
      name: 'Marine Drive & Nariman Point',
      categoryLabel: 'South Mumbai Core',
      tagline: 'Coastal promenade, corporate towers, and heritage sea view boulevard',
      distanceKm: 12.4,
      durationMins: 26,
      estFare: 240,
      badge: 'South Mumbai',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Compass,
      dropName: 'Marine Drive Promenade (Near Air India Building)',
    },
  ],
  DELHI: [
    {
      id: 'del_airport',
      name: 'Indira Gandhi Airport (IGI T3)',
      categoryLabel: 'Airport Express',
      tagline: 'Smooth direct transit via Airport Express Line corridor to Terminal 3',
      distanceKm: 12.5,
      durationMins: 24,
      estFare: 340,
      badge: 'Terminal 3',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Plane,
      dropName: 'IGI Airport Terminal 3 Departures',
    },
    {
      id: 'ndls_station',
      name: 'New Delhi Railway Station (NDLS)',
      categoryLabel: 'Northern Railway Gateway',
      tagline: 'Direct drop at Ajmeri Gate or Paharganj for Vande Bharat & Rajdhani',
      distanceKm: 6.4,
      durationMins: 18,
      estFare: 120,
      badge: 'High Frequency',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Train,
      dropName: 'New Delhi Railway Station (Ajmeri Gate Side)',
    },
    {
      id: 'cyber_hub',
      name: 'DLF Cyber Hub Gurgaon',
      categoryLabel: 'Tech & Corporate Zone',
      tagline: 'MNC headquarters, dining avenues & Rapid Metro connectivity',
      distanceKm: 8.2,
      durationMins: 20,
      estFare: 190,
      badge: 'Corporate Hub',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Building2,
      dropName: 'DLF Cyber City Phase 2, Gurugram',
    },
    {
      id: 'agra_outstation',
      name: 'Agra Taj Expressway (100+ km)',
      categoryLabel: 'Yamuna Expressway Intercity',
      tagline: 'High-speed sedan transit direct to Agra & Taj Mahal via Yamuna Expressway',
      distanceKm: 210.0,
      durationMins: 190,
      estFare: 3850,
      badge: '100+ km Outstation',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Car,
      dropName: 'Taj Mahal East Gate / Agra Cantonment',
    },
    {
      id: 'connaught_place',
      name: 'Connaught Place Inner Circle',
      categoryLabel: 'Central Capital District',
      tagline: 'Heritage colonnades, Metro interchange, retail flagship stores & dining',
      distanceKm: 5.1,
      durationMins: 15,
      estFare: 95,
      badge: 'Central Delhi',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: ShoppingBag,
      dropName: 'Connaught Place (Block A Inner Circle)',
    },
    {
      id: 'aiims_hospital',
      name: 'AIIMS & Safdarjung Medical Campus',
      categoryLabel: 'Apex Healthcare Center',
      tagline: 'Priority medical transit with direct hospital emergency gate access',
      distanceKm: 4.2,
      durationMins: 12,
      estFare: 80,
      badge: 'Priority Medical',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Hospital,
      dropName: 'AIIMS Main Hospital Gate, Ansari Nagar',
    },
  ],
  BENGALURU: [
    {
      id: 'blr_airport',
      name: 'Kempegowda Airport (BLR T1/T2)',
      categoryLabel: 'Airport Expressway',
      tagline: 'Direct NH44 elevated tollway sedan transfer to Terminal 1 & 2',
      distanceKm: 32.0,
      durationMins: 45,
      estFare: 850,
      badge: 'Terminal 1 & 2',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Plane,
      dropName: 'Kempegowda International Airport Terminal 2',
    },
    {
      id: 'ksr_station',
      name: 'KSR Bengaluru City Junction',
      categoryLabel: 'Central Railway Gateway',
      tagline: 'Direct station cab via Majestic interchange for Vande Bharat & Express',
      distanceKm: 6.2,
      durationMins: 18,
      estFare: 130,
      badge: 'High Frequency',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Train,
      dropName: 'KSR Bengaluru Station (Main Concourse Gate)',
    },
    {
      id: 'ecity_hub',
      name: 'Electronic City Phase 1',
      categoryLabel: 'IT & Software Park',
      tagline: 'Elevated Expressway transit to Infosys, Wipro & tech corporate campuses',
      distanceKm: 14.0,
      durationMins: 28,
      estFare: 260,
      badge: 'Tech Park',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Building2,
      dropName: 'Electronic City Phase 1 Toll Plaza',
    },
    {
      id: 'mysore_outstation',
      name: 'Mysuru Highway (100+ km Outstation)',
      categoryLabel: 'Bengaluru-Nidaghatta Expressway',
      tagline: '10-lane express highway transfer to Mysuru Palace & Chamundi Hill',
      distanceKm: 145.0,
      durationMins: 140,
      estFare: 2950,
      badge: '100+ km Outstation',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Car,
      dropName: 'Mysuru Palace Gate / Suburb Bus Stand',
    },
    {
      id: 'koramangala',
      name: 'Koramangala 80 Feet Road',
      categoryLabel: 'Startup Hub & Cafes',
      tagline: 'Startup offices, microbreweries, retail boutiques & co-working spaces',
      distanceKm: 3.8,
      durationMins: 12,
      estFare: 75,
      badge: 'Popular Hub',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: ShoppingBag,
      dropName: 'Koramangala 4th Block (80 Feet Road)',
    },
    {
      id: 'whitefield_itpl',
      name: 'Whitefield ITPL Tech Campus',
      categoryLabel: 'Eastern Tech Corridor',
      tagline: 'Direct cab connection to International Tech Park & ITPL campus',
      distanceKm: 16.0,
      durationMins: 32,
      estFare: 320,
      badge: 'Tech Corridor',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Building2,
      dropName: 'ITPL Main Gate, Whitefield',
    },
  ],
};

function getUniversalIndiaPredictions(lat, lng) {
  return [
    {
      id: 'nearest_station',
      name: 'Central Junction Railway Station',
      categoryLabel: 'Local Rail Gateway',
      tagline: 'Direct station drop for intercity express trains and passenger trains',
      distanceKm: 4.8,
      durationMins: 12,
      estFare: 65,
      badge: 'High Frequency',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Train,
      dropName: `City Railway Station (near ${lat.toFixed(2)}°N)`,
    },
    {
      id: 'regional_airport',
      name: 'Domestic Airport / Outstation',
      categoryLabel: 'Regional Flights & Highway',
      tagline: 'Direct highway transfer to nearest commercial airport terminal',
      distanceKm: 42.0,
      durationMins: 55,
      estFare: 780,
      badge: 'Outstation Cab',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Plane,
      dropName: `Regional Airport Terminal (Outstation)`,
    },
    {
      id: 'civil_hospital',
      name: 'District Civil Hospital & Emergency',
      categoryLabel: '24/7 Healthcare',
      tagline: 'Emergency vehicle dispatch with priority hospital ambulance link',
      distanceKm: 2.4,
      durationMins: 6,
      estFare: 35,
      badge: 'Priority Medical',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Hospital,
      dropName: `District Civil Hospital & Trauma Centre`,
    },
    {
      id: 'central_market',
      name: 'Main Bazaar Commercial Hub',
      categoryLabel: 'Shopping & Retail',
      tagline: 'City center commercial complexes, banks, and general market',
      distanceKm: 1.8,
      durationMins: 5,
      estFare: 25,
      badge: 'City Center',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShoppingBag,
      dropName: `Main Bazaar Market Centre`,
    },
    {
      id: 'intercity_bus',
      name: 'State Highway Bus Terminus',
      categoryLabel: 'Intercity Transit',
      tagline: 'Intercity and regional state transport express bus connections',
      distanceKm: 5.6,
      durationMins: 14,
      estFare: 80,
      badge: 'Highway Connect',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Building2,
      dropName: `Central Inter-City Bus Terminus`,
    },
    {
      id: 'univ_campus',
      name: 'University & Engineering Campus',
      categoryLabel: 'Higher Education Hub',
      tagline: 'Campus gates, lecture halls, and student residency complexes',
      distanceKm: 3.4,
      durationMins: 8,
      estFare: 45,
      badge: 'Campus Direct',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: GraduationCap,
      dropName: `University Main Campus Gate`,
    },
  ];
}

const VEHICLE_SERVICES = [
  {
    id: 'toto',
    name: 'Campus Toto / Auto',
    category: 'Electric & Auto',
    capacity: '4 seats',
    eta: '1 min away',
    basePrice: 20,
    pricePerKm: 8,
    icon: '🛺',
    badge: 'Popular',
  },
  {
    id: 'bike',
    name: 'Rapido Bike Taxi',
    category: '1-Wheeler',
    capacity: '1 seat',
    eta: '2 mins away',
    basePrice: 15,
    pricePerKm: 6,
    icon: '🏍️',
    badge: 'Fastest',
  },
  {
    id: 'sedan',
    name: 'Prime Sedan / Cab',
    category: '4-Seater AC',
    capacity: '4 seats',
    eta: '3 mins away',
    basePrice: 60,
    pricePerKm: 14,
    icon: '🚗',
    badge: 'Comfort',
  },
  {
    id: 'outstation',
    name: '100+ km Outstation',
    category: 'Highway Highway',
    capacity: '4 seats',
    eta: '10 mins notice',
    basePrice: 650,
    pricePerKm: 15,
    icon: '🛣️',
    badge: 'Outstation',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role: userRole, isAuthenticated, login } = useAuthStore();
  const { setPickup, setDestination, setCategory, setEstimatedFare, setStep } = useBookingStore();
  const { currentRegion, setRegion, startSimulation } = useMapStore();

  const activeRole = isAuthenticated ? (userRole || user?.role || 'USER') : null;

  const askLocationParam = searchParams.get('askLocation') === 'true';
  const fromLoginParam = searchParams.get('fromLogin') === 'true';

  // Smart Location Permission & Prediction Banner State
  const [showLocationBanner, setShowLocationBanner] = useState(askLocationParam || fromLoginParam || true);
  const [detectedRegion, setDetectedRegion] = useState('IIT_KGP');

  const [heroTab, setHeroTab] = useState('ride');
  const [activePortalTab, setActivePortalTab] = useState('user');
  const [rideTiming, setRideTiming] = useState('NOW'); // 'NOW' | 'SCHEDULE'
  const [splitCount, setSplitCount] = useState(1);

  // Live Location Detection State
  const [liveLocation, setLiveLocation] = useState({
    lat: 22.3149,
    lng: 87.3060,
    name: 'Scholars Avenue, IIT Kharagpur',
    locality: 'IIT Kharagpur, West Bengal',
    isLive: false,
    loading: false,
    accuracy: 12,
  });

  const [pickupLocation, setPickupLocation] = useState('📍 Scholars Avenue (RK Hall Gate), IIT Kharagpur');
  const [destinationLocation, setDestinationLocation] = useState('Technology Market (Tech Mkt)');
  const [selectedDestinationId, setSelectedDestinationId] = useState('tech_market');
  const [selectedServiceId, setSelectedServiceId] = useState('toto');

  // Dynamic Destination Predictions for Current Region
  const dynamicPlaces = useMemo(() => {
    if (REGIONAL_PREDICTIONS[detectedRegion]) {
      return REGIONAL_PREDICTIONS[detectedRegion];
    }
    return getUniversalIndiaPredictions(liveLocation.lat, liveLocation.lng);
  }, [detectedRegion, liveLocation.lat, liveLocation.lng]);

  const activePlace = dynamicPlaces.find((p) => p.id === selectedDestinationId) || dynamicPlaces[0];
  const currentService = VEHICLE_SERVICES.find((s) => s.id === selectedServiceId) || VEHICLE_SERVICES[0];

  const estDistanceKm = activePlace.distanceKm;
  const estFare = Math.round(currentService.basePrice + estDistanceKm * currentService.pricePerKm);

  // Dynamic destination coordinate object for Map
  const destinationCoord = useMemo(() => {
    return {
      lat: liveLocation.lat + (selectedDestinationId.includes('airport') || selectedDestinationId.includes('outstation') ? 0.08 : 0.008),
      lng: liveLocation.lng + (selectedDestinationId.includes('airport') || selectedDestinationId.includes('outstation') ? 0.08 : 0.007),
      name: destinationLocation,
    };
  }, [destinationLocation, selectedDestinationId, liveLocation]);

  const mapCenter = useMemo(() => ({
    lat: liveLocation.lat,
    lng: liveLocation.lng,
  }), [liveLocation.lat, liveLocation.lng]);

  const mapPickup = useMemo(() => ({
    lat: liveLocation.lat,
    lng: liveLocation.lng,
    name: pickupLocation || 'Your Live Pickup Point',
  }), [liveLocation.lat, liveLocation.lng, pickupLocation]);

  // Real-time GPS Detection & Smart Indian Region Matching
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setLiveLocation((prev) => ({ ...prev, isLive: true, loading: false }));
      setShowLocationBanner(false);
      return;
    }
    setLiveLocation((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        const dKgp = Math.hypot(latitude - 22.3149, longitude - 87.3060);
        const dBom = Math.hypot(latitude - 19.0760, longitude - 72.8777);
        const dDel = Math.hypot(latitude - 28.6139, longitude - 77.2090);
        const dBlr = Math.hypot(latitude - 12.9716, longitude - 77.5946);

        let regionKey = 'IIT_KGP';
        let localityName = 'Scholars Avenue, IIT Kharagpur';
        let minD = dKgp;

        if (dBom < minD) { minD = dBom; regionKey = 'MUMBAI'; localityName = 'Bandra Kurla Complex (BKC), Mumbai'; }
        if (dDel < minD) { minD = dDel; regionKey = 'DELHI'; localityName = 'Connaught Place / Central Delhi'; }
        if (dBlr < minD) { minD = dBlr; regionKey = 'BENGALURU'; localityName = 'MG Road / Koramangala, Bengaluru'; }

        if (minD > 1.8) {
          regionKey = 'PAN_INDIA';
          localityName = `Live Area (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
        }

        setDetectedRegion(regionKey);
        setLiveLocation({
          lat: latitude,
          lng: longitude,
          name: localityName,
          locality: localityName,
          isLive: true,
          loading: false,
          accuracy: Math.round(accuracy || 15),
        });
        setPickupLocation(`📍 ${localityName}`);
        setRegion('LIVE_GPS', { lat: latitude, lng: longitude }, 15);
        setShowLocationBanner(false);
      },
      (err) => {
        setLiveLocation((prev) => ({
          ...prev,
          loading: false,
          isLive: true,
          locality: 'IIT Kharagpur Campus Stand',
        }));
        setPickupLocation('📍 Scholars Avenue (RK Hall Gate), IIT Kharagpur');
        setShowLocationBanner(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleManualRegionSelect = (regKey, locName, coords) => {
    setDetectedRegion(regKey);
    setLiveLocation({
      lat: coords.lat,
      lng: coords.lng,
      name: locName,
      locality: locName,
      isLive: true,
      loading: false,
      accuracy: 10,
    });
    setPickupLocation(`📍 ${locName}`);
    setRegion(regKey, coords, 14);
    setShowLocationBanner(false);
  };

  useEffect(() => {
    startSimulation();
    if (askLocationParam || fromLoginParam) {
      detectLiveLocation();
    }
  }, [startSimulation, askLocationParam, fromLoginParam]);

  const handleLaunchRole = (targetRole) => {
    login(targetRole);
    if (targetRole === 'ADMIN') navigate('/admin/dashboard');
    else if (targetRole === 'DRIVER') navigate('/driver/dashboard');
    else navigate('/app/home');
  };

  const handleConfirmBooking = () => {
    if (!isAuthenticated) {
      login('USER');
    }
    setPickup({
      lat: liveLocation.lat,
      lng: liveLocation.lng,
      name: pickupLocation || 'Your Live Pickup Point',
      address: liveLocation.locality || 'Detected Live GPS Location',
    });
    setDestination({
      lat: destinationCoord.lat,
      lng: destinationCoord.lng,
      name: destinationLocation || activePlace.dropName,
      address: activePlace.desc || 'Selected Destination Point',
    });
    setCategory(currentService.category || 'MOTO');
    setEstimatedFare(estFare);
    setStep('CONFIRM');
    navigate('/app/home');
  };

  const handleSelectPlace = (place) => {
    setDestinationLocation(place.dropName);
    setSelectedDestinationId(place.id);
    const elem = document.getElementById('booking');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  // Contact Form
  const [contactData, setContactData] = useState({ name: '', email: '', category: 'campus_iit', msg: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactData.email) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactData({ name: '', email: '', category: 'campus_iit', msg: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Global Navbar ──────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Smart GPS Location Permission & Prediction Notification Banner ───────── */}
      {showLocationBanner && (
        <aside
          role="region"
          aria-label="Location permission request"
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2.5 z-40 relative animate-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{fromLoginParam ? '👋 Welcome! Enable Live GPS for Instant Ride Predictions' : '📍 Enable Live Location'}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Dynamic Dispatch</span>
              </p>
              <p className="text-[11px] text-blue-100">
                Detect your physical coordinates to find nearest campus & city drivers with upfront guaranteed fares.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={detectLiveLocation}
              disabled={liveLocation.loading}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Crosshair size={13} className={liveLocation.loading ? 'animate-spin' : ''} />
              <span>{liveLocation.loading ? 'Detecting GPS...' : 'Allow Live GPS'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 bg-black/20 p-0.5 rounded-xl border border-white/10 text-[10px] font-bold">
              <span className="px-1.5 text-blue-200">Or Hub:</span>
              <button
                onClick={() => handleManualRegionSelect('IIT_KGP', 'Scholars Avenue, IIT Kharagpur', { lat: 22.3149, lng: 87.3060 })}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                IIT KGP
              </button>
              <button
                onClick={() => handleManualRegionSelect('MUMBAI', 'BKC, Mumbai', { lat: 19.0607, lng: 72.8688 })}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                Mumbai
              </button>
              <button
                onClick={() => handleManualRegionSelect('DELHI', 'Connaught Place, Delhi', { lat: 28.6139, lng: 77.2090 })}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                Delhi
              </button>
              <button
                onClick={() => handleManualRegionSelect('BENGALURU', 'Koramangala, Bengaluru', { lat: 12.9352, lng: 77.6245 })}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                BLR
              </button>
            </div>

            <button
              onClick={() => setShowLocationBanner(false)}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* ── Hero Section (Compact, Clean & All-White Map Canvas) ──────────────── */}
      <section id="booking" className="relative bg-slate-50/70 pt-4 pb-8 sm:pt-6 sm:pb-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Booking Card */}
            <div className="lg:col-span-5 z-10">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-5 space-y-3.5">
                
                {/* Mode Selector Tabs (Visible only for non-authenticated guests) */}
                {!isAuthenticated ? (
                  <div className="flex border-b border-slate-100 pb-2 gap-1.5">
                    <button
                      onClick={() => setHeroTab('ride')}
                      className={`flex items-center gap-1.5 pb-1.5 px-3 text-xs font-black border-b-2 transition-all ${
                        heroTab === 'ride' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Car size={15} />
                      <span>Book Ride</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('drive')}
                      className={`flex items-center gap-1.5 pb-1.5 px-3 text-xs font-black border-b-2 transition-all ${
                        heroTab === 'drive' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Briefcase size={15} />
                      <span>Driver Hub</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('enterprise')}
                      className={`flex items-center gap-1.5 pb-1.5 px-3 text-xs font-black border-b-2 transition-all ${
                        heroTab === 'enterprise' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Building2 size={15} />
                      <span>Campus & Corp</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      {activeRole === 'DRIVER' ? (
                        <>
                          <Car size={15} className="text-emerald-600" />
                          <span className="text-emerald-700">Driver Partner Console</span>
                        </>
                      ) : activeRole === 'ADMIN' ? (
                        <>
                          <Terminal size={15} className="text-indigo-600" />
                          <span className="text-indigo-700">Operations Command Center</span>
                        </>
                      ) : (
                        <>
                          <Car size={15} className="text-blue-600" />
                          <span className="text-blue-700">Passenger Booking Console</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                      {user?.name || (activeRole === 'DRIVER' ? 'Driver Partner' : 'Passenger')}
                    </span>
                  </div>
                )}

                {/* ── ROLE CASE 1: LOGGED IN DRIVER PARTNER ── */}
                {isAuthenticated && activeRole === 'DRIVER' && (
                  <div className="space-y-4 py-1">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/30">
                          🚗
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {user?.name || 'Subhash Mondal'}
                          </h3>
                          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Driver Partner · Ready for Dispatches</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        ★ 4.92 Rating
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Vehicle Registered</p>
                        <p className="font-black text-slate-800 mt-0.5">Hero Splendor Plus</p>
                        <p className="text-[11px] font-mono text-slate-500">WB 29 AB 1042</p>
                      </div>
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                        <p className="text-[10px] text-emerald-600 font-extrabold uppercase">Today's Net Settlements</p>
                        <p className="font-black text-emerald-900 text-lg mt-0.5">₹1,840</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">12% Lowest Fee · Daily UPI</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => navigate('/driver/dashboard')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-95"
                      >
                        <span>Launch Driver Cockpit & Accept Dispatches</span>
                        <ArrowRight size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate('/driver/earnings')}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <DollarSign size={14} className="text-emerald-600" />
                          <span>Earnings & UPI</span>
                        </button>
                        <button
                          onClick={() => navigate('/contact')}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone size={14} className="text-blue-600" />
                          <span>Welfare Support</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ROLE CASE 2: LOGGED IN OPERATIONS ADMIN ── */}
                {isAuthenticated && activeRole === 'ADMIN' && (
                  <div className="space-y-4 py-1">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/30">
                          🖥️
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            Operations Command Center
                          </h3>
                          <p className="text-xs text-indigo-700 font-bold mt-0.5">
                            Pan-India Mobility Radar · Central Ops
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-xl">
                        99.98% SLA
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Active Fleets</p>
                        <p className="font-black text-slate-900 text-lg mt-0.5">18 Vehicles</p>
                        <p className="text-[10px] text-emerald-600 font-bold">100% Telemetry Live</p>
                      </div>
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                        <p className="text-[10px] text-indigo-600 font-extrabold uppercase">Platform Volume</p>
                        <p className="font-black text-indigo-900 text-lg mt-0.5">₹48.2k Today</p>
                        <p className="text-[10px] text-indigo-700 font-semibold">12% GMV Take Rate</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-95"
                      >
                        <span>Open Operations Command Radar</span>
                        <ArrowRight size={16} />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate('/admin/live-map')}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Activity size={14} className="text-indigo-600" />
                          <span>Fleet Live Map</span>
                        </button>
                        <button
                          onClick={() => navigate('/admin/drivers')}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Shield size={14} className="text-emerald-600" />
                          <span>Drivers Audit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ROLE CASE 3: PASSENGER BOOKING CONSOLE (Default for Riders & Guests) ── */}
                {(!isAuthenticated || activeRole === 'USER') && heroTab === 'ride' && (
                  <div className="space-y-3">
                    
                    {/* Header with Live Location Re-scan */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                          Where Are You Heading?
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          {liveLocation.locality}
                        </p>
                      </div>

                      {/* Ride Now vs Schedule Later Toggle */}
                      <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-bold">
                        <button
                          onClick={() => setRideTiming('NOW')}
                          className={`px-2 py-1 rounded-lg transition-all ${rideTiming === 'NOW' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
                        >
                          ⚡ Now
                        </button>
                        <button
                          onClick={() => setRideTiming('SCHEDULE')}
                          className={`px-2 py-1 rounded-lg transition-all ${rideTiming === 'SCHEDULE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
                        >
                          📅 Reserve
                        </button>
                      </div>
                    </div>

                    {/* Pickup & Destination Inputs */}
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-blue-600">
                          <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white" />
                        </div>
                        <input
                          type="text"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="Your pickup point"
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-8 pr-20 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          onClick={detectLiveLocation}
                          className="absolute right-1.5 top-1.5 px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] font-black transition-all flex items-center gap-1"
                        >
                          <Crosshair size={10} className={liveLocation.loading ? 'animate-spin' : ''} />
                          <span>GPS</span>
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-900">
                          <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                        </div>
                        <input
                          type="text"
                          value={destinationLocation}
                          onChange={(e) => setDestinationLocation(e.target.value)}
                          placeholder="Search destination, station or airport..."
                          className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* Quick Destination Prediction Chips for Detected Region */}
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[10px]">
                        <span className="font-extrabold uppercase text-slate-400 tracking-wider">
                          Suggested Hotspots in {detectedRegion === 'IIT_KGP' ? 'IIT Kharagpur' : detectedRegion}
                        </span>
                        <span className="text-blue-600 font-bold">{dynamicPlaces.length} Destinations</span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {dynamicPlaces.map((place) => {
                          const isSelected = place.id === selectedDestinationId;
                          return (
                            <button
                              key={place.id}
                              onClick={() => {
                                setSelectedDestinationId(place.id);
                                setDestinationLocation(place.dropName);
                              }}
                              className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {typeof place.icon === 'function' || (typeof place.icon === 'object' && place.icon !== null) ? (
                                <place.icon size={13} className="text-blue-600 flex-shrink-0" />
                              ) : (
                                <span>{place.icon || '📍'}</span>
                              )}
                              <span>{place.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({place.distanceKm} km)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vehicle Service Category Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[10px]">
                        <span className="font-extrabold uppercase text-slate-400 tracking-wider">Choose Mobility Service</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Guaranteed Low Fare
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {VEHICLE_SERVICES.map((srv) => {
                          const isSelected = srv.id === selectedServiceId;
                          const price = Math.round(srv.basePrice + estDistanceKm * srv.pricePerKm);
                          return (
                            <button
                              key={srv.id}
                              onClick={() => setSelectedServiceId(srv.id)}
                              className={`p-2 rounded-2xl text-left transition-all border ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-lg">{srv.icon}</span>
                                <span className="text-xs font-black text-slate-900">₹{price}</span>
                              </div>
                              <p className="text-[11px] font-black text-slate-900 mt-1 leading-tight">{srv.name}</p>
                              <p className="text-[9px] text-slate-500">{srv.eta}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fare Summary & Split Fare Option */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-black text-slate-900 text-xs">
                            Est: ₹{estFare} · {estDistanceKm} km
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span>Split:</span>
                            {[1, 2, 3, 4].map((num) => (
                              <button
                                key={num}
                                onClick={() => setSplitCount(num)}
                                className={`px-1.5 py-0.2 rounded font-bold transition-all ${
                                  splitCount === num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {num}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">₹{Math.round(estFare / splitCount)}</span>
                        {splitCount > 1 && <span className="text-[9px] text-slate-400 block font-bold">per person</span>}
                      </div>
                    </div>

                    {/* Confirm CTA */}
                    <button
                      onClick={handleConfirmBooking}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-2xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-95"
                    >
                      <span>Confirm & Book {currentService.name} (₹{estFare})</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* ── GUEST TAB 2: DRIVER PARTNER PROMO (For non-authenticated visitors) ── */}
                {!isAuthenticated && heroTab === 'drive' && (
                  <div className="space-y-3 py-1">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Driver Partner Network</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Drive motorcycle, auto, toto, or cab across India. 12% lowest commission and daily UPI payouts.
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                      <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <DollarSign size={14} className="text-emerald-600" />
                        <span>Daily Instant UPI Payout</span>
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Zero waiting. Withdraw trip earnings directly to Google Pay or PhonePe every evening.
                      </p>
                    </div>

                    <button
                      onClick={() => handleLaunchRole('DRIVER')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <span>Open Live Driver Cockpit</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* ── GUEST TAB 3: CAMPUS & CORPORATE FLEET (For non-authenticated visitors) ── */}
                {!isAuthenticated && heroTab === 'enterprise' && (
                  <div className="space-y-3 py-1">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Campus & Fleet Operations</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Institutional fleet management for IIT Kharagpur departments and corporate tech parks.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-indigo-600" />
                        <span>Centralized GST Invoicing & Live Audit Trails</span>
                      </p>
                      <p className="text-[11px] text-indigo-700">
                        Monthly billing accounts for departments, student fests, and campus VIP transfers.
                      </p>
                    </div>

                    <button
                      onClick={() => handleLaunchRole('ADMIN')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <span>Open Operations Command Center</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Live White Map Canvas */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-800 font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Fleet Radar:</span>
                  <span className="text-blue-600">{liveLocation.locality}</span>
                </div>

                <button
                  onClick={detectLiveLocation}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs"
                  title="Re-detect live GPS"
                >
                  <Crosshair size={11} className={liveLocation.loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
                  <span>Re-center GPS</span>
                </button>
              </div>

              {/* White Map Card Frame */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Clean White Top Bar */}
                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold">Live India Fleet Radar</span>
                    <span className="text-slate-400 text-[10px]">· 18 Active Vehicles</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {liveLocation.lat.toFixed(3)}°N, {liveLocation.lng.toFixed(3)}°E
                  </span>
                </div>

                {/* Real Interactive Leaflet Map with Pristine White Tiles */}
                <div className="relative h-72 sm:h-96 bg-slate-50 overflow-hidden">
                  <React.Suspense fallback={
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold">
                      Loading Map...
                    </div>
                  }>
                    <LiveMap
                      center={mapCenter}
                      zoom={15}
                      pickup={mapPickup}
                      destination={destinationCoord}
                      showSurgeZones={true}
                      tileTheme="light"
                      height="100%"
                      onRecenterGPS={detectLiveLocation}
                    />
                  </React.Suspense>

                  {/* Compact Floating Nearest Driver Telemetry Pill */}
                  <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xl z-20 pointer-events-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black text-slate-900 uppercase">Nearest Partner Matched</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        0.4 KM AWAY
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
                        🏍️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">Subhash M. (Bike)</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">Hero Splendor · 2 mins away</p>
                      </div>
                      <span className="text-xs font-black text-amber-500">★ 4.92</span>
                    </div>
                  </div>
                </div>

                {/* Map Bottom Mini Stats */}
                <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 grid grid-cols-3 divide-x divide-slate-200 text-center text-xs">
                  <div>
                    <span className="font-black text-slate-900 text-xs">18 Partners</span>
                    <p className="text-slate-400 text-[10px]">Online Nearby</p>
                  </div>
                  <div>
                    <span className="font-black text-blue-600 text-xs">&lt; 35 sec</span>
                    <p className="text-slate-400 text-[10px]">Avg Match Time</p>
                  </div>
                  <div>
                    <span className="font-black text-emerald-600 text-xs">₹0 Hidden</span>
                    <p className="text-slate-400 text-[10px]">100% Upfront Fare</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Destinations from Your Spot (Compact 6-Card Grid) ─────── */}
      <section id="places-to-go" className="py-8 sm:py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Predictive Routes From Your Spot
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Where Can You Go From Here?
              </h2>
              <p className="text-slate-500 text-xs">
                Real distances & upfront fares calculated from your current spot in {liveLocation.locality}.
              </p>
            </div>

            <button
              onClick={detectLiveLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
            >
              <Crosshair size={12} className={liveLocation.loading ? 'animate-spin text-blue-600' : ''} />
              <span>{liveLocation.name.split('(')[0]}</span>
            </button>
          </div>

          {/* Compact 6-Card Destination Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dynamicPlaces.map((place) => {
              const isSelected = selectedDestinationId === place.id;
              const Icon = place.icon;
              return (
                <div
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        {typeof place.icon === 'function' || (typeof place.icon === 'object' && place.icon !== null) ? (
                          <place.icon size={16} />
                        ) : (
                          <span className="text-base">{place.icon || '📍'}</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${place.badgeColor}`}>
                        {place.badge}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">{place.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">{place.tagline}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-mono font-bold">
                      {place.distanceKm} km · ~{place.durationMins}m
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">₹{place.estFare}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlace(place);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Choose'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Three Dedicated Portals (Compact Architecture Showcase) ── */}
      <section id="showcase" className="py-8 sm:py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Full Ecosystem Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Three Portals. One United Mobility Network.
              </h2>
            </div>

            {/* Interactive Switcher */}
            <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs gap-1 self-start sm:self-auto">
              <button
                onClick={() => setActivePortalTab('user')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePortalTab === 'user' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users size={13} />
                <span>Passenger</span>
              </button>
              <button
                onClick={() => setActivePortalTab('driver')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePortalTab === 'driver' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Car size={13} />
                <span>Driver</span>
              </button>
              <button
                onClick={() => setActivePortalTab('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePortalTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Terminal size={13} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Portal Card Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            {activePortalTab === 'user' && (
              <div className="grid sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase">Passenger App Console</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      Zero Surge Pricing
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Live GPS Booking with Safe 4-Digit Ride Start OTP
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Passengers enjoy instant driver matching, live GPS telemetry, verified driver identities, and seamless UPI payments.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-700">
                    <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" /> SOS Helpline</span>
                    <span className="flex items-center gap-1"><Zap size={14} className="text-blue-600" /> Transparent Fares</span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleLaunchRole('USER')}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-md"
                  >
                    Open Passenger App →
                  </button>
                </div>
              </div>
            )}

            {activePortalTab === 'driver' && (
              <div className="grid sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 uppercase">Driver Cockpit</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      12% Lowest Platform Fee
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Proximity Dispatches, "I Have Arrived" Alerts & Daily UPI
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Drivers receive dispatches within their configured radius (&lt; 5 km), tap "I Arrived" to ping passengers, and cash out daily.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-700">
                    <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-600" /> Daily UPI Cashout</span>
                    <span className="flex items-center gap-1"><Radio size={14} className="text-emerald-600" /> 100+ km Outstation Ready</span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleLaunchRole('DRIVER')}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-md"
                  >
                    Open Driver Cockpit →
                  </button>
                </div>
              </div>
            )}

            {activePortalTab === 'admin' && (
              <div className="grid sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600 uppercase">Operations Command Center</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      Admin Radar
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Pan-India Fleet Telemetry, Fare Audits & Incident Safety
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Complete oversight of active drivers, safety alerts, surge monitoring, and encrypted private communication masking.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-700">
                    <span className="flex items-center gap-1"><Terminal size={14} className="text-indigo-600" /> Live Audit Log</span>
                    <span className="flex items-center gap-1"><Lock size={14} className="text-indigo-600" /> Anonymized Gateway</span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleLaunchRole('ADMIN')}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-md"
                  >
                    Open Operations Radar →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 4: 24/7 Helpline & Contact (Compact) ─────────────────────── */}
      <section id="contact" className="py-8 sm:py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  24/7 Support
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">Operations & Safety Helplines</h2>
                <p className="text-xs text-slate-500">Fast assistance across university campuses, stations, and highways.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Pan-India Hotline</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">+91 (022) 8000-RIDE</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Toll-Free 24/7</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">IIT KGP Campus Desk</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">+91 94340-KGP-RIDE</p>
                  <p className="text-[10px] text-blue-600 font-semibold">Tech Mkt Campus Stand</p>
                </div>
              </div>
            </div>

            {/* Quick Ticket Form */}
            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                Quick Dispatch Ticket
              </h3>

              {contactSubmitted ? (
                <div className="py-4 text-center space-y-1">
                  <p className="text-sm font-bold text-emerald-600">✓ Ticket #RT-{Math.floor(100000 + Math.random() * 900000)} Dispatched!</p>
                  <p className="text-xs text-slate-500">A mobility officer will reach out in under 15 minutes.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="grid sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Send size={13} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Global Footer ──────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
