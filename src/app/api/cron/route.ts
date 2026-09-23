import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, hasSupabase } from '@/lib/supabase'
import { getBars } from '@/lib/alpaca'

// Called daily by Vercel Cron (see vercel.json).
// Captures today's closing price for every security in the watchlist.
export async function GET(req: NextRequest) {
  // This endpoint writes to the database, so it stays locked unless CRON_SECRET is set
  // and matches (Vercel Cron sends it as a Bearer token).
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSupabase || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const db = getServiceClient()
  const { data: securities } = await db.from('securities').select('ticker')
  if (!securities?.length) return NextResponse.json({ ok: true, snaps: 0 })

  const today = new Date().toISOString().split('T')[0]
  const inserts: Array<{ ticker: string; price: number; captured_at: string }> = []

  for (const { ticker } of securities) {
    const bars = await getBars(ticker, 3)
    const bar = bars.find(b => b.date === today) ?? bars[bars.length - 1]
    if (bar) inserts.push({ ticker, price: bar.close, captured_at: new Date().toISOString() })
  }

  if (inserts.length > 0) {
    const { error } = await db.from('price_snapshots').insert(inserts)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, snaps: inserts.length, date: today })
}
