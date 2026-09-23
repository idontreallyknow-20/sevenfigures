export interface Security {
  ticker: string
  name: string
  theme: string | null
  sector: string | null
  source: string | null
  date_added: string
}

export interface Score {
  ticker: string
  moat: number
  valuation: number
  catalyst: number
  falsifiability: number
  edge: number
  diversification: number
  downside: number
  updated_at: string
}

// 4-component quality breakdown shown on the individual stock page (1-5 each).
export interface QualityScore {
  ticker: string
  valuation: number
  growth: number
  moat: number
  momentum: number
  updated_at: string
}

export const QUALITY_DIMS = ['valuation', 'growth', 'moat', 'momentum'] as const
export type QualityDim = (typeof QUALITY_DIMS)[number]

export interface Thesis {
  ticker: string
  game_type: 'value' | 'growth' | 'thematic'
  why: string | null
  watch: string | null
  bail: string | null
  take: string | null
  falsifiability_note: string | null
  thesis_text: string | null
  risks: string | null
  updated_at: string
}

export interface Holding {
  id: string
  ticker: string
  shares: number
  avg_cost: number
  date_opened: string
  target_weight: number | null
  is_open: boolean
}

export interface JournalEntry {
  id: string
  ticker: string | null
  action: 'buy' | 'sell' | 'add' | 'trim' | 'hold' | 'note'
  conviction: number | null
  reasoning: string | null
  expectation: string | null
  created_at: string
}

export interface PriceSnapshot {
  id: string
  ticker: string
  price: number
  captured_at: string
}

export interface Benchmark {
  id: string
  symbol: string
  close: number
  date: string
}

export type Tier = 'Core' | 'Buyable' | 'Watch' | 'Pass'

export function computeTotal(score: Omit<Score, 'ticker' | 'updated_at'>): number {
  return score.moat + score.valuation + score.catalyst + score.falsifiability + score.edge + score.diversification + score.downside
}

export function computeTier(total: number): Tier {
  if (total >= 26) return 'Core'
  if (total >= 21) return 'Buyable'
  if (total >= 17) return 'Watch'
  return 'Pass'
}

export interface QuoteData {
  ticker: string
  price: number
  change: number
  changePercent: number
  isDemo?: boolean
}
