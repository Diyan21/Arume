import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  'https://hkkjdcsgdwfxezuhvqgb.supabase.co';

const supabasePublishableKey =
  'sb_publishable_v1923e4nsGYjeTrLQVQZbA_4F3xRSnx';

export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
