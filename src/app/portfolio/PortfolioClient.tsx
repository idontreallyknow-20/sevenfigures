'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { DemoBanner } from '@/components/DemoBanner'
import dynamic from 'next/dynamic'
import type { Holding, Security, Score, Tier, QuoteData } from '@/lib/types'

// Charts only render when there are positions, so keep Recharts out of the initial bundle.
const AllocationDonut = dynamic(() => import('@/components/AllocationDonut').then(m => m.AllocationDonut), {
  ssr: false,
  loading: () => <div className="skeleton h-[180px]" />,
})
const ValueOverTime = dynamic(() => import('@/components/ValueOverTime').then(m => m.ValueOverTime), {
  ssr: false,
  loading: () => <div className="skeleton h-[220px]" />,
})

interface EnrichedHolding extends Holding {
  security: Security | undefined
  score: Score | undefined
  total: number
  tier: Tier
}

export function PortfolioClient({ holdings, demoPrices }: { holdings: EnrichedHolding[]; demoPrices: boolean }) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [barsMap, setBarsMap] = useState<Record<string, { date: string; close: number }[]>>({})
  const [isDemo, setIsDemo] = useState(demoPrices)

  useEffect(() => {
    const tickers = [...new Set([...holdings.map(h => h.ticker), 'QQQ', 'SPY'])].join(',')
    fetch(`/api/quotes?tickers=${encodeURIComponent(tickers)}`)
      .then(r => r.json())
      .then(d => { setQuotes(d.quotes ?? {}); setIsDemo(demoPrices || !!d.isDemo) })
      .catch(() => {})
  }, [holdings, demoPrices])

  // Per-holding history → reconstruct total portfolio value over time.
  useEffect(() => {
    if (holdings.length === 0) return
    let cancelled = false
    Promise.all(
      [...new Set(holdings.map(h => h.ticker))].map(t =>
        fetch(`/api/bars?ticker=${encodeURIComponent(t)}&days=180`)
          .then(r => r.json())
          .then(d => [t, d.bars ?? []] as const)
          .catch(() => [t, []] as const)
      )
    ).then(entries => { if (!cancelled) setBarsMap(Object.fromEntries(entries)) })
    return () => { cancelled = true }
  }, [holdings])

  const totalValue = holdings.reduce((sum, h) => {
    const q = quotes[h.ticker]
    return sum + (q ? q.price * h.shares : h.avg_cost * h.shares)
  }, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.avg_cost * h.shares, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const rows = holdings.map(h => {
    const q = quotes[h.ticker]
    const currentPrice = q?.price ?? h.avg_cost
    const value = currentPrice * h.shares
    const pnl = (currentPrice - h.avg_cost) * h.shares
    const pnlPct = h.avg_cost > 0 ? ((currentPrice - h.avg_cost) / h.avg_cost) * 100 : 0
    const weight = totalValue > 0 ? (value / totalValue) * 100 : 0
    return { ...h, currentPrice, value, pnl, pnlPct, weight }
  })

  const byTheme: Record<string, number> = {}
  for (const row of rows) {
    const theme = row.security?.theme ?? 'Other'
    byTheme[theme] = (byTheme[theme] ?? 0) + row.value
  }

  // Allocation by position (for the donut).
  const allocation = rows.map(r => ({ name: r.ticker, value: r.value })).filter(s => s.value > 0)

  // Reconstruct portfolio value over time from per-ticker daily closes.
  const valueSeries = (() => {
    const tickers = [...new Set(holdings.map(h => h.ticker))]
    if (tickers.length === 0 || tickers.some(t => !barsMap[t]?.length)) return []
    // forward-filled close lookup per ticker
    const lookup: Record<string, Record<string, number>> = {}
    const allDates = new Set<string>()
    for (const t of tickers) {
      const map: Record<string, number> = {}
      for (const b of barsMap[t]) { map[b.date] = b.close; allDates.add(b.date) }
      lookup[t] = map
    }
    const dates = [...allDates].sort()
    const last: Record<string, number> = {}
    const series: { date: string; value: number }[] = []
    for (const date of dates) {
      let total = 0
      for (const h of holdings) {
        const close = lookup[h.ticker]?.[date] ?? last[h.ticker]
        if (close != null) { last[h.ticker] = close; total += close * h.shares }
      }
      series.push({ date, value: total })
    }
    return series
  })()

  return (
    <>
      {isDemo && <DemoBanner />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light">Portfolio</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Open positions, live P&amp;L and allocation.</p>
          </div>
          <Link
            href="/portfolio/new"
            className="btn text-xs px-3 py-1.5 font-mono"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
            + add holding
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total value', val: totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—', color: '' },
            { label: 'Total P&L', val: totalCost > 0 ? `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { maximumFractionDigits: 0 })} (${totalPnlPct.toFixed(1)}%)` : '—', color: totalCost > 0 ? (totalPnl >= 0 ? 'var(--positive)' : 'var(--negative)') : '' },
            { label: 'Positions', val: holdings.length.toString(), color: '' },
            { label: 'QQQ', val: quotes['QQQ'] ? `$${quotes['QQQ'].price.toFixed(2)}` : '—', color: '' },
            { label: 'SPY', val: quotes['SPY'] ? `$${quotes['SPY'].price.toFixed(2)}` : '—', color: '' },
          ].map(({ label, val, color }) => (
            <div key={label} className="p-3" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>{label}</div>
              <div className="font-mono text-base break-words" style={color ? { color } : {}}>{val}</div>
            </div>
          ))}
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center" style={{ border: '0.5px solid var(--border)' }}>
            <p className="font-serif text-base mb-2" style={{ color: 'var(--ink-muted)' }}>No open positions yet.</p>
            <p className="text-xs mb-6" style={{ color: 'var(--ink-faint)' }}>Add your first holding to start tracking P&L and weight.</p>
            <Link href="/portfolio/new" className="btn text-xs px-4 py-2 font-mono" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>+ add holding</Link>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ border: '0.5px solid var(--border)' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                  {['Ticker', 'Shares', 'Avg cost', 'Price', 'Value', 'P&L', 'P&L%', 'Weight', 'Target', 'Tier', ''].map(h => (
                    <th key={h || 'actions'} className="text-right first:text-left py-2 px-3 font-mono text-2xs uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--ink-faint)' }}>{h || <span className="sr-only">Actions</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td className="py-2.5 px-3">
                      <Link href={`/stock/${row.ticker}`} className="link font-mono font-medium">{row.ticker}</Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{row.shares}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>${row.avg_cost.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">${row.currentPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">${row.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: row.pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {row.pnl >= 0 ? '+' : ''}${row.pnl.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: row.pnlPct >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {row.pnlPct >= 0 ? '+' : ''}{row.pnlPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{row.weight.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                      {row.target_weight ? `${row.target_weight}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right"><TierBadge tier={row.tier} /></td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/portfolio/${row.id}/close`} className="link text-2xs font-mono" aria-label={`Close ${row.ticker} position`}>close</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Allocation donut + total value over time */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>Allocation</div>
              <AllocationDonut data={allocation} />
            </div>
            <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>Total value over time</div>
              <ValueOverTime data={valueSeries} />
            </div>
          </div>
        )}

        {/* Theme allocation bar chart */}
        {Object.keys(byTheme).length > 0 && (
          <div className="mt-6 p-4" style={{ border: '0.5px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>Allocation by theme</div>
            <div className="space-y-2.5">
              {Object.entries(byTheme).sort((a, b) => b[1] - a[1]).map(([theme, val]) => (
                <div key={theme} className="flex items-center gap-3">
                  <span className="font-serif text-xs w-28 sm:w-48 shrink-0 truncate" title={theme}>{theme}</span>
                  <div className="flex-1 h-1.5 overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full" style={{ width: `${(val / totalValue) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                  <span className="font-mono text-xs w-12 text-right" style={{ color: 'var(--ink-muted)' }}>
                    {((val / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
