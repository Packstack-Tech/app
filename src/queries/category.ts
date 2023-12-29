import { useQuery } from '@tanstack/react-query'

import { getCategories } from '@/lib/api'

const CATEGORY_QUERY = 'categories'
export const useCategories = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY],
    queryFn: async () => {
      const res = await getCategories()
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

// export const useCreateCategory = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (category: CreateCategory) => {
//       const res = await createCategory(category)
//       return res.data
//     },
//     {
//       onSuccess: () => queryClient.invalidateQueries([CATEGORY_QUERY])
//     }
//   )
// }
