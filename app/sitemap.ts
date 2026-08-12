import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';
import { getAllProducts } from '@/lib/products';

/**
 * XML sitemap listing every indexable public URL. Static routes first, then one
 * entry per product. Transactional/private routes (cart, checkout, admin) are
 * intentionally excluded (also disallowed in robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteConfig.url}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/solar`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteConfig.url}/repairs`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteConfig.url}/track`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: `${siteConfig.url}/shop/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
    images: product.images?.length ? [product.images[0]] : undefined,
  }));

  return [...staticRoutes, ...productRoutes];
}
