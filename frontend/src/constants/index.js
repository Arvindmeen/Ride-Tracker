export const APP_NAME = 'Veloq';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  APP_HOME: '/app/home',
  APP_BOOK: '/app/book',
  APP_RIDE: '/app/ride/:id',
  APP_TRIPS: '/app/trips',
  APP_TRIP_DETAIL: '/app/trips/:id',
  APP_PROFILE: '/app/profile',
  APP_SETTINGS: '/app/settings',
  DRIVER_DASHBOARD: '/driver/dashboard',
  DRIVER_REQUESTS: '/driver/requests',
  DRIVER_RIDE: '/driver/ride/:id',
  DRIVER_EARNINGS: '/driver/earnings',
  DRIVER_PROFILE: '/driver/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LIVE_MAP: '/admin/live-map',
  ADMIN_RIDES: '/admin/rides',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRICING: '/admin/pricing',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_INCIDENTS: '/admin/incidents',
  ADMIN_SETTINGS: '/admin/settings',
};

export const REGIONS = {
  IIT_KGP: {
    id: 'IIT_KGP',
    name: 'IIT Kharagpur (Campus & Stn)',
    fullName: 'Indian Institute of Technology Kharagpur',
    state: 'West Bengal',
    center: { lat: 22.3149, lng: 87.3105 },
    zoom: 15,
    activeDrivers: 48,
    tag: 'Campus & Station',
    landmarks: [
      { name: 'Technology Market (Tech Mkt)', lat: 22.3190, lng: 87.3040, type: 'commercial' },
      { name: 'Vikramshila Complex / Nalanda', lat: 22.3175, lng: 87.3090, type: 'academic' },
      { name: 'Main Gate / Hijli Heritage', lat: 22.3195, lng: 87.3110, type: 'gate' },
      { name: 'Scholars Avenue (RK / Azad / Patel)', lat: 22.3150, lng: 87.3050, type: 'residence' },
      { name: 'Kalidas Auditorium / Gymkhana', lat: 22.3200, lng: 87.3080, type: 'auditorium' },
      { name: 'Kharagpur Jn Railway Station', lat: 22.3396, lng: 87.3225, type: 'station' },
      { name: 'STEP Gopali / Puri Gate', lat: 22.3240, lng: 87.3170, type: 'gate' },
    ],
    popularRoutes: [
      { pickup: 'Scholars Avenue (Halls)', drop: 'Technology Market (Tech Mkt)', fare: 25, time: '6 mins', type: 'Campus Toto' },
      { pickup: 'Vikramshila Classroom Complex', drop: 'Kharagpur Railway Station', fare: 140, time: '16 mins', type: 'Campus Cab' },
      { pickup: 'Main Gate (Hijli)', drop: 'Kolkata Airport (Outstation)', fare: 2800, time: '135 mins', type: 'Intercity EV' },
    ],
  },
  MUMBAI: {
    id: 'MUMBAI',
    name: 'Mumbai Metropolitan',
    fullName: 'Mumbai Metropolitan Region',
    state: 'Maharashtra',
    center: { lat: 19.0760, lng: 72.8777 },
    zoom: 13,
    activeDrivers: 1312,
    tag: 'Metro Capital',
    landmarks: [
      { name: 'Terminal 2 Airport (BOM)', lat: 19.0896, lng: 72.8656, type: 'airport' },
      { name: 'Bandra-Kurla Complex (BKC)', lat: 19.0607, lng: 72.8688, type: 'commercial' },
      { name: 'CSMT Heritage Railway Terminus', lat: 18.9401, lng: 72.8355, type: 'station' },
      { name: 'Lower Parel Business District', lat: 18.9950, lng: 72.8250, type: 'commercial' },
    ],
    popularRoutes: [
      { pickup: 'Terminal 2 Airport', drop: 'Bandra-Kurla Complex (BKC)', fare: 280, time: '22 mins', type: 'Premier Sedan' },
      { pickup: 'CSMT Railway Station', drop: 'Lower Parel High Street', fare: 160, time: '18 mins', type: 'RideMini' },
    ],
  },
  DELHI: {
    id: 'DELHI',
    name: 'Delhi - NCR',
    fullName: 'National Capital Region',
    state: 'Delhi NCR',
    center: { lat: 28.6139, lng: 77.2090 },
    zoom: 13,
    activeDrivers: 1840,
    tag: 'Capital',
    landmarks: [
      { name: 'Indira Gandhi Int Airport (IGI T3)', lat: 28.5562, lng: 77.1000, type: 'airport' },
      { name: 'Cyber City Hub Gurugram', lat: 28.4950, lng: 77.0890, type: 'commercial' },
      { name: 'Connaught Place Central Hub', lat: 28.6315, lng: 77.2167, type: 'hub' },
      { name: 'Sector 62 Tech Park Noida', lat: 28.6270, lng: 77.3650, type: 'commercial' },
    ],
    popularRoutes: [
      { pickup: 'IGI T3 Airport', drop: 'Cyber City Gurugram', fare: 380, time: '28 mins', type: 'Electric EV' },
      { pickup: 'Connaught Place', drop: 'Sector 62 Noida', fare: 240, time: '35 mins', type: 'RideMini' },
    ],
  },
  BENGALURU: {
    id: 'BENGALURU',
    name: 'Bengaluru Tech Corridor',
    fullName: 'Bengaluru Urban & Tech Hub',
    state: 'Karnataka',
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 13,
    activeDrivers: 1650,
    tag: 'Silicon Valley',
    landmarks: [
      { name: 'Kempegowda Int Airport (BLR)', lat: 13.1986, lng: 77.7066, type: 'airport' },
      { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408, type: 'hub' },
      { name: 'Electronic City Phase 1', lat: 12.8399, lng: 77.6770, type: 'commercial' },
      { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245, type: 'hub' },
    ],
    popularRoutes: [
      { pickup: 'Indiranagar 100ft Rd', drop: 'Electronic City Tollway', fare: 320, time: '38 mins', type: 'EV Prime' },
      { pickup: 'Koramangala 5th Block', drop: 'Kempegowda Airport (BLR)', fare: 850, time: '55 mins', type: 'Sedan' },
    ],
  },
  KOLKATA: {
    id: 'KOLKATA',
    name: 'Kolkata Metropolitan',
    fullName: 'Kolkata & Salt Lake Sector V',
    state: 'West Bengal',
    center: { lat: 22.5726, lng: 88.3639 },
    zoom: 13,
    activeDrivers: 980,
    tag: 'City of Joy',
    landmarks: [
      { name: 'Kolkata Airport (CCU NSCBI)', lat: 22.6547, lng: 88.4467, type: 'airport' },
      { name: 'Salt Lake Sector V IT Hub', lat: 22.5800, lng: 88.4350, type: 'commercial' },
      { name: 'Howrah Junction Station', lat: 22.5855, lng: 88.3433, type: 'station' },
      { name: 'Park Street Central', lat: 22.5510, lng: 88.3520, type: 'hub' },
    ],
    popularRoutes: [
      { pickup: 'Howrah Station', drop: 'Salt Lake Sector V', fare: 210, time: '28 mins', type: 'RideYellow/Auto' },
      { pickup: 'Park Street', drop: 'Kolkata Airport CCU', fare: 340, time: '40 mins', type: 'RidePremier' },
    ],
  },
};

export const DEFAULT_CENTER = REGIONS.IIT_KGP.center;
export const DEFAULT_ZOOM = 15;

export const VEHICLE_CATEGORIES = [
  { id: 'ECONOMY', label: 'Economy', desc: 'Affordable everyday rides', seats: 4, basePrice: 40, pricePerKm: 12, pricePerMin: 1.5, eta: 3 },
  { id: 'PREMIUM', label: 'Premium', desc: 'Luxury sedans & SUVs', seats: 4, basePrice: 80, pricePerKm: 22, pricePerMin: 3, eta: 5 },
  { id: 'XL', label: 'XL', desc: 'More space for groups', seats: 6, basePrice: 70, pricePerKm: 18, pricePerMin: 2.5, eta: 7 },
  { id: 'MOTO', label: 'Moto', desc: 'Fast 2-wheeler rides', seats: 1, basePrice: 20, pricePerKm: 7, pricePerMin: 0.8, eta: 2 },
  { id: 'AUTO', label: 'Auto', desc: 'Auto-rickshaw rides', seats: 3, basePrice: 25, pricePerKm: 9, pricePerMin: 1, eta: 3 },
  { id: 'CARPOOL', label: 'Carpool', desc: 'Share & save more', seats: 2, basePrice: 30, pricePerKm: 8, pricePerMin: 1, eta: 6 },
];

export const RIDE_STATUSES = {
  SEARCHING: 'SEARCHING',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_APPROACHING: 'DRIVER_APPROACHING',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  RIDE_STARTED: 'RIDE_STARTED',
  RIDE_COMPLETED: 'RIDE_COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const DRIVER_STATUSES = {
  OFFLINE: 'OFFLINE',
  ONLINE: 'ONLINE',
  AVAILABLE: 'AVAILABLE',
  ON_RIDE: 'ON_RIDE',
  ARRIVING: 'ARRIVING',
};

export const INCIDENT_SEVERITY = { CRITICAL: 'CRITICAL', WARNING: 'WARNING', INFO: 'INFO' };

export const SIMULATION_INTERVAL = 3000;
