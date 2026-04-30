import express from 'express';
import { getNearbyProduce, addToCart, placeOrder, createCommunityBasket } from '../controllers/consumerController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('consumer'));

router.route('/nearby-produce')
  .get(getNearbyProduce);

router.route('/cart')
  .post(addToCart);

router.route('/place-order')
  .post(placeOrder);

router.route('/community-basket')
  .post(createCommunityBasket);

export default router;
