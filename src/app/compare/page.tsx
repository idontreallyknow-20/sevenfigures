import type { Metadata } from 'next'
import { getWatchlist } from '@/lib/data'
import { pageMetadata } from '@/lib/site'
import { CompareClient } from './CompareClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Compare stocks side by side',
  description:
    'Overlay up to four stocks on a radar chart across seven dimensions: moat, valuation, catalyst, falsifiability, edge, diversification and downside.',
  path: '/compare',
})

export default async function ComparePage() {
  const { securities, scores } = await getWatchlist()
  return <CompareClient securities={securities} scores={scores} />
}
