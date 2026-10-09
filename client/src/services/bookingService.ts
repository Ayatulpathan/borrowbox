import { api } from './api';
import { Booking, PricingBreakdown } from '../types';

export const bookingService = {
  async calculatePrice(params: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
  }): Promise<{ success: boolean; data: PricingBreakdown }> {
    const res = await api.post('/bookings/calculate', params);
    return res.data;
  },

  async createBooking(data: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
    deliveryAddress?: string;
    specialInstructions?: string;
  }): Promise<{ success: boolean; message: string; data: Booking }> {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  async getMyBookings(params?: { type?: 'renter' | 'owner'; status?: string }): Promise<{ success: boolean; data: Booking[] }> {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  async getBookingById(id: string): Promise<{ success: boolean; data: Booking; userRoleInBooking: 'renter' | 'owner' }> {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async updateBookingStatus(id: string, status: 'approved' | 'rejected' | 'active' | 'completed', reason?: string) {
    const res = await api.patch(`/bookings/${id}/status`, { status, reason });
    return res.data;
  },

  async cancelBooking(id: string, reason?: string) {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};
