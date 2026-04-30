import express from 'express';
import { getProductById } from '../controllers/productController.js';

const router = express.Router();

router.route('/:id').get(getProductById);

export default router;

