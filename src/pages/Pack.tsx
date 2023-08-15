import { FC } from "react"
import { InventorySidebar } from "@/containers/InventorySidebar"
import { PackingList } from "@/containers/Trip/PackingList"
import { TripForm } from "@/containers/TripForm"
import { Trip } from "@/types/trip"
import { Button } from "@/components/ui"

interface Props {
  trip?: Trip
}

export const Pack: FC<Props> = ({ trip }) => (
  <div className="flex">
    <div className="flex-none w-64 p-4 border-r border-slate-900">
      <TripForm trip={trip} />
    </div>
    <div className="grow p-4">
      <PackingList />
    </div>
    <div className="flex-none w-64 border-l border-slate-900 p-4">
      <div className="flex justify-end mb-4">
        <Button type="submit" form="pack-form" variant="secondary">
          Save
        </Button>
      </div>
      <InventorySidebar />
    </div>
  </div>
)