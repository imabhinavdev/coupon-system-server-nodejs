import * as C from '../controllers/auth.controller.js';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signUp', C.signUp);
router.post('/login', C.login);
router.post('/verify', C.verifyOTP);
router.post('/logout', C.logout);
router.get('/whoami', authMiddleware, C.whoAmI);
router.post('/forgot-password', C.ForgotOTPEmail);
router.post('/reset-password', C.ResetPassword);

export default router;
