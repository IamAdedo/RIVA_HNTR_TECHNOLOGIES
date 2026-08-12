'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, Calendar, ClipboardList, ShieldAlert, CheckCircle2, MessageSquareCode } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';

interface AuditLog {
  id: string;
  status: string;
  notes: string;
  created_at: string;
}

interface EntityData {
  id: string;
  tracking_number?: string;
  ticket_number?: string;
  project_number?: string;
  device_model?: string;
  property_type?: string;
  current_status: string;
  created_at: string;
  total_amount?: number;
  estimated_cost?: number;
}

function TrackingInterface() {
  const searchParams = useSearchParams();
  
  const [trackingId, setTrackingId] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    entityType: 'order' | 'repair' | 'solar';
    entity: EntityData;
    timeline: AuditLog[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setWhatsAppMessage = useCartStore((state) => state.setWhatsAppMessage);

  // Auto-run if URL contains query params
  useEffect(() => {
    const urlId = searchParams.get('id');
    const urlPhone = searchParams.get('phone');
    
    if (urlId && urlPhone) {
      setTrackingId(urlId);
      setPhone(urlPhone);
      performTrackingLookup(urlId, urlPhone);
    }
  }, [searchParams]);

  // Sync WhatsApp Context on successful lookup
  useEffect(() => {
    if (result && trackingId) {
      setWhatsAppMessage(`Hi, I need help regarding Tracking ID: ${trackingId}. It is currently marked as: ${result.entity.current_status.replace(/_/g, ' ').toUpperCase()}`);
    }
    return () => {
      setWhatsAppMessage('');
    };
  }, [result, trackingId, setWhatsAppMessage]);

  const performTrackingLookup = async (idVal: string, phoneVal: string) => {
    if (!idVal || !phoneVal) return;
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch(`/api/track?id=${encodeURIComponent(idVal)}&phone=${encodeURIComponent(phoneVal)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch status details');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification failed. Double check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !phone) {
      setError('Please fill in both fields.');
      return;
    }
    performTrackingLookup(trackingId, phone);
  };

  // Convert status to readable text
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Universal Hub</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Track Orders, Repairs & Solar Status
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-xs sm:text-sm">
          Enter your Tracking number (ORD-...), repair ticket number (REP-...), or solar survey project reference (SOL-...) below.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-xl border border-slate-800/80 max-w-xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Tracking ID / Code</label>
              <input
                type="text"
                placeholder="e.g. ORD-2026-9812"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 080..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Retrieving status trail...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Track Progress
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Lookup Results */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Card Header details */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Category: {result.entityType.toUpperCase()}
              </span>
              <h2 className="text-xl font-extrabold text-slate-250">
                {result.entity.tracking_number || result.entity.ticket_number || result.entity.project_number}
              </h2>
              <p className="text-xs text-slate-450 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created at: {new Date(result.entity.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1 text-left sm:text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Current Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                {formatStatus(result.entity.current_status)}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Spec / Description Panel */}
            <div className="glass-panel p-6 rounded-xl border border-slate-850 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 uppercase tracking-wide flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                Details Sheet
              </h3>
              <div className="text-xs space-y-2.5 text-slate-400">
                {result.entityType === 'repair' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-500 block uppercase">Device Model</span>
                      <span className="text-slate-250">{result.entity.device_model}</span>
                    </div>
                    {result.entity.estimated_cost && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase">Estimated Repair Cost</span>
                        <span className="text-indigo-400 font-semibold">
                          ₦{result.entity.estimated_cost.toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {result.entityType === 'solar' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-500 block uppercase">Property Category</span>
                      <span className="text-slate-250">{result.entity.property_type}</span>
                    </div>
                  </>
                )}
                {result.entityType === 'order' && (
                  <>
                    <div>
                      <span className="font-bold text-slate-500 block uppercase font-mono">Invoice Amount</span>
                      <span className="text-indigo-400 font-semibold">
                        ₦{result.entity.total_amount?.toLocaleString('en-NG')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Visual Step-by-Step Progress Timeline */}
            <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-slate-850 space-y-6">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 uppercase tracking-wide">
                Progress History Log
              </h3>

              {result.timeline.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No status updates have been logged yet.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-800 space-y-6">
                  {result.timeline.map((log, idx) => (
                    <div key={log.id} className="relative">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-indigo-400 text-indigo-400">
                        <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400 fill-slate-950" />
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-3">
                          <span className="font-bold text-slate-200 uppercase tracking-wide">
                            {formatStatus(log.status)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                          {log.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading tracking interface...</div>}>
      <TrackingInterface />
    </Suspense>
  );
}
