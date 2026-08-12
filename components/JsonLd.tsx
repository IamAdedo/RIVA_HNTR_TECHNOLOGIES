import React from 'react';

/**
 * Renders a JSON-LD structured-data block. Safe to use in Server Components
 * (this is how Next.js recommends emitting schema.org data — see the metadata
 * docs "Unsupported Metadata" note: render the <script> in the layout/page).
 *
 * Pass a single schema object or an array of them.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // Structured data is not user-generated; escaping `<` guards against
      // any stray closing-tag sequences inside string values.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
