import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';

const router = Router();

// GET /api/products - Get all active products
router.get('/', getProducts);

// GET /api/products/:id - Get product detail
router.get('/:id', getProductById);

export default router;
