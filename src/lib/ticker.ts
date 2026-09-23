// Tickers go into third-party API paths, so only allow symbol characters.
const TICKER_RE = /^[A-Z0-9][A-Z0-9.\-]{0,9}$/

export function cleanTicker(raw: string | null | undefined): string | null {
  const t = (raw ?? '').trim().toUpperCase()
  return TICKER_RE.test(t) ? t : null
}
