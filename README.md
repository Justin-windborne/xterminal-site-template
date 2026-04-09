# Client Site Template Foundation

Brand-neutral starter frontend for client website projects that connect to an xTerminal workspace backend.

## Purpose

Use this project as a repeatable baseline for developer teams and developer agents:

- Start with a clean, debranded structure
- Build custom UI/UX for each client brand
- Keep runtime wiring and SEO infrastructure consistent across projects
- Connect to xTerminal workspace backend for content editing, tracking, and site-wide settings

## What This Template Includes

- Next.js + TypeScript + Tailwind foundation
- Generic marketing shell (header, footer, page sections)
- Runtime API adapter (`lib/runtime-api.ts`)
- Same-origin contact proxy (`app/api/contact/route.ts`)
- Blog listing and post rendering wired to xTerminal's public API
- SEO & Tracking injection layer (`components/seo/SeoHead.tsx`, `components/seo/GtmNoscript.tsx`)
- Dynamic `robots.txt` and `sitemap.xml` routes (includes published blog posts)
- Neutral env contract for tenant-scoped runtime wiring

## What This Template Does NOT Include

- xTerminal-specific branding, copy, domains, or assets
- Client-specific design system tokens
- Backend secrets
- Admin dashboard UI (lives in xTerminal, not in client repos)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

## Environment Variables

### Core Wiring

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for this frontend (used in sitemap, OG tags, robots.txt)
- `NEXT_PUBLIC_APP_BASE_URL` — workspace app/dashboard base URL
- `XT_BACKEND_CONTACT_ENDPOINT` — backend contact endpoint for proxy forwarding
- `NEXT_PUBLIC_MARKETING_ASSET_BASE_URL` — optional remote media origin
- `NEXT_PUBLIC_XT_API_BASE_URL` — xTerminal backend base URL for runtime reads
- `NEXT_PUBLIC_XT_TENANT_SLUG` — tenant slug for workspace-scoped reads/writes
- `NEXT_PUBLIC_XT_PUBLIC_API_KEY` — tenant public runtime key (if required)

### Supabase (when connected)

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public read access key
- `SUPABASE_SERVICE_ROLE_KEY` — server-side write key (never exposed to the browser)

---

## Architecture Layers

This template has four wiring layers. All four are preserved across every client build. Together they cover the two fundamental data flows between the client site and xTerminal: **reading data** (blog posts, page content, site settings) and **writing data** (contact form submissions).

### 1. Contact Form (write path)

Every client site has a contact form. The form submits to a same-origin API route on the client site, which proxies the submission server-side to the xTerminal backend. The client's browser never makes a cross-origin request and never sees backend credentials.

**The flow:**

```
Browser form submit
  → POST /api/contact (same-origin, this repo)
    → Server-side proxy to XT_BACKEND_CONTACT_ENDPOINT
      → xTerminal backend writes to workspace's contact_submissions table
        → Submission appears in the workspace's admin CRM
```

**Key files:**
- `app/api/contact/route.ts` — same-origin proxy route. Receives the form payload, attaches the `x-xt-tenant-slug` header, forwards to `XT_BACKEND_CONTACT_ENDPOINT`, returns the response.
- Contact form component (e.g., `components/ContactForm.tsx` or a block component) — client component that posts to `/api/contact`. Design is fully customizable; the submission target is not.

**Why it works this way:**
- The xTerminal backend URL and any auth headers stay server-side. The browser only talks to the client site's own domain.
- The tenant slug header tells xTerminal which workspace this submission belongs to.
- The contact proxy pattern is the same for every client. Only the form design changes.

**What gets stored:**
- xTerminal's admin dashboard shows submissions in a CRM-style inbox per workspace. The client manages leads from there. The client site never reads submissions back — it only writes them.

### 2. Blog (read path)

Every client site has a blog. Blog posts are created and managed in the xTerminal admin dashboard (title, slug, excerpt, body, cover image, publish/schedule). The client site reads published posts from xTerminal's public runtime API and renders them with its own components.

**The flow:**

```
Client site page load
  → lib/runtime-api.ts fetches from NEXT_PUBLIC_XT_API_BASE_URL
    → xTerminal public API returns published posts for this tenant
      → Blog listing page renders post cards
      → Blog post page renders full article
```

**Key files:**
- `lib/runtime-api.ts` — runtime adapter. Fetches blog posts (and other content) from xTerminal's public API, scoped by tenant slug.
- `app/(public)/blog/page.tsx` — blog listing page. Fetches published posts via runtime adapter, renders a grid/list of post cards.
- `app/(public)/blog/[slug]/page.tsx` — individual blog post page. Fetches a single post by slug, renders the full article with `generateMetadata()` for per-post SEO (title, description, OG image from cover image, Article JSON-LD).

**Blog post data available from the API:**
- `title`, `slug`, `excerpt`, `content` (body), `cover_image_url`, `author`
- `is_published`, `published_at` — only posts where `is_published` is true and `published_at` is in the past are returned by the public API
- `created_at`, `updated_at`

**What the client site owns vs. what xTerminal owns:**

| Concern | Owner |
|---------|-------|
| Post creation, editing, publishing, scheduling | xTerminal admin dashboard |
| Blog listing layout, card design, typography | Client site (this repo) |
| Individual post page layout and styling | Client site (this repo) |
| Per-post SEO metadata and structured data | Client site (via `generateMetadata()`) |
| Cover image storage | xTerminal (Supabase Storage) |
| Which posts are visible (publish + schedule logic) | xTerminal public API |

**Sitemap integration:**
- The `sitemap.xml` route fetches published blog post slugs from the runtime API and includes them alongside static page URLs. Each blog post gets its own `<url>` entry with a `<lastmod>` timestamp.

### 3. Runtime + Content Reads (read path)

Beyond blog posts, the runtime adapter reads page content and site settings from xTerminal's public API. This is how block content edited in the admin dashboard reaches the live site.

**Key files:**
- `lib/runtime-api.ts` — runtime adapter for all xTerminal backend reads (pages, blog posts, site settings)

**What the runtime adapter reads:**

| Data | Source | Used by |
|------|--------|---------|
| Page block content | `pages.content` via public API | `BlockRenderer.tsx` on each public page |
| Site settings | `site_settings` via public API | SEO layer, layout, footer, anywhere site-wide values are needed |
| Blog posts | `blog_posts` via public API | Blog listing, blog post pages, sitemap |

All reads are scoped by tenant slug. The public API requires the `NEXT_PUBLIC_XT_PUBLIC_API_KEY` if the workspace has API key enforcement enabled.

### 4. SEO & Tracking Layer

Site-wide `<head>` tag injection driven by `site_settings` from the xTerminal backend. The root layout fetches settings server-side and conditionally renders tracking scripts, meta tags, and site identity tags. When settings are empty or the backend is not connected, nothing renders — zero cost, no errors.

**Key files:**
- `components/seo/SeoHead.tsx` — server component, renders conditional `<head>` tags (GTM, OG, verification, robots, favicon)
- `components/seo/GtmNoscript.tsx` — server component, renders GTM noscript iframe after `<body>`
- `app/sitemap.xml/route.ts` — auto-generated XML sitemap from page structure + published blog posts
- `app/robots.txt/route.ts` — dynamic robots.txt, respects indexing toggle

**What the SEO layer reads from `site_settings`:**

| Field | What it controls |
|-------|-----------------|
| `gtm_container_id` | Google Tag Manager script injection |
| `google_verification` | Search Console verification meta tag |
| `og_default_title` | Default Open Graph title (fallback) |
| `og_default_description` | Default Open Graph description (fallback) |
| `og_default_image` | Default sharing image URL |
| `twitter_handle` | Twitter/X card site attribution |
| `allow_indexing` | Robots meta tag + robots.txt behavior |
| `favicon_url` | Favicon link tag |
| `apple_touch_icon_url` | Apple touch icon link tag |
| `site_title` | Default `<title>` tag and OG title fallback |

All of these are managed by the client through the xTerminal admin dashboard. The client site reads them — it never writes to `site_settings`.

**Per-page SEO overrides:** Individual pages (especially blog posts) can override default OG tags via `generateMetadata()`. The layout-level SEO tags are fallbacks — page-level metadata takes priority.

> For full SEO implementation details, see `SEO-TRACKING.md`.

---

## Wiring Custom Features

Some clients need custom editable content types beyond what the base template provides (e.g., restaurant hours, pickup specials, event listings). These are wired through the per-tenant block type system.

### How it works

1. A block type definition is written to xTerminal's `workspace_block_types` table for the client's workspace. This defines the editable fields and default data.
2. The client site repo gets a matching React component that renders the content and a mapping in `BlockRenderer.tsx`.
3. The xTerminal admin auto-generates editing forms from the block type definition.
4. The client edits content in the admin. The site reads it at request time.

### What this means for the template

The template ships with the rendering infrastructure (`BlockRenderer.tsx`, the layout fetching pattern, the settings injection layer). Custom block components are added per client as needed. The template does not need to anticipate every possible block type — it just needs to preserve the wiring contracts so new types can be plugged in cleanly.

> For the full per-tenant block type architecture, see the xTerminal platform spec.

---

## Standard Build Flow Per Client

1. Duplicate this project into a new repo.
2. Replace site identity (name, logo, copy, color system, typography).
3. Build custom pages and components while preserving all four wiring layers.
4. Design the blog listing and post pages to match the client's brand.
5. Design the contact form to match the client's brand (keep submission target as `/api/contact`).
6. Configure workspace domain + tenant slug + public key in xTerminal.
7. Set project env vars and deploy.
8. Run launch QA:
   - runtime page reads resolve for target tenant
   - contact submission appears in correct workspace CRM
   - blog posts published in xTerminal admin appear on the live site
   - blog post pages render correct per-post SEO metadata
   - SEO tags render in page source when `site_settings` are configured
   - `robots.txt` returns `Disallow: /` when indexing is off
   - `sitemap.xml` returns valid XML with all public pages + published blog posts
   - admin preview points to custom domain

---

## Agent-Friendly Rules

- Keep structure developer-owned (pages/routes/components) and content client-editable.
- Do not hardcode workspace-specific secrets in source.
- Preserve tenant-scoped runtime headers and slug wiring.
- Keep contact form browser requests same-origin and forward server-side. Never convert to direct cross-origin calls.
- Keep blog reads going through `lib/runtime-api.ts`. Never hardcode blog content or bypass the runtime adapter.
- Preserve the SEO injection components and routes — do not remove or bypass them.
- Do not hardcode GTM container IDs, OG values, or any SEO settings in the layout. Everything reads from `site_settings` at runtime.
- Blog post pages must implement `generateMetadata()` for per-post SEO. Do not rely solely on layout-level defaults for blog content.
- Sitemap must include published blog post URLs. Do not generate a static sitemap that omits dynamic content.
- Treat this repo as baseline infrastructure; client repos own branding and UX.
