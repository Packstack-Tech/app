import { FC } from 'react'

import { PackingLists } from '@/containers/PackingLists'
import { useUser } from '@/hooks/useUser'

export const Dashboard: FC = () => {
  const user = useUser()

  const activeTrips = user.trips?.filter(trip => !trip.removed) || []

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <PackingLists trips={activeTrips} />
    </div>
  )
}
