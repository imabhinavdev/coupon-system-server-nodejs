import * as C from '../controllers/coupon.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', C.getCoupons);
router.post('/verify/:id', C.verifyCoupon);
router.get('/stats', C.getCouponStats);
router.get('/users-per-category', C.getUsersPerCouponCategory);
router.get('/used-per-day', C.getCouponsUsedPerDay);
router.get('/used-by-weekdays', C.getCouponStatsByWeekday);
router.post('/assign-coupon', C.assignCoupon);
export default router;
