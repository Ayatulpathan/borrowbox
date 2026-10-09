import { api } from './api';
import { Booking, PricingBreakdown } from '../types';
import { mockDb } from './mockDb';

const isStatic = () => {
  return (
    !import.meta.env.VITE_API_URL ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('surge.sh') ||
    window.location.hostname.includes('netlify.app')
  );
};

export const bookingService = {
  async calculatePrice(params: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryOption?: 'pickup' | 'delivery';
  }): Promise<{ success: boolean; data: PricingBreakdown }> {
    if (isStatic()) {
      const listing = mockDb.getListingById(params.listingId);
      if (!listing) throw new Error('Listing not found');
      const data = mockDb.calculatePrice(listing, params.startDate, params.endDate, params.deliveryOption);
      return { success: true, data };
    }
    try {
      const res = await api.post('/bookings/calculate', params);
      return res.data;
    } catch (err) {
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
    if (isStatic()) {
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
    try {
      const res = await api.post('/bookings', data);
      return res.data;
    } catch (err) {
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
    const savedUser = localStorage.getItem('borrowbox_user');
    const userId = savedUser ? JSON.parse(savedUser).id : 'usr_arefin';
    const list = mockDb.getMyBookings(userId, params?.type);
    return { success: true, data: list };
  },

  async getBookingById(id: string): Promise<{ success: boolean; data: Booking; userRoleInBooking: 'renter' | 'owner' }> {
    const all = mockDb.getMyBookings('');
    const found = all.find((b) => b._id === id);
    if (!found) throw new Error('Booking not found');
    return { success: true, data: found, userRoleInBooking: 'renter' };
  },

  async updateBookingStatus(id: string, status: 'approved' | 'rejected' | 'active' | 'completed', reason?: string) {
    const updated = mockDb.updateBookingStatus(id, status);
    return { success: true, data: updated, message: `Status updated to ${status}` };
  },

  async cancelBooking(id: string, reason?: string) {
    const updated = mockDb.updateBookingStatus(id, 'cancelled');
    return { success: true, data: updated, message: 'Booking cancelled.' };
  },
};
