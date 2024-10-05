import { Router } from 'express';
import * as C from '../controllers/settings.controller.js';

const router = Router();

router.get('/footer', C.GetFooter);
router.post('/footer', C.UpdateFooter);
router.get('/website-name', C.GetWebsiteName);
router.post('/website-name', C.UpdateWebsiteName);

export default router;

