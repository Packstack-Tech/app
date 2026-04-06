import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  createHikerProfile,
  deleteHikerProfile,
  getHikerProfiles,
  updateHikerProfile,
} from '@/lib/api'
import { HikerProfilePayload } from '@/types/hiker-profile'

export const HIKER_PROFILES_QUERY = 'hiker-profiles'

export const hikerProfilesQueryOptions = queryOptions({
  queryKey: [HIKER_PROFILES_QUERY],
  queryFn: async () => {
    const res = await getHikerProfiles()
    return res.data
  },
})

export const useHikerProfilesQuery = () => {
  return useQuery(hikerProfilesQueryOptions)
}

export const useCreateHikerProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: HikerProfilePayload) => {
      const res = await createHikerProfile(params)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HIKER_PROFILES_QUERY] })
      toast({ title: 'Hiker profile created' })
    },
  })
}

export const useUpdateHikerProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: Partial<HikerProfilePayload>
    }) => {
      const res = await updateHikerProfile(id, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HIKER_PROFILES_QUERY] })
      toast({ title: 'Hiker profile updated' })
    },
  })
}

export const useDeleteHikerProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      await deleteHikerProfile(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HIKER_PROFILES_QUERY] })
      toast({ title: 'Hiker profile deleted' })
    },
  })
}
