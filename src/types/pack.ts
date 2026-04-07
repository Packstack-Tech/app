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
  hiker_profile_id?: number | null
}

export type Pack = BasePack & {
  id: number
  user_id: number
  items: PackItem[]
  weight_breakdown: PackWeightBreakdown
  category_weights: PackCategoryWeight[]
  total_calories: number
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
  hiker_profile_id?: number | null
  items: PackItem[]
}

export type TripPackKeys = keyof TripPack

export type TripPackRecord = {
  id?: number
  title: string
  hiker_profile_id?: number | null
  index: number
}
