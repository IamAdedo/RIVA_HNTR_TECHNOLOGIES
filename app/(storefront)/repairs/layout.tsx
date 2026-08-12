import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, breadcrumbLd } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Laptop & Computer Repairs in Ilorin',
  description:
    'Component-level laptop and computer repairs in Ilorin: logic board repair, screen and battery replacement, and upgrades. Book a repair and track your ticket from diagnosis to pickup.',
  keywords: [
    'laptop repair Ilorin',
    'computer repair Ilorin',
    'screen replacement Ilorin',
    'logic board repair Nigeria',
    'battery replacement Ilorin',
  ],
  alternates: { canonical: '/repairs' },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/repairs`,
    title: 'Laptop & Computer Repairs in Ilorin',
    description:
      'Expert component-level laptop & computer repairs in Ilorin. Book a repair and track your ticket in real time.',
  },
};

export default function RepairsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Computer & Laptop Repair',
            name: 'Laptop & Computer Repair Service',
            description:
              'Component-level logic board repairs, screen and battery replacements, and hardware upgrades with real-time ticket tracking.',
            url: absoluteUrl('/repairs'),
            provider: { '@id': `${siteConfig.url}/#business` },
            areaServed: [
              { '@type': 'City', name: 'Ilorin' },
              { '@type': 'AdministrativeArea', name: 'Kwara State' },
            ],
          },
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Repairs & Servicing', path: '/repairs' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
