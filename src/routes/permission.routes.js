import * as C from '../controllers/permission.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/', C.createPermission);
router.get('/', C.getPermissions);
router.delete('/:id', C.deletePermission);

export default router;
