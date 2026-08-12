import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback. Supabase redirects here with a `?code=...`
 * (PKCE). We exchange it for a session (which sets the auth cookies via the server
 * client) and then send the user on to `?redirect=` or the account dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const redirectParam = searchParams.get('redirect');
  const next = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/account';

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code or exchange failed — bounce back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
