import { Router } from 'express';
import {
  getPlatformStats,
  getAllListingsAdmin,
  moderateListing,
  getAllUsersAdmin,
  getAuditLogsAdmin,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/listings', getAllListingsAdmin);
router.patch('/listings/:id', moderateListing);
router.get('/users', getAllUsersAdmin);
router.get('/audit-logs', getAuditLogsAdmin);

export default router;
