import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabaseClient: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);