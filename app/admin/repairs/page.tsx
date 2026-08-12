'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wrench, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, User, PlusCircle, MessageSquare } from 'lucide-react';

interface RepairTicket {
  id: string;
  ticket_number: string;
  device_model: string;
  fault_description: string;
  estimated_cost: number | null;
  current_status: string;
  created_at: string;
  guest_info?: {
    name: string;
    phone: string;
    email: string;
  };
}

const MOCK_REPAIRS: RepairTicket[] = [
  {
    id: 'r1',
    ticket_number: 'REP-2026-9021',
    device_model: 'Asus ROG Strix G15',
    fault_description: 'GPU overheating under load and causing immediate screen artifact lockups. Needs fresh liquid metal thermal repasting.',
    estimated_cost: 35000,
    current_status: 'diagnosing',
    created_at: '2026-08-11T09:00:00Z',
    guest_info: { name: 'Emeka Obi', phone: '08129302910', email: 'emeka@gmail.com' },
  },
  {
    id: 'r2',
    ticket_number: 'REP-2026-1042',
    device_model: 'HP EliteBook 840 G7',
    fault_description: 'Liquid spilled on keyboard. Keycaps are sticky and keys Q, W, E, R are completely unresponsive.',
    estimated_cost: null,
    current_status: 'submitted',
    created_at: '2026-08-11T14:20:00Z',
    guest_info: { name: 'Sarah Lawson', phone: '08023940192', email: 'sarah@yahoo.com' },
  },
  {
    id: 'r3',
    ticket_number: 'REP-2026-4409',
    device_model: 'MacBook Air M1',
    fault_description: 'Cracked liquid crystal screen. Needs complete upper clamshell assembly swap.',
    estimated_cost: 120000,
    current_status: 'repairing',
    created_at: '2026-08-10T11:00:00Z',
    guest_info: { name: 'Damilola George', phone: '07038102910', email: 'dami@icloud.com' },
  },
];

const COLUMNS = [
  { id: 'submitted', title: 'Submitted', color: 'border-slate-800' },
  { id: 'diagnosing', title: 'Diagnosing', color: 'border-blue-500/30' },
  { id: 'awaiting_approval', title: 'Awaiting Approval', color: 'border-purple-500/30' },
  { id: 'repairing', title: 'Repairing', color: 'border-amber-500/30' },
  { id: 'ready_for_pickup', title: 'Ready for Pickup', color: 'border-emerald-500/30' },
];

export default function AdminRepairs() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Diagnostics Notes dialog state
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [newStatus, setNewStatus] = useState('diagnosing');

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repair_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setTickets(data as RepairTicket[]);
      } else {
        setTickets(MOCK_REPAIRS);
      }
    } catch (err) {
      console.warn('Unable to query repair tickets from Supabase. Loading fallbacks.');
      setTickets(MOCK_REPAIRS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenDiagnostics = (ticket: RepairTicket) => {
    setSelectedTicket(ticket);
    setNotes('');
    setEstimatedCost(ticket.estimated_cost || 15000);
    setNewStatus(ticket.current_status);
  };

  const handleSaveDiagnostics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      // Update Repair ticket in DB
      const { error } = await supabase
        .from('repair_tickets')
        .update({
          current_status: newStatus,
          estimated_cost: estimatedCost,
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Add audit log
      await supabase.from('status_audit_logs').insert({
        entity_id: selectedTicket.id,
        entity_type: 'repair',
        status: newStatus,
        notes: `Technician log: ${notes || 'Status updated.'}. Estimated repair charge: ₦${estimatedCost.toLocaleString('en-NG')}.`,
      });

      // Update local state
      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, current_status: newStatus, estimated_cost: estimatedCost }
            : t
        )
      );
      
      alert(`Ticket ${selectedTicket.ticket_number} updated successfully.`);
    } catch (err) {
      console.warn('DB update failed. Altering local state for mockup demo.', err);
      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, current_status: newStatus, estimated_cost: estimatedCost }
            : t
        )
      );
    } finally {
      setSelectedTicket(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
          <Wrench className="w-5 h-5 text-emerald-400" />
          Hardware Technician Repairs Kanban
        </h3>
        <button
          onClick={loadTickets}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          Loading repair boards...
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[60vh] pb-10">
          {COLUMNS.map((col) => {
            const colTickets = tickets.filter((t) => t.current_status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 flex flex-col min-w-[220px]"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-bold text-slate-350">{col.title}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-indigo-400 border border-slate-800">
                    {colTickets.length}
                  </span>
                </div>

                {/* Ticket cards */}
                <div className="flex-1 space-y-3">
                  {colTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleOpenDiagnostics(ticket)}
                      className={`glass-panel p-3.5 rounded-lg border-l-4 ${col.color} hover:border-indigo-500/50 transition-all cursor-pointer space-y-2.5 text-left`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-[10px] text-indigo-400">
                          {ticket.ticket_number}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 line-clamp-1">
                        {ticket.device_model}
                      </h4>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {ticket.fault_description}
                      </p>

                      <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500">
                        {ticket.estimated_cost ? (
                          <span className="font-semibold text-emerald-400">
                            ₦{ticket.estimated_cost.toLocaleString('en-NG')}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-semibold">Estimate Pending</span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <User className="w-3 h-3" />
                          {ticket.guest_info?.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostics Modal Dialog */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-xl border border-indigo-500/25 max-w-md w-full space-y-4 animate-scaleUp text-left">
            <div>
              <h4 className="font-bold text-base text-slate-250">
                Repair Log & diagnostics: {selectedTicket.ticket_number}
              </h4>
              <p className="text-xs text-slate-450 mt-0.5">
                Model: {selectedTicket.device_model}
              </p>
            </div>

            <form onSubmit={handleSaveDiagnostics} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                >
                  <option value="submitted">Submitted</option>
                  <option value="diagnosing">Diagnosing</option>
                  <option value="awaiting_approval">Awaiting Approval</option>
                  <option value="repairing">Repairing</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Estimated Repair Cost (₦)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Add Diagnostics / Job Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. CPU repaste complete, screen swapped successfully..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-bold"
                >
                  Save technician Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
