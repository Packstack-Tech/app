import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/hooks/useUser'
import { FREE_TRIP_LIMIT } from '@/lib/consts'

export function useTripLimit() {
  const user = useUser()
  const { isSubscribed, openUpgrade } = useSubscription()

  // The server's count includes recently deleted trips (deleting doesn't free
  // a slot). Fall back to active trips if the API hasn't sent it.
  const tripLimitCount =
    user?.trip_limit_count ??
    (user?.trips ?? []).filter(t => !t.removed).length
  const canCreateTrip = isSubscribed || tripLimitCount < FREE_TRIP_LIMIT

  return { canCreateTrip, isSubscribed, tripLimitCount, openUpgrade }
}
