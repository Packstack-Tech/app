import { useShallow } from 'zustand/react/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { calculateWeightBreakdown, WeightBreakdown as Breakdown } from '@/lib/weight'

import { PackWeights } from './PackWeights'

export const WeightBreakdown = () => {
  const user = useUser()
  const { packs } = useTripPacks(useShallow(store => ({ packs: store.packs })))

  const breakdowns = packs.map(({ items, title }) => ({
    title,
    weights: calculateWeightBreakdown(items, user.conversion_unit),
  }))

  const totals = breakdowns.reduce<Breakdown>(
    (acc, { weights }) => ({
      worn: acc.worn + weights.worn,
      consumable: acc.consumable + weights.consumable,
      total: acc.total + weights.total,
      base: acc.base + weights.base,
    }),
    { worn: 0, consumable: 0, total: 0, base: 0 }
  )

  return (
    <div className="w-1/2 md:w-full md:mt-4">
      <div className="text-sm font-semibold mb-4">Pack Weights</div>
      <PackWeights
        title="Total"
        weights={totals}
        aggregateWeightUnit={user.conversion_unit}
      />
      {packs.length > 1 &&
        breakdowns.map(({ title, weights }) => (
          <PackWeights
            key={title}
            title={title}
            weights={weights}
            aggregateWeightUnit={user.conversion_unit}
          />
        ))}
    </div>
  )
}
