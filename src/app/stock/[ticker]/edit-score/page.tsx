import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SEED_SCORES } from '@/lib/seed'
import { cleanTicker } from '@/lib/ticker'
import { formMetadata } from '@/lib/noindex'
import { ScoreEditorClient } from './ScoreEditorClient'

export function generateMetadata({ params }: { params: { ticker: string } }) {
  return formMetadata(`Edit scores: ${params.ticker.toUpperCase()}`)
}

export default async function EditScorePage({ params }: { params: { ticker: string } }) {
  const ticker = cleanTicker(params.ticker)
  if (!ticker) notFound()
  const { data: score } = await supabase.from('scores').select('*').eq('ticker', ticker).maybeSingle()
  return <ScoreEditorClient ticker={ticker} initialScore={score ?? SEED_SCORES[ticker] ?? null} />
}
