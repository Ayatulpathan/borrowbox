import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, Zap, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Package className="w-4 h-4" />
              </div>
              BorrowBox
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              BorrowBox is an AI-agent-powered peer-to-peer rental marketplace. Save money and cut waste by renting cameras, camping gear, tools, and tech on demand.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Powered by Google Gemini AI
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/explore?category=Cameras%20%26%20Photography" className="hover:text-white transition-colors">
                  Cameras & Photography
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Electronics%20%26%20Audio" className="hover:text-white transition-colors">
                  Audio & Projectors
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Outdoor%20%26%20Camping" className="hover:text-white transition-colors">
                  Camping & Outdoor Gear
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Tools%20%26%20DIY" className="hover:text-white transition-colors">
                  Tools & DIY
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Gaming%20%26%20VR" className="hover:text-white transition-colors">
                  Gaming Consoles & VR
                </Link>
              </li>
            </ul>
          </div>

          {/* For Lenders */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Lend & Earn</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/listings/new" className="hover:text-white transition-colors">
                  List Your Items
                </Link>
              </li>
              <li>
                <Link to="/agent" className="hover:text-white transition-colors flex items-center gap-1">
                  AI Listing Assistant <span className="text-[10px] bg-brand-900 text-brand-300 px-1.5 py-0.5 rounded">Smart</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Lender Protection Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Deposit & Security Escrow</span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Trust & Guarantee</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Verified profiles & national ID checks on all rentals.</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Double-validated availability prevents overlapping bookings.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 BorrowBox. Built for sustainable, circular gear sharing.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Rent Instead of Buy <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
