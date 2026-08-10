import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getProducts, getProductById } from './controllers/products.js';
import { createOrder, getOrderByNumber } from './controllers/orders.js';
import { createPayment, handlePaymentCallback, checkPaymentStatus } from './controllers/payment.js';
import { successResponse, errorResponse } from './utils/response.js';

const app = new Hono();

/**
 * CORS Middleware compatible with Cloudflare Workers
 */
app.use('*', async (c, next) => {
  const allowedFrontend = c.env?.FRONTEND_URL || 'https://arume-coffee.netlify.app';

  const corsMiddleware = cors({
    origin: (origin) => {
      // If no origin, return wildcard
      if (!origin) return '*';
      
      // Allow Netlify production frontend, localhost dev, Workers preview, or custom FRONTEND_URL
      if (
        origin === allowedFrontend ||
        origin.includes('localhost') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.run.app')
      ) {
        return origin;
      }
      return allowedFrontend;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-signature'],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (c) => {
  const supabaseConnected = Boolean(
    c.env?.SUPABASE_URL && 
    c.env?.SUPABASE_SERVICE_ROLE_KEY && 
    !c.env.SUPABASE_URL.includes('your-project')
  );

  return successResponse(c, 'Arume Coffee API Cloudflare Worker is running smoothly', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'Cloudflare Workers (Edge)',
    services: {
      supabase_database: supabaseConnected ? 'configured' : 'mock_mode',
      payment_gateway: c.env?.MIDTRANS_SERVER_KEY ? 'midtrans_sandbox' : 'mock_mode',
    },
  });
});

/**
 * Products Routes
 */
app.get('/api/products', getProducts);
app.get('/api/products/:id', getProductById);

/**
 * Orders Routes
 */
app.post('/api/orders', createOrder);
app.get('/api/orders/:orderNumber', getOrderByNumber);

/**
 * Payment Routes
 */
app.post('/api/payment/create', createPayment);
app.post('/api/payment/callback', handlePaymentCallback);
app.post('/api/payment/check', checkPaymentStatus);

/**
 * Global 404 Route Handler
 */
app.notFound((c) => {
  return errorResponse(c, 'Endpoint API tidak ditemukan', `Route ${c.req.method} ${c.req.path} not found`, 404);
});

/**
 * Global Error Handler
 */
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);
  return errorResponse(c, 'Terjadi kesalahan internal pada server Worker', err.message, 500);
});

/**
 * Export default for Cloudflare Workers
 * Cloudflare Workers runtime automatically invokes default.fetch(request, env, ctx)
 */
export default app;
