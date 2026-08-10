import { Router } from 'express';
import {
  createPayment,
  handleCallback,
  checkPaymentStatus,
} from '../controllers/paymentController.js';
import { validatePaymentCreateInput } from '../middleware/validate.js';

const router = Router();

// POST /api/payment/create - Create Duitku payment transaction
router.post('/create', validatePaymentCreateInput, createPayment);

// POST /api/payment/callback - Duitku callback/webhook endpoint
router.post('/callback', handleCallback);

// POST /api/payment/check - Check payment status
router.post('/check', checkPaymentStatus);

export default router;
