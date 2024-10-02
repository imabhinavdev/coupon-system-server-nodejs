import * as C from '../controllers/coupon.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', C.getCoupons);
router.post('/verify/:id', C.verifyCoupon);
router.get('/stats', adminMiddleware, C.getCouponStats);
router.get('/users-per-category', adminMiddleware, C.getUsersPerCouponCategory);
router.get('/used-per-day', adminMiddleware, C.getCouponsUsedPerDay);
router.get('/used-by-weekdays', adminMiddleware, C.getCouponStatsByWeekday);
router.post('/assign-coupon', adminMiddleware, C.assignCoupon);
export default router;
