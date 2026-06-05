-- Seed securities
insert into securities (ticker, name, theme, sector, source, date_added) values
  ('GOOGL', 'Alphabet Inc.', 'Search, cloud, Gemini', 'Communication Services', 'own screen', '2024-01-15'),
  ('V', 'Visa Inc.', 'Global payments', 'Financials', 'own screen', '2024-01-15'),
  ('META', 'Meta Platforms Inc.', 'Social and ads', 'Communication Services', 'own screen', '2024-01-15'),
  ('AMZN', 'Amazon.com Inc.', 'AWS, retail, ads', 'Consumer Discretionary', 'own screen', '2024-01-15'),
  ('TSM', 'Taiwan Semiconductor', 'Chip foundry', 'Information Technology', 'own screen', '2024-02-01'),
  ('MSFT', 'Microsoft Corp.', 'Azure, Copilot', 'Information Technology', 'own screen', '2024-02-01'),
  ('ASML', 'ASML Holding N.V.', 'EUV lithography', 'Information Technology', 'own screen', '2024-02-15'),
  ('AVGO', 'Broadcom Inc.', 'Custom AI chips', 'Information Technology', 'own screen', '2024-03-01'),
  ('LRCX', 'Lam Research Corp.', 'Chip equipment', 'Information Technology', 'own screen', '2024-03-01'),
  ('ANET', 'Arista Networks Inc.', 'AI networking', 'Information Technology', 'own screen', '2024-03-15')
on conflict (ticker) do nothing;

-- Seed scores
insert into scores (ticker, moat, valuation, catalyst, falsifiability, edge, diversification, downside) values
  ('GOOGL', 5, 4, 4, 5, 3, 3, 4),
  ('V', 5, 3, 3, 5, 2, 5, 4),
  ('META', 5, 4, 4, 5, 3, 2, 3),
  ('AMZN', 5, 4, 4, 4, 3, 3, 3),
  ('TSM', 5, 4, 4, 4, 3, 3, 2),
  ('MSFT', 5, 3, 4, 5, 2, 3, 3),
  ('ASML', 5, 2, 4, 4, 3, 3, 2),
  ('AVGO', 5, 2, 5, 4, 2, 2, 2),
  ('LRCX', 4, 2, 4, 4, 4, 2, 2),
  ('ANET', 4, 2, 4, 4, 2, 2, 2)
on conflict (ticker) do nothing;

-- Seed theses
insert into theses (ticker, game_type, why, watch, bail, take, falsifiability_note) values
  ('GOOGL', 'growth', 'Dominant search moat with Gemini integration could accelerate ad-attach in AI queries. Cloud segment growing 28%+ with improving margins.', 'Search query volume trends; Gemini integration adoption rate; Cloud revenue growth vs AWS/Azure.', 'Search share drops below 85% for two consecutive quarters; generative AI fully disintermediates Google search ads.', 'Fair value in the $185–$210 range on 22–24x forward earnings with a re-rate catalyst.', 'to fill in'),
  ('V', 'value', 'Visa is a toll booth on global commerce. Cross-border volume recovery post-COVID is durable, and payment volume growth tracks global GDP plus several points.', 'Cross-border transaction volumes; competitive pressure from real-time payment rails like FedNow.', 'Real-time payment adoption in the US materially erodes card volumes; regulatory cap on interchange.', 'Steady compounder; trim if it exceeds 30x forward earnings without acceleration.', 'to fill in'),
  ('META', 'growth', 'Ad targeting moat rebuilt after ATT hit. Reels monetization still catching up to Feed. Llama-driven AI advantage in ad ranking is defensible.', 'Reels monetization gap vs Feed; ad ROAS trends; daily active user growth in Rest of World.', 'Ad revenue growth drops below 10% for two consecutive quarters; regulatory breakup of Instagram.', 'Target 20–22x forward FCF; sizing up on any pullback below $450.', 'to fill in'),
  ('AMZN', 'growth', 'AWS margin expansion story plus advertising is underappreciated. Retail segment is becoming a high-margin logistics and ads business.', 'AWS revenue acceleration; advertising revenue mix shift; North America operating margin trend.', 'AWS loses meaningful share in a single quarter to Azure or GCP; retail margins compress back below 2%.', 'Patience play; fair value on 35x normalized FCF if AWS margins reach 35%.', 'to fill in'),
  ('TSM', 'thematic', 'Only foundry capable of 3nm and below. Every AI accelerator runs through TSMC. Geopolitical risk is real but priced in.', 'Leading-edge node utilization; CoWoS advanced packaging capacity; Taiwan geopolitical signals.', 'Customer defection to Intel Foundry at scale; force majeure event in Taiwan.', 'Long-term hold; trim if it exceeds 25x forward earnings or CoWoS capacity is structurally constrained.', 'to fill in'),
  ('MSFT', 'growth', 'Copilot monetization attached to 400M Office seats is an annuity. Azure OpenAI exclusivity is a durable near-term moat.', 'Copilot seat attach and usage rates; Azure growth reacceleration above 30%; GitHub Copilot churn.', 'Copilot fails to reach 20% paid attach rate by end of 2025; Azure share flatlines for two quarters.', 'Quality compounder; only add below 30x forward earnings.', 'to fill in'),
  ('ASML', 'thematic', 'Monopoly on EUV and upcoming High-NA EUV. Every cutting-edge chip fab must buy from ASML. Long replacement cycle creates durable backlog.', 'Backlog conversion rate; China export license headwinds; DRAM capex recovery.', 'High-NA adoption delayed by more than 2 years; major customer cancellations reducing backlog below €30B.', 'Buy at 25x forward earnings on any cyclical downturn; long-term hold.', 'to fill in'),
  ('AVGO', 'thematic', 'Custom ASIC business (XPU) for hyperscalers is growing faster than Nvidia. VMware integration is accretive and underappreciated.', 'Custom silicon TAM commentary from management; VMware cross-sell progress; hyperscaler XPU orders.', 'Two major hyperscaler customers walk away from custom ASIC program; VMware churn exceeds 20%.', 'Value on 20x forward EBITDA; trim above 25x.', 'to fill in'),
  ('LRCX', 'thematic', 'Leading etch and deposition equipment. Gate-all-around transition requires more Lam steps per wafer. Under-owned vs AMAT.', 'Gate-all-around node ramp at TSMC and Samsung; etch-step intensity per node; China revenue concentration.', 'GAA ramp delayed or Lam loses share in deposition to AMAT; China revenue declines more than 30%.', 'Cyclical; buy at 18x forward earnings in downturn, trim at 22x.', 'to fill in'),
  ('ANET', 'thematic', 'AI back-end networking spend is inflecting. Arista owns the hyperscaler Ethernet switching market and is taking share from Cisco.', 'AI/ML product revenue mix; hyperscaler capex budgets for networking; win rate vs Cisco Nexus.', 'Nvidia InfiniBand maintains dominance for AI clusters and Ethernet fails to gain traction; Cisco wins back a major hyperscaler.', 'Fair value at 35x forward earnings; currently at the top of my range.', 'to fill in')
on conflict (ticker) do nothing;
