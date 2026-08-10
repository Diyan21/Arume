import { Router } from 'express';
import { createOrder, getOrderByNumber } from '../controllers/orderController.js';
import { validateOrderInput } from '../middleware/validate.js';

const router = Router();

// POST /api/orders - Create new order
router.post('/', validateOrderInput, createOrder);

// GET /api/orders/:orderNumber - Get order details by order number
router.get('/:orderNumber', getOrderByNumber);

export default router;
