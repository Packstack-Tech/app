import { useQuery } from '@tanstack/react-query'
import { getBrands, getProducts } from '@/lib/api'

// export const RESOURCES_QUERY = 'resources-query'
// export const useResourcesQuery = () => {
//   return useQuery([RESOURCES_QUERY], async () => {
//     const res = await getResources()
//     return res.data
//   })
// }

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
    }
  })
}

export const PRODUCTS_QUERY = 'products'
export const useProducts = (brandId?: number) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY, brandId],
    queryFn: async () => {
      const res = await getProducts(brandId)
      return res.data
    },
    enabled: !!brandId
  })
}
