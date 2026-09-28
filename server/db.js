import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabaseClient = null;

export const getSupabase = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error(
      'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.'
    );
  }

  supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
};
