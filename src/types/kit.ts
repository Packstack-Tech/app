import { Item } from './item'

export type KitItem = {
  kit_id: number
  item_id: number
  quantity: number
  item: Item
}

export type Kit = {
  id: number
  user_id: number
  name: string
  items: KitItem[]
  created_at: string
}

export type KitItemPayload = {
  item_id: number
  quantity: number
}

export type KitPayload = {
  name: string
  items: KitItemPayload[]
}
