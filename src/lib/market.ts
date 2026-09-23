// Whether a live market data provider is configured (server-only env vars).
// Without one, every price is simulated and pages show the demo banner up front.
export const hasLiveData = !!(process.env.FINNHUB_KEY || (process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET))

// Market data is delayed anyway, so let the CDN serve it for a minute.
export const MARKET_CACHE = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
