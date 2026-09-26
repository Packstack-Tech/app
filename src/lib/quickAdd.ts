import { convertWeight } from '@/lib/weight'
import { Category } from '@/types/category'
import { CreateItem, ItemStatus, Unit } from '@/types/item'
import { CatalogProduct, CatalogVariant } from '@/types/resources'

/**
 * Display name for a catalog product in the gear closet.
 *
 * The subcategory is the generic noun people scan for ("Tent", "Sleeping
 * Bag"), and brand/product already render as the secondary line on the
 * inventory row, so using it as the item name avoids repeating the brand
 * twice. Falls back to the product name for catalog rows with no subcategory.
 */
export const quickAddItemName = (product: CatalogProduct): string =>
  product.subcategory || product.product_name

/**
 * Weight-bearing variants are the only ones the quick-add picker offers;
 * cosmetic ones (colors) inherit the product weight and are not a choice
 * worth making at add time.
 */
export const pickableVariants = (product: CatalogProduct): CatalogVariant[] =>
  product.variants.filter(v => v.has_weight)

/**
 * Maps a catalog product (+ optional chosen variant) onto a CreateItem
 * payload. The catalog ids are sent as an explicit pick, so the API locks
 * the item to exactly this product/variant instead of re-deriving it from
 * the brand/product text.
 *
 * Category matching is deliberate: the API's resolve_category() creates a new
 * user-owned Category for any category_new it can't match, so we match against
 * the shared category list by name first and only fall back to category_new
 * when the catalog suggests something outside the taxonomy.
 */
export function buildQuickAddItem({
  product,
  variant,
  categories,
  unit,
  status = 'active',
  name,
}: {
  product: CatalogProduct
  variant?: CatalogVariant
  categories: Category[] | undefined
  unit: Unit
  status?: ItemStatus
  /** Overrides the default subcategory-based name. */
  name?: string
}): CreateItem {
  const src =
    variant && variant.weight != null && variant.weight_unit
      ? { weight: variant.weight, unit: variant.weight_unit }
      : product.weight != null && product.weight_unit
        ? { weight: product.weight, unit: product.weight_unit }
        : null
  const weight = src
    ? Math.round(convertWeight(src.weight, src.unit as Unit, unit).weight * 100) / 100
    : 0

  const categoryMatch = product.category
    ? categories?.find(
        c => c.name.toLowerCase() === product.category!.toLowerCase()
      )
    : undefined

  const kcal = variant?.kcal ?? product.kcal

  return {
    name: name || quickAddItemName(product),
    weight,
    unit,
    price: 0,
    calories: kcal || 0,
    consumable: false,
    product_url: product.product_url || '',
    notes: '',
    status,
    catalog_product_id: product.id,
    ...(variant ? { catalog_variant_id: variant.id } : {}),
    ...(product.brand_id
      ? { brand_id: product.brand_id }
      : { brand_new: product.brand_name }),
    ...(product.product_id
      ? { product_id: product.product_id }
      : { product_new: product.product_name }),
    ...(variant ? { product_variant_new: variant.name } : {}),
    ...(categoryMatch
      ? { category_id: categoryMatch.id }
      : product.category
        ? { category_new: product.category }
        : {}),
  }
}
