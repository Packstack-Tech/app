import { Item } from "./item"
import { PackItem } from "./pack"

export type Category = {
  id: number
  name: string
  user_id?: number
}

export type ItemCategory = {
  id: number
  user_id: number
  category_id: number
  sort_order: number
  category: Category
}

export type CategoryItems = {
  category?: ItemCategory
  items: Item[]
}

export type CategoryPackItems = {
  category?: ItemCategory
  items: PackItem[]
}

export type CategorizedItems = {
  [key: string]: CategoryItems
}

export type CategorizedPackItems = {
  [key: string]: CategoryPackItems
}
