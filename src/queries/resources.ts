import { useQuery } from '@tanstack/react-query'

import {
  getCatalogEntries,
  searchCatalogBrands,
  searchCatalogGear,
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

export const CATALOG_GEAR_SEARCH_QUERY = 'catalog-gear-search'
/**
 * `compact` requests the trimmed payload (no descriptions, specs or per-variant
 * images) — used by the quick-add typeahead, where every keystroke can refetch.
 */
export const useCatalogGearSearch = (query: string, compact = false) => {
  return useQuery({
    queryKey: [CATALOG_GEAR_SEARCH_QUERY, query, compact],
    queryFn: async () => {
      const res = await searchCatalogGear(query, compact)
      return res.data
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
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
