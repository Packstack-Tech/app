import { useSubscription } from '@/hooks/useSubscription'
import { useKits } from '@/queries/kit'

export function useKitsAccess() {
  const { isSubscribed, openUpgrade } = useSubscription()
  const { data: kits, isLoading } = useKits()

  // Grandfather rule: subscribers always have access; non-subscribers keep
  // access only if they already own at least one kit (created before the
  // paywall). Brand-new free users are gated.
  const kitsUnlocked = isSubscribed || (kits?.length ?? 0) > 0

  return { kitsUnlocked, isLoading, openUpgrade }
}
