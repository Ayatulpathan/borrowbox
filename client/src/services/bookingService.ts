import { api } from './api';
import { Booking, PricingBreakdown } from '../types';
import { mockDb } from './mockDb';

export const bookingService = {
  async calculatePrice(params: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
  }): Promise<{ success: boolean; data: PricingBreakdown }> {
    try {
      const res = await api.post('/bookings/calculate', params);
      return res.data;
    } catch (err: any) {
      const listing = mockDb.getListingById(params.listingId);
      if (!listing) throw new Error('Listing not found');
      const data = mockDb.calculatePrice(listing, params.startDate, params.endDate, params.deliveryOption);
      return { success: true, data };
    }
  },

  async createBooking(data: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
    deliveryAddress?: string;
    specialInstructions?: string;
  }): Promise<{ success: boolean; message: string; data: Booking }> {
    try {
      const res = await api.post('/bookings', data);
      return res.data;
    } catch (err: any) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const renter = savedUser ? JSON.parse(savedUser) : { id: 'usr_guest', name: 'Member' };
      const booking = mockDb.createBooking({
        listingId: data.listingId,
        renter,
        startDate: data.startDate,
        endDate: data.endDate,
        deliveryOption: data.deliveryOption,
        specialInstructions: data.specialInstructions,
      });
      return { success: true, message: 'Booking request sent successfully!', data: booking };
    }
  },

  async getMyBookings(params?: { type?: 'renter' | 'owner'; status?: string }): Promise<{ success: boolean; data: Booking[] }> {
    try {
      const res = await api.get('/bookings', { params });
      return res.data;
    } catch (err: any) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'usr_arefin';
      const list = mockDb.getMyBookings(userId, params?.type);
      return { success: true, data: list };
    }
  },

  async getBookingById(id: string): Promise<{ success: boolean; data: Booking; userRoleInBooking: 'renter' | 'owner' }> {
    try {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    } catch (err: any) {
      const all = mockDb.getMyBookings('');
      const found = all.find((b) => b._id === id);
      if (!found) throw new Error('Booking not found');
      return { success: true, data: found, userRoleInBooking: 'renter' };
    }
  },

  async updateBookingStatus(id: string, status: 'approved' | 'rejected' | 'active' | 'completed', reason?: string) {
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status, reason });
      return res.data;
    } catch (err: any) {
      const updated = mockDb.updateBookingStatus(id, status);
      return { success: true, data: updated, message: `Status updated to ${status}` };
    }
  },

  async cancelBooking(id: string, reason?: string) {
    try {
      const res = await api.post(`/bookings/${id}/cancel`, { reason });
      return res.data;
    } catch (err: any) {
      const updated = mockDb.updateBookingStatus(id, 'cancelled');
      return { success: true, data: updated, message: 'Booking cancelled.' };
    }
  },
};
