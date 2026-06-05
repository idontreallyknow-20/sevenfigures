import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { PortfolioClient } from './PortfolioClient'
import type { Holding, Security, Score } from '@/lib/types'
import { computeTotal, computeTier } from '@/lib/types'

export default async function PortfolioPage() {
  const [holdingsRes, secRes, scoreRes] = await Promise.all([
    supabase.from('holdings').select('*').eq('is_open', true),
    supabase.from('securities').select('*'),
    supabase.from('scores').select('*'),
  ])
  const holdings = (holdingsRes.data ?? []) as Holding[]
  const securities = Object.fromEntries(((secRes.data ?? []) as Security[]).map(s => [s.ticker, s]))
  const scores = Object.fromEntries(((scoreRes.data ?? []) as Score[]).map(s => [s.ticker, s]))
  const enriched = holdings.map(h => {
    const sec = securities[h.ticker]
    const score = scores[h.ticker]
    const total = score ? computeTotal(score) : 0
    const tier = computeTier(total)
    return { ...h, security: sec, score, total, tier }
  })
  return (
    <ThemeProvider>
      <Nav />
      <PortfolioClient holdings={enriched} />
    </ThemeProvider>
  )
}
