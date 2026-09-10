import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL. Add it in Vercel: Project Settings > Environment Variables.'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY. Add it in Vercel: Project Settings > Environment Variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
