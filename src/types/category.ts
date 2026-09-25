import { Item, Unit } from './item'
import { PackItem } from './pack'

export type Category = {
  id: number
  name: string
  user_id?: number
  forked_from_id?: number | null
}

/** One row of GET /category/mine: a category in the user's own list. */
export type MyCategory = {
  /** ItemCategory id: what Item.category_id and the sort endpoint use. */
  id: number
  /** Category id: what item create/update, rename, merge and delete take. */
  category_id: number
  name: string
  shared: boolean
  sort_order: number
  item_count: number
  archived_count: number
}

/** A shared category the user hasn't used yet. */
export type SuggestedCategory = {
  category_id: number
  name: string
}

export type MyCategories = {
  categories: MyCategory[]
  suggested: SuggestedCategory[]
}

/** 409 detail from a rename that would duplicate an existing name. */
export type CategoryConflict = {
  code: 'category_exists'
  message: string
  category_id: number
  item_category_id: number | null
  name: string
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

export type CategoryWeight = {
  label: string
  value: number
  unit: Unit
}
