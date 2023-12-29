import { useMemo, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { Identifier, XYCoord } from 'dnd-core'
import { GripHorizontal } from 'lucide-react'
import { flexRender, Row } from '@tanstack/react-table'

import { TableCell, TableRow } from '@/components/ui/Table'

interface ItemRowProps<TData> {
  id: string
  idx: number
  row: Row<TData>
  disabled?: boolean
  moveItem: (dragIndex: number, hoverIndex: number) => void
  onDropItem: () => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export function ItemRow<TData>({
  id,
  idx,
  row,
  disabled,
  moveItem,
  onDropItem,
}: ItemRowProps<TData>) {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLTableRowElement>(null)
  const itemType = useMemo(() => `category-${id}`, [id])

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
      if (dragIndex === hoverIndex) {
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
      return { id: row.id, idx }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !disabled,
  })

  preview(drop(dropRef))
  drag(dragRef)

  return (
    <TableRow
      key={row.id}
      ref={dropRef}
      data-state={row.getIsSelected() && 'selected'}
    >
      <TableCell className="w-[5%] min-w-[40px]">
        <div
          ref={dragRef}
          className={`inline-block hover:cursor-grab ${
            disabled ? 'opacity-10' : ''
          }`}
          data-handler-id={handlerId}
        >
          <GripHorizontal size={18} />
        </div>
      </TableCell>
      {row.getVisibleCells().map(cell => (
        <TableCell
          key={cell.id}
          align={(cell.column.columnDef.meta as any)?.align}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
