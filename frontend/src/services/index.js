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

// ── Ride Service ──────────────────────────────────────────────────────────────
export const rideService = {
  async getRides() { await delay(500); return MOCK_RIDES; },
  async getRideById(id) { await delay(300); return id === 'ACTIVE_RIDE' ? ACTIVE_RIDE : MOCK_RIDES.find(r => r.id === id) || null; },
  async getUserRides(userId) { await delay(400); return MOCK_RIDES.filter(r => r.userId === userId); },
  async getActiveRide() { await delay(200); return ACTIVE_RIDE; },
  async bookRide(payload) { await delay(800); return { ...ACTIVE_RIDE, ...payload, id: `RIDE_${Date.now()}`, requestedAt: new Date().toISOString(), status: 'SEARCHING' }; },
  async cancelRide(id) { await delay(300); return { id, status: 'CANCELLED', cancelledAt: new Date().toISOString() }; },
  async rateRide(id, rating, comment) { await delay(300); return { id, userRating: rating, userComment: comment }; },
};

// ── Location / Map Service ────────────────────────────────────────────────────
export const locationService = {
  async searchPlaces(query) {
    await delay(200);
    const places = [
      { id: '1', name: 'Andheri Station', address: 'Andheri West, Mumbai', location: { lat: 19.1136, lng: 72.8491 } },
      { id: '2', name: 'Bandra Kurla Complex', address: 'BKC, Bandra East, Mumbai', location: { lat: 19.0610, lng: 72.8656 } },
      { id: '3', name: 'Chhatrapati Shivaji Airport', address: 'Sahar, Andheri East, Mumbai', location: { lat: 19.0896, lng: 72.8656 } },
      { id: '4', name: 'Gateway of India', address: 'Colaba, Mumbai', location: { lat: 18.9220, lng: 72.8347 } },
      { id: '5', name: 'Powai Lake', address: 'Powai, Mumbai', location: { lat: 19.1197, lng: 72.9043 } },
      { id: '6', name: 'Dadar Station', address: 'Dadar, Mumbai', location: { lat: 19.0221, lng: 72.8422 } },
      { id: '7', name: 'Thane Station', address: 'Thane West, Thane', location: { lat: 19.1782, lng: 72.9781 } },
      { id: '8', name: 'Worli Sea Face', address: 'Worli, Mumbai', location: { lat: 19.0105, lng: 72.8139 } },
    ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase()));
    return places;
  },
  async reverseGeocode(lat, lng) {
    await delay(200);
    return { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, name: 'Current Location' };
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
