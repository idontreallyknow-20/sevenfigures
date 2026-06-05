import { getMockQuote, getMockBars } from './mock-data'
import type { QuoteData } from './types'

const BASE_URL = 'https://data.alpaca.markets/v2'
const apiKey = process.env.ALPACA_API_KEY
const apiSecret = process.env.ALPACA_API_SECRET
const hasAlpaca = !!(apiKey && apiSecret)

function headers() {
  return {
    'APCA-API-KEY-ID': apiKey!,
    'APCA-API-SECRET-KEY': apiSecret!,
  }
}

export async function getQuote(ticker: string): Promise<QuoteData> {
  if (!hasAlpaca) return getMockQuote(ticker)
  try {
    const [quoteRes, prevRes] = await Promise.all([
      fetch(`${BASE_URL}/stocks/${ticker}/quotes/latest`, { headers: headers(), next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/stocks/${ticker}/bars?timeframe=1Day&limit=2&sort=desc`, { headers: headers(), next: { revalidate: 300 } }),
    ])
    if (!quoteRes.ok) throw new Error('quote fetch failed')
    const quoteData = await quoteRes.json()
    const price = quoteData.quote?.ap ?? quoteData.quote?.bp ?? 0
    let prevClose = price
    if (prevRes.ok) {
      const prevData = await prevRes.json()
      const bars = prevData.bars ?? []
      if (bars.length >= 2) prevClose = bars[1].c
      else if (bars.length === 1) prevClose = bars[0].c
    }
    const change = price - prevClose
    return { ticker, price, change, changePercent: prevClose ? (change / prevClose) * 100 : 0 }
  } catch {
    return { ...getMockQuote(ticker), isDemo: true }
  }
}

export async function getBars(ticker: string, days: number): Promise<{ date: string; close: number }[]> {
  if (!hasAlpaca) return getMockBars(ticker, days)
  try {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    const params = new URLSearchParams({
      timeframe: '1Day',
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      sort: 'asc',
    })
    const res = await fetch(`${BASE_URL}/stocks/${ticker}/bars?${params}`, {
      headers: headers(),
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error('bars fetch failed')
    const data = await res.json()
    return (data.bars ?? []).map((b: { t: string; c: number }) => ({ date: b.t.split('T')[0], close: b.c }))
  } catch {
    return getMockBars(ticker, days)
  }
}

export { hasAlpaca }
