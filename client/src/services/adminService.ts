import { api } from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getAllListings() {
    const res = await api.get('/admin/listings');
    return res.data;
  },

  async moderateListing(id: string, data: { status?: string; isFeatured?: boolean }) {
    const res = await api.patch(`/admin/listings/${id}`, data);
    return res.data;
  },

  async getAllUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};
