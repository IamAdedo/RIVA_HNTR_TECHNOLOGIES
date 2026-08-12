import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { siteConfig, breadcrumbLd } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Track Your Order, Repair or Solar Project',
  description:
    'Check the live status of your RIVA HNTR Technologies order, repair ticket or solar project. Enter your tracking number and phone to see a step-by-step timeline.',
  alternates: { canonical: '/track' },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/track`,
    title: 'Track Your Order, Repair or Solar Project',
    description:
      'Live status timeline for your order, repair ticket or solar project at RIVA HNTR Technologies.',
  },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Track', path: '/track' },
        ])}
      />
      {children}
    </>
  );
}
