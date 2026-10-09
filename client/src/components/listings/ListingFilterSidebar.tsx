import React from 'react';
import { Filter, RotateCcw, Search, MapPin } from 'lucide-react';

interface FilterState {
  query: string;
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  sort: string;
}

interface ListingFilterSidebarProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories: string[];
}

export const ListingFilterSidebar: React.FC<ListingFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  categories,
}) => {
  return (
    <aside className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          Filter & Sort
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Keywords</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Sony, Tent, Drill..."
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Location / City */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Location</label>
        <div className="relative">
          <input
            type="text"
            placeholder="City or area (e.g. Dhaka)"
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Daily Price (৳)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ৳"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="number"
            placeholder="Max ৳"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Item Condition</label>
        <select
          value={filters.condition}
          onChange={(e) => onChange({ condition: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
        >
          <option value="">Any Condition</option>
          <option value="Brand New">Brand New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 font-medium"
        >
          <option value="relevance">Relevance / Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Booked</option>
        </select>
      </div>
    </aside>
  );
};
