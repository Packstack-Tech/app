import { useSubscription } from '@/hooks/useSubscription'
import { FREE_HIKER_PROFILE_LIMIT } from '@/lib/consts'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'

/**
 * Free users get one hiker profile; Pro unlocks more. Mirrors useKitLimit.
 * Onboarding is unaffected — the first profile is always allowed.
 */
export function useHikerProfileLimit() {
  const { data: profiles } = useHikerProfilesQuery()
  const { isSubscribed, openUpgrade } = useSubscription()

  const profileCount = profiles?.length ?? 0
  const canCreateProfile =
    isSubscribed || profileCount < FREE_HIKER_PROFILE_LIMIT

  return { canCreateProfile, isSubscribed, profileCount, openUpgrade }
}
