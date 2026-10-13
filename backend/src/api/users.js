import { Router } from 'express';
import { listUsersForAdmin, findUserById, updateUser } from '../db/db.js';
import { sanitizeUserForAdmin } from '../utils/privacy.js';

const router = Router();

// GET /api/v1/users (Admin Operations — with strict PII Privacy Masking)
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const result = await listUsersForAdmin({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    // Always return privacy-safe sanitized details for staff views
    const safeUser = sanitizeUserForAdmin(target);
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
