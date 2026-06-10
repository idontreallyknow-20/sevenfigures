import { NextRequest, NextResponse } from 'next/server'
import { getMetrics } from '@/lib/finnhub'

// Proxies Finnhub /stock/metric. Key stays server-side; cached for 60s.
export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase() ?? ''
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  const metrics = await getMetrics(ticker)
  return NextResponse.json({ metrics })
}
