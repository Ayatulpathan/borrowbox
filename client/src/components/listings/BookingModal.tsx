import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Listing, PricingBreakdown } from '../../types';
import { Modal } from '../common/Modal';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  startDate: string;
  endDate: string;
  breakdown: PricingBreakdown | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  listing,
  startDate,
  endDate,
  breakdown,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location?.address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await bookingService.createBooking({
        listingId: listing._id,
        startDate,
        endDate,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
        specialInstructions,
      });

      if (res.success) {
        setIsSuccess(true);
        setCreatedBookingId(res.data._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Booking Request" maxWidth="lg">
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Booking Request Sent!</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Your request for <strong>{listing.title}</strong> has been forwarded to the owner. You will receive an in-app alert as soon as they accept.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/bookings');
              }}
              className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <img
              src={listing.images[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200'}
              alt={listing.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{listing.title}</h4>
              <p className="text-[11px] text-slate-500">{listing.category}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-500" />
                  {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Handover Options */}
          {listing.pickupDelivery?.delivery && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Handover Preference</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('pickup')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-medium transition-all ${
                    deliveryOption === 'pickup'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Pickup in {listing.location.area}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('delivery')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-medium transition-all ${
                    deliveryOption === 'delivery'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Doorstep Delivery (+৳{listing.pickupDelivery.deliveryFee || 0})
                </button>
              </div>

              {deliveryOption === 'delivery' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter your complete delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes for Owner */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Message / Notes for Owner (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Planning a weekend video shoot, will take extra care of lenses..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Price Summary */}
          {breakdown && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  Rental Subtotal ({breakdown.durationDays} days @ ৳{breakdown.unitRate}/d)
                </span>
                <span className="font-semibold text-slate-900">৳{breakdown.subtotal}</span>
              </div>
              {breakdown.securityDeposit > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Deposit</span>
                  <span className="font-semibold text-slate-900">৳{breakdown.securityDeposit}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Platform Service Fee</span>
                <span className="font-semibold text-slate-900">৳{breakdown.serviceFee}</span>
              </div>
              {deliveryOption === 'delivery' && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900">৳{listing.pickupDelivery?.deliveryFee || 0}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-brand-600">
                  ৳{breakdown.totalAmount + (deliveryOption === 'delivery' ? (listing.pickupDelivery?.deliveryFee || 0) : 0)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Confirm & Request Booking'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export const ReviewCard: React.FC<{ review: any }> = ({ review }) => {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-2 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={review.reviewer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
            alt={review.reviewer?.name}
            className="w-7 h-7 rounded-full object-cover"
          />
          <div>
            <h5 className="text-xs font-bold text-slate-900">{review.reviewer?.name}</h5>
            <span className="text-[10px] text-slate-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
          {'★'.repeat(review.rating)}
          <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
    </div>
  );
};
