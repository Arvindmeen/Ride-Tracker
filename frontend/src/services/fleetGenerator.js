/**
 * Pan-India 10,000+ Driver Fleet Generator
 * Generates and spatially indexes 10,000+ active drivers across all regions and major cities of India.
 * Includes lag-free spatial culling for 60 FPS map performance.
 */

export const INDIAN_REGIONS = [
  // ── Mega Metros & State Capitals ──────────────────────────────────────────
  { name: 'Delhi NCR', state: 'Delhi', center: { lat: 28.6139, lng: 77.2090 }, radius: 26, fleetCount: 1400, platePrefix: 'DL' },
  { name: 'Bengaluru', state: 'Karnataka', center: { lat: 12.9716, lng: 77.5946 }, radius: 24, fleetCount: 1300, platePrefix: 'KA' },
  { name: 'Mumbai MMR', state: 'Maharashtra', center: { lat: 19.0760, lng: 72.8777 }, radius: 28, fleetCount: 1300, platePrefix: 'MH' },
  { name: 'Kolkata Metropolitan', state: 'West Bengal', center: { lat: 22.5726, lng: 88.3639 }, radius: 22, fleetCount: 950, platePrefix: 'WB' },
  { name: 'Hyderabad', state: 'Telangana', center: { lat: 17.3850, lng: 78.4867 }, radius: 22, fleetCount: 900, platePrefix: 'TS' },
  { name: 'Chennai', state: 'Tamil Nadu', center: { lat: 13.0827, lng: 80.2707 }, radius: 20, fleetCount: 850, platePrefix: 'TN' },
  { name: 'Pune', state: 'Maharashtra', center: { lat: 18.5204, lng: 73.8567 }, radius: 18, fleetCount: 700, platePrefix: 'MH' },
  { name: 'Ahmedabad', state: 'Gujarat', center: { lat: 23.0225, lng: 72.5714 }, radius: 18, fleetCount: 650, platePrefix: 'GJ' },

  // ── Key Commercial & Tech Hubs ────────────────────────────────────────────
  { name: 'Jaipur', state: 'Rajasthan', center: { lat: 26.9124, lng: 75.7873 }, radius: 16, fleetCount: 380, platePrefix: 'RJ' },
  { name: 'Lucknow', state: 'Uttar Pradesh', center: { lat: 26.8467, lng: 80.9462 }, radius: 16, fleetCount: 360, platePrefix: 'UP' },
  { name: 'Chandigarh Tri-City', state: 'Punjab / Haryana', center: { lat: 30.7333, lng: 76.7794 }, radius: 15, fleetCount: 320, platePrefix: 'CH' },
  { name: 'Surat', state: 'Gujarat', center: { lat: 21.1702, lng: 72.8311 }, radius: 14, fleetCount: 280, platePrefix: 'GJ' },
  { name: 'Indore', state: 'Madhya Pradesh', center: { lat: 22.7196, lng: 75.8577 }, radius: 14, fleetCount: 260, platePrefix: 'MP' },
  { name: 'Kochi', state: 'Kerala', center: { lat: 9.9312, lng: 76.2673 }, radius: 14, fleetCount: 250, platePrefix: 'KL' },
  { name: 'Bhubaneswar', state: 'Odisha', center: { lat: 20.2961, lng: 85.8245 }, radius: 14, fleetCount: 240, platePrefix: 'OD' },
  { name: 'Patna', state: 'Bihar', center: { lat: 25.5941, lng: 85.1376 }, radius: 14, fleetCount: 240, platePrefix: 'BR' },
  { name: 'Coimbatore', state: 'Tamil Nadu', center: { lat: 11.0168, lng: 76.9558 }, radius: 13, fleetCount: 220, platePrefix: 'TN' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', center: { lat: 17.6868, lng: 83.2185 }, radius: 14, fleetCount: 220, platePrefix: 'AP' },
  { name: 'Nagpur', state: 'Maharashtra', center: { lat: 21.1458, lng: 79.0882 }, radius: 14, fleetCount: 200, platePrefix: 'MH' },
  { name: 'Bhopal', state: 'Madhya Pradesh', center: { lat: 23.2599, lng: 77.4126 }, radius: 14, fleetCount: 190, platePrefix: 'MP' },
  { name: 'Guwahati', state: 'Assam', center: { lat: 26.1445, lng: 91.7362 }, radius: 13, fleetCount: 180, platePrefix: 'AS' },
  { name: 'Varanasi', state: 'Uttar Pradesh', center: { lat: 25.3176, lng: 82.9739 }, radius: 12, fleetCount: 160, platePrefix: 'UP' },
  { name: 'Agra', state: 'Uttar Pradesh', center: { lat: 27.1767, lng: 78.0081 }, radius: 12, fleetCount: 150, platePrefix: 'UP' },
  { name: 'Dehradun', state: 'Uttarakhand', center: { lat: 30.3165, lng: 78.0322 }, radius: 12, fleetCount: 150, platePrefix: 'UK' },
  { name: 'Amritsar', state: 'Punjab', center: { lat: 31.6340, lng: 74.8723 }, radius: 12, fleetCount: 140, platePrefix: 'PB' },
  { name: 'Ranchi', state: 'Jharkhand', center: { lat: 23.3441, lng: 85.3096 }, radius: 12, fleetCount: 140, platePrefix: 'JH' },
  { name: 'Thiruvananthapuram', state: 'Kerala', center: { lat: 8.5241, lng: 76.9366 }, radius: 12, fleetCount: 130, platePrefix: 'KL' },
  { name: 'Mysuru', state: 'Karnataka', center: { lat: 12.2958, lng: 76.6394 }, radius: 11, fleetCount: 120, platePrefix: 'KA' },
  { name: 'Vadodara', state: 'Gujarat', center: { lat: 22.3072, lng: 73.1812 }, radius: 12, fleetCount: 120, platePrefix: 'GJ' },
  { name: 'Kharagpur & Campus', state: 'West Bengal', center: { lat: 22.3149, lng: 87.3105 }, radius: 8, fleetCount: 110, platePrefix: 'WB' },
];

const FIRST_NAMES = [
  'Subhash', 'Rajesh', 'Vikram', 'Amit', 'Pooja', 'Ganesh', 'Rohan', 'Karthik',
  'Suresh', 'Manish', 'Deepak', 'Arjun', 'Sunil', 'Vijay', 'Rahul', 'Sachin',
  'Pradeep', 'Anil', 'Dinesh', 'Manoj', 'Praveen', 'Sanjay', 'Santosh', 'Mahesh',
  'Ajay', 'Vinod', 'Ramesh', 'Harish', 'Ashok', 'Jitendra', 'Naresh', 'Ravindra',
  'Priya', 'Kavita', 'Neha', 'Sunita', 'Anjali', 'Rekha', 'Meena', 'Pooja',
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Verma', 'Mondal', 'Patel', 'Rao', 'Reddy',
  'Gowda', 'Nair', 'More', 'Patil', 'Gupta', 'Yadav', 'Joshi', 'Mishra',
  'Banerjee', 'Mukherjee', 'Ghosh', 'Chatterjee', 'Das', 'Sen', 'Dutta',
  'Chauhan', 'Thakur', 'Bhat', 'Hegde', 'Pillai', 'Menon', 'Shetty',
];

const VEHICLE_TEMPLATES = [
  { category: 'MOTO', models: ['Hero Splendor Plus', 'Honda Activa 6G', 'TVS Apache 160', 'Ather 450X EV', 'Ola S1 Pro Gen 2', 'Bajaj Pulsar 150'], weight: 40 },
  { category: 'AUTO', models: ['Bajaj RE Compact Auto', 'Piaggio Ape E-City', 'Mahindra Treo Electric', 'Mayuri Deluxe E-Rickshaw'], weight: 25 },
  { category: 'ECONOMY', models: ['Maruti Suzuki Dzire', 'Maruti WagonR CNG', 'Tata Tiago EV', 'Hyundai Aura'], weight: 24 },
  { category: 'PREMIUM', models: ['Honda City ZX', 'Hyundai Creta SX', 'Tata Nexon EV Prime', 'Maruti Ciaz Alpha'], weight: 8 },
  { category: 'XL', models: ['Toyota Innova Crysta', 'Maruti Ertiga Hybrid', 'Mahindra Scorpio-N'], weight: 3 },
];

// Weighted random vehicle selector
function getRandomVehicle() {
  const roll = Math.random() * 100;
  let sum = 0;
  for (const t of VEHICLE_TEMPLATES) {
    sum += t.weight;
    if (roll <= sum) {
      const model = t.models[Math.floor(Math.random() * t.models.length)];
      return { category: t.category, model };
    }
  }
  return { category: 'ECONOMY', model: 'Maruti Suzuki Dzire' };
}

/**
 * Generates the nationwide fleet of 10,000+ drivers distributed across India
 */
export function generatePanIndiaFleet() {
  const drivers = [];
  let idCounter = 1;

  for (const region of INDIAN_REGIONS) {
    const count = region.fleetCount;
    for (let i = 0; i < count; i++) {
      // Gaussian-biased distance from city center for realistic urban density
      const u = Math.random() + Math.random();
      const distFactor = u > 1 ? 2 - u : u;
      const distanceKm = distFactor * region.radius;
      const angle = Math.random() * 2 * Math.PI;

      const latOffset = (distanceKm / 111) * Math.cos(angle);
      const lngOffset = (distanceKm / (111 * Math.cos((region.center.lat * Math.PI) / 180))) * Math.sin(angle);

      const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const veh = getRandomVehicle();
      const statusRoll = Math.random();
      const status = statusRoll > 0.35 ? 'AVAILABLE' : statusRoll > 0.12 ? 'ON_RIDE' : 'OFFLINE';

      const rNum = Math.floor(10 + Math.random() * 89);
      const rCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const plateDigits = Math.floor(1000 + Math.random() * 8999);
      const plate = `${region.platePrefix} ${rNum} ${rCode} ${plateDigits}`;

      drivers.push({
        id: `DRV-IN-${idCounter}`,
        name: `${fName} ${lName}`,
        phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
        rating: Math.round((4.65 + Math.random() * 0.33) * 10) / 10,
        totalRides: 120 + Math.floor(Math.random() * 4200),
        status,
        regionName: region.name,
        state: region.state,
        vehicle: {
          category: veh.category,
          model: veh.model,
          plate,
          color: ['White', 'Silver', 'Black', 'Grey', 'Blue', 'Yellow'][Math.floor(Math.random() * 6)],
        },
        location: {
          lat: Math.round((region.center.lat + latOffset) * 10000) / 10000,
          lng: Math.round((region.center.lng + lngOffset) * 10000) / 10000,
        },
        speed: status === 'ON_RIDE' ? Math.round(20 + Math.random() * 32) : 0,
        heading: Math.floor(Math.random() * 360),
        lastUpdated: new Date().toISOString(),
      });

      idCounter++;
    }
  }

  return drivers;
}

// Singleton in-memory fleet of 10,000+ drivers
let CACHED_ALL_INDIA_FLEET = null;

export function getAllIndiaFleet() {
  if (!CACHED_ALL_INDIA_FLEET) {
    CACHED_ALL_INDIA_FLEET = generatePanIndiaFleet();
  }
  return CACHED_ALL_INDIA_FLEET;
}

/**
 * Viewport Culling Helper:
 * Extracts drivers falling strictly inside visible Leaflet bounds [southWest, northEast],
 * capped at maxLimit (e.g. 100) to ensure zero browser lag at 60 FPS.
 */
export function getVisibleDriversInBounds(bounds, maxLimit = 100) {
  const all = getAllIndiaFleet();
  if (!bounds || bounds.length < 2) return all.slice(0, maxLimit);

  const south = Math.min(bounds[0][0], bounds[1][0]);
  const north = Math.max(bounds[0][0], bounds[1][0]);
  const west = Math.min(bounds[0][1], bounds[1][1]);
  const east = Math.max(bounds[0][1], bounds[1][1]);

  // 15% padding so vehicles smoothly glide in as the user pans
  const padLat = (north - south) * 0.15;
  const padLng = (east - west) * 0.15;

  const minLat = south - padLat;
  const maxLat = north + padLat;
  const minLng = west - padLng;
  const maxLng = east + padLng;

  const matches = [];
  for (let i = 0; i < all.length; i++) {
    const d = all[i];
    if (d.status !== 'OFFLINE') {
      const lat = d.location.lat;
      const lng = d.location.lng;
      if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
        matches.push(d);
        if (matches.length >= maxLimit) break;
      }
    }
  }

  return matches;
}

/**
 * Proximity helper: returns drivers within radiusKm of given lat/lng
 */
export function getDriversNearLocation(lat, lng, radiusKm = 15, maxLimit = 80) {
  const all = getAllIndiaFleet();
  const radiusDeg = radiusKm / 111;
  const minLat = lat - radiusDeg;
  const maxLat = lat + radiusDeg;
  const minLng = lng - radiusDeg / Math.cos((lat * Math.PI) / 180);
  const maxLng = lng + radiusDeg / Math.cos((lat * Math.PI) / 180);

  const matches = [];
  for (let i = 0; i < all.length; i++) {
    const d = all[i];
    if (d.status !== 'OFFLINE') {
      if (d.location.lat >= minLat && d.location.lat <= maxLat &&
          d.location.lng >= minLng && d.location.lng <= maxLng) {
        matches.push(d);
        if (matches.length >= maxLimit) break;
      }
    }
  }

  return matches;
}
