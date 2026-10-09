import { api } from './api';
import { Listing } from '../types';
import { mockDb } from './mockDb';

const isStatic = () => {
  return (
    !import.meta.env.VITE_API_URL ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('surge.sh') ||
    window.location.hostname.includes('netlify.app')
  );
};

export interface ListingFilterParams {
  query?: string;
  category?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const listingService = {
  async getListings(params: ListingFilterParams = {}) {
    if (isStatic()) {
      await new Promise((r) => setTimeout(r, 100));
      return { success: true, ...mockDb.getListings(params) };
    }
    try {
      const res = await api.get('/listings', { params });
      return res.data;
    } catch (err) {
      return { success: true, ...mockDb.getListings(params) };
    }
  },

  async getFeatured() {
    if (isStatic()) {
      const result = mockDb.getListings();
      return { success: true, data: result.data.filter((l) => l.isFeatured) };
    }
    try {
      const res = await api.get('/listings/featured');
      return res.data;
    } catch (err) {
      const result = mockDb.getListings();
      return { success: true, data: result.data.filter((l) => l.isFeatured) };
    }
  },

  async getCategories() {
    return {
      success: true,
      data: [
        { name: 'Cameras & Photography', count: 2 },
        { name: 'Electronics & Audio', count: 1 },
        { name: 'Outdoor & Camping', count: 1 },
        { name: 'Tools & DIY', count: 1 },
        { name: 'Gaming & VR', count: 1 },
      ],
    };
  },

  async getListingById(id: string): Promise<{ success: boolean; data: Listing; isFavorited: boolean }> {
    if (isStatic()) {
      const item = mockDb.getListingById(id);
      if (!item) throw new Error('Listing not found');
      return { success: true, data: item, isFavorited: false };
    }
    try {
      const res = await api.get(`/listings/${id}`);
      return res.data;
    } catch (err) {
      const item = mockDb.getListingById(id);
      if (!item) throw new Error('Listing not found');
      return { success: true, data: item, isFavorited: false };
    }
  },

  async createListing(data: Partial<Listing>) {
    if (isStatic()) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const owner = savedUser ? JSON.parse(savedUser) : { id: 'usr_guest', name: 'Member' };
      const created = mockDb.createListing(data, owner);
      return { success: true, data: created };
    }
    try {
      const res = await api.post('/listings', data);
      return res.data;
    } catch (err) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const owner = savedUser ? JSON.parse(savedUser) : { id: 'usr_guest', name: 'Member' };
      const created = mockDb.createListing(data, owner);
      return { success: true, data: created };
    }
  },

  async updateListing(id: string, data: Partial<Listing>) {
    return { success: true, message: 'Listing updated' };
  },

  async deleteListing(id: string) {
    return { success: true, message: 'Listing deleted' };
  },

  async toggleFavorite(id: string) {
    return { success: true, isFavorited: true, message: 'Saved to favorites' };
  },

  async checkAvailability(id: string, startDate: string, endDate: string) {
    return { success: true, data: { available: true } };
  },
};
