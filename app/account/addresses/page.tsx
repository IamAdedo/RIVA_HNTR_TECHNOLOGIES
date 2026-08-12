'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, RefreshCw, AlertCircle, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Address {
  id: string;
  label: string | null;
  recipient_name: string;
  phone_number: string;
  street: string;
  city: string;
  state: string | null;
  is_default: boolean;
}

const EMPTY_FORM = {
  label: '',
  recipient_name: '',
  phone_number: '',
  street: '',
  city: '',
  state: '',
  is_default: false,
};

const inputClass =
  'w-full text-sm bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors';

export default function AddressesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAddresses = useCallback(async () => {
    const { data, error: sbError } = await supabase
      .from('addresses')
      .select('id, label, recipient_name, phone_number, street, city, state, is_default')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (sbError) {
      setError(sbError.message);
    } else {
      setAddresses((data ?? []) as Address[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await fetchAddresses();
    })();
  }, [fetchAddresses]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (a: Address) => {
    setForm({
      label: a.label ?? '',
      recipient_name: a.recipient_name,
      phone_number: a.phone_number,
      street: a.street,
      city: a.city,
      state: a.state ?? '',
      is_default: a.is_default,
    });
    setEditingId(a.id);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Your session has expired. Please sign in again.');
      return;
    }
    if (!form.recipient_name || !form.phone_number || !form.street || !form.city) {
      setError('Please fill in the recipient, phone, street and city.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        label: form.label.trim() || null,
        recipient_name: form.recipient_name.trim(),
        phone_number: form.phone_number.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim() || null,
        is_default: form.is_default,
      };

      // Only one default per customer: clear the others first if this one is default.
      if (payload.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('customer_id', userId);
      }

      if (editingId) {
        const { error: sbError } = await supabase
          .from('addresses')
          .update(payload)
          .eq('id', editingId);
        if (sbError) throw sbError;
      } else {
        const { error: sbError } = await supabase
          .from('addresses')
          .insert({ ...payload, customer_id: userId });
        if (sbError) throw sbError;
      }

      await fetchAddresses();
      closeForm();
    } catch (err: any) {
      setError(err?.message || 'Could not save the address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const { error: sbError } = await supabase.from('addresses').delete().eq('id', id);
    if (sbError) {
      setError(sbError.message);
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (!userId) return;
    setError(null);
    await supabase.from('addresses').update({ is_default: false }).eq('customer_id', userId);
    const { error: sbError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);
    if (sbError) {
      setError(sbError.message);
      return;
    }
    fetchAddresses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-200">Address Book</h2>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add address
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add / edit form */}
      {showForm && (
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              {editingId ? 'Edit address' : 'New address'}
            </h3>
            <button type="button" onClick={closeForm} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. Home, Office"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Recipient Name</label>
              <input
                type="text"
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Phone Number</label>
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">City</label>
              <input
                type="text"
                placeholder="e.g. Ilorin"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block">Street Address</label>
              <input
                type="text"
                placeholder="House number, street, area"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">State (optional)</label>
              <input
                type="text"
                placeholder="e.g. Kwara State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
            />
            Set as default delivery address
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? 'Save changes' : 'Add address'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address list */}
      {loading ? (
        <div className="text-center py-14 text-sm text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading your addresses...
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="glass-panel rounded-xl border border-slate-800/80 text-center py-14 px-6">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No saved addresses yet.</p>
          <p className="text-xs text-slate-500 mt-1">Add one to speed up checkout next time.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`glass-panel p-5 rounded-xl border ${
                a.is_default ? 'border-indigo-500/40' : 'border-slate-800/80'
              } space-y-3`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-200">{a.label || 'Address'}</span>
                  {a.is_default && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-indigo-400" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    aria-label="Edit address"
                    className="p-1.5 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label="Delete address"
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-300 space-y-0.5">
                <p className="font-medium text-slate-200">{a.recipient_name}</p>
                <p className="text-slate-400">{a.phone_number}</p>
                <p className="text-slate-400">
                  {a.street}, {a.city}
                  {a.state ? `, ${a.state}` : ''}
                </p>
              </div>

              {!a.is_default && (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
