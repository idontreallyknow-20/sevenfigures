'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { ScoreRadar } from '@/components/ScoreRadar'
import { PriceChart } from '@/components/PriceChart'
import { MetricsRow } from '@/components/MetricsRow'
import { QualityCard } from '@/components/QualityCard'
import { EditableText } from '@/components/ThesisRisksCard'
import { DemoBanner } from '@/components/DemoBanner'
import type { Security, Score, Thesis, JournalEntry, Tier, QuoteData, QualityScore } from '@/lib/types'
import type { Metrics } from '@/lib/finnhub'

const DIMS = [
  { key: 'moat' as const, label: 'Moat', desc: 'Durable competitive advantage' },
  { key: 'valuation' as const, label: 'Valuation', desc: '5 = cheap relative to peers' },
  { key: 'catalyst' as const, label: 'Catalyst', desc: 'Near-term re-rating events' },
  { key: 'falsifiability' as const, label: 'Falsifiability', desc: 'Clear signal that proves you wrong' },
  { key: 'edge' as const, label: 'Edge', desc: 'Market insight others are missing' },
  { key: 'diversification' as const, label: 'Diversification', desc: 'Low correlation to rest of portfolio' },
  { key: 'downside' as const, label: 'Downside', desc: '5 = limited downside / safe' },
]

interface Props {
  security: Security
  score: Score | null
  thesis: Thesis | null
  quality: QualityScore
  recentJournal: JournalEntry[]
  total: number
  tier: Tier
}

export function StockDetailClient({ security, score, thesis, quality, recentJournal, total, tier }: Props) {
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [bars, setBars] = useState<{ date: string; close: number }[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    fetch(`/api/quotes?tickers=${security.ticker}`)
      .then(r => r.json())
      .then(d => {
        const q = d.quotes?.[security.ticker]
        if (q) { setQuote(q); setIsDemo(q.isDemo ?? false) }
      })
    // 5Y of history so the 1M / 6M / 1Y / 5Y toggles all have data.
    fetch(`/api/bars?ticker=${security.ticker}&days=1825`)
      .then(r => r.json())
      .then(d => setBars(d.bars ?? []))
    fetch(`/api/metrics?ticker=${security.ticker}`)
      .then(r => r.json())
      .then(d => setMetrics(d.metrics ?? null))
      .catch(() => {})
  }, [security.ticker])

  const chg = quote?.changePercent ?? 0

  return (
    <div>
      {isDemo && <DemoBanner />}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ---- Header ---- */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-3xl font-light">{security.ticker}</h1>
              <TierBadge tier={tier} />
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{security.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
              {[security.theme, security.sector].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-medium">
              {quote ? `$${quote.price.toFixed(2)}` : '—'}
            </div>
            {quote && (
              <div className="font-mono text-sm" style={{ color: chg >= 0 ? '#1a5c35' : '#7a1a1a' }}>
                {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
              </div>
            )}
            <div className="text-2xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>~15 min delayed</div>
          </div>
        </div>

        {/* ---- Key metrics row ---- */}
        <div className="mb-6">
          <MetricsRow metrics={metrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---- Left (2/3) ---- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Price chart */}
            <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <PriceChart data={bars} ticker={security.ticker} />
            </div>

            {/* Inline-editable thesis & risks */}
            <EditableText
              ticker={security.ticker}
              label="Thesis"
              field="thesis_text"
              initial={thesis?.thesis_text ?? thesis?.why ?? null}
              placeholder="Why I own (or want to own) this — the core argument."
            />
            <EditableText
              ticker={security.ticker}
              label="Risks"
              field="risks"
              initial={thesis?.risks ?? thesis?.bail ?? null}
              placeholder="What could break the thesis — the things that would make me sell."
            />

            {/* Conviction score bars (7-dimension framework) */}
            {score && (
              <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Conviction score</span>
                  <span className="font-mono text-lg font-medium">{total}/35</span>
                </div>
                <div className="space-y-3">
                  {DIMS.map(({ key, label, desc }) => {
                    const val = score[key]
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="font-mono text-xs w-28 shrink-0" style={{ color: 'var(--ink-muted)' }}>{label}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div
                              key={n}
                              className="w-6 h-6 flex items-center justify-center text-2xs font-mono"
                              style={{
                                background: n <= val ? 'var(--accent)' : 'transparent',
                                border: `0.5px solid ${n <= val ? 'var(--accent)' : 'var(--border)'}`,
                                color: n <= val ? 'white' : 'var(--ink-faint)',
                              }}
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                        <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>{desc}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-3" style={{ borderTop: '0.5px solid var(--border)' }}>
                  <Link href={`/stock/${security.ticker}/edit-score`} className="text-xs" style={{ color: 'var(--accent)' }}>edit conviction →</Link>
                </div>
              </div>
            )}
          </div>

          {/* ---- Right sidebar (1/3) ---- */}
          <div className="space-y-4">
            {/* Quality breakdown (valuation / growth / moat / momentum) — editable */}
            <QualityCard ticker={security.ticker} initial={quality} />

            {score && (
              <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-faint)' }}>Conviction radar</div>
                <ScoreRadar scores={[{ ticker: security.ticker, score }]} />
              </div>
            )}

            {/* Quick actions */}
            <div className="p-3 space-y-1.5" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-faint)' }}>Quick actions</div>
              <Link href={`/portfolio/new?ticker=${security.ticker}`} className="block text-xs py-1" style={{ color: 'var(--accent)' }}>+ add to portfolio →</Link>
              <Link href={`/journal/new?ticker=${security.ticker}`} className="block text-xs py-1" style={{ color: 'var(--accent)' }}>+ log a decision →</Link>
              <Link href={`/stock/${security.ticker}/edit-score`} className="block text-xs py-1" style={{ color: 'var(--accent)' }}>+ edit conviction →</Link>
              <Link href={`/stock/${security.ticker}/edit-thesis`} className="block text-xs py-1" style={{ color: 'var(--accent)' }}>+ structured thesis →</Link>
            </div>

            {/* Recent journal */}
            <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>Recent decisions</div>
              {recentJournal.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>No entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentJournal.map(e => (
                    <div key={e.id} className="text-xs pb-2" style={{ borderBottom: '0.5px solid var(--border)' }}>
                      <div className="flex justify-between mb-0.5">
                        <span className="font-mono uppercase" style={{ color: 'var(--accent)' }}>{e.action}</span>
                        <span style={{ color: 'var(--ink-faint)' }}>{e.created_at.split('T')[0]}</span>
                      </div>
                      <p className="font-serif" style={{ color: 'var(--ink-muted)' }}>
                        {(e.reasoning ?? '').slice(0, 90)}{(e.reasoning ?? '').length > 90 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="p-4 space-y-2" style={{ border: '0.5px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--ink-faint)' }}>Details</div>
              {[
                { label: 'Source', val: security.source },
                { label: 'Added', val: security.date_added },
                { label: 'Sector', val: security.sector },
              ].map(({ label, val }) => val && (
                <div key={label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--ink-faint)' }}>{label}</span>
                  <span className="font-mono" style={{ color: 'var(--ink-muted)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
