'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, RefreshCw, AlertCircle, Mail, Lock, User, Phone, MailCheck } from 'lucide-react';
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

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/account');

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('redirect');
    if (target && target.startsWith('/')) setRedirectTo(target);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password) {
      setError('Please fill in all the fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // full_name + phone_number are read by the DB trigger (handle_new_user)
      // to populate the profiles row — do not insert into profiles manually.
      const { data, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone_number: phone },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (sbError) throw sbError;

      if (data.session) {
        // Email confirmation disabled → already signed in.
        router.push(redirectTo);
        router.refresh();
      } else {
        // Confirmation required → prompt the user to verify their email.
        setCheckEmail(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to create your account. Please try again.');
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
    } catch (err: any) {
      setError(err?.message || 'Google sign-up is unavailable right now.');
      setGoogleLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:px-6">
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto">
            <MailCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-200">Confirm your email</h1>
          <p className="text-sm text-slate-400">
            We&apos;ve sent a confirmation link to <span className="text-slate-200 font-semibold">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold text-white transition-all text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Get started</span>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-1">Create your account</h1>
        <p className="text-sm text-slate-400 mt-2">
          Save your details and follow every order, repair, and solar project.
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

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
                placeholder="At least 6 characters"
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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
