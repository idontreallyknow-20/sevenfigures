'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

type SortKey = 'total' | 'valuation' | 'ticker' | 'date_added'

const TH = 'py-2 px-3 font-mono text-2xs uppercase tracking-wider whitespace-nowrap'

export function WatchlistClient({ rows, demoPrices }: { rows: Row[]; demoPrices: boolean }) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData> | null>(null)
  const [spark, setSpark] = useState<Record<string, { date: string; close: number }[]>>({})
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showDemo, setShowDemo] = useState(demoPrices)
  const tickers = rows.map(r => r.ticker).join(',')

  const fetchQuotes = useCallback(async () => {
    if (!tickers) return
    try {
      const res = await fetch(`/api/quotes?tickers=${encodeURIComponent(tickers)}`)
      if (!res.ok) return
      const data = await res.json()
      setQuotes(data.quotes ?? {})
      setShowDemo(demoPrices || !!data.isDemo)
    } catch {}
  }, [tickers, demoPrices])

  useEffect(() => {
    fetchQuotes()
    const id = setInterval(fetchQuotes, 60000)
    return () => clearInterval(id)
  }, [fetchQuotes])

  // 30-day mini chart per row (fetched once).
  useEffect(() => {
    let cancelled = false
    Promise.all(
      tickers.split(',').filter(Boolean).map(t =>
        fetch(`/api/bars?ticker=${encodeURIComponent(t)}&days=30`)
          .then(res => res.json())
          .then(d => [t, d.bars ?? []] as const)
          .catch(() => [t, []] as const)
      )
    ).then(entries => {
      if (!cancelled) setSpark(Object.fromEntries(entries))
    })
    return () => { cancelled = true }
  }, [tickers])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'ticker' ? 'asc' : 'desc') }
  }

  const sorted = [...rows].sort((a, b) => {
    let diff = 0
    if (sortKey === 'total') diff = a.total - b.total
    else if (sortKey === 'valuation') diff = (a.score?.valuation ?? 0) - (b.score?.valuation ?? 0)
    else if (sortKey === 'ticker') diff = a.ticker.localeCompare(b.ticker)
    else if (sortKey === 'date_added') diff = a.date_added.localeCompare(b.date_added)
    return sortDir === 'asc' ? diff : -diff
  })

  function SortHead({ k, label, align = 'right' }: { k: SortKey; label: string; align?: 'left' | 'right' }) {
    const active = sortKey === k
    return (
      <th
        className={`${TH} text-${align}`}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button
          onClick={() => handleSort(k)}
          className="uppercase tracking-wider"
          style={{ color: active ? 'var(--accent)' : 'var(--ink-faint)' }}
        >
          {label}{active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
        </button>
      </th>
    )
  }

  return (
    <>
      {showDemo && <DemoBanner />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-light" style={{ color: 'var(--ink)' }}>Watchlist</h1>
          <p className="text-xs mt-1 max-w-xl" style={{ color: 'var(--ink-muted)' }}>
            Every stock I&apos;m tracking, scored out of 35 across seven dimensions. {rows.length} names, prices refresh every 60 seconds.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center" style={{ border: '0.5px solid var(--border)' }}>
            <p className="font-serif text-base mb-4" style={{ color: 'var(--ink-muted)' }}>Your watchlist is empty.</p>
            <Link href="/stock/new" className="btn text-xs px-4 py-2 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>+ add security</Link>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ border: '0.5px solid var(--border)' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)', color: 'var(--ink-faint)' }}>
                  <SortHead k="ticker" label="Ticker" align="left" />
                  <th className={`${TH} text-left hidden sm:table-cell`}>Name</th>
                  <th className={`${TH} text-left hidden md:table-cell`}>Theme</th>
                  <th className={`${TH} text-center`}>30d</th>
                  <th className={`${TH} text-right`}>Price</th>
                  <th className={`${TH} text-right`}>Chg%</th>
                  <SortHead k="total" label="Score" />
                  <SortHead k="valuation" label="Val" />
                  <th className={`${TH} text-center`}>Tier</th>
                  <SortHead k="date_added" label="Added" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const q = quotes?.[row.ticker]
                  const chg = q?.changePercent ?? 0
                  const bars = spark[row.ticker]
                  return (
                    <tr
                      key={row.ticker}
                      className="hover:bg-[var(--hover)] transition-colors"
                      style={{ borderBottom: i < sorted.length - 1 ? '0.5px solid var(--border)' : undefined }}
                    >
                      <td className="py-2.5 px-3">
                        <Link href={`/stock/${row.ticker}`} className="link font-mono font-medium text-sm">
                          {row.ticker}
                        </Link>
                        <div className="sm:hidden text-2xs max-w-[7rem] truncate" style={{ color: 'var(--ink-muted)' }}>{row.name}</div>
                      </td>
                      <td className="py-2.5 px-3 text-xs min-w-[10rem] hidden sm:table-cell" style={{ color: 'var(--ink)' }}>{row.name}</td>
                      <td className="py-2.5 px-3 text-xs hidden md:table-cell" style={{ color: 'var(--ink-muted)' }}>{row.theme ?? '—'}</td>
                      <td className="py-2.5 px-3" style={{ width: 96 }}>
                        {bars && bars.length > 1 ? (
                          <Sparkline data={bars} positive={bars[bars.length - 1].close >= bars[0].close} />
                        ) : bars ? (
                          <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>—</span>
                        ) : (
                          <div className="skeleton h-7 w-20" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm" style={{ color: 'var(--ink)' }}>
                        {q ? `$${q.price.toFixed(2)}` : quotes ? '—' : <span className="skeleton inline-block h-4 w-14 align-middle" />}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: chg >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {q ? `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm font-medium whitespace-nowrap" style={{ color: 'var(--ink)' }}>
                        {row.total > 0 ? `${row.total}/35` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm" style={{ color: 'var(--ink-muted)' }}>
                        {row.score?.valuation ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.score ? <TierBadge tier={row.tier} /> : <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>unscored</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs whitespace-nowrap" style={{ color: 'var(--ink-faint)' }}>
                        {row.date_added}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/stock/new" className="btn text-xs px-3 py-1.5" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            + add security
          </Link>
          <Link href="/journal/new" className="btn text-xs px-3 py-1.5" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            + journal entry
          </Link>
          <Link href="/compare" className="btn text-xs px-3 py-1.5" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            compare names →
          </Link>
        </div>
      </main>
    </>
  )
}
