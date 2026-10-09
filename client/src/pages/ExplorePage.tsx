import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Layers, X, SlidersHorizontal } from 'lucide-react';
import { Listing } from '../types';
import { listingService } from '../services/listingService';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingFilterSidebar } from '../components/listings/ListingFilterSidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<string[]>([
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
  ]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'relevance',
  });

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await listingService.getListings({
        query: filters.query || undefined,
        category: filters.category || undefined,
        city: filters.city || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        condition: filters.condition || undefined,
        sort: filters.sort,
        page: currentPage,
        limit: 12,
      });

      if (res.success) {
        setListings(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // Sync to URL search params
    const newParams: Record<string, string> = {};
    if (filters.query) newParams.query = filters.query;
    if (filters.category) newParams.category = filters.category;
    if (filters.city) newParams.city = filters.city;
    if (filters.minPrice) newParams.minPrice = filters.minPrice;
    if (filters.maxPrice) newParams.maxPrice = filters.maxPrice;
    if (filters.condition) newParams.condition = filters.condition;
    if (filters.sort !== 'relevance') newParams.sort = filters.sort;
    setSearchParams(newParams);
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: 'relevance',
    });
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (id: string) => {
    if (!user) return;
    try {
      await listingService.toggleFavorite(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" />
            Explore Rental Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {totalCount} verified items available for rent
          </p>
        </div>

        {/* Mobile filter toggle button */}
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters & Sort
        </button>
      </div>

      {/* Active Filter Badges */}
      {(filters.category || filters.query || filters.city || filters.minPrice || filters.maxPrice || filters.condition) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Active Filters:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
              Category: {filters.category}
              <button onClick={() => handleFilterChange({ category: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.query && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
              Query: "{filters.query}"
              <button onClick={() => handleFilterChange({ query: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
              Location: {filters.city}
              <button onClick={() => handleFilterChange({ city: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
              Condition: {filters.condition}
              <button onClick={() => handleFilterChange({ condition: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-20">
          <ListingFilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 p-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">Filters & Sort</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <ListingFilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                categories={categories}
              />
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-4 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-slate-400 mt-3">Fetching marketplace listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8 text-slate-400" />}
              title="No matching listings found"
              description="Try adjusting your keywords, broadening the category filter, or resetting price bounds."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === idx + 1
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
