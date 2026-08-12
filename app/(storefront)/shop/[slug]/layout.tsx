import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { siteConfig, absoluteUrl, breadcrumbLd } from '@/lib/siteConfig';
import { getProductBySlug } from '@/lib/products';
import type { Product } from '@/components/ProductCard';
import type { ConditionType } from '@/components/ConditionBadge';

type Params = { slug: string };

/** Turn a slug into a human-readable fallback title (for live DB products not
 *  present in the mock catalog). */
function titleize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const NGN = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
});

/** Map internal condition to a schema.org OfferItemCondition URL. */
function conditionSchema(condition: ConditionType): string {
  switch (condition) {
    case 'NEW':
      return 'https://schema.org/NewCondition';
    default:
      // UK Used (A/B) and Second-hand are all pre-owned.
      return 'https://schema.org/UsedCondition';
  }
}

function buildDescription(product: Product): string {
  const cond = product.condition.replace(/_/g, ' ');
  const specBits = [
    product.specs?.processor,
    product.specs?.ram && `${product.specs.ram} RAM`,
    product.specs?.storage,
  ]
    .filter(Boolean)
    .join(', ');
  return `${product.title} — ${cond}. ${NGN.format(product.price)} at ${siteConfig.name}, Ilorin.${
    specBits ? ` ${specBits}.` : ''
  } In-store warranty & nationwide delivery.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  const path = `/shop/${slug}`;

  if (!product) {
    const name = titleize(slug);
    return {
      title: name,
      description: `Buy ${name} at ${siteConfig.name} in Ilorin — verified quality with warranty and nationwide delivery.`,
      alternates: { canonical: path },
      openGraph: { type: 'website', url: absoluteUrl(path), title: name },
    };
  }

  const description = buildDescription(product);
  const image = product.images?.[0];

  return {
    title: product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: absoluteUrl(path),
      title: product.title,
      description,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  const path = `/shop/${slug}`;

  const structured: Record<string, unknown>[] = [
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: product?.title ?? titleize(slug), path },
    ]),
  ];

  if (product) {
    structured.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: product.images,
      category: product.category,
      sku: product.id,
      ...(product.specs?.processor ? { description: buildDescription(product) } : {}),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        price: product.price,
        availability:
          product.stock_quantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        itemCondition: conditionSchema(product.condition),
        url: absoluteUrl(path),
        seller: { '@id': `${siteConfig.url}/#business` },
      },
    });
  }

  return (
    <>
      <JsonLd data={structured} />
      {children}
    </>
  );
}
