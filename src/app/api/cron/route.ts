import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { getBars } from '@/lib/alpaca'

// Called daily by Vercel Cron (see vercel.json).
// Captures today's closing price for every security in the watchlist.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  const { data: securities } = await db.from('securities').select('ticker')
  if (!securities?.length) return NextResponse.json({ ok: true, snaps: 0 })

  const today = new Date().toISOString().split('T')[0]
  const inserts: Array<{ ticker: string; price: number; captured_at: string }> = []

  for (const { ticker } of securities) {
    try {
      const bars = await getBars(ticker, 3)
      const bar = bars.find(b => b.date === today) ?? bars[bars.length - 1]
      if (bar) {
        inserts.push({ ticker, price: bar.close, captured_at: new Date().toISOString() })
      }
    } catch {}
  }

  if (inserts.length > 0) {
    await db.from('price_snapshots').insert(inserts)
  }

  return NextResponse.json({ ok: true, snaps: inserts.length, date: today })
}
