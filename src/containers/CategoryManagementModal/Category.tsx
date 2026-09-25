import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { Identifier, XYCoord } from 'dnd-core'
import { GripVertical, MoreVertical } from 'lucide-react'

import { Input } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'
import { MyCategory } from '@/types/category'

interface Props {
  category: MyCategory
  idx: number
  moveItem: (dragIndex: number, hoverIndex: number) => void
  onDropped: () => void
  onRename: (category: MyCategory, name: string) => Promise<boolean>
  onMerge: (category: MyCategory) => void
  onDelete: (category: MyCategory) => void
  canMerge: boolean
}

interface DragItem {
  index: number
  id: number
  type: string
}

const ITEM_TYPE = 'category-sort'

function itemCountLabel(category: MyCategory) {
  const { item_count, archived_count } = category
  if (!item_count && !archived_count) return 'Empty'
  const parts = []
  if (item_count) parts.push(`${item_count} item${item_count === 1 ? '' : 's'}`)
  if (archived_count) parts.push(`${archived_count} archived`)
  return parts.join(' · ')
}

export const CategoryRow: FC<Props> = ({
  category,
  idx,
  moveItem,
  onDropped,
  onRename,
  onMerge,
  onDelete,
  canMerge,
}) => {
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(category.name)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(category.name)
  }, [category.name, editing])

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ITEM_TYPE,
    collect: monitor => ({ handlerId: monitor.getHandlerId() }),
    hover(item: DragItem, monitor) {
      if (!dropRef.current) return
      const dragIndex = item.index
      const hoverIndex = idx
      if (dragIndex === hoverIndex) return

      const rect = dropRef.current.getBoundingClientRect()
      const middleY = (rect.bottom - rect.top) / 2
      const clientY = (monitor.getClientOffset() as XYCoord).y - rect.top
      if (dragIndex < hoverIndex && clientY < middleY) return
      if (dragIndex > hoverIndex && clientY > middleY) return

      moveItem(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: category.id, index: idx }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    end: () => onDropped(),
  })

  preview(drop(dropRef))
  drag(dragRef)

  const commit = async () => {
    const name = draft.trim()
    if (!name || name === category.name) {
      setDraft(category.name)
      setEditing(false)
      return
    }
    setSaving(true)
    const ok = await onRename(category, name)
    setSaving(false)
    if (ok) {
      setEditing(false)
    } else {
      // Rename refused (e.g. the name is taken and a merge was offered):
      // put the old name back so the row reflects what is saved.
      setDraft(category.name)
      setEditing(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setDraft(category.name)
      setEditing(false)
    }
  }

  return (
    <div
      ref={dropRef}
      data-handler-id={handlerId}
      className={cn(
        'group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50',
        isDragging && 'opacity-40'
      )}
    >
      <div
        ref={dragRef}
        className="shrink-0 text-muted-foreground hover:cursor-grab"
        aria-label={`Drag to reorder ${category.name}`}
      >
        <GripVertical size={16} />
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={draft}
            maxLength={50}
            disabled={saving}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => void commit()}
            onKeyDown={onKeyDown}
            onFocus={e => e.currentTarget.select()}
            className="h-8 text-sm"
          />
        ) : (
          <button
            type="button"
            className="flex w-full min-w-0 items-baseline gap-2 text-left"
            onClick={() => setEditing(true)}
            title="Rename"
          >
            <span className="truncate text-sm">{category.name}</span>
            <span
              className={cn(
                'shrink-0 text-xs text-muted-foreground',
                !category.item_count && !category.archived_count && 'italic'
              )}
            >
              {itemCountLabel(category)}
            </span>
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="shrink-0 cursor-pointer px-1 text-muted-foreground hover:text-foreground"
            aria-label={`Actions for ${category.name}`}
          >
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          // Keep focus off the trigger so "Rename" can focus the input.
          onCloseAutoFocus={e => e.preventDefault()}
        >
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canMerge} onSelect={() => onMerge(category)}>
            Merge into…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onDelete(category)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
