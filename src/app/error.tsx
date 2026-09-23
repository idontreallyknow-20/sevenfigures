'use client'
import Link from 'next/link'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="font-serif text-3xl font-light mb-3">Something went wrong</h1>
      <p className="font-serif text-base mb-8" style={{ color: 'var(--ink-muted)' }}>
        This page failed to load. It&apos;s usually a data provider hiccup, so try again.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="text-xs px-4 py-2 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
          try again
        </button>
        <Link href="/" className="btn text-xs px-4 py-2 font-mono" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
          back to watchlist
        </Link>
      </div>
    </main>
  )
}
