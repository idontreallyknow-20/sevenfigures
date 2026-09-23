'use client'
import type { Metrics } from '@/lib/finnhub'

function fmtCap(v: number | null): string {
  if (v == null) return '—'
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toFixed(0)}`
}

function fmtNum(v: number | null, suffix = ''): string {
  return v == null ? '—' : `${v.toFixed(1)}${suffix}`
}

function fmtPct(v: number | null): string {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

function fmtRange(lo: number | null, hi: number | null): string {
  if (lo == null || hi == null) return '—'
  return `$${lo.toFixed(0)} – $${hi.toFixed(0)}`
}

export function MetricsRow({ metrics }: { metrics: Metrics | null }) {
  const cells = [
    { label: 'P/E (TTM)', val: fmtNum(metrics?.peTTM ?? null) },
    { label: 'Fwd P/E', val: fmtNum(metrics?.forwardPE ?? null) },
    { label: 'Rev growth', val: fmtPct(metrics?.revenueGrowth ?? null), color: metrics?.revenueGrowth != null ? (metrics.revenueGrowth >= 0 ? 'var(--positive)' : 'var(--negative)') : undefined },
    { label: 'Gross margin', val: fmtNum(metrics?.grossMargin ?? null, '%') },
    { label: 'Market cap', val: fmtCap(metrics?.marketCap ?? null) },
    { label: '52w range', val: fmtRange(metrics?.week52Low ?? null, metrics?.week52High ?? null) },
  ]
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6" style={{ border: '0.5px solid var(--border)' }}>
      {cells.map((c, i) => (
        <div
          key={c.label}
          className="p-3"
          style={{
            borderRight: i % 6 !== 5 ? '0.5px solid var(--border)' : undefined,
            borderTop: i >= 3 ? '0.5px solid var(--border)' : undefined,
          }}
        >
          <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'var(--ink-faint)' }}>{c.label}</div>
          <div className="font-mono text-sm" style={{ color: c.color ?? 'var(--ink)' }}>{c.val}</div>
        </div>
      ))}
    </div>
  )
}
