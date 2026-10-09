import { PricingService } from '../services/pricingService.js';
import { IListing } from '../models/Listing.js';

describe('PricingService', () => {
  const mockListing: Partial<IListing> = {
    title: 'Sony Alpha A7 IV Camera',
    pricing: {
      daily: 1800,
      weekly: 10500,
      hourly: 250,
    },
    securityDeposit: 3000,
    currency: 'BDT',
    pickupDelivery: {
      pickup: true,
      delivery: true,
      deliveryFee: 200,
    },
  };

  it('calculates 3-day daily rental cost with deposit and platform service fee', () => {
    const start = new Date('2026-10-15T10:00:00Z');
    const end = new Date('2026-10-18T10:00:00Z');

    const result = PricingService.calculate({
      listing: mockListing as IListing,
      startDate: start,
      endDate: end,
      deliveryOption: 'pickup',
    });

    expect(result.durationDays).toBe(3);
    expect(result.rateType).toBe('daily');
    expect(result.unitRate).toBe(1800);
    expect(result.subtotal).toBe(5400);
    expect(result.securityDeposit).toBe(3000);
    expect(result.serviceFee).toBe(270); // 5% of 5400
    expect(result.deliveryFee).toBe(0);
    expect(result.totalAmount).toBe(5400 + 3000 + 270);
  });

  it('calculates weekly rate discount when rental duration >= 7 days', () => {
    const start = new Date('2026-10-10T10:00:00Z');
    const end = new Date('2026-10-17T10:00:00Z'); // 7 days

    const result = PricingService.calculate({
      listing: mockListing as IListing,
      startDate: start,
      endDate: end,
      deliveryOption: 'delivery',
    });

    expect(result.durationDays).toBe(7);
    expect(result.rateType).toBe('weekly');
    expect(result.unitRate).toBe(10500);
    expect(result.subtotal).toBe(10500);
    expect(result.deliveryFee).toBe(200);
    expect(result.totalAmount).toBe(10500 + 3000 + Math.round(10500 * 0.05) + 200);
  });

  it('throws error when endDate is before or equal to startDate', () => {
    const start = new Date('2026-10-18T10:00:00Z');
    const end = new Date('2026-10-15T10:00:00Z');

    expect(() => {
      PricingService.calculate({
        listing: mockListing as IListing,
        startDate: start,
        endDate: end,
      });
    }).toThrow('End date must be strictly after the start date.');
  });
});
