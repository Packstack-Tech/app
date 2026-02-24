import { useMemo } from 'react'
import Fuse from 'fuse.js'

import { useGroupedInventory } from '@/queries/item'
import { CategoryItems } from '@/types/category'
import { Item } from '@/types/item'

type Options = {
  filter?: string
  showRemoved?: boolean
}

export const useCategorizedItems = ({
  filter,
  showRemoved = false,
}: Options): CategoryItems[] => {
  const { data: groups } = useGroupedInventory()

  const allItems = useMemo(
    () => (groups || []).flatMap(g => g.items),
    [groups]
  )

  const fuseItems = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ['name', 'product.name', 'brand.name'],
      }),
    [allItems]
  )

  return useMemo(() => {
    if (!groups) return []

    if (!filter && showRemoved) return groups

    const matchedIds = filter
      ? new Set(fuseItems.search(filter).map(r => r.item.id))
      : null

    return groups
      .map(group => {
        const filtered = group.items.filter((item: Item) => {
          if (matchedIds && !matchedIds.has(item.id)) return false
          if (!showRemoved && item.removed) return false
          return true
        })
        return { ...group, items: filtered }
      })
      .filter(group => group.items.length > 0)
  }, [groups, fuseItems, filter, showRemoved])
}
