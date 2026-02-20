import { useMemo } from 'react'
import Fuse from 'fuse.js'

import { groupByCategory } from '@/lib/categorize'
import { useInventory } from '@/queries/item'
import { CategoryItems } from '@/types/category'

type Options = {
  filter?: string
  showRemoved?: boolean
}

export const useCategorizedItems = ({
  filter,
  showRemoved = false,
}: Options): CategoryItems[] => {
  const { data } = useInventory()

  const fuseItems = useMemo(
    () =>
      new Fuse(data || [], {
        keys: ['name', 'product.name', 'brand.name'],
      }),
    [data]
  )

  const allCategorySortOrders = useMemo(() => {
    if (!data) return new Set<number>()
    const orders = new Set<number>()
    for (const item of data) {
      if (item.category?.sort_order != null) {
        orders.add(item.category.sort_order)
      }
    }
    return orders
  }, [data])

  return useMemo(() => {
    const items = !filter
      ? data
      : fuseItems.search(filter).map(result => result.item)

    const filteredItems = showRemoved
      ? items
      : items?.filter(item => !item.removed)

    const grouped = groupByCategory(
      filteredItems || [],
      item => item.category_id?.toString() || 'uncategorized',
      item => item.category,
      item => item.sort_order || 0
    )

    const totalCategories = allCategorySortOrders.size + 1
    let uncatPosition = totalCategories
    for (let i = 0; i < totalCategories; i++) {
      if (!allCategorySortOrders.has(i)) {
        uncatPosition = i
        break
      }
    }

    return grouped.sort((a, b) => {
      const aOrder = a.category?.sort_order ?? uncatPosition
      const bOrder = b.category?.sort_order ?? uncatPosition
      return aOrder - bOrder
    })
  }, [data, fuseItems, filter, showRemoved, allCategorySortOrders])
}
