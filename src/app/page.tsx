import type { Metadata } from 'next'
import { computeTotal, computeTier } from '@/lib/types'
import { getWatchlist } from '@/lib/data'
import { hasLiveData } from '@/lib/market'
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, pageMetadata } from '@/lib/site'
import { WatchlistClient } from './WatchlistClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
})

export default async function HomePage() {
  const { securities, scores } = await getWatchlist()
  const scoreMap = Object.fromEntries(scores.map(s => [s.ticker, s]))
  const rows = securities.map(sec => {
    const score = scoreMap[sec.ticker]
    const total = score ? computeTotal(score) : 0
    const tier = computeTier(total)
    return { ...sec, score, total, tier }
  })
  return <WatchlistClient rows={rows} demoPrices={!hasLiveData} />
}
