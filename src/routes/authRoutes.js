import express from 'express';
import { signup, login, getProfile, updateProfile, logout, onboarding } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.put('/onboarding', protect, onboarding);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
