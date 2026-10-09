import { Request, Response } from 'express';
import { Booking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { AuthRequest } from '../middleware/auth.js';
import { BookingService } from '../services/bookingService.js';
import { PricingService } from '../services/pricingService.js';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { listingId, startDate, endDate, deliveryOption, deliveryAddress, specialInstructions } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'listingId, startDate, and endDate are required.' });
    }

    const booking = await BookingService.createBooking({
      renterId: req.user._id,
      listingId,
      startDate,
      endDate,
      deliveryOption,
      deliveryAddress,
      specialInstructions,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully! The owner will review your request.',
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { type, status } = req.query;
    const filter: any = {};

    if (type === 'renter') {
      filter.renter = req.user._id;
    } else if (type === 'owner') {
      filter.owner = req.user._id;
    } else {
      filter.$or = [{ renter: req.user._id }, { owner: req.user._id }];
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('listing', 'title images pricing location securityDeposit rules')
      .populate('renter', 'name email avatar phone rating')
      .populate('owner', 'name email avatar phone rating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('renter', 'name email avatar phone rating location')
      .populate('owner', 'name email avatar phone rating location');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isRenter = booking.renter._id.toString() === req.user._id.toString();
    const isOwner = booking.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot view this booking.' });
    }

    res.status(200).json({
      success: true,
      data: booking,
      userRoleInBooking: isRenter ? 'renter' : 'owner',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'New status is required.' });
    }

    const updated = await BookingService.updateStatus({
      bookingId: req.params.id,
      newStatus: status,
      userId: req.user._id,
      userRole: req.user.role,
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { reason } = req.body;
    const updated = await BookingService.updateStatus({
      bookingId: req.params.id,
      newStatus: 'cancelled',
      userId: req.user._id,
      userRole: req.user.role,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const calculatePricePreview = async (req: Request, res: Response) => {
  try {
    const { listingId, startDate, endDate, deliveryOption } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'listingId, startDate, and endDate are required.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const calculation = PricingService.calculate({
      listing,
      startDate,
      endDate,
      deliveryOption,
    });

    const availability = await BookingService.checkAvailability(listingId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        ...calculation,
        isAvailable: availability.available,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
