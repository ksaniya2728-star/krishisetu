import express from 'express';
import { getDeliveries, getDashboardStats, acceptDelivery, markPickedUp, markDelivered } from '../controllers/distributorController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('distributor'));

router.route('/dashboard')
  .get(getDashboardStats);

router.route('/deliveries')
  .get(getDeliveries);

router.route('/accept/:orderId')
  .put(acceptDelivery);

router.route('/pickup/:orderId')
  .put(markPickedUp);

router.route('/delivered/:orderId')
  .put(markDelivered);

export default router;
