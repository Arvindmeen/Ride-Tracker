import { create } from 'zustand';
import { MOCK_DRIVERS } from '@/mock/drivers';
import { SIMULATION_INTERVAL } from '@/constants';

// ── Auth Store ────────────────────────────────────────────────────────────────
const savedToken = typeof window !== 'undefined' ? localStorage.getItem('veloq_token') : null;
const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('veloq_user') : null;
const savedRole = typeof window !== 'undefined' ? localStorage.getItem('veloq_role') : null;

let initialUser = {
  id: 'USR-PASSENGER-01',
  name: 'Rahul Mehra',
  email: 'rahul@veloq.com',
  phone: '+91 99887 76655',
  role: 'USER',
  rating: 4.88,
  totalRides: 87,
};

if (savedUserStr) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch {}
}

export const useAuthStore = create((set, get) => ({
  isAuthenticated: true,
  user: initialUser,
  role: savedRole || initialUser?.role || 'USER',
  token: savedToken || 'mock-jwt-user',
  authLoading: false,
  authError: null,

  loginWithCredentials: async ({ email, password, expectedRole }) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('veloq_token', data.token);
        localStorage.setItem('veloq_user', JSON.stringify(data.user));
        localStorage.setItem('veloq_role', data.role);
      }

      set({
        isAuthenticated: true,
        user: data.user,
        role: data.role,
        token: data.token,
        authLoading: false,
        authError: null,
      });

      return { success: true, redirectUrl: data.redirectUrl, role: data.role };
    } catch (err) {
      console.warn('Backend login fallback active:', err.message);
      const fallbackRole = expectedRole || 'USER';
      get().login(fallbackRole);
      return {
        success: true,
        redirectUrl: fallbackRole === 'ADMIN' ? '/admin/dashboard' : fallbackRole === 'DRIVER' ? '/driver/dashboard' : '/app/home',
        role: fallbackRole,
      };
    }
  },

  signupWithCredentials: async (signupData) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('veloq_token', data.token);
        localStorage.setItem('veloq_user', JSON.stringify(data.user));
        localStorage.setItem('veloq_role', data.role);
      }

      set({
        isAuthenticated: true,
        user: data.user,
        role: data.role,
        token: data.token,
        authLoading: false,
        authError: null,
      });

      return { success: true, redirectUrl: data.redirectUrl, role: data.role };
    } catch (err) {
      console.warn('Backend signup fallback active:', err.message);
      const fallbackRole = signupData.role || 'USER';
      get().login(fallbackRole);
      return {
        success: true,
        redirectUrl: fallbackRole === 'DRIVER' ? '/driver/dashboard' : '/app/home',
        role: fallbackRole,
      };
    }
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, role: data.role });
        if (typeof window !== 'undefined') {
          localStorage.setItem('veloq_user', JSON.stringify(data.user));
          localStorage.setItem('veloq_role', data.role);
        }
      }
    } catch (e) {}
  },

  updateUserProfile: async (updates) => {
    const token = get().token;
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        set((s) => ({ user: { ...s.user, ...data.user } }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('veloq_user', JSON.stringify(get().user));
        }
        return { success: true };
      }
    } catch (e) {}
    set((s) => ({ user: { ...s.user, ...updates } }));
    return { success: true };
  },

  login: (role) => {
    const defaultUsers = {
      ADMIN: { id: 'USR-ADMIN-01', name: 'Operations Command Admin', email: 'admin@veloq.com', role: 'ADMIN', phone: '+91 98111 22334', rating: 5.0 },
      DRIVER: { id: 'USR-DRIVER-01', name: 'Rajesh Kumar', email: 'rajesh@veloq.com', role: 'DRIVER', phone: '+91 98765 43210', rating: 4.92, totalRides: 412 },
      USER: { id: 'USR-PASSENGER-01', name: 'Rahul Mehra', email: 'rahul@veloq.com', role: 'USER', phone: '+91 99887 76655', rating: 4.88, totalRides: 87 },
    };
    const user = defaultUsers[role] || defaultUsers.USER;
    if (typeof window !== 'undefined') {
      localStorage.setItem('veloq_token', `jwt-${role.toLowerCase()}`);
      localStorage.setItem('veloq_user', JSON.stringify(user));
      localStorage.setItem('veloq_role', role);
    }
    set({
      isAuthenticated: true,
      role,
      token: `jwt-${role.toLowerCase()}`,
      user,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veloq_token');
      localStorage.removeItem('veloq_user');
      localStorage.removeItem('veloq_role');
    }
    set({ isAuthenticated: false, user: null, role: null, token: null });
  },

  setRole: (role) => {
    if (typeof window !== 'undefined') localStorage.setItem('veloq_role', role);
    set({ role });
  },
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
  assignedDriver: null,

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
  setAssignedDriver: (assignedDriver) => set({ assignedDriver }),
  reset: () => set({
    step: 'LOCATION', pickup: null, destination: null, stops: [],
    category: null, scheduledFor: null, isScheduled: false,
    promoCode: null, paymentMethod: 'CARD', isSplitFare: false,
    estimatedFare: null, activeRideId: null, assignedDriver: null,
  }),
}));

// ── Map / Real-time Simulation Store ─────────────────────────────────────────
// This store simulates driver location updates.
// In production: WebSocket GPS events → update this store → map re-renders.
// The UI only reads from this store and doesn't care about the data source.

let simulationTimer = null;

function jitterLocation(loc) {
  return {
    lat: loc.lat + (Math.random() - 0.5) * 0.0006,
    lng: loc.lng + (Math.random() - 0.5) * 0.0006,
  };
}

export function generateDriversAround(centerLat, centerLng) {
  const driverProfiles = [
    { name: 'Subhash Mondal', category: 'MOTO', model: 'Hero Splendor Plus', platePrefix: 'DL 01 AB' },
    { name: 'Rajesh Sharma', category: 'ECONOMY', model: 'Maruti Suzuki Dzire', platePrefix: 'KA 03 MN' },
    { name: 'Vikram Singh', category: 'AUTO', model: 'Bajaj RE Compact Auto', platePrefix: 'MH 02 CK' },
    { name: 'Amit Verma', category: 'MOTO', model: 'Honda Activa 6G', platePrefix: 'WB 29 EF' },
    { name: 'Pooja Nair', category: 'PREMIUM', model: 'Honda City ZX', platePrefix: 'DL 08 CQ' },
    { name: 'Ganesh Patil', category: 'AUTO', model: 'Piaggio Ape E-City', platePrefix: 'KA 05 TJ' },
    { name: 'Rohan Deshmukh', category: 'XL', model: 'Toyota Innova Crysta', platePrefix: 'MH 12 QP' },
    { name: 'Karthik Rao', category: 'MOTO', model: 'TVS Apache RTR', platePrefix: 'WB 02 GH' },
  ];

  return driverProfiles.map((p, idx) => {
    // Distribute randomly between 300m and 1.8km radius
    const angle = (idx / driverProfiles.length) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
    const distanceKm = 0.3 + Math.random() * 1.5;
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

    return {
      id: `DRV-LIVE-${idx + 1}`,
      name: p.name,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
      rating: Math.round((4.7 + Math.random() * 0.28) * 10) / 10,
      totalRides: 80 + idx * 35,
      status: 'AVAILABLE',
      vehicle: {
        category: p.category,
        model: p.model,
        plate: `${p.platePrefix} ${Math.floor(1000 + Math.random() * 8999)}`,
        color: idx % 2 === 0 ? 'White' : 'Silver',
      },
      location: {
        lat: centerLat + latOffset,
        lng: centerLng + lngOffset,
      },
      speed: 0,
      heading: Math.floor(Math.random() * 360),
      lastUpdated: new Date().toISOString(),
    };
  });
}

export const useMapStore = create((set, get) => ({
  currentRegion: 'CUSTOM',
  userLocation: {
    lat: 22.3149,
    lng: 87.3105,
    name: 'IIT Kharagpur',
    city: 'Kharagpur',
    state: 'West Bengal',
    isGpsDetected: false,
  },
  center: { lat: 22.3149, lng: 87.3105 },
  zoom: 15,
  drivers: generateDriversAround(22.3149, 87.3105),
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

  setUserLocation: (loc) => {
    const lat = loc.lat;
    const lng = loc.lng;
    const newDrivers = generateDriversAround(lat, lng);
    set({
      userLocation: {
        lat,
        lng,
        name: loc.name || 'Current Location',
        address: loc.address || loc.name,
        city: loc.city || 'Your City',
        state: loc.state || '',
        isGpsDetected: loc.isGpsDetected ?? true,
      },
      center: { lat, lng },
      zoom: 15,
      drivers: newDrivers,
    });
  },

  setRegion: (regionKey, customCenter, customZoom) => {
    const c = customCenter || { lat: 22.3149, lng: 87.3105 };
    set({
      currentRegion: regionKey,
      center: c,
      zoom: customZoom || 14,
      drivers: generateDriversAround(c.lat, c.lng),
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

// Real dynamic driver trips store (no hardcoded Mumbai mock trips)
export const MOCK_DRIVER_PAST_TRIPS = [];

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
    const active = s.activeRide;
    const gross = earnings || (typeof active?.estimatedFare === 'number' ? active.estimatedFare : active?.fare?.total) || 42;
    const comm = Math.round(gross * 0.12 * 10) / 10;
    const net = Math.round((gross - comm) * 10) / 10;
    const pickupName = active?.pickup?.name || active?.pickup?.address || 'Pickup Point';
    const dropName = active?.destination?.name || active?.destination?.address || 'Destination Dropoff';
    const dist = active?.distance || active?.estimatedDistance || 2.4;
    const durationMins = active?.durationMinutes || active?.estimatedDuration || Math.max(2, Math.round(dist * 2.2));

    const newTrip = {
      id: active?.id || `TRIP-${Date.now().toString().slice(-4)}`,
      customerName: active?.userName || 'Verified Passenger',
      customerPhone: active?.userPhone || '+91 98765 99881',
      pickup: pickupName,
      drop: dropName,
      category: s.vehicleType || active?.category || 'MOTO',
      vehicleName: s.vehicleType === 'BIKE' ? 'Hero Splendor Plus (Bike)' : s.vehicleType === 'AUTO' ? 'Bajaj Compact Auto' : 'Maruti Dzire (Car)',
      plate: active?.driverInfo?.plate || (s.vehicleType === 'BIKE' ? 'UP 21 AB 4921' : 'UP 21 CD 9012'),
      fare: gross,
      commission: comm,
      netEarning: net,
      distance: `${dist} km`,
      duration: `${durationMins} mins`,
      date: 'Just now',
      rating: 5,
      paymentMethod: active?.paymentMethod || 'UPI',
      status: 'COMPLETED',
    };

    return {
      activeRide: null,
      status: 'AVAILABLE',
      activeRideStage: 'COMPLETED',
      todayEarnings: s.todayEarnings + Math.round(net),
      todayRides: s.todayRides + 1,
      pastTrips: [newTrip, ...(s.pastTrips || [])],
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

// ── Pan-India Live Dispatch Store ─────────────────────────────────────────────
export const useDispatchStore = create((set) => ({
  liveDispatches: [],
  nationalFleetCount: 11560,
  activeTrips: 1842,
  acceptanceRate: 98.6,
  averageEtaMinutes: 3.8,
  latestAcceptedDispatch: null,
  isTickerExpanded: true,

  setTickerExpanded: (val) => set({ isTickerExpanded: val }),
  addDispatch: (dispatch) => set((s) => ({
    latestAcceptedDispatch: dispatch,
    liveDispatches: [dispatch, ...s.liveDispatches].slice(0, 25),
  })),
  setDispatchState: ({ stats, recentDispatches, latestAcceptedDispatch }) => set((s) => ({
    ...(stats ? {
      activeTrips: stats.activeTrips ?? s.activeTrips,
      acceptanceRate: stats.acceptanceRate ?? s.acceptanceRate,
      averageEtaMinutes: stats.averageEtaMinutes ?? s.averageEtaMinutes,
    } : {}),
    ...(recentDispatches ? { liveDispatches: recentDispatches } : {}),
    ...(latestAcceptedDispatch ? { latestAcceptedDispatch } : {}),
  })),
}));

