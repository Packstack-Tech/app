import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getTripFeed,
  getTrip,
  createTrip,
  editTrip,
  uploadTripImage,
  updateImageOrder,
  deleteTripImage,
  deleteTrip,
  updateTripImage,
  toggleTripPublish,
} from "@/lib/api"
import { CreateTrip, EditTrip, Trip } from "@/types/trip"
import { useToast } from "@/hooks/useToast"

// export const TRIP_FEED = 'trip-feed'
// export const useTripFeed = () => {
//   return useQuery(TRIP_FEED, async () => {
//     const res = await getTripFeed()
//     return res.data
//   })
// }

export const TRIP_QUERY = "trip-query"
export const useTripQuery = (id?: string | number) => {
  return useQuery({
    queryKey: [TRIP_QUERY, id],
    queryFn: async () => {
      const res = await getTrip(id)
      return res.data
    },
    enabled: !!id,
  })
}

export const useCreateTrip = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: CreateTrip) => {
      const res = await createTrip(params)
      return res.data
    },
    onSuccess: ({ id }) =>
      queryClient.invalidateQueries({ queryKey: [TRIP_QUERY, id] }),
  })
}

export const useUpdateTrip = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: EditTrip) => {
      const res = await editTrip(params)
      return res.data
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Trip saved",
      })
      queryClient.invalidateQueries({ queryKey: [TRIP_QUERY, data.id] })
    },
  })
}

// export const useToggleTripPublic = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (tripId: number) => {
//       const res = await toggleTripPublish(tripId)
//       return res.data
//     },
//     {
//       onSuccess: (data) => queryClient.invalidateQueries([TRIP_QUERY, data.id])
//     }
//   )
// }

// export const useUploadTripImage = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: UploadImage) => {
//       const res = await uploadTripImage(params)
//       return res.data
//     },
//     {
//       onSuccess: (data) => {
//         queryClient.setQueryData<Trip>(
//           [TRIP_QUERY, `${data.pack_id}`],
//           (oldData: any) => ({ ...oldData, images: [...oldData.images, data] })
//         )
//       }
//     }
//   )
// }

// export const useUpdateTripImage = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: UpdateTripImage) => {
//       const res = await updateTripImage(params)
//       return res.data
//     },
//     {
//       onSuccess: (data) => {
//         queryClient.setQueriesData<Trip>(
//           [TRIP_QUERY, `${data.pack_id}`],
//           (oldData: any) => {
//             const images = [...oldData.images]
//             const imageIdx = images.findIndex((rec) => rec.id === data.id)
//             images.splice(imageIdx, 1, data)
//             return { ...oldData, images }
//           }
//         )
//       }
//     }
//   )
// }

// export const useUpdateImageOrder = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: UpdateTripPhotoOrder) => {
//       const res = await updateImageOrder(params)
//       return res.data
//     },
//     {
//       onSuccess: (data: any) => {
//         const packId = !!data.length ? data[0].pack_id : undefined
//         if (!packId) return
//         queryClient.setQueriesData<Trip>(
//           [TRIP_QUERY, packId],
//           (oldData: any) => ({ ...oldData, images: data })
//         )
//       }
//     }
//   )
// }

// export const useDeleteImage = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: { tripId: number; imageId: number }) => {
//       const res = await deleteTripImage(params.tripId, params.imageId)
//       return res.data
//     },
//     {
//       onSuccess: (data: any) => {
//         queryClient.setQueriesData<Trip>(
//           [TRIP_QUERY, data.trip_id],
//           (oldData: any) => {
//             const images = [...oldData.images].filter(
//               (rec) => rec.id !== parseInt(data.image_id, 10)
//             )
//             return { ...oldData, images }
//           }
//         )
//       }
//     }
//   )
// }

// export const useDeleteTrip = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: number) => {
//       const res = await deleteTrip(params)
//       return res.data
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(PROFILE_QUERY)
//         queryClient.invalidateQueries(TRIP_FEED)
//       }
//     }
//   )
// }
