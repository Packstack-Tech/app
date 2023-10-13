import { useMemo } from "react"
import { convertWeight, getAggregateUnit } from "@/lib/weight"
import { CategoryPackItems, CategoryWeight } from "@/types/category"

export const useCategorizedWeights = (data: CategoryPackItems[]) => {
  return useMemo(
    (): CategoryWeight[] =>
      data.map((category) => {
        const baseUnit = category.items[0].item.unit
        const aggregateUnit = getAggregateUnit(baseUnit)
        const weight = category.items.reduce((acc, curr) => {
          const itemWeight = convertWeight(
            curr.item.weight || 0,
            curr.item.unit,
            aggregateUnit
          )
          return acc + itemWeight.weight * curr.quantity
        }, 0)
        return {
          label: category.category?.category.name || "Uncategorized",
          value: weight,
          unit: aggregateUnit,
        }
      }),
    [data]
  )
}
