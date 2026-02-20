import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useBlocker, useMatch } from '@tanstack/react-router'

import { initPack, useTripPacks } from '@/hooks/useTripPacks'
import { Pack } from './Pack'

export const PackPage = () => {
  const { setPacks, packs: storePacks } = useTripPacks(
    useShallow(store => ({
      setPacks: store.setPacks,
      packs: store.packs,
    }))
  )

  // Check if we're on the /pack/$id route (vs /pack/new)
  const packMatch = useMatch({ from: '/_app/pack/$id', shouldThrow: false })
  const loaderData = packMatch?.loaderData
  const trip = loaderData?.trip
  const packs = loaderData?.packs

  const isNewPack = !packMatch
  const hasUnsavedWork =
    isNewPack && storePacks.some(p => p.items.length > 0 || p.title !== 'New pack')

  useBlocker({
    shouldBlockFn: () => {
      if (!hasUnsavedWork) return false
      return !window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
    },
    enableBeforeUnload: hasUnsavedWork,
  })

  useEffect(() => {
    if (packs) {
      setPacks(packs)
    }
    if (!packMatch) {
      // /pack/new route
      setPacks([initPack])
    }
  }, [setPacks, packs, packMatch])

  // No loading state needed -- route loader already ensured data
  return <Pack trip={trip} />
}
