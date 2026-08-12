import { Product } from '@/components/ProductCard';

/**
 * Shared product catalog (mock/backup data). Single source of truth consumed by:
 *  - the home page featured grid
 *  - the shop listing fallback
 *  - the product detail page fallback
 *  - `app/sitemap.ts` (product URLs) and `[slug]/layout.tsx` (product metadata)
 *
 * When a live Supabase catalog is present it takes precedence; this list keeps
 * the storefront (and its SEO surface) populated without a database.
 */
export const CATALOG: Product[] = [
  {
    id: 'b1',
    title: 'MacBook Pro 16" Apple M2 Pro (16GB, 512GB SSD)',
    slug: 'macbook-pro-16-m2-pro',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_A',
    price: 1250000,
    stock_quantity: 4,
    specs: { processor: 'Apple M2 Pro', ram: '16GB', storage: '512GB SSD', battery_health: '94%' },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b2',
    title: 'Dell XPS 15 9520 (Intel i7 12th Gen, 16GB, 512GB)',
    slug: 'dell-xps-15-9520',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_B',
    price: 780000,
    stock_quantity: 2,
    specs: { processor: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', battery_health: '86%' },
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b3',
    title: 'HP Pavilion 15 (Ryzen 5, 8GB, 256GB SSD)',
    slug: 'hp-pavilion-15-ryzen',
    category: 'Laptops',
    condition: 'NEW',
    price: 490000,
    stock_quantity: 6,
    specs: { processor: 'AMD Ryzen 5', ram: '8GB', storage: '256GB SSD' },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b4',
    title: 'Lenovo ThinkPad T14 Gen 2 (Intel i5, 16GB, 256GB)',
    slug: 'lenovo-thinkpad-t14-gen-2',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_A',
    price: 360000,
    stock_quantity: 5,
    specs: { processor: 'Intel Core i5', ram: '16GB', storage: '256GB SSD', battery_health: '90%' },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b5',
    title: '5KVA Solar Hybrid Inverter Pure Sine Wave',
    slug: '5kva-solar-hybrid-inverter',
    category: 'Solar Inverters',
    condition: 'NEW',
    price: 450000,
    stock_quantity: 12,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b6',
    title: 'Lithium Iron Phosphate Battery (LiFePO4) 48V 100Ah',
    slug: 'lifepo4-battery-48v-100ah',
    category: 'Batteries',
    condition: 'NEW',
    price: 950000,
    stock_quantity: 8,
    images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80'],
  },
];

/** Slugs shown in the home-page "Featured Equipment" grid, in order. */
export const FEATURED_SLUGS = [
  'macbook-pro-16-m2-pro',
  'dell-xps-15-9520',
  'hp-pavilion-15-ryzen',
  '5kva-solar-hybrid-inverter',
];

export function getAllProducts(): Product[] {
  return CATALOG;
}

export function getProductBySlug(slug: string): Product | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return FEATURED_SLUGS.map((s) => getProductBySlug(s)).filter(
    (p): p is Product => Boolean(p)
  );
}
