'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, hasSupabase, NO_DB_MESSAGE } from '@/lib/supabase'
import { FormError } from '@/components/FormError'

const INPUT = { background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--ink)' }

export default function CloseHoldingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [holding, setHolding] = useState<{ ticker: string; is_open: boolean } | null | undefined>(hasSupabase ? undefined : null)
  const [sellPrice, setSellPrice] = useState('')
  const [logJournal, setLogJournal] = useState(true)
  const [reasoning, setReasoning] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasSupabase) return
    supabase.from('holdings').select('ticker, is_open').eq('id', params.id).maybeSingle()
      .then(({ data }) => setHolding(data ?? null), () => setHolding(null))
  }, [params.id])

  async function close(e: React.FormEvent) {
    e.preventDefault()
    if (!hasSupabase) { setError(NO_DB_MESSAGE); return }
    if (!holding) return
    const price = sellPrice.trim() ? Number(sellPrice) : null
    if (price !== null && (!Number.isFinite(price) || price <= 0)) { setError('Exit price must be a positive number.'); return }
    if (logJournal && !reasoning.trim()) { setError('Add a line of reasoning, or untick the journal entry.'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('holdings').update({ is_open: false }).eq('id', params.id)
    if (err) { setError(err.message); setSaving(false); return }
    if (logJournal) {
      const { error: jErr } = await supabase.from('journal').insert({
        ticker: holding.ticker,
        action: 'sell',
        conviction: null,
        reasoning: reasoning.trim(),
        expectation: price !== null ? `Closed at $${price.toFixed(2)}` : null,
      })
      if (jErr) { setError(`Position closed, but the journal entry failed: ${jErr.message}`); setSaving(false); return }
    }
    router.push('/portfolio')
    router.refresh()
  }

  if (holding === undefined) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8" aria-busy="true">
        <div className="skeleton h-9 w-64 mb-6" />
        <div className="skeleton h-40" />
      </main>
    )
  }

  if (holding === null || !holding.is_open) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-3xl font-light mb-3">Close position</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>
          {!hasSupabase ? NO_DB_MESSAGE : holding === null ? 'That holding doesn’t exist.' : 'That position is already closed.'}
        </p>
        <Link href="/portfolio" className="link text-xs">← back to portfolio</Link>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-light">Close position: {holding.ticker}</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
          Marks the holding as closed and moves it out of your open positions.
        </p>
      </div>
      <form onSubmit={close} noValidate>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="c-price" className="block text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Exit price per share (optional)</label>
            <input
              id="c-price"
              type="text"
              inputMode="decimal"
              value={sellPrice}
              onChange={e => setSellPrice(e.target.value)}
              placeholder="182.50"
              autoComplete="off"
              className="w-full px-3 py-2 font-mono text-sm outline-none"
              style={INPUT}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="c-log"
              checked={logJournal}
              onChange={e => setLogJournal(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <label htmlFor="c-log" className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              Log a sell entry in the journal
            </label>
          </div>
          {logJournal && (
            <div className="space-y-1.5">
              <label htmlFor="c-reason" className="block text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Reasoning</label>
              <textarea
                id="c-reason"
                value={reasoning}
                onChange={e => setReasoning(e.target.value)}
                rows={4}
                placeholder="Why are you closing this position?"
                className="w-full px-3 py-2 font-serif text-sm resize-y outline-none"
                style={INPUT}
              />
            </div>
          )}
          <FormError message={error} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider"
            style={{ background: '#8a1f1f', color: '#ffffff', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'closing…' : 'close position'}
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
