import { Router } from 'express';
import { createReview, getListingReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/listing/:listingId', getListingReviews);
router.post('/', authenticate, createReview);

export default router;
