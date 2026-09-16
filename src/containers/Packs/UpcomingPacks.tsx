import { FC } from 'react'

import { Trip } from '@/types/trip'

import { PackCard } from './PackCard'
import { SectionLabel } from './SectionLabel'

type Props = {
  trips: Trip[]
}

/** Rendered only when there is at least one upcoming trip. */
export const UpcomingPacks: FC<Props> = ({ trips }) => {
  if (trips.length === 0) return null

  return (
    <section>
      <SectionLabel count={trips.length}>Upcoming</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map(trip => (
          <PackCard key={trip.id} trip={trip} highlight showCountdown />
        ))}
      </div>
    </section>
  )
}
