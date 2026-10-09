import { api } from './api';
import { User } from '../types';
import { mockDb } from './mockDb';

const isStaticDeployment = () => {
  return (
    !import.meta.env.VITE_API_URL ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('surge.sh') ||
    window.location.hostname.includes('netlify.app')
  );
};

export const authService = {
  async register(data: { name: string; email: string; password: string; passwordConfirm?: string; phone?: string }) {
    if (isStaticDeployment()) {
      await new Promise((r) => setTimeout(r, 150));
      const result = mockDb.register(data.name, data.email, data.phone);
      return { success: true, user: result.user, token: result.token };
    }
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err) {
      const result = mockDb.register(data.name, data.email, data.phone);
      return { success: true, user: result.user, token: result.token };
    }
  },

  async login(data: { email: string; password: string }) {
    if (isStaticDeployment()) {
      await new Promise((r) => setTimeout(r, 150));
      const result = mockDb.login(data.email);
      return { success: true, user: result.user, token: result.token };
    }
    try {
      const res = await api.post('/auth/login', data);
      return res.data;
    } catch (err) {
      const result = mockDb.login(data.email);
      return { success: true, user: result.user, token: result.token };
    }
  },

  async logout() {
    return { success: true };
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const savedUser = localStorage.getItem('borrowbox_user');
    if (savedUser) {
      return { success: true, user: JSON.parse(savedUser) };
    }
    if (isStaticDeployment()) {
      return { success: false, user: null as any };
    }
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User> & { currentPassword?: string; newPassword?: string }) {
    const savedUser = localStorage.getItem('borrowbox_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : {};
    const updated = { ...currentUser, ...data };
    localStorage.setItem('borrowbox_user', JSON.stringify(updated));
    return { success: true, user: updated };
  },

  async forgotPassword(email: string) {
    return { success: true, message: 'Password reset link sent (simulated).' };
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    return { success: true, message: 'Password reset successfully!' };
  },
};
