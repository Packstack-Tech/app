import { FC, useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { useUpdateCategorySort } from '@/queries/item'

import { Category } from './Category'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CategoryManagementModal: FC<Props> = ({ open, onOpenChange }) => {
  const initCategories = useCategorizedItems({})
  const updateCategorySort = useUpdateCategorySort()
  const [categories, setCategories] = useState(initCategories)

  useEffect(() => {
    setCategories(initCategories)
  }, [initCategories, setCategories])

  const moveItem = (dragIndex: number | undefined, hoverIndex: number) => {
    if (dragIndex === undefined) return

    setCategories(prev => {
      const newItems = [...prev]
      const dragItem = newItems[dragIndex]
      newItems.splice(dragIndex, 1)
      newItems.splice(hoverIndex, 0, dragItem)
      return newItems
    })
  }

  const onDropItem = () => {
    const sortOrder = categories
      .filter(rec => !!rec.category)
      .map((category, idx) => ({
        id: category.category?.id || 0,
        sort_order: idx,
      }))
    updateCategorySort.mutate(sortOrder)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>Category Order</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] w-[100%]" type="auto">
          {categories.map((rec, idx) => (
            <Category
              key={rec.category?.category_id || 'uncategorized'}
              moveItem={moveItem}
              onDropItem={onDropItem}
              category={rec}
              idx={idx}
              disabled={updateCategorySort.isPending || !rec.category}
            />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
