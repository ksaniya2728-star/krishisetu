import { api } from './api';

export const farmerService = {
  async getDashboard() {
    const { data } = await api.get('/farmer/dashboard');
    return data;
  },

  async getOrders() {
    const { data } = await api.get('/farmer/orders');
    return data;
  },

  async getEarnings() {
    const { data } = await api.get('/farmer/earnings');
    return data;
  },

  async addProduce(payload: FormData | Record<string, unknown>) {
    const { data } = await api.post('/farmer/produce', payload);
    return data;
  },
};

