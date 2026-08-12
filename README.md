# RIVA HNTR Technologies

A premium, hybrid Next.js web platform for **RIVA HNTR Technologies**, a laptop retail & services business based in **Ilorin, Kwara State, Nigeria**. It combines **e-commerce** (new and used laptops, computer accessories, and solar equipment), **lead generation** for solar installations and laptop repairs, a **universal public tracking hub**, and a **role-based access control (RBAC) admin suite** — all on a comprehensive SEO foundation.

---

## Features

- **Product catalog & PDP** — Browse the catalog with advanced filtering by condition, category, specs, and price. The storefront is split into two **departments** — **Computers & Accessories** and **Solar & Accessories** — selectable via tabs on `/shop` and deep-linkable with `?dept=computers` / `?dept=solar`. Product pages show condition badges (New, UK Used Grade A/B, Second-hand), inspection checklists, and battery-health bars.
- **Search-engine optimized** — Per-route titles/descriptions, canonical URLs, Open Graph + Twitter cards, a generated Open Graph image, `robots.txt`, `sitemap.xml`, a PWA manifest, and JSON-LD structured data (Organization, LocalBusiness, WebSite search action, Product, BreadcrumbList, Service). See [SEO](#seo).
- **Hybrid checkout engine** — Payment gateway switches automatically by order total:
  - **Paystack** (card / USSD popup) for orders **≤ ₦500,000**
  - **Monnify** (virtual account bank transfer) for high-ticket orders **> ₦500,000**
- **Idempotent payment webhooks** — Signature-verified Paystack and Monnify webhook endpoints update order status, write to the audit log, and decrement product stock.
- **Universal tracking hub** — Public lookup by tracking/ticket number + phone, rendering a visual step-by-step timeline for orders, repairs, and solar projects.
- **Customer accounts** — Email/password **and Google** sign-in (Supabase Auth, cookie-based SSR sessions). A protected `/account` area shows the customer's orders, repair & solar bookings, a saved address book, and profile/password settings. Orders, repairs, and solar leads placed while signed in are linked to the account so history populates automatically — guest flows still work unchanged. See [Authentication](#authentication).
- **Repair intake** — Generates repair tickets and records fault details.
- **Solar load calculator** — Appliance-based demand calculator that captures solar installation leads.
- **Contextual WhatsApp widget** — Floating widget that pre-fills a message based on the current page (shop, track, solar, repairs).
- **RBAC admin suite** — Role-gated `/admin/*` console with a role-simulation panel for: sales dashboard, inventory manager, repair Kanban board, and solar lead pipeline.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, no `src/` dir) |
| Language | TypeScript |
| UI / Styling | React 19, Tailwind CSS v4, custom glassmorphism theme |
| Icons | `lucide-react` |
| State | `zustand` (persistent cart store) |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL, RLS, auth-sync triggers) |
| Auth | Supabase Auth via `@supabase/ssr` — cookie-based sessions, email/password + Google OAuth |
| Payments | Paystack + Monnify |
| SEO | Next.js Metadata API, `robots.ts` / `sitemap.ts` / `manifest.ts`, `next/og` OG image, JSON-LD structured data |

## Project Structure

```
app/
  (storefront)/           # Public storefront (shared layout)
    shop/                 # Catalog + [slug] product detail pages
                          #   layout.tsx wrappers add per-route metadata + JSON-LD
    repairs/              # Repair intake form (+ layout.tsx metadata)
    solar/                # Solar load calculator & lead form (+ layout.tsx metadata)
    track/                # Universal tracking hub (+ layout.tsx metadata)
  account/                # Protected customer area (server-gated; noindex)
                          #   overview · orders · bookings · addresses · settings
  login/  signup/         # Auth pages (email/password + Google; noindex layouts)
  auth/
    callback/             # OAuth / email-confirmation PKCE code exchange → route.ts
    signout/              # POST sign-out → route.ts
  admin/                  # RBAC admin suite (dashboard, inventory, repairs, solar)
  api/
    checkout/             # Order creation + Monnify transfer setup
    track/                # Timeline lookup
    webhooks/paystack/    # Paystack charge verification
    webhooks/monnify/     # Monnify signature verification
  cart/  checkout/        # Cart summary & gateway-switching checkout
  robots.ts               # SEO: crawl rules + sitemap reference   → /robots.txt
  sitemap.ts              # SEO: static routes + one entry per product → /sitemap.xml
  manifest.ts             # PWA manifest                          → /manifest.webmanifest
  opengraph-image.tsx     # Generated 1200×630 OG image (next/og) → /opengraph-image
  layout.tsx  page.tsx  globals.css
proxy.ts                  # Next 16 middleware (renamed → `proxy`): refreshes the
                          # Supabase session + gates /account. See Authentication.
components/               # Header, Footer, ProductCard, ConditionBadge,
                          # InspectionChecklist, WhatsAppWidget, JsonLd
lib/
  siteConfig.ts           # SEO single source of truth: NAP, departments, JSON-LD builders
  products.ts             # Shared product catalog (powers sitemap + PDP metadata)
  format.ts               # Naira / date formatting + status badge helpers (account UI)
  supabase.ts             # Browser Supabase client (cookie-based session, anon key)
  supabase/server.ts      # Server Supabase client factory (reads/writes auth cookies)
  supabaseAdmin.ts        # Server-only client (service role key)
  paymentProcessor.ts     # Order fulfillment: verify, audit, decrement stock
  store/cartStore.ts      # Zustand cart + guest-info store
public/
  icon.svg                # Branded app icon (manifest + metadata icons)
supabase/migrations/      # PostgreSQL schema, enums, RLS policies, seed data
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Paystack and Monnify accounts (test keys are fine for development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key   # server-only, keep secret

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# Monnify
MONNIFY_API_KEY=your-monnify-api-key
MONNIFY_SECRET_KEY=your-monnify-secret-key
MONNIFY_BASE_URL=https://sandbox.monnify.com
MONNIFY_CONTRACT_CODE=your-monnify-contract-code

# WhatsApp widget (falls back to +2348000000000 if unset)
NEXT_PUBLIC_WHATSAPP_NUMBER=+234XXXXXXXXXX

# SEO / site identity (all public; safe to expose)
NEXT_PUBLIC_SITE_URL=https://rivahntr.com                 # canonical origin for metadata, sitemap, OG
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=                     # Google Search Console token (optional)
NEXT_PUBLIC_CONTACT_PHONE=+234XXXXXXXXXX                  # displayed NAP phone (defaults if unset)
NEXT_PUBLIC_CONTACT_EMAIL=hello@rivahntr.com             # displayed NAP email (defaults if unset)
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://facebook.com/rivahntr
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/rivahntr
NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/rivahntr
NEXT_PUBLIC_TWITTER_HANDLE=@rivahntr
```

> `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and the Monnify secrets are used only in server code (API routes / webhooks) — never expose them to the client. The `NEXT_PUBLIC_*` variables above are intentionally public.

> **Local SEO note:** business name, address, phone, and geo-coordinates (the "NAP" signals) live in [lib/siteConfig.ts](lib/siteConfig.ts) and drive both the footer and the structured data. Keep them consistent — mismatched NAP hurts local ranking.

### 3. Set up the database

Run the migrations against your Supabase project, in order. The first creates all core tables, enums, RLS policies, the auth→`profiles` sync trigger, and seed data; the second adds the customer address book:

```
supabase/migrations/20260811_initial_schema.sql
supabase/migrations/20260812_addresses.sql
```

Apply them via the Supabase SQL Editor or the Supabase CLI.

To enable **Google sign-in**, also turn on the Google provider under **Authentication → Providers** in the Supabase dashboard and register your callback URL (`https://<your-domain>/auth/callback`, plus `http://localhost:3000/auth/callback` for local dev) in both Supabase and the Google Cloud OAuth consent screen. Email/password works with no extra configuration.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Data Model

Core tables (see the migration for full definitions, RLS, and seed data):

- **`profiles`** — user accounts, synced from Supabase Auth, carry a `user_role`.
- **`products`** — catalog with `product_condition` and stock quantity.
- **`orders`** — orders with `order_status` lifecycle and tracking numbers.
- **`repair_tickets`** — repairs with `repair_status` lifecycle.
- **`solar_projects`** — solar leads/projects with `solar_status` lifecycle.
- **`addresses`** — customer address book (`20260812_addresses.sql`); RLS-scoped strictly to the owner (`customer_id = auth.uid()`).
- **`status_audit_logs`** — append-only audit trail for status transitions.

**Roles (`user_role`):** `super_admin`, `sales_manager`, `repair_tech`, `solar_manager`, `customer`.

`orders`, `repair_tickets`, and `solar_projects` each carry a nullable `customer_id` FK to `profiles`. It's stamped automatically when the record is created by a signed-in user (guest records leave it null), which is what populates the `/account` history. Self-read RLS on those tables (`customer_id = auth.uid()`) means a customer only ever sees their own records.

## Authentication

Customer authentication is built on **Supabase Auth** with **cookie-based SSR sessions** (via `@supabase/ssr`), so the same session is readable by Client Components, Server Components, route handlers, and the request proxy.

**Routes**

| Route | Purpose |
|---|---|
| `/login` | Email/password + "Continue with Google" sign-in |
| `/signup` | Create account (full name, phone, email, password) + Google |
| `/account` | Overview — activity summary across orders/repairs/solar |
| `/account/orders` | The customer's orders, each deep-linking into `/track` |
| `/account/bookings` | The customer's repair tickets and solar projects |
| `/account/addresses` | Address book — add / edit / delete / set-default (client CRUD) |
| `/account/settings` | Update profile (name, phone) and change password |
| `/auth/callback` | PKCE code exchange for Google OAuth **and** email confirmation |
| `/auth/signout` | `POST` sign-out (used by the account shell's form) |

**How it works**

- **Clients** — [lib/supabase.ts](lib/supabase.ts) is a `createBrowserClient` (cookie session, used by all Client Components); [lib/supabase/server.ts](lib/supabase/server.ts) exposes `createServerSupabase()` (a `createServerClient` bound to `await cookies()`) for server code.
- **`proxy.ts`** — ⚠️ In **Next.js 16 the middleware file was renamed to `proxy`**: this project uses `proxy.ts` at the repo root exporting `proxy` (not `middleware.ts` / `middleware`). It refreshes the Supabase session on every request and redirects unauthenticated visits to `/account/*` to `/login?redirect=…`. Most online Supabase SSR guides still say `middleware.ts` — don't follow that verbatim here.
- **Profile creation** — signup passes `full_name` / `phone_number` in `options.data`; the `handle_new_user()` DB trigger creates the `profiles` row automatically. The app never inserts into `profiles` directly.
- **Account linking** — when a signed-in user places an order/repair/solar request, its `customer_id` is stamped so it appears under `/account`. Guest checkout/repair/solar continue to work with `customer_id` left null.
- **Google OAuth** — requires the Google provider enabled and the `/auth/callback` redirect URL registered in the Supabase dashboard (see [Set up the database](#3-set-up-the-database)); it can't be verified from code alone.

No new environment variables are required — auth reuses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## SEO

The site ships a comprehensive, best-practice SEO foundation aimed at maximum organic ranking and rich-result eligibility. Everything is driven from [lib/siteConfig.ts](lib/siteConfig.ts) so identity/NAP data stays consistent.

**What's implemented**

- **Per-route metadata** — Each public route has unique `<title>`, description, canonical URL, and Open Graph / Twitter tags. Because the interactive pages are Client Components (which cannot export `metadata`), metadata is delivered from server `layout.tsx` wrappers around each `page.tsx`:
  - `app/layout.tsx` — root defaults, title template `%s | RIVA HNTR Technologies`, `metadataBase`, robots directives, `viewport` export.
  - `app/(storefront)/shop/layout.tsx`, `shop/[slug]/layout.tsx` (dynamic `generateMetadata` per product), `solar/layout.tsx`, `repairs/layout.tsx`, `track/layout.tsx`.
- **Structured data (JSON-LD)** via [components/JsonLd.tsx](components/JsonLd.tsx):
  - Site-wide: `Organization`, `LocalBusiness`/`Store`, `WebSite` (with `SearchAction`) — rendered in the root layout.
  - `Product` + `BreadcrumbList` on product detail pages; `Service` on the solar and repairs pages.
- **Crawler & discovery files**: `app/robots.ts` → `/robots.txt` (allows public routes, disallows `/admin`, `/api/`, `/cart`, `/checkout`, and the private `/account`, `/login`, `/signup`, `/auth/` routes; points to the sitemap), `app/sitemap.ts` → `/sitemap.xml` (static routes + one entry per product, with images), `app/manifest.ts` → `/manifest.webmanifest`.
- **Social image**: `app/opengraph-image.tsx` generates a branded 1200×630 image with `next/og`; the Twitter card reuses it via `metadata.twitter.images`.

**Maintaining SEO**

- New public route → add a `layout.tsx` beside its `page.tsx` exporting `metadata`, and add the route to `app/sitemap.ts`.
- New product → because the sitemap and PDP metadata read from [lib/products.ts](lib/products.ts), keep that catalog current (or wire it to the live Supabase catalog).
- Business details (name, address, phone, geo, socials) → edit [lib/siteConfig.ts](lib/siteConfig.ts) only; the footer, metadata, and JSON-LD all consume it.
- Set `NEXT_PUBLIC_SITE_URL` in production so canonicals, OG URLs, and the sitemap use the real origin, and add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to verify in Google Search Console.

## Deployment

Deploy on [Vercel](https://vercel.com/new) or any Node host. Set all environment variables above in your hosting provider, point payment-gateway webhooks at:

- `https://<your-domain>/api/webhooks/paystack`
- `https://<your-domain>/api/webhooks/monnify`

and switch `MONNIFY_BASE_URL` and your keys from sandbox to live.

## Maintaining this README

Keep this README in sync with the codebase: **whenever a feature, route, environment variable, script, or data model changes, update the corresponding section here in the same change.**
