import { FC, useRef } from 'react'
import type { Identifier, XYCoord } from 'dnd-core'
import { GripVertical } from 'lucide-react'
import { useDrag, useDrop } from 'react-dnd'

import { Input } from '@/components/ui'
import { CategoryItems } from '@/types/category'

interface Props {
  category: CategoryItems
  idx: number
  moveItem: (dragIndex: number | undefined, hoverIndex: number) => void
  editable?: boolean
  renamedValue?: string
  onNameChange: (categoryId: number, newName: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const ITEM_TYPE = 'category-sort'

export const CategoryRow: FC<Props> = ({
  category,
  idx,
  moveItem,
  editable = true,
  renamedValue,
  onNameChange,
}) => {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!dropRef.current) return

      const dragIndex = item.index
      const hoverIndex = idx

      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = dropRef.current.getBoundingClientRect()
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveItem(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{}, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({
      id: category.category?.category_id ?? 'uncategorized',
      idx,
      index: idx,
    }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  preview(drop(dropRef))
  drag(dragRef)

  const categoryName = category.category?.category.name || 'Uncategorized'
  const displayValue = renamedValue ?? categoryName

  return (
    <div ref={dropRef} data-handler-id={handlerId}>
      <div className="flex items-center gap-2 py-1">
        <div ref={dragRef} className="shrink-0 hover:cursor-grab">
          <GripVertical size={16} />
        </div>
        {editable ? (
          <Input
            value={displayValue}
            onChange={e =>
              onNameChange(category.category!.category.id, e.target.value)
            }
            className="h-8 text-sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">{categoryName}</span>
        )}
      </div>
    </div>
  )
}
