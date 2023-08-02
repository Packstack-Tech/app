import { useParams } from "react-router-dom"
import { InventorySidebar } from "@/containers/InventorySidebar"
import { PackingList } from "@/containers/Trip/PackingList"
import { TripForm } from "@/containers/TripForm"

export const PackPage = () => {
  const { id } = useParams()
  return (
    <div className="flex">
      <div className="flex-none w-64 p-4 border-r border-slate-900">
        <TripForm />
      </div>
      <div className="grow p-4">
        <PackingList />
      </div>
      <div className="flex-none w-64 border-l border-slate-900 p-4">
        <InventorySidebar />
      </div>
    </div>
  )
}
