import { ItemCategory } from './category'
import { Brand, Product } from './resources'

export type Unit = 'g' | 'kg' | 'oz' | 'lb'

export type ItemCondition = 'new' | 'good' | 'fair' | 'worn' | 'retired'
export type ItemStatus = 'active' | 'wishlist' | 'retired' | 'sold' | 'lost'
export type AcquisitionType = 'purchased' | 'gifted' | 'traded' | 'diy'
export type RetiredReason = 'worn_out' | 'upgraded' | 'lost' | 'sold' | 'gifted'

export type ItemForm = {
  itemname: string
  brand_id?: number
  brand_new?: string
  product_id?: number
  product_new?: string
  product_variant_id?: number
  product_variant_new?: string
  category_id?: number
  category_new?: string
  weight: number
  unit: Unit
  price: number
  calories: number
  consumable: boolean
  product_url: string
  notes: string
  acquired_date?: string
  acquisition_type?: string
  purchase_retailer?: string
  condition?: string
  status?: string
  retired_date?: string
  retired_reason?: string
  replaced_by_id?: number
}

export type CreateItem = Omit<ItemForm, 'itemname'> & {
  name: string
}

export type EditItem = CreateItem & {
  id: number
}

export type CatalogProduct = {
  id: number
  brand_name: string
  product_name: string
  variant_name?: string
  display_name: string
  weight?: number
  weight_unit?: string
  product_url?: string
  description?: string
  image_url?: string
  category_suggestion?: string
  subcategory?: string
  additional_specs?: Record<string, unknown>
}

export type Item = {
  id: number
  name: string
  user_id: number
  brand_id?: number
  category_id?: number
  catalog_product_id?: number
  consumable: boolean
  created_at: string
  notes: string
  price?: number
  calories?: number | null
  product_id?: number
  product_variant_id?: number
  product_url: string
  removed: boolean
  sort_order: number | null
  unit: Unit
  updated_at: string
  weight?: number | null

  acquired_date?: string | null
  acquisition_type?: AcquisitionType | null
  purchase_retailer?: string | null
  condition?: ItemCondition | null
  status?: ItemStatus | null
  retired_date?: string | null
  retired_reason?: RetiredReason | null
  replaced_by_id?: number | null

  category?: ItemCategory
  brand?: Brand
  product?: Product
  product_variant?: ProductVariant
  catalog_product?: CatalogProduct
  replaced_by?: Item
}

export type ItemLogEntry = {
  id: number
  item_id: number
  user_id: number
  event_type: string
  note?: string
  event_date: string
  old_condition?: string
  new_condition?: string
  old_weight?: number
  new_weight?: number
  cost?: number
  created_at: string
}

export type CreateItemLog = {
  event_type: string
  event_date: string
  note?: string
  old_condition?: string
  new_condition?: string
  old_weight?: number
  new_weight?: number
  cost?: number
}

export type ReplacementScoreResponse = {
  item_id: number
  score: number | null
  category: string
  benchmark: CategoryBenchmarks
  is_default_fallback?: boolean
  acquired_date: string | null
  condition: string | null
}

export type CategoryBenchmarks = {
  lifespan_years?: number
  expected_nights?: number
  expected_distance?: number
  distance_unit?: string
  has_override?: boolean
  is_default_fallback?: boolean
}

export type AllBenchmarks = Record<string, CategoryBenchmarks>

export type ProductVariant = {
  id: number
  product_id: number
  name: string
}
