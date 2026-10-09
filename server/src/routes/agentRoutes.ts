import { Router } from 'express';
import {
  chatWithAgent,
  getTasks,
  getTaskById,
  confirmAction,
  cancelAction,
} from '../controllers/agentController.js';
import { authenticate } from '../middleware/auth.js';
import { agentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);
router.post('/chat', agentLimiter, chatWithAgent);
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks/:id/confirm', confirmAction);
router.post('/tasks/:id/cancel', cancelAction);

export default router;
