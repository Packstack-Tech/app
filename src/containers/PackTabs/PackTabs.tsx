import { FC } from 'react'
import { Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { PackSelector } from '@/containers/PackSelector'
import { useTripPacks } from '@/hooks/useTripPacks'
import { TripPackRecord } from '@/types/pack'

interface Props {
  packs: TripPackRecord[]
}

export const PackTabs: FC<Props> = ({ packs }) => {
  const { addPack } = useTripPacks(
    useShallow(store => ({
      addPack: store.addPack,
    }))
  )

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {packs.map(pack => (
        <PackSelector key={pack.index} pack={pack} />
      ))}
      <button
        className={`border rounded-sm text-sm semibold px-2 py-1 h-[30px] w-[30px] flex items-center justify-center`}
        onClick={() => addPack()}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
