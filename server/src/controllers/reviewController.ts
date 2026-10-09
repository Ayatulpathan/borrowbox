import { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'bookingId, rating, and comment are required.' });
    }

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed rentals.' });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the renter can review this completed rental.' });
    }

    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const review = await Review.create({
      booking: booking._id,
      listing: booking.listing._id,
      reviewer: req.user._id,
      targetUser: booking.owner,
      rating: Number(rating),
      comment,
    });

    // Update listing rating summary
    const allListingReviews = await Review.find({ listing: booking.listing._id });
    const avgListingRating =
      allListingReviews.reduce((sum, r) => sum + r.rating, 0) / allListingReviews.length;
    await Listing.findByIdAndUpdate(booking.listing._id, {
      ratingSummary: {
        average: Number(avgListingRating.toFixed(1)),
        count: allListingReviews.length,
      },
    });

    // Update owner user rating
    const allOwnerReviews = await Review.find({ targetUser: booking.owner });
    const avgOwnerRating =
      allOwnerReviews.reduce((sum, r) => sum + r.rating, 0) / allOwnerReviews.length;
    await User.findByIdAndUpdate(booking.owner, {
      rating: {
        average: Number(avgOwnerRating.toFixed(1)),
        count: allOwnerReviews.length,
      },
    });

    // Notify owner
    await Notification.create({
      user: booking.owner,
      title: 'New Review Received! ⭐',
      message: `${req.user.name} rated your rental ${rating} stars: "${comment.slice(0, 60)}..."`,
      type: 'review_received',
      link: `/listings/${booking.listing._id}`,
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully!', data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getListingReviews = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const reviews = await Review.find({ listing: listingId })
      .populate('reviewer', 'name avatar rating isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
