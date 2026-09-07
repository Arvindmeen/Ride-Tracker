// Mock drivers - Pan-India & IIT Kharagpur Campus
export const MOCK_DRIVERS = [
  // ── IIT Kharagpur Campus & Railway Station Drivers ─────────────────────────────
  {
    id: 'D_KGP_001', name: 'Subhash Mondal', phone: '+91 94340 12891',
    city: 'IIT_KGP', region: 'IIT Kharagpur',
    status: 'AVAILABLE', rating: 4.92, totalRides: 4120,
    acceptanceRate: 97, cancellationRate: 1.2,
    vehicle: { make: 'Mayuri', model: 'Campus E-Rickshaw (Toto)', year: 2023, color: 'Green', plate: 'WB 29 AB 1042', category: 'TOTO', seats: 4 },
    location: { lat: 22.3190, lng: 87.3040 }, // Technology Market
    speed: 0, heading: 90, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_KGP_01', onlineSince: new Date(Date.now() - 14400000).toISOString(),
    todayEarnings: 820, todayRides: 18, todayOnlineMin: 320,
    performanceScore: 96, safetyScore: 98, punctualityScore: 95,
    documents: [
      { type: 'CAMPUS_PERMIT', status: 'VERIFIED', expiresAt: '2026-12-31' },
      { type: 'LICENSE', status: 'VERIFIED', expiresAt: '2028-06-01' },
      { type: 'INSURANCE', status: 'VERIFIED', expiresAt: '2026-03-15' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
  {
    id: 'D_KGP_002', name: 'Bikas Ghosh', phone: '+91 98321 44589',
    city: 'IIT_KGP', region: 'IIT Kharagpur',
    status: 'ON_RIDE', rating: 4.85, totalRides: 2890,
    acceptanceRate: 91, cancellationRate: 2.8,
    vehicle: { make: 'Bajaj', model: 'Campus Auto Rickshaw', year: 2022, color: 'Yellow-Black', plate: 'WB 29 CD 3918', category: 'AUTO', seats: 3 },
    location: { lat: 22.3175, lng: 87.3090 }, // Vikramshila / Nalanda
    speed: 24, heading: 180, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_KGP_02', onlineSince: new Date(Date.now() - 18000000).toISOString(),
    todayEarnings: 1150, todayRides: 14, todayOnlineMin: 360,
    performanceScore: 92, safetyScore: 94, punctualityScore: 90,
    documents: [
      { type: 'CAMPUS_PERMIT', status: 'VERIFIED', expiresAt: '2026-12-31' },
      { type: 'LICENSE', status: 'VERIFIED', expiresAt: '2027-04-10' },
      { type: 'INSURANCE', status: 'VERIFIED', expiresAt: '2025-11-20' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
  {
    id: 'D_KGP_003', name: 'Anup Das', phone: '+91 97335 88120',
    city: 'IIT_KGP', region: 'IIT Kharagpur',
    status: 'AVAILABLE', rating: 4.88, totalRides: 3410,
    acceptanceRate: 94, cancellationRate: 2.1,
    vehicle: { make: 'Maruti', model: 'Swift Dzire Tour', year: 2022, color: 'White', plate: 'WB 29 EF 5821', category: 'ECONOMY', seats: 4 },
    location: { lat: 22.3396, lng: 87.3225 }, // Kharagpur Railway Station
    speed: 0, heading: 45, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_KGP_03', onlineSince: new Date(Date.now() - 21600000).toISOString(),
    todayEarnings: 2400, todayRides: 7, todayOnlineMin: 420,
    performanceScore: 94, safetyScore: 96, punctualityScore: 93,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED', expiresAt: '2028-09-20' },
      { type: 'INSURANCE', status: 'VERIFIED', expiresAt: '2026-08-15' },
      { type: 'REGISTRATION', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
  {
    id: 'D_KGP_004', name: 'Tapan Roy', phone: '+91 96472 31908',
    city: 'IIT_KGP', region: 'IIT Kharagpur',
    status: 'AVAILABLE', rating: 4.94, totalRides: 5120,
    acceptanceRate: 98, cancellationRate: 0.9,
    vehicle: { make: 'Yatri', model: 'Campus Electric Toto', year: 2024, color: 'Blue', plate: 'WB 29 GH 7190', category: 'TOTO', seats: 4 },
    location: { lat: 22.3150, lng: 87.3050 }, // Scholars Avenue / RK Hall
    speed: 0, heading: 270, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_KGP_04', onlineSince: new Date(Date.now() - 7200000).toISOString(),
    todayEarnings: 940, todayRides: 21, todayOnlineMin: 220,
    performanceScore: 98, safetyScore: 99, punctualityScore: 97,
    documents: [
      { type: 'CAMPUS_PERMIT', status: 'VERIFIED', expiresAt: '2027-01-01' },
      { type: 'LICENSE', status: 'VERIFIED' },
      { type: 'INSURANCE', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },

  // ── Mumbai Metropolitan Region Drivers ─────────────────────────────────────────
  {
    id: 'D_MUM_001', name: 'Rajesh Kumar', phone: '+91 98765 43210',
    city: 'MUMBAI', region: 'Mumbai',
    status: 'AVAILABLE', rating: 4.82, totalRides: 3842,
    acceptanceRate: 92, cancellationRate: 3.2,
    vehicle: { make: 'Maruti', model: 'Swift Dzire', year: 2022, color: 'White', plate: 'MH 01 AB 1234', category: 'ECONOMY', seats: 4 },
    location: { lat: 19.0760, lng: 72.8777 },
    speed: 0, heading: 45, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_MUM_01', onlineSince: new Date(Date.now() - 7200000).toISOString(),
    todayEarnings: 1840, todayRides: 12, todayOnlineMin: 240,
    performanceScore: 91, safetyScore: 94, punctualityScore: 88,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED', expiresAt: '2027-06-01' },
      { type: 'INSURANCE', status: 'VERIFIED', expiresAt: '2025-12-01' },
      { type: 'REGISTRATION', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
  {
    id: 'D_MUM_002', name: 'Amit Sharma', phone: '+91 87654 32109',
    city: 'MUMBAI', region: 'Mumbai',
    status: 'ON_RIDE', rating: 4.65, totalRides: 2156,
    acceptanceRate: 87, cancellationRate: 5.1,
    vehicle: { make: 'Honda', model: 'City', year: 2021, color: 'Silver', plate: 'MH 02 CD 5678', category: 'PREMIUM', seats: 4 },
    location: { lat: 19.0176, lng: 72.8562 },
    speed: 32, heading: 120, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_MUM_02', onlineSince: new Date(Date.now() - 14400000).toISOString(),
    todayEarnings: 3200, todayRides: 18, todayOnlineMin: 360,
    performanceScore: 83, safetyScore: 87, punctualityScore: 80,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED', expiresAt: '2026-09-15' },
      { type: 'INSURANCE', status: 'VERIFIED', expiresAt: '2025-11-01' },
      { type: 'REGISTRATION', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },

  // ── Delhi NCR Drivers ─────────────────────────────────────────────────────────
  {
    id: 'D_DEL_001', name: 'Manjeet Singh', phone: '+91 98110 55421',
    city: 'DELHI', region: 'Delhi NCR',
    status: 'AVAILABLE', rating: 4.89, totalRides: 4620,
    acceptanceRate: 95, cancellationRate: 2.1,
    vehicle: { make: 'Maruti', model: 'Ertiga CNG', year: 2023, color: 'Silver', plate: 'DL 01 AB 4092', category: 'XL', seats: 6 },
    location: { lat: 28.5562, lng: 77.1000 }, // IGI T3 Airport
    speed: 0, heading: 180, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_DEL_01', onlineSince: new Date(Date.now() - 10800000).toISOString(),
    todayEarnings: 2900, todayRides: 11, todayOnlineMin: 310,
    performanceScore: 95, safetyScore: 97, punctualityScore: 94,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED' },
      { type: 'INSURANCE', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
  {
    id: 'D_DEL_002', name: 'Deepak Verma', phone: '+91 98991 23410',
    city: 'DELHI', region: 'Delhi NCR',
    status: 'ON_RIDE', rating: 4.76, totalRides: 1980,
    acceptanceRate: 88, cancellationRate: 4.2,
    vehicle: { make: 'Tata', model: 'Tigor EV', year: 2023, color: 'Teal Blue', plate: 'DL 02 EV 8812', category: 'EV', seats: 4 },
    location: { lat: 28.4950, lng: 77.0890 }, // Cyber City Gurugram
    speed: 38, heading: 45, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_DEL_02', onlineSince: new Date(Date.now() - 16200000).toISOString(),
    todayEarnings: 2100, todayRides: 13, todayOnlineMin: 290,
    performanceScore: 89, safetyScore: 92, punctualityScore: 87,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED' },
      { type: 'INSURANCE', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },

  // ── Bengaluru Tech Corridor Drivers ───────────────────────────────────────────
  {
    id: 'D_BLR_001', name: 'Suresh Gowda', phone: '+91 99001 88412',
    city: 'BENGALURU', region: 'Bengaluru',
    status: 'AVAILABLE', rating: 4.91, totalRides: 3820,
    acceptanceRate: 96, cancellationRate: 1.5,
    vehicle: { make: 'Tata', model: 'Nexon EV Max', year: 2023, color: 'White', plate: 'KA 03 MN 8820', category: 'EV', seats: 4 },
    location: { lat: 12.9784, lng: 77.6408 }, // Indiranagar
    speed: 0, heading: 90, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_BLR_01', onlineSince: new Date(Date.now() - 9000000).toISOString(),
    todayEarnings: 2450, todayRides: 10, todayOnlineMin: 270,
    performanceScore: 97, safetyScore: 98, punctualityScore: 96,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED' },
      { type: 'INSURANCE', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },

  // ── Kolkata City Drivers ──────────────────────────────────────────────────────
  {
    id: 'D_CCU_001', name: 'Subrata Banerjee', phone: '+91 98300 77123',
    city: 'KOLKATA', region: 'Kolkata',
    status: 'AVAILABLE', rating: 4.86, totalRides: 3100,
    acceptanceRate: 93, cancellationRate: 2.4,
    vehicle: { make: 'Hyundai', model: 'Aura', year: 2022, color: 'Silver', plate: 'WB 02 XY 5521', category: 'ECONOMY', seats: 4 },
    location: { lat: 22.5800, lng: 88.4350 }, // Salt Lake Sector V
    speed: 0, heading: 135, lastUpdated: new Date().toISOString(),
    gridCellId: 'GRID_CCU_01', onlineSince: new Date(Date.now() - 12000000).toISOString(),
    todayEarnings: 1890, todayRides: 9, todayOnlineMin: 250,
    performanceScore: 93, safetyScore: 95, punctualityScore: 91,
    documents: [
      { type: 'LICENSE', status: 'VERIFIED' },
      { type: 'INSURANCE', status: 'VERIFIED' },
      { type: 'BACKGROUND_CHECK', status: 'VERIFIED' },
    ],
  },
];

export const CURRENT_DRIVER = MOCK_DRIVERS[0];
