import { getQuote as getAlpacaQuote } from './alpaca'
import type { QuoteData } from './types'

// Finnhub proxy helpers. The API key is read server-side only (process.env.FINNHUB_KEY)
// and is NEVER sent to the client — these functions only run inside route handlers /
// server components. When no key is configured we fall back to deterministic mock data
// so the site still renders in demo mode.

const BASE_URL = 'https://finnhub.io/api/v1'
const apiKey = process.env.FINNHUB_KEY
const hasFinnhub = !!apiKey

export interface Profile {
  ticker: string
  name: string
  sector: string | null
  marketCap: number | null // absolute USD
  logo: string | null
  exchange: string | null
  isDemo?: boolean
}

export interface Metrics {
  ticker: string
  peTTM: number | null
  forwardPE: number | null
  revenueGrowth: number | null // percent YoY
  grossMargin: number | null // percent
  marketCap: number | null // absolute USD
  week52High: number | null
  week52Low: number | null
  isDemo?: boolean
}

// --- deterministic mock helpers (demo mode) -------------------------------

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function mockProfile(ticker: string): Profile {
  const h = hash(ticker)
  return {
    ticker,
    name: ticker,
    sector: ['Information Technology', 'Consumer Staples', 'Health Care', 'Financials'][h % 4],
    marketCap: (50 + (h % 2000)) * 1e9,
    logo: null,
    exchange: 'NASDAQ',
    isDemo: true,
  }
}

function mockMetrics(ticker: string): Metrics {
  const h = hash(ticker)
  const high = 100 + (h % 800)
  return {
    ticker,
    peTTM: 15 + (h % 45),
    forwardPE: 12 + (h % 35),
    revenueGrowth: ((h % 60) - 10),
    grossMargin: 30 + (h % 50),
    marketCap: (50 + (h % 2000)) * 1e9,
    week52High: high,
    week52Low: Math.round(high * 0.6 * 100) / 100,
    isDemo: true,
  }
}

// --- live + fallback fetchers --------------------------------------------

export async function getQuote(ticker: string): Promise<QuoteData> {
  if (!hasFinnhub) return getAlpacaQuote(ticker)
  try {
    const res = await fetch(`${BASE_URL}/quote?symbol=${ticker}&token=${apiKey}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('quote fetch failed')
    const d = await res.json()
    if (d.c == null || d.c === 0) throw new Error('empty quote')
    return { ticker, price: d.c, change: d.d ?? 0, changePercent: d.dp ?? 0 }
  } catch {
    return getAlpacaQuote(ticker)
  }
}

export async function getProfile(ticker: string): Promise<Profile> {
  if (!hasFinnhub) return mockProfile(ticker)
  try {
    const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${ticker}&token=${apiKey}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('profile fetch failed')
    const d = await res.json()
    if (!d || !d.name) throw new Error('empty profile')
    return {
      ticker,
      name: d.name,
      sector: d.finnhubIndustry ?? null,
      // Finnhub returns marketCapitalization in millions of the listing currency.
      marketCap: d.marketCapitalization ? d.marketCapitalization * 1e6 : null,
      logo: d.logo ?? null,
      exchange: d.exchange ?? null,
    }
  } catch {
    return mockProfile(ticker)
  }
}

export async function getMetrics(ticker: string): Promise<Metrics> {
  if (!hasFinnhub) return mockMetrics(ticker)
  try {
    const res = await fetch(`${BASE_URL}/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error('metric fetch failed')
    const d = await res.json()
    const m = d?.metric
    if (!m) throw new Error('empty metric')
    const num = (v: unknown): number | null =>
      typeof v === 'number' && Number.isFinite(v) ? v : null
    return {
      ticker,
      peTTM: num(m.peTTM ?? m.peBasicExclExtraTTM),
      forwardPE: num(m.forwardPE ?? m.peExclExtraAnnual),
      revenueGrowth: num(m.revenueGrowthTTMYoy ?? m.revenueGrowthQuarterlyYoy),
      grossMargin: num(m.grossMarginTTM ?? m.grossMarginAnnual),
      marketCap: m.marketCapitalization ? m.marketCapitalization * 1e6 : null,
      week52High: num(m['52WeekHigh']),
      week52Low: num(m['52WeekLow']),
    }
  } catch {
    return mockMetrics(ticker)
  }
}

export { hasFinnhub }
