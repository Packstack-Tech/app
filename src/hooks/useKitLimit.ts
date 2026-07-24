import { useSubscription } from '@/hooks/useSubscription'
import { FREE_KIT_LIMIT } from '@/lib/consts'
import { useKits } from '@/queries/kit'

/**
 * Free users get one kit; Pro unlocks unlimited. Mirrors useTripLimit —
 * gate additive actions (create/clone) and call openUpgrade() on block.
 */
export function useKitLimit() {
  const { data: kits } = useKits()
  const { isSubscribed, openUpgrade } = useSubscription()

  const kitCount = kits?.length ?? 0
  const canCreateKit = isSubscribed || kitCount < FREE_KIT_LIMIT

  return { canCreateKit, isSubscribed, kitCount, openUpgrade }
}
