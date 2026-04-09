# Agent Guide: Client Site Template Foundation

This guide is for developer agents and developers who clone this template for new client website builds.

## Core Objective

Build custom frontend UI/UX while preserving the runtime wiring, SEO injection layer, contact proxy, blog integration, and tenant-scoped contracts.

## Preserve These Contracts

### Contact Form (write path)

1. Keep contact form browser submits same-origin (`/api/contact`). The form component posts to this route — never directly to the xTerminal backend.
2. Keep server-side proxy forwarding to `XT_BACKEND_CONTACT_ENDPOINT`.
3. Keep tenant scoping header on proxy requests (`x-xt-tenant-slug`).
4. The contact form design is fully customizable. The submission target and proxy pattern are not.

### Blog (read path)

5. Keep blog data reads going through `lib/runtime-api.ts`. Never hardcode blog content, mock post data in production, or bypass the runtime adapter.
6. Blog listing (`app/(public)/blog/page.tsx`) fetches published posts from the runtime API. Design the listing however you want — cards, grid, list — but the data source is the API.
7. Blog post pages (`app/(public)/blog/[slug]/page.tsx`) fetch individual posts by slug. Each post page must implement `generateMetadata()` for per-post SEO (title, description, OG image from `cover_image_url`, Article JSON-LD structured data).
8. Only posts where `is_published` is true and `published_at` is in the past should render. The public API enforces this, but the frontend should also handle cases where a direct URL hits a non-published slug (404 gracefully).
9. The sitemap must include published blog post URLs with `<lastmod>` timestamps. Do not generate a static sitemap that omits blog content.

### Runtime + Content Reads

10. Keep runtime adapter endpoint shape in `lib/runtime-api.ts`. All reads from xTerminal (pages, blog posts, site settings) go through this adapter.
11. Keep env variable names unchanged unless you migrate all docs and deployment configs.

### SEO & Tracking

12. Keep `components/seo/SeoHead.tsx` imported in the root layout `<head>`. Do not remove or bypass it.
13. Keep `components/seo/GtmNoscript.tsx` rendered immediately after `<body>` in the root layout.
14. Keep `app/sitemap.xml/route.ts` and `app/robots.txt/route.ts` functional and deployed.
15. All SEO values must come from `site_settings` at request time. Never hardcode GTM IDs, OG values, verification codes, or favicon URLs in the layout or components.
16. The SEO layer must fail silently when settings are null or the backend is not connected. No broken tags, no console errors, no empty attribute values in rendered HTML.

### Block Rendering

17. If the site uses `BlockRenderer.tsx`, preserve its component mapping pattern. New block types are added by creating a component and adding it to the map — never by modifying the renderer logic itself.
18. Block components accept `{ data }` props. Never hardcode content inside them.

## Allowed Customization

- Full component and page redesign (typography, color, layout, animation)
- Route architecture expansion (new pages, new dynamic routes)
- Content model changes on the frontend
- Adding new block type components and mappings
- Complete redesign of blog listing and post pages (layout, cards, typography, animations)
- Complete redesign of contact form (fields, layout, validation UX, success/error states)
- Overriding default OG tags at the page level via `generateMetadata()` (the layout-level SEO tags are fallbacks — page-level overrides take priority)
- Restyling the sitemap or robots.txt output format (as long as they remain valid XML/text)

## Disallowed by Default

- Hardcoding workspace secrets in source
- Removing tenant slug wiring from contact/runtime requests
- Converting contact form submits to direct browser cross-origin calls to the xTerminal backend
- Hardcoding blog post content or bypassing the runtime API for blog data
- Omitting `generateMetadata()` on blog post pages (every post needs per-post SEO)
- Removing or bypassing the SEO injection components (`SeoHead`, `GtmNoscript`)
- Hardcoding any SEO value (GTM container ID, OG image, favicon, etc.) in layout or component code
- Rendering tracking scripts when their corresponding setting is null or invalid
- Exposing `SUPABASE_SERVICE_ROLE_KEY` to client-side code
- Generating a static sitemap that excludes blog posts

## Wiring Custom Features

When a client needs an editable content type that doesn't exist in the base template (e.g., restaurant hours, pickup specials, event listings), the wiring pattern is:

### On the xTerminal platform side (not in this repo)

1. A block type definition is written to `workspace_block_types` for the client's workspace. This defines the type key, editable fields, and default data.
2. The xTerminal admin reads this definition and auto-generates the editing form.

### In this repo

3. Create a React component in `components/blocks/` that renders the content. It accepts `{ data }` props with keys matching the field names from the block type definition.
4. Add the component to the type → component map in `BlockRenderer.tsx`.
5. Deploy.

### The contract between them

The `type_key` string is the link. The xTerminal block definition and the client site component must agree on the same `type_key` and the same `data` field names. If they don't match, the admin will save data the frontend doesn't know how to render (or vice versa).

### Rules for custom features

- Never modify `BlockRenderer.tsx` logic to handle a specific block type differently. The renderer is generic.
- Never put admin editing UI in block components. Admin lives in xTerminal, not here.
- Handle missing or partial data gracefully. When a block type is newly added, existing saved content won't have the new fields. Default to empty/hidden, not crash.

## New Client Bootstrap

1. Clone this template into a new repo.
2. Set `.env.local` from `.env.example`.
3. Configure tenant slug + public key for the target workspace.
4. Replace placeholder content and brand identity.
5. Design blog listing and post pages to match the client's brand.
6. Design the contact form to match the client's brand.
7. Build custom pages and block components for the client's needs.
8. If the client needs custom editable content types, coordinate with xTerminal side to create matching `workspace_block_types` entries.
9. Deploy to Vercel.
10. Run QA.

## QA Checklist

### Contact Form

- [ ] Contact form submits to `/api/contact` (same-origin, not cross-origin)
- [ ] Submission appears in the correct workspace's CRM in xTerminal admin
- [ ] Form shows appropriate success/error states to the user
- [ ] Submission works with the tenant slug correctly identifying the workspace

### Blog

- [ ] Blog listing page displays posts published in xTerminal admin
- [ ] Blog listing only shows published posts (not drafts or future-scheduled)
- [ ] Individual blog post pages render full article content
- [ ] Blog post pages render cover image when `cover_image_url` is set
- [ ] Blog post pages implement `generateMetadata()` — check page source for per-post `og:title`, `og:description`, `og:image`
- [ ] Blog post pages include Article JSON-LD structured data
- [ ] Direct URL to an unpublished or non-existent post returns 404
- [ ] New posts published in xTerminal admin appear on the live site without a deploy

### Runtime

- [ ] `npm run dev` starts without errors
- [ ] Runtime API reads resolve for target tenant
- [ ] Page block content from xTerminal renders correctly via `BlockRenderer`

### SEO & Tracking (with backend connected)

- [ ] View page source — GTM script appears when `gtm_container_id` is set in `site_settings`
- [ ] View page source — GTM script is absent when `gtm_container_id` is null
- [ ] View page source — OG meta tags render with correct values from `site_settings`
- [ ] View page source — `google-site-verification` meta tag appears when set
- [ ] View page source — `<meta name="robots" content="noindex, nofollow">` appears when `allow_indexing` is false
- [ ] View page source — no robots meta tag when `allow_indexing` is true
- [ ] `/robots.txt` returns `Disallow: /` when indexing is off
- [ ] `/robots.txt` returns allow rules + sitemap URL when indexing is on
- [ ] `/sitemap.xml` returns valid XML with all public page URLs + published blog post URLs
- [ ] Favicon displays in browser tab when `favicon_url` is set

### SEO & Tracking (without backend)

- [ ] No broken script tags or console errors when `site_settings` are unavailable
- [ ] Page renders normally — SEO layer degrades silently to no-op
- [ ] `/robots.txt` and `/sitemap.xml` return gracefully (404 or empty, not 500)

### Custom Features (if applicable)

- [ ] Custom block components render correctly with data from xTerminal
- [ ] Block components handle missing/partial data without crashing
- [ ] New blocks appear in xTerminal admin with correct editable fields
