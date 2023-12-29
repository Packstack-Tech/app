import { useMemo } from 'react'
import Fuse from 'fuse.js'

import { useInventory } from '@/queries/item'
import { CategorizedItems, CategoryItems } from '@/types/category'

type Options = {
  filter?: string
  uncategorizedToBottom?: boolean
}

export const useCategorizedItems = ({
  filter,
  uncategorizedToBottom,
}: Options): CategoryItems[] => {
  const { data } = useInventory()
  const uncategorizedPosition = uncategorizedToBottom ? Infinity : 0

  const fuseItems = useMemo(
    () =>
      new Fuse(data || [], {
        keys: ['name', 'product.name', 'brand.name'],
      }),
    [data]
  )

  const categorizedItems = useMemo(() => {
    const items = !filter
      ? data
      : fuseItems.search(filter).map(result => result.item)
    return (items || []).reduce<CategorizedItems>((acc, curr) => {
      const catId = curr.category_id?.toString() || 'uncategorized'
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
    }, {} as CategorizedItems)
  }, [data, fuseItems, filter])

  const sorted = useMemo(
    () =>
      Object.entries(categorizedItems)
        .map(([, values]) => {
          values.items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          return values
        })
        .sort((a, b) => {
          if (!a.category) return -1
          return (
            a.category.sort_order -
            (b.category?.sort_order || uncategorizedPosition)
          )
        }),
    [categorizedItems, uncategorizedPosition]
  )

  return sorted
}
