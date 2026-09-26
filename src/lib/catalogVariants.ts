import { formatItemWeight } from '@/lib/weight'
import { Unit } from '@/types/item'
import { Option } from '@/types/lib'
import { CatalogProduct, CatalogVariant } from '@/types/resources'

/** Combobox values for the variant picker. Catalog variants and the user's
 *  own legacy variant live in different id spaces, so values are prefixed. */
export const catalogVariantValue = (id: number) => `cv:${id}`
export const legacyVariantValue = (id: number) => `pv:${id}`

export const parseVariantValue = (
  value: number | string | undefined
): { kind: 'catalog' | 'legacy'; id: number } | undefined => {
  if (value == null) return undefined
  const v = String(value)
  if (v.startsWith('cv:')) return { kind: 'catalog', id: Number(v.slice(3)) }
  if (v.startsWith('pv:')) return { kind: 'legacy', id: Number(v.slice(3)) }
  return undefined
}

const variantLabel = (v: CatalogVariant, unit: Unit) => {
  if (v.weight == null || !v.weight_unit) return v.name
  return `${v.name} · ${formatItemWeight(v.weight, v.weight_unit as Unit, unit)}`
}

/**
 * Options for the variant combobox: weight-bearing variants first (they are
 * the ones that matter), cosmetic ones under a second heading, and the
 * item's own legacy variant when it matches nothing in the catalog.
 */
export const buildVariantOptions = ({
  product,
  unit,
  legacy,
}: {
  product: CatalogProduct | null | undefined
  unit: Unit
  legacy?: { id: number; name: string }
}): Option[] => {
  const opts: Option[] = []
  const variants = product?.variants ?? []
  for (const v of variants.filter(v => v.has_weight)) {
    opts.push({ label: variantLabel(v, unit), value: catalogVariantValue(v.id), group: 'Affects weight' })
  }
  for (const v of variants.filter(v => !v.has_weight)) {
    opts.push({ label: v.name, value: catalogVariantValue(v.id), group: 'Other options' })
  }
  if (legacy && !variants.some(v => v.name.toLowerCase() === legacy.name.toLowerCase())) {
    opts.unshift({ label: legacy.name, value: legacyVariantValue(legacy.id), group: 'Yours' })
  }
  return opts
}

/** Weight to prefill for a chosen variant: its own if it has one, else the product's. */
export const variantPrefillWeight = (
  product: CatalogProduct,
  variant: CatalogVariant | undefined
): { weight: number; unit: string } | null => {
  if (variant && variant.weight != null && variant.weight_unit) {
    return { weight: variant.weight, unit: variant.weight_unit }
  }
  if (product.weight != null && product.weight_unit) {
    return { weight: product.weight, unit: product.weight_unit }
  }
  return null
}
