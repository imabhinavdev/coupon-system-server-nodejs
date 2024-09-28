import * as C from '../controllers/auth.controller.js';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signUp', C.signUp);
router.post('/login', C.login);
router.post('/logout', C.logout);
router.get('/whoami', authMiddleware, C.whoAmI);

export default router;
