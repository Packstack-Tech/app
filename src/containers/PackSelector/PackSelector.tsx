import { FC, useMemo, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'
import { useDeletePack } from '@/queries/pack'
import { TripPackRecord } from '@/types/pack'

import { DeletePackDialog } from './DeletePackDialog'
import { EditPackDialog } from './EditPackDialog'

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface Props {
  pack: TripPackRecord
  canDelete: boolean
}

export const PackSelector: FC<Props> = ({ pack, canDelete }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deletePack = useDeletePack()
  const { data: profiles } = useHikerProfilesQuery()
  const { selectedIndex, selectPack, updatePack, removePack } = useTripPacks(
    useShallow(store => ({
      selectedIndex: store.selectedIndex,
      selectPack: store.selectPack,
      updatePack: store.updatePack,
      removePack: store.removePack,
    }))
  )

  const assignedProfile = useMemo(
    () => profiles?.find(p => p.id === pack.hiker_profile_id) ?? null,
    [profiles, pack.hiker_profile_id],
  )

  const isSelected = selectedIndex === pack.index
  const selectedStyle = isSelected ? 'border-primary' : ''

  const handleEdit = (value: string, hikerProfileId: number | null) => {
    const packName = value.trim()
    if (!packName) return
    updatePack(pack.index, 'title', packName)
    updatePack(pack.index, 'hiker_profile_id', hikerProfileId)
    setEditOpen(false)
  }

  const handleDelete = () => {
    if (pack.id) {
      deletePack.mutate(pack.id)
    }
    removePack(pack.index)
    setDeleteOpen(false)
  }

  return (
    <div>
      <div className={`border rounded-sm flex items-center cursor-pointer hover:shadow-[0_0_8px] hover:shadow-ring/35 transition-shadow ${selectedStyle}`}>
        <button
          className="text-sm semibold px-2 py-1 cursor-pointer inline-flex items-center gap-1.5"
          disabled={isSelected}
          onClick={() => selectPack(pack.index)}
        >
          {pack.title}
          {assignedProfile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold leading-none">
                  {getInitials(assignedProfile.name)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {assignedProfile.name}
              </TooltipContent>
            </Tooltip>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-1 cursor-pointer">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditPackDialog
        title={pack.title}
        hikerProfileId={pack.hiker_profile_id}
        profiles={profiles}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
      />

      <DeletePackDialog
        title={pack.title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
