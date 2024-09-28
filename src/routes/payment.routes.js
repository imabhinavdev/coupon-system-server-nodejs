import * as C from '../controllers/payment.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/order', C.generateOrder);
router.post('/verify', C.verifySignature);

export default router;
