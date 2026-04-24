import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { groupByCategory } from '@/lib/categorize'
import {
  calculateCategoryWeights,
  calculateWeightBreakdown,
  getConversionUnit,
  sumPackItemCalories,
  WeightBreakdown as Breakdown,
} from '@/lib/weight'
import { PackItem } from '@/types/pack'

import { PackWeights } from './PackWeights'

function categorizePackItems(items: PackItem[], toUnit: string) {
  const grouped = groupByCategory<PackItem>(
    items,
    item => item.item.category_id?.toString() || 'uncategorized',
    item => item.item.category,
    item => item.sort_order || 0
  )
  return calculateCategoryWeights(grouped, toUnit as never)
}

export const WeightBreakdown = () => {
  const user = useUser()
  const { packs, displayUnitSystem } = useTripPacks(
    useShallow(store => ({ packs: store.packs, displayUnitSystem: store.displayUnitSystem }))
  )
  const unit = getConversionUnit(displayUnitSystem ?? user.unit_weight)

  const breakdowns = packs.map(({ items, title }) => ({
    title,
    items,
    weights: calculateWeightBreakdown(items, unit),
    calories: sumPackItemCalories(items),
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

  const totalCalories = breakdowns.reduce(
    (acc, { calories }) => acc + calories,
    0
  )

  const allItems = useMemo(
    () => packs.flatMap(p => p.items),
    [packs]
  )
  const totalCategoryWeights = useMemo(
    () => categorizePackItems(allItems, unit),
    [allItems, unit]
  )

  const perPackCategoryWeights = useMemo(
    () => breakdowns.map(({ items }) => categorizePackItems(items, unit)),
    [breakdowns, unit]
  )

  return (
    <div>
      
      <PackWeights
        title="Total"
        weights={totals}
        calories={totalCalories}
        aggregateWeightUnit={unit}
        breakdownData={totalCategoryWeights}
      />
      {packs.length > 1 &&
        breakdowns.map(({ title, weights, calories }, index) => (
          <PackWeights
            key={title}
            title={title}
            weights={weights}
            calories={calories}
            aggregateWeightUnit={unit}
            breakdownData={perPackCategoryWeights[index]}
          />
        ))}
    </div>
  )
}
