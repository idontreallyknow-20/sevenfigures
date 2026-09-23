import { NextRequest, NextResponse } from 'next/server'
import { getMetrics } from '@/lib/finnhub'
import { cleanTicker } from '@/lib/ticker'
import { MARKET_CACHE } from '@/lib/market'

// Proxies Finnhub /stock/metric. Key stays server-side; cached for 60s.
export async function GET(req: NextRequest) {
  const ticker = cleanTicker(req.nextUrl.searchParams.get('ticker'))
  if (!ticker) return NextResponse.json({ error: 'valid ticker required' }, { status: 400 })
  const metrics = await getMetrics(ticker)
  return NextResponse.json({ metrics })
}
