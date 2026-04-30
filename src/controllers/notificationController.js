import Notification from '../models/Notification.js';

// @desc    Fetch notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort('-createdAt');

  res.json({ count: notifications.length, notifications });
};

// @desc    Create notification
// @route   POST /api/notifications/send
// @access  Private
const sendNotification = async (req, res) => {
  const { targetUserId, type, title, message, metadata } = req.body;

  // In a real system, you might restrict who can create notifications (e.g. only system/admin)
  // But per requirements we allow it.
  
  const notification = await Notification.create({
    userId: targetUserId || req.user._id,
    type,
    title,
    message,
    metadata
  });

  res.status(201).json({ message: 'Notification sent', notification });
};

export { getNotifications, sendNotification };
