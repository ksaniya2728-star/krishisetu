import { api } from './api';

export const chatService = {
  async history(userId: string) {
    const { data } = await api.get(`/chat/history/${userId}`);
    return data;
  },

  async send(toUserId: string, text: string) {
    const { data } = await api.post('/chat/send', { toUserId, text });
    return data;
  },

  async sendVoice(toUserId: string, voiceUrl: string, durationMs?: number) {
    const { data } = await api.post('/chat/voice', { toUserId, voiceUrl, durationMs });
    return data;
  },
};

