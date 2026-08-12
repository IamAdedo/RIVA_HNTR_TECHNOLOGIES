'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, RefreshCw, AlertCircle, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.63-2.53C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.8 6.42 2.8 11.6S6.9 21 12 21c5.9 0 9.4-4.14 9.4-9.28 0-.62-.07-1.1-.16-1.58H12z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState('/account');

  // Read the post-login destination from `?redirect=` (set by the proxy gate),
  // and surface a failed OAuth/confirmation callback (`?error=auth`).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('redirect');
    if (target && target.startsWith('/')) setRedirectTo(target);
    if (params.get('error') === 'auth') {
      setError('Sign-in could not be completed. Please try again.');
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
      if (sbError) throw sbError;
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const callback = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      const { error: sbError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callback },
      });
      if (sbError) throw sbError;
      // On success the browser is redirected to Google, so nothing else runs here.
    } catch (err: any) {
      setError(err?.message || 'Google sign-in is unavailable right now.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Welcome back</span>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-1">Sign in to your account</h1>
        <p className="text-sm text-slate-400 mt-2">
          Track your orders, repairs, and solar projects in one place.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-white text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {googleLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] uppercase font-semibold text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}
