'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'
import { FormError } from '@/components/FormError'
import type { Thesis } from '@/lib/types'

type GameType = 'value' | 'growth' | 'thematic'
type TextKey = 'why' | 'watch' | 'bail' | 'take' | 'falsifiability_note'
type Vals = { game_type: GameType } & Record<TextKey, string>

const INPUT = { background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }

const FIELDS: Array<{ k: Exclude<TextKey, 'falsifiability_note'>; label: string; placeholder: string }> = [
  { k: 'why', label: 'Why', placeholder: 'What is the investment thesis?' },
  { k: 'watch', label: 'Watch', placeholder: 'What signals would strengthen or weaken the case?' },
  { k: 'bail', label: 'Bail', placeholder: 'What would force you to exit?' },
  { k: 'take', label: 'Take', placeholder: 'Target price or valuation, and when do you trim?' },
]

function toVals(t: Thesis | null): Vals {
  return {
    game_type: t?.game_type ?? 'growth',
    why: t?.why ?? '',
    watch: t?.watch ?? '',
    bail: t?.bail ?? '',
    take: t?.take ?? '',
    falsifiability_note: t?.falsifiability_note ?? '',
  }
}

export function ThesisEditorClient({ ticker, initialThesis }: { ticker: string; initialThesis: Thesis | null }) {
  const [vals, setVals] = useState<Vals>(toVals(initialThesis))
  const [error, setError] = useState('')
  const [missingFalsifiability, setMissingFalsifiability] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function set<K extends keyof Vals>(k: K, v: Vals[K]) {
    setVals(prev => ({ ...prev, [k]: v }))
    if (k === 'falsifiability_note') { setMissingFalsifiability(false); setError('') }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!vals.falsifiability_note.trim()) {
      setMissingFalsifiability(true)
      setError('Falsifiability is required. Finish the sentence: "I would know I was wrong if..."')
      return
    }
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('theses').upsert({ ticker, ...vals, updated_at: new Date().toISOString() })
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/stock/${ticker}`)
    router.refresh()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-light mb-6">Edit thesis: {ticker}</h1>
      <form onSubmit={save} noValidate>
        <div className="space-y-5">
          <fieldset className="space-y-1.5">
            <legend className="text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-muted)' }}>Game type</legend>
            <div className="flex flex-wrap gap-2">
              {(['value', 'growth', 'thematic'] as GameType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('game_type', t)}
                  aria-pressed={vals.game_type === t}
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider"
                  style={{
                    border: `0.5px solid ${vals.game_type === t ? 'var(--accent)' : 'var(--border)'}`,
                    background: vals.game_type === t ? 'var(--accent)' : 'transparent',
                    color: vals.game_type === t ? 'var(--on-accent)' : 'var(--ink-muted)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          {FIELDS.map(({ k, label, placeholder }) => (
            <div key={k} className="space-y-1.5">
              <label htmlFor={`t-${k}`} className="block text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>{label}</label>
              <textarea
                id={`t-${k}`}
                value={vals[k]}
                onChange={e => set(k, e.target.value)}
                rows={3}
                placeholder={placeholder}
                className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
                style={INPUT}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label htmlFor="t-falsifiability" className="block text-xs uppercase tracking-wider" style={{ color: missingFalsifiability ? 'var(--negative)' : 'var(--ink-muted)' }}>
              Falsifiability (required)
            </label>
            <textarea
              id="t-falsifiability"
              value={vals.falsifiability_note}
              onChange={e => set('falsifiability_note', e.target.value)}
              rows={3}
              required
              aria-invalid={missingFalsifiability}
              placeholder="I would know I was wrong if..."
              className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
              style={{ ...INPUT, border: `0.5px solid ${missingFalsifiability ? 'var(--negative)' : 'var(--border)'}` }}
            />
          </div>
          <FormError message={error} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'saving…' : 'save thesis'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}
          >
            cancel
          </button>
        </div>
      </form>
    </main>
  )
}
