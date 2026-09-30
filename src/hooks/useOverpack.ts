import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import {
  OverpackSettings,
  overpackSettings,
  OverpackStatus,
  overpackStatus,
  packedTotals,
} from '@/lib/overpack'

export type OverpackMap = Map<number, OverpackStatus>

export type Overpack = {
  settings: OverpackSettings
  /** item_id -> status for every item in the trip (not just the over ones). */
  byItem: OverpackMap
  /** How many items are packed beyond what the user owns. */
  overCount: number
  /**
   * Whether the user may raise `itemId` to `nextPackQuantity` in the pack at
   * `packIndex`. Always true outside block mode; block mode never refuses
   * lowering a quantity, only exceeding the owned count across the trip.
   */
  canSet: (itemId: number, packIndex: number, nextPackQuantity: number) => boolean
  /** Largest quantity the pack at `packIndex` may hold of `itemId` under block mode. */
  maxFor: (itemId: number, packIndex: number, fallbackOwned: number) => number
}

/**
 * Over-pack status for every item in the trip, summed across all its packs.
 *
 * Like usePackMembership this is a pure derivation over the store the editor
 * already holds, so it costs no request — but it IS O(items) on every store
 * write. Call it once at the list level and pass the map down.
 */
export function useOverpack(): Overpack {
  const user = useUser()
  const { packs } = useTripPacks(useShallow(store => ({ packs: store.packs })))
  const { mode, includeConsumables } = overpackSettings(user)

  return useMemo(() => {
    const settings: OverpackSettings = { mode, includeConsumables }
    const totals = packedTotals(packs)
    const byItem: OverpackMap = new Map()
    const items = new Map<number, { quantity?: number; consumable: boolean }>()
    for (const pack of packs) {
      for (const pi of pack.items) items.set(pi.item_id, pi.item)
    }
    let overCount = 0
    for (const [itemId, packed] of totals) {
      const item = items.get(itemId)
      if (!item) continue
      const status = overpackStatus(item, packed, settings)
      if (!status) continue
      byItem.set(itemId, status)
      if (status.over) overCount++
    }

    const inPack = (itemId: number, packIndex: number) =>
      packs[packIndex]?.items.find(pi => pi.item_id === itemId)?.quantity ?? 0

    const maxFor = (itemId: number, packIndex: number, fallbackOwned: number) => {
      const status = byItem.get(itemId)
      const owned = status?.owned ?? fallbackOwned
      const elsewhere = (totals.get(itemId) ?? 0) - inPack(itemId, packIndex)
      return Math.max(0, owned - elsewhere)
    }

    const canSet = (itemId: number, packIndex: number, next: number) => {
      if (settings.mode !== 'block') return true
      const current = inPack(itemId, packIndex)
      if (next <= current) return true // lowering is always fine
      const item = items.get(itemId)
      if (item?.consumable && !settings.includeConsumables) return true
      const owned = byItem.get(itemId)?.owned
      if (owned === undefined) return true // item not in trip yet; caller checks with its own Item
      return next <= maxFor(itemId, packIndex, owned)
    }

    return { settings, byItem, overCount, canSet, maxFor }
  }, [packs, mode, includeConsumables])
}
