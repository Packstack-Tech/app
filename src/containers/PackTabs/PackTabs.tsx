import { FC } from "react"
import { Plus } from "lucide-react"
import { PackSelector } from "@/containers/PackSelector"
import { TripPackRecord } from "@/types/pack"
import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"

interface Props {
  packs: TripPackRecord[]
}

export const PackTabs: FC<Props> = ({ packs }) => {
  const { addPack } = useTripPacks(
    (store) => ({
      addPack: store.addPack,
    }),
    shallow
  )

  return (
    <div className="flex flex-row gap-2">
      {packs.map((pack) => (
        <PackSelector key={pack.index} pack={pack} />
      ))}
      <button
        className={`border rounded-sm text-sm semibold px-2 py-1`}
        onClick={() => addPack()}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
