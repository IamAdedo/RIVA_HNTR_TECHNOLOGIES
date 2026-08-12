import Link from 'next/link';
import { Package, ArrowUpRight, Inbox } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatNaira, formatDate, prettifyStatus, statusTone } from '@/lib/format';

interface OrderRow {
  id: string;
  tracking_number: string;
  total_amount: number | null;
  fulfillment_type: string | null;
  current_status: string;
  created_at: string;
  guest_info: { phone?: string } | null;
}

export default async function AccountOrdersPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: orders }, { data: profile }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, tracking_number, total_amount, fulfillment_type, current_status, created_at, guest_info')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('phone_number').eq('id', user.id).single(),
  ]);

  const rows = (orders ?? []) as OrderRow[];
  const fallbackPhone = profile?.phone_number ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-slate-200">Your Orders</h2>
      </div>

      {rows.length === 0 ? (
        <div className="glass-panel rounded-xl border border-slate-800/80 text-center py-14 px-6">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const phone = o.guest_info?.phone || fallbackPhone;
            return (
              <div
                key={o.id}
                className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-slate-100">{o.tracking_number}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusTone(
                        o.current_status
                      )}`}
                    >
                      {prettifyStatus(o.current_status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(o.created_at)}
                    {o.fulfillment_type ? ` · ${prettifyStatus(o.fulfillment_type)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <span className="text-lg font-extrabold text-indigo-400">{formatNaira(o.total_amount)}</span>
                  <Link
                    href={`/track?id=${encodeURIComponent(o.tracking_number)}&phone=${encodeURIComponent(phone)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-indigo-300 transition-colors"
                  >
                    Track
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
