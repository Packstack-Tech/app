import { useMemo } from "react"
import { useInventory } from "@/queries/item"
import { CategoryItems, CategorizedItems } from "@/types/category"

export const useCategorizedItems = (
  uncategorizedToBottom?: boolean
): CategoryItems[] => {
  const { data } = useInventory()
  const uncategorizedPosition = uncategorizedToBottom ? Infinity : 0

  const items = useMemo(() => {
    if (!data) return []
    return data
  }, [data])

  const categorizedItems = useMemo(
    () =>
      items.reduce<CategorizedItems>((acc, curr) => {
        const catId = curr.category_id?.toString() || "uncategorized"
        if (acc[catId]) {
          return {
            ...acc,
            [catId]: { ...acc[catId], items: [...acc[catId].items, curr] },
          }
        }
        return {
          ...acc,
          [catId]: {
            category: curr.category,
            items: [curr],
          },
        }
      }, {} as CategorizedItems),
    [items]
  )

  const sorted = useMemo(
    () =>
      Object.entries(categorizedItems)
        .map(([, values]) => {
          values.items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          return values
        })
        .sort(
          (a, b) =>
            (a.category?.sort_order || uncategorizedPosition) -
            (b.category?.sort_order || uncategorizedPosition)
        ),
    [categorizedItems, uncategorizedPosition]
  )

  return sorted
}
