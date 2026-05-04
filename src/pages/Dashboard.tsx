import { FC, useMemo } from 'react'
import { isAfter, isSameDay, startOfDay } from 'date-fns'

import { GearSnapshot } from '@/containers/Dashboard/GearSnapshot'
import { NeedsAttention } from '@/containers/Dashboard/NeedsAttention'
import { PastTrips } from '@/containers/Dashboard/PastTrips'
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <div className="flex flex-col gap-8">
          <UpcomingTrips trips={upcoming} totalTrips={trips.length} />
          <PastTrips trips={past} />
        </div>
        <div className="flex flex-col gap-6">
          <SetupChecklist />
          <NeedsAttention />
          <ProUpsell />
          <GearSnapshot />
        </div>
      </div>
    </div>
  )
}
