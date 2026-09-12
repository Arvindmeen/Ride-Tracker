import { Router } from 'express';
import { listUsersForAdmin, findUserById, updateUser } from '../db/db.js';
import { authenticateUser, authenticateAdmin } from '../middleware/auth.js';
import { sanitizeUserForAdmin } from '../utils/privacy.js';

const router = Router();

// GET /api/v1/users (Admin Operations — with strict PII Privacy Masking)
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const result = await listUsersForAdmin({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:id
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    // Privacy rule: Only the user themselves can view raw unmasked details.
    // Admin viewing users gets privacy-masked PII.
    if (req.user.id !== target.id) {
      if (req.user.role === 'ADMIN') {
        return res.json({ user: sanitizeUserForAdmin(target) });
      }
      return res.status(403).json({ error: 'Access denied to private user profile' });
    }

    const { passwordHash, ...safeUser } = target;
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id
router.patch('/:id', authenticateUser, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await updateUser(req.params.id, req.body);
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
