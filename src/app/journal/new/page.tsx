'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'
import { cleanTicker } from '@/lib/ticker'
import { FormError } from '@/components/FormError'

const ACTIONS = ['buy', 'sell', 'add', 'trim', 'hold', 'note'] as const
type Action = typeof ACTIONS[number]

const LABEL = 'block text-xs uppercase tracking-wider'
const INPUT = { background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }

function NewJournalForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({
    ticker: params.get('ticker')?.toUpperCase() ?? '',
    action: 'note' as Action,
    conviction: 3,
    reasoning: '',
    expectation: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.reasoning.trim()) { setError('Reasoning is required.'); return }
    const ticker = form.ticker.trim() ? cleanTicker(form.ticker) : null
    if (form.ticker.trim() && !ticker) { setError('That ticker doesn’t look right. Use letters, numbers, dots or dashes.'); return }
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('journal').insert({
      ticker,
      action: form.action,
      conviction: form.conviction,
      reasoning: form.reasoning.trim(),
      expectation: form.expectation.trim() || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/journal')
    router.refresh()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-light mb-6">New journal entry</h1>
      <form onSubmit={save} noValidate>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="j-ticker" className={LABEL} style={{ color: 'var(--ink-muted)' }}>Ticker (optional)</label>
              <input
                id="j-ticker"
                type="text"
                value={form.ticker}
                onChange={e => set('ticker', e.target.value.toUpperCase())}
                placeholder="GOOGL"
                autoComplete="off"
                className="w-full px-3 py-2 font-mono text-sm outline-none uppercase"
                style={INPUT}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="j-action" className={LABEL} style={{ color: 'var(--ink-muted)' }}>Action</label>
              <select
                id="j-action"
                value={form.action}
                onChange={e => set('action', e.target.value as Action)}
                className="w-full px-3 py-2 font-mono text-sm outline-none"
                style={{ ...INPUT, background: 'var(--bg)' }}
              >
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <fieldset className="space-y-1.5">
            <legend className={LABEL} style={{ color: 'var(--ink-muted)' }}>Conviction (1–5)</legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('conviction', n)}
                  aria-pressed={form.conviction === n}
                  className="w-10 h-10 text-sm font-mono"
                  style={{
                    border: `0.5px solid ${form.conviction === n ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.conviction === n ? 'var(--accent)' : 'transparent',
                    color: form.conviction === n ? 'var(--on-accent)' : 'var(--ink)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <label htmlFor="j-reasoning" className={LABEL} style={{ color: 'var(--ink-muted)' }}>Reasoning (required)</label>
            <textarea
              id="j-reasoning"
              value={form.reasoning}
              onChange={e => set('reasoning', e.target.value)}
              rows={5}
              required
              placeholder="What is driving this decision? Be specific."
              className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
              style={INPUT}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="j-expectation" className={LABEL} style={{ color: 'var(--ink-muted)' }}>Expectation (optional)</label>
            <textarea
              id="j-expectation"
              value={form.expectation}
              onChange={e => set('expectation', e.target.value)}
              rows={3}
              placeholder="What do you expect to happen, and by when?"
              className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
              style={INPUT}
            />
          </div>
          <FormError message={error} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'saving…' : 'log entry'}
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

export default function NewJournalPage() {
  return (
    <Suspense>
      <NewJournalForm />
    </Suspense>
  )
}
