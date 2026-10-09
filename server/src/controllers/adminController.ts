import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Booking } from '../models/Booking.js';
import { AuditLog } from '../models/AuditLog.js';

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalListings, totalBookings, auditLogsCount] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      AuditLog.countDocuments(),
    ]);

    const activeRentals = await Booking.countDocuments({ status: { $in: ['approved', 'active'] } });
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalVolumeBDT = completedBookings.reduce((sum, b) => sum + b.pricingBreakdown.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        totalBookings,
        activeRentals,
        totalVolumeBDT,
        auditLogsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllListingsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: listings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (status) listing.status = status;
    if (isFeatured !== undefined) listing.isFeatured = isFeatured;

    await listing.save();

    await AuditLog.create({
      action: 'ADMIN_MODERATE_LISTING',
      actor: req.user?._id,
      targetResource: 'Listing',
      resourceId: listing._id.toString(),
      metadata: { status, isFeatured },
    });

    res.status(200).json({ success: true, message: 'Listing moderated successfully.', data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
