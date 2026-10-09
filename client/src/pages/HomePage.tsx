import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Camera,
  Headphones,
  Laptop,
  Wrench,
  Tent,
  Gamepad2,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Package,
  Calendar,
  Zap,
} from 'lucide-react';
import { Listing } from '../types';
import { listingService } from '../services/listingService';
import { ListingCard } from '../components/listings/ListingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const HomePage: React.FC<{ onOpenAgent: () => void }> = ({ onOpenAgent }) => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rent vs Buy interactive calculator state
  const [itemCost, setItemCost] = useState(85000); // e.g. Sony A7 IV camera
  const [rentalDays, setRentalDays] = useState(3);
  const [rentalDailyRate, setRentalDailyRate] = useState(1800);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          listingService.getFeatured(),
          listingService.getCategories(),
        ]);
        if (featRes.success) setFeaturedListings(featRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/explore?${params.toString()}`);
  };

  const rentalTotal = rentalDays * rentalDailyRate + 200; // plus service fee
  const savings = Math.max(0, itemCost - rentalTotal);

  const popularCategories = [
    { name: 'Cameras & Photography', icon: Camera, color: 'from-blue-500 to-indigo-600' },
    { name: 'Outdoor & Camping', icon: Tent, color: 'from-emerald-500 to-teal-600' },
    { name: 'Electronics & Audio', icon: Headphones, color: 'from-amber-500 to-orange-600' },
    { name: 'Tools & DIY', icon: Wrench, color: 'from-rose-500 to-pink-600' },
    { name: 'Laptops & Computing', icon: Laptop, color: 'from-purple-500 to-violet-600' },
    { name: 'Gaming & VR', icon: Gamepad2, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Next-Gen AI-Powered Rental Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Rent the Gear You Need. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
                Instead of Buying It.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Borrow cameras, camping gear, power tools, and high-end tech on demand from verified owners near you. Delegate searches, bookings, and drafting to our integrated AI Agent.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 sm:p-3 rounded-2xl shadow-elevated border border-slate-200 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mt-6"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What item do you want to rent?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="sm:w-48 px-3 py-2 bg-slate-50 rounded-xl">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {popularCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                Search
              </button>
            </form>

            {/* Quick Agent Prompt Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-medium">Or try AI Agent:</span>
              <button
                onClick={onOpenAgent}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-600 rounded-full font-medium transition-all shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-brand-500" /> "Find Sony A7 IV in Dhaka"
              </button>
              <button
                onClick={onOpenAgent}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-600 rounded-full font-medium transition-all shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-brand-500" /> "Check tent availability for Friday"
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Rent verified gear across top marketplace sectors</p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {popularCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-elevated hover:border-brand-200 transition-all text-center flex flex-col items-center justify-center gap-2.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {cat.name.split('&')[0].trim()}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured & Trending Gear</h2>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                TOP RATED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Top-reviewed items available for booking right now</p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore All Items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
            No featured listings found. Check back soon or list your own item!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* "Rent vs Buy" Impact Calculator Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-elevated border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>The BorrowBox Economics</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Why Buy When You Only Need It For a Weekend?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Most specialized items (drones, cinema lenses, pressure washers, tents) sit idle 95% of the year. Renting lets you use world-class gear at a tiny fraction of the retail cost.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xs text-slate-400">Average Savings</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">94%</div>
                  <div className="text-[10px] text-slate-400">vs brand new purchase</div>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xs text-slate-400">Carbon Footprint</div>
                  <div className="text-2xl font-black text-brand-400 mt-1">-82%</div>
                  <div className="text-[10px] text-slate-400">circular asset usage</div>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Slider Card */}
            <div className="lg:col-span-6 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Interactive Cost Comparison</span>
                <span className="text-xs text-brand-400 font-normal">Live Estimate</span>
              </h3>

              {/* Sliders */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Retail Purchase Price (৳)</span>
                    <span className="font-bold text-white">৳{itemCost.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="300000"
                    step="5000"
                    value={itemCost}
                    onChange={(e) => setItemCost(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Rental Duration</span>
                    <span className="font-bold text-white">{rentalDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Result Comparison */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Rental Total ({rentalDays}d)</span>
                  <div className="text-xl font-black text-white">৳{rentalTotal.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 font-semibold">You Save</span>
                  <div className="text-2xl font-black text-emerald-400">৳{savings.toLocaleString()}</div>
                </div>
              </div>

              <Link
                to="/explore"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                Browse Items to Rent Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">How BorrowBox Works</h2>
          <p className="text-xs text-slate-500">
            A secure, automated 3-step rental lifecycle with human & AI supervision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft text-center space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Find & Check Availability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Search gear by category and location. Our real-time calendar checks ensure no double-bookings occur.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft text-center space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Request & Confirm</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit your booking with pickup or delivery. The verified lender approves your request within hours.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft text-center space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pick Up & Return</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use the item for your shoot, camping trip or project. Return in original condition and leave a verified review.
            </p>
          </div>
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              Autonomous Marketplace Intelligence
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Delegate Tasks to Your AI Rental Assistant
            </h3>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Ask in plain language: "Find available cameras for 3 days under ৳1,500" or "Help me write a high-converting listing description".
            </p>
          </div>

          <button
            onClick={onOpenAgent}
            className="px-6 py-3.5 bg-white text-brand-700 hover:bg-brand-50 font-bold text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-brand-600" /> Launch AI Assistant
          </button>
        </div>
      </section>
    </div>
  );
};
