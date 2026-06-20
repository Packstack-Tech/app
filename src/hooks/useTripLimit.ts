import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/hooks/useUser'
import { FREE_TRIP_LIMIT } from '@/lib/consts'

export function useTripLimit() {
  const user = useUser()
  const { isSubscribed, openUpgrade } = useSubscription()

  const activeTripCount = (user?.trips ?? []).filter(t => !t.removed).length
  const canCreateTrip = isSubscribed || activeTripCount < FREE_TRIP_LIMIT

  return { canCreateTrip, isSubscribed, activeTripCount, openUpgrade }
}
