'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { computeTotal, computeTier, type Score } from '@/lib/types'
import { TierBadge } from '@/components/TierBadge'

const DIMS = [
  { key: 'moat' as const, label: 'Moat', desc: 'Durable advantage that protects profits' },
  { key: 'valuation' as const, label: 'Valuation', desc: '5 = cheap, 1 = expensive' },
  { key: 'catalyst' as const, label: 'Catalyst', desc: 'Clear near-term re-rate events' },
  { key: 'falsifiability' as const, label: 'Falsifiability', desc: 'Can you state a checkable wrong signal' },
  { key: 'edge' as const, label: 'Edge', desc: 'Your specific market-missed insight' },
  { key: 'diversification' as const, label: 'Diversification', desc: 'Low correlation to AI/semi holdings' },
  { key: 'downside' as const, label: 'Downside', desc: 'Limited loss if wrong (5 = safe)' },
]

type ScoreVals = Pick<Score, 'moat' | 'valuation' | 'catalyst' | 'falsifiability' | 'edge' | 'diversification' | 'downside'>
const DEFAULT: ScoreVals = { moat: 3, valuation: 3, catalyst: 3, falsifiability: 3, edge: 3, diversification: 3, downside: 3 }

export function ScoreEditorClient({ ticker, initialScore }: { ticker: string; initialScore: Score | null }) {
  const [vals, setVals] = useState<ScoreVals>(
    initialScore ? { moat: initialScore.moat, valuation: initialScore.valuation, catalyst: initialScore.catalyst, falsifiability: initialScore.falsifiability, edge: initialScore.edge, diversification: initialScore.diversification, downside: initialScore.downside } : DEFAULT
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const total = computeTotal(vals)
  const tier = computeTier(total)

  async function save() {
    setSaving(true)
    await supabase.from('scores').upsert({ ticker, ...vals, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.push(`/stock/${ticker}`) }, 800)
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-light">Edit scores — {ticker}</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl">{total}/35</span>
          <TierBadge tier={tier} />
        </div>
      </div>
      <div className="space-y-4">
        {DIMS.map(({ key, label, desc }) => (
          <div key={key} className="p-4" style={{ border: '0.5px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono text-sm font-medium">{label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>{desc}</div>
              </div>
              <span className="font-mono text-lg font-medium" style={{ color: 'var(--accent)' }}>{vals[key]}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setVals(v => ({ ...v, [key]: n }))}
                  className="w-10 h-10 text-sm font-mono transition-colors"
                  style={{
                    border: `0.5px solid ${vals[key] === n ? 'var(--accent)' : 'var(--border)'}`,
                    background: vals[key] === n ? 'var(--accent)' : 'transparent',
                    color: vals[key] === n ? 'white' : 'var(--ink)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={save}
          disabled={saving || saved}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
          style={{ background: saved ? '#1a5c35' : 'var(--accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saved ? 'saved' : saving ? 'saving...' : 'save scores'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
          style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}
        >
          cancel
        </button>
      </div>
    </main>
  )
}
