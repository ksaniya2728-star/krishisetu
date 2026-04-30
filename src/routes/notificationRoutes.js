import express from 'express';
import { getNotifications, sendNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/send')
  .post(sendNotification);

export default router;
