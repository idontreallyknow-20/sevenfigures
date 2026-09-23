import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getWatchlist } from '@/lib/data'

export const revalidate = 3600

// Public research pages only. Portfolio, journal and forms are noindexed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { securities } = await getWatchlist()
  const now = new Date()
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    ...securities.map(s => ({
      url: `${SITE_URL}/stock/${s.ticker}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
