/**
 * Authentication Middleware
 * TODO: Add to protected routes: router.use(authenticateUser)
 */
import jwt from 'jsonwebtoken';

export function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authenticateAdmin(req, res, next) {
  authenticateUser(req, res, () => {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

export function authenticateDriver(req, res, next) {
  authenticateUser(req, res, () => {
    if (req.user?.role !== 'DRIVER' && req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}
