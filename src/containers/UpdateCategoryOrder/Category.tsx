import { FC, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { Identifier, XYCoord } from "dnd-core"
import { CategoryItems } from "@/types/category"
import { GripHorizontal } from "lucide-react"

interface Props {
  category: CategoryItems
  idx: number
  moveItem: (dragIndex: number | undefined, hoverIndex: number) => void
  onDropItem: () => void
  disabled?: boolean
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Category: FC<Props> = ({
  category,
  idx,
  moveItem,
  onDropItem,
  disabled,
}) => {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const itemType = "category-sort"

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: itemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!dropRef.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = idx

      // Don't replace items with themselves
      if (dragIndex === hoverIndex || disabled) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },

    drop: onDropItem,
  })

  const [{}, drag, preview] = useDrag({
    type: itemType,
    item: () => {
      return { id: category.category?.category_id, idx, index: idx }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !disabled,
  })

  preview(drop(dropRef))
  drag(dragRef)

  return (
    <div ref={dropRef}>
      <div className="flex items-center gap-2 p-2">
        <div
          ref={dragRef}
          data-handler-id={handlerId}
          className={`${!disabled ? "hover:cursor-grab" : "opacity-50"}`}
        >
          <GripHorizontal size={16} />
        </div>
        <span>{category.category?.category.name || "Uncategorized"}</span>
      </div>
    </div>
  )
}
