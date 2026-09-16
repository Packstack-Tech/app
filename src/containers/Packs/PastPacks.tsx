import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import { Trip } from '@/types/trip'

import { PackCard } from './PackCard'
import { SectionLabel } from './SectionLabel'

const INITIAL_SHOW = 9

type Props = {
  trips: Trip[]
  /** Show a "Past" heading — only needed when an Upcoming section sits above. */
  labeled?: boolean
}

export const PastPacks: FC<Props> = ({ trips, labeled }) => {
  const [expanded, setExpanded] = useState(false)

  if (trips.length === 0) return null

  const visible = expanded ? trips : trips.slice(0, INITIAL_SHOW)
  const hasMore = trips.length > INITIAL_SHOW

  return (
    <section>
      {labeled && <SectionLabel count={trips.length}>Past</SectionLabel>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(trip => (
          <PackCard key={trip.id} trip={trip} />
        ))}
      </div>

      {hasMore && !expanded && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setExpanded(true)}
          >
            Show all {trips.length} packs
          </Button>
        </div>
      )}
    </section>
  )
}
