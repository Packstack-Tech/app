import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { shallow } from 'zustand/shallow'

import { Loading } from '@/components/ui/Loading'
import { initPack, useTripPacks } from '@/hooks/useTripPacks'
import { useTripPacksQuery } from '@/queries/pack'
import { useTripQuery } from '@/queries/trip'

import { Pack } from './Pack'

export const PackPage = () => {
  const { id } = useParams()
  const { setPacks } = useTripPacks(
    store => ({
      setPacks: store.setPacks,
    }),
    shallow
  )
  const { data: tripData, isLoading: tripLoading } = useTripQuery(id)
  const { data: packsData, isLoading: packsLoading } = useTripPacksQuery(id)

  useEffect(() => {
    if (packsData) {
      setPacks(packsData)
    }
    if (!id) {
      setPacks([initPack])
    }
  }, [setPacks, packsData, id])

  if (tripLoading || packsLoading)
    return (
      <div className="h-screen">
        <Loading />
      </div>
    )

  return <Pack trip={id ? tripData : undefined} />
}
