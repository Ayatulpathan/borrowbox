import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  calculatePricePreview,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/calculate', calculatePricePreview);
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/status', authenticate, updateBookingStatus);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;
