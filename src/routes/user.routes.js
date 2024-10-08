import * as C from '../controllers/user.controller.js';
import { Router } from 'express';
import { adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', C.getUser);
router.post('/', C.createUser);
router.put('/:id', C.updateUser);
router.delete('/:id', C.deleteUser);
router.get('/active-status', C.getUserActiveStatus);
router.get('/stats/new-users', C.getNewUsersStats);
router.get('/all-details/:id', C.getUserAllDetails);

export default router;
