import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Heart,
  Share2,
  Sparkles,
  ArrowLeft,
  Package,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Listing, PricingBreakdown, Review } from '../types';
import { listingService } from '../services/listingService';
import { reviewService } from '../services/reviewService';
import { PriceCalculatorWidget } from '../components/listings/PriceCalculatorWidget';
import { BookingModal, ReviewCard } from '../components/listings/BookingModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const ListingDetailPage: React.FC<{ onOpenAgentWithPrompt?: (prompt: string) => void }> = ({
  onOpenAgentWithPrompt,
}) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingBreakdown, setBookingBreakdown] = useState<PricingBreakdown | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [listRes, revRes] = await Promise.all([
          listingService.getListingById(id),
          reviewService.getListingReviews(id),
        ]);
        if (listRes.success) {
          setListing(listRes.data);
          setIsFavorited(listRes.isFavorited);
        }
        if (revRes.success) {
          setReviews(revRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user || !listing) {
      navigate('/login');
      return;
    }
    try {
      const res = await listingService.toggleFavorite(listing._id);
      if (res.success) {
        setIsFavorited(res.isFavorited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBookingModal = (start: string, end: string, breakdown: PricingBreakdown) => {
    setBookingStart(start);
    setBookingEnd(end);
    setBookingBreakdown(breakdown);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-3">Loading listing details & verified reviews...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">The listing you are looking for may have been removed or archived.</p>
        <Link to="/explore" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold inline-block">
          Explore Other Items
        </Link>
      </div>
    );
  }

  const owner = listing.owner as any;
  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Sticky Booking Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-soft">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === idx ? 'border-brand-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Category & Location */}
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{listing.category}</Badge>
              <Badge variant="neutral">Condition: {listing.itemCondition}</Badge>
              {listing.cancellationPolicy && (
                <Badge variant="warning">{listing.cancellationPolicy} Cancellation</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>
                  {listing.location.area}, {listing.location.city}
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{listing.ratingSummary?.average > 0 ? listing.ratingSummary.average.toFixed(1) : '5.0'}</span>
                <span className="text-slate-400 font-normal">({listing.ratingSummary?.count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Package className="w-4 h-4 text-slate-400" />
                <span>{listing.totalBookings || 0} total completed rentals</span>
              </div>
            </div>
          </div>

          {/* Verified Owner Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={owner?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{owner?.name || 'Verified Lender'}</h4>
                  {owner?.isVerified && <ShieldCheck className="w-4 h-4 text-brand-500" />}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{owner?.bio || 'Verified member on BorrowBox'}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>Rating: ⭐ {owner?.rating?.average || 5.0}</span>
                  <span>•</span>
                  <span>Member in {listing.location.city}</span>
                </div>
              </div>
            </div>

            {/* AI Prompt Button for this item */}
            {onOpenAgentWithPrompt && (
              <button
                onClick={() => onOpenAgentWithPrompt(`Tell me more about "${listing.title}" and check if it has good reviews.`)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-xl border border-brand-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Ask AI About Item
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">About this Gear</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Technical Specs */}
          {listing.specs && listing.specs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="p-3 bg-white rounded-xl border border-slate-100 text-xs flex justify-between">
                    <span className="text-slate-500 font-medium">{spec.key}</span>
                    <span className="text-slate-900 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Included Accessories */}
          {listing.includedAccessories && listing.includedAccessories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Included Accessories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.includedAccessories.map((acc, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{acc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental Rules & Cancellation */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Rental Rules & Handover Policies</h3>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
              {listing.rules && listing.rules.length > 0 ? (
                listing.rules.map((rule, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{rule}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600">Standard BorrowBox safety and identity verification rules apply.</p>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Verified Renter Reviews
                  <span className="text-xs font-normal text-slate-400">({reviews.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Only renters with completed bookings can review</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                No reviews yet for this listing. Be the first to rent and leave feedback!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <ReviewCard key={rev._id} review={rev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <PriceCalculatorWidget listing={listing} onBookNow={handleOpenBookingModal} />
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        listing={listing}
        startDate={bookingStart}
        endDate={bookingEnd}
        breakdown={bookingBreakdown}
      />
    </div>
  );
};
