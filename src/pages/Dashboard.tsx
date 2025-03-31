import { FC } from 'react'

import { PackingLists } from '@/containers/PackingLists'
import { useUser } from '@/hooks/useUser'

export const Dashboard: FC = () => {
  const user = useUser()

  const activeTrips = user.trips?.filter(trip => !trip.removed) || []

  return (
    <div className="mx-2 md:max-w-lg md:mx-auto my-8">
      <PackingLists trips={activeTrips} />
    </div>
  )
}
