'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

function NewJournalForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({
    ticker: params.get('ticker') ?? '',
    action: 'note' as 'buy' | 'sell' | 'add' | 'trim' | 'hold' | 'note',
    conviction: 3,
    reasoning: '',
    expectation: '',
  })
  const [saving, setSaving] = useState(false)

  function set(k: keyof typeof form, v: unknown) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save() {
    if (!form.reasoning.trim()) return
    setSaving(true)
    await supabase.from('journal').insert({
      ticker: form.ticker.toUpperCase() || null,
      action: form.action,
      conviction: form.conviction,
      reasoning: form.reasoning,
      expectation: form.expectation || null,
    })
    setSaving(false)
    router.push('/journal')
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-light mb-6">New journal entry</h1>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Ticker (optional)</label>
            <input
              type="text"
              value={form.ticker}
              onChange={e => set('ticker', e.target.value.toUpperCase())}
              placeholder="GOOGL"
              className="w-full px-3 py-2 font-mono text-sm outline-none uppercase"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Action</label>
            <select
              value={form.action}
              onChange={e => set('action', e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            >
              {['buy', 'sell', 'add', 'trim', 'hold', 'note'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Conviction (1–5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => set('conviction', n)}
                className="w-10 h-10 text-sm font-mono transition-colors"
                style={{
                  border: `0.5px solid ${form.conviction === n ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.conviction === n ? 'var(--accent)' : 'transparent',
                  color: form.conviction === n ? 'white' : 'var(--ink)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Reasoning (required)</label>
          <textarea
            value={form.reasoning}
            onChange={e => set('reasoning', e.target.value)}
            rows={5}
            placeholder="What is driving this decision? Be specific."
            className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
            style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Expectation (optional)</label>
          <textarea
            value={form.expectation}
            onChange={e => set('expectation', e.target.value)}
            rows={3}
            placeholder="What do you expect to happen, and on what timeline?"
            className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
            style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={save}
          disabled={saving || !form.reasoning.trim()}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
          style={{ background: 'var(--accent)', color: 'white', opacity: saving || !form.reasoning.trim() ? 0.5 : 1 }}
        >
          {saving ? 'saving...' : 'log entry'}
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

export default function NewJournalPage() {
  return (
    <ThemeProvider>
      <Nav />
      <Suspense>
        <NewJournalForm />
      </Suspense>
    </ThemeProvider>
  )
}
