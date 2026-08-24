import { convertWeight } from '@/lib/weight'
import { Category } from '@/types/category'
import { CreateItem, ItemStatus, Unit } from '@/types/item'
import { CatalogGearProduct, CatalogGearVariant } from '@/types/resources'

/**
 * Display name for a catalog product in the gear closet.
 *
 * The subcategory is the generic noun people scan for ("Tent", "Sleeping
 * Bag"), and brand/product already render as the secondary line on the
 * inventory row, so using it as the item name avoids repeating the brand
 * twice. Falls back to the product name for catalog rows with no subcategory.
 */
export const quickAddItemName = (product: CatalogGearProduct): string =>
  product.subcategory || product.product_name

/**
 * Maps a catalog product + chosen variant onto a CreateItem payload.
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
  product: CatalogGearProduct
  variant: CatalogGearVariant
  categories: Category[] | undefined
  unit: Unit
  status?: ItemStatus
  /** Overrides the default subcategory-based name. */
  name?: string
}): CreateItem {
  const weight =
    variant.weight != null && variant.weight_unit
      ? Math.round(
          convertWeight(variant.weight, variant.weight_unit as Unit, unit)
            .weight * 100
        ) / 100
      : 0

  const categoryMatch = product.category
    ? categories?.find(
        c => c.name.toLowerCase() === product.category!.toLowerCase()
      )
    : undefined

  return {
    name: name || quickAddItemName(product),
    weight,
    unit,
    price: 0,
    calories: variant.kcal || 0,
    consumable: false,
    product_url: product.product_url || '',
    notes: '',
    status,
    ...(variant.brand_id
      ? { brand_id: variant.brand_id }
      : { brand_new: product.brand_name }),
    ...(variant.product_id
      ? { product_id: variant.product_id }
      : { product_new: product.product_name }),
    ...(variant.variant_name
      ? variant.product_variant_id
        ? { product_variant_id: variant.product_variant_id }
        : { product_variant_new: variant.variant_name }
      : {}),
    ...(categoryMatch
      ? { category_id: categoryMatch.id }
      : product.category
        ? { category_new: product.category }
        : {}),
  }
}
