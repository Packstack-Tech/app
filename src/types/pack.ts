import { Item } from './item'

type BasePack = {
  title: string
  trip_id?: number
}

export type Pack = BasePack & {
  id: number
  user_id: number
  items: PackItem[]
}

type PackItemEditable = {
  quantity: number
  worn: boolean
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

export type TripPack = {
  id?: number
  title: string
  items: PackItem[]
}

export type TripPackKeys = keyof TripPack

export type TripPackRecord = {
  id?: number
  title: string
  index: number
}
