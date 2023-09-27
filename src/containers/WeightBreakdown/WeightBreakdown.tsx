import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"
import { PackWeights } from "./PackWeights"
import { getAggregateUnit, convertWeight } from "@/lib/weight"

type Weights = {
  worn: number
  consumable: number
  total: number
}

export const WeightBreakdown = () => {
  const { packs } = useTripPacks((store) => ({ packs: store.packs }), shallow)

  // TODO: Use default weight unit from user settings
  const weightUnit = packs[0]?.items[0]?.item.unit || "g"
  const aggregateWeightUnit = getAggregateUnit(weightUnit)

  const breakdowns = packs.map(({ items, title }) => {
    const weightCategories = items.reduce(
      (acc, { item, quantity, worn }) => {
        const weight = convertWeight(
          item.weight || 0,
          item.unit,
          aggregateWeightUnit
        )
        const quantityWeight = weight.weight * quantity

        return {
          worn: worn ? acc.worn + quantityWeight : acc.worn,
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
      <h3 className="mb-2">Weight Breakdown</h3>
      <PackWeights
        title="Total"
        weights={totals}
        aggregateWeightUnit={aggregateWeightUnit}
      />
      {packs.length > 1 &&
        breakdowns.map(({ title, weights }) => (
          <PackWeights
            key={title}
            title={title}
            weights={weights}
            aggregateWeightUnit={aggregateWeightUnit}
          />
        ))}
    </div>
  )
}
