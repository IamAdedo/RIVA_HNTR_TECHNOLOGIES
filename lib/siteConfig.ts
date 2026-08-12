/**
 * Central source of truth for site-wide SEO, branding, contact (NAP), and the
 * catalog department model. Imported by metadata, JSON-LD, sitemap, robots,
 * manifest, the footer, and the storefront filters so everything stays in sync.
 *
 * NOTE: Address, phone, geo coordinates and social links below are placeholders.
 * Replace them with the real business details — NAP (Name/Address/Phone)
 * consistency is a direct local-SEO ranking factor.
 */

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rivahntr.com';
// Normalise: strip any trailing slash so `${url}/path` never double-slashes.
const SITE_URL = rawUrl.replace(/\/+$/, '');

export const siteConfig = {
  name: 'RIVA HNTR Technologies',
  shortName: 'RIVA HNTR',
  url: SITE_URL,
  locale: 'en_NG',
  /** Default meta description + OG description used across the site. */
  description:
    'RIVA HNTR Technologies is Ilorin’s trusted store for new & UK-used laptops, computer accessories, expert laptop repairs, and complete solar energy installations. Verified quality, real warranties, fast service.',
  /** Broad keyword set — supplemented by per-page titles/descriptions. */
  keywords: [
    'laptops in Ilorin',
    'UK used laptops Ilorin',
    'buy laptop Ilorin',
    'computer accessories Ilorin',
    'laptop repair Ilorin',
    'solar installation Ilorin',
    'solar inverter Ilorin',
    'inverter and battery Ilorin',
    'RIVA HNTR Technologies',
    'computer village Ilorin',
    'Kwara State laptops',
  ],
  contact: {
    // Server-safe fallbacks; the WhatsApp widget reads NEXT_PUBLIC_WHATSAPP_NUMBER.
    telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+2348000000000',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@rivahntr.com',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+2348000000000',
  },
  address: {
    street: 'Ibrahim Taiwo Road',
    locality: 'Ilorin',
    region: 'Kwara State',
    postalCode: '240101',
    country: 'NG',
    countryName: 'Nigeria',
    /** Approximate Ilorin city-centre coordinates — refine to the real shop. */
    geo: { latitude: 8.4966, longitude: 4.5426 },
  },
  /** Public profiles for Organization `sameAs`. Leave blank to omit. */
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@rivahntr',
  },
  /** Google Search Console verification token (optional). */
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
} as const;

/** Build an absolute URL from a site-relative path (for canonical/OG/sitemap). */
export function absoluteUrl(path = '/'): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/** The two storefront departments. Computer gear is kept distinct from solar. */
export const DEPARTMENTS = {
  computers: {
    slug: 'computers',
    label: 'Computers & Accessories',
    short: 'Computers',
    // Product `category` values that belong to this department.
    categories: ['Laptops', 'Desktops', 'Computer Accessories', 'Accessories'],
  },
  solar: {
    slug: 'solar',
    label: 'Solar & Accessories',
    short: 'Solar',
    categories: ['Solar Inverters', 'Batteries', 'Solar Panels', 'Solar Accessories'],
  },
} as const;

export type DepartmentSlug = keyof typeof DEPARTMENTS;

/**
 * Classify any product `category` string into a department. Keyword-based so it
 * also handles legacy/free-text categories not listed above.
 */
export function departmentOf(category: string): DepartmentSlug {
  const c = (category || '').toLowerCase();
  if (
    c.includes('solar') ||
    c.includes('inverter') ||
    c.includes('batter') ||
    c.includes('panel')
  ) {
    return 'solar';
  }
  return 'computers';
}

const socialLinks = Object.values(siteConfig.social).filter(
  (v) => typeof v === 'string' && v.startsWith('http')
);

/** schema.org LocalBusiness / Store — the primary local-SEO entity. */
export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'LocalBusiness', 'ElectronicsStore'],
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.telephone,
    email: siteConfig.contact.email,
    image: absoluteUrl('/opengraph-image'),
    priceRange: '₦₦',
    currenciesAccepted: 'NGN',
    areaServed: [
      { '@type': 'City', name: 'Ilorin' },
      { '@type': 'AdministrativeArea', name: 'Kwara State' },
      { '@type': 'Country', name: 'Nigeria' },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.address.geo.latitude,
      longitude: siteConfig.address.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    ...(socialLinks.length ? { sameAs: socialLinks } : {}),
  };
}

/** schema.org Organization — brand entity for the knowledge panel. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/icon.svg'),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.telephone,
    ...(socialLinks.length ? { sameAs: socialLinks } : {}),
  };
}

/** schema.org WebSite with a search action (enables the sitelinks searchbox). */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** schema.org BreadcrumbList from an ordered [name, path] list. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
