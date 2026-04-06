import { FC } from 'react'

import { ScrollArea } from '@/components/ui/ScrollArea'
import { InventorySidebar } from '@/containers/InventorySidebar'
import { PackingList } from '@/containers/Trip/PackingList'
import { Trip } from '@/types/trip'

interface Props {
  trip: Trip
}

export const PackingView: FC<Props> = ({ trip }) => (
  <div className="flex flex-1 overflow-hidden">
    <div className="grow min-h-0">
      <ScrollArea className="h-full">
        <div className="p-3 md:p-3">
          <PackingList trip={trip} />
        </div>
      </ScrollArea>
    </div>
    <div className="md:flex-none md:w-64 md:border-l border-border flex flex-col min-h-0 h-full p-2 md:p-2 bg-card">
      <InventorySidebar />
    </div>
  </div>
)
