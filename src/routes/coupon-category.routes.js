import * as C from '../controllers/coupon-category.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', adminMiddleware, C.createCouponCategory);
router.get('/', adminMiddleware, C.getCouponCategory);
router.put('/', C.updateCouponCategory);
router.delete('/', C.deleteCouponCategory);

export default router;
