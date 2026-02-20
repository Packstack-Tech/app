import { FC } from 'react'

import { ScrollArea } from '@/components/ui/ScrollArea'
import { InventorySidebar } from '@/containers/InventorySidebar'
import { PackingList } from '@/containers/Trip/PackingList'
import { TripForm } from '@/containers/TripForm'
import { WeightBreakdown } from '@/containers/WeightBreakdown'
import { Trip } from '@/types/trip'

interface Props {
  trip?: Trip
}

export const Pack: FC<Props> = ({ trip }) => (
  <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden">
    <div className="md:flex-none md:w-64 md:border-r border-slate-100 dark:border-slate-900 min-h-0 bg-surface">
      <ScrollArea className="h-full">
        <div className="flex gap-3 md:gap-0 md:flex-col p-3 md:p-5">
          <TripForm trip={trip} />
          <WeightBreakdown />
        </div>
      </ScrollArea>
    </div>
    <div className="grow min-h-0">
      <ScrollArea className="h-full">
        <div className="p-3 md:p-5">
          <PackingList trip={trip} />
        </div>
      </ScrollArea>
    </div>
    <div className="md:flex-none md:w-64 md:border-l border-slate-100 dark:border-slate-900 flex flex-col min-h-0 h-full p-3 md:p-5 bg-surface">
      <InventorySidebar />
    </div>
  </div>
)
