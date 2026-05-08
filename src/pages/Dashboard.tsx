import { FC, useMemo } from 'react'
import { isAfter, isSameDay, startOfDay } from 'date-fns'

import { ScrollArea } from '@/components/ui/ScrollArea'
import { GearSnapshot } from '@/containers/Dashboard/GearSnapshot'
import { HikerProfiles } from '@/containers/Dashboard/HikerProfiles'
import { NeedsAttention } from '@/containers/Dashboard/NeedsAttention'
import { PastTrips } from '@/containers/Dashboard/PastTrips'
import { Preferences } from '@/containers/Dashboard/Preferences'
import { ProUpsell } from '@/containers/Dashboard/ProUpsell'
import { SetupChecklist } from '@/containers/Dashboard/SetupChecklist'
import { UpcomingTrips } from '@/containers/Dashboard/UpcomingTrips'
import { useUser } from '@/hooks/useUser'
import { Trip } from '@/types/trip'

export const Dashboard: FC = () => {
  const user = useUser()
  const trips = user.trips || []

  const { upcoming, past } = useMemo(() => {
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
  }, [trips])

  return (
    <div className="flex flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-0 p-6">
          <UpcomingTrips trips={upcoming} totalTrips={trips.length} />
          <PastTrips trips={past} />
        </div>
      </ScrollArea>
      <ScrollArea className="w-80 shrink-0 border-l border-border min-h-0 bg-card">
        <div className="flex flex-col">
          <SetupChecklist />
          <NeedsAttention />
          <HikerProfiles />
          <Preferences />
          <ProUpsell />
          <GearSnapshot />
        </div>
      </ScrollArea>
    </div>
  )
}
