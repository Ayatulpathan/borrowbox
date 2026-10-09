import mongoose from 'mongoose';
import { Listing, IListing } from '../models/Listing.js';
import { Booking, IBooking } from '../models/Booking.js';
import { User, IUser } from '../models/User.js';
import { BookingService } from './bookingService.js';
import { PricingService } from './pricingService.js';

export interface ToolContext {
  user?: IUser;
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, any>;
    required?: string[];
  };
  requiresConfirmation: boolean;
  execute: (args: any, context: ToolContext) => Promise<any>;
}

export const AI_TOOLS: Record<string, ToolDefinition> = {
  // 1. Search Listings
  searchListings: {
    name: 'searchListings',
    description: 'Search for rental items by query keywords, category, city/location, and maximum daily price budget.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search keywords (e.g., "Sony camera", "camping tent", "drill")' },
        category: { type: 'STRING', description: 'Category filter (e.g., "Cameras & Photography", "Outdoor & Camping", "Electronics & Audio", "Tools & DIY")' },
        city: { type: 'STRING', description: 'City or area name (e.g., "Dhaka", "Gulshan", "Dhanmondi")' },
        maxDailyPrice: { type: 'NUMBER', description: 'Maximum daily rental price in BDT' },
        limit: { type: 'NUMBER', description: 'Number of results to return (default 5)' },
      },
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const filter: any = { status: 'published' };
      if (args.query) {
        filter.$text = { $search: args.query };
      }
      if (args.category) {
        filter.category = new RegExp(args.category, 'i');
      }
      if (args.city) {
        filter['location.city'] = new RegExp(args.city, 'i');
      }
      if (args.maxDailyPrice) {
        filter['pricing.daily'] = { $lte: Number(args.maxDailyPrice) };
      }

      const limit = Math.min(Number(args.limit) || 6, 20);
      const listings = await Listing.find(filter)
        .populate('owner', 'name rating isVerified avatar')
        .limit(limit)
        .sort({ isFeatured: -1, 'ratingSummary.average': -1, createdAt: -1 });

      return {
        count: listings.length,
        results: listings.map((l) => ({
          id: l._id.toString(),
          title: l.title,
          category: l.category,
          dailyPrice: l.pricing.daily,
          hourlyPrice: l.pricing.hourly,
          securityDeposit: l.securityDeposit,
          currency: l.currency,
          city: l.location.city,
          area: l.location.area,
          condition: l.itemCondition,
          owner: (l.owner as any)?.name,
          rating: l.ratingSummary.average,
          images: l.images.slice(0, 1),
        })),
      };
    },
  },

  // 2. Get Listing Details
  getListingDetails: {
    name: 'getListingDetails',
    description: 'Retrieve full details, specs, rental rules, and deposit requirements for a specific listing ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'The MongoDB ObjectId of the listing' },
      },
      required: ['listingId'],
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const listing = await Listing.findById(args.listingId).populate('owner', 'name rating isVerified avatar bio');
      if (!listing) {
        return { error: 'Listing not found.' };
      }
      return {
        id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        category: listing.category,
        pricing: listing.pricing,
        securityDeposit: listing.securityDeposit,
        currency: listing.currency,
        condition: listing.itemCondition,
        location: listing.location,
        rules: listing.rules,
        specs: listing.specs,
        cancellationPolicy: listing.cancellationPolicy,
        pickupDelivery: listing.pickupDelivery,
        owner: {
          name: (listing.owner as any)?.name,
          rating: (listing.owner as any)?.rating,
          isVerified: (listing.owner as any)?.isVerified,
        },
      };
    },
  },

  // 3. Get Categories
  getCategories: {
    name: 'getCategories',
    description: 'Get all available marketplace categories and count of active listings in each category.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    requiresConfirmation: false,
    execute: async () => {
      const categories = [
        'Cameras & Photography',
        'Electronics & Audio',
        'Laptops & Computing',
        'Tools & DIY',
        'Outdoor & Camping',
        'Party & Events',
        'Gaming & VR',
        'Vehicles & Scooters',
        'Sports & Fitness',
        'Other',
      ];
      const counts = await Promise.all(
        categories.map(async (cat) => ({
          category: cat,
          activeListings: await Listing.countDocuments({ category: cat, status: 'published' }),
        }))
      );
      return { categories: counts };
    },
  },

  // 4. Check Availability
  checkAvailability: {
    name: 'checkAvailability',
    description: 'Check if a listing is available for rental between specific start and end dates.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'The ID of the listing' },
        startDate: { type: 'STRING', description: 'Start date in ISO format or YYYY-MM-DD' },
        endDate: { type: 'STRING', description: 'End date in ISO format or YYYY-MM-DD' },
      },
      required: ['listingId', 'startDate', 'endDate'],
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const result = await BookingService.checkAvailability(args.listingId, args.startDate, args.endDate);
      return {
        listingId: args.listingId,
        startDate: args.startDate,
        endDate: args.endDate,
        isAvailable: result.available,
        message: result.available
          ? 'Item is available for the requested rental period!'
          : 'Item has conflicting reservations during this time window.',
      };
    },
  },

  // 5. Calculate Rental Price
  calculateRentalPrice: {
    name: 'calculateRentalPrice',
    description: 'Calculate exact total cost breakdown (subtotal, security deposit, service fee, total) for a rental duration.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'The ID of the listing' },
        startDate: { type: 'STRING', description: 'Start date (YYYY-MM-DD or ISO)' },
        endDate: { type: 'STRING', description: 'End date (YYYY-MM-DD or ISO)' },
        deliveryOption: { type: 'STRING', description: '"pickup" or "delivery"' },
      },
      required: ['listingId', 'startDate', 'endDate'],
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const listing = await Listing.findById(args.listingId);
      if (!listing) {
        return { error: 'Listing not found' };
      }
      const calculation = PricingService.calculate({
        listing,
        startDate: args.startDate,
        endDate: args.endDate,
        deliveryOption: args.deliveryOption || 'pickup',
      });
      return {
        listingTitle: listing.title,
        ...calculation,
      };
    },
  },

  // 6. Get Rental Rules & Deposit
  getRentalRules: {
    name: 'getRentalRules',
    description: 'Retrieve safety guidelines, cancellation policy, and deposit requirements for a listing.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'Listing ID' },
      },
      required: ['listingId'],
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const listing = await Listing.findById(args.listingId);
      if (!listing) return { error: 'Listing not found' };
      return {
        title: listing.title,
        rules: listing.rules,
        securityDeposit: listing.securityDeposit,
        cancellationPolicy: listing.cancellationPolicy,
        pickupDelivery: listing.pickupDelivery,
      };
    },
  },

  // 7. Create Listing Draft
  createListingDraft: {
    name: 'createListingDraft',
    description: 'Create a draft listing for the authenticated user (remains in draft mode until confirmed/published).',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Item name / listing title' },
        category: { type: 'STRING', description: 'Category' },
        description: { type: 'STRING', description: 'Item description' },
        dailyPrice: { type: 'NUMBER', description: 'Daily rental price in BDT' },
        securityDeposit: { type: 'NUMBER', description: 'Security deposit in BDT' },
        city: { type: 'STRING', description: 'City (e.g., Dhaka)' },
        area: { type: 'STRING', description: 'Area (e.g., Gulshan)' },
        itemCondition: { type: 'STRING', description: 'Brand New, Like New, Good, Fair' },
      },
      required: ['title', 'category', 'description', 'dailyPrice'],
    },
    requiresConfirmation: false,
    execute: async (args, context) => {
      if (!context.userId) {
        return { error: 'You must be logged in to create a listing draft.' };
      }
      const listing = await Listing.create({
        title: args.title,
        category: args.category,
        description: args.description,
        owner: context.userId,
        pricing: {
          daily: Number(args.dailyPrice),
        },
        securityDeposit: Number(args.securityDeposit) || 0,
        location: {
          city: args.city || 'Dhaka',
          area: args.area || 'Gulshan',
        },
        itemCondition: args.itemCondition || 'Like New',
        status: 'draft',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600'],
      });
      return {
        success: true,
        message: `Draft listing created successfully for "${listing.title}". You can review and publish it whenever ready.`,
        draftListingId: listing._id.toString(),
        listing,
      };
    },
  },

  // 8. Generate Listing Description
  generateListingDescription: {
    name: 'generateListingDescription',
    description: 'Generate an engaging, SEO-friendly listing description and rental rules based on product specs.',
    parameters: {
      type: 'OBJECT',
      properties: {
        itemName: { type: 'STRING', description: 'Item name/model' },
        features: { type: 'STRING', description: 'Key features, specs or accessories included' },
        condition: { type: 'STRING', description: 'Item condition' },
      },
      required: ['itemName'],
    },
    requiresConfirmation: false,
    execute: async (args) => {
      const description = `Rent this premium ${args.itemName} in ${args.condition || 'pristine'} condition! 

Key Highlights:
- High-performance, professionally maintained equipment.
- ${args.features || 'Includes essential power cables, carrying bag, and accessories.'}
- Perfect for creators, professionals, and weekend enthusiasts who need top-tier gear without the purchase cost.

Rental Guidelines:
- Clean and tested before handover.
- Please handle with care and return with all included accessories.`;

      return {
        suggestedTitle: `${args.itemName} (${args.condition || 'Like New'})`,
        suggestedDescription: description,
        suggestedRules: [
          'Valid NID / Passport required at handover',
          'Return item with full battery/cleaned state',
          'Late returns subject to hourly penalty',
        ],
      };
    },
  },

  // 9. Submit Listing For Approval / Publish (Consequential -> Requires Confirmation)
  submitListingForApproval: {
    name: 'submitListingForApproval',
    description: 'Publish a draft listing to make it live and bookable on the marketplace.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'Draft listing ID to publish' },
      },
      required: ['listingId'],
    },
    requiresConfirmation: true,
    execute: async (args, context) => {
      if (!context.userId) return { error: 'Authentication required.' };
      const listing = await Listing.findById(args.listingId);
      if (!listing) return { error: 'Listing not found.' };
      if (listing.owner.toString() !== context.userId.toString() && context.userRole !== 'admin') {
        return { error: 'You are not authorized to publish this listing.' };
      }
      listing.status = 'published';
      await listing.save();
      return {
        success: true,
        message: `Listing "${listing.title}" is now published and publicly bookable!`,
        listingId: listing._id.toString(),
      };
    },
  },

  // 10. Create Booking Request (Consequential -> Requires Confirmation)
  createBookingRequest: {
    name: 'createBookingRequest',
    description: 'Submit a formal rental booking request for an item. Will verify availability and lock in pricing.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listingId: { type: 'STRING', description: 'Listing ID to rent' },
        startDate: { type: 'STRING', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'STRING', description: 'End date (YYYY-MM-DD)' },
        deliveryOption: { type: 'STRING', description: '"pickup" or "delivery"' },
        specialInstructions: { type: 'STRING', description: 'Notes for the owner' },
      },
      required: ['listingId', 'startDate', 'endDate'],
    },
    requiresConfirmation: true,
    execute: async (args, context) => {
      if (!context.userId) {
        return { error: 'You must be logged in to submit a booking request.' };
      }
      const booking = await BookingService.createBooking({
        renterId: context.userId,
        listingId: args.listingId,
        startDate: args.startDate,
        endDate: args.endDate,
        deliveryOption: args.deliveryOption || 'pickup',
        specialInstructions: args.specialInstructions,
      });

      return {
        success: true,
        bookingId: booking._id.toString(),
        status: booking.status,
        totalAmount: booking.pricingBreakdown.totalAmount,
        currency: booking.pricingBreakdown.currency,
        message: `Booking request submitted successfully for ${new Date(args.startDate).toLocaleDateString()} to ${new Date(args.endDate).toLocaleDateString()}. The owner has been notified!`,
      };
    },
  },

  // 11. Get My Bookings
  getMyBookings: {
    name: 'getMyBookings',
    description: 'Retrieve all current, pending, and past bookings for the logged-in user (as renter or owner).',
    parameters: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING', description: '"renter" (items I rented) or "owner" (requests for my items), or "all"' },
        status: { type: 'STRING', description: 'Filter by status (pending, approved, active, completed, cancelled)' },
      },
    },
    requiresConfirmation: false,
    execute: async (args, context) => {
      if (!context.userId) {
        return { error: 'You must be logged in to view your bookings.' };
      }
      const filter: any = {};
      if (args.type === 'owner') {
        filter.owner = context.userId;
      } else if (args.type === 'renter') {
        filter.renter = context.userId;
      } else {
        filter.$or = [{ renter: context.userId }, { owner: context.userId }];
      }

      if (args.status) {
        filter.status = args.status;
      }

      const bookings = await Booking.find(filter)
        .populate('listing', 'title images pricing location')
        .populate('renter', 'name email avatar')
        .populate('owner', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        count: bookings.length,
        bookings: bookings.map((b) => ({
          id: b._id.toString(),
          itemTitle: (b.listing as any)?.title || 'Item',
          itemImage: (b.listing as any)?.images?.[0],
          startDate: b.startDate,
          endDate: b.endDate,
          days: b.rentalDuration.days,
          totalAmount: b.pricingBreakdown.totalAmount,
          currency: b.pricingBreakdown.currency,
          status: b.status,
          role: b.renter._id.toString() === context.userId?.toString() ? 'renter' : 'owner',
          otherParty:
            b.renter._id.toString() === context.userId?.toString()
              ? (b.owner as any)?.name
              : (b.renter as any)?.name,
        })),
      };
    },
  },

  // 12. Cancel Eligible Booking (Consequential -> Requires Confirmation)
  cancelEligibleBooking: {
    name: 'cancelEligibleBooking',
    description: 'Cancel an active or pending booking with reason.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bookingId: { type: 'STRING', description: 'ID of booking to cancel' },
        reason: { type: 'STRING', description: 'Reason for cancellation' },
      },
      required: ['bookingId'],
    },
    requiresConfirmation: true,
    execute: async (args, context) => {
      if (!context.userId) return { error: 'Authentication required.' };
      const updated = await BookingService.updateStatus({
        bookingId: args.bookingId,
        newStatus: 'cancelled',
        userId: context.userId,
        userRole: context.userRole || 'user',
        reason: args.reason || 'User cancelled via AI assistant',
      });
      return {
        success: true,
        bookingId: updated._id.toString(),
        status: updated.status,
        message: 'Booking has been cancelled and relevant parties have been notified.',
      };
    },
  },

  // 13. Respond To Booking Request (Owner Accept/Reject) (Consequential -> Requires Confirmation)
  respondToBookingRequest: {
    name: 'respondToBookingRequest',
    description: 'Owner accepts or rejects an incoming booking request.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bookingId: { type: 'STRING', description: 'Booking ID' },
        decision: { type: 'STRING', description: '"approved" or "rejected"' },
        reason: { type: 'STRING', description: 'Reason (especially if rejected)' },
      },
      required: ['bookingId', 'decision'],
    },
    requiresConfirmation: true,
    execute: async (args, context) => {
      if (!context.userId) return { error: 'Authentication required.' };
      const decision = args.decision.toLowerCase() === 'approved' ? 'approved' : 'rejected';
      const updated = await BookingService.updateStatus({
        bookingId: args.bookingId,
        newStatus: decision as any,
        userId: context.userId,
        userRole: context.userRole || 'user',
        reason: args.reason,
      });
      return {
        success: true,
        bookingId: updated._id.toString(),
        status: updated.status,
        message: `Booking request has been ${decision}!`,
      };
    },
  },

  // 14. Get My Profile
  getMyProfile: {
    name: 'getMyProfile',
    description: 'Get authenticated user profile, verification status, and ratings.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    requiresConfirmation: false,
    execute: async (_, context) => {
      if (!context.user) return { error: 'You are not currently logged in.' };
      return {
        id: context.user._id.toString(),
        name: context.user.name,
        email: context.user.email,
        role: context.user.role,
        rating: context.user.rating,
        isVerified: context.user.isVerified,
        location: context.user.location,
      };
    },
  },

  // 15. Get My Listings
  getMyListings: {
    name: 'getMyListings',
    description: 'Get all listings created by the authenticated user.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    requiresConfirmation: false,
    execute: async (_, context) => {
      if (!context.userId) return { error: 'You must be logged in to view your listings.' };
      const listings = await Listing.find({ owner: context.userId }).sort({ createdAt: -1 });
      return {
        count: listings.length,
        listings: listings.map((l) => ({
          id: l._id.toString(),
          title: l.title,
          category: l.category,
          dailyPrice: l.pricing.daily,
          status: l.status,
          totalBookings: l.totalBookings,
          rating: l.ratingSummary.average,
        })),
      };
    },
  },

  // 16. Generate Rental Summary
  generateRentalSummary: {
    name: 'generateRentalSummary',
    description: 'Summarize active rentals, incoming owner requests, and total spending/earnings for the user.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    requiresConfirmation: false,
    execute: async (_, context) => {
      if (!context.userId) return { error: 'You must be logged in to view rental summary.' };
      const renterBookings = await Booking.find({ renter: context.userId }).populate('listing', 'title');
      const ownerBookings = await Booking.find({ owner: context.userId }).populate('listing', 'title');

      const activeRented = renterBookings.filter((b) => b.status === 'approved' || b.status === 'active');
      const pendingRented = renterBookings.filter((b) => b.status === 'pending');
      const incomingRequests = ownerBookings.filter((b) => b.status === 'pending');
      const approvedLends = ownerBookings.filter((b) => b.status === 'approved' || b.status === 'active');

      const totalSpent = renterBookings
        .filter((b) => b.status === 'completed' || b.status === 'approved' || b.status === 'active')
        .reduce((sum, b) => sum + b.pricingBreakdown.totalAmount, 0);

      const totalEarned = ownerBookings
        .filter((b) => b.status === 'completed' || b.status === 'approved' || b.status === 'active')
        .reduce((sum, b) => sum + b.pricingBreakdown.subtotal, 0);

      return {
        renterSummary: {
          activeRentalsCount: activeRented.length,
          pendingRequestsCount: pendingRented.length,
          totalSpentBDT: totalSpent,
          activeItems: activeRented.map((b) => ({
            title: (b.listing as any)?.title,
            until: b.endDate,
          })),
        },
        ownerSummary: {
          pendingRequestsToRespond: incomingRequests.length,
          activeLendsCount: approvedLends.length,
          totalEarnedBDT: totalEarned,
        },
      };
    },
  },
};
