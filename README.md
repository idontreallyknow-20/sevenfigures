# sevenfigures

Personal stock research and portfolio tracker. Research and tracking only — no real trades.

## Architecture

- **Next.js 14** (App Router) with TypeScript
- **Supabase** (Postgres) for all persistent data
- **Alpaca Market Data API** for quotes and historical bars (server-side only, ~15min delayed)
- **Recharts** for radar charts and sparklines
- **Tailwind CSS** with custom CSS variables for theming

## Data Model

Seven tables: `securities`, `scores`, `theses`, `holdings`, `journal`, `price_snapshots`, `benchmarks`.
See `supabase/migrations/001_schema.sql`.

## Local Development

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev
```

Run migrations in Supabase SQL editor:
1. Paste `supabase/migrations/001_schema.sql`
2. Paste `supabase/migrations/002_seed.sql`

## Environment Variables

See `.env.example`. All `ALPACA_*` and `SUPABASE_SERVICE_ROLE_KEY` are server-only.
Only `NEXT_PUBLIC_*` vars are exposed to the browser.

## Demo Mode

Without Alpaca keys the app runs with mock prices and shows a banner. No crash.

## Vercel Deploy

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.example`
4. Deploy — runs with zero config

## Scoring Framework

Seven dimensions, each 1–5 (5 = favorable to buyer). Total /35.

| Tier | Range |
|------|-------|
| Core | 26+ |
| Buyable | 21–25 |
| Watch | 17–20 |
| Pass | ≤16 |

## Design Decisions

- **Falsifiability required**: thesis editor blocks save without a falsifiability note
- **No auto-score updates**: prices refresh automatically; scores only change when you edit them
- **Server-only Alpaca**: all price fetches go through `/api/quotes` and `/api/bars`
- **60s polling**: sufficient for a research tool, respects Alpaca rate limits
