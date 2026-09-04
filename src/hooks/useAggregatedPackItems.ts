import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'
import { groupByCategory } from '@/lib/categorize'
import { ItemCategory } from '@/types/category'
import { Item } from '@/types/item'

export type AggregatedPackItem = {
  item: Item
  category?: ItemCategory
  /** Summed across every pack that holds it. */
  totalQuantity: number
  /** Every pack holding it, for the subcopy and for targeted removal. */
  packs: { index: number; title: string; quantity: number }[]
}

export type AggregatedGroup = {
  category?: ItemCategory
  items: AggregatedPackItem[]
}

export type AggregatedPacks = {
  groups: AggregatedGroup[]
  itemCount: number
  duplicateCount: number
}

/**
 * Every item across every pack of the trip, folded into one row per item.
 *
 * An item carried by two people appears once with both packs listed, which is
 * the point: duplicates are exactly what this view exists to surface.
 */
export function useAggregatedPackItems(): AggregatedPacks {
  const packs = useTripPacks(useShallow(store => store.packs))

  return useMemo(() => {
    const byItemId = new Map<number, AggregatedPackItem>()

    packs.forEach((pack, index) => {
      for (const packItem of pack.items) {
        const existing = byItemId.get(packItem.item_id)
        if (existing) {
          existing.totalQuantity += packItem.quantity
          existing.packs.push({ index, title: pack.title, quantity: packItem.quantity })
        } else {
          byItemId.set(packItem.item_id, {
            item: packItem.item,
            category: packItem.item.category,
            totalQuantity: packItem.quantity,
            packs: [{ index, title: pack.title, quantity: packItem.quantity }],
          })
        }
      }
    })

    const rows = [...byItemId.values()]

    const groups = groupByCategory<AggregatedPackItem>(
      rows,
      row => row.item.category_id?.toString() || 'uncategorized',
      row => row.category,
      row => row.item.sort_order || 0
    )

    return {
      groups,
      itemCount: rows.length,
      duplicateCount: rows.filter(r => r.packs.length > 1).length,
    }
  }, [packs])
}
