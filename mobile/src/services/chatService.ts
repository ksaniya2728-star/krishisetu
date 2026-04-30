import { api } from './api';

export const chatService = {
  async history(username: string) {
    const { data } = await api.get(`/chat/history/${username}`);
    return data;
  },

  async send(toUsername: string, text: string, type: 'text' | 'voice' = 'text', voiceUrl?: string, durationMs?: number) {
    const { data } = await api.post('/chat/send', { toUsername, text, type, voiceUrl, durationMs });
    return data;
  },
};

