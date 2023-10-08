import { FC } from "react"
import { InventorySidebar } from "@/containers/InventorySidebar"
import { PackingList } from "@/containers/Trip/PackingList"
import { TripForm } from "@/containers/TripForm"
import { Trip } from "@/types/trip"
import { WeightBreakdown } from "@/containers/WeightBreakdown"

interface Props {
  trip?: Trip
}

export const Pack: FC<Props> = ({ trip }) => (
  <div className="flex">
    <div className="flex-none w-64 p-4 border-r border-slate-900">
      <TripForm trip={trip} />
      <WeightBreakdown />
    </div>
    <div className="grow p-4">
      <PackingList trip={trip} />
    </div>
    <div className="flex-none w-64 border-l border-slate-900 p-4">
      <InventorySidebar />
    </div>
  </div>
)
