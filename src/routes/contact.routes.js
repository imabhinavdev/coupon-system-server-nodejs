import { Router } from 'express';
import * as C from '../controllers/contact.controller.js';

const router = Router();

router.post('/', C.createContactFormResponse);

export default router;
