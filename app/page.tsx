import Link from 'next/link'
import type { Metadata } from 'next'
import { ShieldCheck, Layers, Zap, ArrowRight } from 'lucide-react'
import { APP_BASE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Client Site Template',
  description: 'Brand-neutral website foundation with tenant-scoped runtime wiring and operational controls.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <>
      <section className="mb-20 flex min-h-[calc(100svh-7rem)] flex-col justify-center border border-stone-800 bg-stone-950/80 px-5 py-10 sm:mb-24 sm:px-7 sm:py-12 md:mb-32 md:min-h-[calc(100svh-8rem)] md:px-10 md:py-14 lg:mb-36">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Client Site Foundation</p>
        <h1 className="max-w-4xl font-sans text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Build custom websites on one consistent operational baseline.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-300 sm:text-base md:mt-5 md:text-lg">
          Start from this neutral shell, customize brand and UX freely, then connect to tenant-scoped runtime APIs when the site is ready.
        </p>
        <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap md:mt-8">
          <a href={`${APP_BASE_URL}/admin/signup`} className="btn-invert-light inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold sm:justify-start">
            Create Workspace
            <ArrowRight size={14} />
          </a>
          <a href={`${APP_BASE_URL}/admin/login`} className="btn-invert-dark inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium sm:justify-start">
            Sign In
          </a>
        </div>
      </section>

      <section className="mb-20 grid gap-4 sm:mb-24 md:mb-32 md:grid-cols-3 lg:mb-36">
        {[
          {
            title: 'Tenant-Scoped Runtime',
            body: 'Route reads and writes by workspace slug so each client stays isolated while sharing one backend platform.',
            icon: ShieldCheck,
          },
          {
            title: 'Composable Frontend Freedom',
            body: 'Replace layout, styles, and interactions per project while preserving stable wiring contracts.',
            icon: Layers,
          },
          {
            title: 'Operational Consistency',
            body: 'Use one setup pattern for contact flow, runtime APIs, and dashboard handoff across every site.',
            icon: Zap,
          },
        ].map((item) => (
          <article key={item.title} className="border border-stone-800 bg-stone-950/80 p-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center border border-stone-700 bg-stone-900/80 text-stone-200">
              <item.icon size={16} />
            </div>
            <h2 className="font-sans text-lg font-semibold tracking-tight text-stone-100">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mb-20 border border-stone-800 bg-stone-950/80 p-7 sm:mb-24 md:mb-32 lg:mb-36">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Next Step</p>
        <h2 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          Replace this placeholder UI with your client-specific brand system.
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-stone-400">
          Keep the runtime adapter and tenant env contract intact, then deploy and connect your custom domain in workspace settings.
        </p>
        <div className="mt-6">
          <Link href="/contact" className="btn-invert-light inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
            Open contact template
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  )
}
