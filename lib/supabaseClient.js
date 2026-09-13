// lib/supabaseClient.js
//
// One shared Supabase client for the whole storefront. Uses the public
// anon key (same as MySkin's app) -- all real security enforcement
// happens via RLS and the Edge Functions we already built and tested,
// not by hiding this key (it's meant to be public).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at build/runtime rather than silently making broken
  // requests -- makes a missing environment variable obvious immediately.
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set these in Vercel project settings.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
