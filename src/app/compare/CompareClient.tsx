'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Security, Score } from '@/lib/types'
import { computeTotal, computeTier } from '@/lib/types'
import { TierBadge } from '@/components/TierBadge'

const DIMS = ['moat', 'valuation', 'catalyst', 'falsifiability', 'edge', 'diversification', 'downside'] as const
// Mid-tone series colours that read on both the light and dark backgrounds.
const COLORS = ['#2d8a68', '#4a7fb5', '#c77a1f', '#c0504d']

const ScoreRadar = dynamic(() => import('@/components/ScoreRadar').then(m => m.ScoreRadar), {
  ssr: false,
  loading: () => <div className="skeleton h-[260px]" />,
})

export function CompareClient({ securities, scores }: { securities: Security[]; scores: Score[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const scoreMap = Object.fromEntries(scores.map(s => [s.ticker, s]))

  function toggle(ticker: string) {
    setSelected(prev => prev.includes(ticker) ? prev.filter(t => t !== ticker) : prev.length < 4 ? [...prev, ticker] : prev)
  }

  const selectedScores = selected
    .map((t, i) => { const s = scoreMap[t]; return s ? { ticker: t, score: s, color: COLORS[i % COLORS.length] } : null })
    .filter(Boolean) as { ticker: string; score: Score; color: string }[]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-light">Compare stocks</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
          Pick two to four names to overlay their seven-dimension scores.{selected.length > 0 && ` ${selected.length}/4 selected.`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {securities.map(sec => {
          const isSelected = selected.includes(sec.ticker)
          const idx = selected.indexOf(sec.ticker)
          return (
            <button
              key={sec.ticker}
              onClick={() => toggle(sec.ticker)}
              aria-pressed={isSelected}
              disabled={!scoreMap[sec.ticker] || (!isSelected && selected.length >= 4)}
              title={scoreMap[sec.ticker] ? sec.name : `${sec.name} (not scored yet)`}
              className="px-3 py-1.5 text-xs font-mono transition-colors disabled:opacity-40"
              style={{
                border: `${isSelected ? 1.5 : 0.5}px solid ${isSelected ? COLORS[idx % COLORS.length] : 'var(--border)'}`,
                background: isSelected ? COLORS[idx % COLORS.length] + '22' : 'transparent',
                color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
              }}
            >
              {sec.ticker}
            </button>
          )
        })}
      </div>

      {selectedScores.length >= 2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
            <ScoreRadar scores={selectedScores} />
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {selectedScores.map(s => (
                <div key={s.ticker} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5" style={{ background: s.color }} />
                  <span className="font-mono text-xs">{s.ticker}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 overflow-auto" style={{ border: '0.5px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--ink-faint)' }}>Score matrix</div>
            <table className="w-full border-collapse text-xs font-mono">
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <th className="text-left py-1 pr-3" style={{ color: 'var(--ink-faint)' }}>Dimension</th>
                  {selectedScores.map(s => (
                    <th key={s.ticker} className="text-right py-1 px-2" style={{ borderBottom: `2px solid ${s.color}` }}>{s.ticker}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMS.map(dim => (
                  <tr key={dim} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td className="py-1 pr-3 capitalize" style={{ color: 'var(--ink-muted)' }}>{dim}</td>
                    {selectedScores.map(s => <td key={s.ticker} className="py-1 px-2 text-right">{s.score[dim]}</td>)}
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-medium">Total</td>
                  {selectedScores.map(s => <td key={s.ticker} className="py-2 px-2 text-right font-medium">{computeTotal(s.score)}/35</td>)}
                </tr>
                <tr>
                  <td className="py-1 pr-3">Tier</td>
                  {selectedScores.map(s => (
                    <td key={s.ticker} className="py-1 px-2 text-right">
                      <TierBadge tier={computeTier(computeTotal(s.score))} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center" style={{ border: '0.5px solid var(--border)' }}>
          <p className="font-serif text-base" style={{ color: 'var(--ink-muted)' }}>
            {selected.length === 1 ? 'Pick one more name to compare.' : 'Pick at least two names to compare.'}
          </p>
        </div>
      )}
    </main>
  )
}
