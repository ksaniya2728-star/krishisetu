import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { createNegotiation, respondNegotiation, negotiationHistory } from '../controllers/negotiationController.js';

const router = express.Router();

router.use(protect);

router.get('/history', negotiationHistory);
router.post('/create', authorizeRoles('consumer'), createNegotiation);
router.put('/respond', authorizeRoles('farmer'), respondNegotiation);

export default router;

