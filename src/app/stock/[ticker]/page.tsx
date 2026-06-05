import { supabase } from '@/lib/supabase'
import { computeTotal, computeTier } from '@/lib/types'
import { StockDetailClient } from './StockDetailClient'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'

export default async function StockPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const [secRes, scoreRes, thesisRes, journalRes] = await Promise.all([
    supabase.from('securities').select('*').eq('ticker', ticker).single(),
    supabase.from('scores').select('*').eq('ticker', ticker).single(),
    supabase.from('theses').select('*').eq('ticker', ticker).single(),
    supabase.from('journal').select('*').eq('ticker', ticker).order('created_at', { ascending: false }).limit(5),
  ])

  const security = secRes.data
  const score = scoreRes.data
  const thesis = thesisRes.data
  const recentJournal = journalRes.data ?? []

  if (!security) {
    return (
      <ThemeProvider>
        <Nav />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <p className="font-mono text-sm" style={{ color: 'var(--ink-muted)' }}>Ticker not found: {ticker}</p>
        </main>
      </ThemeProvider>
    )
  }

  const total = score ? computeTotal(score) : 0
  const tier = computeTier(total)

  return (
    <ThemeProvider>
      <Nav />
      <StockDetailClient
        security={security}
        score={score}
        thesis={thesis}
        recentJournal={recentJournal}
        total={total}
        tier={tier}
      />
    </ThemeProvider>
  )
}
