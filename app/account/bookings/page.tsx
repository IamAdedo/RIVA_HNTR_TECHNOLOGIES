import Link from 'next/link';
import { Wrench, Sun, ArrowUpRight, Inbox } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatNaira, formatDate, prettifyStatus, statusTone } from '@/lib/format';

interface RepairRow {
  id: string;
  ticket_number: string;
  device_model: string;
  estimated_cost: number | null;
  current_status: string;
  created_at: string;
  guest_info: { phone?: string } | null;
}

interface SolarRow {
  id: string;
  project_number: string;
  property_type: string;
  recommended_kva: number | null;
  current_status: string;
  created_at: string;
  guest_info: { phone?: string } | null;
}

export default async function AccountBookingsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: repairs }, { data: solar }, { data: profile }] = await Promise.all([
    supabase
      .from('repair_tickets')
      .select('id, ticket_number, device_model, estimated_cost, current_status, created_at, guest_info')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('solar_projects')
      .select('id, project_number, property_type, recommended_kva, current_status, created_at, guest_info')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('phone_number').eq('id', user.id).single(),
  ]);

  const repairRows = (repairs ?? []) as RepairRow[];
  const solarRows = (solar ?? []) as SolarRow[];
  const fallbackPhone = profile?.phone_number ?? '';

  const trackHref = (ref: string, phone: string) =>
    `/track?id=${encodeURIComponent(ref)}&phone=${encodeURIComponent(phone)}`;

  return (
    <div className="space-y-10">
      {/* Repairs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-200">Repair Tickets</h2>
        </div>

        {repairRows.length === 0 ? (
          <div className="glass-panel rounded-xl border border-slate-800/80 text-center py-10 px-6">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No repair tickets yet.</p>
            <Link
              href="/repairs"
              className="inline-flex mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              Book a repair
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {repairRows.map((r) => (
              <div
                key={r.id}
                className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-slate-100">{r.ticket_number}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusTone(
                        r.current_status
                      )}`}
                    >
                      {prettifyStatus(r.current_status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{r.device_model}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(r.created_at)}
                    {r.estimated_cost ? ` · Est. ${formatNaira(r.estimated_cost)}` : ''}
                  </p>
                </div>
                <Link
                  href={trackHref(r.ticket_number, r.guest_info?.phone || fallbackPhone)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-emerald-300 transition-colors shrink-0"
                >
                  Track
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Solar */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-200">Solar Projects</h2>
        </div>

        {solarRows.length === 0 ? (
          <div className="glass-panel rounded-xl border border-slate-800/80 text-center py-10 px-6">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No solar projects yet.</p>
            <Link
              href="/solar"
              className="inline-flex mt-4 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              Request a survey
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {solarRows.map((s) => (
              <div
                key={s.id}
                className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-slate-100">{s.project_number}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusTone(
                        s.current_status
                      )}`}
                    >
                      {prettifyStatus(s.current_status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {s.property_type}
                    {s.recommended_kva ? ` · ${s.recommended_kva} kVA recommended` : ''}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(s.created_at)}</p>
                </div>
                <Link
                  href={trackHref(s.project_number, s.guest_info?.phone || fallbackPhone)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors shrink-0"
                >
                  Track
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
