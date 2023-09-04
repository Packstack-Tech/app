import { useState, useEffect } from "react"
import { Button } from "@/components/ui"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/Dialog"
import { useCategorizedItems } from "@/hooks/useCategorizedItems"
import { Category } from "./Category"
import { useUpdateCategorySort } from "@/queries/item"
import { ScrollArea } from "@/components/ui/ScrollArea"

export const UpdateCategoryOrder = () => {
  const initCategories = useCategorizedItems({})
  const updateCategorySort = useUpdateCategorySort()
  const [categories, setCategories] = useState(initCategories)

  useEffect(() => {
    setCategories(initCategories)
  }, [initCategories, setCategories])

  const moveItem = (dragIndex: number | undefined, hoverIndex: number) => {
    if (dragIndex === undefined) return

    setCategories((prev) => {
      const newItems = [...prev]
      const dragItem = newItems[dragIndex]
      newItems.splice(dragIndex, 1)
      newItems.splice(hoverIndex, 0, dragItem)
      return newItems
    })
  }

  const onDropItem = () => {
    const sortOrder = categories
      .filter((rec) => !!rec.category)
      .map((category, idx) => ({
        id: category.category?.id || 0,
        sort_order: idx,
      }))
    updateCategorySort.mutate(sortOrder)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Category Order</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Category Order</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] w-[100%]" type="auto">
          {categories
            .filter((cat) => !!cat.category)
            .map((rec, idx) => (
              <Category
                key={rec.category?.category_id}
                moveItem={moveItem}
                onDropItem={onDropItem}
                category={rec}
                idx={idx + 1}
              />
            ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
