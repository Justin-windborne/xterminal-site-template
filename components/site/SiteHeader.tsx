'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronRight, Terminal } from 'lucide-react'
import { APP_BASE_URL } from '@/lib/site'

export default function SiteHeader({ subtitle = 'Platform' }: { subtitle?: string }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 mb-10 flex items-center justify-between border border-stone-800/90 bg-stone-950/85 px-4 py-3 backdrop-blur">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            <Terminal size={15} />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold tracking-tight text-stone-100">Site Name</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-400">{subtitle}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group inline-flex items-center text-xs font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                <ChevronRight
                  size={13}
                  className={`mr-1.5 transition-all duration-200 ease-out ${
                    isActive
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`}
                />
                {item.label}
              </Link>
            )
          })}
          <a href={`${APP_BASE_URL}/admin/login`} className="btn-invert-dark px-3 py-2 text-xs font-medium">
            Login
          </a>
          <a href={`${APP_BASE_URL}/admin/signup`} className="btn-invert-light px-3 py-2 text-xs font-semibold">
            Get Started
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="relative flex h-9 w-9 items-center justify-center border border-stone-700 bg-stone-900/70 text-stone-100 transition-colors hover:border-stone-500 hover:bg-stone-800 md:hidden"
        >
          <span
            className={`absolute h-0.5 w-4 bg-current transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'
            }`}
          />
          <span
            className={`absolute h-0.5 w-4 bg-current transition-opacity duration-200 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute h-0.5 w-4 bg-current transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'
            }`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <nav
          className={`relative mt-[68px] h-[calc(100dvh-68px)] border-t border-stone-800 bg-stone-950/98 px-6 py-7 transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border border-stone-800 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-white text-black'
                        : 'bg-stone-950/80 text-stone-200 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <a href={`${APP_BASE_URL}/admin/login`} className="btn-invert-dark inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium">
                Login
              </a>
              <a href={`${APP_BASE_URL}/admin/signup`} className="btn-invert-light inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold">
                Get Started
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
