import { OverpackMode } from '@/types/user'

/**
 * Owned count of a closet item. Cached rows and pack drafts written before
 * the field existed have no `quantity`; treat those as 1, which is what the
 * server backfilled them to.
 */
export const ownedQuantity = (item: { quantity?: number | null }): number =>
  Math.max(1, Math.floor(item.quantity ?? 1))

/** Owned quantity multiplies closet value, never closet weight. */
export const ownedValue = (item: { price?: number | null; quantity?: number | null }): number =>
  (item.price || 0) * ownedQuantity(item)

export type OverpackSettings = {
  mode: OverpackMode
  includeConsumables: boolean
}

export const DEFAULT_OVERPACK_SETTINGS: OverpackSettings = {
  mode: 'warn',
  includeConsumables: true,
}

/** Settings from the user record, tolerating a user object that predates them. */
export const overpackSettings = (user?: {
  overpack_mode?: OverpackMode | null
  overpack_include_consumables?: boolean | null
}): OverpackSettings => ({
  mode: user?.overpack_mode ?? DEFAULT_OVERPACK_SETTINGS.mode,
  includeConsumables:
    user?.overpack_include_consumables ?? DEFAULT_OVERPACK_SETTINGS.includeConsumables,
})

export type OverpackStatus = {
  /** Total packed across every pack of the trip. */
  packed: number
  owned: number
  /** packed > owned, and the check applies to this item under the settings. */
  over: boolean
  /** How many more can be added before going over (0 when already at/over). */
  remaining: number
}

/**
 * Whether `item`, packed `packedTotal` times across the trip, exceeds what the
 * user owns. `null` when the check is off or doesn't apply (consumable with
 * the consumables toggle off).
 */
export const overpackStatus = (
  item: { quantity?: number | null; consumable: boolean },
  packedTotal: number,
  settings: OverpackSettings
): OverpackStatus | null => {
  if (settings.mode === 'off') return null
  if (item.consumable && !settings.includeConsumables) return null
  const owned = ownedQuantity(item)
  return {
    packed: packedTotal,
    owned,
    over: packedTotal > owned,
    remaining: Math.max(0, owned - packedTotal),
  }
}

/**
 * Total quantity of each item across a set of packs, keyed by item id.
 * Pure derivation over data the trip editor already holds.
 */
export const packedTotals = (
  packs: { items: { item_id: number; quantity: number }[] }[]
): Map<number, number> => {
  const totals = new Map<number, number>()
  for (const pack of packs) {
    for (const pi of pack.items) {
      totals.set(pi.item_id, (totals.get(pi.item_id) ?? 0) + (pi.quantity || 0))
    }
  }
  return totals
}
