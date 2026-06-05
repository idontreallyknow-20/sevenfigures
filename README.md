# sevenfigures

Personal stock research and portfolio tracker. For your eyes only — no sharing, no logins.

---

## What it does

| Page | What's there |
|------|--------------|
| **Watchlist** (home) | All your stocks with live prices, score, and tier |
| **Stock detail** | Price chart (1W–ALL), 7-dimension score, investment thesis, quick actions |
| **Portfolio** | Holdings table with live P&L, total value, allocation by theme |
| **Journal** | Decision log — every buy, sell, and note with conviction + reasoning |
| **Compare** | Radar-chart overlay of up to 4 stocks side by side |

**Data**: Alpaca Market Data API — ~15 minute delayed quotes on the free tier, refreshing every 60 seconds. Works without Alpaca keys (shows demo prices with a banner).

---

## Local setup (5 minutes)

### 1. Clone & install

```bash
git clone https://github.com/idontreallyknow-20/sevenfigures.git
cd sevenfigures
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Open the **SQL Editor** and paste + run each file:
   - `supabase/migrations/001_schema.sql` — creates all tables
   - `supabase/migrations/002_seed.sql` — optional example data
3. In **Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set up Alpaca (for real prices)

1. Sign up at [alpaca.markets](https://alpaca.markets) — free tier is fine
2. Go to **Paper Trading → API Keys** and create a key
3. Copy key ID → `ALPACA_API_KEY` and secret → `ALPACA_API_SECRET`

> **Without Alpaca**: the app runs in demo mode with random mock prices. All other features work normally.

### 4. Create your env file

```bash
cp .env.example .env.local
# fill in the values from steps 2 & 3
```

### 5. Run it

```bash
npm run dev
# open http://localhost:3000
```

---

## Adding your portfolio

You can enter everything through the UI — no code needed:

| What | Where |
|------|-------|
| Add a stock to your watchlist | **Watchlist → + add security** |
| Score a stock (1–5 on 7 dimensions) | **Stock detail → + add scores** |
| Write an investment thesis | **Stock detail → + write thesis** |
| Add a holding to your portfolio | **Portfolio → + add holding** or **Stock detail → + add to portfolio** |
| Log a buy/sell/note | **Journal → + new entry** or **Stock detail → + log a decision** |
| Close a position | **Portfolio → close** (next to any holding) |

---

## Deploy to Vercel (free)

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `sevenfigures`
3. Add **all env variables** from `.env.example` in the Vercel project settings
4. Hit **Deploy** — zero config needed

**Daily price snapshots**: `vercel.json` includes a cron job that runs every weekday at 10 PM UTC to save closing prices. Set `CRON_SECRET` to a random string in both your `.env.local` and Vercel env vars.

---

## Scoring framework

7 dimensions, each scored 1–5 (5 = favorable). Total out of 35.

| Tier | Score | Meaning |
|------|-------|---------|
| Core | 26+ | High conviction — size up |
| Buyable | 21–25 | Good risk/reward |
| Watch | 17–20 | Interesting but not ready |
| Pass | ≤16 | Not there yet |

---

## Architecture

- **Next.js 14** (App Router) — TypeScript
- **Supabase** (Postgres) — all data lives here
- **Alpaca Market Data** — server-side only, never exposes keys to browser
- **Recharts** — price chart + radar
- **Tailwind CSS** — utility classes + CSS variables for dark/light mode

---

*This is a personal tool. No auth, no sharing — just a clean place to track your thinking.*
