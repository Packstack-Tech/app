import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  createHikerProfile,
  getHikerProfiles,
  updateHikerProfile,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { HikerProfile, HikerProfilePayload } from '@/types/hiker-profile'

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

/**
 * The user's one profile. The product is single-profile as of Sept 2026, but
 * the API still returns a list (kept for mobile builds in the wild) and a few
 * accounts still hold extra rows from before. The default row is THE profile;
 * the oldest is the fallback for rows created before is_default existed.
 */
export function resolveHikerProfile(
  profiles: HikerProfile[] | undefined
): HikerProfile | null {
  if (!profiles?.length) return null
  return profiles.find(p => p.is_default) ?? profiles[0]
}

export const useHikerProfileQuery = () => {
  const query = useHikerProfilesQuery()
  return { ...query, profile: resolveHikerProfile(query.data) }
}

export const useCreateHikerProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: HikerProfilePayload) => {
      const res = await createHikerProfile(params)
      Mixpanel.track('HikerProfile:Create')
      return res.data
    },
    onSuccess: created => {
      // Write into the cache directly: route guards read this query via
      // ensureQueryData (cached, no refetch), and during onboarding there is
      // no mounted observer for invalidateQueries to refetch — leaving a
      // stale empty array that bounces users back to /onboarding.
      queryClient.setQueryData(
        hikerProfilesQueryOptions.queryKey,
        (old: typeof created[] | undefined) =>
          old ? [...old, created] : [created]
      )
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
      Mixpanel.track('HikerProfile:Update')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HIKER_PROFILES_QUERY] })
      toast({ title: 'Hiker profile updated' })
    },
  })
}
