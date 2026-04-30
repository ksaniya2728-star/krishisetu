import express from 'express';
import { calculateDistance } from '../controllers/mapsController.js';

const router = express.Router();

router.route('/distance')
  .post(calculateDistance);

export default router;
