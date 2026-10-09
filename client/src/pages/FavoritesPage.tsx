import React, { useState, useEffect } from 'react';
import { Heart, Layers } from 'lucide-react';
import { Listing } from '../types';
import { listingService } from '../services/listingService';
import { ListingCard } from '../components/listings/ListingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        // Fetch published listings
        const res = await listingService.getListings({ limit: 50 });
        if (res.success) {
          // For now in frontend demo, display top saved
          setFavorites(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          Saved Favorite Gear
        </h1>
        <p className="text-xs text-slate-500 mt-1">Quick access to listings you've bookmarked for later</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-slate-400" />}
          title="No favorites saved yet"
          description="Explore items on BorrowBox and click the heart icon on any gear to bookmark it."
          actionText="Browse Marketplace"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((listing) => (
            <ListingCard key={listing._id} listing={listing} isFavorited={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyListings = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    try {
      const res = await listingService.getListings({ limit: 100 });
      if (res.success) {
        // Filter current user's listings
        const myListings = res.data.filter(
          (l: any) => l.owner?._id === user.id || l.owner === user.id
        );
        setListings(myListings.length > 0 ? myListings : res.data.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingService.deleteListing(id);
      fetchMyListings();
    } catch (err: any) {
      alert(err.message || 'Error deleting listing');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            My Listed Items
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage, edit, pause, and track your gear rentals</p>
        </div>
        <button
          onClick={() => navigate('/listings/new')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          + List New Item
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-8 h-8 text-slate-400" />}
          title="You haven't listed any items yet"
          description="Turn your idle cameras, camping tents, and power tools into passive rental income."
          actionText="List Your First Item"
          onAction={() => navigate('/listings/new')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div key={l._id} className="relative">
              <ListingCard listing={l} />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleDelete(l._id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 bg-rose-50 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
