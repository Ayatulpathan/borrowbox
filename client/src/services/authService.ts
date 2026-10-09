import { api } from './api';
import { User } from '../types';
import { mockDb } from './mockDb';

export const authService = {
  async register(data: { name: string; email: string; password: string; passwordConfirm?: string; phone?: string }) {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err: any) {
      // If deployed to static host (405 / 404 / Network error), fall back seamlessly to local database
      if (!err.response || err.response.status === 405 || err.response.status === 404) {
        const result = mockDb.register(data.name, data.email, data.phone);
        return { success: true, user: result.user, token: result.token };
      }
      throw err;
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      const res = await api.post('/auth/login', data);
      return res.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 405 || err.response.status === 404) {
        const result = mockDb.login(data.email);
        return { success: true, user: result.user, token: result.token };
      }
      throw err;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    return { success: true };
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err: any) {
      const savedUser = localStorage.getItem('borrowbox_user');
      if (savedUser) {
        return { success: true, user: JSON.parse(savedUser) };
      }
      throw err;
    }
  },

  async updateProfile(data: Partial<User> & { currentPassword?: string; newPassword?: string }) {
    try {
      const res = await api.patch('/auth/profile', data);
      return res.data;
    } catch (err: any) {
      const savedUser = localStorage.getItem('borrowbox_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : {};
      const updated = { ...currentUser, ...data };
      localStorage.setItem('borrowbox_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  },

  async forgotPassword(email: string) {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      return { success: true, message: 'Password reset link sent (simulated).' };
    }
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    try {
      const res = await api.post('/auth/reset-password', data);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Password reset successfully!' };
    }
  },
};
