import { Item } from './item'

export type PackWeightBreakdown = {
  base_g: number
  worn_g: number
  consumable_g: number
  total_g: number
}

export type PackCategoryWeight = {
  label: string
  weight_g: number
}

type BasePack = {
  title: string
  trip_id?: number
}

export type Pack = BasePack & {
  id: number
  user_id: number
  /** Bumped by the API on every change; sent back on save (see lib/packSync). */
  version: number
  items: PackItem[]
  weight_breakdown: PackWeightBreakdown
  category_weights: PackCategoryWeight[]
  total_calories: number
}

type PackItemEditable = {
  quantity: number
  /** Kept equal to `worn_quantity > 0`; read counts through `wornQuantity()`. */
  worn: boolean
  /** Units worn, 0..quantity (1 of 5 shirts). Optional: cached trips predate it. */
  worn_quantity?: number
  checked: boolean
  sort_order: number
}

export type PackItemEditableKeys = keyof PackItemEditable

export type PackItem = PackItemEditable & {
  item_id: number
  pack_id?: number
  item: Item
}

export type PackFormProps = {
  title: string
}

/** One pack item's saved fields, as compared and merged by lib/packSync. */
export type SyncedItem = {
  item_id: number
  quantity: number
  worn_quantity: number
  checked: boolean
  sort_order: number
}

/** The server's copy of a pack that this client's edits were made against. */
export type PackBase = {
  version: number
  title: string
  items: SyncedItem[]
}

export type TripPack = {
  id?: number
  title: string
  items: PackItem[]
  /** Absent until the pack exists on the server. */
  base?: PackBase
}

export type TripPackKeys = keyof TripPack

export type TripPackRecord = {
  id?: number
  title: string
  index: number
}
