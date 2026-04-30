import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.socket?.emit('join', { userId });
    });

    // Register all standard events to forward to local listeners
    const events = [
      'order:new', 'order:update', 'produce:new', 'pool:update', 'chat:message',
      'delivery:assigned', 'delivery_accepted', 'delivery_completed',
      'new_delivery_assigned', 'pickup_confirmed', 'delivered'
    ];
    
    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    return () => {
      this.unsubscribe(event, callback);
    };
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event) || [];
    this.listeners.set(event, callbacks.filter(cb => cb !== callback));
  }
}

export const socketService = new SocketService();
