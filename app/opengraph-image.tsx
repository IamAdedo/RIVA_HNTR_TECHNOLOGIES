import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/siteConfig';

// Open Graph image for the site root (used by og:image; also referenced by the
// Twitter card in the root metadata). Generated at build time.
export const alt = `${siteConfig.name} — Laptops, Repairs & Solar Energy in Ilorin`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)',
          color: '#e2e8f0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '84px',
              height: '84px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
              fontSize: '46px',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: '40px', fontWeight: 700 }}>
            RIVA HNTR Technologies
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '68px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            Laptops, Repairs & Solar Energy
          </div>
          <div style={{ display: 'flex', fontSize: '34px', color: '#94a3b8' }}>
            New & UK-used laptops · Expert repairs · Solar installation — Ilorin, Nigeria
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#c7d2fe',
              fontSize: '26px',
              fontWeight: 600,
            }}
          >
            Verified quality · Real warranties
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
