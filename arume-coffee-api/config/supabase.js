import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are set
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'https://your-supabase-project-id.supabase.co' &&
  !supabaseUrl.includes('your-supabase')
);

if (!isConfigured) {
  console.warn(
    '⚠️ SUPABASE WARNING: Credentials not configured or using placeholder values in .env.'
  );
  console.warn('Backend is running in mock/in-memory mode for development and testing.');
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export { isConfigured };
