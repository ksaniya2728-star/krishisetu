import express from 'express';
import { updateProfileImage } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/image', protect, updateProfileImage);

export default router;
