import type { Metadata } from 'next'
import ContactForm from '@/components/site/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Template',
  description: 'Tenant-scoped contact submission template for client website projects.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <section className="mb-20 flex min-h-[calc(100svh-7rem)] flex-col justify-center border border-stone-800 bg-stone-950/80 px-5 py-10 sm:mb-24 sm:px-7 sm:py-12 md:mb-32 md:min-h-[calc(100svh-8rem)] md:px-10 md:py-14 lg:mb-36">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Contact</p>
        <h1 className="mt-2 max-w-4xl font-sans text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl md:text-5xl">
          Template contact flow with tenant-scoped backend routing.
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-stone-300 md:text-base">
          Use this as baseline and customize field UX and copy per client while preserving submission contract.
        </p>
      </section>
      <ContactForm />
    </>
  )
}
