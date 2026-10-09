import { api } from './api';
import { Review } from '../types';

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
