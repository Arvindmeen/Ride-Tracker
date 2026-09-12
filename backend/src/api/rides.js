/**
 * Rides API Routes — 100% Dynamic Ride Management
 * GET    /api/v1/rides              — list fleet rides (admin)
 * POST   /api/v1/rides              — book a new ride
 * GET    /api/v1/rides/:id          — get dynamic ride by ID
 * PATCH  /api/v1/rides/:id/cancel   — cancel ride
 * PATCH  /api/v1/rides/:id/complete — mark ride as completed with dynamic telemetry
 * PATCH  /api/v1/rides/:id/rate     — rate completed ride
 * GET    /api/v1/rides/user/:userId — user's dynamic ride history
 */
import { Router } from 'express';
import {
  saveRide,
  updateRide,
  findRideById,
  getRidesByUserId,
  getAllRides,
  listRidesForAdmin,
} from '../db/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const rides = await getAllRides();
    res.json({ message: 'Rides list', rides, total: rides.length });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { userId, pickup, destination, category, fare, distance, driverInfo, otp } = req.body;
    const dynamicOtp = otp || String(Math.floor(1000 + Math.random() * 9000));
    const newRide = {
      id: req.body.id || `RIDE-${Date.now().toString().slice(-6)}`,
      userId: userId || 'USR-PASSENGER-01',
      driverId: driverInfo?.id || 'DRV-RECORD-01',
      status: req.body.status || 'DRIVER_APPROACHING',
      category: category || 'ECONOMY',
      pickup: pickup || { name: 'Pickup Location', lat: 28.8358, lng: 78.7725 },
      destination: destination || { name: 'Destination Dropoff', lat: 28.8314, lng: 78.7654 },
      fare: fare || { total: 42, base: 25, distance: 12, tax: 2, currency: 'INR' },
      distance: distance || 1.4,
      otp: dynamicOtp,
      payment: {
        method: req.body.paymentMethod || req.body.payment?.method || 'UPI',
        status: req.body.payment?.status || 'PENDING',
        amount: typeof fare === 'object' ? Math.round(fare.total) : fare || 42,
      },
      requestedAt: req.body.requestedAt || new Date().toISOString(),
      driverInfo: driverInfo || {
        name: 'Verified Driver',
        vehicle: 'Vehicle (Cab/Bike)',
        plate: 'UP 21 AB 4921',
        rating: 4.9,
        category: category || 'MOTO',
      },
    };

    const saved = await saveRide(newRide);
    res.status(201).json({ message: 'Ride booked successfully', ride: saved });
  } catch (err) { next(err); }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userRides = await getRidesByUserId(userId);
    res.json({ rides: userRides, total: userRides.length });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ride = await findRideById(req.params.id);
    if (ride) return res.json(ride);
    res.status(404).json({ error: 'Ride not found', id: req.params.id });
  } catch (err) { next(err); }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const completedAt = req.body.completedAt || new Date().toISOString();
    const updates = {
      ...req.body,
      status: 'RIDE_COMPLETED',
      completedAt,
      userRating: req.body.userRating || req.body.rating || 5,
      payment: {
        ...(typeof req.body.payment === 'object' ? req.body.payment : {}),
        status: 'COMPLETED',
        method: req.body.payment?.method || 'UPI',
      },
    };

    const updated = await updateRide(req.params.id, updates);
    res.json({ message: 'Ride marked completed successfully', ride: updated });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const updated = await updateRide(req.params.id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });
    res.json({ message: 'Ride cancelled', ride: updated });
  } catch (err) { next(err); }
});

router.patch('/:id/rate', async (req, res, next) => {
  try {
    const { userRating } = req.body;
    const updated = await updateRide(req.params.id, {
      userRating: userRating || 5,
    });
    res.json({ message: 'Ride rated successfully', ride: updated });
  } catch (err) { next(err); }
});

export default router;
