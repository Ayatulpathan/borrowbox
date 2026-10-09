import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { Listing } from '../../types';
import { Badge } from '../common/Badge';

interface ListingCardProps {
  listing: Listing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const owner = listing.owner as any;
  const image =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(listing._id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-600 hover:text-rose-500 transition-colors shadow-sm"
            aria-label="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}

        {/* Condition & Category Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/70 text-white backdrop-blur-md">
            {listing.category.split('&')[0].trim()}
          </span>
          {listing.itemCondition && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
              {listing.itemCondition}
            </span>
          )}
        </div>

        {/* Security deposit tag */}
        {listing.securityDeposit > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/90 text-white backdrop-blur-md">
              Deposit: ৳{listing.securityDeposit}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[120px]">
                {listing.location.area}, {listing.location.city}
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.ratingSummary?.average > 0 ? listing.ratingSummary.average.toFixed(1) : '5.0'}</span>
              <span className="text-[10px] text-slate-400">({listing.ratingSummary?.count || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/listings/${listing._id}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 leading-snug">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Footer: Owner & Price */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img
              src={owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
              alt={owner?.name || 'Owner'}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-slate-600 truncate max-w-[90px]">{owner?.name || 'Verified Lender'}</span>
            {owner?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />}
          </div>

          <div className="text-right">
            <span className="text-base font-extrabold text-brand-600">৳{listing.pricing.daily}</span>
            <span className="text-[11px] text-slate-500 font-medium">/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
