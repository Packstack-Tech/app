import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { shallow } from "zustand/shallow"

import { Pack } from "./Pack"
import { useTripQuery } from "@/queries/trip"
import { useTripPacksQuery } from "@/queries/pack"
import { useTripPacks, initPack } from "@/hooks/useTripPacks"

export const PackPage = () => {
  const { id } = useParams()
  const { setPacks } = useTripPacks(
    (store) => ({
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

  if (tripLoading || packsLoading) return <div>Loading...</div>

  return <Pack trip={id ? tripData : undefined} />
}
