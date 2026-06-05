'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Thesis } from '@/lib/types'

type GameType = 'value' | 'growth' | 'thematic'
const DEFAULT = { game_type: 'growth' as GameType, why: '', watch: '', bail: '', take: '', falsifiability_note: '' }

export function ThesisEditorClient({ ticker, initialThesis }: { ticker: string; initialThesis: Thesis | null }) {
  const [vals, setVals] = useState(initialThesis ?? DEFAULT)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function set(k: keyof typeof vals, v: string) {
    setVals(prev => ({ ...prev, [k]: v }))
    if (k === 'falsifiability_note') setError('')
  }

  async function save() {
    if (!vals.falsifiability_note?.trim()) {
      setError('Falsifiability note is required — complete the sentence: "I would know I was wrong if..."')
      return
    }
    setSaving(true)
    await supabase.from('theses').upsert({ ticker, ...vals, updated_at: new Date().toISOString() })
    setSaving(false)
    router.push(`/stock/${ticker}`)
  }

  function Field({ label, k, rows = 4, placeholder }: { label: string; k: keyof typeof vals; rows?: number; placeholder?: string }) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>{label}</label>
        <textarea
          value={(vals[k] as string) ?? ''}
          onChange={e => set(k, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
          style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
        />
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-light mb-6">Edit thesis — {ticker}</h1>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Game type</label>
          <div className="flex gap-2">
            {(['value', 'growth', 'thematic'] as GameType[]).map(t => (
              <button
                key={t}
                onClick={() => set('game_type', t)}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors"
                style={{
                  border: `0.5px solid ${vals.game_type === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: vals.game_type === t ? 'var(--accent)' : 'transparent',
                  color: vals.game_type === t ? 'white' : 'var(--ink-muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Field label="Why" k="why" rows={3} placeholder="What is the investment thesis?" />
        <Field label="Watch" k="watch" rows={3} placeholder="What signals would strengthen or weaken the case?" />
        <Field label="Bail" k="bail" rows={3} placeholder="What would force you to exit?" />
        <Field label="Take" k="take" rows={3} placeholder="Target price or valuation, and when do you trim?" />
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: error ? '#7a1a1a' : 'var(--ink-faint)' }}>
            Falsifiability (required)
          </label>
          <textarea
            value={vals.falsifiability_note ?? ''}
            onChange={e => set('falsifiability_note', e.target.value)}
            rows={3}
            placeholder="I would know I was wrong if..."
            className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
            style={{ background: 'transparent', border: `0.5px solid ${error ? '#7a1a1a' : 'var(--border)'}`, color: 'var(--ink)' }}
          />
          {error && <p className="text-xs" style={{ color: '#7a1a1a' }}>{error}</p>}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
          style={{ background: 'var(--accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'saving...' : 'save thesis'}
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
