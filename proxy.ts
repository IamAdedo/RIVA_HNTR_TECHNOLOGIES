import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy (formerly "middleware" — renamed in Next.js 16, runs on the Node runtime).
 * Two jobs on every matched request:
 *   1. Refresh the Supabase auth session and write the rotated cookies onto the
 *      response so server components see a valid session.
 *   2. Gate the customer account area: unauthenticated visitors to `/account*`
 *      are redirected to `/login?redirect=<path>`.
 *
 * Cookie handling follows the @supabase/ssr pattern: mirror cookies onto both the
 * request (for any downstream read this pass) and a freshly-created response.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() revalidates the token with Supabase (not just decodes it)
  // and triggers the cookie refresh above. Do not add logic between this and the
  // response return that could short-circuit the refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/account')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.search = '';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);

    const redirect = NextResponse.redirect(redirectUrl);
    // Carry any refreshed session cookies onto the redirect response.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  // Run on everything except Next internals, the API, and static asset files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)'],
};
