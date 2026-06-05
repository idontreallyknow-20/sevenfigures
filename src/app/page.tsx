import { supabase } from '@/lib/supabase'
import { computeTotal, computeTier, type Security, type Score } from '@/lib/types'
import { WatchlistClient } from './WatchlistClient'

async function getData() {
  const [secRes, scoreRes] = await Promise.all([
    supabase.from('securities').select('*'),
    supabase.from('scores').select('*'),
  ])
  return {
    securities: (secRes.data ?? []) as Security[],
    scores: (scoreRes.data ?? []) as Score[],
  }
}

export default async function HomePage() {
  const { securities, scores } = await getData()
  const scoreMap = Object.fromEntries(scores.map(s => [s.ticker, s]))
  const rows = securities.map(sec => {
    const score = scoreMap[sec.ticker]
    const total = score ? computeTotal(score) : 0
    const tier = computeTier(total)
    return { ...sec, score, total, tier }
  })
  return <WatchlistClient rows={rows} />
}
