import { api } from './api';
import { NotificationItem, Review } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{ success: boolean; data: NotificationItem[]; unreadCount: number }> {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

export const reviewService = {
  async createReview(data: { bookingId: string; rating: number; comment: string }): Promise<{ success: boolean; data: Review }> {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  async getListingReviews(listingId: string): Promise<{ success: boolean; data: Review[] }> {
    const res = await api.get(`/reviews/listing/${listingId}`);
    return res.data;
  },
};

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
