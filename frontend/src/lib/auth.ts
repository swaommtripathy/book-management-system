import api from './api';
import Cookies from 'js-cookie';
import { LoginFormData, RegisterFormData, User } from '@/types';

export const authService = {
  async login(data: LoginFormData) {
    const res = await api.post('/api/auth/login', data);
    const { access_token, user } = res.data;
    Cookies.set('token', access_token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    return { token: access_token, user };
  },

  async register(data: RegisterFormData) {
    const res = await api.post('/api/auth/register', data);
    const { access_token, user } = res.data;
    Cookies.set('token', access_token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    return { token: access_token, user };
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/api/auth/profile');
    return res.data;
  },

  logout() {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = Cookies.get('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
  },

  getToken(): string | null {
    return Cookies.get('token') || null;
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  },
};
