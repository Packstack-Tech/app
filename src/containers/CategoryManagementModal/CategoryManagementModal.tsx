import { FC, useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { useSaveCategoryChanges } from '@/queries/item'

import { CategoryRow } from './Category'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CategoryManagementModal: FC<Props> = ({ open, onOpenChange }) => {
  const initCategories = useCategorizedItems({})
  const saveCategoryChanges = useSaveCategoryChanges()
  const [categories, setCategories] = useState(initCategories)
  const [renames, setRenames] = useState<Record<number, string>>({})

  useEffect(() => {
    if (open) {
      setCategories(initCategories)
      setRenames({})
    }
  }, [open, initCategories])

  const moveItem = useCallback(
    (dragIndex: number | undefined, hoverIndex: number) => {
      if (dragIndex === undefined) return

      setCategories(prev => {
        const newItems = [...prev]
        const dragItem = newItems[dragIndex]
        newItems.splice(dragIndex, 1)
        newItems.splice(hoverIndex, 0, dragItem)
        return newItems
      })
    },
    []
  )

  const onNameChange = useCallback(
    (categoryId: number, newName: string) => {
      setRenames(prev => ({ ...prev, [categoryId]: newName }))
    },
    []
  )

  const handleSave = () => {
    saveCategoryChanges.mutate(
      { categories, renames },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Manage Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-2" type="auto">
          <div className="space-y-1">
            {categories.map((rec, idx) => (
              <CategoryRow
                key={rec.category?.category_id || 'uncategorized'}
                moveItem={moveItem}
                category={rec}
                idx={idx}
                editable={!!rec.category}
                renamedValue={
                  rec.category
                    ? renames[rec.category.category.id]
                    : undefined
                }
                onNameChange={onNameChange}
              />
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveCategoryChanges.isPending}
          >
            {saveCategoryChanges.isPending ? 'Saving...' : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
