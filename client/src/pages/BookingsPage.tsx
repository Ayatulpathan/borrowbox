import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Star,
  Sparkles,
} from 'lucide-react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const BookingsPage: React.FC = () => {
  const [tab, setTab] = useState<'renter' | 'owner'>('renter');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getMyBookings({ type: tab });
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [tab]);

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected' | 'completed') => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(selectedBookingForCancel._id, cancelReason);
      setIsCancelModalOpen(false);
      setSelectedBookingForCancel(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await reviewService.createReview({
        bookingId: selectedBookingForReview._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setIsReviewModalOpen(false);
        setSelectedBookingForReview(null);
        setReviewComment('');
        fetchBookings();
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.message || err.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Confirmed / Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Awaiting Owner Approval</Badge>;
      case 'active':
        return <Badge variant="primary">Currently Active</Badge>;
      case 'completed':
        return <Badge variant="purple">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rental & Booking Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track active reservations, incoming lending requests, and completed rentals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('renter')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            tab === 'renter'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Rentals (Items I Rented)
        </button>
        <button
          onClick={() => setTab('owner')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            tab === 'owner'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Lender Requests (My Items for Rent)
        </button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-slate-400" />}
          title={tab === 'renter' ? 'No rental bookings yet' : 'No incoming requests yet'}
          description={
            tab === 'renter'
              ? 'Find gear you need for your upcoming shoot or trip on our marketplace.'
              : 'List more items or use the AI Agent to optimize your descriptions.'
          }
          actionText={tab === 'renter' ? 'Explore Marketplace' : 'List Gear'}
          onAction={() => (window.location.href = tab === 'renter' ? '/explore' : '/listings/new')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isRenter = tab === 'renter';
            const otherUser = isRenter ? b.owner : b.renter;

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      ID: #{b._id.slice(-6)}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                  <span className="text-xs text-slate-400">
                    Requested on {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Item Image & Title */}
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <img
                      src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200'}
                      alt={b.listing?.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link to={`/listings/${b.listing?._id}`}>
                        <h4 className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate">
                          {b.listing?.title || 'Marketplace Item'}
                        </h4>
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isRenter ? 'Lender: ' : 'Renter: '}
                        <strong>{otherUser?.name}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="md:col-span-3 text-xs text-slate-600 space-y-0.5">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>
                        {new Date(b.startDate).toLocaleDateString()} –{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Duration: {b.rentalDuration?.days || 1} Days
                    </span>
                  </div>

                  {/* Price & Actions */}
                  <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-2 text-right">
                    <div>
                      <span className="text-sm font-black text-brand-600">
                        ৳{b.pricingBreakdown?.totalAmount}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Total amount</span>
                    </div>

                    {/* Owner Actions */}
                    {!isRenter && b.status === 'pending' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'rejected')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {!isRenter && (b.status === 'approved' || b.status === 'active') && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors ml-2"
                      >
                        Mark Completed
                      </button>
                    )}

                    {/* Renter Review Action */}
                    {isRenter && b.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedBookingForReview(b);
                          setIsReviewModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 ml-2"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" /> Leave Review
                      </button>
                    )}

                    {/* Cancel button */}
                    {(b.status === 'pending' || b.status === 'approved') && (
                      <button
                        onClick={() => {
                          setSelectedBookingForCancel(b);
                          setIsCancelModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Review Completed Rental"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {reviewError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {reviewError}
              </div>
            )}
            <p className="text-xs text-slate-600">
              Rate your experience using <strong>{selectedBookingForReview.listing?.title}</strong>
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl transition-transform ${
                      reviewRating >= star ? 'text-amber-400 scale-110' : 'text-slate-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Your Feedback / Review</label>
              <textarea
                rows={4}
                required
                placeholder="How was the item condition, battery life, lender communication?..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {isSubmittingReview ? <LoadingSpinner size="sm" /> : 'Submit Review'}
            </button>
          </form>
        </Modal>
      )}

      {/* Cancel Modal */}
      {selectedBookingForCancel && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Booking"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking #{selectedBookingForCancel._id.slice(-6)}?
            </p>
            <textarea
              rows={3}
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                {isCancelling ? <LoadingSpinner size="sm" /> : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
