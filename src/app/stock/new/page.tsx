'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

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
  const [marketCap, setMarketCap] = useState<string>('')
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  // On blur of the ticker field, pull name / sector / market cap from the
  // profile endpoint so I only have to pick the theme by hand.
  async function autofill() {
    const ticker = form.ticker.trim().toUpperCase()
    if (!ticker) return
    setFetching(true)
    setError('')
    try {
      const res = await fetch(`/api/profile?ticker=${ticker}`)
      const data = await res.json()
      const p = data.profile
      if (p) {
        setForm(prev => ({
          ...prev,
          name: p.name && p.name !== ticker ? p.name : prev.name,
          sector: p.sector ?? prev.sector,
        }))
        setMarketCap(fmtCap(p.marketCap ?? null))
      }
    } catch {
      setError('Could not auto-fetch profile')
    } finally {
      setFetching(false)
    }
  }

  async function save() {
    if (!form.ticker || !form.name) { setError('Ticker and name are required'); return }
    setSaving(true)
    const { error: err } = await supabase.from('securities').insert({
      ticker: form.ticker.toUpperCase(),
      name: form.name,
      theme: form.theme || null,
      sector: form.sector || null,
      source: form.source || 'own screen',
      date_added: new Date().toISOString().split('T')[0],
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/stock/${form.ticker.toUpperCase()}/edit-score`)
  }

  return (
    <ThemeProvider>
      <Nav />
      <main className="max-w-lg mx-auto px-6 py-8">
        <h1 className="font-serif text-2xl font-light mb-1">Add security</h1>
        <p className="text-xs mb-6" style={{ color: 'var(--ink-faint)' }}>
          Type a ticker and tab out — name, sector and market cap fill in automatically. You just pick the theme.
        </p>
        <div className="space-y-4">
          {/* Ticker — drives the autofill */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>Ticker</label>
            <div className="relative">
              <input
                type="text"
                value={form.ticker}
                onChange={e => set('ticker', e.target.value.toUpperCase())}
                onBlur={autofill}
                placeholder="NVDA"
                className="w-full px-3 py-2 font-mono text-sm outline-none"
                style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
              />
              {fetching && <span className="absolute right-3 top-2.5 text-2xs font-mono" style={{ color: 'var(--ink-faint)' }}>fetching…</span>}
            </div>
          </div>

          {/* Auto-filled: name */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--ink-faint)' }}>
              Name <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="NVIDIA Corporation"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>

          {/* Auto-filled: sector */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--ink-faint)' }}>
              Sector <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </label>
            <input
              type="text"
              value={form.sector}
              onChange={e => set('sector', e.target.value)}
              placeholder="Information Technology"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>

          {/* Auto-filled (display only): market cap */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--ink-faint)' }}>
              Market cap <span className="text-2xs lowercase" style={{ color: 'var(--accent)' }}>auto</span>
            </label>
            <div className="px-3 py-2 font-mono text-sm" style={{ border: '0.5px solid var(--border)', color: marketCap ? 'var(--ink)' : 'var(--ink-faint)' }}>
              {marketCap || '—'}
            </div>
          </div>

          {/* Manual: theme */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--ink-faint)' }}>
              Theme <span className="text-2xs lowercase" style={{ color: 'var(--ink-faint)' }}>manual</span>
            </label>
            <input
              type="text"
              value={form.theme}
              onChange={e => set('theme', e.target.value)}
              placeholder="AI compute"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#7a1a1a' }}>{error}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'var(--accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'saving...' : 'add & score'}
          </button>
          <button onClick={() => router.back()} className="px-4 py-2 text-xs font-mono uppercase tracking-wider" style={{ border: '0.5px solid var(--border)', color: 'var(--ink-muted)' }}>
            cancel
          </button>
        </div>
      </main>
    </ThemeProvider>
  )
}
