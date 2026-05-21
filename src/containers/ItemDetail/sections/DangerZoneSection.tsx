import { FC, useState } from 'react'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui'
import { usePermanentlyDeleteItem, useUpdateItem } from '@/queries/item'
import { Item } from '@/types/item'

interface Props {
  item: Item
  onComplete: () => void
}

export const DangerZoneSection: FC<Props> = ({ item, onComplete }) => {
  const updateItem = useUpdateItem()
  const permanentlyDelete = usePermanentlyDeleteItem()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleArchive = () => {
    updateItem.mutate(
      { ...item, name: item.name, id: item.id, removed: true } as any,
      { onSuccess: onComplete }
    )
  }

  const handleRestore = () => {
    updateItem.mutate(
      { ...item, name: item.name, id: item.id, removed: false } as any,
      { onSuccess: onComplete }
    )
  }

  const handleDelete = () => {
    permanentlyDelete.mutate(item.id, { onSuccess: onComplete })
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-destructive mb-4">Danger Zone</h2>
      <div className="rounded-lg border border-destructive/30 p-4 space-y-4">
        {item.removed ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Restore item</p>
              <p className="text-xs text-muted-foreground">This item is archived. Restore it to make it active again.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRestore} disabled={updateItem.isPending}>
              <ArchiveRestore size={14} /> Restore
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Archive item</p>
              <p className="text-xs text-muted-foreground">Remove this item from your active gear closet.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleArchive} disabled={updateItem.isPending}>
              <Archive size={14} /> Archive
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Permanently delete</p>
            <p className="text-xs text-muted-foreground">
              This item will be removed from your gear closet permanently. Packing lists that reference it will still show its name.
            </p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={permanentlyDelete.isPending}>
                <Trash2 size={14} /> Confirm
              </Button>
            </div>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
