'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { DemoBanner } from '@/components/DemoBanner'
import { TierBadge } from '@/components/TierBadge'
import { Sparkline } from '@/components/Sparkline'
import type { Score, Tier, QuoteData } from '@/lib/types'

interface Row {
  ticker: string
  name: string
  theme: string | null
  sector: string | null
  source: string | null
  date_added: string
  score?: Score
  total: number
  tier: Tier
}

type SortKey = 'total' | 'valuation' | 'tier' | 'ticker' | 'date_added'

function tierOrder(t: Tier) {
  return { Core: 0, Buyable: 1, Watch: 2, Pass: 3 }[t]
}

export function WatchlistClient({ rows: initialRows }: { rows: Row[] }) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [spark, setSpark] = useState<Record<string, { date: string; close: number }[]>>({})
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showDemo, setShowDemo] = useState(false)

  const fetchQuotes = useCallback(async () => {
    try {
      const tickers = initialRows.map(r => r.ticker).join(',')
      const res = await fetch(`/api/quotes?tickers=${tickers}`)
      if (!res.ok) return
      const data = await res.json()
      setQuotes(data.quotes ?? {})
      setShowDemo(data.isDemo ?? false)
    } catch {}
  }, [initialRows])

  useEffect(() => {
    fetchQuotes()
    const id = setInterval(fetchQuotes, 60000)
    return () => clearInterval(id)
  }, [fetchQuotes])

  // 30-day mini chart per row (fetched once).
  useEffect(() => {
    let cancelled = false
    Promise.all(
      initialRows.map(r =>
        fetch(`/api/bars?ticker=${r.ticker}&days=30`)
          .then(res => res.json())
          .then(d => [r.ticker, d.bars ?? []] as const)
          .catch(() => [r.ticker, []] as const)
      )
    ).then(entries => {
      if (!cancelled) setSpark(Object.fromEntries(entries))
    })
    return () => { cancelled = true }
  }, [initialRows])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...initialRows].sort((a, b) => {
    let diff = 0
    if (sortKey === 'total') diff = a.total - b.total
    else if (sortKey === 'valuation') diff = (a.score?.valuation ?? 0) - (b.score?.valuation ?? 0)
    else if (sortKey === 'tier') diff = tierOrder(a.tier) - tierOrder(b.tier)
    else if (sortKey === 'ticker') diff = a.ticker.localeCompare(b.ticker)
    else if (sortKey === 'date_added') diff = a.date_added.localeCompare(b.date_added)
    return sortDir === 'asc' ? diff : -diff
  })

  function SortHead({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k
    return (
      <th
        className="text-right py-2 px-3 font-mono text-2xs uppercase tracking-wider cursor-pointer select-none"
        style={{ color: active ? 'var(--accent)' : 'var(--ink-faint)' }}
        onClick={() => handleSort(k)}
      >
        {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
      </th>
    )
  }

  return (
    <ThemeProvider>
      {showDemo && <DemoBanner />}
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--ink)' }}>Watchlist</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
            {initialRows.length} names · prices refresh every 60s
          </p>
        </div>

        <div className="overflow-hidden" style={{ border: '0.5px solid var(--border)' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                <th className="text-left py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Ticker</th>
                <th className="text-left py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Name</th>
                <th className="text-left py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Theme</th>
                <th className="text-center py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>30d</th>
                <th className="text-right py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Price</th>
                <th className="text-right py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Chg%</th>
                <SortHead k="total" label="Score" />
                <SortHead k="valuation" label="Val" />
                <th className="text-center py-2 px-3 font-mono text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Tier</th>
                <SortHead k="date_added" label="Added" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const q = quotes[row.ticker]
                const chg = q?.changePercent ?? 0
                return (
                  <tr
                    key={row.ticker}
                    style={{ borderBottom: i < sorted.length - 1 ? '0.5px solid var(--border)' : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(31,74,58,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="py-2.5 px-3">
                      <Link href={`/stock/${row.ticker}`} className="font-mono font-medium text-sm hover:underline" style={{ color: 'var(--accent)' }}>
                        {row.ticker}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--ink)' }}>{row.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--ink-muted)' }}>{row.theme}</td>
                    <td className="py-2.5 px-3" style={{ width: 90 }}>
                      {spark[row.ticker]?.length > 1 ? (
                        <div style={{ width: 80 }}>
                          <Sparkline
                            data={spark[row.ticker]}
                            positive={spark[row.ticker][spark[row.ticker].length - 1].close >= spark[row.ticker][0].close}
                          />
                        </div>
                      ) : (
                        <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm" style={{ color: 'var(--ink)' }}>
                      {q ? `$${q.price.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: chg >= 0 ? '#1a5c35' : '#7a1a1a' }}>
                      {q ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {row.total > 0 ? `${row.total}/35` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm" style={{ color: 'var(--ink-muted)' }}>
                      {row.score?.valuation ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <TierBadge tier={row.tier} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                      {row.date_added}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/stock/new" className="text-xs px-3 py-1.5 transition-colors" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            + add security
          </Link>
          <Link href="/journal/new" className="text-xs px-3 py-1.5 transition-colors" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            + journal entry
          </Link>
        </div>
      </main>
    </ThemeProvider>
  )
}
