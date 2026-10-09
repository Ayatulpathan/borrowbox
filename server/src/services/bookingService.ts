import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { Notification } from '../models/Notification.js';
import { PricingService } from './pricingService.js';
import { AuditLog } from '../models/AuditLog.js';

export class BookingService {
  /**
   * Check if a listing has conflicting confirmed/pending reservations in the given date range.
   */
  static async checkAvailability(
    listingId: string | mongoose.Types.ObjectId,
    startDate: Date | string,
    endDate: Date | string,
    excludeBookingId?: string | mongoose.Types.ObjectId
  ): Promise<{ available: boolean; conflictingBookings: IBooking[] }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const query: any = {
      listing: listingId,
      status: { $in: ['pending', 'approved', 'active'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }, // overlap condition
      ],
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await Booking.find(query);
    return {
      available: conflictingBookings.length === 0,
      conflictingBookings,
    };
  }

  /**
   * Create a new booking request with concurrency-safe availability validation.
   */
  static async createBooking(params: {
    renterId: mongoose.Types.ObjectId;
    listingId: string;
    startDate: string | Date;
    endDate: string | Date;
    deliveryOption?: 'pickup' | 'delivery';
    deliveryAddress?: string;
    specialInstructions?: string;
  }): Promise<IBooking> {
    const { renterId, listingId, startDate, endDate, deliveryOption = 'pickup', deliveryAddress, specialInstructions } = params;

    const listing = await Listing.findById(listingId).populate('owner');
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.status !== 'published') {
      throw new Error('This listing is not currently available for booking.');
    }

    if (listing.owner._id.toString() === renterId.toString()) {
      throw new Error('You cannot book your own listing.');
    }

    // Availability validation check
    const availability = await this.checkAvailability(listing._id, startDate, endDate);
    if (!availability.available) {
      throw new Error('The requested item is not available for the selected dates.');
    }

    const pricing = PricingService.calculate({
      listing,
      startDate,
      endDate,
      deliveryOption,
    });

    const booking = await Booking.create({
      listing: listing._id,
      renter: renterId,
      owner: listing.owner._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rentalDuration: {
        days: pricing.durationDays,
        hours: pricing.durationHours,
      },
      pricingBreakdown: pricing,
      deliveryOption,
      deliveryAddress,
      specialInstructions,
      status: 'pending',
      paymentStatus: 'simulated_paid',
    });

    // Create notification for owner
    await Notification.create({
      user: listing.owner._id,
      title: 'New Booking Request 📦',
      message: `You received a booking request for "${listing.title}" from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
      type: 'booking_request',
      link: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id, listingId: listing._id },
    });

    // Log action
    await AuditLog.create({
      action: 'BOOKING_CREATED',
      actor: renterId,
      targetResource: 'Booking',
      resourceId: booking._id.toString(),
      metadata: { listingId: listing._id, totalAmount: pricing.totalAmount },
    });

    return booking;
  }

  /**
   * Transition booking state (Owner accepts/rejects, Renter/Owner cancels, etc.)
   */
  static async updateStatus(params: {
    bookingId: string;
    newStatus: 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
    userId: mongoose.Types.ObjectId;
    userRole: string;
    reason?: string;
  }): Promise<IBooking> {
    const { bookingId, newStatus, userId, userRole, reason } = params;

    const booking = await Booking.findById(bookingId).populate('listing').populate('renter').populate('owner');
    if (!booking) {
      throw new Error('Booking not found');
    }

    const isOwner = booking.owner._id.toString() === userId.toString();
    const isRenter = booking.renter._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isRenter && !isAdmin) {
      throw new Error('You do not have permission to modify this booking.');
    }

    // State machine logic
    if (newStatus === 'approved') {
      if (!isOwner && !isAdmin) {
        throw new Error('Only the item owner can approve booking requests.');
      }
      if (booking.status !== 'pending') {
        throw new Error(`Cannot approve a booking in '${booking.status}' status.`);
      }

      // Recheck availability upon approval
      const availability = await this.checkAvailability(booking.listing._id, booking.startDate, booking.endDate, booking._id);
      if (!availability.available) {
        throw new Error('Conflicting reservation was confirmed while this request was pending.');
      }

      booking.status = 'approved';
      booking.confirmedAt = new Date();

      // Increment listing total bookings
      await Listing.findByIdAndUpdate(booking.listing._id, { $inc: { totalBookings: 1 } });

      await Notification.create({
        user: booking.renter._id,
        title: 'Booking Approved! 🎉',
        message: `Your booking for "${(booking.listing as any).title}" has been confirmed by the owner.`,
        type: 'booking_approved',
        link: `/bookings/${booking._id}`,
        metadata: { bookingId: booking._id },
      });
    } else if (newStatus === 'rejected') {
      if (!isOwner && !isAdmin) {
        throw new Error('Only the item owner can reject booking requests.');
      }
      if (booking.status !== 'pending') {
        throw new Error(`Cannot reject a booking in '${booking.status}' status.`);
      }

      booking.status = 'rejected';
      booking.cancellationReason = reason || 'Declined by owner';

      await Notification.create({
        user: booking.renter._id,
        title: 'Booking Request Declined',
        message: `Your booking request for "${(booking.listing as any).title}" was declined.`,
        type: 'booking_rejected',
        link: `/bookings/${booking._id}`,
        metadata: { bookingId: booking._id },
      });
    } else if (newStatus === 'cancelled') {
      if (!isOwner && !isRenter && !isAdmin) {
        throw new Error('Not authorized to cancel this booking.');
      }
      if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') {
        throw new Error(`Cannot cancel a booking that is already '${booking.status}'.`);
      }

      booking.status = 'cancelled';
      booking.cancelledBy = userId;
      booking.cancellationReason = reason || (isRenter ? 'Cancelled by renter' : 'Cancelled by owner');

      const notifyUser = isRenter ? booking.owner._id : booking.renter._id;
      await Notification.create({
        user: notifyUser,
        title: 'Booking Cancelled ⚠️',
        message: `Booking for "${(booking.listing as any).title}" was cancelled. Reason: ${booking.cancellationReason}`,
        type: 'booking_cancelled',
        link: `/bookings/${booking._id}`,
        metadata: { bookingId: booking._id },
      });
    } else if (newStatus === 'completed') {
      if (!isOwner && !isAdmin) {
        throw new Error('Only owner or administrator can mark a booking as completed.');
      }
      booking.status = 'completed';
      booking.completedAt = new Date();

      await Notification.create({
        user: booking.renter._id,
        title: 'Rental Completed — Leave a Review! ⭐',
        message: `Hope you enjoyed using "${(booking.listing as any).title}"! Please leave a review for the owner.`,
        type: 'booking_completed',
        link: `/listings/${booking.listing._id}?reviewBooking=${booking._id}`,
        metadata: { bookingId: booking._id, listingId: booking.listing._id },
      });
    } else if (newStatus === 'active') {
      booking.status = 'active';
    }

    await booking.save();

    await AuditLog.create({
      action: `BOOKING_STATUS_${newStatus.toUpperCase()}`,
      actor: userId,
      targetResource: 'Booking',
      resourceId: booking._id.toString(),
      metadata: { previousStatus: booking.status, newStatus, reason },
    });

    return booking;
  }
}
