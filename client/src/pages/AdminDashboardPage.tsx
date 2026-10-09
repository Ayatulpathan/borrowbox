import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Activity,
  Star,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [sRes, lRes, aRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllListings(),
        adminService.getAuditLogs(),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (lRes.success) setListings(lRes.data);
      if (aRes.success) setAuditLogs(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerate = async (id: string, data: { status?: string; isFeatured?: boolean }) => {
    try {
      await adminService.moderateListing(id, data);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error moderating listing');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Denied</h2>
        <p className="text-xs text-slate-500">You must be logged in as an administrator to access this moderation console.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-600" />
          Marketplace Administration & Trust Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">Platform overview, listing moderation, and security audit trail</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Platform Stat Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Listings</span>
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats?.totalListings || 0}</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Rentals</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats?.activeRentals || 0}</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Volume (GMV)</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-600">৳{stats?.totalVolumeBDT?.toLocaleString() || 0}</div>
            </div>
          </div>

          {/* Listings Moderation Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Listings Moderation Queue</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {listings.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/60">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={l.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=100'}
                          alt={l.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{l.title}</span>
                      </td>
                      <td className="p-3">{l.category}</td>
                      <td className="p-3">{l.owner?.name || 'Owner'}</td>
                      <td className="p-3 font-bold text-slate-900">৳{l.pricing?.daily}/d</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            l.status === 'published'
                              ? 'success'
                              : l.status === 'draft'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleModerate(l._id, { isFeatured: !l.isFeatured })}
                          className={`p-1 rounded-lg ${
                            l.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {l.status === 'published' ? (
                          <button
                            onClick={() => handleModerate(l._id, { status: 'paused' })}
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModerate(l._id, { status: 'published' })}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold"
                          >
                            Publish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600" />
              Security & Operations Audit Trail
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700">{log.action}</span>
                    <span className="text-slate-500">by {log.actor?.name || 'System / Guest'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
