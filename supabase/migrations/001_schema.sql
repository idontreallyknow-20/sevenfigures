-- Securities table
create table if not exists securities (
  ticker text primary key,
  name text not null,
  theme text,
  sector text,
  source text default 'own screen',
  date_added date not null default current_date
);

-- Scores table
create table if not exists scores (
  ticker text primary key references securities(ticker) on delete cascade,
  moat smallint not null default 3 check (moat between 1 and 5),
  valuation smallint not null default 3 check (valuation between 1 and 5),
  catalyst smallint not null default 3 check (catalyst between 1 and 5),
  falsifiability smallint not null default 3 check (falsifiability between 1 and 5),
  edge smallint not null default 3 check (edge between 1 and 5),
  diversification smallint not null default 3 check (diversification between 1 and 5),
  downside smallint not null default 3 check (downside between 1 and 5),
  updated_at timestamptz not null default now()
);

-- Theses table
create table if not exists theses (
  ticker text primary key references securities(ticker) on delete cascade,
  game_type text not null default 'growth' check (game_type in ('value', 'growth', 'thematic')),
  why text,
  watch text,
  bail text,
  take text,
  falsifiability_note text,
  updated_at timestamptz not null default now()
);

-- Holdings table
create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  ticker text not null references securities(ticker) on delete cascade,
  shares numeric not null,
  avg_cost numeric not null,
  date_opened date not null default current_date,
  target_weight numeric,
  is_open boolean not null default true
);

-- Journal table
create table if not exists journal (
  id uuid primary key default gen_random_uuid(),
  ticker text references securities(ticker) on delete set null,
  action text not null check (action in ('buy', 'sell', 'add', 'trim', 'hold', 'note')),
  conviction smallint check (conviction between 1 and 5),
  reasoning text,
  expectation text,
  created_at timestamptz not null default now()
);

-- Price snapshots table
create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  ticker text not null references securities(ticker) on delete cascade,
  price numeric not null,
  captured_at timestamptz not null default now()
);

-- Benchmarks table
create table if not exists benchmarks (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  close numeric not null,
  date date not null,
  unique(symbol, date)
);
