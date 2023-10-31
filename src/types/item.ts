import { ItemCategory } from "./category"
import { Brand, Product } from "./resources"

export type Unit = "g" | "kg" | "oz" | "lb"

export type ItemForm = {
  name: string
  brand_id?: number
  brand_new?: string
  product_id?: number
  product_new?: string
  category_id?: number
  category_new?: string
  weight: number
  unit: Unit
  price: number
  consumable: boolean
  product_url: string
  notes: string
}

export type EditItem = ItemForm & {
  id: number
}

export type Item = {
  id: number
  name: string
  user_id: number
  brand_id?: number
  category_id?: number
  consumable: boolean
  created_at: string
  notes: string
  price?: number
  product_id?: number
  product_url: string
  removed: boolean
  sort_order: number | null
  unit: Unit
  updated_at: string
  weight?: number | null
  wishlist?: boolean

  category?: ItemCategory
  brand?: Brand
  product?: Product
}

export type ProductDetails = {
  median: number
  items: number
  unit: Unit
}
