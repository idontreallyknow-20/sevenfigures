'use client'
import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface Props {
  data: { date: string; close: number }[]
  ticker: string
}

type Range = '1W' | '1M' | '3M' | '6M' | 'ALL'
const CUT: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, ALL: 9999 }

function TooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-2 py-1.5 text-xs font-mono"
      style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}
    >
      <div style={{ color: 'var(--ink-muted)' }}>{payload[0].payload.date}</div>
      <div className="font-medium">${payload[0].value.toFixed(2)}</div>
    </div>
  )
}

export function PriceChart({ data, ticker }: Props) {
  const [range, setRange] = useState<Range>('1M')
  const filtered = data.slice(-CUT[range])

  if (filtered.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs" style={{ color: 'var(--ink-faint)' }}>
        no price data
      </div>
    )
  }

  const first = filtered[0].close
  const last = filtered[filtered.length - 1].close
  const positive = last >= first
  const color = positive ? '#1a5c35' : '#7a1a1a'
  const values = filtered.map(d => d.close)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const pad = (maxVal - minVal) * 0.08 || 1
  const changePct = ((last - first) / first) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs" style={{ color: positive ? '#1a5c35' : '#7a1a1a' }}>
            {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
          </span>
          <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>
            {filtered.length} trading days
          </span>
        </div>
        <div className="flex gap-1">
          {(['1W', '1M', '3M', '6M', 'ALL'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2 py-0.5 text-2xs font-mono transition-colors"
              style={{
                background: range === r ? 'var(--accent)' : 'transparent',
                color: range === r ? 'white' : 'var(--ink-muted)',
                border: `0.5px solid ${range === r ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.16} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={d => d.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minVal - pad, maxVal + pad]}
            tick={{ fontSize: 9, fill: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${Number(v).toFixed(0)}`}
            width={48}
          />
          <Tooltip content={<TooltipContent />} />
          <ReferenceLine y={first} stroke="var(--ink-faint)" strokeDasharray="2 3" strokeWidth={0.75} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${ticker})`}
            dot={false}
            activeDot={{ r: 3, stroke: color, strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
