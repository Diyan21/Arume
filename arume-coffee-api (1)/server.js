import { serve } from '@hono/node-server';
import app from './src/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

console.log(`☕ Arume Coffee Backend API running on http://0.0.0.0:${PORT}`);

serve({
  fetch: (request) => app.fetch(request, process.env),
  port: PORT,
  hostname: '0.0.0.0',
});
