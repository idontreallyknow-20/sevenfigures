-- Quality breakdown shown on the individual stock page (1-5 each).
create table if not exists quality_scores (
  ticker text primary key references securities(ticker) on delete cascade,
  valuation smallint not null default 3 check (valuation between 1 and 5),
  growth smallint not null default 3 check (growth between 1 and 5),
  moat smallint not null default 3 check (moat between 1 and 5),
  momentum smallint not null default 3 check (momentum between 1 and 5),
  updated_at timestamptz not null default now()
);

-- Free-text thesis + risks edited inline on the stock page.
alter table theses add column if not exists thesis_text text;
alter table theses add column if not exists risks text;

-- Seed the watchlist so the site never looks empty.
insert into securities (ticker, name, theme, sector, source, date_added) values
  ('NVDA', 'NVIDIA Corporation',      'AI compute',         'Information Technology', 'seed', current_date),
  ('MSFT', 'Microsoft Corporation',   'Cloud & AI',         'Information Technology', 'seed', current_date),
  ('AMD',  'Advanced Micro Devices',  'AI compute',         'Information Technology', 'seed', current_date),
  ('COST', 'Costco Wholesale',        'Consumer staples',   'Consumer Staples',       'seed', current_date),
  ('ASML', 'ASML Holding',            'Semicap monopoly',   'Information Technology', 'seed', current_date)
on conflict (ticker) do nothing;

insert into scores (ticker, moat, valuation, catalyst, falsifiability, edge, diversification, downside) values
  ('NVDA', 5, 2, 5, 4, 3, 2, 3),
  ('MSFT', 5, 3, 4, 4, 3, 4, 4),
  ('AMD',  3, 3, 4, 3, 3, 2, 2),
  ('COST', 4, 2, 2, 4, 2, 5, 5),
  ('ASML', 5, 3, 3, 4, 4, 3, 4)
on conflict (ticker) do nothing;

insert into quality_scores (ticker, valuation, growth, moat, momentum) values
  ('NVDA', 2, 5, 5, 5),
  ('MSFT', 3, 4, 5, 4),
  ('AMD',  3, 4, 3, 3),
  ('COST', 2, 3, 4, 4),
  ('ASML', 3, 4, 5, 3)
on conflict (ticker) do nothing;
