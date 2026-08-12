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
| Payments | Paystack + Monnify |
| SEO | Next.js Metadata API, `robots.ts` / `sitemap.ts` / `manifest.ts`, `next/og` OG image, JSON-LD structured data |

## Project Structure

```
app/
  (storefront)/           # Public storefront (shared layout)
    shop/                 # Catalog + [slug] product detail pages
    repairs/              # Repair intake form
    solar/                # Solar load calculator & lead form
    track/                # Universal tracking hub
  admin/                  # RBAC admin suite (dashboard, inventory, repairs, solar)
  api/
    checkout/             # Order creation + Monnify transfer setup
    track/                # Timeline lookup
    webhooks/paystack/    # Paystack charge verification
    webhooks/monnify/     # Monnify signature verification
  cart/  checkout/        # Cart summary & gateway-switching checkout
  layout.tsx  page.tsx  globals.css
components/               # Header, Footer, ProductCard, ConditionBadge,
                          # InspectionChecklist, WhatsAppWidget
lib/
  supabase.ts             # Browser Supabase client (anon key)
  supabaseAdmin.ts        # Server-only client (service role key)
  paymentProcessor.ts     # Order fulfillment: verify, audit, decrement stock
  store/cartStore.ts      # Zustand cart + guest-info store
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
```

> `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and the Monnify secrets are used only in server code (API routes / webhooks) — never expose them to the client.

### 3. Set up the database

Run the migration against your Supabase project. It creates all tables, enums, RLS policies, the auth→`profiles` sync trigger, and seed data:

```
supabase/migrations/20260811_initial_schema.sql
```

Apply it via the Supabase SQL Editor or the Supabase CLI.

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
- **`status_audit_logs`** — append-only audit trail for status transitions.

**Roles (`user_role`):** `super_admin`, `sales_manager`, `repair_tech`, `solar_manager`, `customer`.

## Deployment

Deploy on [Vercel](https://vercel.com/new) or any Node host. Set all environment variables above in your hosting provider, point payment-gateway webhooks at:

- `https://<your-domain>/api/webhooks/paystack`
- `https://<your-domain>/api/webhooks/monnify`

and switch `MONNIFY_BASE_URL` and your keys from sandbox to live.

## Maintaining this README

Keep this README in sync with the codebase: **whenever a feature, route, environment variable, script, or data model changes, update the corresponding section here in the same change.**
