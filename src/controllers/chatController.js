import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  const { toUsername, type, text, voiceUrl, durationMs } = req.body;

  if (!toUsername) {
    res.status(400);
    throw new Error('Receiver username is required');
  }

  const receiver = await User.findOne({ username: toUsername });
  if (!receiver) {
    res.status(404);
    throw new Error('User not found');
  }

  // Create deterministic thread ID (smaller ID first)
  const sortedIds = [req.user._id.toString(), receiver._id.toString()].sort();
  const threadId = `${sortedIds[0]}_${sortedIds[1]}`;

  const message = await ChatMessage.create({
    fromUserId: req.user._id,
    toUserId: receiver._id,
    threadId,
    type: type || 'text',
    text: text || '',
    voice: type === 'voice' ? { url: voiceUrl, durationMs } : undefined,
  });

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(receiver._id.toString()).emit('chat:message', message);
  }

  res.status(201).json({ message });
};

// @desc    Get chat history with a user
// @route   GET /api/chat/history/:username
// @access  Private
export const getChatHistory = async (req, res) => {
  const { username } = req.params;

  const receiver = await User.findOne({ username });
  if (!receiver) {
    res.status(404);
    throw new Error('User not found');
  }

  const sortedIds = [req.user._id.toString(), receiver._id.toString()].sort();
  const threadId = `${sortedIds[0]}_${sortedIds[1]}`;

  const messages = await ChatMessage.find({ threadId })
    .sort({ createdAt: 1 })
    .populate('fromUserId', 'fullName username profileImage')
    .populate('toUserId', 'fullName username profileImage');

  res.json({ messages });
};
