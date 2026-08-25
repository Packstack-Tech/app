import { FC, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useUser } from '@/hooks/useUser'
import { convertWeight, getItemDisplayUnit } from '@/lib/weight'
import { useInventory, usePermanentlyDeleteItem } from '@/queries/item'
import { Item, Unit } from '@/types/item'

const RECENT_LIMIT = 5

type Props = {
  /** Opens the edit form for a row. */
  onEdit: (item: Item) => void
}

/**
 * The five most recently created items, all-time — not just this session.
 *
 * Mirrors the mobile add-gear screen: the list doubles as confirmation that an
 * add landed and as the way to fix a mis-click without leaving the search.
 *
 * Derived from the inventory query the app already holds rather than a
 * dedicated endpoint — GET /items returns everything, so this costs nothing.
 */
export const RecentlyAddedGear: FC<Props> = ({ onEdit }) => {
  const { data: items } = useInventory()
  const user = useUser()
  const itemUnit = getItemDisplayUnit(user.unit_weight)
  const permanentlyDelete = usePermanentlyDeleteItem()
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null)

  const recent = useMemo(() => {
    if (!items?.length) return []
    return [...items]
      .sort((a, b) => {
        const at = a.created_at ? Date.parse(a.created_at) : 0
        const bt = b.created_at ? Date.parse(b.created_at) : 0
        // Ties broken by id: created_at has second resolution on some rows, so
        // items added in one burst would otherwise reshuffle on re-render.
        return bt - at || b.id - a.id
      })
      .slice(0, RECENT_LIMIT)
  }, [items])

  if (recent.length === 0) return null

  return (
    <div className="mt-4 pt-3 border-t border-border">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
        Recently added
      </p>
      <ul>
        {recent.map(item => {
          const secondary = [item.brand?.name, item.product?.name]
            .filter(Boolean)
            .join(' · ')
          const weight =
            item.weight != null && item.unit
              ? convertWeight(item.weight, item.unit as Unit, itemUnit).display
              : null

          return (
            <li key={item.id} className="group flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="min-w-0 flex-1 flex items-center justify-between gap-3 py-1.5 px-1 text-left rounded-sm hover:bg-accent transition-colors cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{item.name}</span>
                  {!!secondary && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {secondary}
                    </span>
                  )}
                </span>
                {!!weight && (
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {weight}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(item)}
                aria-label={`Delete ${item.name}`}
                // Visible on hover for pointer users, but focus-visible keeps
                // it reachable by keyboard, where there is no hover to trigger.
                className="shrink-0 p-1.5 rounded-sm text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive transition-opacity cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </li>
          )
        })}
      </ul>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={open => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gear?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            "{pendingDelete?.name}" will be removed from your gear closet.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogDestructiveAction
              onClick={() => {
                if (pendingDelete) permanentlyDelete.mutate(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogDestructiveAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
