import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.post('/send', sendMessage);
router.get('/history/:username', getChatHistory);

export default router;
