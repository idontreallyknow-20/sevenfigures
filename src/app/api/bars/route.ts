import { NextRequest, NextResponse } from 'next/server'
import { getBars } from '@/lib/alpaca'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') ?? ''
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)
  if (!ticker) return NextResponse.json({ bars: [] })
  const bars = await getBars(ticker, days)
  return NextResponse.json({ bars })
}
