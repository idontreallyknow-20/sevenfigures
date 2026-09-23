import Link from 'next/link'
import { AUTHOR } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-16" style={{ borderTop: '0.5px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs" style={{ color: 'var(--ink-muted)' }}>
        <p>
          Built by{' '}
          <a href={AUTHOR.hub} rel="author" className="link">Joseph Leung</a>
          {' '}in Richmond Hill, Ontario.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li><Link href="/about" className="link">About</Link></li>
          <li><a href={AUTHOR.dailyBrief} className="link">Daily Brief HQ</a></li>
          <li><a href={AUTHOR.repo} className="link">Source</a></li>
        </ul>
      </div>
    </footer>
  )
}
