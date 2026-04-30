import express from 'express';
import { getMethods, addMethod, removeMethod, createPayment, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/methods')
  .get(getMethods);

router.route('/add-method')
  .post(addMethod);

router.route('/remove/:id')
  .delete(removeMethod);

router.route('/create')
  .post(createPayment);

router.route('/verify')
  .post(verifyPayment);

export default router;
