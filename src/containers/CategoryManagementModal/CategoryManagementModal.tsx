import {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Button, Input } from '@/components/ui'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import { useToast } from '@/hooks/useToast'
import {
  getCategoryConflict,
  useCreateCategory,
  useDeleteCategory,
  useMergeCategory,
  useMyCategories,
  useRenameCategory,
  useReorderCategories,
} from '@/queries/category'
import { MyCategory } from '@/types/category'

import { CategoryRow } from './Category'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type MergeState = {
  source: MyCategory
  /** Preselected (and fixed) target when a rename hit an existing name. */
  conflict?: { categoryId: number; name: string }
}

const itemsPhrase = (n: number) => `${n} item${n === 1 ? '' : 's'}`

export const CategoryManagementModal: FC<Props> = ({ open, onOpenChange }) => {
  const { toast } = useToast()
  const { data, isLoading, refetch } = useMyCategories()
  const createCategory = useCreateCategory()
  const renameCategory = useRenameCategory()
  const mergeCategory = useMergeCategory()
  const deleteCategory = useDeleteCategory()
  const reorderCategories = useReorderCategories()

  // Local copy so drag-and-drop can reorder before the save lands.
  const [order, setOrder] = useState<MyCategory[]>([])
  const [dragging, setDragging] = useState(false)
  const [newName, setNewName] = useState('')
  const [merging, setMerging] = useState<MergeState | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string>('')
  const [deleting, setDeleting] = useState<MyCategory | null>(null)

  // Item counts change whenever gear is edited; refresh on every open.
  useEffect(() => {
    if (open) void refetch()
  }, [open, refetch])

  useEffect(() => {
    if (data && !dragging) setOrder(data.categories)
  }, [data, dragging])

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setDragging(true)
    setOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(hoverIndex, 0, moved)
      return next
    })
  }, [])

  const orderRef = useRef(order)
  useEffect(() => {
    orderRef.current = order
  }, [order])

  const onDropped = useCallback(() => {
    const current = orderRef.current
    const saved = data?.categories ?? []
    const changed = current.some((c, i) => c.id !== saved[i]?.id)
    if (!changed) {
      setDragging(false)
      return
    }
    reorderCategories.mutate(
      current.map(c => c.id),
      {
        onError: () => {
          toast({ title: 'Failed to save category order' })
          setOrder(saved)
        },
        onSettled: () => setDragging(false),
      }
    )
  }, [data, reorderCategories, toast])

  const onRename = useCallback(
    async (category: MyCategory, name: string) => {
      try {
        await renameCategory.mutateAsync({ categoryId: category.category_id, name })
        return true
      } catch (error) {
        const conflict = getCategoryConflict(error)
        if (conflict) {
          setMergeTarget(String(conflict.category_id))
          setMerging({
            source: category,
            conflict: { categoryId: conflict.category_id, name: conflict.name },
          })
        } else {
          toast({ title: 'Failed to rename category' })
        }
        return false
      }
    },
    [renameCategory, toast]
  )

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    createCategory.mutate(name, {
      onSuccess: () => setNewName(''),
      onError: () => toast({ title: 'Failed to add category' }),
    })
  }

  const mergeOptions = useMemo(
    () => order.filter(c => c.id !== merging?.source.id),
    [order, merging]
  )

  const targetName = merging?.conflict
    ? merging.conflict.name
    : order.find(c => String(c.category_id) === mergeTarget)?.name

  const confirmMerge = () => {
    if (!merging || !mergeTarget) return
    const source = merging.source
    mergeCategory.mutate(
      {
        categoryId: source.category_id,
        intoCategoryId: Number(mergeTarget),
        source: merging.conflict ? 'rename_conflict' : 'menu',
      },
      {
        onSuccess: () => {
          toast({ title: `Merged "${source.name}" into "${targetName}"` })
          setMerging(null)
        },
        onError: () => toast({ title: 'Failed to merge categories' }),
      }
    )
  }

  const confirmDelete = () => {
    if (!deleting) return
    const category = deleting
    deleteCategory.mutate(
      {
        categoryId: category.category_id,
        itemCount: category.item_count + category.archived_count,
        shared: category.shared,
      },
      {
        onSuccess: () => toast({ title: `Deleted "${category.name}"` }),
        onError: () => toast({ title: 'Failed to delete category' }),
      }
    )
    setDeleting(null)
  }

  const deletingCount = deleting ? deleting.item_count + deleting.archived_count : 0

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
            <SheetDescription>
              Drag to reorder. Click a name to rename it. Use the menu to merge
              duplicates or delete.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={onCreate} className="flex gap-2 px-4">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New category"
              maxLength={50}
              className="h-8 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={!newName.trim() || createCategory.isPending}
            >
              Add
            </Button>
          </form>

          <ScrollArea className="flex-1 px-3" type="auto">
            {isLoading && !order.length ? (
              <p className="px-1 py-4 text-sm text-muted-foreground">Loading…</p>
            ) : !order.length ? (
              <p className="px-1 py-4 text-sm text-muted-foreground">
                No categories yet. Add one above, or pick one when editing an item.
              </p>
            ) : (
              <div className="space-y-0.5">
                {order.map((category, idx) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    idx={idx}
                    moveItem={moveItem}
                    onDropped={onDropped}
                    onRename={onRename}
                    onMerge={c => {
                      setMergeTarget('')
                      setMerging({ source: c })
                    }}
                    onDelete={setDeleting}
                    canMerge={order.length > 1}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <SheetFooter className="border-t pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={!!merging} onOpenChange={v => !v && setMerging(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {merging?.conflict ? (
                <>&ldquo;{merging.conflict.name}&rdquo; already exists</>
              ) : (
                <>Merge &ldquo;{merging?.source.name}&rdquo;</>
              )}
            </DialogTitle>
            <DialogDescription>
              {merging?.conflict ? (
                <>
                  Merge &ldquo;{merging.source.name}&rdquo; into &ldquo;
                  {merging.conflict.name}&rdquo; instead? Its{' '}
                  {itemsPhrase(merging.source.item_count + merging.source.archived_count)}{' '}
                  will move over and &ldquo;{merging.source.name}&rdquo; will be removed.
                </>
              ) : (
                <>
                  Move {itemsPhrase((merging?.source.item_count ?? 0) + (merging?.source.archived_count ?? 0))}{' '}
                  into another category and remove &ldquo;{merging?.source.name}&rdquo;.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {!merging?.conflict && (
            <div className="grid gap-1.5 px-6 py-4">
              <Label htmlFor="merge-target">Merge into</Label>
              <Select value={mergeTarget} onValueChange={setMergeTarget}>
                <SelectTrigger id="merge-target" className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {mergeOptions.map(c => (
                    <SelectItem key={c.id} value={String(c.category_id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setMerging(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmMerge}
              disabled={!mergeTarget || mergeCategory.isPending}
            >
              {mergeCategory.isPending ? 'Merging…' : 'Merge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={v => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCount
                ? `Its ${itemsPhrase(deletingCount)} will become uncategorized. To keep them grouped, merge it into another category instead.`
                : 'This category has no items.'}
              {deleting?.shared &&
                ' It will still be available to pick when editing an item.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogDestructiveAction onClick={confirmDelete}>
              Delete
            </AlertDialogDestructiveAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
