'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Point { date: string; value: number }

function TooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: Point }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-2 py-1.5 text-xs font-mono" style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}>
      <div style={{ color: 'var(--ink-muted)' }}>{payload[0].payload.date}</div>
      <div className="font-medium">${payload[0].value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
    </div>
  )
}

export function ValueOverTime({ data }: { data: Point[] }) {
  if (data.length < 2) {
    return <div className="h-44 flex items-center justify-center text-xs" style={{ color: 'var(--ink-faint)' }}>not enough history yet</div>
  }
  const first = data[0].value
  const last = data[data.length - 1].value
  const positive = last >= first
  const color = positive ? 'var(--positive)' : 'var(--negative)'
  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.08 || 1
  const changePct = first ? ((last - first) / first) * 100 : 0

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-mono text-xs" style={{ color }}>{changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%</span>
        <span className="text-2xs" style={{ color: 'var(--ink-faint)' }}>portfolio value · {data.length} days</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pv-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.16} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
          <YAxis domain={[min - pad, max + pad]} tick={{ fontSize: 9, fill: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`} width={44} />
          <Tooltip content={<TooltipContent />} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#pv-grad)" dot={false} activeDot={{ r: 3, stroke: color, strokeWidth: 1 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
