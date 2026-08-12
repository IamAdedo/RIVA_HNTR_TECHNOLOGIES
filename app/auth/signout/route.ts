import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Sign the current user out. Invoked by the account shell's sign-out form
 * (`<form action="/auth/signout" method="post">`). `signOut()` clears the auth
 * cookies via the server client, then we redirect home.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${request.nextUrl.origin}/`, { status: 303 });
}
