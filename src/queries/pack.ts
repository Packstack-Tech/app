import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  createPack,
  deletePack,
  generatePack,
  getTripPacks,
  getUnassignedPacks,
  updatePack,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { PackPayload } from '@/types/api'

// export const PACKS_QUERY = 'packs-query'

// export const usePacks = () => {
//   return useQuery(PACKS_QUERY, async () => {
//     const res = await getPacks()
//     return res.data
//   })
// }

// export const PACK_QUERY = 'pack-query'

// export const usePack = (id?: number) => {
//   return useQuery(
//     [PACK_QUERY, id],
//     async () => {
//       const res = await getPack(id)
//       return res.data
//     },
//     {
//       enabled: !!id
//     }
//   )
// }

export const TRIP_PACKS_QUERY = 'trip-packs-query'

export const tripPacksQueryOptions = (tripId: string | number) =>
  queryOptions({
    queryKey: [TRIP_PACKS_QUERY, tripId],
    queryFn: async () => {
      const res = await getTripPacks(tripId)
      return res.data
    },
  })

export const useTripPacksQuery = (tripId?: number | string) => {
  return useQuery({
    queryKey: [TRIP_PACKS_QUERY, tripId],
    queryFn: async () => {
      const res = await getTripPacks(tripId)
      return res.data
    },
    enabled: !!tripId,
  })
}

export const useCreatePack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: PackPayload) => {
      const res = await createPack(data)
      Mixpanel.track('Pack:Create')
      return res.data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [TRIP_PACKS_QUERY] }),
  })
}

type UpdatePack = {
  id: number
  data: PackPayload
}

export const useUpdatePack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: UpdatePack) => {
      const res = await updatePack(id, data)
      return res.data
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: [TRIP_PACKS_QUERY, data.id] })
    },
  })
}

export const UNASSIGNED_PACKS_QUERY = 'unassigned-packs-query'

export const useUnassignedPacks = () => {
  return useQuery({
    queryKey: [UNASSIGNED_PACKS_QUERY],
    queryFn: async () => {
      const res = await getUnassignedPacks()
      return res.data
    },
  })
}

export const useGeneratePack = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await generatePack(id)
      Mixpanel.track('Pack:Generate')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIP_PACKS_QUERY] })
      queryClient.invalidateQueries({ queryKey: [UNASSIGNED_PACKS_QUERY] })
      toast({
        title: '✅ Pack converted',
      })
    },
  })
}

// type UpdatePackItem = {
//   packId: number
//   itemId: number
//   data: UpdatePackItemPayload
// }

// export const useUpdatePackItem = () => {
//   return useMutation(async ({ packId, itemId, data }: UpdatePackItem) => {
//     const res = await updatePackItem(packId, itemId, data)
//     return res.data
//   })
// }

// type AssignPack = {
//   packId: number
//   trip_id?: number
// }

// export const useAssignPack = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async ({ packId, trip_id }: AssignPack) => {
//       const res = await assignPack(packId, trip_id)
//       return res.data
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(PACKS_QUERY)
//         queryClient.invalidateQueries(PROFILE_QUERY)
//       }
//     }
//   )
// }

export const useDeletePack = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deletePack(id)
      Mixpanel.track('Pack:Delete')
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNASSIGNED_PACKS_QUERY] })
      queryClient.invalidateQueries({ queryKey: [TRIP_PACKS_QUERY] })
      toast({
        title: 'Pack deleted.',
      })
    },
  })
}
