import { api } from './api';
import { AuthResponse, User } from '../types/auth';

export const authService = {
  async login(phoneOrEmail: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      phoneOrEmail,
      password,
    });
    return data;
  },

  async signup(payload: {
    fullName: string;
    email?: string;
    phoneNumber: string;
    password: string;
    role: 'farmer' | 'consumer' | 'distributor';
  }) {
    const { data } = await api.post<AuthResponse>('/auth/signup', payload);
    return data;
  },

  async completeOnboarding(payload: Record<string, unknown>) {
    const { data } = await api.put<{ message: string; user: User }>(
      '/auth/onboarding',
      payload
    );
    return data;
  },

  async getProfile() {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },

  async updateProfileImage(profileImage: string) {
    const { data } = await api.put<{ message: string; profileImage: string }>('/profile/image', {
      profileImage,
    });
    return data;
  },

  async updateProfile(payload: Record<string, unknown>) {
    const { data } = await api.put<{ message: string; user: User }>('/auth/profile', payload);
    return data;
  },
};

