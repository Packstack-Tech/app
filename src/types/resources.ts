export type Condition = {
  id: number
  name: string
}

export type PackCondition = {
  condition: Condition
  pack_id: number
  condition_id: number
}

export type Geography = {
  id: number
  name: string
}

export type PackGeography = {
  geography: Geography
  pack_id: number
  geography_id: number
}

export type Resources = {
  conditions: Condition[]
  geographies: Geography[]
  currencies: { [key: string]: number }
  unitSystem: { [key: string]: number }
  weightUnits: { [key: string]: number }
}

export type Brand = {
  id: number
  name: string
  removed: boolean
}

export type Product = {
  id: number
  name: string
  brand_id: number
  removed: boolean
}

export type BrandProducts = Brand & {
  products: Product[]
}

export type CatalogBrand = {
  brand_id: number
  brand_name: string
}

export type CatalogProductOption = {
  product_id: number
  product_name: string
}

// ── Catalog product (one shape for search, browse and the item-form
// pickers; produced by api/app/catalog/resolver.py serialize_product) ──

export type CatalogVariant = {
  id: number
  name: string
  weight: number | null
  weight_unit: string | null
  /** true = this option changes the weight (size, length, capacity…);
   *  false = cosmetic (color, pattern) and inherits the product weight. */
  has_weight: boolean
  kcal: number | null
  image_url: string | null
  kind: 'size' | 'length' | 'gender' | 'color' | 'capacity' | 'other' | null
  sort_order: number
}

export type CatalogProduct = {
  id: number
  brand_name: string
  product_name: string
  display_name: string
  brand_id: number | null
  product_id: number | null
  /** Base / default-configuration weight. Null only for products with no known weight. */
  weight: number | null
  weight_unit: string | null
  kcal: number | null
  weight_range_g: { min: number; max: number } | null
  /** Alias of weight_range_g.min, kept for browse sorting. */
  lightest_weight_g: number | null
  product_url: string | null
  image_url: string | null
  category: string | null
  subcategory: string | null
  catalog_url_slug: string | null
  /** Weight-bearing variants first, then cosmetic. Hidden variants are never sent. */
  variants: CatalogVariant[]
  weight_variant_count: number
  // Omitted by the compact search payload (?compact=1) used by quick add.
  description?: string | null
  additional_specs?: Record<string, unknown> | null
  status?: string
}

/** @deprecated use CatalogProduct */
export type CatalogGearProduct = CatalogProduct
/** @deprecated use CatalogVariant */
export type CatalogGearVariant = CatalogVariant
