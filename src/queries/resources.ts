import { useQuery } from '@tanstack/react-query'

import { getBrands, getProducts, searchBrands } from '@/lib/api'

export const BRANDS_QUERY = ['brands']
export const useBrands = () => {
  return useQuery({
    queryKey: BRANDS_QUERY,
    queryFn: async () => {
      const res = await getBrands()
      // TODO move sorting to server
      res.data.sort((a, b) => {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      })
      return res.data
    },
  })
}

type ProductsProps = {
  brandId?: number
  enabled: boolean
}

export const PRODUCTS_QUERY = 'products'
export const useProducts = ({ brandId, enabled }: ProductsProps) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY, brandId],
    queryFn: async () => {
      const res = await getProducts(brandId)
      return res.data
    },
    enabled: !!brandId && enabled,
  })
}

type SearchBrandsProps = {
  query: string
  enabled: boolean
}

export const SEARCH_BRANDS_QUERY = 'search-brands'
export const useSearchBrands = ({ query, enabled }: SearchBrandsProps) => {
  return useQuery({
    queryKey: [SEARCH_BRANDS_QUERY, query],
    queryFn: async () => {
      const res = await searchBrands(query)
      return res.data
    },
    enabled: !!query && enabled,
  })
}
