import Link from 'next/link';
import { Package, Wrench, Sun, ArrowRight, Inbox } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate, prettifyStatus, statusTone } from '@/lib/format';

export default async function AccountOverviewPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Layout already guards this, but keep the type-narrowing tidy.
  if (!user) return null;

  // RLS scopes each table to the current user; the explicit filter is belt-and-braces.
  const [ordersRes, repairsRes, solarRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, tracking_number, total_amount, current_status, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('repair_tickets')
      .select('id, ticket_number, device_model, current_status, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('solar_projects')
      .select('id, project_number, property_type, current_status, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const orders = ordersRes.data ?? [];
  const repairs = repairsRes.data ?? [];
  const solar = solarRes.data ?? [];

  const stats = [
    { label: 'Orders', count: orders.length, icon: Package, href: '/account/orders' },
    { label: 'Repairs', count: repairs.length, icon: Wrench, href: '/account/bookings' },
    { label: 'Solar Projects', count: solar.length, icon: Sun, href: '/account/bookings' },
  ];

  // Merge the three most-recent streams into one activity feed.
  type Activity = { id: string; ref: string; type: string; status: string; created_at: string; href: string };
  const activity: Activity[] = [
    ...orders.map((o) => ({
      id: o.id,
      ref: o.tracking_number as string,
      type: 'Order',
      status: o.current_status as string,
      created_at: o.created_at as string,
      href: '/account/orders',
    })),
    ...repairs.map((r) => ({
      id: r.id,
      ref: r.ticket_number as string,
      type: 'Repair',
      status: r.current_status as string,
      created_at: r.created_at as string,
      href: '/account/bookings',
    })),
    ...solar.map((s) => ({
      id: s.id,
      ref: s.project_number as string,
      type: 'Solar',
      status: s.current_status as string,
      created_at: s.created_at as string,
      href: '/account/bookings',
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="glass-panel p-5 rounded-xl border border-slate-800/80 hover:border-indigo-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-3xl font-extrabold text-slate-100 mt-4">{s.count}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Recent Activity</h2>
        </div>

        {activity.length === 0 ? (
          <div className="text-center py-14 px-6">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No activity yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Orders, repairs and solar projects you place while signed in will appear here.
            </p>
            <Link
              href="/shop"
              className="inline-flex mt-4 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {activity.map((a) => (
              <li key={`${a.type}-${a.id}`}>
                <Link
                  href={a.href}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        {a.type}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-200 truncate">
                        {a.ref}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(a.created_at)}</p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${statusTone(
                      a.status
                    )}`}
                  >
                    {prettifyStatus(a.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
