import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { APP_BASE_URL } from '@/lib/site'

export default function SiteFooter() {
  return (
    <footer className="mt-12 border border-stone-800 bg-stone-950/80 p-6 sm:mt-14 md:mt-16">
      <div className="grid gap-6 md:flex md:items-start md:justify-between">
        <div className="md:max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-white text-black">
              <Terminal size={15} />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold tracking-tight text-stone-100">Site Name</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">Platform</p>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm text-stone-400">
            Starter shell for client-owned website operations with tenant-scoped runtime wiring.
          </p>
        </div>

        <div className="grid gap-6 md:ml-auto md:grid-cols-3 md:pl-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Site</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/features" className="text-stone-300 transition-colors hover:text-white">Features</Link>
              <Link href="/about" className="text-stone-300 transition-colors hover:text-white">About</Link>
              <Link href="/pricing" className="text-stone-300 transition-colors hover:text-white">Pricing</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Resources</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/blog" className="text-stone-300 transition-colors hover:text-white">Blog</Link>
              <Link href="/contact" className="text-stone-300 transition-colors hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Workspace</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href={`${APP_BASE_URL}/admin/signup`} className="text-stone-300 transition-colors hover:text-white">Create Workspace</a>
              <a href={`${APP_BASE_URL}/admin/login`} className="text-stone-300 transition-colors hover:text-white">Sign In</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-stone-800 pt-4 text-xs text-stone-500 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Site Name. All rights reserved.</p>
        <p className="font-mono uppercase tracking-[0.16em]">Built with tenant-scoped runtime operations.</p>
      </div>
    </footer>
  )
}
