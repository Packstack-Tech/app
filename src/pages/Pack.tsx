import { FC, useState } from 'react'

import { SidebarProvider } from '@/components/ui/sidebar'
import { PackingView } from '@/containers/PackingView/PackingView'
import { TripDetails } from '@/containers/TripDetails/TripDetails'
import { TripSidebar } from '@/containers/TripSidebar/TripSidebar'
import { usePackSync } from '@/hooks/usePackSync'
import { Trip } from '@/types/trip'

type TripView = 'packing' | 'details'

interface Props {
  trip: Trip
}

export const Pack: FC<Props> = ({ trip }) => {
  const [view, setView] = useState<TripView>('packing')

  usePackSync(trip.id)

  return (
    <SidebarProvider className="min-h-0 flex-1">
      <TripSidebar trip={trip} onEditDetails={() => setView('details')} />
      <div className="relative flex w-full flex-1 flex-col overflow-hidden bg-background">
        {view === 'packing' && <PackingView trip={trip} />}
        {view === 'details' && (
          <TripDetails trip={trip} onBack={() => setView('packing')} />
        )}
      </div>
    </SidebarProvider>
  )
}
