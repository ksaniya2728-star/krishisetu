import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { API_URL } from '../constants/config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed info for any non-2xx response
    if (error?.response) {
      console.warn(
        `[API ${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data?.message || ''
      );
    } else if (error?.config) {
      console.warn(`[API NETWORK] ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${error.message}`);
    }

    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    }
    return Promise.reject(error);
  }
);

