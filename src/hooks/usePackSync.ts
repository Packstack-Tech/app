import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useCreatePack, useUpdatePack } from '@/queries/pack'

export function usePackSync(tripId?: number) {
  const { toast } = useToast()
  const { packs, synced, isDragging, markSynced, assignPackId } = useTripPacks(
    useShallow(store => ({
      packs: store.packs,
      synced: store.synced,
      isDragging: store.isDragging,
      markSynced: store.markSynced,
      assignPackId: store.assignPackId,
    }))
  )
  const createPack = useCreatePack()
  const updatePack = useUpdatePack()

  const savingRef = useRef(false)

  useEffect(() => {
    if (!tripId || synced || isDragging || savingRef.current) return

    savingRef.current = true

    async function savePacks(id: number) {
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
                hiker_profile_id: pack.hiker_profile_id,
              })
              assignPackId(index, created.id)
            }
          })
        )
        markSynced()
      } catch {
        toast({ title: 'Failed to save pack' })
      } finally {
        savingRef.current = false
      }
    }

    savePacks(tripId)
  }, [tripId, synced, isDragging, packs])
}
