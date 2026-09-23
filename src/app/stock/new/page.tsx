'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'
import { cleanTicker } from '@/lib/ticker'
import { FormError } from '@/components/FormError'

const LABEL = 'text-xs uppercase tracking-wider flex items-center gap-2'
const INPUT = { background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }

function fmtCap(v: number | null): string {
  if (v == null) return ''
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toFixed(0)}`
}

export default function NewStockPage() {
  const router = useRouter()
  const [form, setForm] = useState({ ticker: '', name: '', theme: '', sector: '', source: 'own screen' })
  const [marketCap, setMarketCap] = useState('')
  const [fetchedFor, setFetchedFor] = useState('')
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  // On blur of the ticker field, pull name / sector / market cap from the
  // profile endpoint so only the theme has to be picked by hand.
  async function autofill() {
    const ticker = cleanTicker(form.ticker)
    if (!ticker || ticker === fetchedFor) return
    setFetching(true)
    setError('')
    try {
      const res = await fetch(`/api/profile?ticker=${ticker}`)
      if (!res.ok) throw new Error()
      const p = (await res.json()).profile
      if (p) {
        setForm(prev => ({
          ...prev,
          name: p.name && p.name !== ticker ? p.name : prev.name,
          sector: p.sector ?? prev.sector,
        }))
        setMarketCap(fmtCap(p.marketCap ?? null))
      }
      setFetchedFor(ticker)
    } catch {
      setError('Couldn’t auto-fill the company details. You can type them in.')
    } finally {
      setFetching(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const ticker = cleanTicker(form.ticker)
    if (!ticker) { setError('Enter a valid ticker, e.g. NVDA.'); return }
    if (!form.name.trim()) { setError('Company name is required.'); return }
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('securities').insert({
      ticker,
      name: form.name.trim(),
      theme: form.theme.trim() || null,
      sector: form.sector.trim() || null,
      source: form.source || 'own screen',
      date_added: new Date().toISOString().split('T')[0],
    })
    if (err) {
      setError(err.code === '23505' ? `${ticker} is already on your watchlist.` : err.message)
      setSaving(false)
      return
    }
    router.push(`/stock/${ticker}/edit-score`)
  }

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-light mb-1">Add security</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--ink-muted)' }}>
        Type a ticker and tab out. Name, sector and market cap fill in automatically, so you only pick the theme.
      </p>
      <form onSubmit={save} noValidate>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="s-ticker" className={LABEL} style={{ color: 'var(--ink-muted)' }}>Ticker</label>
            <div className="relative">
              <input
                id="s-ticker"
                type="text"
                value={form.ticker}
                onChange={e => set('ticker', e.target.value.toUpperCase())}
                onBlur={autofill}
                placeholder="NVDA"
                autoComplete="off"
                className="w-full px-3 py-2 font-mono text-sm outline-none"
                style={INPUT}
              />
              {fetching && <span className="absolute right-3 top-2.5 text-2xs font-mono" style={{ color: 'var(--ink-faint)' }}>fetching…</span>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="s-name" className={LABEL} style={{ color: 'var(--ink-muted)' }}>
              Name <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </label>
            <input
              id="s-name"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="NVIDIA Corporation"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="s-sector" className={LABEL} style={{ color: 'var(--ink-muted)' }}>
              Sector <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </label>
            <input
              id="s-sector"
              type="text"
              value={form.sector}
              onChange={e => set('sector', e.target.value)}
              placeholder="Information Technology"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <span className={LABEL} style={{ color: 'var(--ink-muted)' }}>
              Market cap <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </span>
            <div className="px-3 py-2 font-mono text-sm" style={{ border: '0.5px solid var(--border)', color: marketCap ? 'var(--ink)' : 'var(--ink-faint)' }}>
              {marketCap || '—'}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="s-theme" className={LABEL} style={{ color: 'var(--ink-muted)' }}>
              Theme <span className="text-2xs lowercase" style={{ color: 'var(--ink-faint)' }}>manual</span>
            </label>
            <input
              id="s-theme"
              type="text"
              value={form.theme}
              onChange={e => set('theme', e.target.value)}
              placeholder="AI compute"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={INPUT}
            />
          </div>

          <FormError message={error} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving || fetching}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)', opacity: saving || fetching ? 0.7 : 1 }}
          >
            {saving ? 'saving…' : 'add & score'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-xs font-mono uppercase tracking-wider" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            cancel
          </button>
        </div>
      </form>
    </main>
  )
}
