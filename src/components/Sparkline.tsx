interface Props {
  data: { date: string; close: number }[]
  positive?: boolean
}

// Plain SVG instead of Recharts: the watchlist renders one per row, and this keeps
// the charting library out of the home page bundle.
export function Sparkline({ data, positive = true }: Props) {
  const w = 80
  const h = 28
  const closes = data.map(d => d.close)
  const min = Math.min(...closes)
  const range = Math.max(...closes) - min || 1
  const points = closes
    .map((c, i) => `${((i / (closes.length - 1)) * w).toFixed(1)},${(h - 2 - ((c - min) / range) * (h - 4)).toFixed(1)}`)
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="block">
      <polyline points={points} fill="none" stroke={positive ? 'var(--positive)' : 'var(--negative)'} strokeWidth={1} />
    </svg>
  )
}
