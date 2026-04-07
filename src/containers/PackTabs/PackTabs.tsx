import { FC, useState } from 'react'
import { Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { PackSelector } from '@/containers/PackSelector'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'
import { TripPackRecord } from '@/types/pack'

import { NewPackDialog } from './NewPackDialog'

interface Props {
  packs: TripPackRecord[]
}

export const PackTabs: FC<Props> = ({ packs }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { addPack } = useTripPacks(
    useShallow(store => ({
      addPack: store.addPack,
    }))
  )
  const { data: profiles } = useHikerProfilesQuery()

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {packs.map(pack => (
        <PackSelector key={pack.index} pack={pack} canDelete={packs.length > 1} />
      ))}
      <button
        className={`border rounded-sm text-sm semibold px-2 py-1 h-[30px] w-[30px] flex items-center justify-center cursor-pointer hover:shadow-[0_0_8px] hover:shadow-ring/35 transition-shadow`}
        onClick={() => setDialogOpen(true)}
      >
        <Plus size={16} />
      </button>

      <NewPackDialog
        open={dialogOpen}
        profiles={profiles}
        onClose={() => setDialogOpen(false)}
        onSave={(title, hikerProfileId) => addPack(title, hikerProfileId)}
      />
    </div>
  )
}
