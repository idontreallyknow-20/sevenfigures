'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

export default function NewStockPage() {
  const router = useRouter()
  const [form, setForm] = useState({ ticker: '', name: '', theme: '', sector: '', source: 'own screen' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

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
        <h1 className="font-serif text-2xl font-light mb-6">Add security</h1>
        <div className="space-y-4">
          {[
            { label: 'Ticker', k: 'ticker' as const, placeholder: 'NVDA', upper: true },
            { label: 'Name', k: 'name' as const, placeholder: 'NVIDIA Corporation' },
            { label: 'Theme', k: 'theme' as const, placeholder: 'AI compute' },
            { label: 'Sector', k: 'sector' as const, placeholder: 'Information Technology' },
            { label: 'Source', k: 'source' as const, placeholder: 'own screen' },
          ].map(({ label, k, placeholder, upper }) => (
            <div key={k} className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>{label}</label>
              <input
                type="text"
                value={form[k]}
                onChange={e => set(k, upper ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 font-mono text-sm outline-none"
                style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
              />
            </div>
          ))}
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
