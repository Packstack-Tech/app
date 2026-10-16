import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useQuery } from '@tanstack/react-query'
import { useMatch } from '@tanstack/react-router'

import { useTripPacks } from '@/hooks/useTripPacks'
import { tripPacksQueryOptions } from '@/queries/pack'
import { useTripQuery } from '@/queries/trip'

import { Pack } from './Pack'

export const PackPage = () => {
  const { setPacks, refreshPacks } = useTripPacks(
    useShallow(store => ({ setPacks: store.setPacks, refreshPacks: store.refreshPacks }))
  )

  const packMatch = useMatch({ from: '/_app/pack/$id', shouldThrow: false })
  const tripId = packMatch?.loaderData?.trip?.id

  const { data: trip } = useTripQuery(tripId)

  // The loader's query (same key, so it starts from the loader's data), kept
  // live: a window-focus refetch or a save's invalidation lands here. The
  // store used to be set from loader data alone, so a tab left open kept its
  // first copy for good — and its next save put that copy back.
  const { data: packs } = useQuery({
    ...tripPacksQueryOptions(packMatch?.params.id ?? ''),
    enabled: !!packMatch,
  })

  useEffect(() => {
    if (!packs || !tripId) return
    // A different trip replaces the store; the same one only takes newer
    // server data, and only while nothing here is unsaved.
    if (useTripPacks.getState().loadedTripId !== tripId) {
      setPacks(packs, tripId)
    } else {
      refreshPacks(packs, tripId)
    }
  }, [setPacks, refreshPacks, packs, tripId])

  if (!trip) return null

  return <Pack trip={trip} />
}
