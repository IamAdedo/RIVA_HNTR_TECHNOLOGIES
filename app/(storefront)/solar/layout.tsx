import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, breadcrumbLd } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Solar Energy Installation & Load Calculator in Ilorin',
  description:
    'Design your off-grid or hybrid solar system with our free load calculator, then book a site survey. Inverter, battery and panel installation across Ilorin & Kwara State by RIVA HNTR Technologies.',
  keywords: [
    'solar installation Ilorin',
    'solar inverter Ilorin',
    'inverter and battery Ilorin',
    'solar company Kwara State',
    'off-grid solar Nigeria',
  ],
  alternates: { canonical: '/solar' },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/solar`,
    title: 'Solar Energy Installation & Load Calculator in Ilorin',
    description:
      'Free solar load calculator + professional inverter, battery and panel installation across Ilorin & Kwara State.',
  },
};

export default function SolarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Solar Energy Installation & Servicing',
            name: 'Solar Energy Installation & Servicing',
            description:
              'Custom off-grid and hybrid solar system design, supply and installation — inverters, batteries and panels — with site surveys and maintenance.',
            url: absoluteUrl('/solar'),
            provider: { '@id': `${siteConfig.url}/#business` },
            areaServed: [
              { '@type': 'City', name: 'Ilorin' },
              { '@type': 'AdministrativeArea', name: 'Kwara State' },
            ],
          },
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Solar Energy', path: '/solar' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
