'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { JournalEntry } from '@/lib/types'

const ACTIONS = ['buy', 'sell', 'add', 'trim', 'hold', 'note'] as const

const ACTION_COLORS: Record<string, string> = {
  buy: 'var(--positive)', add: 'var(--positive)', sell: 'var(--negative)',
  trim: 'var(--caution)', hold: 'var(--accent)', note: 'var(--ink-muted)',
}

export function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const [tickerFilter, setTickerFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filtered = entries.filter(e => {
    if (tickerFilter && e.ticker !== tickerFilter) return false
    if (actionFilter && e.action !== actionFilter) return false
    return true
  })

  const tickers = Array.from(new Set(entries.map(e => e.ticker).filter(Boolean))).sort() as string[]
  const filtering = !!(tickerFilter || actionFilter)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-light">Decision journal</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}. An honest record of every decision.
          </p>
        </div>
        <Link href="/journal/new" className="btn text-xs px-3 py-1.5 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
          + new entry
        </Link>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <label className="sr-only" htmlFor="ticker-filter">Filter by ticker</label>
          <select
            id="ticker-filter"
            value={tickerFilter}
            onChange={e => setTickerFilter(e.target.value)}
            className="text-xs px-2 py-1 outline-none font-mono"
            style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
          >
            <option value="">all tickers</option>
            {tickers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="sr-only" htmlFor="action-filter">Filter by action</label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-xs px-2 py-1 outline-none font-mono"
            style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
          >
            <option value="">all actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-12 text-center" style={{ border: '0.5px solid var(--border)' }}>
          {filtering ? (
            <>
              <p className="font-serif text-base mb-3" style={{ color: 'var(--ink-muted)' }}>No entries match these filters.</p>
              <button onClick={() => { setTickerFilter(''); setActionFilter('') }} className="link text-xs">clear filters</button>
            </>
          ) : (
            <>
              <p className="font-serif text-base mb-2" style={{ color: 'var(--ink-muted)' }}>No entries yet.</p>
              <p className="text-xs mb-6" style={{ color: 'var(--ink-faint)' }}>Log why you bought, sold or held, so future you can check the reasoning.</p>
              <Link href="/journal/new" className="btn text-xs px-4 py-2 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>+ first entry</Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(e => (
            <li key={e.id} className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className="font-mono text-xs uppercase tracking-wider px-1.5 py-0.5"
                    style={{ border: '0.5px solid currentColor', color: ACTION_COLORS[e.action] }}
                  >
                    {e.action}
                  </span>
                  {e.ticker && (
                    <Link href={`/stock/${e.ticker}`} className="link font-mono text-sm font-medium">
                      {e.ticker}
                    </Link>
                  )}
                  {e.conviction != null && (
                    <span className="text-xs font-mono" style={{ color: 'var(--ink-faint)' }}>conviction {e.conviction}/5</span>
                  )}
                </div>
                <time dateTime={e.created_at} className="font-mono text-xs shrink-0" style={{ color: 'var(--ink-faint)' }}>
                  {e.created_at.split('T')[0]}
                </time>
              </div>
              {e.reasoning && (
                <div className="mb-2">
                  <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>Reasoning</div>
                  <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>{e.reasoning}</p>
                </div>
              )}
              {e.expectation && (
                <div>
                  <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>Expected</div>
                  <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink-muted)' }}>{e.expectation}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
