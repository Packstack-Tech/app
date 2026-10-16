import { wornQuantity } from '@/lib/worn'
import { Pack, PackBase, PackItem, SyncedItem, TripPack } from '@/types/pack'

/**
 * Pack saving is optimistic: PUT /pack/{id} replaces the pack's whole item
 * list, and carries the version the edits were made against. If someone else
 * saved in between (another tab, the phone, the MCP tools) the API answers 409
 * with its current copy, and `rebasePack` replays this client's edits onto it.
 *
 * Keep in step with mobile/src/lib/packSync.ts.
 */

const FIELDS = ['quantity', 'worn_quantity', 'checked', 'sort_order'] as const

const toSynced = (pi: PackItem): SyncedItem => ({
  item_id: pi.item_id,
  quantity: Number(pi.quantity ?? 0),
  worn_quantity: wornQuantity(pi),
  checked: !!pi.checked,
  sort_order: Number(pi.sort_order ?? 0),
})

const sameItem = (a: SyncedItem, b: SyncedItem) => FIELDS.every(f => a[f] === b[f])

export const baseOf = (pack: Pack): PackBase => ({
  version: pack.version,
  title: pack.title,
  items: pack.items.map(toSynced),
})

/** A server pack as the store holds it: with the base its edits start from. */
export const fromServer = (pack: Pack): TripPack => ({ ...pack, base: baseOf(pack) })

/** Whether saving this pack would change anything on the server. */
export function isDirty(pack: TripPack): boolean {
  const base = pack.base
  if (!pack.id || !base) return true
  if (pack.title !== base.title || pack.items.length !== base.items.length) return true
  const byId = new Map(base.items.map(i => [i.item_id, i]))
  return pack.items.some(pi => {
    const b = byId.get(pi.item_id)
    return !b || !sameItem(toSynced(pi), b)
  })
}

/**
 * This client's edits (local vs. its base), replayed onto the server's newer
 * copy. Item-level: an item added on either side is kept, one removed here is
 * removed, and a field changed here overrides the server's value for that
 * field only. An item removed on the server stays removed even if edited here.
 */
export function rebasePack(local: TripPack, server: Pack): TripPack {
  const base = local.base ?? { version: 0, title: local.title, items: [] }
  const baseById = new Map(base.items.map(i => [i.item_id, i]))
  const localById = new Map(local.items.map(pi => [pi.item_id, pi]))
  const serverIds = new Set(server.items.map(pi => pi.item_id))

  const items: PackItem[] = []
  for (const s of server.items) {
    const b = baseById.get(s.item_id)
    const l = localById.get(s.item_id)
    if (!l) {
      // Removed here, or added on the server.
      if (!b) items.push(s)
      continue
    }
    const mine = toSynced(l)
    const changed: Partial<SyncedItem> = {}
    for (const f of FIELDS) {
      if (!b || mine[f] !== b[f]) (changed as Record<string, unknown>)[f] = mine[f]
    }
    const merged = { ...s, ...changed }
    const worn_quantity = Math.min(wornQuantity(merged), merged.quantity)
    items.push({ ...merged, worn_quantity, worn: worn_quantity > 0 })
  }
  for (const l of local.items) {
    if (!serverIds.has(l.item_id) && !baseById.has(l.item_id)) items.push(l)
  }

  return {
    ...local,
    title: local.title !== base.title ? local.title : server.title,
    items,
    base: baseOf(server),
  }
}

/** The server's current pack from a 409 on save, or null for any other error. */
export function conflictPack(error: unknown): Pack | null {
  const response = (error as { response?: { status?: number; data?: { code?: string; pack?: Pack } } })
    ?.response
  if (response?.status !== 409 || response.data?.code !== 'pack_conflict') return null
  return response.data.pack ?? null
}
