'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Slice { name: string; value: number }

// Earthy / muted palette — greens, blues, ochre, clay. No purple gradients.
const PALETTE = ['#1f4a3a', '#2a4a6b', '#b85c00', '#7a1a1a', '#5a7a4a', '#3a6b6b', '#9c7a2a', '#6b3a5a']

function TooltipContent({ active, payload, total }: { active?: boolean; payload?: Array<{ name: string; value: number }>; total: number }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="px-2 py-1.5 text-xs font-mono" style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', color: 'var(--ink)' }}>
      <div style={{ color: 'var(--ink-muted)' }}>{p.name}</div>
      <div className="font-medium">${p.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} · {total > 0 ? ((p.value / total) * 100).toFixed(1) : '0'}%</div>
    </div>
  )
}

export function AllocationDonut({ data }: { data: Slice[] }) {
  const slices = [...data].sort((a, b) => b.value - a.value)
  const total = slices.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 180, height: 180 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={1} stroke="var(--bg)" strokeWidth={1}>
              {slices.map((s, i) => <Cell key={s.name} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<TooltipContent total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="font-mono shrink-0" style={{ color: 'var(--ink)' }}>{s.name}</span>
            <span className="flex-1 text-right font-mono" style={{ color: 'var(--ink-muted)' }}>
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
