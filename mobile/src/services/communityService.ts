import { api } from './api';

export const communityService = {
  async list(status: string = 'open') {
    const { data } = await api.get('/community/list', { params: { status } });
    return data;
  },

  async create(payload: Record<string, unknown>) {
    const { data } = await api.post('/community/create', payload);
    return data;
  },

  async join(payload: Record<string, unknown>) {
    const { data } = await api.post('/community/join', payload);
    return data;
  },

  async updateLocation(payload: Record<string, unknown>) {
    const { data } = await api.put('/community/location', payload);
    return data;
  },
};

