# sevenfigures

A stock research and portfolio tracker. Every name on the watchlist gets a score out of 35 across seven dimensions, a written thesis, and entries in a decision journal.

**Live:** https://myportfolio-pi-sandy-73.vercel.app

| Page | What's there |
|------|--------------|
| Watchlist | Every stock with live price, 30-day sparkline, score and tier |
| Stock page | Price chart (1M to 5Y), key metrics, conviction score, quality radar, thesis and risks |
| Portfolio | Open positions with P&L, weights and allocation |
| Journal | Every buy, sell and hold, with conviction and reasoning |
| Compare | Up to four stocks on one radar chart |

## Run it

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

With no env vars it runs in demo mode: a seed watchlist, simulated prices, and saving turned off.

To make it real:

1. **Supabase:** create a project, run the files in `supabase/migrations/` in the SQL editor (in order), then copy the URL, anon key and service role key into `.env.local`.
2. **Market data:** add a free `FINNHUB_KEY` (quotes, profiles, metrics) and/or Alpaca keys (price history).
3. **Daily snapshots:** set `CRON_SECRET`. `vercel.json` calls `/api/cron` every weekday at 22:00 UTC.

On Vercel, add the same variables under Project Settings, then redeploy.

> The app has no login. Anyone with the URL can see and edit what's in the database, so keep the URL private or add auth and row-level security before storing anything sensitive.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind, Supabase, Recharts, Finnhub and Alpaca.

## Scoring

Seven dimensions scored 1 to 5 (5 is always favourable): moat, valuation, catalyst, falsifiability, edge, diversification, downside. Core is 26+, Buyable 21 to 25, Watch 17 to 20, Pass 16 or less.

---

Built by [Joseph Leung](https://josephleung-site.vercel.app).
