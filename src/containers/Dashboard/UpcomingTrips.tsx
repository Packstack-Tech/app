import { FC, useState } from 'react'
import { Map, PlusIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui'
import { NewTripModal } from '@/containers/NewTripModal'
import { Trip } from '@/types/trip'

import { TripCard } from './TripCard'

type Props = {
  trips: Trip[]
  totalTrips: number
}

export const UpcomingTrips: FC<Props> = ({ trips, totalTrips }) => {
  const navigate = useNavigate()
  const [showNewTrip, setShowNewTrip] = useState(false)

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {trips.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
          </span>
        )}
      </div>

      {trips.length === 0 && totalTrips === 0 && (
        <EmptyState icon={Map} heading="No packing lists yet">
          <p className="mb-4">
            Create a pack to organize your gear with detailed weight breakdowns.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/inventory' })}
            >
              Manage Inventory
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => setShowNewTrip(true)}
            >
              <PlusIcon size={14} /> Create Pack
            </Button>
          </div>
        </EmptyState>
      )}
      <NewTripModal open={showNewTrip} onOpenChange={setShowNewTrip} />

      {trips.length === 0 && totalTrips > 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No upcoming trips scheduled.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} showCountdown />
        ))}
      </div>
    </div>
  )
}
