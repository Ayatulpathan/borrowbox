import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  owner: mongoose.Types.ObjectId;
  pricing: {
    hourly?: number;
    daily: number;
    weekly?: number;
  };
  securityDeposit: number;
  currency: string;
  images: string[];
  location: {
    city: string;
    area: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  itemCondition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  specs: Array<{ key: string; value: string }>;
  includedAccessories: string[];
  rules: string[];
  cancellationPolicy: 'Flexible' | 'Moderate' | 'Strict';
  pickupDelivery: {
    pickup: boolean;
    delivery: boolean;
    deliveryFee?: number;
  };
  status: 'draft' | 'published' | 'paused' | 'archived';
  isFeatured: boolean;
  ratingSummary: {
    average: number;
    count: number;
  };
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
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
      ],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pricing: {
      hourly: { type: Number, min: 0 },
      daily: { type: Number, required: [true, 'Daily price is required'], min: 0 },
      weekly: { type: Number, min: 0 },
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      city: { type: String, required: true, default: 'Dhaka', index: true },
      area: { type: String, required: true, default: 'Gulshan', index: true },
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    itemCondition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Good', 'Fair'],
      default: 'Like New',
    },
    specs: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    includedAccessories: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [
        'Valid National ID / Passport required at handover',
        'Handle with care and return in original condition',
        'Late returns incur an hourly surcharge',
      ],
    },
    cancellationPolicy: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict'],
      default: 'Flexible',
    },
    pickupDelivery: {
      pickup: { type: Boolean, default: true },
      delivery: { type: Boolean, default: false },
      deliveryFee: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'paused', 'archived'],
      default: 'published',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    ratingSummary: {
      average: { type: Number, default: 5.0 },
      count: { type: Number, default: 0 },
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ title: 'text', description: 'text', category: 'text', 'location.city': 'text', 'location.area': 'text' });

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
