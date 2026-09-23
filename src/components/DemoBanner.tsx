export function DemoBanner() {
  return (
    <div role="status" className="text-center px-4 py-1.5 text-xs" style={{ color: 'var(--caution)', borderBottom: '0.5px solid var(--border)', background: 'var(--hover)' }}>
      Demo prices. Add a Finnhub or Alpaca key for live quotes.
    </div>
  )
}
