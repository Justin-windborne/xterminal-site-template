# SEO & Tracking — Implementation Instructions

> **Prerequisite:** Read `README.md` and `AGENT_GUIDE.md` in this repo before working on this. This document assumes familiarity with the template's architecture layers, wiring contracts, and the xTerminal dashboard's block system and admin design patterns (documented in the xTerminal dashboard repo's `CLAUDE.md`).

---

## What This Adds

A site-wide SEO & Tracking settings panel in the admin dashboard. Clients configure their own tracking, search engine verification, social sharing defaults, and indexing controls. The root layout injects the corresponding tags server-side. No per-client custom code — this ships with the template.

**Six features:**

1. Google Tag Manager container injection
2. Google Search Console verification meta tag
3. Open Graph & social sharing defaults
4. Robots / indexing toggle
5. Automatic XML sitemap
6. Favicon & site identity

All features follow the same pattern: a field in `site_settings` → a conditional tag in the root layout `<head>`.

---

## Database Changes

### Migration: Add SEO columns to `site_settings`

Create a new migration file in `supabase/migrations/`. Add these columns to the existing `site_settings` table:

```sql
-- SEO & Tracking fields
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS gtm_container_id text,
  ADD COLUMN IF NOT EXISTS google_verification text,
  ADD COLUMN IF NOT EXISTS og_default_title text,
  ADD COLUMN IF NOT EXISTS og_default_description text,
  ADD COLUMN IF NOT EXISTS og_default_image text,
  ADD COLUMN IF NOT EXISTS twitter_handle text,
  ADD COLUMN IF NOT EXISTS allow_indexing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS apple_touch_icon_url text;
```

**Notes:**
- `allow_indexing` defaults to `false`. New sites are not indexed until explicitly enabled.
- `og_default_image`, `favicon_url`, and `apple_touch_icon_url` store Supabase Storage public URLs after upload.
- `site_title` should already exist in the table. If not, add it. Do not create a duplicate.
- No new tables. No new RLS policies needed — these columns inherit the existing `site_settings` row-level security.

### Update `lib/types.ts`

Add the new fields to the `SiteSettings` TypeScript interface:

```typescript
// Add to existing SiteSettings interface
gtm_container_id?: string | null;
google_verification?: string | null;
og_default_title?: string | null;
og_default_description?: string | null;
og_default_image?: string | null;
twitter_handle?: string | null;
allow_indexing: boolean;
favicon_url?: string | null;
apple_touch_icon_url?: string | null;
```

---

## Root Layout Injection

This is the core of the feature. The root layout (`app/layout.tsx`) fetches `site_settings` server-side and conditionally renders tags in `<head>` and `<body>`.

### Fetch settings

The layout is a server component. Fetch SEO settings alongside any existing `site_settings` fetch. If Supabase is not configured, all SEO fields are null and nothing renders.

### Injection logic

Create a server component `components/seo/SeoHead.tsx` that accepts the settings object and returns the appropriate tags. Import it in the root layout.

```
app/layout.tsx
  └── <SeoHead settings={siteSettings} />   ← in <head>
  └── <GtmNoscript containerId={...} />     ← immediately after <body>
```

### Tag output by feature

**1. GTM (when `gtm_container_id` is not null)**

Validate format matches `GTM-[A-Z0-9]{5,7}` before rendering. If invalid, skip silently.

In `<head>`:
```html
<script dangerouslySetInnerHTML={{ __html: `
  (function(w,d,s,l,i){w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${containerId}');
`}} />
```

Immediately after `<body>`:
```html
<noscript>
  <iframe src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
    height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
</noscript>
```

**2. Google Search Console (when `google_verification` is not null)**

```html
<meta name="google-site-verification" content={googleVerification} />
```

Strip any `<meta>` tag wrapper if the stored value contains markup. Store only the content attribute value.

**3. Open Graph defaults (when any OG field is not null)**

```html
<meta property="og:title" content={ogTitle || siteTitle} />
<meta property="og:description" content={ogDescription} />
<meta property="og:image" content={ogImage} />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
{twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
```

These are **fallbacks**. If individual pages implement their own OG tags via `generateMetadata()`, those take priority. The layout-level tags apply to pages that don't override them.

**4. Robots (when `allow_indexing` is false)**

```html
<meta name="robots" content="noindex, nofollow" />
```

When `allow_indexing` is true, do not render the tag (default browser behavior is to allow indexing).

**5. Favicon (when `favicon_url` is not null)**

```html
<link rel="icon" href={faviconUrl} />
{appleTouchIconUrl && <link rel="apple-touch-icon" href={appleTouchIconUrl} />}
```

**6. Site title**

Use `site_title` as the default `<title>` in the root layout metadata. Individual pages can override via their own `generateMetadata()`.

---

## Sitemap Route

Create `app/sitemap.xml/route.ts` (or use Next.js `app/sitemap.ts` convention).

### Logic

1. Check `allow_indexing` from `site_settings`. If false, return a 404 or empty sitemap.
2. Read the page structure from `site.config.ts` → `sections[]` to get all public page slugs.
3. Query `pages` table for `updated_at` timestamps to populate `<lastmod>`.
4. Query `blog_posts` table for published posts (if any exist) and include their URLs.
5. Output valid XML sitemap.

### Sitemap entries

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{domain}/</loc>
    <lastmod>{updated_at}</lastmod>
  </url>
  <!-- one <url> per public page from sections[] -->
  <!-- one <url> per published blog post -->
</urlset>
```

The domain should come from an environment variable (e.g., `NEXT_PUBLIC_SITE_URL`) or from the request host.

---

## Robots.txt Route

Create `app/robots.txt/route.ts` (or use Next.js `app/robots.ts` convention).

### Logic

1. Check `allow_indexing` from `site_settings`.
2. If false: return `User-agent: *\nDisallow: /`
3. If true: return standard allow rules with sitemap reference:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://{domain}/sitemap.xml
```

Always disallow `/admin` and `/api` regardless of indexing toggle.

---

## Admin Dashboard UI

### Where it lives

Add an **SEO & Tracking** section to the existing Settings page in the admin dashboard. This is not a new sidebar tile — it's a section within Settings, accessible via the existing Settings route.

### Component structure

Create `components/admin/SeoSettings.tsx`. This component:

1. Fetches the current `site_settings` SEO fields on mount
2. Renders six collapsible cards (one per feature)
3. Saves changes via the existing `/api/admin/pages` pattern (or a new `/api/admin/settings` route if settings saves are handled separately)

### Card layout per feature

Each card follows the existing admin design system:

- White card, `rounded-2xl`, `border-stone-200/60`, `shadow-sm`
- Header row: icon (lucide) + feature name + status badge + chevron toggle
- Collapsed: shows only header row with status
- Expanded: shows form fields

### Status badges

| Feature | Configured | Not configured |
|---------|-----------|----------------|
| GTM | Green dot + "Active" | Gray dot + "Not configured" |
| Search Console | Green dot + "Verified" | Gray dot + "Not set" |
| Social sharing | Green dot + "Configured" (when OG image exists) / Amber dot + "Incomplete" (partial) | Gray dot + "Not set" |
| Indexing | Green dot + "Indexable" | Amber dot + "Not indexed" |
| Sitemap | Always shows URL with copy button | — |
| Favicon | Thumbnail preview of uploaded icon | Gray dot + "Default" |

### Form fields per card

**GTM:**
- Text input: `gtm_container_id`
- Placeholder: `GTM-XXXXXXX`
- Client-side validation: regex `^GTM-[A-Z0-9]{5,7}$`
- Help text: "Paste your Google Tag Manager container ID. Manage all tracking tags through Google's interface."

**Search Console:**
- Text input: `google_verification`
- Placeholder: "Verification code"
- Help text: "Paste the content value from your Google Search Console verification meta tag."
- On save: strip `<meta>` wrapper markup if detected, extract content attribute value only

**Social Sharing:**
- Text input: `og_default_title` — placeholder: site name
- Textarea: `og_default_description` — placeholder: "A brief description of your business"
- Image upload: `og_default_image` — label: "Default sharing image" — note: "Recommended 1200×630px"
- Text input: `twitter_handle` — placeholder: "@yourbusiness"
- Help text: "These appear when someone shares a link to your site on social media."

**Indexing:**
- Toggle: `allow_indexing`
- Label: "Allow search engines to index this site"
- When OFF, show amber warning: "Your site is hidden from search engines. Enable this when your site is ready to go live."

**Sitemap:**
- No input fields. Display-only.
- Show the sitemap URL: `{site_url}/sitemap.xml`
- Copy button next to the URL
- Help text: "Submit this URL in Google Search Console to help Google discover your pages."

**Favicon:**
- Image upload: `favicon_url` — accept `.ico`, `.png`, `.svg`
- Image upload: `apple_touch_icon_url` — label: "Apple Touch Icon" — note: "180×180px PNG for iOS home screens. Optional."
- Preview: show the current favicon at actual size next to the upload

### Field labels

Follow existing admin typography: 11px uppercase `font-mono` labels with `tracking-wider`. Match the pattern used in `SectionEditor.tsx`.

### Save behavior

Match the existing save pattern: stone-900 save button → emerald-600 on success. Save all SEO fields in a single API call. The save handler should validate GTM format and strip Search Console markup before writing to Supabase.

---

## Image Uploads

`og_default_image`, `favicon_url`, and `apple_touch_icon_url` require file uploads to Supabase Storage.

### Storage bucket

Use an existing public bucket or create one named `seo-assets` (or similar). Files must be publicly accessible since they're referenced in `<head>` tags served to browsers and crawlers.

### Upload flow

1. Client selects a file in the admin form
2. Frontend uploads to Supabase Storage via the client-side Supabase instance (anon key is sufficient for storage uploads if bucket policies allow)
3. On success, store the public URL in the corresponding `site_settings` column
4. Display a preview in the form

### File constraints

| Field | Accepted types | Max size | Notes |
|-------|---------------|----------|-------|
| `og_default_image` | .jpg, .png, .webp | 2MB | Recommend 1200×630px |
| `favicon_url` | .ico, .png, .svg | 500KB | — |
| `apple_touch_icon_url` | .png | 500KB | Must be 180×180px |

---

## Validation Rules

All validation runs both client-side (for immediate feedback) and server-side (in the API route before writing to Supabase).

| Field | Rule |
|-------|------|
| `gtm_container_id` | Regex: `^GTM-[A-Z0-9]{5,7}$`. Reject anything else. |
| `google_verification` | Non-empty string. Strip `<meta>` wrapper if present. |
| `og_default_description` | Max 200 characters (OG descriptions are truncated by platforms beyond this). |
| `twitter_handle` | Must start with `@`. Strip if user forgets, prepend automatically. |
| `allow_indexing` | Boolean only. |
| Image URLs | Must be valid Supabase Storage URLs from the expected bucket. Do not accept arbitrary external URLs. |

---

## API Route

If settings saves currently go through `/api/admin/pages`, evaluate whether SEO settings should use the same route or a dedicated `/api/admin/settings` route. The save payload is different (flat key-value pairs vs. block content arrays), so a separate route is cleaner.

### Route: `app/api/admin/settings/route.ts`

- **Auth:** Verify the request comes from an authenticated admin session. Same pattern as `/api/admin/pages`.
- **Method:** `PATCH` — partial updates. Only write fields that are present in the request body.
- **Validation:** Run all validation rules from the table above before writing.
- **Write:** Use the service role key to update `site_settings` in Supabase.
- **Response:** Return the updated settings object.

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/XXX_add_seo_fields.sql` | Add SEO columns to `site_settings` |
| `components/seo/SeoHead.tsx` | Server component — renders conditional `<head>` tags |
| `components/seo/GtmNoscript.tsx` | Server component — renders GTM noscript iframe after `<body>` |
| `components/admin/SeoSettings.tsx` | Admin panel — SEO & Tracking settings section |
| `app/sitemap.xml/route.ts` | Auto-generated XML sitemap (or `app/sitemap.ts`) |
| `app/robots.txt/route.ts` | Dynamic robots.txt (or `app/robots.ts`) |
| `app/api/admin/settings/route.ts` | API route for saving settings (if not reusing existing route) |

## Files to Modify

| File | Change |
|------|--------|
| `app/layout.tsx` | Import and render `SeoHead` in `<head>`, `GtmNoscript` after `<body>`. Fetch `site_settings` server-side. |
| `lib/types.ts` | Add SEO fields to `SiteSettings` interface |
| `app/admin/settings/page.tsx` (or equivalent) | Add `SeoSettings` component to the settings page |

---

## MUST NOT DO

1. **NEVER render GTM or any tracking script when the container ID is null or invalid.** Fail silently — no broken script tags, no console errors.
2. **NEVER expose the service role key to the admin frontend.** All settings writes go through the server-side API route.
3. **NEVER accept arbitrary URLs for image fields.** Only accept Supabase Storage URLs from the expected bucket.
4. **NEVER hardcode a GTM container ID or any SEO value in the layout.** Everything comes from `site_settings` at request time.
5. **NEVER render `noindex` when `allow_indexing` is true.** The absence of the robots meta tag is what allows indexing — do not render an `index, follow` tag, just render nothing.
6. **NEVER create a new sidebar tile for SEO settings.** This is a section within the existing Settings page, not a new top-level nav item.

---

## Build Order

Each feature is independent. Ship them in this order for maximum early value:

1. **Robots / indexing toggle + robots.txt route** — protects staging sites immediately
2. **Favicon & site title injection** — visible to every client, high perceived polish
3. **GTM container** — unlocks full tracking stack
4. **Sitemap route** — automatic, pairs with step 5
5. **Search Console verification** — one field, one meta tag
6. **OG / social sharing defaults** — most fields, lowest urgency but high polish
