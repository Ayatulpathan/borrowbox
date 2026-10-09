import { Request, Response } from 'express';
import { Listing, IListing } from '../models/Listing.js';
import { Favorite } from '../models/Favorite.js';
import { AuthRequest } from '../middleware/auth.js';
import { BookingService } from '../services/bookingService.js';
import { AuditLog } from '../models/AuditLog.js';

export const getListings = async (req: Request, res: Response) => {
  try {
    const {
      query,
      category,
      city,
      area,
      minPrice,
      maxPrice,
      condition,
      status = 'published',
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: String(query), $options: 'i' } },
        { description: { $regex: String(query), $options: 'i' } },
        { category: { $regex: String(query), $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (city) {
      filter['location.city'] = new RegExp(String(city), 'i');
    }

    if (area) {
      filter['location.area'] = new RegExp(String(area), 'i');
    }

    if (condition) {
      filter.itemCondition = condition;
    }

    if (minPrice || maxPrice) {
      filter['pricing.daily'] = {};
      if (minPrice) filter['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.daily'].$lte = Number(maxPrice);
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'pricing.daily': 1 };
    if (sort === 'price_desc') sortOption = { 'pricing.daily': -1 };
    if (sort === 'rating') sortOption = { 'ratingSummary.average': -1, 'ratingSummary.count': -1 };
    if (sort === 'popular') sortOption = { totalBookings: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('owner', 'name avatar rating isVerified')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedListings = async (req: Request, res: Response) => {
  try {
    const featured = await Listing.find({ status: 'published', isFeatured: true })
      .populate('owner', 'name avatar rating isVerified')
      .limit(6);
    res.status(200).json({ success: true, data: featured });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { name: 'Cameras & Photography', icon: 'Camera', description: 'DSLRs, Mirrorless, Lenses, Drones, Gimbals' },
      { name: 'Electronics & Audio', icon: 'Headphones', description: 'Sound systems, Microphones, TVs, Projectors' },
      { name: 'Laptops & Computing', icon: 'Laptop', description: 'MacBooks, Gaming Rigs, Monitors, Tablets' },
      { name: 'Tools & DIY', icon: 'Wrench', description: 'Drills, Saws, Pressure Washers, Ladders' },
      { name: 'Outdoor & Camping', icon: 'Tent', description: 'Tents, Backpacks, Stoves, Kayaks, Sleeping Bags' },
      { name: 'Party & Events', icon: 'Sparkles', description: 'Lighting, Smoke machines, DJ consoles, Chairs' },
      { name: 'Gaming & VR', icon: 'Gamepad2', description: 'PS5, Xbox, Meta Quest 3, Retro Arcades' },
      { name: 'Vehicles & Scooters', icon: 'Bike', description: 'E-Bikes, Scooters, Roof Racks, Trailers' },
      { name: 'Sports & Fitness', icon: 'Dumbbell', description: 'Treadmills, Surfboards, Bicycles, Golf Sets' },
      { name: 'Other', icon: 'Box', description: 'Costumes, Specialty Equipment, Props' },
    ];

    const categoryCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        count: await Listing.countDocuments({ category: cat.name, status: 'published' }),
      }))
    );

    res.status(200).json({ success: true, data: categoryCounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name avatar rating isVerified bio createdAt location');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({ user: req.user._id, listing: listing._id });
      isFavorited = !!fav;
    }

    res.status(200).json({ success: true, data: listing, isFavorited });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      title,
      description,
      category,
      pricing,
      securityDeposit,
      currency = 'BDT',
      images,
      location,
      itemCondition,
      specs,
      includedAccessories,
      rules,
      cancellationPolicy,
      pickupDelivery,
      status = 'published',
    } = req.body;

    if (!title || !description || !category || !pricing?.daily) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and daily price are required.',
      });
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      owner: req.user._id,
      pricing: {
        daily: Number(pricing.daily),
        hourly: pricing.hourly ? Number(pricing.hourly) : undefined,
        weekly: pricing.weekly ? Number(pricing.weekly) : undefined,
      },
      securityDeposit: Number(securityDeposit) || 0,
      currency,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600'],
      location: {
        city: location?.city || req.user.location?.city || 'Dhaka',
        area: location?.area || req.user.location?.area || 'Gulshan',
        address: location?.address || '',
      },
      itemCondition: itemCondition || 'Like New',
      specs: specs || [],
      includedAccessories: includedAccessories || [],
      rules: rules || ['Handle with care and return in original condition'],
      cancellationPolicy: cancellationPolicy || 'Flexible',
      pickupDelivery: pickupDelivery || { pickup: true, delivery: false },
      status: status || 'published',
    });

    await AuditLog.create({
      action: 'LISTING_CREATED',
      actor: req.user._id,
      targetResource: 'Listing',
      resourceId: listing._id.toString(),
    });

    res.status(201).json({ success: true, message: 'Listing created successfully!', data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this listing.' });
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'pricing',
      'securityDeposit',
      'images',
      'location',
      'itemCondition',
      'specs',
      'includedAccessories',
      'rules',
      'cancellationPolicy',
      'pickupDelivery',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (listing as any)[field] = req.body[field];
      }
    });

    await listing.save();
    res.status(200).json({ success: true, message: 'Listing updated successfully.', data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this listing.' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Listing deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const listingId = req.params.id;
    const existing = await Favorite.findOne({ user: req.user._id, listing: listingId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({ success: true, isFavorited: false, message: 'Removed from favorites.' });
    } else {
      await Favorite.create({ user: req.user._id, listing: listingId });
      return res.status(200).json({ success: true, isFavorited: true, message: 'Added to favorites.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkListingAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate query params are required.' });
    }

    const result = await BookingService.checkAvailability(id, String(startDate), String(endDate));
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
