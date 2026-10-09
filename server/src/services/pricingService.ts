import { IListing } from '../models/Listing.js';

export interface PricingInput {
  listing: IListing;
  startDate: Date | string;
  endDate: Date | string;
  deliveryOption?: 'pickup' | 'delivery';
}

export interface PricingResult {
  rateType: 'hourly' | 'daily' | 'weekly';
  unitRate: number;
  durationDays: number;
  durationHours: number;
  subtotal: number;
  securityDeposit: number;
  serviceFee: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
}

export class PricingService {
  /**
   * Deterministically calculates rental cost breakdown based on listing rates & duration.
   */
  static calculate(input: PricingInput): PricingResult {
    const { listing, deliveryOption = 'pickup' } = input;
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid start or end date provided.');
    }

    if (end <= start) {
      throw new Error('End date must be strictly after the start date.');
    }

    const diffMs = end.getTime() - start.getTime();
    const durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const durationDays = Math.max(1, Math.ceil(durationHours / 24));

    let rateType: 'hourly' | 'daily' | 'weekly' = 'daily';
    let unitRate = listing.pricing.daily;
    let subtotal = 0;

    // Weekly pricing tier (if >= 7 days and weekly rate defined)
    if (durationDays >= 7 && listing.pricing.weekly && listing.pricing.weekly > 0) {
      rateType = 'weekly';
      const weeks = Math.floor(durationDays / 7);
      const remainingDays = durationDays % 7;
      unitRate = listing.pricing.weekly;
      subtotal = weeks * listing.pricing.weekly + remainingDays * listing.pricing.daily;
    } else if (durationHours <= 8 && listing.pricing.hourly && listing.pricing.hourly > 0) {
      // Hourly rate for short durations if configured
      rateType = 'hourly';
      unitRate = listing.pricing.hourly;
      subtotal = durationHours * listing.pricing.hourly;
    } else {
      // Standard daily rate
      rateType = 'daily';
      unitRate = listing.pricing.daily;
      subtotal = durationDays * listing.pricing.daily;
    }

    const securityDeposit = listing.securityDeposit || 0;
    // Standard marketplace service fee (5% of subtotal, minimum 20 BDT)
    const serviceFee = Math.max(20, Math.round(subtotal * 0.05));
    const deliveryFee =
      deliveryOption === 'delivery' && listing.pickupDelivery?.delivery
        ? listing.pickupDelivery.deliveryFee || 0
        : 0;

    const totalAmount = subtotal + securityDeposit + serviceFee + deliveryFee;

    return {
      rateType,
      unitRate,
      durationDays,
      durationHours,
      subtotal,
      securityDeposit,
      serviceFee,
      deliveryFee,
      totalAmount,
      currency: listing.currency || 'BDT',
    };
  }
}
