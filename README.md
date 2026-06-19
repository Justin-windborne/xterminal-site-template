# Client Site Template Foundation

Brand-neutral starter frontend for client website projects that can later connect to an xTerminal workspace backend.

## Purpose

Use this project as a repeatable baseline for developer teams and developer agents:

- Start with a clean, debranded structure
- Build custom UI/UX for each client brand
- Keep runtime wiring consistent across projects
- Connect to xTerminal workspace backend only when the site is ready

## What This Template Includes

- Next.js + TypeScript + Tailwind foundation
- Generic marketing shell (header, footer, page sections)
- Runtime API adapter (`lib/runtime-api.ts`)
- Same-origin contact proxy (`app/api/contact/route.ts`)
- Neutral env contract for tenant-scoped runtime wiring

## What This Template Does NOT Include

- xTerminal-specific branding, copy, domains, or assets
- Client-specific design system tokens
- Backend secrets

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

- `NEXT_PUBLIC_SITE_URL` - canonical site URL for this frontend
- `NEXT_PUBLIC_APP_BASE_URL` - workspace app/dashboard base URL
- `XT_BACKEND_CONTACT_ENDPOINT` - backend contact endpoint for proxy forwarding
- `NEXT_PUBLIC_MARKETING_ASSET_BASE_URL` - optional remote media origin
- `NEXT_PUBLIC_XT_API_BASE_URL` - xTerminal backend base URL for runtime reads
- `NEXT_PUBLIC_XT_TENANT_SLUG` - tenant slug for workspace-scoped reads/writes
- `NEXT_PUBLIC_XT_PUBLIC_API_KEY` - tenant public runtime key (if required)

## Standard Build Flow Per Client

1. Duplicate this project into a new repo.
2. Replace site identity (name, logo, copy, color system, typography).
3. Build custom pages/components while preserving runtime adapter contracts.
4. Configure workspace domain + tenant slug + public key in xTerminal.
5. Set project env vars and deploy.
6. Run launch QA:
   - runtime page reads
   - contact submission appears in correct workspace
   - admin preview points to custom domain

## Workspace Entities (Custom Content Types)

The runtime API adapter includes `getEntities(type)` for fetching workspace entity data (team members, testimonials, services, etc.) managed through the xTerminal admin dashboard.

### Usage

```typescript
import { getEntities } from '@/lib/runtime-api'
import type { EntityItem } from '@/lib/runtime-api'

const members = await getEntities('team_member')
// members[].data contains: name, title, bio, photo_url, email, etc.
```

### Available Entity Types

| Type | Key | Fields |
|------|-----|--------|
| Team Members | `team_member` | name, title, bio, photo_url, email, phone, linkedin_url, show_email, show_phone, show_linkedin |
| Menu Items | `menu_item` | category, name, description, gluten_free, vegetarian, vegan, spicy, on_lunch, on_dinner, market_price, price_lunch, price_dinner, options_lunch, options_dinner |
| Menu Sections | `menu_section` | slug, label, note_lunch, note_dinner |

> **Menu (restaurant) is an Advanced-tier feature.** `menu_item` and `menu_section`
> are activated together via **+ Add content type → Menu Control** in the admin.
> The data contract, fixed section slugs, and rendering rules are defined in
> `docs/MENU_ENTITY_CONTRACT.md` in the xTerminal platform repo — match the field
> keys and category/slug semantics exactly; only presentation (fonts, colors,
> spacing) should vary per restaurant.

### Sample Pages

- `/team` — Team members page (see `app/team/page.tsx`)
- `/menu` — Restaurant menu with Lunch/Dinner tabs (see `app/menu/page.tsx` + `components/site/MenuView.tsx`)

Entity data is sorted by `sort_order` and only active entities are returned by the public API. Toggle fields (e.g. `show_email`) control which contact details are exposed — respect them in your templates.

## Agent-Friendly Rules

- Keep structure developer-owned (pages/routes/components) and content client-editable.
- Do not hardcode workspace-specific secrets.
- Preserve tenant-scoped runtime headers and slug wiring.
- Keep contact form browser requests same-origin and forward server-side.
- Treat this repo as baseline infrastructure; client repos own branding and UX.
