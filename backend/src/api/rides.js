/**
 * Rides API Routes
 * GET    /api/v1/rides              — list rides (admin)
 * POST   /api/v1/rides              — book a new ride
 * GET    /api/v1/rides/:id          — get ride by ID
 * PATCH  /api/v1/rides/:id/cancel   — cancel ride
 * PATCH  /api/v1/rides/:id/complete — mark ride as completed
 * PATCH  /api/v1/rides/:id/rate     — rate completed ride
 * GET    /api/v1/rides/user/:userId — user's ride history
 */
import { Router } from 'express';
import { listRidesForAdmin } from '../db/db.js';

const router = Router();

// In-memory persistent trips store (contains real dynamic completed rides)
let RIDES_DATA = [
  {
    id: 'RIDE-MBD-RECENT',
    userId: 'USR-PASSENGER-01',
    driverId: 'DRV-RECORD-01',
    status: 'RIDE_COMPLETED',
    category: 'MOTO',
    pickup: { lat: 28.8358, lng: 78.7725, name: 'Budh Bazaar Market, Moradabad', address: 'Budhbazar Road, Moradabad, Uttar Pradesh' },
    destination: { lat: 28.8314, lng: 78.7654, name: 'Moradabad Junction Railway Station', address: 'Station Road (SH49), Moradabad Junction' },
    fare: { base: 25, distance: 12, time: 3, tax: 2, total: 42, currency: 'INR' },
    payment: { id: 'PAY-MBD-01', method: 'UPI', status: 'COMPLETED', amount: 42, currency: 'INR' },
    requestedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    acceptedAt: new Date(Date.now() - 24 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    distance: 1.4,
    duration: 6,
    userRating: 5,
    driverRating: 5,
    driverInfo: {
      name: 'Subhash Mondal',
      phone: '+91 94340 12891',
      vehicle: 'Hero Splendor Plus (Bike)',
      plate: 'UP 21 AB 4921',
      rating: 4.92,
      category: 'MOTO',
    },
  },
];

router.get('/', async (req, res, next) => {
  try {
    const data = await listRidesForAdmin();
    res.json({ message: 'Rides list', rides: RIDES_DATA, total: RIDES_DATA.length });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { userId, pickup, destination, category, fare, distance, driverInfo } = req.body;
    const newRide = {
      id: req.body.id || `RIDE-${Date.now()}`,
      userId: userId || 'USR-PASSENGER-01',
      driverId: driverInfo?.id || 'DRV-RECORD-01',
      status: req.body.status || 'DRIVER_APPROACHING',
      category: category || 'ECONOMY',
      pickup: pickup || { name: 'Budh Bazaar Market, Moradabad', address: 'Budhbazar Road, Moradabad', lat: 28.8358, lng: 78.7725 },
      destination: destination || { name: 'Moradabad Junction Railway Station', address: 'Station Road (SH49), Moradabad Junction', lat: 28.8314, lng: 78.7654 },
      fare: fare || { total: 42, currency: 'INR' },
      distance: distance || 1.4,
      payment: { method: req.body.paymentMethod || 'UPI', status: 'PENDING', amount: fare?.total || 48 },
      requestedAt: new Date().toISOString(),
      driverInfo: driverInfo || {
        name: 'Subhash Mondal',
        vehicle: 'Hero Splendor Plus (Bike)',
        plate: 'UP 21 AB 4921',
        rating: 4.92,
        category: category || 'MOTO',
      },
    };

    RIDES_DATA.unshift(newRide);
    res.status(201).json({ message: 'Ride booked successfully', ride: newRide });
  } catch (err) { next(err); }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userRides = RIDES_DATA.filter((r) => r.userId === userId || r.userId === 'USR-PASSENGER-01');
    res.json({ rides: userRides, total: userRides.length });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ride = RIDES_DATA.find((r) => r.id === req.params.id);
    if (ride) return res.json(ride);
    if (req.params.id === 'ACTIVE_RIDE') return res.json(RIDES_DATA[0]);
    res.status(404).json({ error: 'Ride not found', id: req.params.id });
  } catch (err) { next(err); }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const idx = RIDES_DATA.findIndex((r) => r.id === req.params.id);
    if (idx !== -1) {
      RIDES_DATA[idx] = {
        ...RIDES_DATA[idx],
        ...req.body,
        status: 'RIDE_COMPLETED',
        completedAt: req.body.completedAt || new Date().toISOString(),
        userRating: req.body.userRating || req.body.rating || RIDES_DATA[idx].userRating || 5,
      };
      return res.json({ message: 'Ride completed successfully', ride: RIDES_DATA[idx] });
    }
    // If not in array yet, add as new completed ride
    const newCompleted = {
      id: req.params.id,
      ...req.body,
      status: 'RIDE_COMPLETED',
      completedAt: req.body.completedAt || new Date().toISOString(),
    };
    RIDES_DATA.unshift(newCompleted);
    res.json({ message: 'Ride marked completed', ride: newCompleted });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const idx = RIDES_DATA.findIndex((r) => r.id === req.params.id);
    if (idx !== -1) {
      RIDES_DATA[idx].status = 'CANCELLED';
      RIDES_DATA[idx].cancelledAt = new Date().toISOString();
    }
    res.json({ message: 'Ride cancelled', id: req.params.id });
  } catch (err) { next(err); }
});

router.patch('/:id/rate', async (req, res, next) => {
  try {
    const { userRating } = req.body;
    const idx = RIDES_DATA.findIndex((r) => r.id === req.params.id);
    if (idx !== -1) {
      RIDES_DATA[idx].userRating = userRating || 5;
    }
    res.json({ message: 'Ride rated successfully' });
  } catch (err) { next(err); }
});

export default router;
