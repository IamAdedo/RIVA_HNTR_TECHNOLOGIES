/**
 * Small presentation helpers shared by the account area (and safe to reuse
 * anywhere). Pure functions — no client/server assumptions.
 */

/** Format a number as Nigerian Naira, e.g. 125000 → "₦125,000". */
export function formatNaira(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `₦${value.toLocaleString('en-NG')}`;
}

/** Short human date, e.g. "12 Aug 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Date + time, e.g. "12 Aug 2026, 14:30". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Turn a snake_case status enum into a Title Case label, e.g.
 * "payment_verified" → "Payment Verified". */
export function prettifyStatus(status: string | null | undefined): string {
  if (!status) return '—';
  return status
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Tailwind classes for a status badge, coloured by lifecycle stage. Keyword-based
 * so it covers the order / repair / solar enums without an explicit map:
 * green = done, rose = cancelled, amber = brand-new/awaiting, indigo = in-flight.
 */
export function statusTone(status: string | null | undefined): string {
  const s = (status || '').toLowerCase();
  if (
    s.includes('completed') ||
    s.includes('commissioned') ||
    s.includes('verified') ||
    s.includes('paid')
  ) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (s.includes('cancelled') || s.includes('canceled') || s.includes('failed')) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }
  if (
    s.includes('pending') ||
    s.includes('submitted') ||
    s.includes('received') ||
    s.includes('lead') ||
    s.includes('awaiting')
  ) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
}
