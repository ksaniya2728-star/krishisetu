import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('consumer'));

router.route('/').get(getCart);
router.route('/add').post(addToCart);
router.route('/remove').delete(removeFromCart);

export default router;

