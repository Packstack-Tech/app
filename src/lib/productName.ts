import { Item } from '@/types/item'

type NamedItem = Pick<
  Item,
  'product' | 'product_variant' | 'catalog_product' | 'catalog_variant'
>

const liveCatalogProduct = ({ catalog_product }: NamedItem) =>
  catalog_product?.status === 'approved' && catalog_product.product_name
    ? catalog_product
    : undefined

/**
 * The product name to show for an item: the catalog's spelling when the item
 * is linked, else its own text. A legacy product row holds whatever a user
 * first typed, so a linked item can sit on a misspelled one ("riple Crown
 * Button Down"). Mirrors display_product_name() in the API.
 */
export const productName = (item: NamedItem): string | undefined =>
  liveCatalogProduct(item)?.product_name ?? (item.product?.name || undefined)

/**
 * The item's own variant; when it has none and the catalog name is shown,
 * the catalog variant — legacy names often carried it as a suffix ("Tensor
 * Insulated Regular") that the catalog name drops.
 */
export const variantName = (item: NamedItem): string | undefined =>
  item.product_variant?.name ||
  (liveCatalogProduct(item) ? item.catalog_variant?.name : undefined) ||
  undefined
