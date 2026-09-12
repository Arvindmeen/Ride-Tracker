// Service abstraction layer — returns mock data now, will call real APIs later.
// Replace the mock imports with axios calls when backend is ready.

import { MOCK_DRIVERS, CURRENT_DRIVER } from '@/mock/drivers';
import { MOCK_RIDES, ACTIVE_RIDE } from '@/mock/rides';
import { MOCK_USERS, CURRENT_USER } from '@/mock/users';
import { MOCK_GRID_CELLS, MOCK_PRICING_HISTORY } from '@/mock/pricing';
import { MOCK_ANALYTICS } from '@/mock/analytics';
import { MOCK_INCIDENTS } from '@/mock/incidents';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── User Service ─────────────────────────────────────────────────────────────
export const userService = {
  async getCurrentUser() { await delay(300); return CURRENT_USER; },
  async getUsers() { await delay(500); return MOCK_USERS; },
  async getUserById(id) { await delay(300); return MOCK_USERS.find(u => u.id === id) || null; },
  async updateProfile(id, data) { await delay(400); return { ...CURRENT_USER, ...data }; },
};

// ── Driver Service ────────────────────────────────────────────────────────────
export const driverService = {
  async getDrivers() { await delay(500); return MOCK_DRIVERS; },
  async getDriverById(id) { await delay(300); return MOCK_DRIVERS.find(d => d.id === id) || null; },
  async getCurrentDriver() { await delay(300); return CURRENT_DRIVER; },
  async updateStatus(id, status) { await delay(200); return { ...CURRENT_DRIVER, status }; },
};

// Dynamic user trips storage (purely real dynamic completed rides, NO hardcoded mock rides)
function getStoredUserTrips() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('veloq_user_trips');
  if (!raw) return [];

  try {
    let list = JSON.parse(raw);
    // Purge any legacy hardcoded Mumbai / mock rides from browser cache
    const isMock = (r) => {
      const pName = (r.pickup?.name || r.pickup?.address || '').toLowerCase();
      const dName = (r.destination?.name || r.destination?.address || '').toLowerCase();
      return pName.includes('mumbai') || dName.includes('bkc') || pName.includes('andheri') || 
             dName.includes('santacruz') || pName.includes('worli') || pName.includes('colaba') ||
             pName.includes('powai') || pName.includes('dadar') || pName.includes('ghatkopar');
    };
    list = list.filter((r) => !isMock(r));
    localStorage.setItem('veloq_user_trips', JSON.stringify(list));
    return list;
  } catch (e) {
    return [];
  }
}

function saveStoredUserTrips(trips) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('veloq_user_trips', JSON.stringify(trips));
  }
}

// ── Ride Service ──────────────────────────────────────────────────────────────
export const rideService = {
  async getRides() {
    await delay(150);
    return getStoredUserTrips();
  },

  async getRideById(id) {
    const trips = getStoredUserTrips();
    const local = trips.find((r) => r.id === id);
    if (local) return local;

    // Try fetching dynamic record from backend API
    try {
      const res = await fetch(`/api/v1/rides/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          trips.unshift(data);
          saveStoredUserTrips(trips);
          return data;
        }
      }
    } catch (e) {}

    return id === 'ACTIVE_RIDE' ? trips[0] : null;
  },

  async getUserRides(userId) {
    try {
      const res = await fetch(`/api/v1/rides/user/${userId || 'USR-PASSENGER-01'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rides && data.rides.length > 0) {
          saveStoredUserTrips(data.rides);
          return data.rides;
        }
      }
    } catch (e) {}
    await delay(150);
    return getStoredUserTrips();
  },

  async recordRide(rideData) {
    const trips = getStoredUserTrips();
    const existingIdx = trips.findIndex((r) => r.id === rideData.id);
    if (existingIdx !== -1) {
      trips[existingIdx] = { ...trips[existingIdx], ...rideData };
    } else {
      trips.unshift(rideData);
    }
    saveStoredUserTrips(trips);

    // Sync with backend API
    try {
      await fetch('/api/v1/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rideData),
      });
    } catch (e) {}

    return rideData;
  },

  async updateRide(id, updates) {
    const trips = getStoredUserTrips();
    const idx = trips.findIndex(
      (r) => r.id === id || (id === 'ACTIVE_RIDE' && r.id === trips[0]?.id)
    );
    let updatedTrip = null;
    if (idx !== -1) {
      trips[idx] = { ...trips[idx], ...updates };
      updatedTrip = trips[idx];
      saveStoredUserTrips(trips);
    }

    try {
      const targetId = updatedTrip?.id || id;
      await fetch(`/api/v1/rides/${targetId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, id: targetId }),
      });
    } catch (e) {}

    return updatedTrip || updates;
  },

  async getActiveRide() {
    const trips = getStoredUserTrips();
    return (
      trips.find((r) =>
        ['RIDE_STARTED', 'DRIVER_APPROACHING', 'DRIVER_ASSIGNED'].includes(r.status)
      ) || trips[0]
    );
  },

  async bookRide(payload) {
    const newRide = {
      ...payload,
      id: `RIDE-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'DRIVER_APPROACHING',
    };
    return this.recordRide(newRide);
  },

  async cancelRide(id) {
    return this.updateRide(id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });
  },

  async rateRide(id, rating, comment) {
    return this.updateRide(id, { userRating: rating, userComment: comment });
  },
};

// ── Location / Map Service ────────────────────────────────────────────────────
export const locationService = {
  async searchPlaces(query, coords = null) {
    if (!query || !query.trim()) return [];
    try {
      const url = new URL('/api/v1/locations/search', window.location.origin);
      url.searchParams.set('q', query.trim());
      if (coords?.lat && coords?.lng) {
        url.searchParams.set('lat', coords.lat);
        url.searchParams.set('lng', coords.lng);
      }

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          return data.places;
        }
      }
    } catch (err) {
      // Backend request timed out or unavailable, try client-side Photon
    }

    // Direct client fallback to Photon
    try {
      const photonUrl = new URL('https://photon.komoot.io/api/');
      photonUrl.searchParams.set('q', query.trim());
      photonUrl.searchParams.set('limit', '8');
      if (coords?.lat && coords?.lng) {
        photonUrl.searchParams.set('lat', coords.lat);
        photonUrl.searchParams.set('lon', coords.lng);
      }

      const res = await fetch(photonUrl.toString(), { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.features?.length > 0) {
          return data.features.map((f, i) => {
            const p = f.properties || {};
            const c = f.geometry?.coordinates || [0, 0];
            const name = p.name || p.street || p.city || query;
            const address = [p.street, p.district, p.city, p.state, p.country].filter(Boolean).join(', ') || name;
            return {
              id: p.osm_id ? `osm_${p.osm_id}` : `c_${i}`,
              name,
              address,
              city: p.city || p.district || '',
              state: p.state || '',
              lat: c[1],
              lng: c[0],
            };
          });
        }
      }
    } catch (e) {}

    return [];
  },

  async reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`/api/v1/locations/geocode?lat=${lat}&lng=${lng}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Fallback to OSM Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'User-Agent': 'VeloqApp/1.0' },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.village || 'Current Location';
        const name = road ? `${road}, ${city}` : (data.name || city);
        return {
          name,
          address: data.display_name || name,
          city,
          state: addr.state || '',
          lat,
          lng,
        };
      }
    } catch (e) {}

    return {
      name: `GPS Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
      address: `Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: 'Current Area',
      lat,
      lng,
    };
  },

  async getNearbyPlaces(lat, lng, range = 100) {
    try {
      const res = await fetch(`/api/v1/locations/nearby?lat=${lat}&lng=${lng}&range=${range}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        if (data.places?.length > 0) return data.places;
      }
    } catch (e) {}
    return [];
  },

  async getRoute(pickup, destination) {
    if (!pickup?.lat || !destination?.lat) return null;
    try {
      const res = await fetch(`/api/v1/locations/route?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Arc polyline fallback
    const directDist = Math.sqrt(Math.pow(destination.lat - pickup.lat, 2) + Math.pow(destination.lng - pickup.lng, 2)) * 111;
    const midLat = (pickup.lat + destination.lat) / 2 + (pickup.lng - destination.lng) * 0.08;
    const midLng = (pickup.lng + destination.lng) / 2 - (pickup.lat - destination.lat) * 0.08;
    return {
      coordinates: [
        [pickup.lat, pickup.lng],
        [midLat, midLng],
        [destination.lat, destination.lng],
      ],
      distanceKm: Math.round(directDist * 1.2 * 10) / 10,
      durationMins: Math.max(3, Math.round(directDist * 2.5)),
    };
  },

  async getGridCells() { await delay(400); return MOCK_GRID_CELLS; },
};

// ── Pricing Service ───────────────────────────────────────────────────────────
export const pricingService = {
  async getPricingHistory(cellId) { await delay(400); return MOCK_PRICING_HISTORY; },
  async getGridCells() { await delay(400); return MOCK_GRID_CELLS; },
  async estimateFare(pickup, destination, category) {
    await delay(300);
    const distKm = Math.sqrt(Math.pow(destination.lat - pickup.lat, 2) + Math.pow(destination.lng - pickup.lng, 2)) * 111;
    const cat = { ECONOMY: { base: 40, perKm: 12 }, PREMIUM: { base: 80, perKm: 22 }, XL: { base: 70, perKm: 18 }, MOTO: { base: 20, perKm: 7 }, AUTO: { base: 25, perKm: 9 }, CARPOOL: { base: 30, perKm: 8 } };
    const pricing = cat[category] || cat.ECONOMY;
    const base = pricing.base + distKm * pricing.perKm;
    const tax = base * 0.05;
    const total = Math.round(base + tax);
    return { base: pricing.base, distance: Math.round(distKm * pricing.perKm), time: 0, surge: 0, surgeMultiplier: 1, discount: 0, tax: Math.round(tax), total, currency: 'INR', estimatedRange: [total - 20, total + 30] };
  },
};

// ── Analytics Service ─────────────────────────────────────────────────────────
export const analyticsService = {
  async getSummary() { await delay(600); return MOCK_ANALYTICS; },
  async getOperationalStats() { await delay(300); return MOCK_ANALYTICS.todayStats; },
};

// ── Incident Service ──────────────────────────────────────────────────────────
export const incidentService = {
  async getIncidents() { await delay(400); return MOCK_INCIDENTS; },
  async getIncidentById(id) { await delay(300); return MOCK_INCIDENTS.find(i => i.id === id) || null; },
  async acknowledgeIncident(id) { await delay(300); return { id, status: 'ACKNOWLEDGED', updatedAt: new Date().toISOString() }; },
  async resolveIncident(id) { await delay(300); return { id, status: 'RESOLVED', resolvedAt: new Date().toISOString() }; },
};
