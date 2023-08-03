import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createPack,
  assignPack,
  deletePack,
  getPack,
  getPacks,
  getTripPacks,
  updatePack,
  updatePackItem,
} from "@/lib/api"
import { PackPayload, UpdatePackItemPayload } from "@/types/api"

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

export const TRIP_PACKS_QUERY = "trip-packs-query"

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRIP_PACKS_QUERY, data.id] })
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

// export const useDeletePack = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (id: number) => {
//       const res = await deletePack(id)
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
