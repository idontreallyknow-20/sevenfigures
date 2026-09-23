'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'
import { cleanTicker } from '@/lib/ticker'
import { FormError } from '@/components/FormError'

const INPUT = { background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }

type Field = 'ticker' | 'shares' | 'avg_cost' | 'date_opened' | 'target_weight'

const FIELDS: Array<{ label: string; k: Field; placeholder: string; type: string; inputMode?: 'decimal'; hint: string }> = [
  { label: 'Ticker', k: 'ticker', placeholder: 'AAPL', type: 'text', hint: 'The stock symbol, e.g. AAPL or MSFT' },
  { label: 'Shares owned', k: 'shares', placeholder: '10', type: 'text', inputMode: 'decimal', hint: 'How many shares you hold' },
  { label: 'Avg cost per share (USD)', k: 'avg_cost', placeholder: '150.00', type: 'text', inputMode: 'decimal', hint: 'Average price you paid per share' },
  { label: 'Date opened', k: 'date_opened', placeholder: '', type: 'date', hint: 'When you opened this position' },
  { label: 'Target weight % (optional)', k: 'target_weight', placeholder: '5', type: 'text', inputMode: 'decimal', hint: 'e.g. 5 means you want this to be 5% of your portfolio' },
]

function NewHoldingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState<Record<Field, string>>({
    ticker: params.get('ticker')?.toUpperCase() ?? '',
    shares: '',
    avg_cost: '',
    date_opened: new Date().toISOString().split('T')[0],
    target_weight: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: Field, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const ticker = cleanTicker(form.ticker)
    const shares = Number(form.shares)
    const cost = Number(form.avg_cost)
    const target = form.target_weight.trim() ? Number(form.target_weight) : null
    if (!ticker) { setError('Enter a valid ticker, e.g. AAPL.'); return }
    if (!form.shares.trim() || !Number.isFinite(shares) || shares <= 0) { setError('Shares must be a positive number.'); return }
    if (!form.avg_cost.trim() || !Number.isFinite(cost) || cost <= 0) { setError('Average cost must be a positive number.'); return }
    if (target !== null && (!Number.isFinite(target) || target < 0 || target > 100)) { setError('Target weight must be between 0 and 100.'); return }
    if (!form.date_opened) { setError('Pick the date you opened the position.'); return }
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('holdings').insert({
      ticker,
      shares,
      avg_cost: cost,
      date_opened: form.date_opened,
      target_weight: target,
      is_open: true,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/portfolio')
    router.refresh()
  }

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-light">Add holding</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Track a new position in your portfolio.</p>
      </div>
      <form onSubmit={save} noValidate>
        <div className="space-y-5">
          {FIELDS.map(({ label, k, placeholder, type, inputMode, hint }) => (
            <div key={k} className="space-y-1.5">
              <label htmlFor={`h-${k}`} className="block text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>{label}</label>
              <input
                id={`h-${k}`}
                type={type}
                inputMode={inputMode}
                value={form[k]}
                onChange={e => set(k, k === 'ticker' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                aria-describedby={`h-${k}-hint`}
                className="w-full px-3 py-2 font-mono text-sm outline-none"
                style={INPUT}
              />
              <p id={`h-${k}-hint`} className="text-2xs" style={{ color: 'var(--ink-faint)' }}>{hint}</p>
            </div>
          ))}
          <FormError message={error} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'saving…' : 'add holding'}
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

export default function NewHoldingPage() {
  return (
    <Suspense>
      <NewHoldingForm />
    </Suspense>
  )
}
