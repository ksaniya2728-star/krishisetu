import express from 'express';
import multer from 'multer';
import path from 'path';
import { addProduce, updateProduce, deleteProduce, getFarmerOrders, getFarmerDashboard, getFarmerEarnings } from '../controllers/farmerController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Multer config for local disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.use(protect);
router.use(authorizeRoles('farmer'));

router.route('/produce')
  .post(upload.single('image'), addProduce);

router.route('/produce/:id')
  .put(updateProduce)
  .delete(deleteProduce);

router.route('/orders')
  .get(getFarmerOrders);

router.route('/dashboard')
  .get(getFarmerDashboard);

router.route('/earnings')
  .get(getFarmerEarnings);

export default router;
