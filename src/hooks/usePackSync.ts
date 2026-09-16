import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useCreatePack, useUpdatePack } from '@/queries/pack'

export function usePackSync(tripId?: number) {
  const { toast } = useToast()
  const {
    packs,
    synced,
    isDragging,
    loadedTripId,
    revision,
    markSynced,
    assignPackId,
  } = useTripPacks(
    useShallow(store => ({
      packs: store.packs,
      synced: store.synced,
      isDragging: store.isDragging,
      loadedTripId: store.loadedTripId,
      revision: store.revision,
      markSynced: store.markSynced,
      assignPackId: store.assignPackId,
    }))
  )
  const createPack = useCreatePack()
  const updatePack = useUpdatePack()

  const savingRef = useRef(false)
  const errorShownRef = useRef(false)
  // Retriggers the effect when a save finished without covering everything.
  // savingRef is a ref, so edits arriving mid-save schedule nothing on their
  // own — without this they would sit unsaved until the next unrelated edit.
  const [saveTick, setSaveTick] = useState(0)

  useEffect(() => {
    // The store is a singleton, and PackPage sets it from a *parent* effect —
    // which React runs after this child effect. So on navigating between
    // trips while unsynced, this would otherwise fire with the previous
    // trip's packs and the new trip's id, PUTting those packs across to the
    // new trip. Wait until the store is known to hold this trip's packs.
    if (loadedTripId !== tripId) return

    if (!tripId || synced || isDragging || savingRef.current) return

    savingRef.current = true

    async function savePacks(id: number, sentRevision: number) {
      try {
        await Promise.all(
          packs.map(async (pack, index) => {
            if (pack.id) {
              await updatePack.mutateAsync({
                id: pack.id,
                data: { ...pack, trip_id: id },
              })
            } else {
              const created = await createPack.mutateAsync({
                title: pack.title,
                items: pack.items,
                trip_id: id,
              })
              assignPackId(index, created.id, id)
            }
          })
        )
        // False when a different trip loaded, or edits landed mid-flight.
        const covered = markSynced(id, sentRevision)
        if (!covered) {
          // Only this branch retriggers. Bumping after a failure too would
          // retry a permanently-failing save in a tight loop.
          setSaveTick(tick => tick + 1)
        }
        errorShownRef.current = false
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status
        const detail = (error as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail
        // Once per failure run: the effect retries on every subsequent edit,
        // and a toast per attempt would bury the screen.
        if (!errorShownRef.current) {
          errorShownRef.current = true
          toast({
            title: status === 402 ? 'Upgrade required' : 'Failed to save pack',
            description:
              status === 402
                ? detail
                : 'Your changes are still here and will retry.',
          })
        }
      } finally {
        savingRef.current = false
      }
    }

    savePacks(tripId, revision)
  }, [tripId, synced, isDragging, packs, loadedTripId, revision, saveTick])
}
