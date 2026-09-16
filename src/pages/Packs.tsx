import { FC, useMemo, useState } from 'react'
import { isAfter, isSameDay, startOfDay } from 'date-fns'
import { Map, PlusIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { NewTripModal } from '@/containers/NewTripModal'
import { PastPacks } from '@/containers/Packs/PastPacks'
import { UpcomingPacks } from '@/containers/Packs/UpcomingPacks'
import { useTripLimit } from '@/hooks/useTripLimit'
import { useUser } from '@/hooks/useUser'
import { Trip } from '@/types/trip'

export const PacksPage: FC = () => {
  const user = useUser()
  const navigate = useNavigate()
  const { canCreateTrip, openUpgrade } = useTripLimit()
  const [showNewTrip, setShowNewTrip] = useState(false)
  const { upcoming, past } = useMemo(() => {
    const trips = user.trips || []
    const today = startOfDay(new Date())
    const upcoming: Trip[] = []
    const past: Trip[] = []

    for (const trip of trips) {
      if (trip.removed) continue
      if (
        trip.start_date &&
        (isAfter(new Date(trip.start_date), today) ||
          isSameDay(new Date(trip.start_date), today))
      ) {
        upcoming.push(trip)
      } else {
        past.push(trip)
      }
    }

    upcoming.sort((a, b) => {
      if (!a.start_date) return 1
      if (!b.start_date) return -1
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    })

    past.sort((a, b) => {
      const aDate = a.start_date || a.created_at
      const bDate = b.start_date || b.created_at
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return { upcoming, past }
  }, [user.trips])

  const total = upcoming.length + past.length

  const onCreatePack = () => {
    if (canCreateTrip) {
      setShowNewTrip(true)
    } else {
      openUpgrade()
    }
  }

  return (
    <div className="flex flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1>Packs</h1>
              <p className="text-sm mt-0.5">
                {total === 0
                  ? 'Packing lists for your trips.'
                  : `${total} ${total === 1 ? 'pack' : 'packs'}`}
              </p>
            </div>
            {total > 0 && (
              <Button size="sm" className="gap-1" onClick={onCreatePack}>
                <PlusIcon size={14} /> New Pack
              </Button>
            )}
          </div>

          {total === 0 && (
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
                  Manage Gear Closet
                </Button>
                <Button size="sm" className="gap-1" onClick={onCreatePack}>
                  <PlusIcon size={14} /> Create Pack
                </Button>
              </div>
            </EmptyState>
          )}

          <UpcomingPacks trips={upcoming} />
          <PastPacks trips={past} labeled={upcoming.length > 0} />
        </div>
      </ScrollArea>
      <NewTripModal open={showNewTrip} onOpenChange={setShowNewTrip} />
    </div>
  )
}
