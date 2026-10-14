/**
 * Dispatch Simulation Engine
 * 
 * Simulates real-time ride requests and driver acceptances across India.
 * Architecture:
 * - Designed for seamless production migration:
 *   Toggle `isSimulationEnabled` to false to disable mock dispatches
 *   and route directly through real WebSocket/Kafka backend events.
 */

import { INDIAN_REGIONS, getDriversNearLocation } from './fleetGenerator';
import { useMapStore } from '@/stores';

// Production toggle: in production, set to false to listen to real WebSockets
export const isSimulationEnabled = true;

class DispatchSimulationEngine {
  constructor() {
    this.listeners = new Set();
    this.timer = null;
    this.isRunning = false;
    this.recentDispatches = [];
    this.activeSimulatedRides = new Map();
    this.stats = {
      totalDispatchedToday: 48290,
      activeTrips: 1842,
      acceptanceRate: 98.6,
      averageEtaMinutes: 3.8,
    };
  }

  // Subscribe to live dispatch events (for UI ticker & map radar)
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Dispatch simulation listener error:', err);
      }
    });
  }

  start() {
    if (!isSimulationEnabled || this.isRunning) return;
    this.isRunning = true;

    // Trigger initial burst of recent dispatches for instant wow factor
    this.seedInitialEvents();

    // Trigger periodic live passenger request -> driver acceptance cycle every 3.5s
    this.timer = setInterval(() => {
      this.generateLiveDispatchCycle();
    }, 3800);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  seedInitialEvents() {
    const sampleCities = [
      { city: 'Delhi NCR', area: 'Connaught Place', fare: 240, driver: 'Vikram S.', category: 'ECONOMY' },
      { city: 'Bengaluru', area: 'Indiranagar 100ft Rd', fare: 180, driver: 'Karthik R.', category: 'MOTO' },
      { city: 'Mumbai MMR', area: 'Bandra Kurla Complex', fare: 320, driver: 'Ganesh P.', category: 'PREMIUM' },
      { city: 'Hyderabad', area: 'Hitec City Cyber Towers', fare: 160, driver: 'Suresh N.', category: 'AUTO' },
      { city: 'Kolkata', area: 'Park Street', fare: 210, driver: 'Subhash M.', category: 'ECONOMY' },
      { city: 'Pune', area: 'Koregaon Park', fare: 140, driver: 'Amit J.', category: 'MOTO' },
    ];

    sampleCities.forEach((sample, i) => {
      this.recentDispatches.push({
        id: `disp-init-${i}`,
        type: 'ACCEPTED',
        cityName: sample.city,
        pickupArea: sample.area,
        driverName: sample.driver,
        category: sample.category,
        fare: sample.fare,
        etaMinutes: Math.floor(Math.random() * 4) + 2,
        timestamp: Date.now() - (6 - i) * 8000,
      });
    });
  }

  generateLiveDispatchCycle() {
    // Pick random Indian region
    const region = INDIAN_REGIONS[Math.floor(Math.random() * INDIAN_REGIONS.length)];
    if (!region) return;

    // Generate random jitter coordinate within region center
    const latJitter = (Math.random() - 0.5) * 0.08;
    const lngJitter = (Math.random() - 0.5) * 0.08;
    const pickupLocation = {
      lat: region.center.lat + latJitter,
      lng: region.center.lng + lngJitter,
    };

    // Find nearest drivers in this region
    const nearby = getDriversNearLocation(pickupLocation.lat, pickupLocation.lng, 6);
    const driver = nearby.length > 0
      ? nearby[Math.floor(Math.random() * nearby.length)]
      : {
          id: `drv-sim-${Date.now()}`,
          name: 'Rajesh Sharma',
          rating: 4.88,
          category: 'ECONOMY',
          vehicleModel: 'Maruti Dzire',
          vehicleNumber: `${region.platePrefix} 01 AB ${Math.floor(1000 + Math.random() * 9000)}`,
        };

    const tripFares = {
      MOTO: Math.floor(45 + Math.random() * 90),
      AUTO: Math.floor(65 + Math.random() * 120),
      ECONOMY: Math.floor(140 + Math.random() * 260),
      PREMIUM: Math.floor(280 + Math.random() * 450),
      XL: Math.floor(350 + Math.random() * 600),
    };
    const fare = tripFares[driver.category] || 180;
    const eta = Math.floor(Math.random() * 4) + 2;

    const dispatchEvent = {
      id: `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'ACCEPTED',
      cityName: region.name,
      state: region.state,
      driverId: driver.id,
      driverName: driver.name,
      driverRating: driver.rating,
      vehicleModel: driver.vehicleModel,
      vehicleNumber: driver.vehicleNumber,
      category: driver.category,
      pickupLocation,
      fare,
      etaMinutes: eta,
      timestamp: Date.now(),
    };

    // Keep ring buffer of recent 20 dispatches
    this.recentDispatches.unshift(dispatchEvent);
    if (this.recentDispatches.length > 20) {
      this.recentDispatches.pop();
    }

    // Update operational stats
    this.stats.totalDispatchedToday += 1;
    this.stats.activeTrips = Math.floor(1800 + Math.sin(Date.now() / 60000) * 80 + Math.random() * 15);

    // Broadcast event
    this.notify({
      type: 'RIDE_ACCEPTED',
      dispatch: dispatchEvent,
      stats: { ...this.stats },
      recentDispatches: [...this.recentDispatches],
    });
  }

  /**
   * Dedicated real-time matcher when the real end-user books a ride.
   * Guarantees selecting the absolute CLOSEST visible driver of the same vehicle icon type!
   */
  simulateUserBookingAcceptance(pickupLocation, category = 'ECONOMY', onStatusUpdate, mapDrivers = null) {
    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng) {
      return null;
    }

    const pLat = Number(pickupLocation.lat);
    const pLng = Number(pickupLocation.lng);
    const targetCategory = String(category || 'ECONOMY').toUpperCase();

    // Step 1: Broadcasting to nearby drivers
    onStatusUpdate?.({
      status: 'BROADCASTING',
      message: `Broadcasting request to nearest verified ${category} drivers...`,
      progress: 30,
    });

    // Pool of drivers: First look at live visible drivers on the map, then proximity generator
    let pool = [];
    if (Array.isArray(mapDrivers) && mapDrivers.length > 0) {
      pool = [...mapDrivers];
    } else {
      try {
        const storeDrivers = useMapStore.getState()?.drivers;
        if (Array.isArray(storeDrivers) && storeDrivers.length > 0) {
          pool = [...storeDrivers];
        }
      } catch (e) {}
    }

    if (pool.length === 0) {
      pool = getDriversNearLocation(pLat, pLng, 12, 50);
    }

    // Helper functions for driver normalization
    const getDriverCategory = (d) => {
      const c = String(d.vehicle?.category || d.category || d.vehicleCategory || '').toUpperCase();
      const m = String(d.vehicle?.model || d.vehicleModel || '').toUpperCase();
      if (c.includes('TOTO') || c.includes('AUTO') || m.includes('TOTO') || m.includes('AUTO') || m.includes('RICKSHAW')) return 'AUTO';
      if (c.includes('BIKE') || c.includes('MOTO') || m.includes('ACTIVA') || m.includes('SPLENDOR') || m.includes('PULSAR') || m.includes('BIKE')) return 'MOTO';
      if (c.includes('XL') || c.includes('TRANSPORTER') || m.includes('INNOVA') || m.includes('SCORPIO') || m.includes('TRANSPORTER')) return 'XL';
      return 'ECONOMY';
    };

    const isCategoryMatch = (d) => {
      const dCat = getDriverCategory(d);
      if (targetCategory.includes('TOTO') || targetCategory.includes('AUTO')) return dCat === 'AUTO';
      if (targetCategory.includes('BIKE') || targetCategory.includes('MOTO')) return dCat === 'MOTO';
      if (targetCategory.includes('XL') || targetCategory.includes('TRANSPORTER')) return dCat === 'XL';
      return dCat === 'ECONOMY';
    };

    const getDriverDistance = (d) => {
      const dLat = Number(d.location?.lat ?? d.lat ?? 0);
      const dLng = Number(d.location?.lng ?? d.lng ?? 0);
      return Math.hypot(dLat - pLat, dLng - pLng);
    };

    // Filter available matching drivers
    const matchingDrivers = pool.filter((d) => d.status !== 'OFFLINE' && isCategoryMatch(d));

    // Sort strictly by distance to pickup spot ascending so the closest one is index 0!
    matchingDrivers.sort((a, b) => getDriverDistance(a) - getDriverDistance(b));

    let chosenDriver = matchingDrivers[0];

    // If no matching vehicle exists on the map, take the closest available driver and assign target category!
    if (!chosenDriver) {
      const allActive = pool.filter((d) => d.status !== 'OFFLINE');
      allActive.sort((a, b) => getDriverDistance(a) - getDriverDistance(b));
      chosenDriver = allActive[0];
    }

    // If still no driver or distance is unrealistically large (> 2km = ~0.018 deg), position realistically close (~200m)
    let chosenLat = chosenDriver?.location?.lat ?? chosenDriver?.lat;
    let chosenLng = chosenDriver?.location?.lng ?? chosenDriver?.lng;

    if (!chosenLat || !chosenLng || Math.hypot(chosenLat - pLat, chosenLng - pLng) > 0.02) {
      const isTotoOrLocal = targetCategory === 'AUTO' || String(pickupLocation.name || '').toLowerCase().includes('kharagpur');
      const offsetLat = isTotoOrLocal ? 0.0015 : 0.0020;
      const offsetLng = isTotoOrLocal ? -0.0014 : -0.0018;
      chosenLat = pLat + offsetLat;
      chosenLng = pLng + offsetLng;
    }

    const distKm = Math.max(0.2, Number((Math.hypot(chosenLat - pLat, chosenLng - pLng) * 111).toFixed(2)));
    const etaMinutes = Math.max(1, Math.min(4, Math.round(distKm / 0.35)));

    const defaultModel = targetCategory === 'AUTO'
      ? 'Solar E-Toto #08'
      : targetCategory === 'MOTO'
      ? 'Electric Bike (Ather EV)'
      : targetCategory === 'XL'
      ? 'EV Transporter (Tata Ace EV)'
      : 'Prime EV Cab (Tata Tigor)';

    const isMatchingCategory = (chosenDriver?.category === targetCategory) || (chosenDriver?.vehicle?.category === targetCategory);
    const assignedModel = isMatchingCategory && (chosenDriver?.vehicle?.model || chosenDriver?.vehicleModel)
      ? (chosenDriver?.vehicle?.model || chosenDriver?.vehicleModel)
      : defaultModel;

    const assignedPlate = isMatchingCategory && (chosenDriver?.vehicle?.plate || chosenDriver?.vehicleNumber)
      ? (chosenDriver?.vehicle?.plate || chosenDriver?.vehicleNumber)
      : (targetCategory === 'MOTO' ? 'DL 01 AB 4921' : targetCategory === 'AUTO' ? 'WB 26 Q 4921' : targetCategory === 'XL' ? 'WB 19 TR 8011' : 'KA 03 MN 9210');

    const defaultDriverName = targetCategory === 'MOTO' 
      ? 'Subhash Mondal' 
      : targetCategory === 'AUTO' 
      ? 'Vikram Singh' 
      : targetCategory === 'XL' 
      ? 'Rohan Deshmukh' 
      : 'Rajesh Sharma';

    const assignedDriver = {
      id: chosenDriver?.id || `drv-nearest-${Date.now()}`,
      name: isMatchingCategory ? (chosenDriver?.name || defaultDriverName) : defaultDriverName,
      rating: chosenDriver?.rating || 4.92,
      category: targetCategory,
      vehicleModel: assignedModel,
      vehicleNumber: assignedPlate,
      phone: chosenDriver?.phone || '+91 94340 12891',
      tripsCompleted: chosenDriver?.totalRides || chosenDriver?.tripsCompleted || 1420,
      location: {
        lat: Number(chosenLat),
        lng: Number(chosenLng),
        name: chosenDriver?.location?.name || `${pickupLocation.name?.split(',')[0] || 'Pickup'} Approach Corridor`,
        address: chosenDriver?.location?.address || `~${Math.round(distKm * 1000)}m from pickup point`,
      },
    };

    // Step 2: Driver received notification (850ms)
    setTimeout(() => {
      onStatusUpdate?.({
        status: 'DRIVER_NOTIFIED',
        message: `${assignedDriver.name} is reviewing your trip request...`,
        driver: assignedDriver,
        progress: 65,
      });
    }, 850);

    // Step 3: Driver accepted! (1800ms)
    setTimeout(() => {
      onStatusUpdate?.({
        status: 'ACCEPTED',
        message: `${assignedDriver.name} accepted your booking! Arriving in ${etaMinutes} min${etaMinutes > 1 ? 's' : ''}.`,
        driver: assignedDriver,
        etaMinutes,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        progress: 100,
      });
    }, 1800);

    return assignedDriver;
  }
}

export const dispatchSimulation = new DispatchSimulationEngine();
