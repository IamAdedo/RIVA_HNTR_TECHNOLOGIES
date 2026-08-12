import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Server-side Supabase client bound to the request cookies. Use this in Server
 * Components, Route Handlers, Server Actions, and API routes so queries run with
 * the logged-in user's session (RLS applies). It reads the anon key — privileged
 * work that must bypass RLS still uses `lib/supabaseAdmin.ts`.
 *
 * NOTE: `cookies()` is async in this Next.js version and must be awaited, so this
 * is an async factory. Cookie writes only succeed inside a Route Handler / Server
 * Action; during a Server Component render `setAll` is a no-op (wrapped in
 * try/catch) — session refresh there is handled by `proxy.ts` instead.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render — safe to ignore; the proxy
          // refreshes the session cookies on navigation.
        }
      },
    },
  });
}
