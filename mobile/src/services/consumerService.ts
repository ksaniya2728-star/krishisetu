import { api } from './api';

export const consumerService = {
  async getNearbyProduce(params?: Record<string, unknown>) {
    const { data } = await api.get('/consumer/nearby-produce', { params });
    return data;
  },

  async getProductDetail(productId: string, params?: Record<string, unknown>) {
    const { data } = await api.get(`/products/${productId}`, { params });
    return data;
  },

  async getCart() {
    const { data } = await api.get('/cart');
    return data;
  },

  async addToCart(produceId: string, quantity: number) {
    const { data } = await api.post('/cart/add', { produceId, quantity });
    return data;
  },

  async removeFromCart(produceId: string) {
    const { data } = await api.delete('/cart/remove', { data: { produceId } });
    return data;
  },

  async placeOrder(payload: Record<string, unknown>) {
    const { data } = await api.post('/consumer/place-order', payload);
    return data;
  },

  async getOrderHistory() {
    const { data } = await api.get('/orders/history');
    return data;
  },

  async trackOrder(orderId: string) {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  async getDistance(payload: Record<string, number>) {
    const { data } = await api.post('/maps/distance', payload);
    return data;
  },

  async createCommunityBasket(payload: Record<string, unknown>) {
    const { data } = await api.post('/consumer/community-basket', payload);
    return data;
  },
};

