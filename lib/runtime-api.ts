const API_BASE_URL = process.env.NEXT_PUBLIC_XT_API_BASE_URL?.replace(/\/$/, '')
const TENANT_SLUG = process.env.NEXT_PUBLIC_XT_TENANT_SLUG || 'default'
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_XT_PUBLIC_API_KEY

function getHeaders(): HeadersInit {
  return PUBLIC_API_KEY
    ? {
        'x-xt-public-api-key': PUBLIC_API_KEY,
      }
    : {}
}

async function fetchRuntime(path: string) {
  if (!API_BASE_URL) return null
  const res = await fetch(`${API_BASE_URL}/api/public/v1/tenants/${TENANT_SLUG}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getRuntimeSiteSettings() {
  return fetchRuntime('/site-settings')
}

export async function getRuntimePage(slug: string) {
  return fetchRuntime(`/pages/${slug}`)
}

export async function getRuntimeBlogPosts() {
  return fetchRuntime('/blog-posts')
}

export async function getRuntimeBlogPost(slug: string) {
  return fetchRuntime(`/blog-posts/${slug}`)
}

export interface EntityItem {
  id: string
  entity_type: string
  data: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export async function getEntities(type: string): Promise<EntityItem[]> {
  const body = await fetchRuntime(`/entities/${type}`)
  return body?.data ?? []
}
