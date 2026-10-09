import { api } from './api';
import { User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; passwordConfirm?: string; phone?: string }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User> & { currentPassword?: string; newPassword?: string }) {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
};
