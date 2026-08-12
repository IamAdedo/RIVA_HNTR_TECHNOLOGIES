import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing from environment variables.');
}

/**
 * Browser Supabase client. Uses `@supabase/ssr` so the auth session is stored in
 * cookies (not localStorage) and is therefore readable by the server — the proxy,
 * server components, route handlers, and API routes all share this session.
 * Exported as a shared singleton; all existing `import { supabase }` call sites
 * keep working unchanged.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
