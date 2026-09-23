import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>404</p>
      <h1 className="font-serif text-3xl font-light mb-3">Nothing at this address</h1>
      <p className="font-serif text-base mb-8" style={{ color: 'var(--ink-muted)' }}>
        The page or ticker you&apos;re looking for isn&apos;t on the watchlist.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn text-xs px-4 py-2 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
          back to watchlist
        </Link>
        <Link href="/stock/new" className="btn text-xs px-4 py-2 font-mono" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
          + add a security
        </Link>
      </div>
    </main>
  )
}
