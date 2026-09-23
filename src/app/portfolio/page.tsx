import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/site'
import { supabase } from '@/lib/supabase'
import { PortfolioClient } from './PortfolioClient'
import { hasLiveData } from '@/lib/market'
import type { Holding, Security, Score } from '@/lib/types'
import { computeTotal, computeTier } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Real holdings and P&L: kept out of search results.
export const metadata: Metadata = {
  ...pageMetadata({ title: 'Portfolio', description: 'Open positions with live P&L, weights and allocation by theme.', path: '/portfolio' }),
  robots: { index: false, follow: true },
}

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
    const security = securities[h.ticker] as Security | undefined
    const score = scores[h.ticker]
    const total = score ? computeTotal(score) : 0
    const tier = computeTier(total)
    return { ...h, security, score, total, tier }
  })
  return <PortfolioClient holdings={enriched} demoPrices={!hasLiveData} />
}
