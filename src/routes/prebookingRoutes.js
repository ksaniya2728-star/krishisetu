import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { createPreBooking, listPreBookings, reservePreBooking } from '../controllers/prebookingController.js';

const router = express.Router();

router.use(protect);

router.get('/list', listPreBookings);
router.post('/create', authorizeRoles('farmer'), createPreBooking);
router.post('/reserve', authorizeRoles('consumer'), reservePreBooking);

export default router;

