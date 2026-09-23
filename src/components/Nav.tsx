'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

const LINKS = [
  { href: '/', label: 'Watchlist' },
  { href: '/journal', label: 'Journal' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
]

export function Nav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' || pathname.startsWith('/stock') : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--bg)', borderBottom: '0.5px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-6">
        <Link href="/" className="h-11 flex items-center font-serif text-base font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>
          sevenfigures
        </Link>
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="sm:order-last text-xs px-2 py-1 rounded"
          style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}
        >
          {theme === 'light' ? 'dark' : 'light'}
        </button>
        <nav aria-label="Main" className="order-last sm:order-none w-full sm:w-auto sm:flex-1 -mx-1 pb-2 sm:pb-0 overflow-x-auto">
          <ul className="flex sm:gap-1">
            {LINKS.map(l => {
              const active = isActive(l.href)
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block whitespace-nowrap px-2 sm:px-3 py-1 text-xs rounded transition-colors ${
                      active ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'hover:bg-[var(--hover)]'
                    }`}
                    style={{ color: active ? undefined : 'var(--ink-muted)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
