import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import AccountNav from './AccountNav';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your RIVA HNTR Technologies orders, repairs, solar projects, addresses and profile.',
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces with the proxy gate: never render the shell without a user.
  if (!user) {
    redirect('/login?redirect=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number')
    .eq('id', user.id)
    .single();

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">My Account</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
          Welcome back, {displayName.split(' ')[0]}
        </h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="glass-panel p-5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <UserCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {profile?.full_name || 'RIVA HNTR Customer'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-xl border border-slate-800/80">
            <AccountNav />
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3 min-w-0">{children}</main>
      </div>
    </div>
  );
}
