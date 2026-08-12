'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, CalendarClock, MapPin, Settings } from 'lucide-react';

const LINKS = [
  { name: 'Overview', href: '/account', icon: LayoutDashboard },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Bookings', href: '/account/bookings', icon: CalendarClock },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const Icon = link.icon;
        // Exact match for the overview root; prefix match for the sub-sections.
        const isActive =
          link.href === '/account' ? pathname === '/account' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
