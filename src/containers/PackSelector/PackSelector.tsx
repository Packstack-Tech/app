import { FC, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useDeletePack } from '@/queries/pack'
import { TripPackRecord } from '@/types/pack'

import { DeletePackDialog } from './DeletePackDialog'
import { EditPackDialog } from './EditPackDialog'

interface Props {
  pack: TripPackRecord
}

export const PackSelector: FC<Props> = ({ pack }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deletePack = useDeletePack()
  const { selectedIndex, selectPack, updatePack, removePack } = useTripPacks(
    useShallow(store => ({
      selectedIndex: store.selectedIndex,
      selectPack: store.selectPack,
      updatePack: store.updatePack,
      removePack: store.removePack,
    }))
  )

  const isSelected = selectedIndex === pack.index
  const selectedStyle = isSelected ? 'border-primary' : ''

  const handleEdit = (value: string) => {
    const packName = value.trim()
    if (!packName) return
    updatePack(pack.index, 'title', packName)
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
      <div className={`border rounded-sm flex items-center ${selectedStyle}`}>
        <button
          className={`text-sm semibold px-2 py-1`}
          disabled={isSelected}
          onClick={() => selectPack(pack.index)}
        >
          {pack.title}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-1">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditPackDialog
        title={pack.title}
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
