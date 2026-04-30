import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { createCommunity, joinCommunity, updateCommunityLocation, listCommunity } from '../controllers/communityController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('consumer'));

router.post('/create', createCommunity);
router.get('/list', listCommunity);
router.post('/join', joinCommunity);
router.put('/location', updateCommunityLocation);

export default router;

