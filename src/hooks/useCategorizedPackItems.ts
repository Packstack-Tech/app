import { useMemo } from 'react'

import { CategorizedPackItems, CategoryPackItems } from '@/types/category'
import { PackItem } from '@/types/pack'

export const useCategorizedPackItems = (
  packItems: PackItem[]
): CategoryPackItems[] => {
  const categorizedItems = useMemo(
    () =>
      packItems.reduce<CategorizedPackItems>((acc, curr) => {
        const catId = curr.item.category_id?.toString() || 'uncategorized'
        if (acc[catId]) {
          return {
            ...acc,
            [catId]: { ...acc[catId], items: [...acc[catId].items, curr] },
          }
        }
        return {
          ...acc,
          [catId]: {
            category: curr.item.category,
            items: [curr],
          },
        }
      }, {} as CategorizedPackItems),
    [packItems]
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
            (a.category?.sort_order || 0) - (b.category?.sort_order || 0)
        ),
    [categorizedItems]
  )

  return sorted
}
