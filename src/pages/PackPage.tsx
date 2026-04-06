import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMatch } from '@tanstack/react-router'

import { useTripPacks } from '@/hooks/useTripPacks'
import { useTripQuery } from '@/queries/trip'
import { Pack } from './Pack'

export const PackPage = () => {
  const setPacks = useTripPacks(
    useShallow(store => store.setPacks)
  )

  const packMatch = useMatch({ from: '/_app/pack/$id', shouldThrow: false })
  const loaderData = packMatch?.loaderData
  const packs = loaderData?.packs
  const tripId = loaderData?.trip?.id

  const { data: trip } = useTripQuery(tripId)

  useEffect(() => {
    if (packs) {
      setPacks(packs)
    }
  }, [setPacks, packs])

  if (!trip) return null

  return <Pack trip={trip} />
}
