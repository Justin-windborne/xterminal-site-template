import { NextResponse } from 'next/server'

const BACKEND_CONTACT_ENDPOINT =
  process.env.XT_BACKEND_CONTACT_ENDPOINT ||
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
  'https://app.example-platform.com/api/contact'

const TENANT_SLUG =
  process.env.XT_TENANT_SLUG ||
  process.env.NEXT_PUBLIC_XT_TENANT_SLUG ||
  'default'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const upstream = await fetch(BACKEND_CONTACT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-xt-tenant-slug': TENANT_SLUG,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit contact request' },
      { status: 500 }
    )
  }
}
