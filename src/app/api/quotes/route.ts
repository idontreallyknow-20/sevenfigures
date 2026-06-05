import { NextRequest, NextResponse } from 'next/server'
import { getQuote, hasAlpaca } from '@/lib/alpaca'

export async function GET(req: NextRequest) {
  const tickers = req.nextUrl.searchParams.get('tickers')?.split(',').filter(Boolean) ?? []
  if (tickers.length === 0) return NextResponse.json({ quotes: {}, isDemo: !hasAlpaca })
  const results = await Promise.all(tickers.map(t => getQuote(t)))
  const quotes: Record<string, unknown> = {}
  let anyDemo = false
  for (const q of results) {
    quotes[q.ticker] = q
    if (q.isDemo) anyDemo = true
  }
  return NextResponse.json({ quotes, isDemo: anyDemo })
}
