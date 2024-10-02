import * as C from '../controllers/user.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', adminMiddleware, C.getUser);
router.post('/', adminMiddleware, C.createUser);
router.put('/:id', adminMiddleware, C.updateUser);
router.delete('/:id', adminMiddleware, C.deleteUser);
router.get('/active-status', adminMiddleware, C.getUserActiveStatus);
router.get('/stats/new-users', adminMiddleware, C.getNewUsersStats);
router.get('/all-details/:id', adminMiddleware, C.getUserAllDetails);

export default router;
