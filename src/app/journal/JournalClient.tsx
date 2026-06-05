'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { JournalEntry } from '@/lib/types'

const ACTION_COLORS: Record<string, string> = {
  buy: '#1a5c35', add: '#2d6b53', sell: '#7a1a1a',
  trim: '#b85c00', hold: '#2a4a6b', note: '#5a5750',
}

export function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const [tickerFilter, setTickerFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filtered = entries.filter(e => {
    if (tickerFilter && e.ticker !== tickerFilter.toUpperCase()) return false
    if (actionFilter && e.action !== actionFilter) return false
    return true
  })

  const tickers = Array.from(new Set(entries.map(e => e.ticker).filter(Boolean))) as string[]

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light">Decision Journal</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
            {entries.length} entries · honest record of every decision
          </p>
        </div>
        <Link
          href="/journal/new"
          className="text-xs px-3 py-1.5"
          style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}
        >
          + new entry
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={tickerFilter}
          onChange={e => setTickerFilter(e.target.value)}
          className="text-xs px-2 py-1 outline-none font-mono"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
        >
          <option value="">all tickers</option>
          {tickers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="text-xs px-2 py-1 outline-none font-mono"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
        >
          <option value="">all actions</option>
          {['buy', 'sell', 'add', 'trim', 'hold', 'note'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No entries yet. <Link href="/journal/new" style={{ color: 'var(--accent)' }}>Add the first one →</Link></p>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-xs uppercase tracking-wider px-1.5 py-0.5"
                    style={{ border: `0.5px solid ${ACTION_COLORS[e.action]}60`, color: ACTION_COLORS[e.action] }}
                  >
                    {e.action}
                  </span>
                  {e.ticker && (
                    <Link href={`/stock/${e.ticker}`} className="font-mono text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                      {e.ticker}
                    </Link>
                  )}
                  {e.conviction && (
                    <span className="text-xs font-mono" style={{ color: 'var(--ink-faint)' }}>conviction {e.conviction}/5</span>
                  )}
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                  {e.created_at.split('T')[0]}
                </span>
              </div>
              {e.reasoning && (
                <div className="mb-2">
                  <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>Reasoning</div>
                  <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{e.reasoning}</p>
                </div>
              )}
              {e.expectation && (
                <div>
                  <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>Expected</div>
                  <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{e.expectation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
