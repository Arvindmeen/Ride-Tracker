/**
 * Real Authentication & User Profile API Routes
 * 
 * - POST /api/v1/auth/signup      — Register new Passenger or Driver Partner
 * - POST /api/v1/auth/register    — Alias for signup
 * - POST /api/v1/auth/login       — Secure login with bcrypt & role-based redirection
 * - GET  /api/v1/auth/me          — Fetch current authenticated profile & role permissions
 * - PUT  /api/v1/auth/profile     — Update own profile information
 * - POST /api/v1/auth/logout      — Session termination
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  findDriverByUserId,
  createDriverRecord,
} from '../db/db.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'veloq-production-secret-key-2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getRoleRedirect(role) {
  switch (role) {
    case 'DRIVER':
      return '/driver/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
    default:
      return '/app/home';
  }
}

// ── POST /signup & /register ──────────────────────────────────────────────────
async function handleSignup(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'USER',
      vehicleCategory,
      vehicleModel,
      vehiclePlate,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const assignedRole = ['USER', 'DRIVER', 'ADMIN'].includes(role) ? role : 'USER';

    // Check duplicate
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Create user
    const newUser = await createUser({
      name,
      email,
      phone: phone || `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      password,
      role: assignedRole,
    });

    // If driver role, create vehicle & driver record
    let driverProfile = null;
    if (assignedRole === 'DRIVER') {
      driverProfile = await createDriverRecord({
        userId: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        vehicleCategory: vehicleCategory || 'ECONOMY',
        vehicleModel: vehicleModel || 'Maruti Suzuki Dzire',
        vehiclePlate: vehiclePlate || 'DL 01 AB 1042',
      });
    }

    const token = generateToken(newUser);
    const redirectUrl = getRoleRedirect(assignedRole);

    res.status(201).json({
      message: `Account created successfully as ${assignedRole}`,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        rating: newUser.rating,
        preferredPayment: newUser.preferredPayment,
        driverInfo: driverProfile,
      },
      role: assignedRole,
      redirectUrl,
    });
  } catch (err) {
    next(err);
  }
}

router.post('/signup', handleSignup);
router.post('/register', handleSignup);

// ── POST /login ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If user requested specific role login, check compatibility
    if (expectedRole && expectedRole !== user.role && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `This account is registered as ${user.role}. Please log in via the ${user.role === 'DRIVER' ? 'Driver Partner' : 'Passenger'} tab.`,
      });
    }

    const token = generateToken(user);
    const redirectUrl = getRoleRedirect(user.role);

    let driverDetails = null;
    if (user.role === 'DRIVER') {
      driverDetails = await findDriverByUserId(user.id);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        totalRides: user.totalRides,
        preferredPayment: user.preferredPayment,
        driverInfo: driverDetails,
      },
      role: user.role,
      redirectUrl,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /me (Authenticated User Profile) ──────────────────────────────────────
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    let driverInfo = null;
    if (user.role === 'DRIVER') {
      driverInfo = await findDriverByUserId(user.id);
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        totalRides: user.totalRides,
        preferredPayment: user.preferredPayment,
        createdAt: user.createdAt,
        driverInfo,
      },
      role: user.role,
      permissions: {
        canBookRides: user.role === 'USER',
        canAcceptDispatches: user.role === 'DRIVER',
        canAccessAdminPanel: user.role === 'ADMIN',
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /profile (Update Own Profile) ─────────────────────────────────────────
router.put('/profile', authenticateUser, async (req, res, next) => {
  try {
    const { name, phone, preferredPayment } = req.body;
    const updated = await updateUser(req.user.id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(preferredPayment && { preferredPayment }),
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /logout ──────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
