import { useQuery } from '@tanstack/react-query'

import {
  getCatalogEntries,
  searchCatalogBrands,
  searchCatalogProducts,
} from '@/lib/api'

export const CATALOG_BRANDS_QUERY = 'catalog-brands'
export const useCatalogBrands = ({
  query,
  enabled,
}: {
  query: string
  enabled: boolean
}) => {
  return useQuery({
    queryKey: [CATALOG_BRANDS_QUERY, query],
    queryFn: async () => {
      const res = await searchCatalogBrands(query)
      return res.data
    },
    enabled: !!query && enabled,
  })
}

export const CATALOG_PRODUCTS_QUERY = 'catalog-products'
export const useCatalogProducts = ({
  brand,
  enabled,
}: {
  brand?: string
  enabled: boolean
}) => {
  return useQuery({
    queryKey: [CATALOG_PRODUCTS_QUERY, brand],
    queryFn: async () => {
      const res = await searchCatalogProducts(brand!)
      return res.data
    },
    enabled: !!brand && enabled,
  })
}

export const CATALOG_ENTRIES_QUERY = 'catalog-entries'
export const useCatalogEntries = ({
  brand,
  product,
  enabled,
}: {
  brand?: string
  product?: string
  enabled: boolean
}) => {
  return useQuery({
    queryKey: [CATALOG_ENTRIES_QUERY, brand, product],
    queryFn: async () => {
      const res = await getCatalogEntries(brand!, product!)
      return res.data
    },
    enabled: !!brand && !!product && enabled,
  })
}
