import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

/**
 * robots.txt — allow the public storefront, keep transactional/private routes
 * out of the index. Points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/cart', '/checkout'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
