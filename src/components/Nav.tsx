'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export function Nav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const links = [
    { href: '/', label: 'Watchlist' },
    { href: '/journal', label: 'Journal' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/compare', label: 'Compare' },
  ]

  return (
    <nav className="border-b border-hair sticky top-0 z-50" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-base font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>
            sevenfigures
          </Link>
          <div className="flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  pathname === l.href ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--border)]'
                }`}
                style={{ color: pathname === l.href ? undefined : 'var(--ink-muted)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={toggle}
          className="text-xs px-2 py-1 rounded"
          style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}
        >
          {theme === 'light' ? 'dark' : 'light'}
        </button>
      </div>
    </nav>
  )
}
