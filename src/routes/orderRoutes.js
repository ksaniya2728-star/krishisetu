import express from 'express';
import { trackOrder, getOrderHistory, getOrdersSummary } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/history')
  .get(getOrderHistory);

router.route('/summary')
  .get(getOrdersSummary);

router.route('/:orderId')
  .get(trackOrder);

export default router;
