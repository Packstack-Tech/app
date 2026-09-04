import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'

/**
 * Maps item id -> titles of the OTHER packs in this trip that hold it.
 *
 * Free to compute: the editor already keeps every pack of the trip in the
 * store, so cross-pack membership needs no extra request. The currently
 * selected pack is excluded — "this item is in the pack you're looking at" is
 * already obvious from the row itself.
 *
 * Call this ONCE at the list level and pass the result down. Computed per row
 * it is O(rows x items) on every store write.
 */
export function usePackMembership(): Map<number, string[]> {
  const { packs, selectedIndex } = useTripPacks(
    useShallow(store => ({
      packs: store.packs,
      selectedIndex: store.selectedIndex,
    }))
  )

  return useMemo(() => {
    const map = new Map<number, string[]>()
    packs.forEach((pack, index) => {
      if (index === selectedIndex) return
      for (const packItem of pack.items) {
        const existing = map.get(packItem.item_id)
        if (existing) existing.push(pack.title)
        else map.set(packItem.item_id, [pack.title])
      }
    })
    return map
  }, [packs, selectedIndex])
}
