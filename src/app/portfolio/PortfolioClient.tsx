'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { DemoBanner } from '@/components/DemoBanner'
import type { Holding, Security, Score, Tier, QuoteData } from '@/lib/types'

interface EnrichedHolding extends Holding {
  security: Security
  score: Score | undefined
  total: number
  tier: Tier
}

export function PortfolioClient({ holdings }: { holdings: EnrichedHolding[] }) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const tickers = [...new Set([...holdings.map(h => h.ticker), 'QQQ', 'SPY'])].join(',')
    fetch(`/api/quotes?tickers=${tickers}`)
      .then(r => r.json())
      .then(d => { setQuotes(d.quotes ?? {}); setIsDemo(d.isDemo ?? false) })
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
    const pnlPct = ((currentPrice - h.avg_cost) / h.avg_cost) * 100
    const weight = totalValue > 0 ? (value / totalValue) * 100 : 0
    return { ...h, currentPrice, value, pnl, pnlPct, weight }
  })

  const byTheme: Record<string, number> = {}
  for (const row of rows) {
    const theme = row.security?.theme ?? 'Other'
    byTheme[theme] = (byTheme[theme] ?? 0) + row.value
  }

  return (
    <div>
      {isDemo && <DemoBanner />}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-light">Portfolio</h1>
            <p className="text-xs mt-1" style= color: 'var(--ink-faint)' >open positions</p>
          </div>
          <Link
            href="/portfolio/new"
            className="text-xs px-3 py-1.5 font-mono"
            style=123
          >
            + add holding
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total value', val: totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—', color: '' },
            { label: 'Total P&L', val: totalCost > 0 ? `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { maximumFractionDigits: 0 })} (${totalPnlPct.toFixed(1)}%)` : '—', color: totalCost > 0 ? (totalPnl >= 0 ? '#1a5c35' : '#7a1a1a') : '' },
            { label: 'Positions', val: holdings.length.toString(), color: '' },
            { label: 'QQQ', val: quotes['QQQ'] ? `$${quotes['QQQ'].price.toFixed(2)}` : '—', color: '' },
            { label: 'SPY', val: quotes['SPY'] ? `$${quotes['SPY'].price.toFixed(2)}` : '—', color: '' },
          ].map(({ label, val, color }) => (
            <div key={label} className="p-3" style= border: '0.5px solid var(--border)' >
              <div className="text-2xs uppercase tracking-wider mb-1" style= color: 'var(--ink-faint)' >{label}</div>
              <div className="font-mono text-base" style={color ? { color } : {}}>{val}</div>
            </div>
          ))}
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center" style= border: '0.5px solid var(--border)' >
            <p className="font-serif text-base mb-2" style= color: 'var(--ink-muted)' >No open positions yet.</p>
            <p className="text-xs mb-6" style= color: 'var(--ink-faint)' >Add your first holding to start tracking P&L and weight.</p>
            <Link href="/portfolio/new" className="text-xs px-4 py-2 font-mono" style=124>+ add holding</Link>
          </div>
        ) : (
          <div className="overflow-hidden" style= border: '0.5px solid var(--border)' >
            <table className="w-full border-collapse">
              <thead>
                <tr style= borderBottom: '0.5px solid var(--border)' >
                  {['Ticker', 'Shares', 'Avg cost', 'Price', 'Value', 'P&L', 'P&L%', 'Weight', 'Target', 'Tier', ''].map(h => (
                    <th key={h} className="text-right first:text-left py-2 px-3 font-mono text-2xs uppercase tracking-wider" style= color: 'var(--ink-faint)' >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style=125>
                    <td className="py-2.5 px-3">
                      <Link href={`/stock/${row.ticker}`} className="font-mono font-medium hover:underline" style= color: 'var(--accent)' >{row.ticker}</Link>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{row.shares}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style= color: 'var(--ink-faint)' >${row.avg_cost.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">${row.currentPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">${row.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style=126>
                      {row.pnl >= 0 ? '+' : ''}${row.pnl.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style=127>
                      {row.pnlPct >= 0 ? '+' : ''}{row.pnlPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">{row.weight.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs" style= color: 'var(--ink-faint)' >
                      {row.target_weight ? `${row.target_weight}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right"><TierBadge tier={row.tier} /></td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/portfolio/${row.id}/close`} className="text-2xs font-mono" style= color: 'var(--ink-faint)' >close</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Theme allocation bar chart */}
        {Object.keys(byTheme).length > 0 && (
          <div className="mt-6 p-4" style= border: '0.5px solid var(--border)' >
            <div className="text-xs uppercase tracking-wider mb-3" style= color: 'var(--ink-faint)' >Allocation by theme</div>
            <div className="space-y-2.5">
              {Object.entries(byTheme).sort((a, b) => b[1] - a[1]).map(([theme, val]) => (
                <div key={theme} className="flex items-center gap-3">
                  <span className="font-serif text-xs w-48 shrink-0">{theme}</span>
                  <div className="flex-1 h-1.5 overflow-hidden" style=128>
                    <div className="h-full" style={{ width: `${(val / totalValue) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                  <span className="font-mono text-xs w-12 text-right" style= color: 'var(--ink-muted)' >
                    {((val / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
