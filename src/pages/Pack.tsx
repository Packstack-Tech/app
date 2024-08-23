import { FC } from 'react'

import { InventorySidebar } from '@/containers/InventorySidebar'
import { PackingList } from '@/containers/Trip/PackingList'
import { TripForm } from '@/containers/TripForm'
import { WeightBreakdown } from '@/containers/WeightBreakdown'
import { Trip } from '@/types/trip'

interface Props {
  trip?: Trip
}

export const Pack: FC<Props> = ({ trip }) => (
  <div className="flex flex-col md:flex-row">
    <div className="flex gap-3 md:gap-0 md:flex-none md:flex-col p-2 md:w-64 md:p-4 md:border-r border-slate-100 dark:border-slate-900">
      <TripForm trip={trip} />
      <WeightBreakdown />
    </div>
    <div className="grow p-2 md:p-4">
      <PackingList trip={trip} />
    </div>
    <div className="flex-none p-2 md:w-64 md:border-l border-slate-100 dark:border-slate-900 md:p-4">
      <InventorySidebar />
    </div>
  </div>
)
