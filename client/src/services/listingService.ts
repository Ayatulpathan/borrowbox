import { api } from './api';
import { Listing } from '../types';

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
    const res = await api.get('/listings', { params });
    return res.data;
  },

  async getFeatured() {
    const res = await api.get('/listings/featured');
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/listings/categories');
    return res.data;
  },

  async getListingById(id: string): Promise<{ success: boolean; data: Listing; isFavorited: boolean }> {
    const res = await api.get(`/listings/${id}`);
    return res.data;
  },

  async createListing(data: Partial<Listing>) {
    const res = await api.post('/listings', data);
    return res.data;
  },

  async updateListing(id: string, data: Partial<Listing>) {
    const res = await api.patch(`/listings/${id}`, data);
    return res.data;
  },

  async deleteListing(id: string) {
    const res = await api.delete(`/listings/${id}`);
    return res.data;
  },

  async toggleFavorite(id: string) {
    const res = await api.post(`/listings/${id}/favorite`);
    return res.data;
  },

  async checkAvailability(id: string, startDate: string, endDate: string) {
    const res = await api.get(`/listings/${id}/availability`, {
      params: { startDate, endDate },
    });
    return res.data;
  },
};
