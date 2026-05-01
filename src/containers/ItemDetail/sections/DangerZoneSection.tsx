import { FC } from 'react'
import { Archive, ArchiveRestore } from 'lucide-react'

import { Button } from '@/components/ui'
import { useUpdateItem } from '@/queries/item'
import { Item } from '@/types/item'

interface Props {
  item: Item
  onComplete: () => void
}

export const DangerZoneSection: FC<Props> = ({ item, onComplete }) => {
  const updateItem = useUpdateItem()

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

  return (
    <section>
      <h2 className="text-base font-semibold text-destructive mb-4">Danger Zone</h2>
      <div className="rounded-lg border border-destructive/30 p-4">
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
      </div>
    </section>
  )
}
