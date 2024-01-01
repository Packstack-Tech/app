import { shallow } from 'zustand/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { convertWeight } from '@/lib/weight'

import { PackWeights } from './PackWeights'

type Weights = {
  worn: number
  consumable: number
  total: number
}

export const WeightBreakdown = () => {
  const user = useUser()
  const { packs } = useTripPacks(store => ({ packs: store.packs }), shallow)

  const breakdowns = packs.map(({ items, title }) => {
    const weightCategories = items.reduce(
      (acc, { item, quantity, worn }) => {
        const weight = convertWeight(
          item.weight || 0,
          item.unit,
          user.conversion_unit
        )
        const quantityWeight = weight.weight * quantity

        return {
          worn: worn ? acc.worn + weight.weight : acc.worn,
          consumable: item.consumable
            ? acc.consumable + quantityWeight
            : acc.consumable,
          total: acc.total + quantityWeight,
        }
      },
      { worn: 0, consumable: 0, total: 0 } as Weights
    )

    const weights = {
      ...weightCategories,
      base:
        weightCategories.total -
        (weightCategories.worn + weightCategories.consumable),
    }

    return {
      title,
      weights,
    }
  })

  const totals = breakdowns.reduce(
    (acc, { weights }) => ({
      worn: acc.worn + weights.worn,
      consumable: acc.consumable + weights.consumable,
      total: acc.total + weights.total,
      base: acc.base + weights.base,
    }),
    { worn: 0, consumable: 0, total: 0, base: 0 }
  )

  return (
    <div className="mt-4">
      <h3 className="mb-2">Pack Weights</h3>
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
