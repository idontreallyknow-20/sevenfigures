'use client'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import type { Score } from '@/lib/types'

const DIMS = ['moat', 'valuation', 'catalyst', 'falsifiability', 'edge', 'diversification', 'downside'] as const
const LABELS: Record<string, string> = {
  moat: 'Moat', valuation: 'Val', catalyst: 'Cat',
  falsifiability: 'Fals', edge: 'Edge', diversification: 'Div', downside: 'Down',
}

interface Props {
  scores: Array<{ ticker: string; score: Omit<Score, 'ticker' | 'updated_at'>; color?: string }>
}

export function ScoreRadar({ scores }: Props) {
  const data = DIMS.map(dim => {
    const entry: Record<string, string | number> = { dim: LABELS[dim] }
    for (const s of scores) entry[s.ticker] = s.score[dim]
    return entry
  })

  const colors = ['var(--accent)', '#4a7fb5', '#c77a1f', '#c0504d']

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }} />
        {scores.map((s, i) => (
          <Radar
            key={s.ticker}
            name={s.ticker}
            dataKey={s.ticker}
            stroke={s.color ?? colors[i % colors.length]}
            fill={s.color ?? colors[i % colors.length]}
            fillOpacity={0.12}
            strokeWidth={1.5}
          />
        ))}
        <Tooltip
          contentStyle={{ background: 'var(--bg)', color: 'var(--ink)', border: '0.5px solid var(--border)', borderRadius: 2, fontSize: 11, fontFamily: 'var(--font-mono)' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
