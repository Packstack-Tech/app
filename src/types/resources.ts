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

export type CatalogEntry = {
  id: number
  brand_id: number
  product_id: number
  product_variant_id: number | null
  variant_name: string | null
  weight: number | null
  weight_unit: string | null
  product_url: string | null
  category_suggestion: string | null
}

// ── Gear search (catalog product search, shared with mobile) ───────

export type CatalogGearVariant = {
  id: number
  brand_id: number | null
  product_id: number | null
  product_variant_id: number | null
  variant_name: string | null
  weight: number | null
  weight_unit: string | null
  kcal: number | null
  // Omitted by the compact search payload (?compact=1) used by quick add.
  display_name?: string
  image_url?: string | null
  description?: string | null
  additional_specs?: Record<string, string> | null
}

export type CatalogGearProduct = {
  brand_name: string
  product_name: string
  product_url: string | null
  catalog_url_slug: string | null
  /** First non-null variant image, so list rows need no variant scan. */
  image_url: string | null
  category: string | null
  subcategory: string | null
  subcategory_slug: string | null
  lightest_weight_g: number | null
  variants: CatalogGearVariant[]
}
