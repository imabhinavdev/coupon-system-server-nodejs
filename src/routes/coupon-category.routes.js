import * as C from '../controllers/coupon-category.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', C.getCouponCategory);
router.post('/', C.createCouponCategory);
router.put('/:id', C.updateCouponCategory);
router.delete('/:id', C.deleteCouponCategory);

export default router;
