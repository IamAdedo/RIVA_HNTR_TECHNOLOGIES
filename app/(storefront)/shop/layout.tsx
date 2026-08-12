import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

// Server layout for the shop listing. The interactive listing UI stays a Client
// Component in page.tsx; this wrapper only supplies metadata. The product detail
// route (`[slug]`) overrides title/description/canonical via its own layout.
export const metadata: Metadata = {
  title: 'Shop Laptops, Computers & Solar Equipment in Ilorin',
  description:
    'Browse new & UK-used laptops, computer accessories, solar inverters and batteries at RIVA HNTR Technologies, Ilorin. Filter by condition, category and price. Verified quality with warranty.',
  keywords: [
    'buy laptop Ilorin',
    'UK used laptops Ilorin',
    'computer accessories Ilorin',
    'solar inverter price Ilorin',
    'inverter battery Ilorin',
  ],
  alternates: { canonical: '/shop' },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/shop`,
    title: 'Shop Laptops, Computers & Solar Equipment in Ilorin',
    description:
      'New & UK-used laptops, computer accessories, solar inverters and batteries — verified quality with warranty. RIVA HNTR Technologies, Ilorin.',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
