import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentRouter from './routes/payment.js';
import webhookRouter from './routes/webhook.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/response.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://arume-coffee.netlify.app';

// 1. Security & Middleware Configuration
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite preview and inline assets
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for Arume Coffee Frontend
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://arume-coffee.netlify.app',
    ];

    // Allow Netlify preview deploy URLs or wildcard match in development
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.run.app')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-signature'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 2. REST API Routes
app.get('/api/health', (req, res) => {
  return successResponse(res, 'Arume API is running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    duitku_mode: process.env.DUITKU_ENVIRONMENT || 'sandbox',
    supabase_configured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/webhook', webhookRouter);

// 3. Serve Frontend / Vite Middleware in development/AI Studio Preview
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.log('Vite middleware skipped in static mode');
  }
} else {
  // Static files fallback for production if build assets exist
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 4. Global Error Handlers
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// 5. Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==================================================
☕ ARUME COFFEE REST API IS RUNNING!
==================================================
 - Port: ${PORT}
 - Health Check: http://localhost:${PORT}/api/health
 - Allowed Frontend: ${FRONTEND_URL}
 - Duitku Mode: ${process.env.DUITKU_ENVIRONMENT || 'sandbox'}
==================================================
  `);
});

export default app;
