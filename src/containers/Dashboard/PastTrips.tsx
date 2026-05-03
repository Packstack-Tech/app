import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import { Trip } from '@/types/trip'

import { TripCard } from './TripCard'

const INITIAL_SHOW = 3

type Props = {
  trips: Trip[]
}

export const PastTrips: FC<Props> = ({ trips }) => {
  const [expanded, setExpanded] = useState(false)

  if (trips.length === 0) return null

  const visible = expanded ? trips : trips.slice(0, INITIAL_SHOW)
  const hasMore = trips.length > INITIAL_SHOW

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Past Trips</h2>
        <span className="text-sm text-muted-foreground">
          {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {hasMore && !expanded && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-muted-foreground"
          onClick={() => setExpanded(true)}
        >
          View all {trips.length} trips
        </Button>
      )}
    </div>
  )
}
