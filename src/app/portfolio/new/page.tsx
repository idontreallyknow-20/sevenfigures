'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

function NewHoldingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({
    ticker: params.get('ticker')?.toUpperCase() ?? '',
    shares: '',
    avg_cost: '',
    date_opened: new Date().toISOString().split('T')[0],
    target_weight: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function save() {
    if (!form.ticker || !form.shares || !form.avg_cost) {
      setError('Ticker, shares, and average cost are required')
      return
    }
    const sharesNum = parseFloat(form.shares)
    const costNum = parseFloat(form.avg_cost)
    if (isNaN(sharesNum) || sharesNum <= 0) { setError('Shares must be a positive number'); return }
    if (isNaN(costNum) || costNum <= 0) { setError('Avg cost must be a positive number'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('holdings').insert({
      ticker: form.ticker.toUpperCase(),
      shares: sharesNum,
      avg_cost: costNum,
      date_opened: form.date_opened,
      target_weight: form.target_weight ? parseFloat(form.target_weight) : null,
      is_open: true,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/portfolio')
  }

  const fields: Array<{ label: string; k: keyof typeof form; placeholder: string; upper?: boolean; type: string; hint: string }> = [
    { label: 'Ticker', k: 'ticker', placeholder: 'AAPL', upper: true, type: 'text', hint: 'The stock symbol, e.g. AAPL or MSFT' },
    { label: 'Shares owned', k: 'shares', placeholder: '10', type: 'text', hint: 'How many shares you hold' },
    { label: 'Avg cost per share ($)', k: 'avg_cost', placeholder: '150.00', type: 'text', hint: 'Average price you paid per share' },
    { label: 'Date opened', k: 'date_opened', placeholder: '', type: 'date', hint: 'When you opened this position' },
    { label: 'Target weight % (optional)', k: 'target_weight', placeholder: '5', type: 'text', hint: 'e.g. 5 means you want this to be 5% of your portfolio' },
  ]

  return (
    <main className="max-w-lg mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-light">Add holding</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Track a new position in your portfolio</p>
      </div>
      <div className="space-y-5">
        {fields.map(({ label, k, placeholder, upper, type, hint }) => (
          <div key={k} className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>{label}</label>
            <input
              type={type}
              value={form[k]}
              onChange={e => set(k, upper ? e.target.value.toUpperCase() : e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
            <p className="text-2xs" style={{ color: 'var(--ink-faint)' }}>{hint}</p>
          </div>
        ))}
        {error && (
          <p className="text-xs px-3 py-2" style={{ background: '#7a1a1a18', color: '#7a1a1a', border: '0.5px solid #7a1a1a40' }}>{error}</p>
        )}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
          style={{ background: 'var(--accent)', color: 'white', border: '0.5px solid var(--accent)', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'saving...' : 'add holding'}
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

export default function NewHoldingPage() {
  return (
    <ThemeProvider>
      <Nav />
      <Suspense>
        <NewHoldingForm />
      </Suspense>
    </ThemeProvider>
  )
}
