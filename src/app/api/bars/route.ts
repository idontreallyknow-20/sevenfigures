import { NextRequest, NextResponse } from 'next/server'
import { getBars } from '@/lib/alpaca'
import { cleanTicker } from '@/lib/ticker'
import { MARKET_CACHE } from '@/lib/market'

export async function GET(req: NextRequest) {
  const ticker = cleanTicker(req.nextUrl.searchParams.get('ticker'))
  if (!ticker) return NextResponse.json({ error: 'valid ticker required' }, { status: 400 })
  const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10) || 30, 1), 1825)
  const bars = await getBars(ticker, days)
  return NextResponse.json({ bars })
}
