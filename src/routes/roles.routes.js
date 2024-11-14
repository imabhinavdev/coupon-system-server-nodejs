import * as C from '../controllers/role.controller.js';
import { Router } from 'express';

const router = Router();

router.post('/', C.createRole);
router.get('/', C.getRoles);
router.get('/:id', C.getRoleById);
router.delete('/:id', C.deleteRole);
router.put('/:id', C.updateRole);

export default router;
