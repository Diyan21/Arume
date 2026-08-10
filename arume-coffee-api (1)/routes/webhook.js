import { Router } from 'express';
import { handleCallback } from '../controllers/paymentController.js';

const router = Router();

// POST /api/webhook/duitku - Alias for Duitku payment callback
router.post('/duitku', handleCallback);

export default router;
