import * as C from '../controllers/transactions.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', C.getTransactions);
router.get('/stats', adminMiddleware, C.getTransactionStats);
router.get('/success-rate', adminMiddleware, C.getTransactionSuccessRate);
router.get('/revenue/by-category', adminMiddleware, C.getRevenueByCategory);
router.get('/revenue/stats', adminMiddleware, C.getRevenueStats);
router.get('/revenue', adminMiddleware, C.getTotalRevenue);

export default router;
