'use client'
import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { QUALITY_DIMS, type QualityScore, type QualityDim } from '@/lib/types'

const LABELS: Record<QualityDim, string> = {
  valuation: 'Valuation',
  growth: 'Growth',
  moat: 'Moat',
  momentum: 'Momentum',
}

type Vals = Record<QualityDim, number>

function toVals(q: QualityScore): Vals {
  return { valuation: q.valuation, growth: q.growth, moat: q.moat, momentum: q.momentum }
}

export function QualityCard({ ticker, initial }: { ticker: string; initial: QualityScore }) {
  const [vals, setVals] = useState<Vals>(toVals(initial))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const data = QUALITY_DIMS.map(dim => ({ dim: LABELS[dim], value: vals[dim] }))
  const accent = '#1f4a3a'

  async function save() {
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('quality_scores')
      .upsert({ ticker, ...vals, updated_at: new Date().toISOString() })
    setSaving(false)
    if (err) { setError('Save failed (is the DB configured?)'); return }
    setEditing(false)
  }

  return (
    <div className="p-4" style={{ border: '0.5px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Quality breakdown</span>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-xs"
          style={{ color: 'var(--accent)' }}
        >
          {editing ? 'cancel' : 'edit'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'IBM Plex Mono' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={accent} fill={accent} fillOpacity={0.14} strokeWidth={1.5} />
        </RadarChart>
      </ResponsiveContainer>

      {editing ? (
        <div className="space-y-3 mt-2">
          {QUALITY_DIMS.map(dim => (
            <div key={dim} className="flex items-center gap-3">
              <span className="font-mono text-xs w-24 shrink-0" style={{ color: 'var(--ink-muted)' }}>{LABELS[dim]}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setVals(v => ({ ...v, [dim]: n }))}
                    className="w-7 h-7 text-2xs font-mono"
                    style={{
                      background: vals[dim] === n ? 'var(--accent)' : 'transparent',
                      border: `0.5px solid ${vals[dim] === n ? 'var(--accent)' : 'var(--border)'}`,
                      color: vals[dim] === n ? 'white' : 'var(--ink-faint)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {error && <p className="text-2xs" style={{ color: '#7a1a1a' }}>{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'saving...' : 'save'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {QUALITY_DIMS.map(dim => (
            <div key={dim} className="text-center">
              <div className="font-mono text-sm" style={{ color: 'var(--ink)' }}>{vals[dim]}<span style={{ color: 'var(--ink-faint)' }}>/5</span></div>
              <div className="text-2xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>{LABELS[dim]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
