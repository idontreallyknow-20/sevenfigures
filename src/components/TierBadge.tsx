import type { Tier } from '@/lib/types'

const styles: Record<Tier, string> = {
  Core: 'tier-core',
  Buyable: 'tier-buyable',
  Watch: 'tier-watch',
  Pass: 'tier-pass',
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-2xs font-mono uppercase tracking-wider ${styles[tier]}`}
      style={{ border: '0.5px solid currentColor', borderRadius: 2 }}
    >
      {tier}
    </span>
  )
}
