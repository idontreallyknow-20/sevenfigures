import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { computeTotal, computeTier, type QualityScore, type Security } from '@/lib/types'
import { SEED_SECURITIES, SEED_SCORES, defaultQuality } from '@/lib/seed'
import { cleanTicker } from '@/lib/ticker'
import { pageMetadata } from '@/lib/site'
import { hasLiveData } from '@/lib/market'
import { StockDetailClient } from './StockDetailClient'

const getSecurity = cache(async (ticker: string): Promise<Security | null> => {
  const { data } = await supabase.from('securities').select('*').eq('ticker', ticker).maybeSingle()
  // Fall back to the seed list so seeded tickers resolve before the DB is wired.
  return data ?? SEED_SECURITIES.find(s => s.ticker === ticker) ?? null
})

export async function generateMetadata({ params }: { params: { ticker: string } }): Promise<Metadata> {
  const ticker = cleanTicker(params.ticker)
  const security = ticker ? await getSecurity(ticker) : null
  if (!security) return { title: 'Ticker not found', robots: { index: false } }
  const title = `${security.ticker} (${security.name}) research notes`
  const description = `${security.name} (${security.ticker}) on sevenfigures: live price, key metrics, a seven-dimension conviction score and the investment thesis.`
  return pageMetadata({ title, description, path: `/stock/${security.ticker}` })
}

export default async function StockPage({ params }: { params: { ticker: string } }) {
  const ticker = cleanTicker(params.ticker)
  if (!ticker) notFound()
  const security = await getSecurity(ticker)
  if (!security) notFound()

  const [scoreRes, thesisRes, qualityRes, journalRes] = await Promise.all([
    supabase.from('scores').select('*').eq('ticker', ticker).maybeSingle(),
    supabase.from('theses').select('*').eq('ticker', ticker).maybeSingle(),
    supabase.from('quality_scores').select('*').eq('ticker', ticker).maybeSingle(),
    supabase.from('journal').select('*').eq('ticker', ticker).order('created_at', { ascending: false }).limit(5),
  ])

  const score = scoreRes.data ?? SEED_SCORES[ticker] ?? null
  const quality: QualityScore = qualityRes.data ?? defaultQuality(ticker)
  const total = score ? computeTotal(score) : 0

  return (
    <StockDetailClient
      security={security}
      score={score}
      thesis={thesisRes.data}
      quality={quality}
      recentJournal={journalRes.data ?? []}
      total={total}
      tier={computeTier(total)}
      demoPrices={!hasLiveData}
    />
  )
}
