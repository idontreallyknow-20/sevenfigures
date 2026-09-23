// Site-wide constants: canonical URL, author identity, and structured data.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://myportfolio-pi-sandy-73.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'sevenfigures'
export const SITE_TAGLINE = 'stock research tracker by Joseph Leung'
export const SITE_DESCRIPTION =
  'sevenfigures is a stock research and portfolio tracker built by Joseph Leung, a student founder in Richmond Hill, Ontario. Score stocks on seven dimensions, write a thesis, and keep an honest decision journal.'

export const AUTHOR = {
  name: 'Joseph Leung',
  fullName: 'Joseph Wah Sing Leung',
  hub: 'https://josephleung-site.vercel.app',
  github: 'https://github.com/idontreallyknow-20',
  repo: 'https://github.com/idontreallyknow-20/sevenfigures',
  dailyBrief: 'https://dailybriefhq.com',
  nerfchess: 'https://nerfchess.com',
}

// Same @id the hub site uses, so search engines merge both into one entity.
const PERSON_ID = `${AUTHOR.hub}/#joseph`

const SAME_AS = [
  'https://dailybriefhq.com/about',
  AUTHOR.dailyBrief,
  'https://ratings.fide.com/profile/2636654',
  'https://www.chess.ca/en/ratings/p/?id=167606',
  'https://www.chess.com/member/squeakycrab',
  'https://lichess.org/@/BigTrustedCrabby',
  'https://lichess.org/@/UltraAddict2010',
  'https://www.linkedin.com/in/joseph-leung-21b3473bb/',
  AUTHOR.github,
  AUTHOR.nerfchess,
]

export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: AUTHOR.name,
        alternateName: [AUTHOR.fullName, 'Wah Sing Leung'],
        url: AUTHOR.hub,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Richmond Hill',
          addressRegion: 'ON',
          addressCountry: 'CA',
        },
        knowsAbout: ['Investing', 'Stock research', 'Chess', 'Startups'],
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-CA',
        author: { '@id': PERSON_ID },
        creator: { '@id': PERSON_ID },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
        creator: { '@id': PERSON_ID },
      },
    ],
  }
}

const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME}, a ${SITE_TAGLINE}` }

// Full title/description/canonical/Open Graph/Twitter set for a page. Next replaces
// (rather than merges) a parent's openGraph object, so each page gets the whole thing.
export function pageMetadata({ title, description, path, absoluteTitle = false }: {
  title: string
  description: string
  path: string
  absoluteTitle?: boolean
}) {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website' as const,
      siteName: SITE_NAME,
      locale: 'en_CA',
      url: path,
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image' as const, title: fullTitle, description, images: [OG_IMAGE.url] },
  }
}
