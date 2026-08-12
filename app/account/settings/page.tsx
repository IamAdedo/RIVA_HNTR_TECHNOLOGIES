'use client';

import React, { useEffect, useState } from 'react';
import { Settings, User, Phone, Mail, Lock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const inputClass =
  'w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', user.id)
          .single();
        if (profile) {
          setFullName(profile.full_name ?? '');
          setPhone(profile.phone_number ?? '');
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!fullName.trim() || !phone.trim()) {
      setProfileMsg({ type: 'err', text: 'Name and phone number are required.' });
      return;
    }
    try {
      setSavingProfile(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Your session has expired. Please sign in again.');

      const { error: sbError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone_number: phone.trim() })
        .eq('id', user.id);
      if (sbError) throw sbError;
      setProfileMsg({ type: 'ok', text: 'Profile updated.' });
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err?.message || 'Could not update your profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (password.length < 6) {
      setPasswordMsg({ type: 'err', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMsg({ type: 'err', text: 'Passwords do not match.' });
      return;
    }
    try {
      setSavingPassword(true);
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw sbError;
      setPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'ok', text: 'Password changed.' });
    } catch (err: any) {
      setPasswordMsg({ type: 'err', text: err?.message || 'Could not change your password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-14 text-sm text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-slate-200">Settings</h2>
      </div>

      {/* Profile */}
      <form onSubmit={handleProfileSave} className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-5">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">Profile Details</h3>

        {profileMsg && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-lg border text-sm ${
              profileMsg.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {profileMsg.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {profileMsg.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              required
            />
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
          <div className="relative">
            <input type="email" value={email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
          <p className="text-[11px] text-slate-500">Your email is used to sign in and can&apos;t be changed here.</p>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
        >
          {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save changes
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordSave} className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-5">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">Change Password</h3>

        {passwordMsg && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-lg border text-sm ${
              passwordMsg.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {passwordMsg.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {passwordMsg.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block">New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block">Confirm New Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
        >
          {savingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update password
        </button>
      </form>
    </div>
  );
}
