import { ItemCategory } from '@/types/category'

type CategorizedGroup<T> = {
  category?: ItemCategory
  items: T[]
}

/**
 * Groups items by their category_id, then sorts both items within
 * each group and the groups themselves by sort_order.
 *
 * @param items - Flat array of items to group
 * @param getCategoryId - Extracts the category_id from an item
 * @param getCategory - Extracts the ItemCategory from an item
 * @param getSortOrder - Extracts the sort_order from an item (for intra-group sorting)
 */
export function groupByCategory<T>(
  items: T[],
  getCategoryId: (item: T) => string,
  getCategory: (item: T) => ItemCategory | undefined,
  getSortOrder: (item: T) => number
): CategorizedGroup<T>[] {
  const grouped = items.reduce<Record<string, CategorizedGroup<T>>>(
    (acc, item) => {
      const catId = getCategoryId(item)
      if (acc[catId]) {
        acc[catId].items.push(item)
      } else {
        acc[catId] = {
          category: getCategory(item),
          items: [item],
        }
      }
      return acc
    },
    {}
  )

  return Object.values(grouped)
    .map(group => {
      group.items.sort((a, b) => getSortOrder(a) - getSortOrder(b))
      return group
    })
    .sort(
      (a, b) => (a.category?.sort_order ?? 0) - (b.category?.sort_order ?? 0)
    )
}
