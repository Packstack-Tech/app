import { useMemo } from "react"
import { convertWeight } from "@/lib/weight"
import { CategoryPackItems, CategoryWeight } from "@/types/category"
import { useUser } from "./useUser"

export const useCategorizedWeights = (data: CategoryPackItems[]) => {
  const user = useUser()
  return useMemo(
    (): CategoryWeight[] =>
      data.map((category) => {
        const weight = category.items.reduce((acc, curr) => {
          const itemWeight = convertWeight(
            curr.item.weight || 0,
            curr.item.unit,
            user.conversion_unit
          )
          return acc + itemWeight.weight * curr.quantity
        }, 0)
        return {
          label: category.category?.category.name || "Uncategorized",
          value: weight,
          unit: user.conversion_unit,
        }
      }),
    [data, user.conversion_unit]
  )
}
