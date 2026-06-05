'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

export default function CloseHoldingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ticker, setTicker] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [logJournal, setLogJournal] = useState(true)
  const [reasoning, setReasoning] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('holdings').select('ticker, avg_cost, shares').eq('id', params.id).single()
      .then(({ data }) => { if (data) setTicker(data.ticker) })
  }, [params.id])

  async function close() {
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('holdings')
      .update({ is_open: false })
      .eq('id', params.id)
    if (err) { setError(err.message); setSaving(false); return }
    if (logJournal && reasoning.trim()) {
      await supabase.from('journal').insert({
        ticker,
        action: 'sell',
        conviction: null,
        reasoning,
        expectation: sellPrice ? `Closed at $${sellPrice}` : null,
      })
    }
    router.push('/portfolio')
  }

  return (
    <ThemeProvider>
      <Nav />
      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-light">Close position{ticker ? ` — ${ticker}` : ''}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
            This marks the holding as closed. It will move out of your open positions.
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Exit price per share (optional)</label>
            <input
              type="text"
              value={sellPrice}
              onChange={e => setSellPrice(e.target.value)}
              placeholder="182.50"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="logJournal"
              checked={logJournal}
              onChange={e => setLogJournal(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <label htmlFor="logJournal" className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              Log a sell entry in the journal
            </label>
          </div>
          {logJournal && (
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Reasoning</label>
              <textarea
                value={reasoning}
                onChange={e => setReasoning(e.target.value)}
                rows={4}
                placeholder="Why are you closing this position?"
                className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
                style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
              />
            </div>
          )}
          {error && (
            <p className="text-xs px-3 py-2" style={{ background: '#7a1a1a18', color: '#7a1a1a', border: '0.5px solid #7a1a1a40' }}>{error}</p>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={close}
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: '#7a1a1a', color: 'white', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'closing...' : 'close position'}
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
    </ThemeProvider>
  )
}
