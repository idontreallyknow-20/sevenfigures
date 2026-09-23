import type { QuoteData } from './types'

// Mock prices for demo mode when Alpaca is not configured
const mockPrices: Record<string, number> = {
  GOOGL: 178.50,
  V: 278.20,
  META: 512.30,
  AMZN: 192.40,
  TSM: 168.90,
  MSFT: 420.15,
  ASML: 890.60,
  AVGO: 1680.40,
  LRCX: 840.20,
  ANET: 328.50,
  SOXX: 222.80,
  QQQ: 480.10,
  SPY: 588.40,
}

export function getMockQuote(ticker: string): QuoteData {
  const price = mockPrices[ticker] ?? 100 + Math.random() * 200
  const change = (Math.random() - 0.5) * price * 0.03
  return {
    ticker,
    price,
    change,
    changePercent: (change / price) * 100,
    isDemo: true,
  }
}

export function getMockBars(ticker: string, days: number): { date: string; close: number }[] {
  const price = mockPrices[ticker] ?? 150
  const bars = []
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const noise = 1 + (Math.random() - 0.5) * 0.04
    bars.push({
      date: d.toISOString().split('T')[0],
      close: Math.round(price * noise * 100) / 100,
    })
  }
  return bars
}
