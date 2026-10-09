import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  renter: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  rentalDuration: {
    days: number;
    hours?: number;
  };
  pricingBreakdown: {
    rateType: 'hourly' | 'daily' | 'weekly';
    unitRate: number;
    subtotal: number;
    securityDeposit: number;
    serviceFee: number;
    deliveryFee: number;
    totalAmount: number;
    currency: string;
  };
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'simulated_paid' | 'unpaid' | 'refunded';
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  confirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
    },
    rentalDuration: {
      days: { type: Number, required: true },
      hours: { type: Number, default: 0 },
    },
    pricingBreakdown: {
      rateType: { type: String, enum: ['hourly', 'daily', 'weekly'], default: 'daily' },
      unitRate: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      securityDeposit: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'BDT' },
    },
    deliveryOption: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    deliveryAddress: { type: String },
    specialInstructions: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['simulated_paid', 'unpaid', 'refunded'],
      default: 'simulated_paid',
    },
    cancellationReason: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index to help fast conflict checks
BookingSchema.index({ listing: 1, status: 1, startDate: 1, endDate: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
