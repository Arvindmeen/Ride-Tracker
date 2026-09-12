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
   * Finds the closest driver, triggers instant animated acceptance.
   */
  simulateUserBookingAcceptance(pickupLocation, category = 'ECONOMY', onStatusUpdate) {
    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng) {
      return null;
    }

    // Step 1: Broadcasting to nearby drivers
    onStatusUpdate?.({
      status: 'BROADCASTING',
      message: 'Broadcasting request to nearby drivers in real-time...',
      progress: 30,
    });

    const nearby = getDriversNearLocation(pickupLocation.lat, pickupLocation.lng, 5);
    const matchingDrivers = nearby.filter((d) => !category || d.category === category);
    const assignedDriver = matchingDrivers[0] || nearby[0] || {
      id: 'drv-match-assigned',
      name: 'Manoj Kumar',
      rating: 4.92,
      category: category || 'ECONOMY',
      vehicleModel: 'Maruti Suzuki Dzire VXI',
      vehicleNumber: 'DL 01 AZ 7842',
      phone: '+91 98765 43210',
      tripsCompleted: 1420,
      location: {
        lat: pickupLocation.lat + 0.005,
        lng: pickupLocation.lng + 0.004,
      },
    };

    // Step 2: Driver received notification (800ms)
    setTimeout(() => {
      onStatusUpdate?.({
        status: 'DRIVER_NOTIFIED',
        message: `${assignedDriver.name} is reviewing your trip request...`,
        driver: assignedDriver,
        progress: 65,
      });
    }, 900);

    // Step 3: Driver accepted! (1800ms)
    setTimeout(() => {
      onStatusUpdate?.({
        status: 'ACCEPTED',
        message: `${assignedDriver.name} accepted your booking! Arriving in 3 mins.`,
        driver: assignedDriver,
        etaMinutes: 3,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        progress: 100,
      });
    }, 2000);

    return assignedDriver;
  }
}

export const dispatchSimulation = new DispatchSimulationEngine();
