import * as C from '../controllers/transactions.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/', C.getTransactions);
router.get('/stats', C.getTransactionStats);
router.get('/success-rate', C.getTransactionSuccessRate);
router.get('/revenue/by-category', C.getRevenueByCategory);
router.get('/revenue/stats', C.getRevenueStats);
router.get('/revenue', C.getTotalRevenue);

export default router;
