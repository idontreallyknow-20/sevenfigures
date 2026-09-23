import type { Security, Score, QualityScore } from './types'

// Default watchlist so the site never looks empty before Supabase is wired up
// (or before any rows are added). When the `securities` table returns no rows,
// pages fall back to these. Real data in Supabase always takes precedence.
export const SEED_SECURITIES: Security[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', theme: 'AI compute', sector: 'Information Technology', source: 'seed', date_added: '2025-01-02' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', theme: 'Cloud & AI', sector: 'Information Technology', source: 'seed', date_added: '2025-01-02' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', theme: 'AI compute', sector: 'Information Technology', source: 'seed', date_added: '2025-01-02' },
  { ticker: 'COST', name: 'Costco Wholesale', theme: 'Consumer staples', sector: 'Consumer Staples', source: 'seed', date_added: '2025-01-02' },
  { ticker: 'ASML', name: 'ASML Holding', theme: 'Semicap monopoly', sector: 'Information Technology', source: 'seed', date_added: '2025-01-02' },
]

const ts = '2025-01-02T00:00:00.000Z'

export const SEED_SCORES: Record<string, Score> = {
  NVDA: { ticker: 'NVDA', moat: 5, valuation: 2, catalyst: 5, falsifiability: 4, edge: 3, diversification: 2, downside: 3, updated_at: ts },
  MSFT: { ticker: 'MSFT', moat: 5, valuation: 3, catalyst: 4, falsifiability: 4, edge: 3, diversification: 4, downside: 4, updated_at: ts },
  AMD: { ticker: 'AMD', moat: 3, valuation: 3, catalyst: 4, falsifiability: 3, edge: 3, diversification: 2, downside: 2, updated_at: ts },
  COST: { ticker: 'COST', moat: 4, valuation: 2, catalyst: 2, falsifiability: 4, edge: 2, diversification: 5, downside: 5, updated_at: ts },
  ASML: { ticker: 'ASML', moat: 5, valuation: 3, catalyst: 3, falsifiability: 4, edge: 4, diversification: 3, downside: 4, updated_at: ts },
}

export const SEED_QUALITY: Record<string, QualityScore> = {
  NVDA: { ticker: 'NVDA', valuation: 2, growth: 5, moat: 5, momentum: 5, updated_at: ts },
  MSFT: { ticker: 'MSFT', valuation: 3, growth: 4, moat: 5, momentum: 4, updated_at: ts },
  AMD: { ticker: 'AMD', valuation: 3, growth: 4, moat: 3, momentum: 3, updated_at: ts },
  COST: { ticker: 'COST', valuation: 2, growth: 3, moat: 4, momentum: 4, updated_at: ts },
  ASML: { ticker: 'ASML', valuation: 3, growth: 4, moat: 5, momentum: 3, updated_at: ts },
}

export const SEED_TICKERS = SEED_SECURITIES.map(s => s.ticker)

export function defaultQuality(ticker: string): QualityScore {
  return SEED_QUALITY[ticker] ?? { ticker, valuation: 3, growth: 3, moat: 3, momentum: 3, updated_at: ts }
}
