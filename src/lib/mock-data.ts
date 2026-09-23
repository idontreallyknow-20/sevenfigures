import type { QuoteData } from './types'

// Demo-mode prices for when no market data key is configured. Everything is
// derived from the ticker and today's date, so quotes, sparklines and charts
// agree with each other and don't jump around on every refresh.
const mockPrices: Record<string, number> = {
  NVDA: 128.40,
  MSFT: 420.15,
  AMD: 158.70,
  COST: 905.30,
  ASML: 890.60,
  GOOGL: 178.50,
  V: 278.20,
  META: 512.30,
  AMZN: 192.40,
  TSM: 168.90,
  AVGO: 1680.40,
  LRCX: 840.20,
  ANET: 328.50,
  SOXX: 222.80,
  QQQ: 480.10,
  SPY: 588.40,
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

// Small seeded PRNG (mulberry32).
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function basePrice(ticker: string): number {
  return mockPrices[ticker] ?? 40 + (hash(ticker) % 400)
}

// A random walk that ends at the ticker's base price today.
export function getMockBars(ticker: string, days: number): { date: string; close: number }[] {
  const today = new Date().toISOString().split('T')[0]
  const rand = rng(hash(ticker + today))
  const closes = [basePrice(ticker)]
  for (let i = 0; i < days; i++) closes.unshift(closes[0] / (1 + (rand() - 0.49) * 0.03))
  const now = new Date()
  return closes.map((close, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (closes.length - 1 - i))
    return { date: d.toISOString().split('T')[0], close: Math.round(close * 100) / 100 }
  })
}

export function getMockQuote(ticker: string): QuoteData {
  const bars = getMockBars(ticker, 1)
  const price = bars[1].close
  const change = price - bars[0].close
  return { ticker, price, change, changePercent: (change / bars[0].close) * 100, isDemo: true }
}
