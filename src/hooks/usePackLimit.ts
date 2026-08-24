import { useShallow } from 'zustand/react/shallow'

import { useSubscription } from '@/hooks/useSubscription'
import { useTripPacks } from '@/hooks/useTripPacks'
import { FREE_PACKS_PER_TRIP } from '@/lib/consts'

/**
 * Free users get one pack per trip; Pro unlocks more. Mirrors useKitLimit —
 * gate the add action and call openUpgrade() on block.
 *
 * Counts the packs held in the editor store rather than the server, so the
 * gate reflects unsaved additions too. Trips that already hold more packs than
 * the limit keep them — this only blocks adding another.
 */
export function usePackLimit() {
  const { packs } = useTripPacks(useShallow(store => ({ packs: store.packs })))
  const { isSubscribed, openUpgrade } = useSubscription()

  const packCount = packs.length
  const canAddPack = isSubscribed || packCount < FREE_PACKS_PER_TRIP

  return { canAddPack, isSubscribed, packCount, openUpgrade }
}
