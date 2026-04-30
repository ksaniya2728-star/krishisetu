import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const chatMessageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    threadId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    text: {
      type: String,
      default: '',
      set: encrypt,
      get: decrypt,
    },
    voice: {
      url: { type: String, default: '', set: encrypt, get: decrypt },
      durationMs: { type: Number, default: 0 },
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });

chatMessageSchema.set('toJSON', { getters: true });
chatMessageSchema.set('toObject', { getters: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;

