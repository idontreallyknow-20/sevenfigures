import { supabase } from './supabase'
import { SEED_SECURITIES, SEED_SCORES } from './seed'
import type { Security, Score } from './types'

// Watchlist securities + scores. Falls back to the seed list when the database
// has no rows yet (or isn't connected) so the app never looks empty.
export async function getWatchlist(): Promise<{ securities: Security[]; scores: Score[] }> {
  const [secRes, scoreRes] = await Promise.all([
    supabase.from('securities').select('*'),
    supabase.from('scores').select('*'),
  ])
  const securities = (secRes.data ?? []) as Security[]
  if (securities.length === 0) {
    return { securities: SEED_SECURITIES, scores: Object.values(SEED_SCORES) }
  }
  return { securities, scores: (scoreRes.data ?? []) as Score[] }
}
