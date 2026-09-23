import { NextRequest, NextResponse } from 'next/server'
import { getQuote } from '@/lib/finnhub'
import { cleanTicker } from '@/lib/ticker'
import { MARKET_CACHE } from '@/lib/market'

const MAX_TICKERS = 50

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('tickers')?.split(',') ?? []
  const tickers = Array.from(new Set(raw.map(cleanTicker).filter((t): t is string => t !== null))).slice(0, MAX_TICKERS)
  if (tickers.length === 0) return NextResponse.json({ quotes: {}, isDemo: false })
  const results = await Promise.all(tickers.map(t => getQuote(t)))
  const quotes: Record<string, unknown> = {}
  let anyDemo = false
  for (const q of results) {
    quotes[q.ticker] = q
    if (q.isDemo) anyDemo = true
  }
  return NextResponse.json({ quotes, isDemo: anyDemo }, { headers: MARKET_CACHE })
}
