import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

/** PWA / web app manifest — improves installability and mobile branding. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // slate-950
    theme_color: '#6366f1', // indigo-500
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
