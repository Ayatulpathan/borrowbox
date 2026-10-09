import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Listing, PricingBreakdown } from '../../types';
import { bookingService } from '../../services/bookingService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PriceCalculatorWidgetProps {
  listing: Listing;
  onBookNow: (startDate: string, endDate: string, breakdown: PricingBreakdown) => void;
}

export const PriceCalculatorWidget: React.FC<PriceCalculatorWidgetProps> = ({
  listing,
  onBookNow,
}) => {
  // Default to tomorrow until 3 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultEnd = threeDaysLater.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    if (!startDate || !endDate) return;
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      setBreakdown(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await bookingService.calculatePrice({
        listingId: listing._id,
        startDate,
        endDate,
        deliveryOption,
      });
      if (res.success) {
        setBreakdown(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error calculating price');
      setBreakdown(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [startDate, endDate, deliveryOption]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-3xl font-extrabold text-slate-900">৳{listing.pricing.daily}</span>
          <span className="text-slate-500 text-sm font-medium"> / day</span>
        </div>
        {listing.pricing.weekly && (
          <div className="text-right">
            <span className="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
              ৳{listing.pricing.weekly} / week
            </span>
          </div>
        )}
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-500" /> Start Date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-500" /> End Date
          </label>
          <input
            type="date"
            min={startDate || new Date().toISOString().split('T')[0]}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>
      </div>

      {/* Delivery Toggle if supported */}
      {listing.pickupDelivery?.delivery && (
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700">Handover Method</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDeliveryOption('pickup')}
              className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                deliveryOption === 'pickup'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              Direct Pickup (Free)
            </button>
            <button
              type="button"
              onClick={() => setDeliveryOption('delivery')}
              className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                deliveryOption === 'delivery'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              Doorstep Delivery (+৳{listing.pickupDelivery.deliveryFee || 0})
            </button>
          </div>
        </div>
      )}

      {/* Breakdown or Loading */}
      {isLoading ? (
        <div className="py-6 text-center">
          <LoadingSpinner size="sm" />
          <p className="text-xs text-slate-400 mt-2">Checking availability & calculating rates...</p>
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : breakdown ? (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Availability status badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Available for selected {breakdown.durationDays} days</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>
                Rate (৳{breakdown.unitRate} × {breakdown.durationDays} days)
              </span>
              <span className="font-medium text-slate-900">৳{breakdown.subtotal}</span>
            </div>
            {breakdown.securityDeposit > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Refundable Security Deposit
                  <span className="text-[10px] text-slate-400" title="Refunded upon safe return of item">
                    ⓘ
                  </span>
                </span>
                <span className="font-medium text-slate-900">৳{breakdown.securityDeposit}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Platform Service Fee</span>
              <span className="font-medium text-slate-900">৳{breakdown.serviceFee}</span>
            </div>
            {breakdown.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-slate-900">৳{breakdown.deliveryFee}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-slate-900">Total Rental Cost</span>
              <p className="text-[10px] text-slate-400">Includes refundable deposit</p>
            </div>
            <span className="text-2xl font-black text-brand-600">৳{breakdown.totalAmount}</span>
          </div>

          {/* Book Now Button */}
          <button
            onClick={() => onBookNow(startDate, endDate, breakdown)}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            Request Booking
          </button>
        </div>
      ) : null}

      <div className="text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          You won't be charged until the owner approves your request.
        </p>
      </div>
    </div>
  );
};
