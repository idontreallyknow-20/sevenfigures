import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/finnhub'

// Proxies Finnhub /stock/profile2. Key stays server-side; cached for 60s.
export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase() ?? ''
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  const profile = await getProfile(ticker)
  return NextResponse.json({ profile })
}
