import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"
import { PackWeights } from "./PackWeights"

type Weights = {
  worn: number
  consumable: number
  total: number
}

export const WeightBreakdown = () => {
  const { packs } = useTripPacks((store) => ({ packs: store.packs }), shallow)

  const breakdowns = packs.map(({ items, title }) => {
    const weightCategories = items.reduce(
      (acc, { item, quantity, worn }) => {
        const weight = !item.weight
          ? 0
          : (item.unit === "g" ? item.weight / 1000 : item.weight) * quantity

        return {
          worn: worn ? acc.worn + weight : acc.worn,
          consumable: item.consumable
            ? acc.consumable + weight
            : acc.consumable,
          total: acc.total + weight,
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
      <h3>Weight Breakdown</h3>
      <PackWeights title="Totals" weights={totals} />
      {packs.length > 1 &&
        breakdowns.map(({ title, weights }) => (
          <PackWeights key={title} title={title} weights={weights} />
        ))}
    </div>
  )
}
