-- Sample data (all commented out — uncomment and run in Supabase SQL editor to load examples)
-- Once you have your own portfolio, add rows in the format below.

/*

-- Add a security to your watchlist
insert into securities (ticker, name, theme, sector, source, date_added) values
  ('AAPL', 'Apple Inc.', 'Consumer tech, services', 'Information Technology', 'own screen', current_date)
on conflict (ticker) do nothing;

-- Score it (1-5 on each dimension, 5 = best/favorable)
insert into scores (ticker, moat, valuation, catalyst, falsifiability, edge, diversification, downside) values
  ('AAPL', 5, 3, 3, 4, 2, 4, 4)
on conflict (ticker) do nothing;

-- Write your thesis
insert into theses (ticker, game_type, why, watch, bail, take, falsifiability_note) values
  ('AAPL', 'growth',
   'Why you like this stock...',
   'What you will watch to track the thesis...',
   'What would make you sell...',
   'Your price target or take-profit plan...',
   'The one thing that would prove you wrong...')
on conflict (ticker) do nothing;

-- Add a holding to your portfolio
insert into holdings (ticker, shares, avg_cost, date_opened, target_weight, is_open) values
  ('AAPL', 10, 178.50, current_date, 5.0, true);

-- Log a journal entry
insert into journal (ticker, action, conviction, reasoning, expectation) values
  ('AAPL', 'buy', 4, 'My reasoning for buying...', 'What I expect to happen...');

*/
