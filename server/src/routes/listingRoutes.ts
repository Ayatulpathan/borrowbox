import { Router } from 'express';
import {
  getListings,
  getFeaturedListings,
  getCategories,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  checkListingAvailability,
} from '../controllers/listingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings);
router.get('/featured', getFeaturedListings);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getListingById);
router.get('/:id/availability', checkListingAvailability);
router.post('/', authenticate, createListing);
router.patch('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/favorite', authenticate, toggleFavorite);

export default router;
