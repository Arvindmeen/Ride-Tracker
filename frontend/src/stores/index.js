import { create } from 'zustand';
import { MOCK_DRIVERS } from '@/mock/drivers';
import { SIMULATION_INTERVAL } from '@/constants';

// ── Auth Store ────────────────────────────────────────────────────────────────
// Mock auth — replace token logic with real JWT when backend is ready
export const useAuthStore = create((set) => ({
  isAuthenticated: true, // mock: always logged in for demo
  user: {
    id: 'U001', name: 'Rahul Mehra', email: 'rahul.mehra@example.com',
    phone: '+91 99887 76655', role: 'USER', rating: 4.7, totalRides: 87,
  },
  role: 'USER', // 'USER' | 'DRIVER' | 'ADMIN'
  token: 'mock-jwt-token',

  login: (role) => set({
    isAuthenticated: true, role,
    token: `mock-jwt-${role.toLowerCase()}`,
    user: role === 'ADMIN'
      ? { id: 'A001', name: 'Admin User', email: 'admin@veloq.com', role: 'ADMIN' }
      : role === 'DRIVER'
      ? { id: 'D001', name: 'Rajesh Kumar', email: 'rajesh@veloq.com', role: 'DRIVER' }
      : { id: 'U001', name: 'Rahul Mehra', email: 'rahul.mehra@example.com', role: 'USER', rating: 4.7, totalRides: 87 },
  }),
  logout: () => set({ isAuthenticated: false, user: null, role: null, token: null }),
  setRole: (role) => set({ role }),
}));

// ── Booking Store ─────────────────────────────────────────────────────────────
export const useBookingStore = create((set, get) => ({
  step: 'LOCATION', // LOCATION | ROUTE_PREVIEW | VEHICLE_SELECT | CONFIRM | SEARCHING | ACTIVE_RIDE
  pickup: null,
  destination: null,
  stops: [],
  category: null,
  scheduledFor: null,
  isScheduled: false,
  promoCode: null,
  paymentMethod: 'CARD',
  isSplitFare: false,
  estimatedFare: null,
  activeRideId: null,

  setPickup: (pickup) => set({ pickup }),
  setDestination: (destination) => set({ destination }),
  addStop: (stop) => set((s) => ({ stops: [...s.stops, stop] })),
  removeStop: (idx) => set((s) => ({ stops: s.stops.filter((_, i) => i !== idx) })),
  setCategory: (category) => set({ category }),
  setStep: (step) => set({ step }),
  setEstimatedFare: (fare) => set({ estimatedFare: fare }),
  setPaymentMethod: (pm) => set({ paymentMethod: pm }),
  setPromoCode: (code) => set({ promoCode: code }),
  toggleSplitFare: () => set((s) => ({ isSplitFare: !s.isSplitFare })),
  setScheduled: (val, datetime) => set({ isScheduled: val, scheduledFor: datetime || null }),
  setActiveRideId: (id) => set({ activeRideId: id }),
  reset: () => set({
    step: 'LOCATION', pickup: null, destination: null, stops: [],
    category: null, scheduledFor: null, isScheduled: false,
    promoCode: null, paymentMethod: 'CARD', isSplitFare: false,
    estimatedFare: null, activeRideId: null,
  }),
}));

// ── Map / Real-time Simulation Store ─────────────────────────────────────────
// This store simulates driver location updates.
// In production: WebSocket GPS events → update this store → map re-renders.
// The UI only reads from this store and doesn't care about the data source.

let simulationTimer = null;

function jitterLocation(loc) {
  return {
    lat: loc.lat + (Math.random() - 0.5) * 0.0015,
    lng: loc.lng + (Math.random() - 0.5) * 0.0015,
  };
}

export const useMapStore = create((set, get) => ({
  currentRegion: 'IIT_KGP',
  center: { lat: 22.3149, lng: 87.3105 }, // Default IIT Kharagpur campus
  zoom: 15,
  drivers: MOCK_DRIVERS.map(d => ({ ...d })),
  selectedDriverId: null,
  layers: {
    drivers: true,
    activeRides: true,
    demand: false,
    supply: false,
    surgeZones: true,
    heatmap: false,
    grid: false,
  },
  isSimulationRunning: false,

  setRegion: (regionKey, customCenter, customZoom) => {
    set({
      currentRegion: regionKey,
      center: customCenter || (regionKey === 'IIT_KGP' ? { lat: 22.3149, lng: 87.3105 } : { lat: 19.0760, lng: 72.8777 }),
      zoom: customZoom || (regionKey === 'IIT_KGP' ? 15 : 13),
    });
  },
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  selectDriver: (id) => set({ selectedDriverId: id }),
  toggleLayer: (layer) => set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),

  startSimulation: () => {
    if (get().isSimulationRunning) return;
    set({ isSimulationRunning: true });
    simulationTimer = setInterval(() => {
      set((s) => ({
        drivers: s.drivers.map(d => {
          if (d.status === 'OFFLINE') return d;
          const newLoc = jitterLocation(d.location);
          return { ...d, location: newLoc, lastUpdated: new Date().toISOString(), speed: d.status === 'AVAILABLE' ? 0 : Math.round(20 + Math.random() * 30) };
        }),
      }));
    }, SIMULATION_INTERVAL);
  },

  stopSimulation: () => {
    if (simulationTimer) { clearInterval(simulationTimer); simulationTimer = null; }
    set({ isSimulationRunning: false });
  },
}));

// Mock driver trips across India & IIT Kharagpur
export const MOCK_DRIVER_PAST_TRIPS = [
  {
    id: 'TRIP-901',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 11029',
    pickup: 'Scholars Avenue (RK Hall)',
    drop: 'Technology Market (Tech Mkt)',
    category: 'MOTO',
    vehicleName: 'Hero Splendor Plus (Bike)',
    plate: 'WB 29 AB 1042',
    fare: 28,
    commission: 3.36,
    netEarning: 24.64,
    distance: '2.4 km',
    duration: '7 mins',
    date: 'Today, 06:45 PM',
    rating: 5,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
  },
  {
    id: 'TRIP-902',
    customerName: 'Sneha Roy',
    customerPhone: '+91 94330 22910',
    pickup: 'Vikramshila Classroom Complex',
    drop: 'Kharagpur Jn Railway Station',
    category: 'MOTO',
    vehicleName: 'Hero Splendor Plus (Bike)',
    plate: 'WB 29 AB 1042',
    fare: 85,
    commission: 10.2,
    netEarning: 74.8,
    distance: '6.8 km',
    duration: '16 mins',
    date: 'Today, 04:15 PM',
    rating: 5,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
  },
  {
    id: 'TRIP-903',
    customerName: 'Prof. S. Mukherjee',
    customerPhone: '+91 98311 44521',
    pickup: 'Main Gate / Hijli Heritage',
    drop: 'Kalidas Auditorium Gymkhana',
    category: 'ECONOMY',
    vehicleName: 'Maruti Swift Dzire (Car)',
    plate: 'WB 29 EF 5821',
    fare: 120,
    commission: 14.4,
    netEarning: 105.6,
    distance: '3.5 km',
    duration: '11 mins',
    date: 'Today, 01:30 PM',
    rating: 5,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
  },
  {
    id: 'TRIP-904',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 97110 88231',
    pickup: 'Terminal 2 Airport (BOM)',
    drop: 'Bandra-Kurla Complex (BKC)',
    category: 'ECONOMY',
    vehicleName: 'Maruti Swift Dzire (Car)',
    plate: 'MH 01 AB 1234',
    fare: 310,
    commission: 37.2,
    netEarning: 272.8,
    distance: '12.8 km',
    duration: '28 mins',
    date: 'Yesterday, 09:20 PM',
    rating: 4.8,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
  },
  {
    id: 'TRIP-905',
    customerName: 'Tanvi Joshi',
    customerPhone: '+91 99002 77124',
    pickup: 'Cyber City Hub Gurugram',
    drop: 'Sector 62 Noida',
    category: 'MOTO',
    vehicleName: 'TVS Apache 160 (Bike)',
    plate: 'DL 01 AB 4092',
    fare: 220,
    commission: 26.4,
    netEarning: 193.6,
    distance: '24.2 km',
    duration: '42 mins',
    date: 'Yesterday, 06:10 PM',
    rating: 5,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
  },
];

// ── Driver App Store ──────────────────────────────────────────────────────────
export const useDriverStore = create((set, get) => ({
  status: 'AVAILABLE', // 'OFFLINE' | 'AVAILABLE' | 'ON_RIDE'
  vehicleType: 'BIKE', // 'BIKE' | 'CAR' | 'AUTO' | 'TOTO'
  operatingScope: 'IIT_KGP', // 'IIT_KGP' | 'PAN_INDIA' | 'CITY'
  pickupRadiusKm: 5, // Driver's maximum pickup proximity radius (3km, 5km, 10km, 15km)
  activeRide: null,
  activeRideStage: 'HEADING_TO_PICKUP', // 'HEADING_TO_PICKUP' | 'ARRIVED' | 'IN_TRANSIT' | 'PAYMENT_PENDING' | 'COMPLETED'
  pendingRequests: [],
  todayEarnings: 1840,
  todayRides: 12,
  onlineMinutes: 280,
  rating: 4.88,
  pastTrips: MOCK_DRIVER_PAST_TRIPS,
  upiId: 'subhash.driver@okaxis',

  setVehicleType: (vehicleType) => set({ vehicleType }),
  setOperatingScope: (operatingScope) => set({ operatingScope }),
  setPickupRadiusKm: (pickupRadiusKm) => set({ pickupRadiusKm }),
  setStatus: (status) => set({ status }),
  goOnline: () => set({ status: 'AVAILABLE' }),
  goOffline: () => set({ status: 'OFFLINE', activeRide: null, pendingRequests: [] }),
  
  addRequest: (req) => {
    // Only add if pickup is within driver's proximity radius or marked closest match
    set((s) => {
      if (s.pendingRequests.some((r) => r.id === req.id)) return s;
      return { pendingRequests: [req, ...s.pendingRequests] };
    });
  },
  clearRequests: () => set({ pendingRequests: [] }),

  acceptRide: (ride) => set({
    activeRide: ride,
    status: 'ON_RIDE',
    activeRideStage: 'HEADING_TO_PICKUP',
    pendingRequests: [],
  }),

  setRideStage: (stage) => set({ activeRideStage: stage }),

  completeRide: (earnings) => set((s) => {
    const gross = earnings || s.activeRide?.estimatedFare || 140;
    const comm = gross * 0.12;
    const net = gross - comm;
    const newTrip = {
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      customerName: s.activeRide?.userName || 'Passenger',
      customerPhone: '+91 98765 99881',
      pickup: s.activeRide?.pickup?.name || 'Pickup Point',
      drop: s.activeRide?.destination?.name || 'Dropoff Point',
      category: s.vehicleType,
      vehicleName: s.vehicleType === 'BIKE' ? 'Hero Splendor Plus (Bike)' : 'Maruti Dzire (Car)',
      plate: 'WB 29 AB 1042',
      fare: gross,
      commission: Math.round(comm * 10) / 10,
      netEarning: Math.round(net * 10) / 10,
      distance: `${s.activeRide?.estimatedDistance || 4.2} km`,
      duration: `${s.activeRide?.estimatedDuration || 12} mins`,
      date: 'Just now',
      rating: 5,
      paymentMethod: 'UPI',
      status: 'COMPLETED',
    };

    return {
      activeRide: null,
      status: 'AVAILABLE',
      activeRideStage: 'COMPLETED',
      todayEarnings: s.todayEarnings + Math.round(net),
      todayRides: s.todayRides + 1,
      pastTrips: [newTrip, ...s.pastTrips],
    };
  }),

  addRequest: (req) => set((s) => ({
    pendingRequests: [req, ...s.pendingRequests.filter(r => r.id !== req.id)],
  })),
  clearRequests: () => set({ pendingRequests: [] }),
}));

// ── Admin Store ───────────────────────────────────────────────────────────────
export const useAdminStore = create((set) => ({
  stats: {
    totalGMV: 1248500, // Total Gross Merchandise Value in INR
    companyCommission: 149820, // 12% company platform revenue in INR
    driverPayouts: 1098680, // 88% driver net earnings
    activeRides: 188,
    onlineDrivers: 1312,
    availableDrivers: 724,
    totalRidesToday: 3487,
    avgETA: 3.8,
    cancellationRate: 3.4,
    surgeZones: 4,
    openIncidents: 2,
    bikeDriversCount: 780,
    carDriversCount: 380,
    autoTotoCount: 152,
  },
  hotspots: [
    { name: 'IIT Kharagpur (Nalanda & Tech Mkt)', city: 'IIT Kharagpur', ridesPerHour: 84, surge: 1.2, status: 'HIGH_DEMAND' },
    { name: 'Kharagpur Jn Railway Station', city: 'Kharagpur', ridesPerHour: 62, surge: 1.3, status: 'HIGH_DEMAND' },
    { name: 'Mumbai BKC & Terminal 2 Airport', city: 'Mumbai', ridesPerHour: 240, surge: 1.4, status: 'HIGH_DEMAND' },
    { name: 'Delhi IGI T3 & Cyber City Gurugram', city: 'Delhi NCR', ridesPerHour: 215, surge: 1.3, status: 'HIGH_DEMAND' },
    { name: 'Bengaluru Koramangala & Indiranagar', city: 'Bengaluru', ridesPerHour: 185, surge: 1.2, status: 'SURGE_ACTIVE' },
    { name: 'Kolkata Salt Lake Sector V & CCU', city: 'Kolkata', ridesPerHour: 120, surge: 1.1, status: 'NORMAL' },
  ],
  notifications: [],

  updateStats: (stats) => set((s) => ({ stats: { ...s.stats, ...stats } })),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50) })),
}));
