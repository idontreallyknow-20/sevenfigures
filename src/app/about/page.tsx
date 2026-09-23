import type { Metadata } from 'next'
import Link from 'next/link'
import { AUTHOR, pageMetadata } from '@/lib/site'

const title = 'About sevenfigures | Joseph Leung’s stock research tracker'
const description =
  'How sevenfigures scores stocks on seven dimensions, and who built it: Joseph Leung, a student founder and retired national-level chess player from Richmond Hill, Ontario.'

export const metadata: Metadata = pageMetadata({ title, description, path: '/about', absoluteTitle: true })

const DIMENSIONS = [
  ['Moat', 'A durable advantage that protects profits.'],
  ['Valuation', 'Cheap or expensive relative to peers. 5 is cheap.'],
  ['Catalyst', 'Clear events in the next year or two that could re-rate the stock.'],
  ['Falsifiability', 'A specific, checkable signal that would prove the thesis wrong.'],
  ['Edge', 'Something the market seems to be missing.'],
  ['Diversification', 'Low correlation with everything else already owned.'],
  ['Downside', 'How much is lost if the thesis is wrong. 5 is limited downside.'],
]

const TIERS = [
  ['Core', '26 and up', 'High conviction. Worth sizing up.'],
  ['Buyable', '21 to 25', 'Good risk and reward.'],
  ['Watch', '17 to 20', 'Interesting, not ready.'],
  ['Pass', '16 or less', 'Not there yet.'],
]

const H2 = 'font-serif text-xl font-light mb-3'
const P = 'font-serif text-base leading-relaxed'

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-light mb-4">About sevenfigures</h1>
      <p className={`${P} mb-10`} style={{ color: 'var(--ink)' }}>
        sevenfigures is a stock research tracker. Every name on the watchlist gets a score out of 35, a written
        thesis, and entries in a decision journal, so the reasoning behind each buy or sell can be checked later
        instead of rewritten from memory.
      </p>

      <section aria-labelledby="scoring" className="mb-10">
        <h2 id="scoring" className={H2}>How scoring works</h2>
        <p className={`${P} mb-4`} style={{ color: 'var(--ink-muted)' }}>
          Each stock is rated 1 to 5 on seven dimensions, where 5 is always the favourable end.
        </p>
        <dl className="text-sm" style={{ borderTop: '0.5px solid var(--border)' }}>
          {DIMENSIONS.map(([name, desc]) => (
            <div key={name} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2" style={{ borderBottom: '0.5px solid var(--border)' }}>
              <dt className="font-mono text-xs pt-0.5">{name}</dt>
              <dd className="font-serif" style={{ color: 'var(--ink-muted)' }}>{desc}</dd>
            </div>
          ))}
        </dl>
        <p className={`${P} mt-6 mb-3`} style={{ color: 'var(--ink-muted)' }}>The total sets the tier:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)', color: 'var(--ink-faint)' }}>
                <th className="text-left py-2 pr-3 font-mono text-2xs uppercase tracking-wider">Tier</th>
                <th className="text-left py-2 pr-3 font-mono text-2xs uppercase tracking-wider">Score</th>
                <th className="text-left py-2 font-mono text-2xs uppercase tracking-wider">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map(([tier, range, meaning]) => (
                <tr key={tier} style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <td className={`py-2 pr-3 font-mono text-xs tier-${tier.toLowerCase()}`}>{tier}</td>
                  <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap">{range}</td>
                  <td className="py-2 font-serif" style={{ color: 'var(--ink-muted)' }}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="features" className="mb-10">
        <h2 id="features" className={H2}>What&apos;s inside</h2>
        <ul className="font-serif text-base leading-relaxed space-y-2" style={{ color: 'var(--ink-muted)' }}>
          <li><Link href="/" className="link">Watchlist</Link>: every name with live prices, a 30-day sparkline, score and tier.</li>
          <li><strong className="font-medium" style={{ color: 'var(--ink)' }}>Stock pages</strong>: price chart, key metrics, conviction score, quality radar, thesis and risks.</li>
          <li><Link href="/portfolio" className="link">Portfolio</Link>: open positions with P&amp;L, weights and allocation by theme.</li>
          <li><Link href="/journal" className="link">Journal</Link>: every buy, sell and hold, with conviction and the reasoning at the time.</li>
          <li><Link href="/compare" className="link">Compare</Link>: up to four stocks overlaid on one radar chart.</li>
        </ul>
      </section>

      <section aria-labelledby="builder" className="mb-10">
        <h2 id="builder" className={H2}>Who built it</h2>
        <p className={`${P} mb-4`} style={{ color: 'var(--ink)' }}>
          sevenfigures was built by <a href={AUTHOR.hub} rel="author" className="link">Joseph Leung</a> (full
          name Joseph Wah Sing Leung), a Grade 11 student in Richmond Hill, Ontario. He&apos;s a retired
          national-level chess player, writes the <a href={AUTHOR.dailyBrief} className="link">Daily Brief HQ</a> newsletter
          on economics and AI, and made <a href={AUTHOR.nerfchess} className="link">NerfChess</a>, a free browser
          chess variant.
        </p>
        <p className={P} style={{ color: 'var(--ink-muted)' }}>
          He&apos;s aiming for Rotman Commerce at the University of Toronto, then building startups. This tracker is
          how he learns to think about businesses the way an investor would. More of his projects are on{' '}
          <a href={AUTHOR.hub} className="link">his website</a> and <a href={AUTHOR.github} className="link">GitHub</a>.
        </p>
      </section>

      <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
        Scores and notes here are personal opinions, not investment advice. Prices can be delayed or simulated.
      </p>
    </main>
  )
}
